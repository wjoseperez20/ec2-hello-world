#!/usr/bin/env bash
# EC2 UserData bootstrap script — runs once as root on first boot
# Ubuntu 24.04 LTS
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_USER="ubuntu"
APP_DIR="/home/${APP_USER}/ec2-hello-world"
REPO_URL="https://github.com/wjoseperez20/ec2-hello-world"
NODE_VERSION="24"

# ── System packages ───────────────────────────────────────────────────────────
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y git nginx curl

# ── Install nvm + Node.js + PM2 as the app user ───────────────────────────────
sudo -u "${APP_USER}" bash <<USERSCRIPT
  set -euo pipefail
  export NVM_DIR="\$HOME/.nvm"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  source "\$NVM_DIR/nvm.sh"
  nvm install ${NODE_VERSION}
  nvm alias default ${NODE_VERSION}
  nvm use default
  npm install -g pm2
USERSCRIPT

# ── Clone the repository ──────────────────────────────────────────────────────
if [ ! -d "${APP_DIR}/.git" ]; then
  sudo -u "${APP_USER}" git clone "${REPO_URL}" "${APP_DIR}"
fi

# ── Create log directory ──────────────────────────────────────────────────────
sudo -u "${APP_USER}" mkdir -p "/home/${APP_USER}/logs"

# ── Initial app build ─────────────────────────────────────────────────────────
sudo -u "${APP_USER}" bash <<USERSCRIPT
  set -euo pipefail
  export NVM_DIR="\$HOME/.nvm"
  source "\$NVM_DIR/nvm.sh"
  cd "${APP_DIR}"
  npm ci --omit=dev
  npm run build
  pm2 start ecosystem.config.js --env production
  pm2 save
USERSCRIPT

# ── Register PM2 to start on reboot ──────────────────────────────────────────
# pm2 startup generates a sudo command — run it as root
sudo -u "${APP_USER}" bash -c "
  export NVM_DIR=\"\$HOME/.nvm\"
  source \"\$NVM_DIR/nvm.sh\"
  pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
" | tail -1 | bash

# ── Nginx ─────────────────────────────────────────────────────────────────────
cp "${APP_DIR}/nginx/ec2-hello-world.conf" /etc/nginx/sites-available/ec2-hello-world
ln -sf /etc/nginx/sites-available/ec2-hello-world /etc/nginx/sites-enabled/ec2-hello-world
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl start nginx

echo "Bootstrap complete — app running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
