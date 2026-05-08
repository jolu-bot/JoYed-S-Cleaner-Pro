@echo off
color 0A
title JoYed'S Cleaner - Simple

echo Nettoyage des fichiers temporaires...

del /q /f /s %TEMP%\* >nul 2>&1
del /q /f /s C:\Windows\Temp\* >nul 2>&1
del /q /f /s C:\Windows\Prefetch\* >nul 2>&1

PowerShell.exe -NoProfile -Command "Clear-RecycleBin -Force" >nul 2>&1

echo.
echo Nettoyage termine.
pause