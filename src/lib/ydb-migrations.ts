import { getYDBDriver } from './ydb-client'
import { TableDescription, Column, Types } from 'ydb-sdk'

/**
 * Create tracked_bets table
 */
export async function createTrackedBetsTable(): Promise<void> {
  const driver = await getYDBDriver()

  const tableDescription = new TableDescription()
    .withColumn(new Column('id', Types.optional(Types.UTF8)))
    .withColumn(new Column('userId', Types.optional(Types.UTF8)))
    .withColumn(new Column('matchId', Types.optional(Types.UTF8)))
    .withColumn(new Column('betType', Types.optional(Types.UTF8)))
    .withColumn(new Column('betOutcome', Types.optional(Types.UTF8)))
    .withColumn(new Column('bookmaker', Types.optional(Types.UTF8)))
    .withColumn(new Column('odds', Types.optional(Types.DOUBLE)))
    .withColumn(new Column('mlCoefficient', Types.optional(Types.DOUBLE)))
    .withColumn(new Column('profitabilityLevel', Types.optional(Types.UTF8)))
    .withColumn(new Column('status', Types.optional(Types.UTF8)))
    .withColumn(new Column('trackedAt', Types.optional(Types.TIMESTAMP)))
    .withColumn(new Column('resultUpdatedAt', Types.optional(Types.TIMESTAMP)))
    .withColumn(new Column('uniqueKey', Types.optional(Types.UTF8)))
    .withColumn(new Column('homeTeam', Types.optional(Types.UTF8)))
    .withColumn(new Column('awayTeam', Types.optional(Types.UTF8)))
    .withColumn(new Column('league', Types.optional(Types.UTF8)))
    .withColumn(new Column('matchDate', Types.optional(Types.UTF8)))
    .withPrimaryKey('id')

  await driver.tableClient.withSession(async (session) => {
    await session.createTable('tracked_bets', tableDescription)
  })

  console.log('✅ Table "tracked_bets" created successfully')
}

/**
 * Drop tracked_bets table (for testing/rollback)
 */
export async function dropTrackedBetsTable(): Promise<void> {
  const driver = await getYDBDriver()

  await driver.tableClient.withSession(async (session) => {
    await session.dropTable('tracked_bets')
  })

  console.log('✅ Table "tracked_bets" dropped successfully')
}

/**
 * Check if table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  const driver = await getYDBDriver()

  try {
    await driver.tableClient.withSession(async (session) => {
      const query = `SELECT * FROM ${tableName} LIMIT 1`
      await session.executeQuery(query)
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * Run all migrations
 */
export async function runMigrations(): Promise<void> {
  console.log('🔄 Running YDB migrations...')

  try {
    const exists = await tableExists('tracked_bets')

    if (!exists) {
      console.log('📊 Creating tracked_bets table...')
      await createTrackedBetsTable()
    } else {
      console.log('✅ Table "tracked_bets" already exists')
    }

    console.log('✅ All migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Rollback all migrations (drops all tables)
 */
export async function rollbackMigrations(): Promise<void> {
  console.log('🔄 Rolling back YDB migrations...')

  try {
    const exists = await tableExists('tracked_bets')

    if (exists) {
      console.log('🗑️  Dropping tracked_bets table...')
      await dropTrackedBetsTable()
    }

    console.log('✅ Rollback completed successfully')
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}
