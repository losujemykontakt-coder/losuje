#!/bin/bash

echo "🔍 SPRAWDZANIE STATUSU DEPLOYMENTU - losuje.pl"
echo "=============================================="

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Sprawdź czy jesteś root
if [ "$EUID" -ne 0 ]; then
    print_error "Uruchom jako root: sudo bash check-deployment.sh"
    exit 1
fi

echo ""

# 1. Sprawdź status systemu
print_status "1. Status systemu..."
echo "------------------------"

# Uptime
UPTIME=$(uptime -p)
print_info "Uptime: $UPTIME"

# Load average
LOAD=$(uptime | awk -F'load average:' '{print $2}')
print_info "Load average: $LOAD"

# Użycie pamięci
MEMORY=$(free -h | grep Mem | awk '{print $3"/"$2}')
print_info "Pamięć: $MEMORY"

# Użycie dysku
DISK=$(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')
print_info "Dysk: $DISK"

echo ""

# 2. Sprawdź status Nginx
print_status "2. Status Nginx..."
echo "-------------------"

if systemctl is-active --quiet nginx; then
    print_success "Nginx: DZIAŁA"
    NGINX_STATUS=$(systemctl status nginx --no-pager -l | grep "Active:")
    print_info "$NGINX_STATUS"
else
    print_error "Nginx: NIE DZIAŁA"
fi

# Sprawdź konfigurację Nginx
if nginx -t > /dev/null 2>&1; then
    print_success "Konfiguracja Nginx: POPRAWNA"
else
    print_error "Konfiguracja Nginx: BŁĘDNA"
    nginx -t
fi

echo ""

# 3. Sprawdź status PM2
print_status "3. Status PM2..."
echo "-----------------"

if command -v pm2 > /dev/null 2>&1; then
    print_success "PM2: ZAINSTALOWANY"
    
    # Sprawdź aplikacje PM2
    PM2_APPS=$(pm2 list --no-daemon)
    if echo "$PM2_APPS" | grep -q "lotek-backend"; then
        print_success "Aplikacja lotek-backend: ZNALEZIONA"
        
        # Sprawdź status aplikacji
        if pm2 list | grep -q "lotek-backend.*online"; then
            print_success "Status: ONLINE"
        else
            print_error "Status: OFFLINE"
        fi
        
        # Sprawdź uptime
        UPTIME=$(pm2 list | grep lotek-backend | awk '{print $8}')
        print_info "Uptime: $UPTIME"
        
        # Sprawdź użycie pamięci
        MEMORY=$(pm2 list | grep lotek-backend | awk '{print $6}')
        print_info "Pamięć: $MEMORY"
        
    else
        print_error "Aplikacja lotek-backend: NIE ZNALEZIONA"
    fi
else
    print_error "PM2: NIE ZAINSTALOWANY"
fi

echo ""

# 4. Sprawdź porty
print_status "4. Sprawdzenie portów..."
echo "---------------------------"

# Port 80 (HTTP)
if netstat -tlnp | grep -q ":80 "; then
    print_success "Port 80 (HTTP): OTWARTY"
else
    print_error "Port 80 (HTTP): ZAMKNIĘTY"
fi

# Port 443 (HTTPS)
if netstat -tlnp | grep -q ":443 "; then
    print_success "Port 443 (HTTPS): OTWARTY"
else
    print_warning "Port 443 (HTTPS): ZAMKNIĘTY (SSL może nie być skonfigurowany)"
fi

# Port 3001 (Backend)
if netstat -tlnp | grep -q ":3001 "; then
    print_success "Port 3001 (Backend): OTWARTY"
else
    print_error "Port 3001 (Backend): ZAMKNIĘTY"
fi

echo ""

# 5. Sprawdź aplikację
print_status "5. Test aplikacji..."
echo "----------------------"

# Test HTTP
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    print_success "HTTP (localhost): DZIAŁA"
else
    print_error "HTTP (localhost): NIE DZIAŁA"
fi

# Test HTTPS (jeśli dostępny)
if netstat -tlnp | grep -q ":443 "; then
    if curl -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200\|301\|302"; then
        print_success "HTTPS (localhost): DZIAŁA"
    else
        print_error "HTTPS (localhost): NIE DZIAŁA"
    fi
fi

# Test API
if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health | grep -q "200\|404"; then
    print_success "API (/api/health): DZIAŁA"
else
    print_error "API (/api/health): NIE DZIAŁA"
fi

echo ""

# 6. Sprawdź logi
print_status "6. Ostatnie logi..."
echo "---------------------"

# Logi Nginx (ostatnie 5 linii)
echo "📝 Logi Nginx (error):"
tail -5 /var/log/nginx/error.log 2>/dev/null || print_warning "Brak logów Nginx"

echo ""

# Logi aplikacji (ostatnie 5 linii)
echo "📝 Logi aplikacji (ostatnie 5 linii):"
pm2 logs lotek-backend --lines 5 --nostream 2>/dev/null || print_warning "Brak logów aplikacji"

echo ""

# 7. Sprawdź certyfikaty SSL
print_status "7. Certyfikaty SSL..."
echo "------------------------"

if command -v certbot > /dev/null 2>&1; then
    CERTIFICATES=$(certbot certificates 2>/dev/null)
    if echo "$CERTIFICATES" | grep -q "losuje.pl"; then
        print_success "Certyfikat SSL dla losuje.pl: ZNALEZIONY"
        
        # Sprawdź datę wygaśnięcia
        EXPIRY=$(certbot certificates 2>/dev/null | grep -A 5 "losuje.pl" | grep "VALID" | awk '{print $2}')
        print_info "Ważny do: $EXPIRY"
    else
        print_warning "Certyfikat SSL dla losuje.pl: NIE ZNALEZIONY"
    fi
else
    print_warning "Certbot: NIE ZAINSTALOWANY"
fi

echo ""

# 8. Sprawdź firewall
print_status "8. Status firewall..."
echo "----------------------"

if command -v ufw > /dev/null 2>&1; then
    UFW_STATUS=$(ufw status)
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        print_success "Firewall: AKTYWNY"
        
        # Sprawdź reguły
        echo "📋 Reguły firewall:"
        ufw status numbered | grep -E "(22|80|443)"
    else
        print_warning "Firewall: NIEAKTYWNY"
    fi
else
    print_warning "UFW: NIE ZAINSTALOWANY"
fi

echo ""

# 9. Sprawdź DNS
print_status "9. Sprawdzenie DNS..."
echo "------------------------"

# Pobierz IP serwera
SERVER_IP=$(curl -s ifconfig.me)
print_info "IP serwera: $SERVER_IP"

# Sprawdź czy domena wskazuje na serwer
if nslookup losuje.pl > /dev/null 2>&1; then
    DOMAIN_IP=$(nslookup losuje.pl | grep "Address:" | tail -1 | awk '{print $2}')
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        print_success "DNS losuje.pl: POPRAWNY ($DOMAIN_IP)"
    else
        print_warning "DNS losuje.pl: BŁĘDNY ($DOMAIN_IP != $SERVER_IP)"
    fi
else
    print_error "DNS losuje.pl: NIE DZIAŁA"
fi

echo ""

# 10. Podsumowanie
print_status "10. Podsumowanie..."
echo "---------------------"

# Liczba błędów
ERRORS=0
if ! systemctl is-active --quiet nginx; then ERRORS=$((ERRORS + 1)); fi
if ! pm2 list | grep -q "lotek-backend.*online"; then ERRORS=$((ERRORS + 1)); fi
if ! netstat -tlnp | grep -q ":3001 "; then ERRORS=$((ERRORS + 1)); fi

if [ $ERRORS -eq 0 ]; then
    print_success "🎉 Wszystko działa poprawnie!"
    print_info "Aplikacja powinna być dostępna na: https://losuje.pl"
else
    print_error "❌ Znaleziono $ERRORS problemów"
    print_warning "Sprawdź logi i napraw problemy przed uruchomieniem aplikacji"
fi

echo ""
print_info "Przydatne komendy:"
echo "  🔄 Restart aplikacji: pm2 restart lotek-backend"
echo "  📊 Monitor: pm2 monit"
echo "  📝 Logi: pm2 logs lotek-backend"
echo "  🔧 Restart Nginx: systemctl restart nginx"
echo "  🌐 Test aplikacji: curl -I https://losuje.pl"
echo ""



