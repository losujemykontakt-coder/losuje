#!/bin/bash

echo "🔄 LOTTO AI - Szybka aktualizacja aplikacji"
echo "=========================================="

# Konfiguracja
SERVER_IP="51.77.220.61"
DOMAIN="losuje.pl"

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Sprawdź czy podano IP
if [ -z "$SERVER_IP" ]; then
    print_error "Musisz podać IP serwera!"
    echo ""
    echo "Edytuj ten plik i dodaj IP serwera:"
    echo "SERVER_IP=\"51.68.123.45\"  # Zastąp swoim IP"
    exit 1
fi

print_status "Rozpoczynam aktualizację aplikacji..."

# 1. Budowanie frontendu
print_status "Budowanie frontendu..."
cd frontend
npm run build
cd ..

# 2. Tworzenie archiwum aktualizacji
print_status "Tworzenie archiwum aktualizacji..."
tar -czf update.tar.gz frontend/build/ backend/

# 3. Upload na serwer
print_status "Upload na serwer..."
scp update.tar.gz root@$SERVER_IP:/tmp/

# 4. Aktualizacja na serwerze
print_status "Aktualizacja na serwerze..."
ssh root@$SERVER_IP << 'EOF'
# Zatrzymaj aplikację
pm2 stop lotek-backend

# Backup obecnej wersji
cp -r /var/www/lotek /var/www/lotek-backup-$(date +%Y%m%d-%H%M%S)

# Rozpakuj aktualizację
cd /tmp
tar -xzf update.tar.gz

# Skopiuj nowe pliki
cp -r frontend/build/* /var/www/lotek/frontend/
cp -r backend/* /var/www/lotek/backend/

# Ustaw uprawnienia
chown -R www-data:www-data /var/www/lotek/
chmod -R 755 /var/www/lotek/

# Zainstaluj nowe zależności (jeśli są)
cd /var/www/lotek/backend
npm install --production

# Uruchom aplikację
pm2 start lotek-backend

# Wyczyść pliki tymczasowe
rm -f /tmp/update.tar.gz
rm -rf /tmp/frontend /tmp/backend

# Usuń stare backupy (zostaw ostatnie 3)
cd /var/www/lotek-backup-*
ls -t | tail -n +4 | xargs -r rm -rf
EOF

# 5. Sprawdzenie
print_status "Sprawdzanie aktualizacji..."
sleep 5

# Test aplikacji
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|302"; then
    print_success "Aktualizacja zakończona pomyślnie!"
else
    print_warning "Sprawdź logi: ssh root@$SERVER_IP 'pm2 logs lotek-backend'"
fi

# Wyczyść lokalne pliki
rm -f update.tar.gz

print_success "Aktualizacja zakończona!"
echo ""
echo "🌐 Aplikacja: https://$DOMAIN"
echo "📊 Logi: ssh root@$SERVER_IP 'pm2 logs lotek-backend'"
echo "🔄 Backup: /var/www/lotek-backup-*"
