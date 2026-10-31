> Para el VPS compartido de utportfolio.cloud, seguir [VPS.md](VPS.md) y usar compose.vps.yaml. Esa configuración evita el puerto 8080 ocupado y crea una base aislada.

# Despliegue posterior en VPS

Esta carpeta prepara el despliegue; no se ha realizado todavía. Docker no está instalado en el equipo donde se verificó el proyecto, por lo que la configuración se debe validar en el servidor antes de publicar.

1. Instalar Docker con Compose en el VPS y copiar el proyecto.
2. Crear `.env` en la raíz a partir de `.env.example`, con dos contraseñas nuevas.
3. Conservar los CSV dentro de `data/` o transferir el respaldo SQL ya cargado.
4. Ejecutar `docker compose config` y `docker compose up -d --build`.
5. En una instalación nueva con CSV: `docker compose run --rm api python -m app.etl.cli --anios 2018 2021 2024`.
6. Verificar `/health`, las tres elecciones y el comparador antes de configurar dominio y HTTPS.

MySQL y la API quedan dentro de la red privada de Compose; únicamente Nginx expone HTTP. No se publican los puertos 3306 ni 8000. La base se conserva en el volumen `mysql_data`; los scripts iniciales se ejecutan solo al crear ese volumen. No se debe eliminar el volumen para actualizar la aplicación.

El respaldo SQL incluye los agregados y sus fuentes; permite transferir los resultados sin mover los casi 2 GB de CSV. La importación de ese respaldo se coordinará al conocer el estado de la base del VPS, evitando mezclarlo con el seed.
