# Maven Wrapper Bootstrap API

A Spring Boot application that provides APIs for automating Maven wrapper setup, secure downloads, configuration discovery, and build monitoring.

## Features

- **Bootstrap Automation**: Automated Maven wrapper setup for consistent builds
- **Configuration Discovery**: Automatic detection of project configurations
- **Secure Downloads**: HTTPS-only downloads with integrity verification
- **Caching**: Redis-based caching for improved performance
- **Monitoring**: Comprehensive health checks and metrics
- **Authentication**: JWT-based security
- **Database**: PostgreSQL with Flyway migrations

## Tech Stack

- **Language**: Java 17
- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL 15+
- **Cache**: Redis 6+
- **Build Tool**: Maven 3.9+
- **Authentication**: JWT
- **Documentation**: OpenAPI 3.0 (Swagger)
- **Containerization**: Docker

## Prerequisites

- Java 17 or higher
- Maven 3.9 or higher
- PostgreSQL 15 or higher
- Redis 6 or higher
- Docker (optional, for containerized setup)

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE maven_bootstrap;"
psql -U postgres -c "CREATE USER maven_bootstrap WITH PASSWORD 'maven_bootstrap';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE maven_bootstrap TO maven_bootstrap;"

# Run migrations
mvn flyway:migrate
```

### 3. Start Redis

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:6-alpine

# Or install locally
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS
```

### 4. Build and Run

```bash
# Build the application
mvn clean compile

# Run tests
mvn test

# Start the application
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/maven-wrapper-bootstrap-api-1.0.0.jar
```

The application will start on `http://localhost:8080/v1`

## Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t maven-bootstrap-api .

# Run container
docker run -d \
  --name maven-bootstrap-api \
  -p 8080:8080 \
  --env-file .env \
  maven-bootstrap-api
```

## Configuration

### Environment Variables

Key configuration options (see `.env.example` for full list):

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/maven_bootstrap
DB_USERNAME=maven_bootstrap
DB_PASSWORD=maven_bootstrap

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000

# Maven
MAVEN_DEFAULT_DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven
MAVEN_WRAPPER_VERSION=3.9.5

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Application Profiles

- `dev`: Development profile with debug logging
- `test`: Test profile with H2 in-memory database
- `prod`: Production profile with optimized settings

```bash
# Set active profile
export SPRING_PROFILES_ACTIVE=dev
# or
java -jar app.jar --spring.profiles.active=prod
```

## API Documentation

### Swagger UI
Access interactive API documentation at:
- http://localhost:8080/v1/swagger-ui.html

### OpenAPI Specification
- JSON: http://localhost:8080/v1/api-docs
- YAML: Available in `openapi.yaml`

### Authentication

All API endpoints require JWT authentication:

```bash
# Example request
curl -H "Authorization: Bearer <JWT_TOKEN>" \
     http://localhost:8080/v1/bootstrap
```

## API Endpoints

### Bootstrap Operations
- `POST /bootstrap` - Initialize Maven wrapper bootstrap
- `GET /bootstrap/{id}/status` - Get bootstrap status

### Configuration Management
- `POST /configuration/discovery` - Discover project configuration
- `GET /configuration` - Get configuration templates

### Download Services
- `GET /downloads/maven-wrapper` - Download Maven wrapper
- `POST /downloads/verify` - Verify download integrity

### Cache Management
- `GET /cache/status` - Get cache status
- `POST /cache/invalidate` - Invalidate cache entries

### Monitoring
- `GET /monitoring/health` - Health check
- `GET /monitoring/metrics` - Service metrics
- `GET /monitoring/builds` - Build monitoring data

## Testing

### Unit Tests
```bash
# Run unit tests
mvn test

# Run with coverage
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Integration Tests
```bash
# Run integration tests
mvn test -Dtest=*IntegrationTest

# Run all tests
mvn verify
```

### Test with Sample Data
```bash
# Bootstrap a project
curl -X POST http://localhost:8080/v1/bootstrap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "projectPath": "/path/to/project",
    "mavenVersion": "3.9.5",
    "projectType": "spring-boot"
  }'

# Check status
curl http://localhost:8080/v1/bootstrap/{id}/status \
  -H "Authorization: Bearer <TOKEN>"
```

## Monitoring and Observability

### Health Checks
- Application: `/actuator/health`
- Database: Included in health endpoint
- Redis: Included in health endpoint

### Metrics
- Prometheus: `/actuator/prometheus`
- Application metrics: `/actuator/metrics`
- Custom metrics: `/monitoring/metrics`

### Logging
- Structured JSON logging
- Request tracing with trace IDs
- Log levels configurable via environment

### Tracing
To enable distributed tracing:
```bash
TRACING_ENABLED=true
TRACING_ENDPOINT=http://jaeger:14268/api/traces
```

## Security

### Authentication
- JWT tokens required for all endpoints
- Token expiration: 24 hours (configurable)
- Refresh tokens: 7 days (configurable)

### HTTPS
- Enforced in production
- TLS 1.2+ required
- Configurable SSL certificates

### Input Validation
- Request payload validation
- SQL injection prevention
- XSS protection

### Rate Limiting
```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

## Performance

### Caching Strategy
- Redis for application cache
- Bootstrap operations cached for 1 hour
- Configuration templates cached for 24 hours
- Download records cached for 6 hours

### Database Optimization
- Connection pooling (HikariCP)
- Indexed queries
- Pagination for large datasets

### File Downloads
- Streaming downloads for large files
- Resume support for interrupted downloads
- Checksum verification

## Deployment

### Production Checklist

1. **Environment Configuration**
   - [ ] Set production database credentials
   - [ ] Configure Redis connection
   - [ ] Set strong JWT secret
   - [ ] Enable SSL/HTTPS
   - [ ] Configure CORS origins

2. **Security**
   - [ ] Enable rate limiting
   - [ ] Configure firewall rules
   - [ ] Set up SSL certificates
   - [ ] Review CORS settings

3. **Monitoring**
   - [ ] Configure log aggregation
   - [ ] Set up metrics collection
   - [ ] Configure alerting
   - [ ] Test health checks

4. **Performance**
   - [ ] Tune database connection pool
   - [ ] Configure Redis memory limits
   - [ ] Set appropriate JVM heap size
   - [ ] Enable compression

### Kubernetes Deployment

```yaml
# Example deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: maven-bootstrap-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: maven-bootstrap-api
  template:
    metadata:
      labels:
        app: maven-bootstrap-api
    spec:
      containers:
      - name: api
        image: maven-bootstrap-api:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        livenessProbe:
          httpGet:
            path: /v1/actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /v1/actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

### CI/CD Pipeline

See `.github/workflows/ci.yml` for GitHub Actions configuration.

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database is running
   pg_isready -h localhost -p 5432
   
   # Test connection
   psql -h localhost -U maven_bootstrap -d maven_bootstrap
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis is running
   redis-cli ping
   
   # Check Redis logs
   docker logs redis
   ```

3. **JWT Token Issues**
   ```bash
   # Verify JWT secret is set
   echo $JWT_SECRET
   
   # Check token expiration
   # Use online JWT decoder to inspect token
   ```

4. **Download Failures**
   ```bash
   # Check network connectivity
   curl -I https://repo.maven.apache.org/maven2/
   
   # Verify download directory permissions
   ls -la /tmp/maven-downloads
   ```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export SECURITY_LOG_LEVEL=DEBUG

# Or in application.yml
logging:
  level:
    com.mavenbootstrap: DEBUG
    org.springframework.security: DEBUG
```

### Performance Issues

1. **Slow Database Queries**
   ```bash
   # Enable SQL logging
   export JPA_SHOW_SQL=true
   export SQL_LOG_LEVEL=DEBUG
   ```

2. **Memory Issues**
   ```bash
   # Monitor JVM memory
   curl http://localhost:8080/v1/actuator/metrics/jvm.memory.used
   
   # Adjust heap size
   export JAVA_OPTS="-Xmx2g -Xms1g"
   ```

3. **Cache Issues**
   ```bash
   # Check cache status
   curl http://localhost:8080/v1/cache/status
   
   # Clear cache
   curl -X POST http://localhost:8080/v1/cache/invalidate \
     -H "Content-Type: application/json" \
     -d '{"invalidateAll": true}'
   ```

## Development

### Code Style
- Follow Java naming conventions
- Use meaningful variable and method names
- Add JavaDoc for public methods
- Keep methods small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Adding New Endpoints
1. Define DTO classes in `dto` package
2. Add service methods in appropriate service class
3. Create controller endpoint
4. Add tests
5. Update OpenAPI specification

## Support

For issues and questions:
- Check the troubleshooting section
- Review application logs
- Create an issue in the repository
- Contact: support@mavenbootstrap.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.