# MySQL

`schema_radiografia_participacion_ciudadana.sql` crea la base `radiografia_ciudadana` y las tablas. `seed_radiografia_participacion_ciudadana.sql` contiene catálogos, no cifras electorales de ejemplo.

Ejecuta ambos una sola vez sobre una base vacía mediante `python -m app.scripts.init_db` desde `backend/`. Después carga los CSV con la CLI del ETL. El inicializador no borra bases ni tablas existentes.

El índice único de participación corresponde a elección, territorio y segmento. El importador actualiza ese registro con el total completo de la entidad. Las fuentes y los lotes permiten rastrear la procedencia de los conteos.
