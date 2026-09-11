@echo off
title SaS Vaikuntha - Dashboard Comercial & Gestion del Cambio
echo ========================================================
echo   Iniciando Dashboard Local SaS Vaikuntha...
echo ========================================================

start "Vaikuntha Backend" cmd /k "cd server && npm run start"
timeout /t 2 /nobreak >nul
start "Vaikuntha Frontend" cmd /k "cd client && npm run dev"

echo Abriendo navegador en http://localhost:5173 ...
timeout /t 2 /nobreak >nul
start http://localhost:5173
