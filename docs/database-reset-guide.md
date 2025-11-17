# Database Reset and Schema Recreation Guide

This guide explains how to completely drop all database tables and recreate the schema from scratch using direct PostgreSQL commands. This approach bypasses Payload's migration system and is useful for specific scenarios.

## When to Use This Approach

✅ **Use this method when:**
- You need to completely reset your local development database
- Payload's migration system fails with large schema files
- You're recovering from a corrupted database state
- You want a clean slate for testing

❌ **Don't use this for:**
- Normal development workflow (use `pnpm payload migrate` instead)
- Production databases
- Incremental schema changes (use Payload migrations)
- Team collaboration (others won't have migration history)

## Prerequisites

- Docker Compose running with PostgreSQL container
- Database backup if you need to preserve data
- Migration file exists at `src/migrations/[timestamp].ts`

## Step-by-Step Instructions

### 1. Drop All Tables

Drop the entire public schema and recreate it:

```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**What this does:**
- Drops all tables, types, indexes, and constraints
- Recreates an empty public schema
- ⚠️ **Warning**: This is irreversible - all data will be lost

### 2. Verify Database is Empty

```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

Expected output: `0 rows`

### 3. Extract SQL from Migration File

```bash
node scripts/extract-sql.cjs > /tmp/migration.sql
```

**What this does:**
- Reads the latest migration TypeScript file
- Extracts raw SQL from the `up()` function
- Saves it to a temporary file

**Check the file:**
```bash
wc -l /tmp/migration.sql  # Should show ~2000+ lines
```

### 4. Execute SQL via psql

```bash
cat /tmp/migration.sql | docker compose exec -T postgres psql -U postgres -d mhportal_cms_v3
```

**What this does:**
- Pipes SQL directly to PostgreSQL's native client
- psql automatically splits statements by semicolons
- Executes each CREATE TYPE, CREATE TABLE, CREATE INDEX individually
- Bypasses Node.js driver query size limits

**Expected output:**
```
CREATE TYPE
CREATE TYPE
...
CREATE TABLE
CREATE TABLE
...
CREATE INDEX
CREATE INDEX
...
```

### 5. Verify Schema Creation

**Count total tables:**
```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "SELECT COUNT(*) as table_count FROM pg_tables WHERE schemaname = 'public';"
```

Expected: `102 tables`

**Check key tables exist:**
```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'media', 'categories', 'tags', 'payload_migrations') ORDER BY tablename;"
```

Expected output:
```
     tablename
--------------------
 categories
 media
 payload_migrations
 tags
 users
```

### 6. Update Migration Tracking (Optional)

If you want Payload to recognize this migration as completed:

```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "INSERT INTO payload_migrations (name, batch) VALUES ('20251117_022505', 1);"
```

Replace `20251117_022505` with your actual migration filename.

## Why This Works

**The Problem:**
- Payload's migration runner uses Node.js PostgreSQL driver
- Large migration files (2000+ lines) sent as ONE query
- Hits PostgreSQL query buffer limits

**The Solution:**
- `psql` is PostgreSQL's native client
- Automatically splits SQL by semicolons (`;`)
- Executes each statement individually
- No memory/buffer constraints
- Optimized for large SQL scripts

## Helper Scripts

The `scripts/` directory contains useful utilities:

### extract-sql.cjs
Extracts raw SQL from TypeScript migration files
```bash
node scripts/extract-sql.cjs > output.sql
```

### split-migration.cjs
Attempts to split large migrations into smaller batches (experimental)
```bash
node scripts/split-migration.cjs
```

## Normal Development Workflow

After this one-time reset, return to normal Payload migrations:

```bash
# Make changes to your Payload config
# Then create and run migrations:
pnpm payload migrate:create
pnpm payload migrate
```

## Troubleshooting

**Error: "relation does not exist"**
- Tables weren't created - check SQL extraction succeeded
- Verify migration file exists and has SQL content

**Error: "permission denied"**
- Ensure PostgreSQL user has schema creation rights
- Check Docker container is running

**Tables created but count is wrong**
- Migration file may be outdated
- Regenerate migration: `pnpm payload migrate:create`
- Extract and run again

**Payload doesn't recognize the schema**
- Insert migration record manually (see step 6)
- Or run `pnpm payload migrate` to record it

## Production Warning

⚠️ **NEVER use this approach in production!**

For production:
1. Always use Payload's migration system
2. Test migrations in staging first
3. Take database backups before migrations
4. Use `pnpm payload migrate` in CI/CD pipelines
5. Never bypass migration tracking

## Additional Commands

**List all tables:**
```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

**Check migration history:**
```bash
docker compose exec postgres psql -U postgres -d mhportal_cms_v3 -c "SELECT * FROM payload_migrations ORDER BY id;"
```

**Export database schema:**
```bash
docker compose exec postgres pg_dump -U postgres -d mhportal_cms_v3 --schema-only > schema-backup.sql
```

## Recovery

If something goes wrong:

1. **Restore from backup:**
   ```bash
   cat schema-backup.sql | docker compose exec -T postgres psql -U postgres -d mhportal_cms_v3
   ```

2. **Start fresh:**
   - Follow this guide from step 1
   - Recreate first user at `/admin/create-first-user`

3. **Contact team:**
   - If in production, coordinate with team
   - Never drop production data without approval

---

**Last Updated:** 2025-11-17
**Database:** PostgreSQL 18.1
**Payload Version:** 3.64.0
