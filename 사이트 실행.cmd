@echo off
chcp 65001 >nul
title ValueTime 사이트 실행
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-worthy-life.ps1"
if errorlevel 1 pause
