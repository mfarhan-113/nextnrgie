#!/bin/bash

# Setup script for Nextnrgie project

echo "Setting up environment variables for Nextnrgie..."

# Backend environment variables
export DATABASE_URL="mysql+pymysql://root:@localhost/nextnrgie?charset=utf8mb4"
export SECRET_KEY="your_super_secret_key_change_this_in_production"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="30"

echo "Environment variables set!"
echo "DATABASE_URL: $DATABASE_URL"
echo "SECRET_KEY: $SECRET_KEY"

echo "Database setup completed!"
echo "You can now run the backend with: cd backend && python -m uvicorn app.main:app --reload"
echo "And frontend with: cd frontend && npm start"
