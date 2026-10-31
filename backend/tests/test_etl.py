import pytest
from app.etl.official import resumir_archivo, resumir_eleccion
from app.services.profile_service import clasificar_perfil_simple
from app.services.participation_service import calcular_participacion_pct

def test_counts_and_encoding(tmp_path):
    csv=tmp_path/'official.csv'
    csv.write_bytes(('AELEC,EDOCVE,EDONOM,LN,SV,NV,NS\n2024,1,MÉXICO,100,60,30,10\n2024,1,MÉXICO,50,20,30,0\n').encode('cp1252'))
    result=resumir_archivo(csv,2024)
    assert result['registros_leidos']==2
    assert result['entidades']==[{'clave':'01','nombre':'MÉXICO','electores':150,'votantes':80}]
    assert len(result['sha256'])==64
    assert resumir_archivo(csv,2024)==result

def test_incomplete_and_invalid_data_fail(tmp_path):
    with pytest.raises(FileNotFoundError): resumir_eleccion(tmp_path,2024)
    csv=tmp_path/'bad.csv'
    csv.write_text('AELEC,EDOCVE,EDONOM,LN,SV,NV,NS\n2024,1,Estado,10,11,0,0\n')
    with pytest.raises(ValueError): resumir_archivo(csv,2024)
    with pytest.raises(ValueError): resumir_archivo(csv,2021)

@pytest.mark.parametrize('actual,ref,variation,expected',[(70,60,1,'PERF-01'),(60,60,4,'PERF-02'),(60,60,-4,'PERF-03'),(50,60,0,'PERF-04'),(60,60,None,'PERF-05'),(60,60,3,'PERF-05'),(60,60,-3,'PERF-05')])
def test_profile_thresholds(actual,ref,variation,expected):
    assert clasificar_perfil_simple(actual,ref,variation)==expected

def test_zero_denominator():
    assert calcular_participacion_pct(0,0) is None
    assert calcular_participacion_pct(0,100)==0
