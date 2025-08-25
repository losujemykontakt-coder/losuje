#!/bin/bash

# Skrypt do budowania PWA w osobnym katalogu
# Nie wpływa na losuje.pl

echo "🚀 Budowanie PWA w osobnym katalogu..."

# Katalogi
PWA_DIR="/var/www/losuje-generator.pl"
FRONTEND_DIR="/var/www/losuje.pl/lotek/frontend"
BUILD_DIR="$PWA_DIR/build"

# 1. Utwórz katalogi jeśli nie istnieją
echo "📁 Tworzenie katalogów..."
mkdir -p "$PWA_DIR"
mkdir -p "$BUILD_DIR"

# 2. Skopiuj pliki frontend do katalogu PWA
echo "📋 Kopiowanie plików frontend..."
cp -r "$FRONTEND_DIR"/* "$PWA_DIR/"

# 3. Przejdź do katalogu PWA
cd "$PWA_DIR"

# 4. Zainstaluj zależności
echo "📦 Instalowanie zależności..."
npm install

# 5. Skopiuj pliki PWA
echo "🔄 Przygotowanie plików PWA..."
cp src/indexPWA.js src/index.js
cp package-pwa.json package.json

# 6. Zbuduj PWA
echo "🔨 Budowanie PWA..."
npm run build

# 7. Skopiuj zbudowane pliki do dist
echo "📁 Kopiowanie do dist..."
cp -r build/* dist/

# 8. Przywróć oryginalne pliki
echo "🔄 Przywracanie oryginalnych plików..."
cp src/indexPWA.js src/index.js.backup
cp package-pwa.json package.json.backup

# 9. Przejdź z powrotem do frontend
cd "$FRONTEND_DIR"

# 10. Przywróć oryginalne pliki w frontend
echo "🔄 Przywracanie plików w frontend..."
git checkout src/index.js
git checkout package.json

echo "✅ PWA zbudowana w $PWA_DIR"
echo "🌐 Sprawdź: https://losuje-generator.pl/"
