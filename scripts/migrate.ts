/**
 * YDB Migration Script
 *
 * Usage:
 *   npm run migrate        # Run migrations
 *   npm run migrate:rollback   # Rollback migrations
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { runMigrations, rollbackMigrations } from '../src/lib/ydb-migrations'
import { closeYDBDriver } from '../src/lib/ydb-client'

async function main() {
  const command = process.argv[2] || 'up'

  try {
    if (command === 'up') {
      console.log('🚀 Running migrations...\n')
      await runMigrations()
    } else if (command === 'down') {
      console.log('⚠️  Rolling back migrations...\n')
      await rollbackMigrations()
    } else {
      console.error('❌ Unknown command:', command)
      console.log('Usage: npm run migrate [up|down]')
      process.exit(1)
    }

    console.log('\n✅ Done!')
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  } finally {
    await closeYDBDriver()
  }
}

main()
