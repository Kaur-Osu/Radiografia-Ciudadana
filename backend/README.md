# Backend

FastAPI, SQLAlchemy y MySQL 8.0. Sigue la guía del README principal.

Comandos desde esta carpeta:

```powershell
.venv/Scripts/python -m app.scripts.init_db
.venv/Scripts/python -m app.scripts.download_data
.venv/Scripts/python -m app.etl.cli --anios 2018 2021 2024
.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
.venv/Scripts/python -m pytest tests -q
```

`init_db` se niega a ejecutar el seed si ya existen tablas. El ETL valida las 32 entidades de cada elección y hace una transacción por elección. Un error detiene la ejecución con código distinto de cero. Los scripts `etl_2018.py`, `etl_2021.py` y `etl_2024.py` llaman al mismo proceso.

Los endpoints públicos están bajo `/api/v1`: elecciones, territorios, participación, comparaciones y perfiles. El territorio `0` representa el agregado nacional. El segmento predeterminado se identifica por su código `GENERAL`.

Para regenerar las geometrías se necesita la dependencia de desarrollo `shapely`: `python -m app.scripts.generar_geojson_mexico`. La aplicación sirve un archivo local y no necesita servicios externos de mapas para funcionar.
