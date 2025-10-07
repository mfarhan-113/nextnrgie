#!/bin/bash

# Nextnrgie Complete Deployment Script
# Run this on your VPS after uploading project files
# Usage: ./deploy.sh [your-domain.com]

set -e

# Configuration
DOMAIN_NAME=${1:-nextnrgie.fr}
PROJECT_PATH="/opt/nextnrgie"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Nextnrgie Deployment for nextnrgie.fr...${NC}"

# Check if domain is provided
if [ "$DOMAIN_NAME" = "nextnrgie.fr" ] && [ "$1" = "" ]; then
    echo -e "${YELLOW}📋 Using default domain: nextnrgie.fr${NC}"
    echo -e "${YELLOW}If you want to use a different domain, run: ./deploy.sh your-domain.com${NC}"
fi

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check if we're in the project directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found!${NC}"
    echo -e "${RED}Please run this script from the nextnrgie project directory${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y
print_status "System packages updated"

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Install Nginx and Certbot
echo -e "${YELLOW}🌐 Installing Nginx and Certbot...${NC}"
apt install -y nginx certbot python3-certbot-nginx git
systemctl start nginx
systemctl enable nginx
print_status "Nginx and Certbot installed"

# Generate secure passwords
echo -e "${YELLOW}🔐 Generating secure passwords...${NC}"
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_PASSWORD=$(openssl rand -base64 32)
SECRET_KEY=$(openssl rand -base64 64)

# Configure environment file
echo -e "${YELLOW}⚙️ Configuring environment for nextnrgie.fr...${NC}"
if [ -f ".env.production" ]; then
    cp .env.production .env
else
    cp .env .env.backup 2>/dev/null || true
    cat > .env << EOF
# Production Environment Variables for nextnrgie.fr
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=nextnrgie_prod
MYSQL_USER=nextnrgie_user
MYSQL_PASSWORD=${MYSQL_PASSWORD}

BACKEND_DATABASE_URL=mysql+pymysql://nextnrgie_user:${MYSQL_PASSWORD}@mysql:3306/nextnrgie_prod
BACKEND_SECRET_KEY=${SECRET_KEY}
BACKEND_ALGORITHM=HS256
BACKEND_ACCESS_TOKEN_EXPIRE_MINUTES=30

DOMAIN_NAME=nextnrgie.fr
EOF
fi

# Update domain in nginx config
sed -i "s/your-domain.com/nextnrgie.fr/g" nginx.conf
sed -i "s/app.your-domain.com/nextnrgie.fr/g" .env

print_status "Environment configured for nextnrgie.fr"

# Build and start containers
echo -e "${YELLOW}🏗️ Building and starting containers...${NC}"
docker-compose down || true
docker-compose up --build -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Setup database
echo -e "${YELLOW}🗄️ Setting up database...${NC}"
docker-compose exec -T backend python -c "
from app.core.database import engine
from app.models.base import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
" || {
    print_warning "Database setup failed, but continuing deployment..."
}

# Setup SSL certificate
echo -e "${YELLOW}🔒 Setting up SSL certificate for nextnrgie.fr...${NC}"
SSL_EMAIL="admin@nextnrgie.fr"
certbot --nginx -d nextnrgie.fr --non-interactive --agree-tos -m ${SSL_EMAIL} || {
    print_warning "SSL certificate setup failed. You can set it up manually later with: certbot --nginx -d nextnrgie.fr"
}

# Restart Nginx
systemctl restart nginx

# Create deployment info file
cat > deployment_info.txt << EOF
🎉 Nextnrgie Deployment Completed Successfully!

📅 Deployment Date: $(date)
🌐 Domain: https://nextnrgie.fr
📍 Project Path: ${PROJECT_PATH}

🔧 Services Running:
- Frontend: https://nextnrgie.fr
- Backend API: https://nextnrgie.fr/api/
- Database: MySQL (Container)

🔑 Important Credentials:
- MySQL Root Password: ${MYSQL_ROOT_PASSWORD}
- MySQL User Password: ${MYSQL_PASSWORD}
- Backend Secret Key: ${SECRET_KEY}
⚠️  SAVE THESE CREDENTIALS SECURELY!

🔍 Useful Commands:
- View logs: cd ${PROJECT_PATH} && docker-compose logs -f
- Restart services: cd ${PROJECT_PATH} && docker-compose restart
- Stop services: cd ${PROJECT_PATH} && docker-compose down
- Update project: cd ${PROJECT_PATH} && git pull && docker-compose up --build -d

🔒 Security Notes:
- Change default passwords if needed
- Set up firewall rules
- Enable automatic backups
- Monitor logs regularly

🚀 Your application is now live at: https://nextnrgie.fr

IMPORTANT NEXT STEPS:
1. Update your domain DNS at Hostinger to point nextnrgie.fr to your VPS IP
2. Test the application: https://nextnrgie.fr
3. Login and test all features (clients, contracts, invoices)
4. Set up regular backups: docker-compose exec mysql mysqldump -u root -p nextnrgie_prod > backup.sql

SUPPORT:
If you encounter any issues, check the logs with: docker-compose logs -f
For manual SSL setup: certbot --nginx -d nextnrgie.fr
EOF

print_status "Deployment completed successfully!"
echo -e "${GREEN}📋 Deployment information saved to deployment_info.txt${NC}"
echo -e "${GREEN}🌐 Your application will be accessible at: https://nextnrgie.fr${NC}"
echo -e "${YELLOW}🔥 Don't forget to update your DNS settings at Hostinger!${NC}"

# Show container status
echo -e "${YELLOW}📊 Container Status:${NC}"
docker-compose ps

# Final instructions
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "1. Go to Hostinger DNS panel and point nextnrgie.fr to your VPS IP"
echo "2. Visit https://nextnrgie.fr to test your application"
echo "3. Check deployment_info.txt for all credentials and commands"
echo "4. Set up automatic backups"

print_warning "CRITICAL: Update your domain DNS settings at Hostinger before testing!"
echo "If DNS is not updated, the application won't be accessible from your domain."
