@echo off
:: Script para crear acceso directo en el escritorio
echo Creando acceso directo en el escritorio...

:: Ruta al ejecutable
set EJECUTABLE=D:\jpVerito\ejecutar-jp-verito.bat

:: Ruta al escritorio
for /f "tokens=2* delims= " %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v Desktop') do set ESCRITORIO=%%b

:: Crear el archivo .lnk mediante VBScript
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\createShortcut.vbs"
echo sLinkFile = "%ESCRITORIO%\JP Verito - Sistema.lnk" >> "%TEMP%\createShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\createShortcut.vbs"
echo oLink.TargetPath = "%EJECUTABLE%" >> "%TEMP%\createShortcut.vbs"
echo oLink.Description = "Sistema de Gestión JP Verito" >> "%TEMP%\createShortcut.vbs"
echo oLink.WorkingDirectory = "D:\jpVerito" >> "%TEMP%\createShortcut.vbs"
echo oLink.IconLocation = "D:\jpVerito\cliente\public\favicon.ico, 0" >> "%TEMP%\createShortcut.vbs"
echo oLink.Save >> "%TEMP%\createShortcut.vbs"

:: Ejecutar el script VBScript
cscript //nologo "%TEMP%\createShortcut.vbs"

:: Eliminar el archivo VBScript temporal
del "%TEMP%\createShortcut.vbs"

echo Acceso directo creado exitosamente en el escritorio.
echo.
pause
