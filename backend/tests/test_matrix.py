"""Exhaustive public API matrix against loaded data; read-only."""
import itertools
from concurrent.futures import ThreadPoolExecutor
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.mark.parametrize('territory',range(33))
@pytest.mark.parametrize('initial,final',list(itertools.permutations([1,2,3],2)))
def test_all_comparisons(territory,initial,final):
    client=TestClient(app,raise_server_exceptions=False)
    r=client.get('/api/v1/participacion/comparar',params={'eleccion_inicial':initial,'eleccion_final':final,'territorio_id':territory})
    assert r.status_code==200,r.text
    result=r.json()
    assert result['variacion_pp']==round(result['participacion_final']-result['participacion_inicial'],2)
    inverse=client.get('/api/v1/participacion/comparar',params={'eleccion_inicial':final,'eleccion_final':initial,'territorio_id':territory}).json()
    assert result['variacion_pp']==-inverse['variacion_pp']

@pytest.mark.parametrize('path',[
    '/api/v1/elecciones/not-an-id','/api/v1/territorios/1%20OR%201=1',
    '/api/v1/participacion/comparar','/api/v1/perfiles/territorio/1',
    '/api/v1/participacion/mapa?eleccion_id=1.5',
    '/api/v1/participacion/comparar?eleccion_inicial=1&eleccion_final=3&territorio_id=999999',
    '/api/v1/perfiles/territorio/-1?eleccion_referencia=3',
    '/api/v1/territorios/999999999999999999999999999999999999999999999',
])
def test_invalid_inputs_never_cause_server_error(path):
    r=TestClient(app,raise_server_exceptions=False).get(path)
    assert r.status_code in [404,422],r.text

def test_parallel_read_load():
    paths=['/api/v1/elecciones','/api/v1/elecciones/3/resumen','/api/v1/participacion/mapa?eleccion_id=3','/api/v1/perfiles/territorio/9?eleccion_referencia=3','/api/v1/participacion/comparar?eleccion_inicial=1&eleccion_final=3&territorio_id=0']*40
    def request(path):
        t=time.perf_counter();r=TestClient(app,raise_server_exceptions=False).get(path)
        return r.status_code,time.perf_counter()-t
    with ThreadPoolExecutor(max_workers=12) as pool:results=list(pool.map(request,paths))
    assert all(status==200 for status,_ in results),results
    durations=sorted(d for _,d in results)
    print(f'LOAD 200 requests, 12 concurrent: p95={durations[int(len(durations)*.95)]:.3f}s max={max(durations):.3f}s')
