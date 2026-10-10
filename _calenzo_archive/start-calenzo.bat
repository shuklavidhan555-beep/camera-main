@echo off
title CALENZO - Clinic Appointment and Queue Management System
echo ==========================================================
echo Starting CALENZO Clinic Management System...
echo ==========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 5000
pause
