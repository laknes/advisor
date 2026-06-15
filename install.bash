#!/usr/bin/env bash
set -Eeuo pipefail

# Portfolio Advisor production installer for Ubuntu/Debian servers.
# It installs Node.js, PostgreSQL, Nginx, Certbot, configures the database,
# writes production env files, builds the Next.js app, creates a systemd
# service, and optionally provisions HTTPS for a domain.

APP_NAME="portfolio-advisor"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_USER="${SUDO_USER:-$(id -un)}"
DOMAIN=""
LETSENCRYPT_EMAIL=""
ADMIN_EMAILS="admin@advisor.com"
PORT="3000"
DB_NAME="portfolio_advisor"
DB_USER="portfolio_advisor"
DB_PASS=""
SKIP_SSL="false"
SKIP_NGINX="false"
NON_INTERACTIVE="false"

log() {
  printf '\033[1;35m[install]\033[0m %s\n' "$*"
}

warn() {
  printf '\033[1;33m[warn]\033[0m %s\n' "$*"
}

die() {
  printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<'EOF'
Usage:
  sudo bash install.bash --domain example.com --email admin@example.com --admin-emails admin@example.com

Options:
  --domain DOMAIN             Domain for Nginx and SSL, e.g. advisor.example.com
  --email EMAIL               Let's Encrypt email address
  --admin-emails LIST         Comma-separated admin emails for ADMIN_EMAILS
  --app-dir PATH              App directory. Defaults to directory containing install.bash
  --app-user USER             Linux user that runs the app. Defaults to SUDO_USER/current user
  --port PORT                 Local Next.js port. Default: 3000
  --db-name NAME              PostgreSQL database name. Default: portfolio_advisor
  --db-user USER              PostgreSQL app user. Default: portfolio_advisor
  --db-pass PASSWORD          PostgreSQL password. Auto-generated if omitted
  --skip-ssl                  Configure Nginx without Certbot SSL
  --skip-nginx                Do not install/configure Nginx/Certbot
  --non-interactive           Never prompt; fail if required inputs are missing
  -h, --help                  Show this help

Environment overrides:
  DOMAIN, LETSENCRYPT_EMAIL, ADMIN_EMAILS, PORT, DB_NAME, DB_USER, DB_PASS
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:?Missing value for --domain}"; shift 2 ;;
    --email) LETSENCRYPT_EMAIL="${2:?Missing value for --email}"; shift 2 ;;
    --admin-emails) ADMIN_EMAILS="${2:?Missing value for --admin-emails}"; shift 2 ;;
    --app-dir) APP_DIR="${2:?Missing value for --app-dir}"; shift 2 ;;
    --app-user) APP_USER="${2:?Missing value for --app-user}"; shift 2 ;;
    --port) PORT="${2:?Missing value for --port}"; shift 2 ;;
    --db-name) DB_NAME="${2:?Missing value for --db-name}"; shift 2 ;;
    --db-user) DB_USER="${2:?Missing value for --db-user}"; shift 2 ;;
    --db-pass) DB_PASS="${2:?Missing value for --db-pass}"; shift 2 ;;
    --skip-ssl) SKIP_SSL="true"; shift ;;
    --skip-nginx) SKIP_NGINX="true"; shift ;;
    --non-interactive) NON_INTERACTIVE="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

DOMAIN="${DOMAIN:-${INSTALL_DOMAIN:-}}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-${INSTALL_EMAIL:-}}"
ADMIN_EMAILS="${ADMIN_EMAILS:-${INSTALL_ADMIN_EMAILS:-admin@advisor.com}}"
PORT="${PORT:-${INSTALL_PORT:-3000}}"
DB_NAME="${DB_NAME:-${INSTALL_DB_NAME:-portfolio_advisor}}"
DB_USER="${DB_USER:-${INSTALL_DB_USER:-portfolio_advisor}}"
DB_PASS="${DB_PASS:-${INSTALL_DB_PASS:-}}"

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    die "Run this installer with sudo/root."
  fi
}

prompt_if_needed() {
  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    return
  fi

  if [[ -z "$DOMAIN" ]]; then
    read -r -p "Domain for this app (leave empty to skip Nginx domain setup): " DOMAIN
  fi

  if [[ -n "$DOMAIN" && "$SKIP_SSL" != "true" && -z "$LETSENCRYPT_EMAIL" ]]; then
    read -r -p "Email for Let's Encrypt SSL certificates: " LETSENCRYPT_EMAIL
  fi

  if [[ "$ADMIN_EMAILS" == "admin@advisor.com" ]]; then
    read -r -p "Admin email(s), comma-separated [admin@advisor.com]: " input_admins
    ADMIN_EMAILS="${input_admins:-$ADMIN_EMAILS}"
  fi
}

validate_inputs() {
  [[ -d "$APP_DIR" ]] || die "App directory does not exist: $APP_DIR"
  [[ -f "$APP_DIR/package.json" ]] || die "package.json not found in $APP_DIR"
  [[ -f "$APP_DIR/prisma/schema.prisma" ]] || die "prisma/schema.prisma not found in $APP_DIR"

  if [[ "$NON_INTERACTIVE" == "true" && "$SKIP_NGINX" != "true" && -z "$DOMAIN" ]]; then
    die "--domain is required in --non-interactive mode unless --skip-nginx is set."
  fi

  if [[ -n "$DOMAIN" && "$SKIP_SSL" != "true" && -z "$LETSENCRYPT_EMAIL" ]]; then
    die "--email is required when SSL is enabled."
  fi
}

random_secret() {
  openssl rand -base64 48 | tr -d '\n'
}

random_db_password() {
  openssl rand -base64 30 | tr -dc 'A-Za-z0-9_@%+=' | head -c 28
}

install_system_packages() {
  log "Installing system packages"
  apt-get update
  apt-get install -y ca-certificates curl gnupg openssl build-essential postgresql postgresql-contrib

  if [[ "$SKIP_NGINX" != "true" ]]; then
    apt-get install -y nginx certbot python3-certbot-nginx
  fi
}

install_nodejs() {
  if command -v node >/dev/null 2>&1; then
    local major
    major="$(node -v | sed 's/^v//' | cut -d. -f1)"
    if [[ "$major" -ge 18 ]]; then
      log "Node.js $(node -v) already installed"
      return
    fi
  fi

  log "Installing Node.js 20 LTS"
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
}

setup_postgres() {
  log "Configuring PostgreSQL database"
  systemctl enable --now postgresql

  if [[ -z "$DB_PASS" ]]; then
    DB_PASS="$(random_db_password)"
  fi

  local escaped_pass
  escaped_pass="${DB_PASS//\'/\'\'}"

  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE "${DB_USER}" LOGIN PASSWORD '${escaped_pass}';
  ELSE
    ALTER ROLE "${DB_USER}" WITH LOGIN PASSWORD '${escaped_pass}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${DB_NAME}" OWNER "${DB_USER}"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME}" TO "${DB_USER}";
SQL
}

write_env_files() {
  log "Writing production environment files"

  local base_url
  if [[ -n "$DOMAIN" ]]; then
    if [[ "$SKIP_SSL" == "true" ]]; then
      base_url="http://${DOMAIN}"
    else
      base_url="https://${DOMAIN}"
    fi
  else
    base_url="http://localhost:${PORT}"
  fi

  local nextauth_secret jwt_secret database_url
  nextauth_secret="$(random_secret)"
  jwt_secret="$(random_secret)"
  database_url="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

  umask 077
  cat > "${APP_DIR}/.env.production" <<EOF
DATABASE_URL=${database_url}
NEXTAUTH_URL=${base_url}
NEXTAUTH_SECRET=${nextauth_secret}
JWT_SECRET=${jwt_secret}
JWT_EXPIRY=7d
ADMIN_EMAILS=${ADMIN_EMAILS}
NEXT_PUBLIC_API_URL=${base_url}/api
NODE_ENV=production
PORT=${PORT}

STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EOF

  cp "${APP_DIR}/.env.production" "${APP_DIR}/.env.local"
  chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env.production" "${APP_DIR}/.env.local" || true
}

install_app_dependencies() {
  log "Installing Node dependencies"
  cd "$APP_DIR"
  if [[ -f package-lock.json ]]; then
    sudo -u "$APP_USER" npm ci
  else
    sudo -u "$APP_USER" npm install
  fi
}

setup_prisma() {
  log "Generating Prisma client and applying schema"
  cd "$APP_DIR"
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env.production"
  set +a

  sudo -u "$APP_USER" npx prisma generate

  if [[ -d "$APP_DIR/prisma/migrations" ]] && find "$APP_DIR/prisma/migrations" -mindepth 1 -maxdepth 1 -type d | grep -q .; then
    sudo -u "$APP_USER" npx prisma migrate deploy
  else
    warn "No Prisma migrations found. Using prisma db push for first deployment."
    sudo -u "$APP_USER" npx prisma db push
  fi
}

build_app() {
  log "Building Next.js app"
  cd "$APP_DIR"
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env.production"
  set +a
  sudo -u "$APP_USER" npm run build
}

create_systemd_service() {
  log "Creating systemd service"
  cat > "/etc/systemd/system/${APP_NAME}.service" <<EOF
[Unit]
Description=Portfolio Advisor Next.js app
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env.production
ExecStart=/usr/bin/npm run start -- -p ${PORT}
Restart=always
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${APP_NAME}"
  systemctl restart "${APP_NAME}"
}

configure_nginx() {
  if [[ "$SKIP_NGINX" == "true" || -z "$DOMAIN" ]]; then
    warn "Skipping Nginx configuration"
    return
  fi

  log "Configuring Nginx reverse proxy for ${DOMAIN}"
  cat > "/etc/nginx/sites-available/${APP_NAME}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  ln -sfn "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/${APP_NAME}"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx
}

configure_ssl() {
  if [[ "$SKIP_NGINX" == "true" || "$SKIP_SSL" == "true" || -z "$DOMAIN" ]]; then
    warn "Skipping SSL configuration"
    return
  fi

  log "Requesting Let's Encrypt certificate for ${DOMAIN}"
  certbot --nginx --non-interactive --agree-tos \
    --email "$LETSENCRYPT_EMAIL" \
    -d "$DOMAIN" \
    --redirect
}

configure_firewall() {
  if command -v ufw >/dev/null 2>&1; then
    log "Configuring UFW firewall if active"
    ufw allow OpenSSH >/dev/null || true
    if [[ "$SKIP_NGINX" != "true" ]]; then
      ufw allow 'Nginx Full' >/dev/null || true
    else
      ufw allow "${PORT}/tcp" >/dev/null || true
    fi
  fi
}

health_check() {
  log "Running local health check"
  sleep 5
  if curl -fsS "http://127.0.0.1:${PORT}/fa" >/dev/null; then
    log "Local app health check passed"
  else
    warn "Local app health check failed. Inspect logs with: journalctl -u ${APP_NAME} -f"
  fi
}

print_summary() {
  local public_url
  if [[ -n "$DOMAIN" ]]; then
    public_url="http://${DOMAIN}"
    [[ "$SKIP_SSL" != "true" ]] && public_url="https://${DOMAIN}"
  else
    public_url="http://SERVER_IP:${PORT}"
  fi

  cat <<EOF

Installation complete.

App service:
  systemctl status ${APP_NAME}
  journalctl -u ${APP_NAME} -f

Application:
  ${public_url}/fa
  ${public_url}/fa/dashboard
  ${public_url}/fa/admin
  ${public_url}/api/markets

Database:
  name: ${DB_NAME}
  user: ${DB_USER}

Admin emails:
  ${ADMIN_EMAILS}

Environment files:
  ${APP_DIR}/.env.production
  ${APP_DIR}/.env.local

EOF
}

main() {
  require_root
  prompt_if_needed
  validate_inputs

  log "Starting full production installation"
  log "App directory: ${APP_DIR}"
  log "App user: ${APP_USER}"

  install_system_packages
  install_nodejs
  setup_postgres
  write_env_files
  install_app_dependencies
  setup_prisma
  build_app
  create_systemd_service
  configure_nginx
  configure_ssl
  configure_firewall
  health_check
  print_summary
}

main "$@"
