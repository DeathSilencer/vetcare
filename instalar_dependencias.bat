@echo off
chcp 65001 > nul
title VetCare - Instalador Automático de Dependencias
set "PATH=C:\Program Files\nodejs;%PATH%"

echo =========================================================
echo  🐾 VETCARE — INSTALACIÓN DEL ENTORNO LOCAL
echo =========================================================
echo.

node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no está instalado o no se encuentra en el PATH.
    echo Por favor instale Node.js versión 18 o superior desde: https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Configurando variables de entorno...
if not exist "%~dp0backend\.env" (
    copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    echo       Se creó backend\.env a partir de .env.example
) else (
    echo       backend\.env ya existe. Se conserva la configuración.
)

echo.
echo [2/3] Instalando dependencias del Backend (Express + TypeScript + MySQL2)...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo [ERROR] Falló la instalación de dependencias del backend.
    pause
    exit /b 1
)

echo.
echo [3/3] Instalando dependencias del Frontend (React + Vite + Tailwind CSS)...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 (
    echo [ERROR] Falló la instalación de dependencias del frontend.
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo =========================================================
echo  ✅ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo =========================================================
echo.
echo  Pasos siguientes:
echo   1. Asegúrate de iniciar MySQL en XAMPP.
echo   2. Si no has cargado la base de datos, ejecuta 'cargar_base_datos.bat'
echo      o importa 'database\vetcare_completo.sql' en phpMyAdmin.
echo   3. Haz doble clic en 'iniciar_todo.bat' para abrir el sistema.
echo =========================================================
echo.
pause
