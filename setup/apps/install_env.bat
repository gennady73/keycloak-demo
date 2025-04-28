@echo off
REM install_env.bat
REM Purpose: Generate .env files for all projects
REM Location: setup\containers\apps

echo Generating .env files...

setlocal enabledelayedexpansion

REM Base path from the script location
set BASE_DIR=..\..

echo Generating .env files (overwriting if exists)...

(
echo NODE_HOST=localhost
echo NODE_PORT=3001
echo NODE_ENV=development
) > %BASE_DIR%\kc-back-end\kc-api-gateway\.env
echo Created/Updated: kc-api-gateway\.env

(
echo NODE_HOST=localhost
echo NODE_PORT=3004
echo NODE_ENV=development
) > %BASE_DIR%\kc-back-end\kc-protected-m2m-service\.env
echo Created/Updated: kc-protected-m2m-service\.env

(
echo NODE_HOST=localhost
echo NODE_PORT=3005
echo NODE_ENV=development
) > %BASE_DIR%\kc-back-end\kc-protected-sa-service\.env
echo Created/Updated: kc-protected-sa-service\.env

(
echo NODE_HOST=localhost
echo NODE_PORT=3002
echo NODE_ENV=development
) > %BASE_DIR%\kc-back-end\kc-protected-service\.env
echo Created/Updated: kc-protected-service\.env

(
echo NODE_HOST=localhost
echo NODE_PORT=3003
echo NODE_ENV=development
) > %BASE_DIR%\kc-back-end\kc-unprotected-service\.env
echo Created/Updated: kc-unprotected-service\.env

(
echo PORT=5000
echo HOST=localhost
) > %BASE_DIR%\kc-front-end\kc-react\.env
echo Created/Updated: kc-react\.env

echo All .env files created successfully.
endlocal
