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
echo [KODA] Gerando build fresquinha (npm run build)...
call npm run build

echo [KODA] Starting edge and serving production build on http://localhost:4173 ...

:: Inicia o Edge com a URL do preview
start msedge http://localhost:4173

:: Inicia o servidor do Vite em modo preview
call npm run preview

pause
