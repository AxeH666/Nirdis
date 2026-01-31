-- Create PostgreSQL user with password
CREATE USER nirdis_user WITH PASSWORD 'nirdis_dev_password';

-- Create database with nirdis_user as owner
CREATE DATABASE nirdis OWNER nirdis_user;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE nirdis TO nirdis_user;
