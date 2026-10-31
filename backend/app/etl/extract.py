from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Iterator

import pandas as pd

logger = logging.getLogger(__name__)

# Columnas esperadas en los CSV oficiales del INE (Conteos Censales 2024)
COLUMNAS_ESPERADAS = [
    "AELEC",
    "FELECCION",
    "EDOCVE",
    "EDONOM",
    "MPIOCVE",
    "MPIONOM",
    "SECCION",
    "TIPOSEC",
    "DEF",
    "DEL",
    "SEXO",
    "EDAD",
    "LN",
    "SV",
    "NV",
    "NS",
]

# Mapeo de columnas del INE a nombres del modelo de datos
MAPEO_COLUMNAS = {
    "AELEC": "anio_eleccion",
    "FELECCION": "fecha_eleccion",
    "EDOCVE": "clave_entidad",
    "EDONOM": "nombre_entidad",
    "MPIOCVE": "clave_municipio",
    "MPIONOM": "nombre_municipio",
    "SECCION": "seccion",
    "TIPOSEC": "tipo_seccion",
    "DEF": "distrito_federal",
    "DEL": "distrito_local",
    "SEXO": "sexo",
    "EDAD": "edad",
    "LN": "electores",        # Lista nominal (denominador)
    "SV": "votantes",         # Registros con marca de voto (numerador)
    "NV": "no_votantes",
    "NS": "no_especificados",
}


def calcular_hash_archivo(ruta_archivo: Path) -> str:
    """Calcula el hash SHA-256 de un archivo para trazabilidad de versiones."""
    sha256 = hashlib.sha256()
    with open(ruta_archivo, "rb") as f:
        for bloque in iter(lambda: f.read(65536), b""):
            sha256.update(bloque)
    return sha256.hexdigest()


def listar_csv_por_eleccion(
    ruta_datos: Path, anio_eleccion: int
) -> list[Path]:
    """
    Lista todos los archivos CSV de una elección dada.
    Espera estructura: data/DatosAbiertos_..._ConteosCensalesYYYY/datosabiertos_..._YYYY_XX.csv
    """
    patron = f"*ConteosCensales{anio_eleccion}*"
    directorios = list(ruta_datos.glob(patron))

    if not directorios:
        logger.warning(f"No se encontró carpeta para elección {anio_eleccion}")
        return []

    carpeta = directorios[0]
    archivos_csv = sorted(carpeta.rglob("*.csv"))
    logger.info(f"Encontrados {len(archivos_csv)} CSV para elección {anio_eleccion}")
    return archivos_csv


def extraer_csv(ruta_archivo: Path) -> pd.DataFrame:
    """
    Lee un CSV oficial del INE y devuelve un DataFrame con las columnas esperadas.
    """
    logger.info(f"Extrayendo: {ruta_archivo.name}")

    try:
        ruta_archivo.read_bytes().decode("utf-8-sig")
        encoding = "utf-8-sig"
    except UnicodeDecodeError:
        encoding = "cp1252"
    df = pd.read_csv(
        ruta_archivo,
        dtype=str,  # Leer todo como texto para evitar problemas de tipos
        encoding=encoding,
        low_memory=False,
    )

    # Verificar columnas esperadas
    columnas_faltantes = set(COLUMNAS_ESPERADAS) - set(df.columns)
    if columnas_faltantes:
        raise ValueError(
            f"Columnas faltantes en {ruta_archivo.name}: {columnas_faltantes}"
        )

    # Renombrar columnas al modelo interno
    df = df.rename(columns=MAPEO_COLUMNAS)

    # Agregar metadatos de archivo
    df["archivo_origen"] = ruta_archivo.name
    df["hash_archivo"] = calcular_hash_archivo(ruta_archivo)

    return df


def extraer_todos_csv(
    ruta_datos: Path, anios_eleccion: list[int]
) -> Iterator[tuple[int, Path, pd.DataFrame]]:
    """
    Generador que extrae todos los CSV de las elecciones indicadas.
    Yields: (anio, ruta_archivo, dataframe)
    """
    for anio in anios_eleccion:
        archivos = listar_csv_por_eleccion(ruta_datos, anio)
        for archivo in archivos:
            try:
                df = extraer_csv(archivo)
                yield anio, archivo, df
            except Exception as e:
                logger.error(f"Error extrayendo {archivo}: {e}")
                raise