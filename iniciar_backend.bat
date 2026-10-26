@echo off
title VetCare - Backend API
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0backend"

echo =========================================================
echo  🐾 VetCare — Servidor Backend (API REST)
echo =========================================================
echo  URL: http://localhost:4000
echo  Base de datos: MySQL (vetcare)
echo =========================================================
echo.

npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo iniciar el backend. Verifique que MySQL este activo en XAMPP.
    pause
)
