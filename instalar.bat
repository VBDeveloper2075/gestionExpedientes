@echo off
TITLE JP Verito - Instalación
COLOR 0A
cls
echo.
echo ================================================
echo    INSTALADOR DEL SISTEMA DE GESTIÓN JP VERITO
echo ================================================
echo.
echo Bienvenido al instalador del Sistema de Gestión JP Verito
echo Este script realizará la instalación y configuración inicial.
echo.
echo [REQUISITOS]:
echo - Node.js 18.x o superior instalado
echo - MySQL instalado y en ejecución
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado en este sistema.
    echo Por favor, instale Node.js desde https://nodejs.org/
    echo y luego ejecute este instalador nuevamente.
    echo.
    pause
    exit /b 1
)

:: Verificar versión de Node.js
for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
echo Versión de Node.js detectada: %NODE_VERSION%

:: Menú de instalación
echo.
echo Por favor seleccione una opción:
echo.
echo 1. Instalación completa (recomendado)
echo 2. Instalación del servidor
echo 3. Instalación del cliente
echo 4. Configurar base de datos
echo 5. Crear acceso directo en el escritorio
echo 6. Salir
echo.

set /p opcion="Seleccione una opción (1-6): "

if "%opcion%"=="1" goto instalacion_completa
if "%opcion%"=="2" goto instalacion_servidor
if "%opcion%"=="3" goto instalacion_cliente
if "%opcion%"=="4" goto configurar_bd
if "%opcion%"=="5" goto crear_acceso
if "%opcion%"=="6" goto salir

echo Opción inválida. Por favor, intente nuevamente.
timeout /t 3 >nul
goto :eof

:instalacion_completa
cls
echo.
echo Iniciando instalación completa...
echo.
call npm install
cd cliente
call npm install
cd ..
cd servidor
call npm install
cd ..
echo.
echo ¿Desea configurar la base de datos ahora? (S/N)
set /p config_db="> "
if /i "%config_db%"=="S" goto configurar_bd
echo.
echo ¿Desea crear un acceso directo en el escritorio? (S/N)
set /p crear_acc="> "
if /i "%crear_acc%"=="S" call crear-acceso-directo.bat
echo.
echo Instalación completa finalizada.
pause
goto salir

:instalacion_servidor
cls
echo.
echo Instalando dependencias del servidor...
cd servidor
call npm install
cd ..
echo.
echo Instalación del servidor finalizada.
pause
cls
call %0
goto :eof

:instalacion_cliente
cls
echo.
echo Instalando dependencias del cliente...
cd cliente
call npm install
cd ..
echo.
echo Instalación del cliente finalizada.
pause
cls
call %0
goto :eof

:configurar_bd
cls
echo.
echo Configuración de la base de datos
echo.
echo Por favor, ingrese los siguientes datos para configurar la base de datos:
echo (Presione Enter para usar los valores por defecto)
echo.
set /p db_host="Host [localhost]: "
if "%db_host%"=="" set db_host=localhost

set /p db_port="Puerto [3306]: "
if "%db_port%"=="" set db_port=3306

set /p db_name="Nombre de la base de datos [jp3_db]: "
if "%db_name%"=="" set db_name=jp3_db

set /p db_user="Usuario [root]: "
if "%db_user%"=="" set db_user=root

set /p db_pass="Contraseña: "

:: Crear archivo .env con la configuración
echo # Configuración de la Base de Datos > .env
echo DB_HOST=%db_host% >> .env
echo DB_PORT=%db_port% >> .env
echo DB_NAME=%db_name% >> .env
echo DB_USER=%db_user% >> .env
echo DB_PASSWORD=%db_pass% >> .env
echo PORT=5000 >> .env
echo JWT_SECRET=jp3verito2025secretkey >> .env
echo NODE_ENV=production >> .env

echo.
echo Archivo de configuración .env creado con éxito.

:: Preguntar si desea inicializar la base de datos
echo.
echo ¿Desea inicializar la base de datos ahora? (S/N)
set /p init_db="> "
if /i "%init_db%"=="S" (
  call npm run init-db
  echo.
  echo Base de datos inicializada correctamente.
)

echo.
pause
cls
call %0
goto :eof

:crear_acceso
cls
call crear-acceso-directo.bat
cls
call %0
goto :eof

:salir
echo.
echo Gracias por instalar el Sistema de Gestión JP Verito.
echo.
echo Para ejecutar la aplicación, utilice:
echo - ejecutar-jp-verito.bat (Ejecución simple)
echo - iniciar-aplicacion.bat (Opciones avanzadas)
echo.
timeout /t 5 >nul
exit
