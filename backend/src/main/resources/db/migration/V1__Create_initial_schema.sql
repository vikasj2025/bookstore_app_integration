-- Create initial schema for Maven Wrapper Bootstrap API

-- Bootstrap operations table
CREATE TABLE bootstrap_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_path VARCHAR(1000) NOT NULL,
    maven_version VARCHAR(50) NOT NULL,
    project_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'initiated',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_step VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completion_time TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    download_url VARCHAR(1000),
    error_message TEXT,
    custom_properties JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Bootstrap operation logs table
CREATE TABLE bootstrap_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bootstrap_id UUID NOT NULL REFERENCES bootstrap_operations(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Configuration templates table
CREATE TABLE configuration_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL,
    maven_version VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Project configurations table
CREATE TABLE project_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_path VARCHAR(1000) NOT NULL,
    project_type VARCHAR(50),
    detected_maven_version VARCHAR(50),
    recommended_configuration JSONB,
    submodules JSONB,
    detected_dependencies JSONB,
    scan_depth INTEGER DEFAULT 3,
    include_submodules BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Download records table
CREATE TABLE download_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    maven_version VARCHAR(50) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    download_url VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    checksum_sha256 VARCHAR(64),
    checksum_md5 VARCHAR(32),
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    verification_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Build monitoring table
CREATE TABLE build_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    maven_version VARCHAR(50),
    bootstrap_id UUID REFERENCES bootstrap_operations(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Build logs table
CREATE TABLE build_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID NOT NULL REFERENCES build_monitoring(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cache statistics table
CREATE TABLE cache_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_name VARCHAR(100) NOT NULL,
    hit_count BIGINT DEFAULT 0,
    miss_count BIGINT DEFAULT 0,
    eviction_count BIGINT DEFAULT 0,
    load_count BIGINT DEFAULT 0,
    total_load_time BIGINT DEFAULT 0, -- in nanoseconds
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API usage metrics table
CREATE TABLE api_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time BIGINT NOT NULL, -- in milliseconds
    request_size BIGINT,
    response_size BIGINT,
    user_agent VARCHAR(500),
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_bootstrap_operations_status ON bootstrap_operations(status);
CREATE INDEX idx_bootstrap_operations_created_at ON bootstrap_operations(created_at);
CREATE INDEX idx_bootstrap_operations_project_path ON bootstrap_operations(project_path);

CREATE INDEX idx_bootstrap_logs_bootstrap_id ON bootstrap_logs(bootstrap_id);
CREATE INDEX idx_bootstrap_logs_timestamp ON bootstrap_logs(timestamp);

CREATE INDEX idx_configuration_templates_project_type ON configuration_templates(project_type);
CREATE INDEX idx_configuration_templates_maven_version ON configuration_templates(maven_version);
CREATE INDEX idx_configuration_templates_active ON configuration_templates(is_active);

CREATE INDEX idx_project_configurations_project_path ON project_configurations(project_path);
CREATE INDEX idx_project_configurations_project_type ON project_configurations(project_type);

CREATE INDEX idx_download_records_maven_version ON download_records(maven_version);
CREATE INDEX idx_download_records_platform ON download_records(platform);
CREATE INDEX idx_download_records_file_name ON download_records(file_name);

CREATE INDEX idx_build_monitoring_project_id ON build_monitoring(project_id);
CREATE INDEX idx_build_monitoring_status ON build_monitoring(status);
CREATE INDEX idx_build_monitoring_start_time ON build_monitoring(start_time);

CREATE INDEX idx_build_logs_build_id ON build_logs(build_id);
CREATE INDEX idx_build_logs_timestamp ON build_logs(timestamp);

CREATE INDEX idx_cache_statistics_cache_name ON cache_statistics(cache_name);
CREATE INDEX idx_cache_statistics_last_updated ON cache_statistics(last_updated);

CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX idx_api_metrics_timestamp ON api_metrics(timestamp);
CREATE INDEX idx_api_metrics_status_code ON api_metrics(status_code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_bootstrap_operations_updated_at BEFORE UPDATE ON bootstrap_operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuration_templates_updated_at BEFORE UPDATE ON configuration_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_configurations_updated_at BEFORE UPDATE ON project_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_download_records_updated_at BEFORE UPDATE ON download_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_monitoring_updated_at BEFORE UPDATE ON build_monitoring FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();