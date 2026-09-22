@echo off
title Pan de Casa - Arranque General (MEAN Stack + Materialize CSS)
echo ==============================================================
echo 🥐 Iniciando Sistema Completo Pan de Casa (ADSO SENA)
echo    - Backend:  http://localhost:5000 (Node.js + Express + MongoDB)
echo    - Frontend: http://localhost:4200 (Angular + Materialize CSS)
echo ==============================================================
start "Pan de Casa Backend" cmd /c "%~dp0arrancar_backend.bat"
timeout /t 3 /nobreak >nul
start "Pan de Casa Frontend" cmd /c "%~dp0arrancar_frontend.bat"
echo.
echo Los dos servidores han sido iniciados en consolas independientes.
echo Puedes acceder a la tienda en: http://localhost:4200
echo Y a la consola de administración en: http://localhost:4200/admin (Clave: admin123)
pause
