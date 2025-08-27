# My Interests - Deployment Guide

## Overview

This guide covers the complete deployment process for the My Interests social networking application, including backend API, frontend web application, and Profile API client.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React/Vite)  │◄──►│  (Spring Boot)  │◄──►│   Database      │
│   Port: 5173    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Profile API     │
                       │ Client Library  │  
                       │ Port: 8081      │
                       └─────────────────┘
```

## Prerequisites

### System Requirements
- **Java 20+** (for backend and Profile API client)
- **Node.js 22.18.0+** with npm (for frontend)
- **PostgreSQL 13+** (for database)
- **Git** (for source control)

### Development Tools
- **Maven 3.8+** (Java build tool)
- **nvm** (Node Version Manager)

## Environment Setup

### 1. Java Environment

```bash
# Install Java 20 (macOS with Homebrew)
brew install openjdk@20

# Set JAVA_HOME
export JAVA_20_HOME=$(/usr/libexec/java_home -v20)
export JAVA_HOME=$JAVA_20_HOME

# Verify installation
java --version
```

### 2. Node.js Environment

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 22.18.0
nvm install v22.18.0
nvm use v22.18.0

# Verify installation
node --version
npm --version
```

### 3. PostgreSQL Setup

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb myinterests

# Connect and verify
psql postgres
\l  # List databases
\q  # Quit
```

## Database Configuration

### 1. Database Initialization

```sql
-- Connect to PostgreSQL
psql postgres

-- Create database if not exists
CREATE DATABASE myinterests;

-- Connect to the database
\c myinterests

-- Verify connection
SELECT current_database();
```

### 2. Schema Creation

The application uses Hibernate DDL auto-generation. Tables will be created automatically on first startup with the provided SQL data files:

- `sql/continents_countries.sql` - Geographic data
- `sql/interest_tags.sql` - Available interest categories  
- `sql/api_clients.sql` - API client configurations

## Backend Deployment

### 1. Configuration

Create or update `backend/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: my-interests-backend
  
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:myinterests}
    username: ${DB_USERNAME:johndickerson}
    password: ${DB_PASSWORD:}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: ${DDL_AUTO:update}
    show-sql: ${SHOW_SQL:false}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: ${SERVER_PORT:8080}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:change-this-in-production}
  expiration: ${JWT_EXPIRATION:86400000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

# Profile API Signature
app:
  signature:
    private-key: ${PROFILE_SIGNATURE_PRIVATE_KEY:}

logging:
  level:
    com.myinterests.backend: ${LOG_LEVEL:INFO}
```

### 2. Environment Variables

Create `.env` file or set system environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myinterests
DB_USERNAME=johndickerson
DB_PASSWORD=your_password

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Profile API Signature (Generate a new private key)
PROFILE_SIGNATURE_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12

# Application Configuration
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
DDL_AUTO=validate
SHOW_SQL=false
LOG_LEVEL=INFO
```

### 3. Build and Run

```bash
# Navigate to backend directory
cd backend

# Make build script executable
chmod +x mvn_compile.sh

# Build the application
./mvn_compile.sh

# Run with Maven (development)
export JAVA_20_HOME=$(/usr/libexec/java_home -v20)
export JAVA_HOME=$JAVA_20_HOME
mvn spring-boot:run

# Or build JAR and run (production)
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 4. Health Check

```bash
# Verify backend is running
curl http://localhost:8080/api/data/countries
curl http://localhost:8080/api/data/interests
```

## Frontend Deployment

### 1. Configuration

Create or update `frontend/.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080

# Reown App Kit Configuration (get from https://cloud.reown.com)
VITE_REOWN_PROJECT_ID=your_reown_project_id

# Application Configuration
VITE_APP_NAME="My Interests"
VITE_APP_DESCRIPTION="Social networking based on shared interests"
```

### 2. Dependencies Installation

```bash
# Navigate to frontend directory
cd frontend

# Use correct Node.js version
source ~/.nvm/nvm.sh
nvm use v22.18.0

# Install dependencies
npm install
```

### 3. Build and Run

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Serve with a static server (production)
npx serve -s dist -l 5173
```

### 4. Health Check

Open browser and navigate to:
- Development: `http://localhost:5173`
- Production: `http://localhost:5173` (or your configured port)

## Profile API Client Deployment

### 1. Configuration

Create or update `profile-api-client/src/main/resources/application.yml`:

```yaml
spring:
  application:
    name: profile-api-client

server:
  port: ${CLIENT_SERVER_PORT:8081}

profile:
  api:
    base-url: ${PROFILE_API_BASE_URL:http://localhost:8080}
    client-id: ${PROFILE_API_CLIENT_ID:default-client-id}

logging:
  level:
    com.myinterests.profileapiclient: ${LOG_LEVEL:INFO}
```

### 2. Environment Variables

```bash
# Profile API Client Configuration
PROFILE_API_BASE_URL=http://localhost:8080
PROFILE_API_CLIENT_ID=your-registered-client-id
CLIENT_SERVER_PORT=8081
```

### 3. Build and Run

```bash
# Navigate to profile-api-client directory
cd profile-api-client

# Make build script executable
chmod +x mvn_compile.sh

# Build the application
./mvn_compile.sh

# Run the client application
export JAVA_20_HOME=$(/usr/libexec/java_home -v20)
export JAVA_HOME=$JAVA_20_HOME
mvn spring-boot:run

# Test example endpoint
curl http://localhost:8081/example/profile/0x1234567890abcdef1234567890abcdef12345678
```

## Production Deployment

### 1. Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: myinterests
      POSTGRES_USER: myinterests
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - myinterests-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DB_HOST: postgres
      DB_USERNAME: myinterests
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      PROFILE_SIGNATURE_PRIVATE_KEY: ${PROFILE_SIGNATURE_PRIVATE_KEY}
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - myinterests-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_BASE_URL: http://backend:8080
      VITE_REOWN_PROJECT_ID: ${REOWN_PROJECT_ID}
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - myinterests-network

  profile-api-client:
    build:
      context: ./profile-api-client
      dockerfile: Dockerfile
    environment:
      PROFILE_API_BASE_URL: http://backend:8080
      PROFILE_API_CLIENT_ID: ${PROFILE_API_CLIENT_ID}
    ports:
      - "8081:8081"
    depends_on:
      - backend
    networks:
      - myinterests-network

volumes:
  postgres_data:

networks:
  myinterests-network:
    driver: bridge
```

### 2. Kubernetes Deployment

Create Kubernetes manifests in `k8s/` directory:

- `namespace.yaml` - Create dedicated namespace
- `configmap.yaml` - Application configuration
- `secrets.yaml` - Sensitive configuration
- `postgres-deployment.yaml` - Database deployment
- `backend-deployment.yaml` - Backend API deployment
- `frontend-deployment.yaml` - Frontend deployment
- `ingress.yaml` - Load balancer configuration

### 3. Cloud Deployment (AWS)

#### RDS PostgreSQL Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier myinterests-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username myinterests \
  --master-user-password ${DB_PASSWORD} \
  --allocated-storage 20
```

#### ECS Fargate Deployment
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name myinterests-cluster

# Deploy services using ECS task definitions
aws ecs run-task --cluster myinterests-cluster --task-definition backend-task
aws ecs run-task --cluster myinterests-cluster --task-definition frontend-task
```

## Security Configuration

### 1. HTTPS Setup

```bash
# Generate SSL certificates (Let's Encrypt)
certbot certonly --standalone -d yourdomain.com

# Configure Nginx reverse proxy
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Firewall Configuration

```bash
# Ubuntu/Debian UFW
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 5432  # PostgreSQL (internal only)
ufw enable

# Block direct access to application ports
ufw deny 8080   # Backend API
ufw deny 5173   # Frontend dev server
```

### 3. Environment Security

- Store sensitive configuration in encrypted environment variables
- Use AWS Secrets Manager or similar for production secrets
- Rotate JWT secrets and database passwords regularly
- Implement API rate limiting and monitoring
- Enable database connection encryption
- Use dedicated service accounts with minimal permissions

## Monitoring and Logging

### 1. Application Monitoring

```yaml
# application.yml monitoring configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always

logging:
  level:
    org.springframework.security: INFO
    com.myinterests.backend: INFO
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
```

### 2. Health Checks

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend availability
curl -I http://localhost:5173

# Database connectivity  
pg_isready -h localhost -p 5432
```

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup
pg_dump myinterests > myinterests_backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/myinterests"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump myinterests | gzip > "$BACKUP_DIR/myinterests_$DATE.sql.gz"

# Keep only last 7 days
find $BACKUP_DIR -name "myinterests_*.sql.gz" -mtime +7 -delete
```

### 2. Application Recovery

```bash
# Restore database
psql myinterests < myinterests_backup_20231127_120000.sql

# Rebuild and restart applications
cd backend && ./mvn_compile.sh && mvn spring-boot:run &
cd frontend && npm run build && npx serve -s dist &
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running: `pg_isready`
   - Check connection strings and credentials
   - Ensure firewall allows database connections

2. **JWT Token Issues**
   - Verify JWT secret is set correctly
   - Check token expiration times
   - Validate client authentication flow

3. **Frontend Build Errors**
   - Verify Node.js version: `node --version`
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Backend Compilation Errors**
   - Verify Java version: `java --version`
   - Set JAVA_HOME correctly
   - Clean Maven cache: `mvn clean`

### Log Analysis

```bash
# Backend logs
tail -f backend/logs/application.log

# Frontend development logs
npm run dev 2>&1 | tee frontend.log

# Database logs (PostgreSQL)
tail -f /usr/local/var/log/postgresql@15.log
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for frequent queries
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE wallet_address = '0x123...';
```

### 2. Application Tuning

```yaml
# Backend JVM tuning
JAVA_OPTS: "-Xmx1g -Xms512m -XX:+UseG1GC"

# Database connection pooling
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
```

### 3. Frontend Optimization

```bash
# Enable gzip compression
gzip on;
gzip_types text/css application/javascript application/json;

# Enable browser caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

This deployment guide provides comprehensive instructions for setting up the My Interests application in various environments, from development to production-ready deployments with proper security, monitoring, and backup procedures.