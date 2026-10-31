@echo off
setlocal
cd /d "%~dp0"

if not exist "backend\.venv\Scripts\python.exe" (
    echo Falta el entorno de Python. Sigue la preparacion inicial de COMO-EJECUTAR.txt.
    exit /b 1
)
if not exist "backend\.env" (
    echo Falta backend\.env. Copia backend\.env.example y configura tu acceso a MySQL.
    exit /b 1
)

set "MYSQL_SERVICE=MySQL80"
if not "%~1"=="" set "MYSQL_SERVICE=%~1"
sc query "%MYSQL_SERVICE%" >nul 2>&1
if errorlevel 1 (
    echo No se encontro el servicio %MYSQL_SERVICE%.
    echo Instala MySQL o ejecuta: iniciar_bd.bat NombreDelServicio
    exit /b 1
)
sc query "%MYSQL_SERVICE%" | findstr /C:"RUNNING" >nul
if errorlevel 1 (
    echo Iniciando el servicio %MYSQL_SERVICE%...
    net start "%MYSQL_SERVICE%"
    if errorlevel 1 (
        echo No se pudo iniciar MySQL. Ejecuta la terminal como administrador.
        exit /b 1
    )
)

pushd "%~dp0backend"
".venv\Scripts\python.exe" -m app.scripts.preparar_bd
set "RESULT=%ERRORLEVEL%"
popd
exit /b %RESULT%
