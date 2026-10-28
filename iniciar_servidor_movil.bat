@echo off
title Servidor Local Geovisor SSR (AquaVisor)
chcp 65001 >nul
color 0B
echo =============================================================
echo    🚀 INICIANDO SERVIDOR LOCAL GEOVISOR SSR (AQUAVISOR)
echo =============================================================
echo.
echo Verificando entorno...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No se encontró Node.js instalado en el sistema.
    pause
    exit /b
)

echo Abriendo emulador en tu navegador...
start "" http://localhost:5500/emulador.html
node server.js
pause
