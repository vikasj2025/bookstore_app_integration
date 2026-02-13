# Build Environment API Runbook

This runbook provides operational procedures for the Automated Build Environment Setup and Configuration API.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Deployment Procedures](#deployment-procedures)
3. [Monitoring and Alerting](#monitoring-and-alerting)
4. [Troubleshooting](#troubleshooting)
5. [Rollback Procedures](#rollback-procedures)
6. [Common Issues](#common-issues)
7. [Emergency Contacts](#emergency-contacts)

## Quick Reference

### Service URLs
- **Production**: https://api.buildenvironment.company.com
- **Staging**: https://staging-api.buildenvironment.company.com
- **Health Check**: `/actuator/health`
- **Metrics**: `/actuator/prometheus`
- **API Docs**: `/swagger-ui.html`

### Key Metrics
- **Response Time**: < 500ms (95th percentile)
- **Error Rate**: < 1%
- **Availability**: > 99.9%
- **Database Connections**: < 80% of pool size

### Critical Dependencies
- PostgreSQL Database
- Redis Cache
- External Maven Repository
- Git Repository Access

## Deployment Procedures

### Pre-deployment Checklist

- [ ] All tests passing in CI/CD pipeline
- [ ] Security scan completed without critical issues
- [ ] Database migrations tested
- [ ] Staging deployment successful
- [ ] Rollback plan prepared
- [ ] Team notified of deployment window

### Standard Deployment

1. **Verify Staging Environment**:
   ```bash
   curl -f https://staging-api.buildenvironment.company.com/actuator/health
   ```

2. **Deploy to Production**:
   ```bash
   # Using Kubernetes
   kubectl apply -f k8s/production/
   
   # Using Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verify Deployment**:
   ```bash
   # Check health
   curl -f https://api.buildenvironment.company.com/actuator/health
   
   # Check metrics
   curl https://api.buildenvironment.company.com/actuator/prometheus
   
   # Test key endpoints
   curl -X GET https://api.buildenvironment.company.com/api/v1/build-environment
   ```

4. **Monitor for 15 minutes**:
   - Check error rates in Grafana
   - Monitor response times
   - Verify database connections
   - Check application logs

### Blue-Green Deployment

1. **Deploy to Green Environment**:
   ```bash
   kubectl apply -f k8s/production-green/
   ```

2. **Run Health Checks**:
   ```bash
   kubectl exec -it deployment/build-env-green -- curl localhost:8080/actuator/health
   ```

3. **Switch Traffic**:
   ```bash
   kubectl patch service build-env-service -p '{"spec":{"selector":{"version":"green"}}}'
   ```

4. **Monitor and Verify**:
   - Check metrics for 10 minutes
   - Verify no increase in error rates
   - Confirm all functionality working

5. **Clean Up Blue Environment** (after 24 hours):
   ```bash
   kubectl delete -f k8s/production-blue/
   ```

## Monitoring and Alerting

### Key Dashboards

1. **Application Overview** (Grafana)
   - Request rate and response times
   - Error rates by endpoint
   - JVM metrics (heap, GC)
   - Active database connections

2. **Infrastructure** (Grafana)
   - CPU and memory usage
   - Database performance
   - Redis performance
   - Network metrics

3. **Business Metrics** (Grafana)
   - Build environment creation rate
   - Maven wrapper downloads
   - Repository access validations
   - Configuration rollbacks

### Critical Alerts

#### High Priority (Page immediately)
- Application down (health check failing)
- Error rate > 5%
- Response time > 2 seconds (95th percentile)
- Database connection pool > 90%
- Memory usage > 85%

#### Medium Priority (Notify during business hours)
- Error rate > 1%
- Response time > 1 second (95th percentile)
- Database connection pool > 70%
- Disk space > 80%

#### Low Priority (Email notification)
- Unusual traffic patterns
- Configuration changes
- Scheduled maintenance reminders

### Alert Response Procedures

1. **Application Down**:
   ```bash
   # Check pod status
   kubectl get pods -l app=build-environment
   
   # Check logs
   kubectl logs -l app=build-environment --tail=100
   
   # Check dependencies
   kubectl get pods -l app=postgres
   kubectl get pods -l app=redis
   
   # Restart if necessary
   kubectl rollout restart deployment/build-environment
   ```

2. **High Error Rate**:
   ```bash
   # Check recent logs for errors
   kubectl logs -l app=build-environment --since=10m | grep ERROR
   
   # Check database connectivity
   kubectl exec -it deployment/build-environment -- curl localhost:8080/actuator/health
   
   # Check external dependencies
   curl -I https://repo1.maven.org/maven2/
   ```

3. **High Response Time**:
   ```bash
   # Check CPU and memory usage
   kubectl top pods -l app=build-environment
   
   # Check database performance
   kubectl exec -it postgres-pod -- psql -U build_env_user -d build_environment -c "SELECT * FROM pg_stat_activity;"
   
   # Check for long-running queries
   kubectl exec -it postgres-pod -- psql -U build_env_user -d build_environment -c "SELECT query, state, query_start FROM pg_stat_activity WHERE state = 'active';"
   ```

## Rollback Procedures

### Quick Rollback (< 5 minutes)

1. **Kubernetes Rollback**:
   ```bash
   # Check rollout history
   kubectl rollout history deployment/build-environment
   
   # Rollback to previous version
   kubectl rollout undo deployment/build-environment
   
   # Check rollback status
   kubectl rollout status deployment/build-environment
   ```

2. **Docker Compose Rollback**:
   ```bash
   # Stop current version
   docker-compose down
   
   # Start previous version
   docker-compose -f docker-compose.prev.yml up -d
   ```

### Database Rollback

1. **Check Migration Status**:
   ```bash
   kubectl exec -it deployment/build-environment -- java -jar app.jar --spring.profiles.active=production flyway:info
   ```

2. **Rollback Database** (if needed):
   ```bash
   # Restore from backup
   pg_restore -h postgres-host -U build_env_user -d build_environment backup_file.sql
   
   # Or use Flyway undo (if available)
   kubectl exec -it deployment/build-environment -- java -jar app.jar --spring.profiles.active=production flyway:undo
   ```

### Verification After Rollback

1. **Health Checks**:
   ```bash
   curl -f https://api.buildenvironment.company.com/actuator/health
   ```

2. **Functional Tests**:
   ```bash
   # Test key endpoints
   curl -X POST https://api.buildenvironment.company.com/api/v1/maven-wrapper/download \
     -H "Content-Type: application/json" \
     -d '{"projectPath":"/test","mavenVersion":"3.9.6"}'
   ```

3. **Monitor Metrics**:
   - Check error rates return to normal
   - Verify response times improved
   - Confirm no data loss

## Common Issues

### Database Connection Issues

**Symptoms**:
- Connection timeout errors
- "Too many connections" errors
- Slow database queries

**Diagnosis**:
```bash
# Check connection pool status
kubectl logs -l app=build-environment | grep "HikariPool"

# Check database connections
kubectl exec -it postgres-pod -- psql -U build_env_user -d build_environment -c "SELECT count(*) FROM pg_stat_activity;"
```

**Resolution**:
1. Increase connection pool size (if needed)
2. Restart application pods
3. Check for connection leaks in code
4. Scale database if necessary

### Redis Connection Issues

**Symptoms**:
- Cache miss errors
- Redis connection timeouts
- Degraded performance

**Diagnosis**:
```bash
# Check Redis status
kubectl exec -it redis-pod -- redis-cli ping

# Check Redis memory usage
kubectl exec -it redis-pod -- redis-cli info memory
```

**Resolution**:
1. Restart Redis pod
2. Clear cache if corrupted
3. Increase Redis memory limit
4. Check network connectivity

### High Memory Usage

**Symptoms**:
- OutOfMemoryError in logs
- Pods being killed by OOMKiller
- Slow garbage collection

**Diagnosis**:
```bash
# Check memory usage
kubectl top pods -l app=build-environment

# Get heap dump (if possible)
kubectl exec -it build-env-pod -- jcmd 1 GC.run_finalization
```

**Resolution**:
1. Increase memory limits
2. Tune JVM parameters
3. Check for memory leaks
4. Scale horizontally

### External Service Issues

**Symptoms**:
- Maven repository access failures
- Git repository connection errors
- Timeout errors

**Diagnosis**:
```bash
# Test external connectivity
kubectl exec -it build-env-pod -- curl -I https://repo1.maven.org/maven2/
kubectl exec -it build-env-pod -- nslookup github.com
```

**Resolution**:
1. Check network policies
2. Verify DNS resolution
3. Check firewall rules
4. Contact external service providers

## Emergency Contacts

### On-Call Rotation
- **Primary**: [On-call engineer]
- **Secondary**: [Backup engineer]
- **Escalation**: [Team lead]

### Contact Methods
- **PagerDuty**: [PagerDuty service ID]
- **Slack**: #build-environment-alerts
- **Email**: build-env-oncall@company.com

### Vendor Contacts
- **Cloud Provider**: [Support contact]
- **Database**: [PostgreSQL support]
- **Monitoring**: [Grafana/Prometheus support]

## Maintenance Windows

### Scheduled Maintenance
- **Time**: Sundays 2:00-4:00 AM UTC
- **Frequency**: Monthly
- **Activities**:
  - Security patches
  - Database maintenance
  - Certificate renewals
  - Backup verification

### Emergency Maintenance
- **Approval**: Team lead or above
- **Notification**: 30 minutes advance notice (minimum)
- **Communication**: Slack + email + status page

## Recovery Procedures

### Disaster Recovery

1. **Assess Scope of Outage**:
   - Check all environments
   - Identify affected components
   - Estimate recovery time

2. **Activate DR Site** (if needed):
   ```bash
   # Switch DNS to DR site
   # Restore database from backup
   # Deploy application to DR infrastructure
   ```

3. **Communicate Status**:
   - Update status page
   - Notify stakeholders
   - Provide regular updates

### Data Recovery

1. **Database Restore**:
   ```bash
   # Stop application
   kubectl scale deployment/build-environment --replicas=0
   
   # Restore database
   pg_restore -h postgres-host -U build_env_user -d build_environment backup_file.sql
   
   # Restart application
   kubectl scale deployment/build-environment --replicas=3
   ```

2. **Verify Data Integrity**:
   ```bash
   # Run data validation queries
   # Check application functionality
   # Verify recent data is present
   ```

## Post-Incident Procedures

1. **Document Incident**:
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Resolution steps

2. **Conduct Post-Mortem**:
   - Schedule within 48 hours
   - Include all stakeholders
   - Identify improvement actions
   - Update runbook if needed

3. **Implement Improvements**:
   - Add monitoring/alerting
   - Update procedures
   - Enhance automation
   - Train team members

---

**Last Updated**: [Current Date]
**Next Review**: [Date + 3 months]
**Document Owner**: [Team Lead]
**Reviewers**: [Engineering Team]