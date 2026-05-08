@echo off

echo Liberation memoire RAM...

ipconfig /flushdns

taskkill /f /im chrome.exe >nul 2>&1
taskkill /f /im msedge.exe >nul 2>&1
taskkill /f /im Teams.exe >nul 2>&1

echo RAM optimisee.
pause