#!/bin/bash

echo "🔄 AKTUALIZACJA SERWERA OVH - losuje.pl"
echo "======================================="

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Backup przed aktualizacją
BACKUP_DIR="/var/www/losuje.pl/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_warning "Tworzę backup..."
cp -r /var/www/losuje.pl/lotek "$BACKUP_DIR/"
print_success "Backup utworzony: $BACKUP_DIR"

# Aktualizacja kodu
print_status "Pobieram najnowsze zmiany z GitHub..."
cd /var/www/losuje.pl/lotek
git fetch origin
git reset --hard origin/main

# Aktualizacja frontend
print_warning "Aktualizuję frontend..."
cd frontend
npm ci --production=false
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend zaktualizowany!"
else
    print_error "Błąd podczas budowania frontend!"
    exit 1
fi

# Aktualizacja backend
print_warning "Aktualizuję backend..."
cd ../backend
npm ci --production

# Restart aplikacji
print_warning "Restartuję aplikację..."
pm2 restart lotek-backend

# Sprawdź status
sleep 5
if pm2 list | grep -q "lotek-backend.*online"; then
    print_success "Aplikacja zaktualizowana i uruchomiona!"
else
    print_error "Błąd podczas uruchamiania aplikacji!"
    pm2 logs lotek-backend --lines 20
fi

# Czyszczenie starych backupów (zostaw ostatnie 5)
cd /var/www/losuje.pl/backups
ls -t | tail -n +6 | xargs -r rm -rf

print_success "🎉 Aktualizacja zakończona!"
print_status "Sprawdź aplikację na: https://losuje.pl"

