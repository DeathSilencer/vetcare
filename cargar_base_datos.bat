@echo off
chcp 65001 > nul
title VetCare - Cargador de Base de Datos MySQL
echo =========================================================
echo  🐾 VETCARE — CARGA DE BASE DE DATOS (vetcare)
echo =========================================================
echo.

set "MYSQL_BIN="

if exist "C:\xampp\mysql\bin\mysql.exe" (
    set "MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe"
) else (
    where mysql >nul 2>&1
    if not errorlevel 1 (
        set "MYSQL_BIN=mysql"
    )
)

if "%MYSQL_BIN%"=="" (
    echo [AVISO] No se detectó mysql.exe en C:\xampp\mysql\bin ni en PATH.
    echo.
    echo Para cargar la base de datos manualmente:
    echo  1. Abre tu navegador en: http://localhost/phpmyadmin
    echo  2. Haz clic en la pestaña "Importar".
    echo  3. Selecciona el archivo: database\vetcare_completo.sql
    echo  4. Haz clic en "Continuar".
    echo.
    pause
    exit /b 0
)

echo Importando base de datos con mysql.exe...
"%MYSQL_BIN%" -u root < "%~dp0database\vetcare_completo.sql"

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo conectar a MySQL.
    echo Verifique que el servicio MySQL esté iniciado en el panel de XAMPP.
    echo Si su usuario root tiene contraseña, ejecute en phpMyAdmin: database\vetcare_completo.sql
) else (
    echo.
    echo =========================================================
    echo  ✅ ¡BASE DE DATOS CARGADA EXITOSAMENTE!
    echo =========================================================
    echo  Se crearon las 10 tablas, las 20 filas por tabla y los
    echo  3 usuarios de prueba (Admin, Recepción, Veterinario).
    echo =========================================================
)

echo.
pause
