@echo off
title VetCare - Iniciador del Sistema
echo =========================================================
echo  🐾 Iniciando VetCare (Backend + Frontend)
echo =========================================================

start "VetCare Backend (Puerto 4000)" cmd /k "%~dp0iniciar_backend.bat"
timeout /t 3 /nobreak >nul
start "VetCare Frontend (Puerto 5173)" cmd /k "%~dp0iniciar_frontend.bat"

echo.
echo ✅ Ambos servicios han sido lanzados en ventanas separadas.
echo 🌐 Abriendo http://localhost:5173 en su navegador...
timeout /t 2 /nobreak >nul
start http://localhost:5173
