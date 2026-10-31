"""Read official state files in chunks, retaining counts and source provenance."""
from pathlib import Path
import pandas as pd
from app.etl.extract import calcular_hash_archivo, listar_csv_por_eleccion

def resumir_archivo(path, year):
    path = Path(path)
    # INE archives contain Windows-1252 text, not UTF-8 (e.g. Jesús María).
    try:
        with path.open(encoding='utf-8-sig') as text:
            for line in text:
                pass
        encoding = 'utf-8-sig'
    except UnicodeDecodeError:
        encoding = 'cp1252'
    totals = {}
    read = 0
    for chunk in pd.read_csv(path, encoding=encoding, dtype=str, chunksize=100_000):
        required = {'AELEC', 'EDOCVE', 'EDONOM', 'LN', 'SV', 'NV', 'NS'}
        if not required.issubset(chunk.columns):
            raise ValueError(f'{path.name}: faltan columnas {required - set(chunk.columns)}')
        if not pd.to_numeric(chunk.AELEC, errors='raise').eq(year).all():
            raise ValueError(f'{path.name}: año incorrecto')
        if chunk.EDONOM.isna().any() or chunk.EDONOM.str.strip().eq('').any():
            raise ValueError(f'{path.name}: nombre de entidad ausente')
        for col in ['LN', 'SV', 'NV', 'NS']:
            if not chunk[col].str.fullmatch(r'[0-9]+').fillna(False).all():
                raise ValueError(f'{path.name}: se requieren conteos enteros en {col}')
            values = pd.to_numeric(chunk[col], errors='raise')
            if values.isna().any() or (values < 0).any() or (values > 2**63-1).any():
                raise ValueError(f'{path.name}: conteos inválidos en {col}')
            chunk[col] = values.astype('int64')
        if (chunk.SV > chunk.LN).any() or (chunk.NV > chunk.LN-chunk.SV).any() or (chunk.LN-chunk.SV-chunk.NV != chunk.NS).any():
            raise ValueError(f'{path.name}: LN no coincide con SV + NV + NS')
        chunk['EDOCVE'] = chunk.EDOCVE.str.strip().str.zfill(2)
        if not chunk.EDOCVE.isin([f'{n:02}' for n in range(1,33)]).all():
            raise ValueError(f'{path.name}: clave de entidad inválida')
        if sum(chunk.LN.tolist()) > 2**63-1:
            raise ValueError(f'{path.name}: suma de electores fuera del rango admitido')
        grouped = chunk.groupby(['EDOCVE','EDONOM'])[['LN','SV']].sum()
        for (clave, nombre), row in grouped.iterrows():
            item = totals.setdefault(clave, dict(clave=clave, nombre=nombre, electores=0, votantes=0))
            item['electores'] += int(row.LN)
            item['votantes'] += int(row.SV)
            if item['electores'] > 2**63-1:
                raise ValueError(f'{path.name}: total de electores fuera del rango admitido')
        read += len(chunk)
    if not read:
        raise ValueError(f'{path.name}: archivo vacío')
    return dict(archivo=path.name, sha256=calcular_hash_archivo(path), registros_leidos=read,
                entidades=list(totals.values()))

def resumir_eleccion(data_path, year):
    files = listar_csv_por_eleccion(Path(data_path), year)
    if not files:
        raise FileNotFoundError(f'No hay CSV oficiales para {year}')
    sources = [resumir_archivo(path, year) for path in files]
    keys = [e['clave'] for source in sources for e in source['entidades']]
    if len(keys) != 32 or set(keys) != {f'{n:02}' for n in range(1,33)}:
        raise ValueError(f'{year}: se requieren exactamente las 32 entidades, sin archivos duplicados')
    return sources
