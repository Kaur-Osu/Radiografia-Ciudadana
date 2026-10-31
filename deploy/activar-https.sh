#!/usr/bin/env bash
# Modifica exclusivamente el sitio y el hook de renovacion de Radiografia.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
config=/etc/nginx/sites-available/radiografia-ciudadana.conf
link=/etc/nginx/sites-enabled/radiografia-ciudadana.conf
hook=/etc/letsencrypt/renewal-hooks/deploy/radiografia-ciudadana.sh
cert=/etc/letsencrypt/live/radiografiaciudadana.utportfolio.cloud
[[ $EUID -eq 0 ]] || { echo 'Ejecutar como root.'; exit 1; }
[[ -f "$config" && ! -L "$config" ]]
[[ -L "$link" && "$(readlink -f -- "$link")" == "$config" ]]
test -s "$cert/fullchain.pem"
test -s "$cert/privkey.pem"
python3 - "$config" <<'PY'
import re
import sys
from pathlib import Path

content = Path(sys.argv[1]).read_text(encoding='utf-8')
names = re.findall(r'^\s*server_name\s+([^;]+);', content, flags=re.M)
assert names and all(n.strip() == 'radiografiaciudadana.utportfolio.cloud' for n in names), 'El archivo contiene dominios inesperados; detenerse y revisar.'
PY
if [[ -e "$hook" || -L "$hook" ]]; then
  [[ -f "$hook" && ! -L "$hook" ]] && cmp -s deploy/renovar-radiografia.sh "$hook" || {
    echo 'Ya existe un hook distinto. Se conserva sin cambios.'; exit 1;
  }
fi
nginx -t
curl --fail --silent --show-error --max-time 10 http://127.0.0.1:18081/health
echo
install -d -m 700 /var/backups/radiografia-ciudadana
backup=$(mktemp -d /var/backups/radiografia-ciudadana/https.XXXXXXXX)
cp -p -- "$config" "$backup/site.conf"
hook_created=0
rollback() {
  local status=$?
  trap - ERR
  echo 'Fallo al activar HTTPS. Restaurando solo la configuracion de Radiografia.'
  cp -p -- "$backup/site.conf" "$config"
  if [[ $hook_created == 1 ]]; then rm -f -- "$hook"; fi
  if nginx -t; then systemctl reload nginx; fi
  exit "$status"
}
trap rollback ERR
install -m 644 deploy/radiografia-https.conf "$config"
nginx -t
if [[ ! -e "$hook" ]]; then
  install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
  hook_created=1
  install -m 755 deploy/renovar-radiografia.sh "$hook"
fi
bash -n "$hook"
systemctl reload nginx
trap - ERR
echo "Copia de respaldo: $backup/site.conf"
curl --fail --silent --show-error --max-time 10 --retry 5 --retry-delay 1 --retry-all-errors \
  --resolve radiografiaciudadana.utportfolio.cloud:443:127.0.0.1 \
  https://radiografiaciudadana.utportfolio.cloud/health
echo
echo 'HTTPS activado. Verificar tambien el acceso publico desde Internet.'
