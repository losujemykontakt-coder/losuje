Write-Host "🔧 Naprawiam katalog public..." -ForegroundColor Yellow

# Sprawdź czy katalog public istnieje
if (Test-Path "frontend\public") {
    Write-Host "✅ Katalog public istnieje" -ForegroundColor Green
    
    # Sprawdź czy jest w Git
    $gitStatus = git status --porcelain frontend/public
    if ($gitStatus) {
        Write-Host "📁 Katalog public nie jest w Git - dodaję..." -ForegroundColor Yellow
        git add frontend/public/
        Write-Host "✅ Katalog public dodany do Git!" -ForegroundColor Green
    } else {
        Write-Host "✅ Katalog public jest już w Git" -ForegroundColor Green
    }
    
    # Pokaż zawartość
    Write-Host "📋 Zawartość katalogu public:" -ForegroundColor Cyan
    Get-ChildItem frontend\public | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
    
} else {
    Write-Host "❌ Katalog public nie istnieje!" -ForegroundColor Red
    Write-Host "Tworzę katalog public..." -ForegroundColor Yellow
    
    # Utwórz katalog public
    New-Item -ItemType Directory -Path "frontend\public" -Force
    
    # Utwórz podstawowy index.html
    $indexHtml = @"
<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="LOTTO AI - Generator liczb lotto" />
    <title>LOTTO AI</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
"@
    
    $indexHtml | Out-File -FilePath "frontend\public\index.html" -Encoding UTF8
    Write-Host "✅ Utworzono podstawowy index.html" -ForegroundColor Green
    
    # Dodaj do Git
    git add frontend/public/
    Write-Host "✅ Katalog public dodany do Git!" -ForegroundColor Green
}

Write-Host "🎉 Katalog public naprawiony!" -ForegroundColor Green
