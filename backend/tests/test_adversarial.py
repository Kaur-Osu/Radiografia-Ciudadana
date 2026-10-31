"""Isolated adversarial fixtures: never modify the user's MySQL database."""
import itertools
import pytest
from sqlalchemy import create_engine, BigInteger, event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.database import Base, get_db
from app.main import app
from app.models import Eleccion, Territorio, SegmentoDemografico, ParticipacionElectoral, Perfil
from app.services.participation_service import get_participacion_nacional
from app.etl.official import resumir_archivo, resumir_eleccion

@compiles(BigInteger,'sqlite')
def sqlite_bigint_as_integer(_type,_compiler,**_kwargs):
    return 'INTEGER'

@pytest.fixture
def isolated():
    engine=create_engine('sqlite://',connect_args={'check_same_thread':False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        db.add_all([SegmentoDemografico(id=17,codigo='GENERAL',descripcion='General',es_general=True),SegmentoDemografico(id=1,codigo='SEXO_H',descripcion='Hombres',es_general=False)])
        db.add_all([Eleccion(id=e,anio=y,nombre=str(y),tipo='FEDERAL',activa=True) for e,y in [(11,2018),(22,2021),(33,2024)]])
        db.add_all([Perfil(id=i,codigo=f'PERF-0{i}',nombre=f'Perfil {i}',activo=True) for i in range(1,6)])
        db.add_all([Territorio(id=400+i,clave=f'{i:02}',nombre=f'Entidad {i}',tipo='ENTIDAD') for i in range(1,33)])
        db.add(Territorio(id=9001,clave='00',nombre='Nacional',tipo='NACIONAL'))
        for n,(election,votes) in enumerate([(11,60),(22,50),(33,65)]):
            db.add_all([ParticipacionElectoral(id=n*32+i,eleccion_id=election,territorio_id=400+i,segmento_id=17,fuente_id=1,electores=100,votantes=votes) for i in range(1,33)])
        db.commit()
        app.dependency_overrides[get_db]=lambda: db
        try:
            yield db,TestClient(app,raise_server_exceptions=False)
        finally:
            app.dependency_overrides.pop(get_db,None)
    engine.dispose()

def test_general_segment_is_resolved_by_code(isolated):
    _,client=isolated
    params={'eleccion_inicial':11,'eleccion_final':33,'territorio_id':0}
    get=client.get('/api/v1/participacion/comparar',params=params)
    post=client.post('/api/v1/comparaciones',json={'eleccion_inicial_id':11,'eleccion_final_id':33,'territorio_id':0})
    assert get.status_code==post.status_code==200,(get.text,post.text)
    assert get.json()==post.json()
    assert post.json()['segmento_id']==17

def test_profiles_do_not_assume_segment_one(isolated):
    _,client=isolated
    r=client.get('/api/v1/perfiles/territorio/401',params={'eleccion_referencia':33})
    assert r.status_code==200,r.text
    assert r.json()['indicadores']['participacion_actual']==65

def test_requested_segment_metadata(isolated):
    db,client=isolated
    db.add_all([ParticipacionElectoral(id=1000+j,eleccion_id=e,territorio_id=401,segmento_id=1,fuente_id=1,electores=10,votantes=v) for j,(e,v) in enumerate([(11,5),(33,7)])]);db.commit()
    r=client.post('/api/v1/comparaciones',json={'eleccion_inicial_id':11,'eleccion_final_id':33,'territorio_id':401,'segmento_id':1})
    assert r.status_code==200,r.text
    assert r.json()['segmento_codigo']=='SEXO_H'

def test_national_not_doubled_by_other_levels_or_segments(isolated):
    db,_=isolated
    db.add_all([ParticipacionElectoral(id=1000,eleccion_id=33,territorio_id=9001,segmento_id=17,fuente_id=1,electores=3200,votantes=2080),ParticipacionElectoral(id=1001,eleccion_id=33,territorio_id=401,segmento_id=1,fuente_id=1,electores=50,votantes=20)]);db.commit()
    result=get_participacion_nacional(db,33)
    assert (result.electores,result.votantes)==(3200,2080)

def test_duplicate_state_cannot_impersonate_complete_national_data(isolated):
    db,_=isolated
    db.get(Territorio,432).tipo='MUNICIPIO'
    db.add(Territorio(id=999,clave='01',nombre='Duplicado',tipo='ENTIDAD'))
    db.add(ParticipacionElectoral(id=1000,eleccion_id=33,territorio_id=999,segmento_id=17,fuente_id=1,electores=100,votantes=65));db.commit()
    assert get_participacion_nacional(db,33) is None

def test_zero_electorate_is_not_reported_as_zero_participation(isolated):
    db,client=isolated
    row=db.query(ParticipacionElectoral).filter_by(eleccion_id=33,territorio_id=401,segmento_id=17).one()
    row.electores=row.votantes=0;db.commit()
    response=client.get('/api/v1/perfiles/territorio/401',params={'eleccion_referencia':33})
    assert response.status_code==404,response.text

@pytest.mark.parametrize('edonom',['','NA','NULL'])
def test_missing_state_name_cannot_silently_drop_electors(tmp_path,edonom):
    p=tmp_path/'bad.csv'
    p.write_text(f'AELEC,EDOCVE,EDONOM,LN,SV,NV,NS\n2024,1,Estado,100,60,40,0\n2024,1,{edonom},50,20,30,0\n',encoding='utf-8')
    with pytest.raises(ValueError):resumir_archivo(p,2024)

@pytest.mark.parametrize('counts',['-1,0,0,0','10,11,0,0','10,5,4,0','10.5,5,5.5,0','NaN,0,0,0','1e20,1e20,0,0'])
def test_malformed_counts_are_rejected(tmp_path,counts):
    p=tmp_path/'bad.csv';p.write_text(f'AELEC,EDOCVE,EDONOM,LN,SV,NV,NS\n2024,1,Estado,{counts}\n',encoding='utf-8')
    with pytest.raises((ValueError,OverflowError)):resumir_archivo(p,2024)

def test_missing_or_duplicated_state_files_rejected(tmp_path):
    directory=tmp_path/'DatosAbiertos_DECEyEC_ConteosCensales2024';directory.mkdir()
    for i in range(1,33):
        (directory/f'{i:02}.csv').write_text(f'AELEC,EDOCVE,EDONOM,LN,SV,NV,NS\n2024,{i},Estado {i},100,60,40,0\n',encoding='utf-8')
    assert len(resumir_eleccion(tmp_path,2024))==32
    (directory/'duplicate.csv').write_bytes((directory/'01.csv').read_bytes())
    with pytest.raises(ValueError):resumir_eleccion(tmp_path,2024)
    (directory/'duplicate.csv').unlink();(directory/'32.csv').unlink()
    with pytest.raises(ValueError):resumir_eleccion(tmp_path,2024)

def mock_sources():
    return [dict(archivo=f'{i}.csv',sha256=f'{i:064x}',registros_leidos=1,entidades=[dict(clave=f'{i:02}',nombre=f'Entidad {i}',electores=200,votantes=150)]) for i in range(1,33)]

def test_import_is_atomic_when_database_fails_midway(isolated,monkeypatch):
    from app.etl import pipeline
    from app.models import FuenteDatos,LoteImportacion
    db,_=isolated
    monkeypatch.setattr(pipeline,'resumir_eleccion',lambda *_:mock_sources())
    monkeypatch.setattr(pipeline,'SessionLocal',lambda:Session(db.bind))
    before=[(p.id,p.electores,p.votantes) for p in db.query(ParticipacionElectoral).order_by(ParticipacionElectoral.id)]
    db.commit()
    batches=0
    def fail_midway(conn,cursor,statement,parameters,context,executemany):
        nonlocal batches
        if 'INSERT INTO lotes_importacion' in statement:
            batches+=1
            if batches==16:raise RuntimeError('Simulated storage failure')
    event.listen(db.bind,'before_cursor_execute',fail_midway)
    try:
        with pytest.raises(RuntimeError,match='Simulated storage failure'):pipeline.ejecutar_etl([2024])
    finally:event.remove(db.bind,'before_cursor_execute',fail_midway)
    db.expire_all()
    after=[(p.id,p.electores,p.votantes) for p in db.query(ParticipacionElectoral).order_by(ParticipacionElectoral.id)]
    assert after==before
    assert db.query(FuenteDatos).count()==db.query(LoteImportacion).count()==0

def test_repeated_import_updates_existing_totals(isolated,monkeypatch):
    from app.etl import pipeline
    db,_=isolated
    monkeypatch.setattr(pipeline,'resumir_eleccion',lambda *_:mock_sources())
    monkeypatch.setattr(pipeline,'SessionLocal',lambda:Session(db.bind))
    for _ in range(2):assert pipeline.ejecutar_etl([2024])['total_registros_validos']==32
    db.expire_all()
    assert db.query(ParticipacionElectoral).count()==96
    national=get_participacion_nacional(db,33)
    assert (national.electores,national.votantes)==(6400,4800)
