@echo off
REM install_deps.bat
REM Purpose: Install Node.js dependencies for all projects
REM Location: setup\containers\apps

echo Installing project dependencies...

set BASE_DIR=..\..

echo Installing dependencies...

cd %BASE_DIR%\kc-back-end\kc-api-gateway
echo Installing kc-api-gateway...
npm install

cd %BASE_DIR%\kc-back-end\kc-protected-m2m-service
echo Installing kc-protected-m2m-service...
npm install

cd %BASE_DIR%\kc-back-end\kc-protected-sa-service
echo Installing kc-protected-sa-service...
npm install

cd %BASE_DIR%\kc-back-end\kc-protected-service
echo Installing kc-protected-service...
npm install

cd %BASE_DIR%\kc-back-end\kc-unprotected-service
echo Installing kc-unprotected-service...
npm install

cd %BASE_DIR%\kc-front-end\kc-react
echo Installing kc-react...
npm install

REM Go back to the directory where the script is located
cd %~dp0

echo All dependencies installed.
pause