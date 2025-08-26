#!/bin/bash

echo "🔍 Sprawdzam działanie domen losuje.pl i losuje-generator.pl...\n"

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcja do sprawdzania domeny
check_domain() {
    local domain=$1
    local description=$2
    
    echo "🌐 Sprawdzam $domain ($description)..."
    
    # Sprawdź HTTP (powinno przekierować na HTTPS)
    echo "   📡 HTTP -> HTTPS redirect:"
    if curl -s -I "http://$domain" | grep -q "301\|302"; then
        echo -e "   ${GREEN}✅ Przekierowanie HTTP -> HTTPS działa${NC}"
    else
        echo -e "   ${RED}❌ Przekierowanie HTTP -> HTTPS nie działa${NC}"
    fi
    
    # Sprawdź HTTPS
    echo "   🔒 HTTPS:"
    if curl -s -I "https://$domain" | grep -q "200\|301\|302"; then
        echo -e "   ${GREEN}✅ HTTPS działa${NC}"
    else
        echo -e "   ${RED}❌ HTTPS nie działa${NC}"
    fi
    
    # Sprawdź SSL certyfikat
    echo "   🔐 SSL certyfikat:"
    if echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        echo -e "   ${GREEN}✅ SSL certyfikat jest ważny${NC}"
    else
        echo -e "   ${RED}❌ Problem z SSL certyfikatem${NC}"
    fi
    
    echo ""
}

# Sprawdź obie domeny
check_domain "losuje.pl" "główna aplikacja"
check_domain "losuje-generator.pl" "PWA/TWA aplikacja"

# Sprawdź backend API
echo "🔧 Sprawdzam backend API..."
if curl -s "https://losuje.pl/api/health" | grep -q "ok\|success"; then
    echo -e "${GREEN}✅ Backend API działa${NC}"
else
    echo -e "${YELLOW}⚠️ Backend API może nie działać (sprawdź logi)${NC}"
fi

echo ""
echo "🎉 Sprawdzanie domen zakończone!"
echo ""
echo "📋 Jeśli coś nie działa:"
echo "   - Sprawdź logi nginx: tail -f /var/log/nginx/error.log"
echo "   - Sprawdź status nginx: systemctl status nginx"
echo "   - Sprawdź certyfikaty SSL: certbot certificates"
echo "   - Sprawdź backend: curl http://localhost:3002/health"
