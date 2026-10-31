# VPS compartido

Configuracion exclusiva para Radiografia Ciudadana. No usar el Compose de desarrollo en este VPS: el puerto 8080 pertenece a otra pagina.

La primera instalacion se realiza desde una copia nueva del repositorio:

```bash
bash deploy/iniciar-vps.sh
```

Este script comprueba el puerto 18081 y que no existan recursos previos del proyecto, genera tres claves distintas en `.env.vps` con permisos 600, construye las imagenes una a la vez e inicia solo el proyecto Compose `radiografia-ciudadana`. No instalar Docker, reiniciar Docker, ejecutar `pm2 restart all` ni modificar servicios existentes.

La base MySQL tiene su propio volumen y red. No publica ningun puerto. El respaldo SQL se importa automaticamente solo al crear una base vacia, sin combinarlo con el seed. Incluye 2018, 2021 y 2024: 96 agregados estatales. No requiere transferir los CSV originales. Los contenedores tienen limites de memoria y CPU; la construccion de imagenes utiliza recursos adicionales temporalmente.

El unico puerto publicado es `127.0.0.1:18081`. Antes de publicar el dominio deben pasar las comprobaciones de salud y datos del script. La configuracion de Nginx y HTTPS se prepara por separado en un archivo exclusivo para `radiografiaciudadana.utportfolio.cloud`, validando Nginx antes de una recarga gradual.

Si falla una instalacion, conservar `.env.vps` y el volumen. No volver a ejecutar el instalador ni borrar datos para solucionar el error. Consultar el estado:

```bash
docker compose --project-name radiografia-ciudadana --env-file .env.vps -f compose.vps.yaml ps
docker compose --project-name radiografia-ciudadana --env-file .env.vps -f compose.vps.yaml logs --tail 80
```

No compartir `.env.vps` ni la salida completa de `docker compose config`: contienen claves. Usar `config --quiet` para validar sin mostrarlas. Guardar una copia privada de `.env.vps` y respaldar la base antes de futuras actualizaciones. No ejecutar `docker compose down -v`, limpiezas globales de Docker ni importar SQL en la base MySQL del servidor.

La configuracion se revisa localmente, pero la construccion Docker y el arranque deben verificarse en el VPS antes de considerarlos validados.

## Activacion de HTTPS

Despues de emitir el certificado con Certbot webroot para este dominio, ejecutar:

```bash
bash deploy/activar-https.sh
```

Comprueba el certificado, el enlace habilitado, que el archivo no incluya otros dominios y la salud de la aplicacion. Guarda una copia privada del archivo del sitio en `/var/backups/radiografia-ciudadana/https.XXXXXXXX/site.conf`, valida Nginx y lo recarga gradualmente. Si falla la activacion, restaura solo este archivo. No reinicia Docker ni modifica otros sitios. La comprobacion HTTPS posterior puede reintentarse si falla sin eliminar la instalacion.

El hook `radiografia-ciudadana.sh` solo recarga Nginx cuando Certbot renueva el certificado de Radiografia. No modifica el calendario de renovacion existente ni actua al renovar otros certificados. La recarga permite servir el certificado actualizado sin reiniciar Nginx.
