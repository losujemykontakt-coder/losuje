#!/bin/bash

echo "📁 Sprawdzam ścieżki frontendu dla obu domen...\n"

# Kolory
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sprawdź losuje.pl frontend
echo "🌐 Sprawdzam losuje.pl frontend..."
LOSUJE_PATH="/var/www/losuje.pl/frontend/build"

if [ -d "$LOSUJE_PATH" ]; then
    echo -e "   ${GREEN}✅ Katalog istnieje: $LOSUJE_PATH${NC}"
    
    # Sprawdź czy jest index.html
    if [ -f "$LOSUJE_PATH/index.html" ]; then
        echo -e "   ${GREEN}✅ index.html istnieje${NC}"
    else
        echo -e "   ${RED}❌ index.html nie istnieje${NC}"
    fi
    
    # Sprawdź rozmiar katalogu
    SIZE=$(du -sh "$LOSUJE_PATH" | cut -f1)
    echo -e "   📊 Rozmiar: $SIZE"
    
    # Sprawdź uprawnienia
    PERMS=$(ls -ld "$LOSUJE_PATH" | awk '{print $1}')
    OWNER=$(ls -ld "$LOSUJE_PATH" | awk '{print $3":"$4}')
    echo -e "   🔐 Uprawnienia: $PERMS ($OWNER)"
    
else
    echo -e "   ${RED}❌ Katalog nie istnieje: $LOSUJE_PATH${NC}"
    echo -e "   ${YELLOW}💡 Utwórz katalog: mkdir -p $LOSUJE_PATH${NC}"
fi

echo ""

# Sprawdź losuje-generator.pl frontend
echo "📱 Sprawdzam losuje-generator.pl frontend..."
GENERATOR_PATH="/var/www/losuje-generator.pl/dist"

if [ -d "$GENERATOR_PATH" ]; then
    echo -e "   ${GREEN}✅ Katalog istnieje: $GENERATOR_PATH${NC}"
    
    # Sprawdź czy jest index.html
    if [ -f "$GENERATOR_PATH/index.html" ]; then
        echo -e "   ${GREEN}✅ index.html istnieje${NC}"
    else
        echo -e "   ${RED}❌ index.html nie istnieje${NC}"
    fi
    
    # Sprawdź manifest.json
    if [ -f "$GENERATOR_PATH/manifest.json" ]; then
        echo -e "   ${GREEN}✅ manifest.json istnieje${NC}"
    else
        echo -e "   ${YELLOW}⚠️ manifest.json nie istnieje (wymagane dla PWA)${NC}"
    fi
    
    # Sprawdź service worker
    if [ -f "$GENERATOR_PATH/sw.js" ]; then
        echo -e "   ${GREEN}✅ sw.js istnieje${NC}"
    else
        echo -e "   ${YELLOW}⚠️ sw.js nie istnieje (wymagane dla PWA)${NC}"
    fi
    
    # Sprawdź rozmiar katalogu
    SIZE=$(du -sh "$GENERATOR_PATH" | cut -f1)
    echo -e "   📊 Rozmiar: $SIZE"
    
    # Sprawdź uprawnienia
    PERMS=$(ls -ld "$GENERATOR_PATH" | awk '{print $1}')
    OWNER=$(ls -ld "$GENERATOR_PATH" | awk '{print $3":"$4}')
    echo -e "   🔐 Uprawnienia: $PERMS ($OWNER)"
    
else
    echo -e "   ${RED}❌ Katalog nie istnieje: $GENERATOR_PATH${NC}"
    echo -e "   ${YELLOW}💡 Utwórz katalog: mkdir -p $GENERATOR_PATH${NC}"
fi

echo ""
echo "🎉 Sprawdzanie ścieżek zakończone!"
echo ""
echo "📋 Jeśli katalogi nie istnieją:"
echo "   - Utwórz katalogi: mkdir -p /var/www/losuje.pl/frontend/build"
echo "   - Utwórz katalogi: mkdir -p /var/www/losuje-generator.pl/dist"
echo "   - Skopiuj pliki frontendu do odpowiednich katalogów"
echo "   - Ustaw uprawnienia: chown -R www-data:www-data /var/www/"
