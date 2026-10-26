# 🐾 VetCare — Guía para Clonar y Ejecutar en Otra Computadora

Esta guía explica detalladamente cómo descargar y ejecutar el sistema **VetCare** en cualquier computadora con Windows desde cero, utilizando tu repositorio de Git.

---

## 📋 Requisitos Previos en la Nueva Computadora

Antes de comenzar, asegúrate de que la computadora tenga instalado lo siguiente:

1. **Git para Windows:** Descárgalo desde [https://git-scm.com](https://git-scm.com) (instalación estándar).
2. **Node.js (versión 18 o superior):** Descárgalo desde [https://nodejs.org](https://nodejs.org) (recomendada versión LTS).
3. **XAMPP (con MySQL/MariaDB):** Descárgalo desde [https://www.apachefriends.org](https://www.apachefriends.org).

---

## ⚡ Instalación Rápida con 1 Clic (Método Automático)

### Paso 1: Clonar el Repositorio
Abre la terminal (PowerShell o Git Bash) en la carpeta donde quieras guardar el proyecto y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/vetcare.git
cd vetcare
```
*(Reemplaza `TU_USUARIO` por tu nombre de usuario de GitHub).*

---

### Paso 2: Iniciar MySQL en XAMPP
1. Abre el panel de control de **XAMPP** (`xampp-control.exe`).
2. Haz clic en el botón **"Start"** del módulo **MySQL** (debe quedar en color verde, puerto `3306`).

---

### Paso 3: Instalar Dependencias Automáticamente
En la carpeta del proyecto, haz doble clic en:
👉 **`instalar_dependencias.bat`**

Este script automático:
- Verificará que Node.js esté instalado.
- Creará el archivo `backend\.env` a partir de la plantilla `.env.example`.
- Descargará todas las librerías necesarias del backend y del frontend (`npm install`).

---

### Paso 4: Cargar la Base de Datos con Todas las Tablas y Registros
En la carpeta del proyecto, haz doble clic en:
👉 **`cargar_base_datos.bat`**

Este script importará automáticamente el archivo `database\vetcare_completo.sql`, creando:
- La base de datos `vetcare`.
- Las 8 tablas originales del sistema.
- La tabla de `usuarios` y la tabla de `sessions`.
- Los **20 registros iniciales** por tabla.
- Los **3 usuarios de demostración** (`Admin123!`, `Recepcion123!`, `Vet123!`).

*(Si no usas XAMPP en la ruta por defecto `C:\xampp`, simplemente entra a `http://localhost/phpmyadmin`, crea la base `vetcare` e importa el archivo `database\vetcare_completo.sql`).*

---

### Paso 5: Iniciar el Sistema Completo
Haz doble clic en:
👉 **`iniciar_todo.bat`**

Se abrirán dos ventanas:
- Una con el **Backend** en `http://localhost:4000`.
- Otra con el **Frontend** en `http://localhost:5173`.
- Tu navegador web se abrirá automáticamente en:
  👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Credenciales de Acceso para la Demostración

| Rol | Correo Electrónico | Contraseña | Permisos y Vistas |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@vetcare.com` | `Admin123!` | Acceso total: CRUD completo, gestión de usuarios, dashboard y reportes. |
| **Recepción** | `recepcion@vetcare.com` | `Recepcion123!` | Propietarios, pacientes, agendamiento de citas y servicios. |
| **Veterinario** | `veterinario@vetcare.com` | `Vet123!` | Citas asignadas a su nombre e historiales clínicos. |

---

## 🧪 Verificación de Funcionamiento y Pruebas

Para comprobar que todo está funcionando al 100%:
Abre una terminal en la carpeta `backend` y ejecuta:
```bash
npm test
```
Verás la suite de pruebas automatizadas aprobando **11 de 11 pruebas (100.0%)**:
- Conexión PING a MySQL.
- Encriptación y verificación de bcrypt.
- Integridad referencial (bloqueo Error 1451).
- Operaciones CRUD completas.
- Transacciones ACID para citas y servicios múltiples.
- Consultas con 3 JOINs y agregaciones.
