const fs = require('fs')
const path = require('path')

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

// Output the raw SQL
console.log(sql)
