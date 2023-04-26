:: V1.2
@echo off
set "py=0"
setlocal enabledelayedexpansion

:: Checkfor .env file, exit if missing.
if exist .env (
    echo [INFO] .env config file found.
) else (
    echo [ERROR] .env config file missing.
    pause
    EXIT /B 0
)

:: Check for Python, exit if missing.
python3 --version ^| findstr "3.*" >nul 2>&1 && set "py=python3" 
python --version ^| findstr "3.*" >nul 2>&1 && set "py=python"

if not !py!==0 (
    echo [INFO] Found Python:
	!py! --version
) else (
    echo [ERROR] Python not found.
    pause
    EXIT /B 0
)

:: Check for Python virutal enviroment, create if missing.
if exist venv/nul (
    echo [INFO] Python virtual enviroment found.
) else (
    echo [INFO] Creating Python virtual enviroment.
    !py! -m venv ./venv
)

:: Enter Python virutal enviroment
echo [INFO] Activating Python virtual enviroment.
call "venv/Scripts/activate.bat"

:: Do Python stuff.
echo [INFO] Installing requirements.
pip3 install -r ./requirements.txt

echo [INFO] Calling main.py
!py! ./main.py