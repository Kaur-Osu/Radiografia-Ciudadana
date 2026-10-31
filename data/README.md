# Datos oficiales

Se utilizan 2018, 2021 y 2024. No se necesitan datos de 2028.

Cada carpeta `DatosAbiertos_DECEyEC_ConteosCensalesAAAA/` contiene 32 CSV y la descripción de campos del INE. Los archivos originales se conservan sin modificar. La suma de registros procesados es:

| Elección | Filas oficiales | Entidades |
|---|---:|---:|
| 2018 | 9,251,122 | 32 |
| 2021 | 9,430,502 | 32 |
| 2024 | 9,773,730 | 32 |
| Total | 28,455,354 | 96 totales |

`fuentes-manifest.json` registra enlaces de descarga y hashes SHA-256 de los ZIP oficiales. Desde `backend/`, `python -m app.scripts.download_data` descarga, verifica y extrae las fuentes con validación de rutas. `python -m app.etl.cli --anios 2018 2021 2024` carga los totales a MySQL.

Los CSV oficiales usan Windows-1252 en estas descargas. El lector comprueba primero UTF-8 y después usa Windows-1252. No se reemplazan caracteres inválidos silenciosamente. Los campos `LN`, `SV`, `NV` y `NS` deben ser enteros no negativos y cumplir `LN = SV + NV + NS`.

La cartografía se obtiene del INEGI y se simplifica exclusivamente para visualización. Sus metadatos y hash originales están en `cartografia-metadata.json`.

[Fuente electoral del INE](https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/).
