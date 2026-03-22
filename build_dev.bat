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
echo [KODA] Starting Vite Dev Server...
echo [HINT] Open http://localhost:5173 in your browser
call npm run dev

pause
