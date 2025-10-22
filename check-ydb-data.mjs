#!/usr/bin/env node

import pkg from 'ydb-sdk'
const { Driver, getSACredentialsFromJson, IamAuthService } = pkg
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkYDBData() {
  console.log('🔍 Checking YDB data...\n')

  const endpoint = process.env.YDB_ENDPOINT
  const database = process.env.YDB_DATABASE
  const serviceAccountKeyFile = process.env.YDB_SERVICE_ACCOUNT_KEY_FILE

  console.log('Config:')
  console.log('  Endpoint:', endpoint)
  console.log('  Database:', database)
  console.log('  Key file:', serviceAccountKeyFile)
  console.log('')

  try {
    const iamCredentials = getSACredentialsFromJson(serviceAccountKeyFile)
    const authService = new IamAuthService(iamCredentials)

    const driver = new Driver({ endpoint, database, authService })
    const timeout = 10000
    if (!(await driver.ready(timeout))) {
      throw new Error(`Driver has not become ready in ${timeout}ms!`)
    }

    console.log('✅ Connected to YDB\n')

    // Query all bets
    await driver.tableClient.withSession(async (session) => {
      const query = `SELECT * FROM tracked_bets ORDER BY trackedAt DESC LIMIT 10;`

      const { resultSets } = await session.executeQuery(query)

      if (resultSets && resultSets[0] && resultSets[0].rows.length > 0) {
        console.log(`📊 Found ${resultSets[0].rows.length} bets:\n`)

        console.log('Raw data sample:')
        console.log(JSON.stringify(resultSets[0].rows[0], null, 2))
        console.log('\n✅ Ставки успешно сохраняются в БД!')
        console.log(`   Всего ставок: ${resultSets[0].rows.length}`)
      } else {
        console.log('❌ No bets found in database')
      }
    })

    await driver.destroy()
    console.log('✅ Test completed')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkYDBData()
