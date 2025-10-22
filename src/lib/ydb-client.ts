import { Driver, IamAuthService, AnonymousAuthService, getSACredentialsFromJson } from 'ydb-sdk'

let driver: Driver | null = null

/**
 * Get or create YDB driver instance (singleton)
 */
export async function getYDBDriver(): Promise<Driver> {
  if (driver) {
    return driver
  }

  let endpoint = process.env.YDB_ENDPOINT
  const database = process.env.YDB_DATABASE

  if (!endpoint || !database) {
    throw new Error('YDB_ENDPOINT and YDB_DATABASE must be set in environment variables')
  }

  // Normalize endpoint - ensure it uses grpcs:// for secure connection
  if (!endpoint.startsWith('grpc://') && !endpoint.startsWith('grpcs://')) {
    endpoint = `grpcs://${endpoint}`
  }

  console.log(`Connecting to YDB: ${endpoint} / ${database}`)

  // Get credentials from service account key file or JSON string
  let authService

  if (process.env.YDB_SERVICE_ACCOUNT_KEY_FILE) {
    // For local development - use file path with helper function
    const iamCredentials = getSACredentialsFromJson(process.env.YDB_SERVICE_ACCOUNT_KEY_FILE)
    authService = new IamAuthService(iamCredentials)
  } else if (process.env.YDB_SERVICE_ACCOUNT_KEY_JSON) {
    // For Vercel deployment - parse JSON string and create credentials
    const saKey = JSON.parse(process.env.YDB_SERVICE_ACCOUNT_KEY_JSON)
    const iamCredentials = {
      serviceAccountId: saKey.service_account_id,
      accessKeyId: saKey.id,
      privateKey: Buffer.from(saKey.private_key),
      iamEndpoint: process.env.IAM_ENDPOINT || 'iam.api.cloud.yandex.net:443'
    }
    authService = new IamAuthService(iamCredentials)
  } else {
    // Anonymous auth (not recommended for production)
    console.warn('⚠️  No service account credentials found, using anonymous auth')
    authService = new AnonymousAuthService()
  }

  // Configure driver with SSL and connection pooling for serverless
  driver = new Driver({
    endpoint,
    database,
    authService,
    // SSL configuration for secure connection
    sslCredentials: {
      // Use system's root certificates
      rootCertificates: undefined,
    },
    // Optimize for serverless/Lambda environment
    poolSettings: {
      minLimit: 1,
      maxLimit: 5,
    },
  })

  const timeout = 15000 // Increased timeout for cold starts
  try {
    if (!(await driver.ready(timeout))) {
      throw new Error(`YDB driver has not become ready in ${timeout}ms`)
    }
  } catch (error) {
    console.error('Failed to initialize YDB driver:', error)
    // Clean up on failure
    if (driver) {
      await driver.destroy().catch(() => {})
      driver = null
    }
    throw error
  }

  console.log('YDB driver initialized successfully')
  return driver
}

/**
 * Execute YQL query with parameters
 */
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {
  const driver = await getYDBDriver()

  return driver.tableClient.withSession(async (session) => {
    const preparedQuery = await session.prepareQuery(query)
    const { resultSets } = await session.executeQuery(preparedQuery, params || {})

    if (!resultSets || resultSets.length === 0) {
      return []
    }

    return resultSets[0].rows as T[]
  })
}

/**
 * Execute YQL query without expecting results (INSERT, UPDATE, DELETE)
 */
export async function executeCommand(
  query: string,
  params?: Record<string, any>
): Promise<void> {
  const driver = await getYDBDriver()

  return driver.tableClient.withSession(async (session) => {
    const preparedQuery = await session.prepareQuery(query)
    await session.executeQuery(preparedQuery, params || {})
  })
}

/**
 * Retry wrapper for operations with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Operation failed after max retries')
}

/**
 * Close YDB driver connection
 */
export async function closeYDBDriver(): Promise<void> {
  if (driver) {
    await driver.destroy()
    driver = null
    console.log('YDB driver closed')
  }
}
