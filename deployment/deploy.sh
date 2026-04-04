#!/bin/bash

# ==============================================================================
# Startup-LaunchPad - Automated Deployment Script (Option B)
#
# Usage:
#   Make the script executable: chmod +x deployment/deploy.sh
#   Run the deployment: ./deployment/deploy.sh
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# ================================ CONFIGURATION ===============================
# TODO: Update these variables with your actual Azure VM details.
# If you are using an SSH key, uncomment and set the path to your key.

SERVER_IP="20.24.74.54"
SERVER_USERNAME="azureuser" # REPLACE with your actual Azure username
# SSH_KEY_PATH="~/.ssh/my_azure_key.pem" # UNCOMMENT if using an SSH Key file

REMOTE_DEPLOY_DIR="/var/www/startup-launchpad"

# If using SSH Key, we build the SSH command, otherwise use default
if [ -z "$SSH_KEY_PATH" ]; then
    SSH_CMD="ssh ${SERVER_USERNAME}@${SERVER_IP}"
    RSYNC_SSH="-e ssh"
else
    SSH_CMD="ssh -i ${SSH_KEY_PATH} ${SERVER_USERNAME}@${SERVER_IP}"
    RSYNC_SSH="-e 'ssh -i ${SSH_KEY_PATH}'"
fi
# ==============================================================================

echo "🚀 Starting Deployment Pipeline for VM: $SERVER_IP"

# ------------------------------------------------------------------------------
# STEP 1: Local Frontend Build
# ------------------------------------------------------------------------------
echo "📦 1/4: Building the React frontend locally..."
cd client
npm install
npm run build
cd ..
echo "✅ Frontend build completed."

# ------------------------------------------------------------------------------
# STEP 2: Transferring Frontend Files
# ------------------------------------------------------------------------------
echo "🚚 2/4: Transferring 'client/dist' to the server..."
# Create the target directory on the remote server (if it doesn't exist)
$SSH_CMD "mkdir -p ${REMOTE_DEPLOY_DIR}/client"

# Sync the dist folder using rsync
rsync -avz --delete ${RSYNC_SSH} ./client/dist/ ${SERVER_USERNAME}@${SERVER_IP}:${REMOTE_DEPLOY_DIR}/client/
echo "✅ Frontend files transferred."

# ------------------------------------------------------------------------------
# STEP 3: Transferring Backend Files
# ------------------------------------------------------------------------------
echo "🚚 3/4: Transferring 'server' payload to the server..."
$SSH_CMD "mkdir -p ${REMOTE_DEPLOY_DIR}/server"

# Sync the server folder excluding node_modules to avoid massive network loads and OS incompatibility
rsync -avz --delete ${RSYNC_SSH} \
    --exclude 'node_modules' \
    --exclude '.env' \
    ./server/ ${SERVER_USERNAME}@${SERVER_IP}:${REMOTE_DEPLOY_DIR}/server/
echo "✅ Backend files transferred."

# ------------------------------------------------------------------------------
# STEP 4: Remote Server Restart & NPM Install
# ------------------------------------------------------------------------------
echo "🔄 4/4: Installing backend dependencies and restarting..."
$SSH_CMD "cd ${REMOTE_DEPLOY_DIR}/server && npm install --omit=dev && pm2 restart startup-launchpad || pm2 start src/index.js --name startup-launchpad"
echo "✅ Backend restarted."

# ------------------------------------------------------------------------------
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "You can check the live site at http://${SERVER_IP}"
