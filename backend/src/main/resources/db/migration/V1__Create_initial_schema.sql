-- Create build_environments table
CREATE TABLE build_environments (
    environment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    docker_base_image VARCHAR(255),
    docker_registry_url VARCHAR(255),
    health_status VARCHAR(20) DEFAULT 'UNKNOWN',
    last_health_check TIMESTAMP,
    uptime_seconds BIGINT DEFAULT 0,
    CONSTRAINT chk_environment_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'CONFIGURING', 'ERROR', 'DELETED')),
    CONSTRAINT chk_health_status CHECK (health_status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN'))
);

-- Create environment_variables table
CREATE TABLE environment_variables (
    environment_id UUID NOT NULL,
    variable_name VARCHAR(255) NOT NULL,
    variable_value TEXT,
    PRIMARY KEY (environment_id, variable_name),
    FOREIGN KEY (environment_id) REFERENCES build_environments(environment_id) ON DELETE CASCADE
);

-- Create installed_tools table
CREATE TABLE installed_tools (
    tool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL,
    tool_type VARCHAR(20) NOT NULL,
    version VARCHAR(50) NOT NULL,
    installation_path VARCHAR(500),
    is_default BOOLEAN DEFAULT FALSE,
    installed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    configuration TEXT,
    FOREIGN KEY (environment_id) REFERENCES build_environments(environment_id) ON DELETE CASCADE,
    CONSTRAINT chk_tool_type CHECK (tool_type IN ('MAVEN', 'GRADLE', 'NPM', 'DOCKER', 'NODEJS', 'JAVA')),
    CONSTRAINT chk_tool_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    UNIQUE (environment_id, tool_type, version)
);

-- Create repository_access table
CREATE TABLE repository_access (
    access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL,
    repository_url VARCHAR(500) NOT NULL,
    authentication_type VARCHAR(20) NOT NULL,
    username VARCHAR(255),
    password_encrypted TEXT,
    token_encrypted TEXT,
    ssh_private_key_encrypted TEXT,
    ssh_passphrase_encrypted TEXT,
    access_level VARCHAR(10) DEFAULT 'read',
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIGURED',
    configured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_validated TIMESTAMP,
    validation_status VARCHAR(30),
    validation_message TEXT,
    response_time_ms INTEGER,
    FOREIGN KEY (environment_id) REFERENCES build_environments(environment_id) ON DELETE CASCADE,
    CONSTRAINT chk_auth_type CHECK (authentication_type IN ('TOKEN', 'SSH_KEY', 'USERNAME_PASSWORD')),
    CONSTRAINT chk_access_level CHECK (access_level IN ('read', 'write', 'admin')),
    CONSTRAINT chk_access_status CHECK (status IN ('CONFIGURED', 'VALIDATING', 'ACTIVE', 'ERROR')),
    CONSTRAINT chk_validation_status CHECK (validation_status IN ('SUCCESS', 'AUTHENTICATION_FAILED', 'AUTHORIZATION_FAILED', 'NETWORK_ERROR', 'REPOSITORY_NOT_FOUND')),
    UNIQUE (environment_id, repository_url)
);

-- Create configuration_snapshots table
CREATE TABLE configuration_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    is_stable BOOLEAN DEFAULT FALSE,
    configuration_data TEXT,
    status VARCHAR(20) DEFAULT 'CREATING',
    build_tools_count INTEGER DEFAULT 0,
    environment_variables_count INTEGER DEFAULT 0,
    repository_access_count INTEGER DEFAULT 0,
    has_docker_config BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (environment_id) REFERENCES build_environments(environment_id) ON DELETE CASCADE,
    CONSTRAINT chk_snapshot_status CHECK (status IN ('CREATING', 'COMPLETED', 'FAILED')),
    UNIQUE (environment_id, name)
);

-- Create snapshot_tags table
CREATE TABLE snapshot_tags (
    snapshot_id UUID NOT NULL,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (snapshot_id, tag),
    FOREIGN KEY (snapshot_id) REFERENCES configuration_snapshots(snapshot_id) ON DELETE CASCADE
);

-- Create configuration_history table
CREATE TABLE configuration_history (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL,
    change_type VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    details TEXT,
    FOREIGN KEY (environment_id) REFERENCES build_environments(environment_id) ON DELETE CASCADE,
    CONSTRAINT chk_change_type CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE', 'ROLLBACK'))
);

-- Create maven_wrapper_downloads table
CREATE TABLE maven_wrapper_downloads (
    download_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_path VARCHAR(500) NOT NULL,
    maven_version VARCHAR(50) NOT NULL,
    repository_url VARCHAR(500),
    force_download BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    progress INTEGER DEFAULT 0,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completion_time TIMESTAMP,
    estimated_completion_time TIMESTAMP,
    error_message TEXT,
    CONSTRAINT chk_download_status CHECK (status IN ('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    CONSTRAINT chk_progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Create downloaded_files table
CREATE TABLE downloaded_files (
    download_id UUID NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    PRIMARY KEY (download_id, file_path),
    FOREIGN KEY (download_id) REFERENCES maven_wrapper_downloads(download_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_build_environments_status ON build_environments(status);
CREATE INDEX idx_build_environments_health_status ON build_environments(health_status);
CREATE INDEX idx_build_environments_created_at ON build_environments(created_at);
CREATE INDEX idx_build_environments_last_health_check ON build_environments(last_health_check);

CREATE INDEX idx_installed_tools_environment_id ON installed_tools(environment_id);
CREATE INDEX idx_installed_tools_type ON installed_tools(tool_type);
CREATE INDEX idx_installed_tools_status ON installed_tools(status);
CREATE INDEX idx_installed_tools_is_default ON installed_tools(is_default) WHERE is_default = TRUE;

CREATE INDEX idx_repository_access_environment_id ON repository_access(environment_id);
CREATE INDEX idx_repository_access_status ON repository_access(status);
CREATE INDEX idx_repository_access_validation_status ON repository_access(validation_status);
CREATE INDEX idx_repository_access_last_validated ON repository_access(last_validated);

CREATE INDEX idx_configuration_snapshots_environment_id ON configuration_snapshots(environment_id);
CREATE INDEX idx_configuration_snapshots_created_at ON configuration_snapshots(created_at);
CREATE INDEX idx_configuration_snapshots_is_stable ON configuration_snapshots(is_stable) WHERE is_stable = TRUE;
CREATE INDEX idx_configuration_snapshots_status ON configuration_snapshots(status);

CREATE INDEX idx_configuration_history_environment_id ON configuration_history(environment_id);
CREATE INDEX idx_configuration_history_timestamp ON configuration_history(timestamp);
CREATE INDEX idx_configuration_history_change_type ON configuration_history(change_type);

CREATE INDEX idx_maven_wrapper_downloads_status ON maven_wrapper_downloads(status);
CREATE INDEX idx_maven_wrapper_downloads_project_path ON maven_wrapper_downloads(project_path);
CREATE INDEX idx_maven_wrapper_downloads_start_time ON maven_wrapper_downloads(start_time);

-- Create trigger to update last_modified timestamp
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_build_environments_last_modified
    BEFORE UPDATE ON build_environments
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_column();

CREATE TRIGGER update_maven_wrapper_downloads_last_updated
    BEFORE UPDATE ON maven_wrapper_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified_column();