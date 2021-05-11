-- revoke public access from public schema
REVOKE ALL PRIVILEGES ON SCHEMA public
FROM PUBLIC;
-- grant all priviledges to the user 'auth'
GRANT ALL PRIVILEGES ON SCHEMA public TO auth;
-- create this extension with superuser account
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";