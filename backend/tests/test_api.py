"""Integration tests against the locally seeded MySQL database (read-only)."""
import itertools
from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

def elections():
    response = client.get('/api/v1/elecciones')
    assert response.status_code == 200, response.text
    return response.json()

def test_elections_and_indicators():
    assert [e['anio'] for e in elections()] == [2018, 2021, 2024]
    for election in elections():
        summary = client.get(f"/api/v1/elecciones/{election['id']}/resumen")
        assert summary.status_code == 200, summary.text
        summary = summary.json()
        response = client.get('/api/v1/participacion/mapa',params={'eleccion_id':election['id']})
        assert response.status_code == 200, response.text
        states = response.json()
        assert len(states) == 32
        assert len({s['territorio_clave'] for s in states}) == 32
        assert sum(s['electores'] for s in states) == summary['electores']
        assert sum(s['votantes'] for s in states) == summary['votantes']
        assert summary['participacion_pct'] == round(summary['votantes']/summary['electores']*100,2)
        assert round(summary['participacion_pct'] + summary['abstencion_pct'],2) == 100

@pytest.mark.parametrize('initial,final',list(itertools.permutations([1,2,3],2)))
def test_comparison_contract(initial,final):
    response = client.get('/api/v1/participacion/comparar',params={
        'eleccion_inicial':initial,'eleccion_final':final,'territorio_id':0})
    assert response.status_code == 200, response.text
    data=response.json()
    assert data['eleccion_inicial_anio'] in [2018,2021,2024]
    assert data['eleccion_final_anio'] in [2018,2021,2024]
    assert data['variacion_pp'] == round(data['participacion_final']-data['participacion_inicial'],2)
    post=client.post('/api/v1/comparaciones',json={
        'eleccion_inicial_id':initial,'eleccion_final_id':final,'territorio_id':0})
    assert post.status_code == 200, post.text
    assert post.json()==data

def test_all_territory_views():
    states=client.get('/api/v1/territorios',params={'tipo':'ENTIDAD'}).json()
    for state in states:
        territory_id=state['id']
        assert client.get(f'/api/v1/territorios/{territory_id}').status_code == 200
        history=client.get(f'/api/v1/participacion/territorio/{territory_id}/historico')
        assert history.status_code == 200, history.text
        assert len(history.json()['datos']) == 3
        comparison = client.get('/api/v1/participacion/comparar',params={'eleccion_inicial':1,'eleccion_final':3,'territorio_id':territory_id})
        assert comparison.status_code == 200, comparison.text
        for election in elections():
            response=client.get(f'/api/v1/territorios/{territory_id}/participacion',params={'eleccion_id':election['id']})
            assert response.status_code == 200, response.text
            profile=client.get(f'/api/v1/perfiles/territorio/{territory_id}',params={'eleccion_referencia':election['id']})
            assert profile.status_code == 200, profile.text
            assert profile.json()['eleccion_referencia_anio']==election['anio']
            assert profile.json()['perfil_principal'] is not None

def test_national_history_and_validation():
    assert len(client.get('/api/v1/participacion/territorio/0/historico').json()['datos'])==3
    assert client.get('/api/v1/participacion/comparar',params={'eleccion_inicial':1,'eleccion_final':1,'territorio_id':0}).status_code==422
    assert client.get('/api/v1/participacion/comparar',params={'eleccion_inicial':999,'eleccion_final':3,'territorio_id':0}).status_code==404
    assert client.get('/api/v1/territorios/999999').status_code==404
    assert client.get('/api/v1/territorios/33/participacion',params={'eleccion_id':3}).status_code==200
    assert client.get('/health').status_code==200
