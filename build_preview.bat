@echo off
REM Koda - Preview Build Script (serve o dist/ via HTTP local)
REM ══════════════════════════════════════════════

SET PROJECT_DIR=%~dp0Koda

IF NOT EXIST "%PROJECT_DIR%\dist" (
    echo [ERROR] No dist folder found! Run build_prod.bat first.
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
echo [KODA] Serving production build on http://localhost:4173 ...
echo [HINT] Press CTRL+C to stop the server.
call npm run preview

pause
