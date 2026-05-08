@echo off
color 0B
title JoYed'S Cleaner Pro

net session >nul 2>&1
if %errorLevel% neq 0 (
 echo Lance le script en administrateur.
 pause
 exit
)

echo =====================================
echo      JOYED'S CLEANER PRO
 echo =====================================

echo.
echo [1] Nettoyage TEMP utilisateur
for /d %%x in (%TEMP%\*) do rd /s /q "%%x" >nul 2>&1
del /f /s /q %TEMP%\* >nul 2>&1

echo [2] Nettoyage TEMP Windows
for /d %%x in (C:\Windows\Temp\*) do rd /s /q "%%x" >nul 2>&1
del /f /s /q C:\Windows\Temp\* >nul 2>&1

echo [3] Nettoyage PREFETCH
del /f /s /q C:\Windows\Prefetch\* >nul 2>&1

echo [4] Nettoyage cache Windows Update
net stop wuauserv >nul 2>&1
net stop bits >nul 2>&1

del /f /s /q C:\Windows\SoftwareDistribution\Download\* >nul 2>&1

net start wuauserv >nul 2>&1
net start bits >nul 2>&1

echo [5] Corbeille
PowerShell.exe -NoProfile -Command "Clear-RecycleBin -Force" >nul 2>&1

echo.
echo Nettoyage complet termine.
pause