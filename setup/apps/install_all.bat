@echo off
REM Script to setup environment, check environment, and install dependencies
REM Located at: setup/containers/apps/install_all.bat

echo Starting full setup process...

REM Switch to the script directory
cd /d %~dp0

echo Running install_env.bat...
call install_env.bat

echo Running check_env.bat...
call check_env.bat

echo Running install_deps.bat...
call install_deps.bat

echo.
echo Full setup completed.
pause
