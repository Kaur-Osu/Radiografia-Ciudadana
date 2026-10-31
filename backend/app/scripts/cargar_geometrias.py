"""Load display geometries atomically. Run: python -m app.scripts.cargar_geometrias"""
import json
from pathlib import Path
from app.database import SessionLocal
from app.models.territory import Territorio

def cargar_geometrias():
    path=Path(__file__).resolve().parents[1]/'data/geojson/mexico_entidades_simplificado.geojson'
    geojson=json.loads(path.read_text(encoding='utf-8'))
    if len(geojson['features'])!=32:
        raise ValueError('Se requieren 32 geometrías')
    with SessionLocal() as db, db.begin():
        territories={t.clave:t for t in db.query(Territorio).filter_by(tipo='ENTIDAD')}
        for feature in geojson['features']:
            key=feature['properties']['clave_entidad']
            if key not in territories:
                raise ValueError(f'Entidad ausente del catálogo: {key}')
            territories[key].geometria=json.dumps(feature['geometry'],ensure_ascii=False)
    print('32 geometrías guardadas; se pueden volver a cargar sin duplicarlas')

if __name__=='__main__':
    cargar_geometrias()
