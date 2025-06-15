#!/bin/bash

# Deployment script for Donation Platform
set -e

echo "🚀 Starting deployment process..."

# Configuration
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
DOCKER_IMAGE="donation-platform:$VERSION"

echo "📋 Deployment Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Version: $VERSION"
echo "   Docker Image: $DOCKER_IMAGE"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
if [ "$ENVIRONMENT" = "production" ]; then
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "MPESA_CONSUMER_KEY"
        "MPESA_CONSUMER_SECRET"
        "ADMIN_SECRET_KEY"
        "SUPER_ADMIN_MASTER_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ Error: Required environment variable $var is not set"
            exit 1
        fi
    done
fi

# Run tests
echo "🧪 Running test suite..."
npm run test:run

# Build application
echo "🔨 Building application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌟 Deploying to production..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for health check
    echo "⏳ Waiting for application to be healthy..."
    timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'
    
    # Run database migrations if needed
    echo "🗄️ Running database migrations..."
    npm run migrate || echo "No migrations to run"
    
    # Create super admin if needed
    echo "👑 Setting up super admin..."
    npm run create-super-admin || echo "Super admin already exists"
    
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo "🎭 Deploying to staging..."
    
    # Deploy to staging environment
    docker-compose -f docker-compose.staging.yml down
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for health check
    timeout 60 bash -c 'until curl -f http://localhost:3001/health; do sleep 2; done'
    
else
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
fi

# Post-deployment verification
echo "✅ Running post-deployment verification..."

# Check application health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Application is healthy"
else
    echo "❌ Application health check failed"
    exit 1
fi

# Check database connectivity
if curl -f http://localhost:3000/api/projects > /dev/null 2>&1; then
    echo "✅ Database connectivity verified"
else
    echo "❌ Database connectivity check failed"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📊 Application is running at:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "   Production: http://localhost:3000"
else
    echo "   Staging: http://localhost:3001"
fi

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Donation Platform deployed to $ENVIRONMENT successfully!\"}" \
        $SLACK_WEBHOOK_URL
fi

echo "✨ Deployment process completed!"
