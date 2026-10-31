"""Atomic, repeatable import: validate a complete election before updating MySQL."""
from datetime import datetime, timezone
from pathlib import Path
from app.config import settings
from app.database import SessionLocal
from app.etl.official import resumir_eleccion
from app.etl.load import asegurar_eleccion, asegurar_segmento_general
from app.models.territory import Territorio
from app.models.participation import ParticipacionElectoral
from app.models.fuente_datos import FuenteDatos
from app.models.lote_importacion import LoteImportacion

def ejecutar_etl(anios_eleccion, ruta_datos=None, usuario_id=None):
    result = dict(elecciones_procesadas=[], total_registros_leidos=0,
                  total_registros_validos=0, total_registros_rechazados=0, errores=[])
    for year in anios_eleccion:
        # No database writes happen until all 32 sources pass validation.
        sources = resumir_eleccion(Path(ruta_datos or settings.DATA_PATH), year)
        with SessionLocal() as db, db.begin():
            election_id = asegurar_eleccion(db, year, f'Elección federal {year}')
            segment_id = asegurar_segmento_general(db)
            territories = {t.clave: t for t in db.query(Territorio).filter_by(tipo='ENTIDAD')}
            if set(territories) != {f'{n:02}' for n in range(1,33)}:
                raise ValueError('El catálogo debe contener las 32 entidades; ejecutar seed primero')
            for source in sources:
                origin = db.query(FuenteDatos).filter_by(hash_sha256=source['sha256']).first()
                if not origin:
                    origin = FuenteDatos(institucion='INE', nombre=f'Conteos Censales {year}',
                        nombre_archivo=source['archivo'], hash_sha256=source['sha256'], version=str(year),
                        url_oficial='https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/')
                    db.add(origin); db.flush()
                batch = LoteImportacion(fuente_id=origin.id, usuario_id=usuario_id,
                    registros_leidos=source['registros_leidos'], registros_validos=source['registros_leidos'],
                    registros_rechazados=0, estado='COMPLETADO', fecha_fin=datetime.now(timezone.utc).replace(tzinfo=None))
                db.add(batch); db.flush()
                for state in source['entidades']:
                    territory = territories[state['clave']]
                    row = db.query(ParticipacionElectoral).filter_by(eleccion_id=election_id,
                        territorio_id=territory.id, segmento_id=segment_id).first()
                    if not row:
                        row = ParticipacionElectoral(eleccion_id=election_id, territorio_id=territory.id, segmento_id=segment_id)
                        db.add(row)
                    row.electores, row.votantes = state['electores'], state['votantes']
                    row.fuente_id, row.lote_importacion_id = origin.id, batch.id
        count = sum(s['registros_leidos'] for s in sources)
        result['elecciones_procesadas'].append(dict(anio=year, archivos_procesados=len(sources),
            registros_leidos=count, registros_validos=count, registros_rechazados=0, entidades_cargadas=32, errores=[]))
        result['total_registros_leidos'] += count
        result['total_registros_validos'] += count
    return result
