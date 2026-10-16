@echo off
chcp 65001 >nul
title Swiat pamieci - Uruchamianie...

echo ========================================================
echo   🧠 SWIAT PAMIECI - Dorian Kalinowski
echo ========================================================
echo.
echo Uruchamianie aplikacji w przegladarce...
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
  echo Uruchamianie serwera lokalnego PWA na http://localhost:8080/ ...
  start "" http://localhost:8080/
  python -m http.server 8080
) else (
  echo Otwieranie bezposrednio w przegladarce...
  start "" "%~dp0index.html"
)
pause
