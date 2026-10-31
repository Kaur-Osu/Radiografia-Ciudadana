"""Regenerate the display map using real INEGI state boundaries. Requires shapely."""
import hashlib
import json
from datetime import date
from pathlib import Path
from urllib.request import urlopen
from shapely.geometry import shape, mapping

def main():
    root=Path(__file__).resolve().parents[3]
    url='https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgee/'
    with urlopen(url,timeout=180) as response:
        raw=response.read()
    source=json.loads(raw)
    features=[]
    for feature in source['features']:
        geometry=shape(feature['geometry']).simplify(0.005,preserve_topology=True)
        if not geometry.is_valid or geometry.is_empty:
            raise ValueError('Geometría inválida en la fuente')
        features.append(dict(type='Feature',properties=dict(clave_entidad=feature['properties']['cve_ent'],nombre=feature['properties']['nomgeo']),geometry=mapping(geometry)))
    if len(features)!=32:
        raise ValueError('Se requieren las 32 entidades')
    output=json.dumps(dict(type='FeatureCollection',features=features),ensure_ascii=False,separators=(',',':'))
    for folder in ['frontend/public/data/geojson','backend/app/data/geojson']:
        destination=root/folder/'mexico_entidades_simplificado.geojson'
        destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_text(output,encoding='utf-8')
    metadata=dict(fuente='INEGI, Marco Geoestadístico',url=url,fecha_descarga=str(date.today()),sha256_original=hashlib.sha256(raw).hexdigest(),simplificacion_grados=0.005,uso='Visualización estatal; no sustituye la cartografía electoral histórica del INE.')
    (root/'data/cartografia-metadata.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
    print('32 geometrías generadas a partir del INEGI')

if __name__=='__main__':
    main()
