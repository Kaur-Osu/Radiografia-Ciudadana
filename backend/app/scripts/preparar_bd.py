"""Prepare a new database from the snapshot; never overwrite existing tables."""
import hashlib
from pathlib import Path
import re
import sys
import time

import pymysql
from pymysql.constants import CLIENT
from app.config import settings


def connect():
    for attempt in range(10):
        try:
            return pymysql.connect(host=settings.DB_HOST, port=settings.DB_PORT,
                user=settings.DB_USER, password=settings.DB_PASSWORD, charset='utf8mb4',
                connect_timeout=3, read_timeout=60, client_flag=CLIENT.MULTI_STATEMENTS)
        except pymysql.MySQLError as error:
            if error.args[0] not in (2002, 2003) or attempt == 9:
                raise
            time.sleep(1)


def prepare_database():
    name = settings.DB_NAME
    if not re.fullmatch(r'[A-Za-z0-9_]{1,64}', name):
        raise RuntimeError('DB_NAME debe contener solo letras, numeros o guion bajo (maximo 64).')
    snapshot = Path(__file__).resolve().parents[3] / 'database/snapshot_radiografia_ciudadana.sql'
    lock_name = hashlib.sha256(f'radiografia.setup.{name}'.encode()).hexdigest()
    with connect() as db, db.cursor() as cursor:
        cursor.execute('SELECT GET_LOCK(%s, 15)', (lock_name,))
        if cursor.fetchone()[0] != 1:
            raise RuntimeError('Hay otra preparacion de la base en curso. Vuelve a intentarlo.')
        try:
            cursor.execute('SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=%s', (name,))
            fresh = cursor.fetchone()[0] == 0
            if fresh:
                if not snapshot.is_file():
                    raise RuntimeError('Falta database/snapshot_radiografia_ciudadana.sql. Descarga el proyecto completo.')
                script = snapshot.read_text(encoding='utf-8-sig').replace('`radiografia_ciudadana`', f'`{name}`')
                print('Preparando una base nueva con los datos oficiales...')
                cursor.execute(script)
                while cursor.nextset():
                    pass
                db.commit()
            cursor.execute(f'''
                SELECT e.anio, COUNT(*), COUNT(DISTINCT t.clave), SUM(p.electores)
                FROM `{name}`.participacion_electoral p
                JOIN `{name}`.elecciones e ON e.id=p.eleccion_id
                JOIN `{name}`.territorios t ON t.id=p.territorio_id
                JOIN `{name}`.segmentos_demograficos s ON s.id=p.segmento_id
                WHERE t.tipo='ENTIDAD' AND s.codigo='GENERAL' AND e.anio IN (2018,2021,2024)
                GROUP BY e.anio ORDER BY e.anio
            ''')
            rows = cursor.fetchall()
            if [r[0] for r in rows] != [2018,2021,2024] or any(r[1] != 32 or r[2] != 32 or not r[3] for r in rows):
                raise RuntimeError('La base existe, pero sus datos estan incompletos. No se modificaron las tablas existentes; revisa la carga de datos.')
            print('MySQL conectado. Base lista: 2018, 2021 y 2024; 96 totales por entidad.')
            if not fresh:
                print('Se conservaron los datos existentes.')
            return fresh
        finally:
            cursor.execute('SELECT RELEASE_LOCK(%s)', (lock_name,))


def main():
    try:
        prepare_database()
        return 0
    except pymysql.MySQLError as error:
        code = error.args[0]
        if code == 1045:
            print('MySQL rechazo el acceso. Revisa DB_USER y DB_PASSWORD en backend/.env.', file=sys.stderr)
        elif code in (2002,2003):
            print('No se pudo conectar con MySQL. Revisa el servicio, DB_HOST y DB_PORT.', file=sys.stderr)
        else:
            print(f'No se pudo preparar la base (MySQL {code}). Si ya existe, revisa su estructura antes de restaurar datos.', file=sys.stderr)
        return 1
    except (RuntimeError, OSError) as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
