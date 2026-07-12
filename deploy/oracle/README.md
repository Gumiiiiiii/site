# Media extraction API on Oracle Cloud (Always Free)

Goal: replace the Render free instance (30–60 s cold starts) with an
Oracle Cloud **Always Free** VM that never sleeps and costs 0€/month,
forever.

> **Live deployment (2026-07-12):** provisioned on an AMD `VM.Standard.E2.1.Micro`
> (1 OCPU / 1 GB + 2 GB swap) in `eu-paris-1`, because the free ARM
> `A1.Flex` shape was out of host capacity in the region (a well-known,
> intermittent Oracle limitation — retry later if you want the beefier ARM
> box). The API is served over HTTPS at
> `https://<VM-IP>.sslip.io` via Caddy (auto Let's Encrypt), which needs no
> DNS record. The frontend calls it first, with Vercel and Render as
> fallbacks. See the automation transcript / `deploy/oracle/setup.sh`.

The notes below describe the from-scratch manual path (ARM variant).

> Heads-up: account signup requires a credit card for identity
> verification. Always Free resources are never billed — the card is not
> charged as long as you stay on Always Free shapes (this setup does).

## 1. Create the account

1. <https://signup.oraclecloud.com> → sign up.
2. **Home region matters and cannot be changed later.** Pick one close to
   your audience (e.g. `France Central (Paris)` or `Germany Central
   (Frankfurt)`). ARM capacity availability varies by region; Frankfurt
   and Paris are usually fine.

## 2. Create the VM

Console → Compute → Instances → **Create instance**:

- **Image**: Ubuntu 24.04 (or 22.04), *aarch64*.
- **Shape**: `VM.Standard.A1.Flex` — 2 OCPU / 12 GB is plenty and stays
  well inside the Always Free budget (4 OCPU / 24 GB total).
  - If creation fails with "Out of capacity", retry later or try another
    availability domain — it's a known ARM quirk, not a billing issue.
- **SSH keys**: upload your public key (`type $env:USERPROFILE\.ssh\id_ed25519.pub`
  on Windows; generate with `ssh-keygen -t ed25519` if you don't have one).
- Leave the default VCN/subnet with a **public IPv4 address**.

## 3. Open ports 80 + 443 in the Security List

Console → Networking → Virtual cloud networks → your VCN → Security Lists
→ Default Security List → **Add Ingress Rules**:

| Source CIDR | Protocol | Destination port |
| ----------- | -------- | ---------------- |
| 0.0.0.0/0   | TCP      | 80               |
| 0.0.0.0/0   | TCP      | 443              |

(Port 22 is already open by default.)

## 4. Point DNS at the VM

At your registrar, add an A record:

```
api.gumi.ch  →  <VM public IP>
```

## 5. Run the setup script

```bash
ssh ubuntu@<VM public IP>
curl -fsSL https://raw.githubusercontent.com/Gumiiiiiii/site/main/deploy/oracle/setup.sh -o setup.sh
DOMAIN=api.gumi.ch bash setup.sh
```

The script installs Node 20, ffmpeg and Caddy, clones this repo, registers
the `gumi-api` systemd service (port 10000), a **weekly yt-dlp
self-update** (important: YouTube regularly breaks extractors), and
configures Caddy to serve `https://api.gumi.ch` with an automatic
Let's Encrypt certificate.

Verify:

```bash
curl -s http://localhost:10000/health   # → {"ok":true}
curl -s https://api.gumi.ch/health      # → {"ok":true} (after DNS propagates)
```

## 6. Switch the frontend

In `scripts/tool-media-downloader.js`, add the new endpoint as the first
non-local candidate in `getApiCandidates()`:

```js
candidates.push('https://api.gumi.ch/api/get-video');
```

(before the `/api/get-video` and Render entries — they stay as fallbacks).
Push to deploy. Once you're happy, the Render service can be deleted.

## 7. Optional but recommended

- Free uptime monitor (UptimeRobot or similar) on
  `https://api.gumi.ch/health` — alerts you if the VM or service dies.
- OS updates: `sudo apt update && sudo apt upgrade -y` once in a while,
  or enable `unattended-upgrades` (`sudo dpkg-reconfigure -plow unattended-upgrades`).

## Day-2 operations cheat sheet

```bash
sudo systemctl status gumi-api          # service state
sudo journalctl -u gumi-api -n 50       # recent logs
sudo systemctl restart gumi-api         # restart after changes
cd ~/gumi-site && git pull && npm install --omit=dev && sudo systemctl restart gumi-api   # deploy update
sudo systemctl list-timers | grep ytdlp # check the weekly updater
```
