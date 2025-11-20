@echo off
REM Configuration helper for CMDB Agent

echo ====================================
echo CMDB Agent Configuration Setup
echo ====================================
echo.

set /p API_URL="Enter CMDB API URL (default: http://localhost:3000/api/cmdb): "
if "%API_URL%"=="" set API_URL=http://localhost:3000/api/cmdb

set /p API_KEY="Enter API Key: "
if "%API_KEY%"=="" (
    echo ERROR: API Key is required!
    pause
    exit /b 1
)

set /p AGENT_NAME="Enter Agent Name (default: %COMPUTERNAME%): "
if "%AGENT_NAME%"=="" set AGENT_NAME=%COMPUTERNAME%

echo.
echo Creating configuration file...

(
echo {
echo   "apiUrl": "%API_URL%",
echo   "apiKey": "%API_KEY%",
echo   "agentId": "agent-%COMPUTERNAME%",
echo   "agentName": "%AGENT_NAME%",
echo   "syncInterval": 300000,
echo   "discoveryInterval": 3600000,
echo   "logLevel": "info"
echo }
) > config.json

echo.
echo Configuration saved to config.json
echo.
echo To start the agent, run: npm start
echo Or use the Windows Service: sc start CMDBAgent
pause
