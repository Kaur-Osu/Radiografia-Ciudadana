from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from .database import get_db
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .config import settings
from .api import elections, territories, participation, comparisons, profiles

app = FastAPI(
    title='Radiografía de Participación Ciudadana',
    description='API para análisis, visualización y caracterización de la participación electoral en México.',
    version='0.1.0',
)

# CORS para desarrollo local (frontend en Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Montar routers públicos bajo /api/v1
app.include_router(elections.router, prefix='/api/v1')
app.include_router(territories.router, prefix='/api/v1')
app.include_router(participation.router, prefix='/api/v1')
app.include_router(comparisons.router, prefix='/api/v1')
app.include_router(profiles.router, prefix='/api/v1')


@app.get('/health', tags=['Sistema'])
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail='Base de datos no disponible')
    return {'status': 'ok', 'service': 'radiografia-ciudadana-api'}


@app.get('/favicon.ico', tags=['Sistema'], include_in_schema=False)
def favicon():
    return Response(status_code=204)


@app.get('/', tags=['Sistema'])
def root():
    return {
        'mensaje': 'Radiografía de Participación Ciudadana — API',
        'version': '0.1.0',
        'entorno': settings.ENVIRONMENT,
    }
