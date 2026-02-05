-- Database initialization script for Docker
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone
SET timezone = 'UTC';

-- Create additional database user for read-only access (optional)
CREATE USER maven_bootstrap_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE maven_bootstrap TO maven_bootstrap_readonly;
GRANT USAGE ON SCHEMA public TO maven_bootstrap_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO maven_bootstrap_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO maven_bootstrap_readonly;

-- Performance tuning settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Log configuration
ALTER SYSTEM SET log_destination = 'stderr';
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = 'pg_log';
ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
ALTER SYSTEM SET log_rotation_age = '1d';
ALTER SYSTEM SET log_rotation_size = '100MB';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;
ALTER SYSTEM SET log_temp_files = 0;

-- Create a function to reload configuration
CREATE OR REPLACE FUNCTION reload_config()
RETURNS void AS $$
BEGIN
    PERFORM pg_reload_conf();
    RAISE NOTICE 'Configuration reloaded';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to main user
GRANT ALL PRIVILEGES ON DATABASE maven_bootstrap TO maven_bootstrap;
GRANT ALL PRIVILEGES ON SCHEMA public TO maven_bootstrap;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO maven_bootstrap;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO maven_bootstrap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO maven_bootstrap;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO maven_bootstrap;

-- Create indexes that will be useful before Flyway runs
-- (These will be recreated by Flyway migrations, but having them early helps)

-- Note: Actual table creation and indexes are handled by Flyway migrations
-- This script only sets up the database environment and permissions