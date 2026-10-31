from __future__ import annotations

import logging
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)


class ValidacionETL:
    """Resultados de validación de un lote de datos."""

    def __init__(self) -> None:
        self.registros_leidos: int = 0
        self.registros_validos: int = 0
        self.registros_rechazados: int = 0
        self.errores: list[str] = []
        self.advertencias: list[str] = []

    def agregar_error(self, mensaje: str) -> None:
        self.errores.append(mensaje)
        logger.error(mensaje)

    def agregar_advertencia(self, mensaje: str) -> None:
        self.advertencias.append(mensaje)
        logger.warning(mensaje)

    @property
    def es_valido(self) -> bool:
        return len(self.errores) == 0


def validar_dataframe(
    df: pd.DataFrame, anio_eleccion: int
) -> tuple[pd.DataFrame, ValidacionETL]:
    """
    Valida un DataFrame transformado antes de cargarlo a MySQL.
    Retorna (dataframe_valido, validacion).
    """
    validacion = ValidacionETL()
    validacion.registros_leidos = len(df)

    df_valido = df.copy()

    # 1. Verificar que no haya filas completamente vacías
    filas_vacias = df_valido.isna().all(axis=1).sum()
    if filas_vacias > 0:
        validacion.agregar_advertencia(
            f"{filas_vacias} filas completamente vacías serán eliminadas"
        )
        df_valido = df_valido.dropna(how="all")

    # 2. Verificar electores y votantes no negativos
    negativos_electores = (df_valido["electores"] < 0).sum()
    negativos_votantes = (df_valido["votantes"] < 0).sum()
    if negativos_electores > 0:
        validacion.agregar_error(
            f"{negativos_electores} filas con electores negativos"
        )
    if negativos_votantes > 0:
        validacion.agregar_error(
            f"{negativos_votantes} filas con votantes negativos"
        )

    # 3. Verificar votantes <= electores (restricción de CHECK en DB)
    votantes_mayores = (df_valido["votantes"] > df_valido["electores"]).sum()
    if votantes_mayores > 0:
        validacion.agregar_error(
            f"{votantes_mayores} filas con votantes > electores"
        )
        df_valido = df_valido[df_valido["votantes"] <= df_valido["electores"]].copy()
    df_valido = df_valido[(df_valido["electores"] >= 0) & (df_valido["votantes"] >= 0)].copy()

    # 4. Verificar claves de entidad válidas (01-32)
    claves_validas = {f"{i:02d}" for i in range(1, 33)}
    claves_invalidas = set(df_valido["clave_entidad"].unique()) - claves_validas
    if claves_invalidas:
        validacion.agregar_error(
            f"Claves de entidad inválidas: {claves_invalidas}"
        )

    df_valido = df_valido[df_valido["clave_entidad"].isin(claves_validas)].copy()

    # 5. Verificar porcentaje de participación plausible (0-100)
    df_valido["participacion_calc"] = (
        df_valido["votantes"] * 100.0 / df_valido["electores"].replace(0, pd.NA)
    )
    participacion_fuera_rango = (
        (df_valido["participacion_calc"] < 0)
        | (df_valido["participacion_calc"] > 100)
    ).sum()
    if participacion_fuera_rango > 0:
        validacion.agregar_advertencia(
            f"{participacion_fuera_rango} filas con participación fuera de rango 0-100%"
        )

    # 6. Verificar duplicados potenciales (misma combinación de claves)
    columnas_clave = [
        "anio_eleccion",
        "clave_entidad",
        "clave_municipio",
        "seccion",
        "sexo",
        "edad",
    ]
    duplicados = df_valido.duplicated(subset=columnas_clave, keep=False).sum()
    if duplicados > 0:
        validacion.agregar_advertencia(
            f"{duplicados} filas duplicadas detectadas por combinación de claves"
        )

    validacion.registros_validos = len(df_valido)
    validacion.registros_rechazados = (
        validacion.registros_leidos - validacion.registros_validos
    )

    return df_valido, validacion


def validar_integridad_referencial(
    df: pd.DataFrame,
    territorios_conocidos: set[tuple[str, str]],
    elecciones_conocidas: set[int],
) -> tuple[pd.DataFrame, list[str]]:
    """
    Valida que los territorios y elecciones existan en los catálogos.
    Retorna (dataframe_filtrado, advertencias).
    """
    advertencias = []
    df_valido = df.copy()

    # Verificar elecciones
    anios_en_datos = set(df_valido["anio_eleccion"].unique())
    elecciones_faltantes = anios_en_datos - elecciones_conocidas
    if elecciones_faltantes:
        advertencias.append(
            f"Elecciones no registradas en catálogo: {elecciones_faltantes}"
        )

    # Verificar territorios (clave_entidad, tipo)
    territorios_en_datos = set(
        zip(df_valido["clave_entidad"], df_valido["tipo_seccion"])
    )
    territorios_faltantes = territorios_en_datos - territorios_conocidos
    if territorios_faltantes:
        advertencias.append(
            f"Territorios no registrados: {len(territorios_faltantes)} combinaciones"
        )

    return df_valido, advertencias