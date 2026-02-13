# Automated Build Environment Setup and Configuration API

A Spring Boot application that provides APIs for automated build tool detection, provisioning, configuration, and management with secure repository access and rollback capabilities.

## Features

- **Maven Wrapper Auto-Download**: Automatically downloads and configures Maven Wrapper for projects
- **Build Environment Configuration**: Automated setup and management of build environments
- **Secure Repository Access**: Configuration and validation of repository credentials
- **Build Tool Management**: Version management and installation of build tools (Maven, Gradle, Node.js, Java, Docker)
- **Health Monitoring**: Comprehensive health checks for build environments
- **Configuration Rollback**: Snapshot creation and rollback mechanisms
- **JWT Authentication**: Secure API access with JWT tokens
- **Caching**: Redis-based caching for improved performance
- **Monitoring**: Prometheus metrics and Grafana dashboards

## Technology Stack

- **Language**: Java 17
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Build Tool**: Maven 3.9.6
- **Containerization**: Docker
- **Monitoring**: Prometheus + Grafana
- **Documentation**: OpenAPI 3.0.3 (Swagger)

## Prerequisites

- Java 17 or higher
- Maven 3.8+ or Docker
- PostgreSQL 15+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

4. **Access the application**:
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - Health Check: http://localhost:8080/actuator/health
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin123)

### Manual Setup

1. **Setup PostgreSQL**:
   ```sql
   CREATE DATABASE build_environment;
   CREATE USER build_env_user WITH PASSWORD 'build_env_password';
   GRANT ALL PRIVILEGES ON DATABASE build_environment TO build_env_user;
   ```

2. **Setup Redis**:
   ```bash
   redis-server
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

#### Database
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: build_environment)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

#### Redis
- `REDIS_HOST`: Redis host (default: localhost)
- `REDIS_PORT`: Redis port (default: 6379)
- `REDIS_PASSWORD`: Redis password (optional)

#### Security
- `JWT_SECRET`: JWT signing secret (min 32 characters)
- `JWT_EXPIRATION`: JWT token expiration (default: 86400000ms)
- `ENCRYPTION_SECRET_KEY`: Encryption key for sensitive data

#### Application
- `SERVER_PORT`: Application port (default: 8080)
- `LOG_LEVEL`: Logging level (default: INFO)

### Application Profiles

- `development`: For local development
- `staging`: For staging environment
- `production`: For production environment

## API Documentation

### Swagger UI
Access interactive API documentation at: http://localhost:8080/swagger-ui.html

### OpenAPI Specification
View the OpenAPI spec at: http://localhost:8080/api-docs

### Key Endpoints

#### Maven Wrapper
- `POST /api/v1/maven-wrapper/download` - Download Maven Wrapper
- `GET /api/v1/maven-wrapper/status/{downloadId}` - Get download status

#### Build Environment
- `POST /api/v1/build-environment/configure` - Configure environment
- `GET /api/v1/build-environment/{environmentId}` - Get environment details
- `DELETE /api/v1/build-environment/{environmentId}` - Delete environment

#### Health & Monitoring
- `GET /actuator/health` - Application health
- `GET /actuator/metrics` - Application metrics
- `GET /actuator/prometheus` - Prometheus metrics

## Testing

### Run Unit Tests
```bash
mvn test
```

### Run Integration Tests
```bash
mvn verify
```

### Test Coverage
```bash
mvn jacoco:report
# View report at target/site/jacoco/index.html
```

### Example API Calls

#### Download Maven Wrapper
```bash
curl -X POST http://localhost:8080/api/v1/maven-wrapper/download \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "projectPath": "/path/to/project",
    "mavenVersion": "3.9.6",
    "forceDownload": false
  }'
```

#### Configure Build Environment
```bash
curl -X POST http://localhost:8080/api/v1/build-environment/configure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "environmentName": "My Dev Environment",
    "buildTools": [
      {
        "toolType": "JAVA",
        "version": "17.0.9"
      },
      {
        "toolType": "MAVEN",
        "version": "3.9.6"
      }
    ],
    "environmentVariables": {
      "JAVA_HOME": "/opt/java/openjdk-17",
      "MAVEN_HOME": "/opt/maven"
    }
  }'
```

## Database Schema

The application uses Flyway for database migrations. Schema files are located in `src/main/resources/db/migration/`.

### Key Tables
- `build_environments`: Main environment configurations
- `installed_tools`: Build tools installed in environments
- `repository_access`: Repository access configurations
- `configuration_snapshots`: Environment configuration snapshots
- `maven_wrapper_downloads`: Maven wrapper download operations

## Monitoring

### Prometheus Metrics
The application exposes metrics at `/actuator/prometheus` including:
- HTTP request metrics
- JVM metrics
- Database connection pool metrics
- Custom business metrics

### Grafana Dashboards
Pre-configured dashboards are available in `monitoring/grafana/dashboards/`:
- Application Overview
- JVM Metrics
- Database Metrics
- Build Environment Metrics

### Health Checks
Health checks are available at `/actuator/health` and include:
- Database connectivity
- Redis connectivity
- Disk space
- Custom health indicators

## Security

### Authentication
- JWT-based authentication
- Token expiration and refresh
- Secure password storage with encryption

### Data Protection
- Sensitive data encryption at rest
- Parameterized queries to prevent SQL injection
- Input validation and sanitization
- CORS configuration

### Rate Limiting
API endpoints are protected with rate limiting to prevent abuse.

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t build-environment-api .

# Run container
docker run -d -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  build-environment-api
```

### Kubernetes Deployment
Kubernetes manifests are available in the `k8s/` directory:
```bash
kubectl apply -f k8s/
```

### Production Considerations

1. **Environment Variables**: Use a secret management system
2. **Database**: Use managed PostgreSQL service
3. **Caching**: Use managed Redis service
4. **Monitoring**: Configure alerting rules
5. **Backup**: Implement database backup strategy
6. **SSL/TLS**: Configure HTTPS with valid certificates
7. **Load Balancing**: Use load balancer for high availability

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Verify PostgreSQL is running
   - Check connection parameters
   - Ensure database exists

2. **Redis Connection Issues**:
   - Verify Redis is running
   - Check Redis configuration
   - Verify network connectivity

3. **Application Startup Issues**:
   - Check Java version (requires Java 17+)
   - Verify environment variables
   - Check application logs

### Logs
Application logs are available:
- Console output during development
- File logs in `logs/build-environment.log`
- Docker logs: `docker-compose logs app`

### Debug Mode
Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
mvn spring-boot:run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Follow Java coding conventions
- Use meaningful variable and method names
- Add Javadoc for public methods
- Maintain test coverage above 80%

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: build-env@company.com
- Documentation: [Internal Wiki]
- Issue Tracker: [GitHub Issues]

## Changelog

See CHANGELOG.md for version history and release notes.