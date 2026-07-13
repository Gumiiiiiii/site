#!/usr/bin/env bash
# Bootstrap for the Gumi extraction API on a fresh Oracle Cloud
# "Always Free" Ubuntu ARM VM (VM.Standard.A1.Flex, Ubuntu 22.04/24.04).
#
# Usage (on the VM, as the default ubuntu user):
#   DOMAIN=api.gumi.ch REPO=https://github.com/Gumiiiiiii/site.git bash setup.sh
#
# What it does:
#   1. Installs Node 20, ffmpeg, Caddy (auto-HTTPS reverse proxy).
#   2. Clones the site repo and installs the server dependencies.
#   3. Registers a systemd service (gumi-api) on port 10000.
#   4. Registers a weekly yt-dlp self-update timer (YouTube breaks extractors
#      regularly; without this the tool degrades within weeks).
#   5. Configures Caddy to serve https://$DOMAIN -> localhost:10000.
#   6. Opens ports 80/443 in the VM's local iptables (Oracle images ship
#      restrictive rules; the OCI Security List must ALSO allow 80/443).
set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN, e.g. DOMAIN=api.gumi.ch bash setup.sh}"
REPO="${REPO:-https://github.com/Gumiiiiiii/site.git}"
APP_DIR="$HOME/gumi-site"
APP_USER="$(whoami)"

echo "== 1/6 System packages =="
sudo apt-get update -y
sudo apt-get install -y curl git ffmpeg python3 debian-keyring debian-archive-keyring apt-transport-https

if ! command -v node >/dev/null || [ "$(node -v | cut -c2-3)" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v caddy >/dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt-get update -y
    sudo apt-get install -y caddy
fi

echo "== 2/6 App checkout =="
if [ -d "$APP_DIR/.git" ]; then
    git -C "$APP_DIR" pull
else
    git clone --depth 1 "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
npm install --omit=dev --no-audit --no-fund

echo "== 3/6 systemd service =="
sudo tee /etc/systemd/system/gumi-api.service >/dev/null <<UNIT
[Unit]
Description=Gumi media extraction API
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=PORT=10000
ExecStart=$(command -v node) server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

echo "== 4/6 Weekly yt-dlp self-update =="
sudo tee /etc/systemd/system/gumi-ytdlp-update.service >/dev/null <<UNIT
[Unit]
Description=Update the bundled yt-dlp binary

[Service]
Type=oneshot
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/bin/bash -c '"$APP_DIR"/node_modules/youtube-dl-exec/bin/yt-dlp -U || true'
ExecStartPost=/usr/bin/sudo /bin/systemctl restart gumi-api.service
UNIT

sudo tee /etc/systemd/system/gumi-ytdlp-update.timer >/dev/null <<UNIT
[Unit]
Description=Weekly yt-dlp update

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
UNIT

echo "== 5/6 Caddy (auto-HTTPS) =="
# Note on X-Forwarded-For: Caddy >= 2.5 drops client-supplied X-Forwarded-*
# headers by default (no trusted_proxies configured), so the header reaching
# server.js contains only the real client IP. The rate limiter additionally
# reads the LAST entry (api/_lib/extract.cjs clientIp), so a spoofed header
# is harmless even behind an appending proxy. Keep both properties in mind
# before adding trusted_proxies here.
sudo tee /etc/caddy/Caddyfile >/dev/null <<CADDY
$DOMAIN {
    reverse_proxy localhost:10000
}
CADDY

echo "== 6/6 Firewall + start everything =="
# Oracle's Ubuntu images ship a restrictive iptables INPUT chain whose last
# rule REJECTs everything, so new ACCEPTs must be INSERTED ABOVE it (a plain
# append lands after the reject and does nothing). Insert at position 4,
# just before the existing SSH/reject rules. The OCI Security List must ALSO
# allow 80/443 (configured in the console / via the API).
sudo iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 4 -p tcp --dport 80 -j ACCEPT
sudo iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || sudo iptables -I INPUT 4 -p tcp --dport 443 -j ACCEPT
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent >/dev/null 2>&1 || true
sudo netfilter-persistent save 2>/dev/null || true

sudo systemctl daemon-reload
sudo systemctl enable --now gumi-api.service
sudo systemctl enable --now gumi-ytdlp-update.timer
sudo systemctl restart caddy

echo ""
echo "Done. Checks:"
echo "  curl -s http://localhost:10000/health          # local API"
echo "  curl -s https://$DOMAIN/health                 # through Caddy (needs DNS to point here first)"
