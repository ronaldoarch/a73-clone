@echo off
chcp 65001 >nul
title Iniciar A73

set "PYTHON=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not exist "%PYTHON%" set "PYTHON=py"

set "PATH=C:\Program Files\nodejs;%PATH%"

echo.
echo === Iniciando Backend (porta 3000) ===
start "Backend A73" cmd /k "cd /d e:\chinesa && ""%PYTHON%"" server.py"

echo Aguardando backend...
timeout /t 3 /nobreak >nul

echo.
echo === Iniciando Frontend (porta 3001) ===
start "Frontend A73" cmd /k "cd /d "e:\chinesa\a73-clone" && npm run dev"

echo Aguardando frontend...
timeout /t 5 /nobreak >nul

echo.
echo Abrindo navegador em http://localhost:3001
start "" http://localhost:3001

echo.
echo Pronto. Duas janelas foram abertas (backend e frontend).
echo Feche essas janelas para encerrar o app.
echo.
pause
