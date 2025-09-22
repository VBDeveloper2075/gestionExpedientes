@echo off
TITLE JP Verito - Ejecutable
COLOR 0A
cls
echo.
echo ======================================
echo    SISTEMA DE GESTIÓN JP VERITO
echo ======================================
echo.
echo Iniciando el Sistema de Gestión JP Verito...
echo.
echo Este programa iniciará todos los componentes necesarios
echo para usar el sistema completo.
echo.
echo Por favor espere mientras se inician los servicios...
echo.
echo [IMPORTANTE]: No cierre esta ventana mientras usa la aplicación.
echo.
timeout /t 3 >nul

:: Verificar si npm está disponible
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm no está disponible en el sistema.
    echo.
    echo Por favor, instale Node.js desde https://nodejs.org/
    echo y reinicie este programa.
    echo.
    pause
    exit /b 1
)

:: Iniciar servidor y cliente
echo.
echo Iniciando el servidor...
start cmd /k "cd /d D:\jpVerito\servidor && npm start"

:: Dar tiempo al servidor para iniciar
echo Esperando a que el servidor inicie (10 segundos)...
timeout /t 10 >nul

:: Iniciar el cliente
echo.
echo Iniciando la interfaz de usuario...
start cmd /k "cd /d D:\jpVerito\cliente && npm start"

:: Mostrar mensaje final
cls
echo.
echo ======================================
echo    SISTEMA DE GESTIÓN JP VERITO
echo ======================================
echo.
echo El sistema se está iniciando...
echo.
echo Una vez que el navegador se abra automáticamente,
echo podrá acceder al sistema usando sus credenciales.
echo.
echo [IMPORTANTE]: 
echo - No cierre esta ventana mientras usa el sistema.
echo - Para detener el sistema, cierre esta ventana y luego
echo   las ventanas de comando que se abrieron.
echo.
echo [Navegación]: 
echo - El sistema estará disponible en: http://localhost:3000
echo - El servidor API corre en: http://localhost:5000
echo.
echo Presione cualquier tecla para finalizar el sistema...
pause >nul

:: Al presionar cualquier tecla, terminar todos los procesos
echo.
echo Finalizando procesos...
taskkill /f /im node.exe >nul 2>nul
echo Sistema finalizado.
timeout /t 2 >nul
exit
