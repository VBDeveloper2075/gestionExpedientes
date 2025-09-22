@echo off
TITLE JP Verito - Sistema de Gestión Educativa
COLOR 0A
cls
echo.
echo ===========================================
echo    SISTEMA DE GESTION EDUCATIVA JP VERITO
echo ===========================================
echo.
echo Bienvenido al Sistema de Gestión Educativa JP Verito
echo Este script iniciará la aplicación completa
echo.
echo Por favor seleccione una opción:
echo.
echo 1. Iniciar aplicación completa (servidor y cliente)
echo 2. Iniciar solo el servidor
echo 3. Iniciar solo el cliente
echo 4. Inicializar/Reiniciar base de datos
echo 5. Verificar estado de la aplicación
echo 6. Salir
echo.

set /p opcion="Seleccione una opción (1-6): "

if "%opcion%"=="1" goto iniciar_completo
if "%opcion%"=="2" goto iniciar_servidor
if "%opcion%"=="3" goto iniciar_cliente
if "%opcion%"=="4" goto inicializar_bd
if "%opcion%"=="5" goto verificar_estado
if "%opcion%"=="6" goto salir

echo Opción inválida. Por favor, intente nuevamente.
timeout /t 3 >nul
cls
goto :eof

:iniciar_completo
cls
echo.
echo Iniciando aplicación completa (servidor y cliente)...
echo.
echo [NOTA] Para detener la aplicación, cierre esta ventana o presione Ctrl+C
echo.
call npm run dev
goto :eof

:iniciar_servidor
cls
echo.
echo Iniciando el servidor...
echo.
echo [NOTA] Para detener el servidor, cierre esta ventana o presione Ctrl+C
echo.
cd servidor
call npm start
goto :eof

:iniciar_cliente
cls
echo.
echo Iniciando el cliente...
echo.
echo [NOTA] Para detener el cliente, cierre esta ventana o presione Ctrl+C
echo.
cd cliente
call npm start
goto :eof

:inicializar_bd
cls
echo.
echo Inicializando/Reiniciando base de datos...
echo.
echo ADVERTENCIA: Esta operación eliminará todos los datos existentes.
echo.
set /p confirmacion="¿Está seguro de querer continuar? (S/N): "
if /i "%confirmacion%"=="S" (
  call npm run init-db
  echo.
  echo Base de datos inicializada correctamente.
  echo.
  pause
) else (
  echo.
  echo Operación cancelada.
  echo.
  pause
)
cls
call %0
goto :eof

:verificar_estado
cls
echo.
echo Verificando estado de la aplicación...
echo.
call npm run health
echo.
cd servidor
node scripts/checkServer.js
cd ..
echo.
pause
cls
call %0
goto :eof

:salir
echo.
echo Gracias por usar el Sistema de Gestión Educativa JP Verito.
echo.
timeout /t 3 >nul
exit
