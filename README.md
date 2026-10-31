# Radiografía de Participación Ciudadana

Proyecto escolar para el Hackathon 2026. Aplicación de consulta de la participación electoral en México con fuentes del INE: elecciones federales de **2018, 2021 y 2024**.

## Funciones

- Panel nacional con participación, complemento sin marca de voto, electores y variación frente a la elección anterior disponible.
- Mapa de las 32 entidades, ranking legible y fichas accesibles desde el mapa o la tabla.
- Comparación de dos elecciones a nivel nacional o por entidad.
- Perfiles descriptivos y radar con unidades y escalas explicadas.
- Temas claro y oscuro persistentes y navegación móvil.

La aplicación es pública y no necesita cuentas. El código recibido no incluía pantallas ni rutas de administración funcionales; las importaciones se realizan mediante la CLI. Se retiraron los enlaces que apuntaban a pantallas inexistentes.

## Requisitos

- Node.js 22.12 o posterior.
- Python 3.13.
- MySQL 8.0.
- Espacio para aproximadamente 2 GB de CSV oficiales, además de las dependencias.

## Inicio local en Windows

Configura tus credenciales en `backend/.env`, tomando como referencia `backend/.env.example`. No subas ese archivo a repositorios.

```powershell
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements-dev.txt
# Solo si la base está vacía; se detiene si ya contiene tablas:
.venv/Scripts/python -m app.scripts.init_db
# Si todavía no tienes los CSV:
.venv/Scripts/python -m app.scripts.download_data
.venv/Scripts/python -m app.etl.cli --anios 2018 2021 2024
.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

En otra terminal:

```powershell
cd frontend
npm ci
npm run dev
```

La interfaz usa `/api/v1` en el mismo dominio. Vite redirige esas peticiones a `127.0.0.1:8000`; en producción lo hace Nginx. No es necesario cambiar el código al pasar al VPS.

Interfaz local: http://localhost:5173. API: http://127.0.0.1:8000/docs. `/health` comprueba también la conexión con MySQL.

## Verificación

```powershell
cd backend
.venv/Scripts/python -m pytest tests -q
cd ../frontend
npm run build
npm run lint
npm run test:e2e
```

Las pruebas de API requieren los catálogos y las tres elecciones cargadas. Las pruebas de navegador usan Chrome instalado, la API en el puerto 8000 y la interfaz en el puerto 5174. Para iniciarla en ese puerto: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174`.

## Datos y metodología

Fuente electoral: [Conteos Censales del INE](https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).

El importador valida **28,455,354 filas** de 96 CSV y guarda 96 totales oficiales por entidad y elección. Conserva el hash de cada fuente y el historial de importaciones. Repetirlo actualiza esos mismos totales, sin duplicar población. Una elección incompleta o inválida se rechaza antes de modificar sus totales.

Participación = `100 × SV / LN`. El complemento `100 - participación` incluye **NV y NS**: no debe interpretarse exclusivamente como abstención observada. Los totales nacionales se calculan sumando las 32 entidades, sin agregar de nuevo una fila nacional ni mezclar segmentos demográficos.

Los perfiles dan prioridad a cambios mayores de ±3 pp; después clasifican diferencias respecto a la referencia nacional de al menos ±5 pp. Si no hay elección previa, la variación se muestra como no disponible. Son categorías descriptivas, no predicciones ni relaciones causales. Las elecciones presidenciales e intermedias tienen contextos distintos.

El mapa usa [límites estatales del INEGI](https://www.inegi.org.mx/servicios/catalogounico.html) simplificados para visualización. No reemplaza la cartografía electoral histórica del INE. La procedencia está en `data/cartografia-metadata.json`.

## Preparación para VPS

Se incluyen Dockerfiles, `compose.yaml` y Nginx; consulta `deploy/README.md`. El despliegue se hará en una fase posterior. Esta configuración todavía debe probarse en el VPS: Docker no está instalado en el equipo local.

## Validación intensiva

La última revisión aprobó 244 pruebas del backend y 65 escenarios de producción en cada navegador probado (Chrome y Edge), además de una prueba de carga de 1,000 solicitudes sin errores. Consulta el [informe de pruebas](docs/PRUEBAS-INTENSIVAS.md) para el alcance y las limitaciones, incluida la comprobación pendiente en Firefox.

### Restaurar los datos ya procesados

El archivo `database/snapshot_radiografia_ciudadana.sql` contiene un respaldo compacto, verificado mediante restauración, con los 96 totales oficiales, las geometrías y su trazabilidad. No contiene usuarios ni contraseñas. Sobre una instalación nueva puede restaurarse **en lugar de ejecutar el schema, el seed y el ETL**:

```text
mysql --default-character-set=utf8mb4 -u TU_USUARIO -p < database/snapshot_radiografia_ciudadana.sql
```

Este comando se ejecuta desde una terminal compatible con redirección de entrada (por ejemplo, Bash o cmd). En PowerShell puede usarse el cliente interactivo de MySQL y ejecutar `source C:/ruta/al/proyecto/database/snapshot_radiografia_ciudadana.sql;`.

El respaldo usa la base `radiografia_ciudadana`. Debe restaurarse únicamente en una instalación nueva o en una base cuyo reemplazo se haya decidido expresamente: el archivo generado por MySQL recrea sus tablas. No combines la restauración con el seed sobre la misma base poblada.

Los CSV originales se descargan mediante `python -m app.scripts.download_data` desde `backend/`; sus enlaces y hashes están versionados en `data/fuentes-manifest.json`.
