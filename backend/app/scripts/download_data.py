"""Download and safely extract the official archives recorded in the manifest."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
from urllib.request import urlopen
from zipfile import ZipFile

def main():
    root = Path(__file__).resolve().parents[3]
    parser = argparse.ArgumentParser(description='Descarga de los datos oficiales del INE')
    parser.add_argument('--anios', type=int, nargs='+', default=[2018,2021,2024])
    parser.add_argument('--ruta-datos', type=Path, default=root/'data')
    args = parser.parse_args()
    manifest = json.loads((root/'data/fuentes-manifest.json').read_text(encoding='utf-8'))
    target = args.ruta_datos.resolve()
    cache = target/'.downloads'
    cache.mkdir(parents=True,exist_ok=True)
    for year in args.anios:
        source = manifest[str(year)]
        archive = cache/f'{year}.zip'
        if not archive.exists():
            partial = archive.with_suffix('.part')
            with urlopen(source['url'],timeout=120) as response, partial.open('wb') as output:
                shutil.copyfileobj(response, output)
            partial.replace(archive)
        with archive.open('rb') as archive_file:
            digest=hashlib.file_digest(archive_file,'sha256').hexdigest()
        if digest != source['sha256']:
            raise ValueError(f'{year}: el SHA-256 no coincide; revisar la fuente antes de importar')
        with ZipFile(archive) as z:
            for entry in z.infolist():
                if not (target/entry.filename).resolve().is_relative_to(target):
                    raise ValueError('Ruta insegura dentro del archivo ZIP')
            z.extractall(target)
        print(f'{year}: descargado, verificado y extraído')

if __name__ == '__main__':
    main()
