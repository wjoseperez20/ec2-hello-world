#!/usr/bin/env bash
set -euo pipefail

# ── Configuration — edit these before running ──────────────────────────────
EC2_USER="ubuntu"
EC2_HOST="ec2-52-36-20-40.us-west-2.compute.amazonaws.com"
EC2_KEY="/Users/wjose/Documents/Personal/aws/hello-world-ec2.pem"
REMOTE_DIR="/home/ubuntu/ec2-hello-world"
APP_PORT="3000"
# ───────────────────────────────────────────────────────────────────────────

echo "==> Building Next.js app locally..."
npm run build

echo "==> Syncing files to EC2 (${EC2_USER}@${EC2_HOST})..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .next/cache \
  -e "ssh -i ${EC2_KEY} -o StrictHostKeyChecking=no" \
  . "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}"

echo "==> Installing dependencies and restarting app on EC2..."
ssh -i "${EC2_KEY}" -o StrictHostKeyChecking=no \
  "${EC2_USER}@${EC2_HOST}" bash <<REMOTE
    set -euo pipefail
    cd "${REMOTE_DIR}"
    export NVM_DIR="\$HOME/.nvm"
    [ -s "\$NVM_DIR/nvm.sh" ] && source "\$NVM_DIR/nvm.sh"
    nvm use 24 || nvm install 24
    npm ci --omit=dev
    if command -v pm2 &>/dev/null; then
      pm2 restart ec2-hello-world 2>/dev/null || \
        pm2 start npm --name ec2-hello-world -- start -- -p ${APP_PORT}
    else
      nohup npm start -- -p ${APP_PORT} &>/tmp/next.log &
      echo "App started on port ${APP_PORT} (PID \$!)"
    fi
REMOTE

echo "==> Done. App running at http://${EC2_HOST}:${APP_PORT}"
