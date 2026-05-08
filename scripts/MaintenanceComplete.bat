@echo off
color 0A
title Maintenance Complete Windows

sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
chkdsk /scan

pause