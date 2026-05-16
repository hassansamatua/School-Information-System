# Deployment Guide

This guide covers various deployment options for the School Information System, from local development to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn)
- **MySQL**: Version 8.0 or higher
- **Git**: For version control
- **Text Editor**: VS Code, Sublime Text, or similar

### Optional Requirements
- **Docker**: For containerized deployment
- **Docker Compose**: For multi-container setups
- **Cloud Provider Account**: AWS, Vercel, Netlify, etc.

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-information-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/school_information_system"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-very-secure-secret-key-here"

# Application Settings
APP_NAME="School Information System"
APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. File Upload Directory
Create the uploads directory for file storage:

```bash
mkdir -p public/uploads
```

## Database Setup

### Using XAMPP (Recommended for Local Development)

1. **Install XAMPP**
   - Download from [xampp.org](https://www.apachefriends.org/)
   - Follow installation instructions for your OS

2. **Start MySQL**
   ```bash
   # On Windows
   cd C:\xampp
   mysql_start.exe
   
   # On macOS/Linux
   sudo /opt/lamppp/bin/mysql start
   ```

3. **Create Database**
   ```sql
   CREATE DATABASE school_information_system;
   ```

4. **Update Database URL**
   Update your `.env.local` file with the correct MySQL credentials:
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/school_information_system"
   ```

### Using Docker MySQL (Alternative)

```bash
# Run MySQL container
docker run --name mysql-school-system \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=school_information_system \
  -p 3306:3306 \
  -d mysql:8.0 \
  mysql:8.0

# Update DATABASE_URL
DATABASE_URL="mysql://root:root@localhost:3306/school_information_system"
```

### Using Cloud Database Services

#### AWS RDS
1. Create an RDS instance in AWS Console
2. Configure security groups and VPC
3. Update DATABASE_URL with RDS connection string
4. Ensure application server can access the database

#### Google Cloud SQL
1. Create Cloud SQL instance in Google Cloud Console
2. Configure networking and IAM
3. Update DATABASE_URL with connection string
4. Download SSL certificate if required

#### DigitalOcean
1. Create a DigitalOcean Droplet
2. Install MySQL on the droplet
3. Secure the database
4. Update DATABASE_URL accordingly

## Database Migrations

### Initial Setup
```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### Schema Updates
```bash
# Create migration for schema changes
npx prisma migrate dev --name <migration-name>

# Apply migration to database
npx prisma migrate deploy
```

### Production Migrations
```bash
# Generate client
npx prisma generate

# Apply all pending migrations
npx prisma migrate deploy
```

## Local Development

### Start Development Server
```bash
npm run dev
```

### Access the Application
Open your browser and navigate to `http://localhost:3000`

### Default Login Credentials
- **Admin**: Email: `admin@school.edu`, Password: `admin123`
- **Teacher**: Email: `teacher@school.edu`, Password: `teacher123`
- **Parent**: Email: `parent@school.edu`, Password: `parent123`

> **Note**: These are development credentials only. Change them for production.

### Development Workflow
1. Make changes to the codebase
2. Test locally
3. Commit changes
4. Push to repository
5. Deploy to staging/production

## Production Deployment

### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Preparation
1. **Set NODE_ENV to production**
2. **Configure production database**
3. **Set up SSL certificates**
4. **Configure reverse proxy**
5. **Set up monitoring**

### Security Considerations
- Use strong, unique secrets
- Enable HTTPS
- Configure firewall rules
- Regular security updates
- Implement rate limiting
- Monitor access logs

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g nextjs && adduser -S nextjs
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@db:3306/school_information_system
    depends_on:
      - db
    volumes:
      - ./uploads:/app/public/uploads
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: school_information_system
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: always
```

### Docker Commands
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

## Cloud Platform Deployment

### Vercel
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Environment Variables**
   Configure environment variables in Vercel dashboard

### Netlify
1. **Build Static Site**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   npx netlify deploy --prod --dir=.next
   ```

### AWS EC2
1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 AMI
   - Configure security groups
   - Set up Elastic IP

2. **Setup Application**
   ```bash
   # SSH into instance
   ssh -i your-instance-ip

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
   sudo apt-get install -y nodejs

   # Clone repository
   git clone <repository-url>
   cd school-information-system

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   npm install -g pm2
   pm2 start
   ```

3. **Configure Nginx**
   - Install Nginx
   - Configure reverse proxy
   - Set up SSL certificates

### DigitalOcean App Platform
1. **Create App**
   - Choose Node.js framework
   - Select region and plan
   - Configure environment variables

2. **Deploy**
   - Connect your repository
   - Configure build settings
   - Deploy automatically

### Google Cloud Run
1. **Build Container Image**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/school-system
   ```

2. **Deploy**
   ```bash
   gcloud run deploy --image gcr.io/your-project/school-system --platform managed
   ```

## Environment Variables

### Required Variables
```env
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-secret-key"

# Application
APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Optional Variables
```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Analytics
GOOGLE_ANALYTICS_ID="your-ga-id"
```

### Environment-Specific Files
- `.env.local` - Local development
- `.env.production` - Production
- `.env.staging` - Staging

## Troubleshooting

### Database Connection Issues

#### Error: "Access denied for user 'root'@'localhost'"
**Solution:**
```bash
# Grant privileges to MySQL user
mysql -u root -p
GRANT ALL PRIVILEGES ON school_information_system.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

#### Error: "Database doesn't exist"
**Solution:**
```sql
CREATE DATABASE school_information_system;
```

#### Error: "PrismaClientUnknownRequestError"
**Solution:**
```bash
npx prisma generate
npx prisma db push
```

### Authentication Issues

#### Error: "NEXTAUTH_URL is not configured"
**Solution:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

#### Error: "Invalid NextAuth configuration"
**Solution:**
- Check NextAuth configuration in `src/lib/nextauth.ts`
- Verify all required fields are present
- Ensure adapter is properly configured

### Build Issues

#### Error: "Module not found"
**Solution:**
```bash
npm install
```

#### Error: "TypeScript errors"
**Solution:**
```bash
npm run build
```

#### Error: "Failed to compile"
**Solution:**
- Check TypeScript configuration
- Verify all imports are correct
- Fix any type errors

### Runtime Issues

#### Error: "404 Not Found"
**Solution:**
- Check file paths in components
- Verify routing configuration
- Ensure middleware is properly configured

#### Error: "500 Internal Server Error"
**Solution:**
- Check server logs
- Verify database connection
- Check environment variables

#### Error: "Database connection failed"
**Solution:**
- Verify database is running
- Check connection string
- Test database connectivity

### Performance Issues

#### Slow Database Queries
**Solution:**
- Add database indexes
- Optimize Prisma queries
- Implement query caching

#### Slow Page Load
**Solution:**
- Implement code splitting
- Optimize bundle size
- Use React.memo for expensive components

#### Memory Issues
**Solution:**
- Monitor memory usage
- Implement proper cleanup
- Optimize component re-renders

### Deployment Issues

#### Error: "Application won't start"
**Solution:**
- Check environment variables
- Verify database connection
- Check port availability

#### Error: "Database migration failed"
**Solution:**
- Check database permissions
- Verify migration compatibility
- Rollback and retry if needed

#### Error: "Static assets not loading"
**Solution:**
- Check build output
- Verify static file serving
- Configure CDN if needed

## Monitoring and Logging

### Application Monitoring
- Use application performance monitoring tools
- Set up error tracking (Sentry, etc.)
- Monitor database performance
- Track user analytics

### Logging
- Implement structured logging
- Log important system events
- Monitor authentication attempts
- Track API errors

### Health Checks
- Implement health check endpoints
- Monitor database connectivity
- Check external service status
- Set up uptime monitoring

## Backup and Recovery

### Database Backups
```bash
# Manual backup
mysqldump -u root -p school_information_system > backup.sql

# Automated backup (cron job)
0 2 * * * /usr/bin/mysqldump -u root -p school_information_system > /backups/school_system_$(date +\%Y\%m\%d).sql
```

### Application Backups
```bash
# Backup application code
tar -czf school-system-backup.tar.gz .

# Backup database
tar -czf database-backup.tar.gz .env.local
```

### Recovery Procedures
1. Restore database from backup
2. Rebuild application
3. Restore environment variables
4. Test all functionality

## Security Best Practices

### Database Security
- Use strong database passwords
- Limit database user permissions
- Enable SSL connections
- Regular security updates
- Implement database backups

### Application Security
- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting
- Monitor for vulnerabilities
- Use HTTPS in production

### Data Protection
- Implement data encryption
- Follow GDPR compliance
- Regular security audits
- Implement access controls
- Log all data access

## Maintenance

### Regular Updates
- Update dependencies monthly
- Apply security patches
- Review and update documentation
- Monitor system performance

### Database Maintenance
- Optimize database queries
- Update statistics
- Clean up old data
- Monitor disk usage

### Application Maintenance
- Review error logs
- Update content
- Test all features
- Monitor user feedback

---

This deployment guide covers the most common deployment scenarios. For additional help, check the troubleshooting section or create an issue in the repository.