@echo off
echo 🚀 LOTTO AI - Deployment Script
echo ================================

echo.
echo 📋 Sprawdzam status Git...
git status

echo.
echo 📦 Dodaję wszystkie pliki...
git add .

echo.
echo 💾 Zatwierdzam zmiany...
git commit -m "Deploy application to production"

echo.
echo 🚀 Wypycham na GitHub...
git push origin main

echo.
echo ✅ Deployment zakończony!
echo.
echo 📊 Sprawdź status w GitHub Actions:
echo    https://github.com/losujemykontakt-coder/losuje/actions
echo.
echo 🌐 Aplikacja będzie dostępna na:
echo    http://losuje.pl
echo.
pause
