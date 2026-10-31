#!/usr/bin/env bash
set -euo pipefail
if [[ "${RENEWED_LINEAGE:-}" == /etc/letsencrypt/live/radiografiaciudadana.utportfolio.cloud ]]; then
  /usr/sbin/nginx -t
  systemctl reload nginx
fi
