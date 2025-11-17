const fs = require('fs')
const path = require('path')

// Read the migration file
const migrationPath = path.join(__dirname, '../src/migrations/20251117_015639.ts')
const content = fs.readFileSync(migrationPath, 'utf-8')

// Extract the SQL content between the backticks
const upMatch = content.match(/export async function up\(\{[^}]+\}[^{]+{[\s\S]+?await db\.execute\(sql`([\s\S]+?)`\)/m)
const downMatch = content.match(/export async function down\(\{[^}]+\}[^{]+{[\s\S]+?await db\.execute\(sql`([\s\S]+?)`\)/m)

if (!upMatch || !downMatch) {
  console.error('Could not find SQL blocks in migration file')
  process.exit(1)
}

const upSQL = upMatch[1].trim()
const downSQL = downMatch[1].trim()

console.log('Parsed migration file')
console.log(`UP SQL: ${upSQL.split('\n').length} lines`)
console.log(`DOWN SQL: ${downSQL.split('\n').length} lines`)

// Split the UP SQL into logical batches
function splitSQL(sql) {
  const lines = sql.split('\n').map(line => line.trim()).filter(line => line)

  const batches = []
  let currentBatch = []
  let currentType = null

  for (const line of lines) {
    // Detect statement type
    let type = null
    if (line.startsWith('CREATE TYPE')) {
      type = 'CREATE_TYPE'
    } else if (line.startsWith('CREATE TABLE')) {
      type = 'CREATE_TABLE'
    } else if (line.startsWith('CREATE INDEX') || line.startsWith('CREATE UNIQUE INDEX')) {
      type = 'CREATE_INDEX'
    } else if (line.startsWith('ALTER TABLE')) {
      type = 'ALTER_TABLE'
    } else if (line.startsWith('DO $')) {
      type = 'DO_BLOCK'
    }

    // If we're starting a new type or current batch is large enough
    if (type && type !== currentType) {
      // Save current batch if it exists
      if (currentBatch.length > 0) {
        batches.push({
          type: currentType,
          sql: currentBatch.join('\n')
        })
        currentBatch = []
      }
      currentType = type
    }

    currentBatch.push(line)

    // For CREATE_TABLE, batch every 1 table to stay within query size limits
    if (currentType === 'CREATE_TABLE' && line.endsWith(');')) {
      batches.push({
        type: currentType,
        sql: currentBatch.join('\n')
      })
      currentBatch = []
      currentType = null
    }
  }

  // Push remaining batch
  if (currentBatch.length > 0) {
    batches.push({
      type: currentType || 'MISC',
      sql: currentBatch.join('\n')
    })
  }

  return batches
}

const upBatches = splitSQL(upSQL)
const downBatches = splitSQL(downSQL)

console.log(`\nSplit UP SQL into ${upBatches.length} batches:`)
upBatches.forEach((batch, i) => {
  console.log(`  Batch ${i + 1} (${batch.type}): ${batch.sql.split('\n').length} lines`)
})

console.log(`\nSplit DOWN SQL into ${downBatches.length} batches:`)
downBatches.forEach((batch, i) => {
  console.log(`  Batch ${i + 1} (${batch.type}): ${batch.sql.split('\n').length} lines`)
})

// Generate new migration file
const newContent = `import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
${upBatches.map((batch, i) => `  // Batch ${i + 1}: ${batch.type}
  await db.execute(sql\`
${batch.sql}
  \`)`).join('\n\n')}
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
${downBatches.map((batch, i) => `  // Batch ${i + 1}: ${batch.type}
  await db.execute(sql\`
${batch.sql}
  \`)`).join('\n\n')}
}
`

// Write the new migration file
fs.writeFileSync(migrationPath, newContent, 'utf-8')

console.log('\n✅ Migration file has been rewritten with batched SQL statements')
console.log(`📄 ${migrationPath}`)
