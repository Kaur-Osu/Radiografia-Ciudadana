from __future__ import annotations

import logging
import re
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)


def limpiar_clave_territorio(valor: Optional[str]) -> str:
    """Limpia y estandariza claves de territorio (rellena ceros a la izquierda)."""
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return ""
    valor = str(valor).strip()
    # Rellenar con ceros a la izquierda según longitud esperada
    return valor.zfill(2)


def normalizar_tipo_seccion(valor: Optional[str]) -> str:
    """Normaliza TIPOSEC: U=Urbana, M=Mixta, R=Rural."""
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return "U"
    valor = str(valor).strip().upper()
    mapeo = {"U": "U", "M": "M", "R": "R", "URBANA": "U", "MIXTA": "M", "RURAL": "R"}
    return mapeo.get(valor, valor)


def convertir_entero(valor: Optional[str]) -> int:
    """Convierte un valor a entero, manejando nulos y strings vacíos."""
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return 0
    valor = str(valor).strip()
    if valor == "" or valor.lower() in ("nan", "none", "null"):
        return 0
    try:
        return int(float(valor))
    except (ValueError, TypeError):
        raise ValueError(f"Conteo inválido: {valor!r}")


def transformar_dataframe(
    df: pd.DataFrame, anio_eleccion: int, clave_estado: str
) -> pd.DataFrame:
    """
    Transforma un DataFrame crudo del INE al formato listo para cargar a MySQL.
    """
    logger.info(f"Transformando {len(df)} filas para {clave_estado} ({anio_eleccion})")

    df = df.copy()

    # Limpiar claves de entidad y municipio
    df["clave_entidad"] = df["clave_entidad"].apply(limpiar_clave_territorio)
    df["clave_municipio"] = df["clave_municipio"].apply(limpiar_clave_territorio)

    # Normalizar tipo de sección
    df["tipo_seccion"] = df["tipo_seccion"].apply(normalizar_tipo_seccion)

    # Convertir campos numéricos
    df["electores"] = df["electores"].apply(convertir_entero)
    df["votantes"] = df["votantes"].apply(convertir_entero)
    df["no_votantes"] = df["no_votantes"].apply(convertir_entero)
    df["no_especificados"] = df["no_especificados"].apply(convertir_entero)

    # Convertir edad
    df["edad"] = df["edad"].apply(convertir_entero)

    # Normalizar sexo: 0=Hombres, 1=Mujeres, 2=No binario
    mapeo_sexo = {"0": "H", "1": "M", "2": "NB", "H": "H", "M": "M", "NB": "NB"}
    df["sexo"] = df["sexo"].apply(
        lambda v: mapeo_sexo.get(str(v).strip().upper(), "H")
    )

    # Agregar año de elección
    df["anio_eleccion"] = anio_eleccion

    # Seleccionar y reordenar columnas finales
    columnas_finales = [
        "anio_eleccion",
        "fecha_eleccion",
        "clave_entidad",
        "nombre_entidad",
        "clave_municipio",
        "nombre_municipio",
        "seccion",
        "tipo_seccion",
        "distrito_federal",
        "distrito_local",
        "sexo",
        "edad",
        "electores",
        "votantes",
        "no_votantes",
        "no_especificados",
        "archivo_origen",
        "hash_archivo",
    ]

    columnas_existentes = [c for c in columnas_finales if c in df.columns]
    df = df[columnas_existentes]

    logger.info(f"Transformadas {len(df)} filas válidas")
    return df


def agregar_segmento_general(df: pd.DataFrame) -> pd.DataFrame:
    """
    Crea filas agregadas para el segmento GENERAL (sin desagregación demográfica)
    sumando electores y votantes por entidad, municipio y sección.
    """
    logger.info("Agregando segmento GENERAL...")

    # Agrupar por entidad, municipio, sección (sin sexo ni edad)
    columnas_agrupacion = [
        "anio_eleccion",
        "fecha_eleccion",
        "clave_entidad",
        "nombre_entidad",
        "clave_municipio",
        "nombre_municipio",
        "seccion",
        "tipo_seccion",
        "distrito_federal",
        "distrito_local",
        "archivo_origen",
        "hash_archivo",
    ]

    df_general = (
        df.groupby(columnas_agrupacion, as_index=False, dropna=False)
        .agg(
            electores=("electores", "sum"),
            votantes=("votantes", "sum"),
            no_votantes=("no_votantes", "sum"),
            no_especificados=("no_especificados", "sum"),
        )
    )

    df_general["sexo"] = "GENERAL"
    df_general["edad"] = 0  # Valor marcador para segmento general

    # Combinar con datos originales
    df_combinado = pd.concat([df, df_general], ignore_index=True)
    logger.info(f"Total filas después de agregar GENERAL: {len(df_combinado)}")
    return df_combinado