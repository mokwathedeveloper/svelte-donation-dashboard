# CI/CD Pipeline Guide

This document provides comprehensive information about the Continuous Integration and Continuous Deployment pipeline for the Donation Platform.

## Overview

The CI/CD pipeline is built using GitHub Actions and provides automated testing, building, security scanning, and deployment capabilities.

## Pipeline Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│   Integration   │───▶│   Deployment    │
│                 │    │                 │    │                 │
│ • Code Changes  │    │ • Automated     │    │ • Staging       │
│ • Pull Requests │    │   Testing       │    │ • Production    │
│ • Feature Work  │    │ • Build Process │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Workflows

### 1. Continuous Integration (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Test Suite**: Runs on Node.js 18.x and 20.x
  - Checkout repository
  - Install dependencies
  - Run type checking
  - Execute test suite
  - Generate coverage reports
  - Upload coverage to Codecov

- **Build Application**: 
  - Build production bundle
  - Upload build artifacts
  - Verify build integrity

- **Security Audit**:
  - Run npm security audit
  - Check for vulnerable dependencies
  - Generate security reports

- **Code Quality**:
  - SonarCloud analysis
  - Code coverage validation
  - Quality gate enforcement

### 2. Deployment Pipeline (`.github/workflows/deploy.yml`)

**Triggers:**
- Push to `main` branch (staging deployment)
- Git tags starting with `v*` (production deployment)
- Manual workflow dispatch

**Environments:**
- **Staging**: Automatic deployment from main branch
- **Production**: Manual approval required for production deployment

**Deployment Targets:**
- Vercel (Primary)
- Netlify (Alternative)
- Docker containers
- Custom servers

### 3. Docker Build Pipeline

**Features:**
- Multi-stage Docker builds for optimization
- Automatic image tagging based on Git refs
- Docker Hub integration
- Security scanning of container images

## Environment Configuration

### Required Secrets

Configure these secrets in your GitHub repository settings:

#### Deployment Secrets
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id

NETLIFY_AUTH_TOKEN=your-netlify-auth-token
NETLIFY_SITE_ID=your-netlify-site-id

DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

#### Application Secrets
```bash
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey
ADMIN_SECRET_KEY=your-admin-secret-key
SUPER_ADMIN_MASTER_KEY=your-super-admin-master-key
```

#### Monitoring Secrets
```bash
SONAR_TOKEN=your-sonarcloud-token
SLACK_WEBHOOK_URL=your-slack-webhook-url
SENTRY_DSN=your-sentry-dsn
```

## Deployment Strategies

### Staging Deployment
- **Trigger**: Every push to main branch
- **Environment**: staging
- **URL**: Automatically generated preview URL
- **Database**: Staging database with test data
- **Purpose**: Testing and validation before production

### Production Deployment
- **Trigger**: Git tags (e.g., `v1.0.0`) or manual dispatch
- **Environment**: production
- **URL**: Production domain
- **Database**: Production database
- **Approval**: Requires manual approval for safety

## Docker Deployment

### Local Development
```bash
# Build and run with Docker Compose
npm run docker:dev

# Access application
http://localhost:3000
```

### Production Deployment
```bash
# Build production image
npm run docker:build

# Deploy to production
npm run docker:prod
```

### Container Features
- Multi-stage builds for optimization
- Non-root user for security
- Health checks for monitoring
- Proper signal handling with dumb-init
- Volume mounts for persistent data

## Monitoring and Health Checks

### Health Endpoint
- **URL**: `/health`
- **Purpose**: Application and database health monitoring
- **Response**: JSON with system status and metrics

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **Docker Health Checks**: Container monitoring
- **Application Logs**: Structured logging

## Quality Gates

### Code Quality Requirements
- **Test Coverage**: Minimum 80%
- **Security Audit**: No high/critical vulnerabilities
- **Type Safety**: Zero TypeScript errors
- **Code Quality**: SonarCloud quality gate pass

### Deployment Requirements
- All tests must pass
- Build must complete successfully
- Security audit must pass
- Manual approval for production (if configured)

## Rollback Procedures

### Automatic Rollback
- Health check failures trigger automatic rollback
- Database migration failures prevent deployment
- Critical errors during deployment stop the process

### Manual Rollback
```bash
# Rollback to previous version
git tag v1.0.1-rollback
git push origin v1.0.1-rollback

# Or use deployment script
npm run deploy:production v1.0.0
```

## Best Practices

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature development
- **hotfix/***: Critical production fixes

### Commit Messages
- Use conventional commits format
- Include breaking change indicators
- Reference issue numbers when applicable

### Testing Strategy
- Unit tests for all business logic
- Integration tests for API endpoints
- Component tests for UI elements
- End-to-end tests for critical user flows

### Security Practices
- Regular dependency updates
- Security scanning in CI/CD
- Secrets management with GitHub Secrets
- Container security scanning
- Environment-specific configurations

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify dependency compatibility
   - Review build logs in GitHub Actions

2. **Test Failures**
   - Run tests locally first
   - Check for environment-specific issues
   - Review test coverage reports

3. **Deployment Issues**
   - Verify environment variables
   - Check deployment logs
   - Validate health endpoints

4. **Docker Issues**
   - Check Dockerfile syntax
   - Verify base image compatibility
   - Review container logs

### Support Resources
- GitHub Actions documentation
- Docker deployment guides
- SvelteKit deployment documentation
- Platform-specific deployment guides (Vercel, Netlify)

## Continuous Improvement

### Metrics to Monitor
- Build success rate
- Deployment frequency
- Lead time for changes
- Mean time to recovery
- Test coverage trends

### Regular Maintenance
- Update dependencies monthly
- Review and update security policies
- Optimize build performance
- Update documentation
- Review and improve test coverage
