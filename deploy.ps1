Write-Host "🚀 LOTTO AI - Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Sprawdzam status Git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📦 Dodaję wszystkie pliki..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "💾 Zatwierdzam zmiany..." -ForegroundColor Yellow
git commit -m "Deploy application to production"

Write-Host ""
Write-Host "🚀 Wypycham na GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Deployment zakończony!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Sprawdź status w GitHub Actions:" -ForegroundColor Cyan
Write-Host "   https://github.com/losujemykontakt-coder/losuje/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Aplikacja będzie dostępna na:" -ForegroundColor Cyan
Write-Host "   http://losuje.pl" -ForegroundColor Cyan
Write-Host ""
Read-Host "Naciśnij Enter aby zakończyć"
