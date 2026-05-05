# 🚀 Deployment Guide - LDP Bitwarden

This guide explains how to deploy the LDP Logistics Password Manager to a Linux server using Docker.

## 1. Prerequisites
- A Linux server (Ubuntu 22.04+ recommended)
- **Docker** and **Docker Compose** installed
- A domain name (optional, for SSL)

## 2. Server Setup

### Clone the Repository
```bash
git clone https://github.com/Arbaz2219/Bit-looker.git
cd Bit-looker
```

### Configure Environment Variables
Create a `.env` file in the `backend` folder:
```bash
nano backend/.env
```
Add the following:
```env
DATABASE_URL="postgresql://postgres:password@db:5432/ldp_bitwarden"
JWT_SECRET="generate-a-strong-secret-key"
PORT=5000
```

## 3. Launch the Application
Run the following command to build and start all services:
```bash
docker-compose up -d --build
```

## 4. Initialize the Database
Once the containers are running, you need to run migrations and seed the super admin:

### Run Migrations
```bash
docker exec -it ldp_bitwarden_backend npx prisma migrate deploy
```

### Seed Super Admin
```bash
docker exec -it ldp_bitwarden_backend npm run seed
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
