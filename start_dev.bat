@echo off
chcp 65001 >nul 2>&1
title biu dev server
cd /d "%~dp0"

echo ============================================
echo   biu dev launcher
echo   project: %CD%
echo ============================================
echo.

REM -- use the bundled node if available, otherwise fall back to PATH
set "NODE_EXE="
if exist "C:\Komandare\Module\nodejs\node.exe" (
    set "NODE_EXE=C:\Komandare\Module\nodejs\node.exe"
)

REM -- start rsbuild dev (which also spawns electron) in a detached window
REM    using start so the process survives after this script's caller exits
echo [1/2] starting rsbuild dev server (port 5678) + electron...
echo     press Ctrl+C in the new window to stop the dev environment.
echo.

start "biu-dev" /MIN cmd /k "cd /d %CD% && pnpm dev"

echo [2/2] dev window launched. you can close this launcher.
timeout /t 3 /nobreak >nul
exit /b 0
