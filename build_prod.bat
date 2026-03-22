@echo off
REM Koda - Build Script
REM ══════════════════════════════════════════════

SET PROJECT_DIR=%~dp0Koda

IF NOT EXIST "%PROJECT_DIR%\package.json" (
    echo [ERROR] No project found in %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
echo [KODA] Running Vite Build...
call npm run build

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Build completed! Files are in Koda/dist/
) else (
    echo.
    echo [ERROR] Build failed! Check console output.
)

pause
