const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  // Read the migration file
  const migrationPath = path.join(__dirname, '../src/migrations/20251117_022505.ts')
  const content = fs.readFileSync(migrationPath, 'utf-8')

  // Extract SQL from the up() function
  const upMatch = content.match(/export async function up\([^)]+\)[^{]+{[\s\S]+?await db\.execute\(sql`([\s\S]+?)`\s*\)/m)

  if (!upMatch) {
    console.error('Could not extract SQL from migration file')
    process.exit(1)
  }

  const sql = upMatch[1].trim()
  const statements = []

  // Split SQL into individual statements
  const lines = sql.split('\n').map(l => l.trim()).filter(l => l)
  let currentStatement = []

  for (const line of lines) {
    currentStatement.push(line)

    // End of statement when we see );
    if (line.endsWith(');')) {
      statements.push(currentStatement.join('\n'))
      currentStatement = []
    }
  }

  console.log(`Found ${statements.length} SQL statements to execute`)

  // Connect to database
  const client = new Client({
    connectionString: process.env.DATABASE_URI || 'postgresql://postgres:postgres@localhost:5432/mhportal_cms_v3'
  })

  await client.connect()
  console.log('Connected to database')

  // Execute statements one by one
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      await client.query(stmt)
      successCount++
      if ((i + 1) % 50 === 0) {
        console.log(`Progress: ${i + 1}/${statements.length} statements executed`)
      }
    } catch (error) {
      failCount++
      console.error(`\nError executing statement ${i + 1}:`)
      console.error(stmt.substring(0, 100) + '...')
      console.error(error.message)
      // Continue with other statements
    }
  }

  await client.end()

  console.log(`\n✅ Migration complete!`)
  console.log(`   Success: ${successCount} statements`)
  console.log(`   Failed: ${failCount} statements`)

  if (failCount > 0) {
    process.exit(1)
  }
}

runMigration().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
