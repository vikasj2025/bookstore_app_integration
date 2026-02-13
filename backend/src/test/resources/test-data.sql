-- Test data for unit and integration tests

-- Insert test build environments
INSERT INTO build_environments (environment_id, environment_name, status, health_status, created_at, last_modified)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Test Environment 1', 'ACTIVE', 'HEALTHY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 'Test Environment 2', 'INACTIVE', 'UNKNOWN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test environment variables
INSERT INTO environment_variables (environment_id, variable_name, variable_value)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'TEST_VAR_1', 'test_value_1'),
    ('11111111-1111-1111-1111-111111111111', 'TEST_VAR_2', 'test_value_2'),
    ('22222222-2222-2222-2222-222222222222', 'TEST_VAR_3', 'test_value_3');

-- Insert test installed tools
INSERT INTO installed_tools (tool_id, environment_id, tool_type, version, installation_path, is_default, status, installed_at)
VALUES 
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'JAVA', '17.0.9', '/opt/java/test', TRUE, 'ACTIVE', CURRENT_TIMESTAMP),
    ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'MAVEN', '3.9.6', '/opt/maven/test', TRUE, 'ACTIVE', CURRENT_TIMESTAMP),
    ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'NODEJS', '20.10.0', '/opt/nodejs/test', TRUE, 'ACTIVE', CURRENT_TIMESTAMP);

-- Insert test repository access
INSERT INTO repository_access (access_id, environment_id, repository_url, authentication_type, username, status, validation_status, configured_at)
VALUES 
    ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'https://github.com/test/repo1.git', 'TOKEN', 'testuser1', 'ACTIVE', 'SUCCESS', CURRENT_TIMESTAMP),
    ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'https://github.com/test/repo2.git', 'SSH_KEY', 'testuser2', 'CONFIGURED', NULL, CURRENT_TIMESTAMP);

-- Insert test configuration snapshots
INSERT INTO configuration_snapshots (snapshot_id, environment_id, name, description, created_by, is_stable, status, build_tools_count, created_at)
VALUES 
    ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Test Snapshot 1', 'Test snapshot description', 'testuser', TRUE, 'COMPLETED', 2, CURRENT_TIMESTAMP),
    ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'Test Snapshot 2', 'Another test snapshot', 'testuser', FALSE, 'COMPLETED', 1, CURRENT_TIMESTAMP);

-- Insert test snapshot tags
INSERT INTO snapshot_tags (snapshot_id, tag)
VALUES 
    ('88888888-8888-8888-8888-888888888888', 'test'),
    ('88888888-8888-8888-8888-888888888888', 'stable'),
    ('99999999-9999-9999-9999-999999999999', 'test');

-- Insert test configuration history
INSERT INTO configuration_history (change_id, environment_id, change_type, changed_by, summary, timestamp)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'CREATE', 'testuser', 'Test environment created', CURRENT_TIMESTAMP),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'UPDATE', 'testuser', 'Tools installed', CURRENT_TIMESTAMP),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'CREATE', 'testuser', 'Another test environment created', CURRENT_TIMESTAMP);

-- Insert test Maven wrapper downloads
INSERT INTO maven_wrapper_downloads (download_id, project_path, maven_version, status, progress, start_time, last_updated)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '/test/project1', '3.9.6', 'COMPLETED', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '/test/project2', '3.9.5', 'IN_PROGRESS', 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '/test/project3', '3.8.8', 'FAILED', 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert test downloaded files
INSERT INTO downloaded_files (download_id, file_path)
VALUES 
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '/test/project1/.mvn/wrapper/maven-wrapper.jar'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '/test/project1/.mvn/wrapper/maven-wrapper.properties');