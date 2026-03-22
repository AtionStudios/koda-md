@echo off
REM Koda - Dev Server Script
REM ══════════════════════════════════════════════

SET PROJECT_DIR=%~dp0Koda

IF NOT EXIST "%PROJECT_DIR%\package.json" (
    echo [ERROR] No project found in %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
echo [KODA] Starting Edge and Vite Dev Server...

:: Abre o Edge no endereço padrão do Vite
start msedge http://localhost:5173

:: Inicia o dev server
call npm run dev

pause
