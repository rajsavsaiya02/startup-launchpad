# Azure VM Alpha Deployment - Initial Setup Guide

You only need to follow these instructions **ONCE** on your Azure VM. After the server is configured, all future updates will be handled by running the `./deployment/deploy.sh` script on your Mac.

## 0. Initial Connect
Open up your terminal on your Mac and SSH into your VM using the Public IP `20.24.74.54`.

```bash
ssh azureuser@20.24.74.54
```
*(Note: Replace `azureuser` if your admin username was something else when creating the VM).*

---

## 1. Implement Memory Swap (CRITICAL for 1GB RAM)

This fixes the issue where the server crashes because of the 1GB RAM limit. We'll add 3GB of "fake RAM" on the hard drive. Paste these commands into your VM terminal:

```bash
# Create a 3 Gigabyte file
sudo dd if=/dev/zero of=/swapfile bs=1M count=3072

# Correct the permissions for security
sudo chmod 600 /swapfile

# Format it as swap memory
sudo mkswap /swapfile

# Turn the swap memory on
sudo swapon /swapfile

# Make the swap permanent across VM reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
Verify it worked by running `free -h` and looking for the "Swap" row.

---

## 2. Install System Dependencies

We need Node.js, Nginx, PostgreSQL, and PM2.

```bash
# Update Ubuntu package manager
sudo apt update && sudo apt upgrade -y

# 1. Install Nginx
sudo apt install nginx -y

# 2. Install PostgreSQL Database
sudo apt install postgresql postgresql-contrib -y

# 3. Install Node.js (Version 20 is standard)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2 globally (Server process manager)
sudo npm install -g pm2
```

---

## 3. Database Setup (PostgreSQL)

Set up a default database and user for your `startup-launchpad` backend.

```bash
# Log into the Postgres Admin shell
sudo -i -u postgres psql

# Run these commands (change 'password' to a real, secure password):
CREATE DATABASE startuplaunchpad;
CREATE USER launchadmin WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE startuplaunchpad TO launchadmin;
\q
```

---

## 4. Prepare the Folder Structure

Create the directory where your app will live and assign proper permissions.

```bash
sudo mkdir -p /var/www/startup-launchpad/client
sudo mkdir -p /var/www/startup-launchpad/server

# Give full folder ownership to your current Azure user
sudo chown -R $USER:$USER /var/www/startup-launchpad
```

---

## 5. Configure Nginx

You have a file called `nginx.conf` in your local project's `deployment` folder. You need to copy those contents into your VM's Nginx system.

```bash
# Open the Nginx config file in the terminal text editor
sudo nano /etc/nginx/sites-available/startup-launchpad
```
* **Action:** Paste everything from your Mac's `deployment/nginx.conf` into this file.
* **Save:** Press `CTRL + X`, then `Y`, then `Enter`.

```bash
# Enable the configuration by creating a symlink
sudo ln -s /etc/nginx/sites-available/startup-launchpad /etc/nginx/sites-enabled/

# Delete the default Nginx page
sudo rm /etc/nginx/sites-enabled/default

# Test the config for syntax errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx
```

---

## 6. Create the PM2 Environment (.env file)

Your backend needs to know how to talk to Postgres. Since we don't transfer `.env` files for security reasons, we must create one directly on the server.

```bash
# Navigate to the target server folder
cd /var/www/startup-launchpad/server

# Create the .env file
nano .env
```
* **Action:** Paste your backend environment variables here. Ensure your `DATABASE_URL` matches the credentials you created in Step 3. Example:
`DATABASE_URL=postgres://launchadmin:password@localhost:5432/startuplaunchpad`
`PORT=5000`
* **Save:** Press `CTRL + X`, then `Y`, then `Enter`.

---

## 7. You Are Ready!

You can now log out of the VM:
```bash
exit
```

**Next Step:** On your Mac, go back to your college project folder, and run the automated bash script!

```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```
