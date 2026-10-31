"""Create the project database only when it has no tables. Never drops data."""
from pathlib import Path
import pymysql
from pymysql.constants import CLIENT
from app.config import settings

def main():
    root = Path(__file__).resolve().parents[3]
    with pymysql.connect(host=settings.DB_HOST, port=settings.DB_PORT, user=settings.DB_USER,
            password=settings.DB_PASSWORD, charset='utf8mb4', client_flag=CLIENT.MULTI_STATEMENTS) as db:
        with db.cursor() as cursor:
            cursor.execute('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=%s', (settings.DB_NAME,))
            if cursor.fetchone()[0]:
                raise RuntimeError('La base ya contiene tablas; no se ejecutará el seed sobre datos existentes.')
            if settings.DB_NAME != 'radiografia_ciudadana':
                raise RuntimeError('Los scripts SQL iniciales requieren DB_NAME=radiografia_ciudadana')
            for name in ['schema_radiografia_participacion_ciudadana.sql', 'seed_radiografia_participacion_ciudadana.sql']:
                cursor.execute((root/'database'/name).read_text(encoding='utf-8-sig'))
                while cursor.nextset():
                    pass
        db.commit()
    print('Base de datos inicializada; ejecutar el ETL para cargar los datos oficiales.')

if __name__ == '__main__':
    main()
