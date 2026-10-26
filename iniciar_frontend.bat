@echo off
title VetCare - Frontend React
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"

echo =========================================================
echo  🐾 VetCare — Cliente Frontend (React + Vite)
echo =========================================================
echo  URL: http://localhost:5173
echo =========================================================
echo.

npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo iniciar el frontend.
    pause
)
