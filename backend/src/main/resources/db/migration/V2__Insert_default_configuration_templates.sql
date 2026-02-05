-- Insert default configuration templates for different project types

-- Spring Boot template
INSERT INTO configuration_templates (id, name, description, project_type, maven_version, configuration, created_by) VALUES (
    gen_random_uuid(),
    'Spring Boot Default',
    'Default configuration template for Spring Boot projects',
    'spring-boot',
    '3.9.5',
    '{
        "mavenVersion": "3.9.5",
        "javaVersion": "17",
        "properties": {
            "maven.compiler.source": "17",
            "maven.compiler.target": "17",
            "project.build.sourceEncoding": "UTF-8",
            "spring-boot.version": "3.2.0"
        },
        "repositories": [
            {
                "id": "central",
                "url": "https://repo.maven.apache.org/maven2",
                "name": "Maven Central"
            },
            {
                "id": "spring-releases",
                "url": "https://repo.spring.io/release",
                "name": "Spring Releases"
            }
        ]
    }',
    'system'
);

-- Web Application template
INSERT INTO configuration_templates (id, name, description, project_type, maven_version, configuration, created_by) VALUES (
    gen_random_uuid(),
    'Web Application Default',
    'Default configuration template for web applications',
    'web-app',
    '3.9.5',
    '{
        "mavenVersion": "3.9.5",
        "javaVersion": "17",
        "properties": {
            "maven.compiler.source": "17",
            "maven.compiler.target": "17",
            "project.build.sourceEncoding": "UTF-8",
            "failOnMissingWebXml": "false"
        },
        "repositories": [
            {
                "id": "central",
                "url": "https://repo.maven.apache.org/maven2",
                "name": "Maven Central"
            }
        ]
    }',
    'system'
);

-- Library template
INSERT INTO configuration_templates (id, name, description, project_type, maven_version, configuration, created_by) VALUES (
    gen_random_uuid(),
    'Library Default',
    'Default configuration template for library projects',
    'library',
    '3.9.5',
    '{
        "mavenVersion": "3.9.5",
        "javaVersion": "17",
        "properties": {
            "maven.compiler.source": "17",
            "maven.compiler.target": "17",
            "project.build.sourceEncoding": "UTF-8",
            "maven.javadoc.skip": "false",
            "maven.source.skip": "false"
        },
        "repositories": [
            {
                "id": "central",
                "url": "https://repo.maven.apache.org/maven2",
                "name": "Maven Central"
            }
        ]
    }',
    'system'
);

-- Microservice template
INSERT INTO configuration_templates (id, name, description, project_type, maven_version, configuration, created_by) VALUES (
    gen_random_uuid(),
    'Microservice Default',
    'Default configuration template for microservice projects',
    'microservice',
    '3.9.5',
    '{
        "mavenVersion": "3.9.5",
        "javaVersion": "17",
        "properties": {
            "maven.compiler.source": "17",
            "maven.compiler.target": "17",
            "project.build.sourceEncoding": "UTF-8",
            "spring-boot.version": "3.2.0",
            "spring-cloud.version": "2023.0.0"
        },
        "repositories": [
            {
                "id": "central",
                "url": "https://repo.maven.apache.org/maven2",
                "name": "Maven Central"
            },
            {
                "id": "spring-releases",
                "url": "https://repo.spring.io/release",
                "name": "Spring Releases"
            },
            {
                "id": "spring-milestones",
                "url": "https://repo.spring.io/milestone",
                "name": "Spring Milestones"
            }
        ]
    }',
    'system'
);

-- Initialize cache statistics for common cache names
INSERT INTO cache_statistics (cache_name, hit_count, miss_count, eviction_count, load_count, total_load_time) VALUES
('bootstrap-operations', 0, 0, 0, 0, 0),
('configuration-templates', 0, 0, 0, 0, 0),
('download-records', 0, 0, 0, 0, 0),
('maven-versions', 0, 0, 0, 0, 0),
('project-configurations', 0, 0, 0, 0, 0);