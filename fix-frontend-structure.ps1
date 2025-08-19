Write-Host "🔧 Naprawiam strukturę frontend..." -ForegroundColor Yellow

# Sprawdź czy katalog backend w frontend istnieje
if (Test-Path "frontend\backend") {
    Write-Host "📁 Znaleziono katalog backend w frontend - usuwam..." -ForegroundColor Yellow
    Remove-Item "frontend\backend" -Recurse -Force
    Write-Host "✅ Katalog usunięty!" -ForegroundColor Green
} else {
    Write-Host "✅ Katalog backend w frontend nie istnieje" -ForegroundColor Green
}

# Sprawdź czy plik lotto_misa.csv jest w backend/data
if (Test-Path "backend\data\lotto_misa.csv") {
    Write-Host "✅ Plik lotto_misa.csv jest w backend/data" -ForegroundColor Green
} else {
    Write-Host "❌ Plik lotto_misa.csv nie jest w backend/data" -ForegroundColor Red
}

Write-Host "🎉 Struktura naprawiona!" -ForegroundColor Green
