#!/usr/bin/env python
"""CLI para ejecutar el ETL desde línea de comandos."""

import argparse
import logging
import sys
from pathlib import Path

# Agregar el directorio raíz al path para importar app
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from app.etl.pipeline import ejecutar_etl
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("etl-cli")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="ETL de Radiografía de Participación Ciudadana"
    )
    parser.add_argument(
        "--anios",
        type=int,
        nargs="+",
        default=[2018, 2021, 2024],
        help="Años de elección a procesar (default: 2018 2021 2024)",
    )
    parser.add_argument(
        "--ruta-datos",
        type=str,
        default=None,
        help="Ruta a la carpeta data/ (default: desde .env)",
    )
    parser.add_argument(
        "--usuario-id",
        type=int,
        default=None,
        help="ID del usuario que ejecuta la importación",
    )

    args = parser.parse_args()

    logger.info("Iniciando ETL de Radiografía de Participación Ciudadana")
    logger.info(f"Años: {args.anios}")
    logger.info(f"Ruta de datos: {args.ruta_datos or settings.DATA_PATH}")

    try:
        resultado = ejecutar_etl(
            anios_eleccion=args.anios,
            ruta_datos=args.ruta_datos,
            usuario_id=args.usuario_id,
        )

        print("\n" + "=" * 60)
        print("RESUMEN ETL")
        print("=" * 60)
        print(f"Elecciones procesadas: {len(resultado['elecciones_procesadas'])}")
        print(f"Total registros leídos: {resultado['total_registros_leidos']}")
        print(f"Total registros válidos: {resultado['total_registros_validos']}")
        print(f"Total registros rechazados: {resultado['total_registros_rechazados']}")
        if resultado["errores"]:
            print(f"\nErrores ({len(resultado['errores'])}):")
            for e in resultado["errores"]:
                print(f"  - {e}")
        print("=" * 60)

    except Exception as e:
        logger.error(f"Error fatal en ETL: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()