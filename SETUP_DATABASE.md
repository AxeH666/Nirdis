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
