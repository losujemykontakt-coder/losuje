#!/bin/bash

# Skrypt budowania PWA dla Google Play Store
# Używa AppPWA.js zamiast App.js

echo "🚀 Budowanie PWA dla Google Play Store..."

# Sprawdź czy jesteśmy w katalogu frontend
if [ ! -f "package.json" ]; then
    echo "❌ Błąd: Uruchom skrypt z katalogu frontend"
    exit 1
fi

# Kopia oryginalnych plików
echo "📋 Tworzenie kopii zapasowych..."
cp src/index.js src/index-original.js
cp package.json package-original.json

# Zamiana na PWA
echo "🔄 Konfiguracja PWA..."
cp src/indexPWA.js src/index.js
cp package-pwa.json package.json

# Instalacja zależności
echo "📦 Instalacja zależności..."
npm install

# Budowanie PWA
echo "🔨 Budowanie aplikacji..."
REACT_APP_IS_PWA=true GENERATE_SOURCEMAP=false npm run build

# Sprawdź czy build się udał
if [ $? -eq 0 ]; then
    echo "✅ PWA zbudowane pomyślnie!"
    echo "📁 Pliki w katalogu: build/"
    
    # Sprawdź czy manifest.json jest poprawny
    if [ -f "build/manifest.json" ]; then
        echo "✅ Manifest.json znaleziony"
    else
        echo "❌ Błąd: Brak manifest.json"
    fi
    
    # Sprawdź czy service worker jest obecny
    if [ -f "build/sw.js" ]; then
        echo "✅ Service Worker znaleziony"
    else
        echo "❌ Błąd: Brak service worker"
    fi
    
    # Sprawdź czy assetlinks.json jest obecny
    if [ -f "build/.well-known/assetlinks.json" ]; then
        echo "✅ Asset Links znaleziony"
    else
        echo "❌ Błąd: Brak asset links"
    fi
    
    echo ""
    echo "🎯 PWA gotowe do wdrożenia na Google Play Store!"
    echo "📱 Użyj Bubblewrap do wygenerowania APK/AAB"
    
else
    echo "❌ Błąd podczas budowania PWA"
    
    # Przywróć oryginalne pliki
    echo "🔄 Przywracanie oryginalnych plików..."
    cp src/index-original.js src/index.js
    cp package-original.json package.json
    exit 1
fi

# Przywróć oryginalne pliki
echo "🔄 Przywracanie oryginalnych plików..."
cp src/index-original.js src/index.js
cp package-original.json package.json

echo "✅ Gotowe! PWA zbudowane w katalogu build/"
echo "📋 Aby wdrożyć na serwer:"
echo "   cp -r build/* /var/www/losuje-generator.pl/dist/"
echo "   sudo chown -R www-data:www-data /var/www/losuje-generator.pl/dist/"
echo "   sudo systemctl reload nginx"
