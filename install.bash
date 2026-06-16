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
APP_BASE_URL=""
LETSENCRYPT_EMAIL=""
ADMIN_EMAIL=""
ADMIN_NAME="مدیر سیستم"
ADMIN_PASSWORD=""
ADMIN_EMAILS=""
PORT="3000"
DATABASE_URL=""
DB_NAME="portfolio_advisor"
DB_USER="portfolio_advisor"
DB_PASS=""
STRIPE_PUBLIC_KEY=""
STRIPE_SECRET_KEY=""
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
SKIP_SSL="false"
SKIP_NGINX="false"
NON_INTERACTIVE="false"
MANAGED_POSTGRES="false"

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
  sudo bash install.bash --domain example.com --email ops@example.com --admin-email admin@example.com

Options:
  --domain DOMAIN             Domain for Nginx and SSL, e.g. advisor.example.com
  --base-url URL              Public app URL for NEXTAUTH_URL. Auto-derived from domain if omitted
  --email EMAIL               Let's Encrypt email address
  --admin-email EMAIL         Initial admin login email
  --admin-password PASSWORD   Initial admin login password. Prompted securely if omitted
  --admin-name NAME           Initial admin display name. Default: مدیر سیستم
  --admin-emails LIST         Optional comma-separated extra admin emails; admin-email is always included
  --app-dir PATH              App directory. Defaults to directory containing install.bash
  --app-user USER             Linux user that runs the app. Defaults to SUDO_USER/current user
  --port PORT                 Local Next.js port. Default: 3000
  --database-url URL          Existing PostgreSQL DATABASE_URL. If omitted, installer creates local PostgreSQL
  --db-name NAME              PostgreSQL database name. Default: portfolio_advisor
  --db-user USER              PostgreSQL app user. Default: portfolio_advisor
  --db-pass PASSWORD          PostgreSQL password. Auto-generated if omitted
  --stripe-public-key KEY     Optional Stripe publishable key
  --stripe-secret-key KEY     Optional Stripe secret key
  --smtp-host HOST            Optional SMTP host
  --smtp-port PORT            Optional SMTP port
  --smtp-user USER            Optional SMTP username
  --smtp-pass PASSWORD        Optional SMTP password
  --skip-ssl                  Configure Nginx without Certbot SSL
  --skip-nginx                Do not install/configure Nginx/Certbot
  --non-interactive           Never prompt; fail if required inputs are missing
  -h, --help                  Show this help

Environment overrides:
  DOMAIN, APP_BASE_URL, LETSENCRYPT_EMAIL, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_EMAILS,
  PORT, DATABASE_URL, DB_NAME, DB_USER, DB_PASS, STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY,
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:?Missing value for --domain}"; shift 2 ;;
    --base-url) APP_BASE_URL="${2:?Missing value for --base-url}"; shift 2 ;;
    --email) LETSENCRYPT_EMAIL="${2:?Missing value for --email}"; shift 2 ;;
    --admin-email) ADMIN_EMAIL="${2:?Missing value for --admin-email}"; shift 2 ;;
    --admin-password) ADMIN_PASSWORD="${2:?Missing value for --admin-password}"; shift 2 ;;
    --admin-name) ADMIN_NAME="${2:?Missing value for --admin-name}"; shift 2 ;;
    --admin-emails) ADMIN_EMAILS="${2:?Missing value for --admin-emails}"; shift 2 ;;
    --app-dir) APP_DIR="${2:?Missing value for --app-dir}"; shift 2 ;;
    --app-user) APP_USER="${2:?Missing value for --app-user}"; shift 2 ;;
    --port) PORT="${2:?Missing value for --port}"; shift 2 ;;
    --database-url) DATABASE_URL="${2:?Missing value for --database-url}"; shift 2 ;;
    --db-name) DB_NAME="${2:?Missing value for --db-name}"; shift 2 ;;
    --db-user) DB_USER="${2:?Missing value for --db-user}"; shift 2 ;;
    --db-pass) DB_PASS="${2:?Missing value for --db-pass}"; shift 2 ;;
    --stripe-public-key) STRIPE_PUBLIC_KEY="${2:?Missing value for --stripe-public-key}"; shift 2 ;;
    --stripe-secret-key) STRIPE_SECRET_KEY="${2:?Missing value for --stripe-secret-key}"; shift 2 ;;
    --smtp-host) SMTP_HOST="${2:?Missing value for --smtp-host}"; shift 2 ;;
    --smtp-port) SMTP_PORT="${2:?Missing value for --smtp-port}"; shift 2 ;;
    --smtp-user) SMTP_USER="${2:?Missing value for --smtp-user}"; shift 2 ;;
    --smtp-pass) SMTP_PASS="${2:?Missing value for --smtp-pass}"; shift 2 ;;
    --skip-ssl) SKIP_SSL="true"; shift ;;
    --skip-nginx) SKIP_NGINX="true"; shift ;;
    --non-interactive) NON_INTERACTIVE="true"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1" ;;
  esac
done

DOMAIN="${DOMAIN:-${INSTALL_DOMAIN:-}}"
APP_BASE_URL="${APP_BASE_URL:-${INSTALL_APP_BASE_URL:-}}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-${INSTALL_EMAIL:-}}"
ADMIN_EMAIL="${ADMIN_EMAIL:-${INSTALL_ADMIN_EMAIL:-}}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-${INSTALL_ADMIN_PASSWORD:-}}"
ADMIN_NAME="${ADMIN_NAME:-${INSTALL_ADMIN_NAME:-مدیر سیستم}}"
ADMIN_EMAILS="${ADMIN_EMAILS:-${INSTALL_ADMIN_EMAILS:-}}"
PORT="${PORT:-${INSTALL_PORT:-3000}}"
DATABASE_URL="${DATABASE_URL:-${INSTALL_DATABASE_URL:-}}"
DB_NAME="${DB_NAME:-${INSTALL_DB_NAME:-portfolio_advisor}}"
DB_USER="${DB_USER:-${INSTALL_DB_USER:-portfolio_advisor}}"
DB_PASS="${DB_PASS:-${INSTALL_DB_PASS:-}}"
STRIPE_PUBLIC_KEY="${STRIPE_PUBLIC_KEY:-${INSTALL_STRIPE_PUBLIC_KEY:-}}"
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-${INSTALL_STRIPE_SECRET_KEY:-}}"
SMTP_HOST="${SMTP_HOST:-${INSTALL_SMTP_HOST:-}}"
SMTP_PORT="${SMTP_PORT:-${INSTALL_SMTP_PORT:-}}"
SMTP_USER="${SMTP_USER:-${INSTALL_SMTP_USER:-}}"
SMTP_PASS="${SMTP_PASS:-${INSTALL_SMTP_PASS:-}}"

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

  if [[ -z "$APP_BASE_URL" ]]; then
    local suggested_base_url
    if [[ -n "$DOMAIN" ]]; then
      if [[ "$SKIP_SSL" == "true" ]]; then
        suggested_base_url="http://${DOMAIN}"
      else
        suggested_base_url="https://${DOMAIN}"
      fi
    else
      local server_ip
      server_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
      suggested_base_url="http://${server_ip:-SERVER_IP}:${PORT}"
    fi
    read -r -p "Public app URL [${suggested_base_url}]: " input_base_url
    APP_BASE_URL="${input_base_url:-$suggested_base_url}"
  fi

  if [[ -z "$DATABASE_URL" ]]; then
    read -r -p "Existing PostgreSQL DATABASE_URL (leave empty to create local PostgreSQL automatically): " input_database_url
    DATABASE_URL="${input_database_url:-}"
  fi

  if [[ -z "$DATABASE_URL" ]]; then
    read -r -p "Local database name [${DB_NAME}]: " input_db_name
    DB_NAME="${input_db_name:-$DB_NAME}"

    read -r -p "Local database user [${DB_USER}]: " input_db_user
    DB_USER="${input_db_user:-$DB_USER}"

    if [[ -z "$DB_PASS" ]]; then
      read -r -s -p "Local database password (leave empty to auto-generate): " input_db_pass
      printf '\n'
      DB_PASS="${input_db_pass:-}"
    fi
  fi

  if [[ -z "$ADMIN_EMAIL" ]]; then
    read -r -p "Admin login email: " ADMIN_EMAIL
  fi

  if [[ "$ADMIN_NAME" == "مدیر سیستم" ]]; then
    read -r -p "Admin display name [مدیر سیستم]: " input_admin_name
    ADMIN_NAME="${input_admin_name:-$ADMIN_NAME}"
  fi

  if [[ -z "$ADMIN_EMAILS" ]]; then
    read -r -p "Extra admin email allowlist, comma-separated (optional): " input_admins
    ADMIN_EMAILS="${input_admins:-}"
  fi

  while [[ -z "$ADMIN_PASSWORD" ]]; do
    read -r -s -p "Admin login password (min 8 chars): " first_password
    printf '\n'
    read -r -s -p "Confirm admin password: " second_password
    printf '\n'

    if [[ "$first_password" != "$second_password" ]]; then
      warn "Passwords do not match. Try again."
      continue
    fi

    if [[ "${#first_password}" -lt 8 ]]; then
      warn "Password must be at least 8 characters."
      continue
    fi

    ADMIN_PASSWORD="$first_password"
  done

  if [[ -z "$STRIPE_PUBLIC_KEY" ]]; then
    read -r -p "Stripe publishable key (optional): " STRIPE_PUBLIC_KEY
  fi

  if [[ -z "$STRIPE_SECRET_KEY" ]]; then
    read -r -s -p "Stripe secret key (optional): " STRIPE_SECRET_KEY
    printf '\n'
  fi

  if [[ -z "$SMTP_HOST" ]]; then
    read -r -p "SMTP host (optional): " SMTP_HOST
  fi

  if [[ -n "$SMTP_HOST" && -z "$SMTP_PORT" ]]; then
    read -r -p "SMTP port [587]: " input_smtp_port
    SMTP_PORT="${input_smtp_port:-587}"
  fi

  if [[ -n "$SMTP_HOST" && -z "$SMTP_USER" ]]; then
    read -r -p "SMTP username (optional): " SMTP_USER
  fi

  if [[ -n "$SMTP_HOST" && -z "$SMTP_PASS" ]]; then
    read -r -s -p "SMTP password (optional): " SMTP_PASS
    printf '\n'
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

  if [[ -z "$ADMIN_EMAIL" ]]; then
    die "Admin email is required. Use --admin-email or INSTALL_ADMIN_EMAIL."
  fi

  if [[ -z "$ADMIN_PASSWORD" || "${#ADMIN_PASSWORD}" -lt 8 ]]; then
    die "Admin password is required and must be at least 8 characters. Use --admin-password or INSTALL_ADMIN_PASSWORD."
  fi

  if [[ -n "$APP_BASE_URL" && ! "$APP_BASE_URL" =~ ^https?:// ]]; then
    die "Base URL must start with http:// or https://."
  fi

  if [[ -n "$DATABASE_URL" && ! "$DATABASE_URL" =~ ^postgres(ql)?:// ]]; then
    die "DATABASE_URL must be a PostgreSQL URL starting with postgresql:// or postgres://."
  fi
}

random_secret() {
  openssl rand -base64 48 | tr -d '\n'
}

random_db_password() {
  openssl rand -base64 30 | tr -dc 'A-Za-z0-9' | head -c 28
}

url_encode() {
  node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" "$1"
}

shell_quote() {
  node -e "const s = process.argv[1] || ''; process.stdout.write(\"'\" + s.replace(/'/g, \"'\\\\''\") + \"'\");" "$1"
}

install_system_packages() {
  log "Installing system packages"
  apt-get update
  apt-get install -y ca-certificates curl gnupg openssl build-essential

  if [[ -z "$DATABASE_URL" ]]; then
    apt-get install -y postgresql postgresql-contrib
  else
    log "Using external DATABASE_URL; skipping local PostgreSQL package installation"
  fi

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
  if [[ -n "$DATABASE_URL" ]]; then
    log "Using provided DATABASE_URL; skipping local PostgreSQL setup"
    return
  fi

  log "Configuring PostgreSQL database"
  MANAGED_POSTGRES="true"
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
  if [[ -n "$APP_BASE_URL" ]]; then
    base_url="$APP_BASE_URL"
  elif [[ -n "$DOMAIN" ]]; then
    if [[ "$SKIP_SSL" == "true" ]]; then
      base_url="http://${DOMAIN}"
    else
      base_url="https://${DOMAIN}"
    fi
  else
    base_url="http://localhost:${PORT}"
  fi

  local nextauth_secret jwt_secret database_url effective_admin_emails
  nextauth_secret="$(random_secret)"
  jwt_secret="$(random_secret)"
  if [[ -n "$DATABASE_URL" ]]; then
    database_url="$DATABASE_URL"
  else
    local db_user_encoded db_pass_encoded db_name_encoded
    db_user_encoded="$(url_encode "$DB_USER")"
    db_pass_encoded="$(url_encode "$DB_PASS")"
    db_name_encoded="$(url_encode "$DB_NAME")"
    database_url="postgresql://${db_user_encoded}:${db_pass_encoded}@localhost:5432/${db_name_encoded}"
    DATABASE_URL="$database_url"
  fi
  if [[ -n "$ADMIN_EMAILS" ]]; then
    effective_admin_emails="${ADMIN_EMAIL},${ADMIN_EMAILS}"
  else
    effective_admin_emails="${ADMIN_EMAIL}"
  fi

  local database_url_q base_url_q nextauth_secret_q jwt_secret_q admin_email_q admin_emails_q api_url_q
  local stripe_public_key_q stripe_secret_key_q smtp_host_q smtp_port_q smtp_user_q smtp_pass_q
  database_url_q="$(shell_quote "$database_url")"
  base_url_q="$(shell_quote "$base_url")"
  nextauth_secret_q="$(shell_quote "$nextauth_secret")"
  jwt_secret_q="$(shell_quote "$jwt_secret")"
  admin_email_q="$(shell_quote "$ADMIN_EMAIL")"
  admin_emails_q="$(shell_quote "$effective_admin_emails")"
  api_url_q="$(shell_quote "${base_url}/api")"
  stripe_public_key_q="$(shell_quote "$STRIPE_PUBLIC_KEY")"
  stripe_secret_key_q="$(shell_quote "$STRIPE_SECRET_KEY")"
  smtp_host_q="$(shell_quote "$SMTP_HOST")"
  smtp_port_q="$(shell_quote "$SMTP_PORT")"
  smtp_user_q="$(shell_quote "$SMTP_USER")"
  smtp_pass_q="$(shell_quote "$SMTP_PASS")"

  umask 077
  cat > "${APP_DIR}/.env.production" <<EOF
DATABASE_URL=${database_url_q}
NEXTAUTH_URL=${base_url_q}
NEXTAUTH_SECRET=${nextauth_secret_q}
JWT_SECRET=${jwt_secret_q}
JWT_EXPIRY=7d
ADMIN_EMAIL=${admin_email_q}
ADMIN_EMAILS=${admin_emails_q}
NEXT_PUBLIC_API_URL=${api_url_q}
NODE_ENV=production
PORT=${PORT}

STRIPE_PUBLIC_KEY=${stripe_public_key_q}
STRIPE_SECRET_KEY=${stripe_secret_key_q}
SMTP_HOST=${smtp_host_q}
SMTP_PORT=${smtp_port_q}
SMTP_USER=${smtp_user_q}
SMTP_PASS=${smtp_pass_q}
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

seed_production_data() {
  log "Creating production admin user and baseline database data"
  cd "$APP_DIR"
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env.production"
  set +a

  sudo -u "$APP_USER" env \
    INSTALL_ADMIN_EMAIL="$ADMIN_EMAIL" \
    INSTALL_ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    INSTALL_ADMIN_NAME="$ADMIN_NAME" \
    DATABASE_URL="$DATABASE_URL" \
    node scripts/seed-production.mjs
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
  local after_units="network.target"
  local wants_units=""
  if [[ "$MANAGED_POSTGRES" == "true" ]]; then
    after_units="network.target postgresql.service"
    wants_units="Wants=postgresql.service"
  fi

  cat > "/etc/systemd/system/${APP_NAME}.service" <<EOF
[Unit]
Description=Portfolio Advisor Next.js app
After=${after_units}
${wants_units}

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
  if [[ -n "$APP_BASE_URL" ]]; then
    public_url="$APP_BASE_URL"
  elif [[ -n "$DOMAIN" ]]; then
    public_url="http://${DOMAIN}"
    [[ "$SKIP_SSL" != "true" ]] && public_url="https://${DOMAIN}"
  else
    public_url="http://SERVER_IP:${PORT}"
  fi

  local database_summary
  if [[ "$MANAGED_POSTGRES" == "true" ]]; then
    database_summary="local PostgreSQL database '${DB_NAME}' with user '${DB_USER}'"
  else
    database_summary="external PostgreSQL DATABASE_URL from installer input"
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
  ${database_summary}

Admin login:
  email: ${ADMIN_EMAIL}
  allowlist: ${ADMIN_EMAIL}${ADMIN_EMAILS:+,${ADMIN_EMAILS}}

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
  seed_production_data
  build_app
  create_systemd_service
  configure_nginx
  configure_ssl
  configure_firewall
  health_check
  print_summary
}

main "$@"
