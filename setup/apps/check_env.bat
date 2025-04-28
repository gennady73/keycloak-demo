@echo off
@echo off
REM check_env.bat
REM Purpose: Check existence of .env files
REM Location: setup\containers\apps

echo Checking .env files...

set BASE_DIR=..\..

setlocal enabledelayedexpansion

set PROJECTS=kc-back-end\kc-api-gateway kc-back-end\kc-protected-m2m-service kc-back-end\kc-protected-sa-service kc-back-end\kc-protected-service kc-back-end\kc-unprotected-service kc-front-end\kc-react

echo.
echo =====================================
echo Checking .env files in the project...
echo =====================================
echo.

for %%P in (%PROJECTS%) do (
    if exist "%BASE_DIR%\%%P\.env" (
        echo [OK]     Found: %%P\.env
    ) else (
        echo [MISSING] Missing: %%P\.env
    )
)

echo.
echo Check completed.
exit /b
