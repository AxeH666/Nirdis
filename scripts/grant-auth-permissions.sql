-- Grant nirdis_user access to Auth.js tables (run as postgres)
-- Use when you see "permission denied for table Account"
-- From project root: sudo -u postgres psql -d nirdis -f scripts/grant-auth-permissions.sql

GRANT USAGE ON SCHEMA public TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."Account" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."Session" TO nirdis_user;
GRANT ALL PRIVILEGES ON TABLE public."VerificationToken" TO nirdis_user;
-- Ensure app user can access all public tables (in case any were created as postgres)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nirdis_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nirdis_user;
