-- Insert sample build environments
INSERT INTO build_environments (environment_id, environment_name, status, health_status, uptime_seconds)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Development Environment', 'ACTIVE', 'HEALTHY', 86400),
    ('550e8400-e29b-41d4-a716-446655440002', 'Staging Environment', 'ACTIVE', 'HEALTHY', 172800),
    ('550e8400-e29b-41d4-a716-446655440003', 'Production Environment', 'ACTIVE', 'HEALTHY', 604800);

-- Insert sample environment variables
INSERT INTO environment_variables (environment_id, variable_name, variable_value)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'JAVA_HOME', '/opt/java/openjdk-17'),
    ('550e8400-e29b-41d4-a716-446655440001', 'MAVEN_HOME', '/opt/maven'),
    ('550e8400-e29b-41d4-a716-446655440001', 'NODE_ENV', 'development'),
    ('550e8400-e29b-41d4-a716-446655440002', 'JAVA_HOME', '/opt/java/openjdk-17'),
    ('550e8400-e29b-41d4-a716-446655440002', 'MAVEN_HOME', '/opt/maven'),
    ('550e8400-e29b-41d4-a716-446655440002', 'NODE_ENV', 'staging'),
    ('550e8400-e29b-41d4-a716-446655440003', 'JAVA_HOME', '/opt/java/openjdk-17'),
    ('550e8400-e29b-41d4-a716-446655440003', 'MAVEN_HOME', '/opt/maven'),
    ('550e8400-e29b-41d4-a716-446655440003', 'NODE_ENV', 'production');

-- Insert sample installed tools
INSERT INTO installed_tools (tool_id, environment_id, tool_type, version, installation_path, is_default, status)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'JAVA', '17.0.9', '/opt/java/openjdk-17', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'MAVEN', '3.9.6', '/opt/maven', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'NODEJS', '20.10.0', '/opt/nodejs', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'JAVA', '17.0.9', '/opt/java/openjdk-17', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'MAVEN', '3.9.6', '/opt/maven', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'JAVA', '17.0.9', '/opt/java/openjdk-17', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'MAVEN', '3.9.6', '/opt/maven', TRUE, 'ACTIVE'),
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'DOCKER', '24.0.7', '/usr/bin/docker', TRUE, 'ACTIVE');

-- Insert sample repository access configurations
INSERT INTO repository_access (access_id, environment_id, repository_url, authentication_type, username, status, validation_status)
VALUES 
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'https://github.com/company/project1.git', 'TOKEN', 'developer1', 'ACTIVE', 'SUCCESS'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'https://github.com/company/project1.git', 'TOKEN', 'staging-user', 'ACTIVE', 'SUCCESS'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'https://github.com/company/project1.git', 'SSH_KEY', 'prod-user', 'ACTIVE', 'SUCCESS');

-- Insert sample configuration snapshots
INSERT INTO configuration_snapshots (snapshot_id, environment_id, name, description, created_by, is_stable, status, build_tools_count, environment_variables_count, repository_access_count)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Initial Setup', 'Initial development environment configuration', 'admin', TRUE, 'COMPLETED', 3, 3, 1),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Staging Baseline', 'Baseline staging environment configuration', 'admin', TRUE, 'COMPLETED', 2, 3, 1),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Production v1.0', 'Production environment v1.0 configuration', 'admin', TRUE, 'COMPLETED', 3, 3, 1);

-- Insert sample snapshot tags
INSERT INTO snapshot_tags (snapshot_id, tag)
VALUES 
    ('880e8400-e29b-41d4-a716-446655440001', 'initial'),
    ('880e8400-e29b-41d4-a716-446655440001', 'development'),
    ('880e8400-e29b-41d4-a716-446655440002', 'baseline'),
    ('880e8400-e29b-41d4-a716-446655440002', 'staging'),
    ('880e8400-e29b-41d4-a716-446655440003', 'v1.0'),
    ('880e8400-e29b-41d4-a716-446655440003', 'production'),
    ('880e8400-e29b-41d4-a716-446655440003', 'stable');

-- Insert sample configuration history
INSERT INTO configuration_history (change_id, environment_id, change_type, changed_by, summary)
VALUES 
    ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'admin', 'Development environment created'),
    ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'admin', 'Java 17 and Maven 3.9.6 installed'),
    ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'admin', 'Node.js 20.10.0 installed'),
    ('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'CREATE', 'admin', 'Staging environment created'),
    ('990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'CREATE', 'admin', 'Production environment created');

-- Insert sample Maven wrapper downloads
INSERT INTO maven_wrapper_downloads (download_id, project_path, maven_version, status, progress, completion_time)
VALUES 
    ('aa0e8400-e29b-41d4-a716-446655440001', '/projects/sample-app', '3.9.6', 'COMPLETED', 100, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '/projects/web-service', '3.9.5', 'COMPLETED', 100, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('aa0e8400-e29b-41d4-a716-446655440003', '/projects/microservice', '3.9.6', 'IN_PROGRESS', 75, NULL);

-- Insert sample downloaded files
INSERT INTO downloaded_files (download_id, file_path)
VALUES 
    ('aa0e8400-e29b-41d4-a716-446655440001', '/projects/sample-app/.mvn/wrapper/maven-wrapper.jar'),
    ('aa0e8400-e29b-41d4-a716-446655440001', '/projects/sample-app/.mvn/wrapper/maven-wrapper.properties'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '/projects/web-service/.mvn/wrapper/maven-wrapper.jar'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '/projects/web-service/.mvn/wrapper/maven-wrapper.properties');