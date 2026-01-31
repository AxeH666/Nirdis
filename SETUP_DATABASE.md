# PostgreSQL Database Setup

## Commands to Run

### Option 1: Using psql with postgres superuser (requires sudo)
```bash
sudo -u postgres psql -f setup-db.sql
```

### Option 2: Connect interactively and run SQL
```bash
sudo -u postgres psql
```
Then run:
```sql
CREATE USER nirdis_user WITH PASSWORD 'nirdis_dev_password';
CREATE DATABASE nirdis OWNER nirdis_user;
GRANT ALL PRIVILEGES ON DATABASE nirdis TO nirdis_user;
\q
```

### Option 3: If you have direct postgres user access
```bash
psql -U postgres -f setup-db.sql
```

### Option 4: One-liner commands
```bash
# Create user
sudo -u postgres psql -c "CREATE USER nirdis_user WITH PASSWORD 'nirdis_dev_password';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE nirdis OWNER nirdis_user;"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nirdis TO nirdis_user;"
```

## Verify Setup

After running the commands, verify the setup:
```bash
psql -U nirdis_user -d nirdis -h localhost
# Enter password: nirdis_dev_password
```

## Connection String

For your application, use:
```
postgresql://nirdis_user:nirdis_dev_password@localhost:5432/nirdis
```

## Auth.js Tables Migration

If you encounter "The table `public.Account` does not exist", run the Auth.js migration.

**Option 1: Using Prisma (requires shadow database)**
```bash
npx prisma migrate dev --name add_authjs_tables
```

**Option 2: Manual migration** (if your DB user lacks CREATEDB for shadow database)

Run the migration SQL with a user that has table ownership and schema permissions:

```bash
# As postgres superuser (or table owner)
psql -U postgres -d nirdis -f prisma/migrations/20250131000000_add_authjs_tables/migration.sql
```

**Option 3: Grant permissions** (fix "permission denied for table Account")

If you ran the Auth migration or `auth_tables.sql` as the postgres superuser, the app user `nirdis_user` needs explicit grants:

```bash
sudo -u postgres psql -d nirdis -f scripts/grant-auth-permissions.sql
```

Or run in psql as postgres:
```sql
GRANT USAGE ON SCHEMA public TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."Account" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."Session" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."VerificationToken" TO nirdis_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nirdis_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nirdis_user;
```

**Option 4: Change table ownership** (alternative to grants)

If tables are owned by postgres and you prefer ownership:
```sql
ALTER TABLE users OWNER TO nirdis_user;
ALTER TABLE guests OWNER TO nirdis_user;
ALTER TABLE usage_logs OWNER TO nirdis_user;
ALTER TABLE "Account" OWNER TO nirdis_user;
ALTER TABLE "Session" OWNER TO nirdis_user;
ALTER TABLE "VerificationToken" OWNER TO nirdis_user;
GRANT ALL ON SCHEMA public TO nirdis_user;
```
