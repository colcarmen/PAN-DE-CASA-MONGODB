@echo off
title Pan de Casa - Servidor Backend (Node.js + Express + MongoDB)
echo ==============================================================
echo 🥐 Iniciando Servidor Backend Pan de Casa en http://localhost:5000
echo ==============================================================
cd /d "%~dp0backend"
node src/server.js
pause
