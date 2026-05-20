# 🚀 Deployment Guide - LDP Vault

This guide explains how to deploy the LDP Logistics Password Manager to a Linux server using Docker.

## 1. Prerequisites
- A Linux server (Ubuntu 22.04+ recommended)
- **Docker** and **Docker Compose** installed
- A domain name (optional, for SSL)

## 2. Server Setup

### Clone the Repository
```bash
git clone https://github.com/Arbaz2219/LDP-Vault.git
cd LDP-Vault
```

### Configure Environment Variables
Create a `.env` file in the root folder:
```env
JWT_SECRET="your-super-secret-key"
FRONTEND_DOMAIN="vault.yourdomain.com"
API_DOMAIN="api-vault.yourdomain.com"
```

## 3. Launch the Application
Run the following command to build and start all services:
```bash
docker-compose up -d --build
```
Traefik will automatically detect the labels and provision SSL certificates via Let's Encrypt.

## 4. Initialize the Database
Once the containers are running, you need to run migrations and seed the super admin:

### Run Migrations
```bash
docker exec -it ldp_Vault_backend npx prisma migrate deploy
```

### Seed Super Admin
```bash
docker exec -it ldp_Vault_backend npm run seed
```

## 5. Accessing the Vault
- **Frontend**: `http://your-server-ip`
- **Backend API**: `http://your-server-ip:5000`
- **Super Admin**: `help-desk@ldplogistics.com` / `123456`

## 6. SSL / HTTPS (Recommended)
To secure your vault, it is highly recommended to use **Nginx** with **Certbot** as a reverse proxy.

### Sample Nginx Config:
```nginx
server {
    server_name vault.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
    }
}
```
