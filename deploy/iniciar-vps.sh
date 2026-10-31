#!/usr/bin/env bash
# Primera instalacion aislada. No modifica Nginx ni servicios de otros sitios.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
for herramienta in docker python3; do
  command -v "$herramienta" >/dev/null || { echo "Falta $herramienta"; exit 1; }
done
docker compose version >/dev/null
test -f database/snapshot_radiografia_ciudadana.sql
if [[ -e .env.vps || -L .env.vps ]]; then
  echo 'Ya existe .env.vps. Se conserva sin cambios; revisar la instalacion antes de continuar.'
  exit 1
fi
if [[ -n "$(docker ps -aq --filter label=com.docker.compose.project=radiografia-ciudadana)" ]] ||
   [[ -n "$(docker volume ls -q --filter label=com.docker.compose.project=radiografia-ciudadana)" ]] ||
   [[ -n "$(docker network ls -q --filter label=com.docker.compose.project=radiografia-ciudadana)" ]]; then
  echo 'Ya existen recursos de Radiografia. Revisarlos antes de continuar.'
  exit 1
fi
python3 - <<'PY'
import os
import secrets
import socket

with socket.socket() as probe:
    probe.bind(('127.0.0.1', 18081))
fd = os.open('.env.vps', os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w', encoding='utf-8') as env:
    for key in ('DB_PASSWORD', 'MYSQL_ROOT_PASSWORD', 'SECRET_KEY'):
        env.write(f'{key}={secrets.token_hex(48)}\n')
print('Credenciales nuevas guardadas en .env.vps, sin mostrarlas.')
PY
export COMPOSE_PARALLEL_LIMIT=1
compose=(docker compose --project-name radiografia-ciudadana --env-file .env.vps -f compose.vps.yaml)
"${compose[@]}" config --quiet
"${compose[@]}" build
"${compose[@]}" up -d --wait --wait-timeout 360
"${compose[@]}" exec -T api python - <<'PY'
from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    rows = conn.execute(text('SELECT anio FROM elecciones ORDER BY anio')).scalars().all()
    count = conn.execute(text('SELECT COUNT(*) FROM participacion_electoral')).scalar_one()
    assert rows == [2018, 2021, 2024], f'Elecciones inesperadas: {rows}'
    assert count == 96, f'Agregados inesperados: {count}'
    print(f'Datos verificados: elecciones {rows}, {count} agregados.')
PY
python3 - <<'PY'
import json
import urllib.request

with urllib.request.urlopen('http://127.0.0.1:18081/health', timeout=10) as response:
    health = json.load(response)
assert health['status'] == 'ok', health
print('Aplicacion y base de datos disponibles en el puerto interno 18081.')
PY
"${compose[@]}" ps
echo 'Instalacion interna terminada. Falta configurar el subdominio y HTTPS.'
