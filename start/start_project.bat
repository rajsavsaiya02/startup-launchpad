@echo off
setlocal
title Startup LaunchPad - Unified System

echo ===========================================
echo    Startup LaunchPad - Unified System
echo ===========================================

:: Get the directory where this script is located & Resolve Project Root (Parent Directory)
set "SCRIPT_DIR=%~dp0"
:: Remove trailing backslash if present
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Go up one level
for %%I in ("%SCRIPT_DIR%\..") do set "PROJECT_ROOT=%%~fI"

set "SERVER_DIR=%PROJECT_ROOT%\server"
set "CLIENT_DIR=%PROJECT_ROOT%\client"

echo [1/2] Checking Backend...
cd /d "%SERVER_DIR%"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
echo Starting Backend Server in new window...
start "Startup LaunchPad Backend" cmd /k "cd /d "%SERVER_DIR%" && npm start"

echo [2/2] Checking Frontend...
cd /d "%CLIENT_DIR%"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
echo Starting Frontend Dev Server in new window...
start "Startup LaunchPad Frontend" cmd /k "cd /d "%CLIENT_DIR%" && npm run dev"

echo.
echo ===========================================
echo    App is running!
echo    Backend running in separate window.
echo    Frontend running in separate window.
echo ===========================================
echo.
pause
