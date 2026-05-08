@echo off

del /q /f /s %TEMP%\* >nul 2>&1
del /q /f /s C:\Windows\Temp\* >nul 2>&1
PowerShell.exe -NoProfile -Command "Clear-RecycleBin -Force" >nul 2>&1

exit