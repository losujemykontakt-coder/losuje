#!/bin/bash

# 🚀 Skrypt do budowania i deployowania PWA dla Google Play Store
# Autor: Losuje.pl
# Data: $(date)

set -e

echo "🎰 Rozpoczynam budowanie PWA dla Google Play Store..."

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkcje pomocnicze
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Sprawdzenie czy jesteśmy w odpowiednim katalogu
if [ ! -f "package.json" ]; then
    log_error "Nie znaleziono package.json. Uruchom skrypt z głównego katalogu projektu."
    exit 1
fi

# Sprawdzenie czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    log_error "Node.js nie jest zainstalowany. Zainstaluj Node.js i spróbuj ponownie."
    exit 1
fi

# Sprawdzenie czy npm jest zainstalowany
if ! command -v npm &> /dev/null; then
    log_error "npm nie jest zainstalowany. Zainstaluj npm i spróbuj ponownie."
    exit 1
fi

# Sprawdzenie czy Firebase CLI jest zainstalowany
if ! command -v firebase &> /dev/null; then
    log_warning "Firebase CLI nie jest zainstalowany. Instaluję..."
    npm install -g firebase-tools
fi

log_info "Sprawdzam wersje narzędzi..."
node --version
npm --version
firebase --version

# Przejście do katalogu frontend
log_info "Przechodzę do katalogu frontend..."
cd frontend

# Instalacja zależności
log_info "Instaluję zależności..."
npm install

# Budowanie PWA
log_info "Buduję aplikację PWA..."
npm run build-pwa

# Sprawdzenie czy build się udał
if [ ! -d "build" ]; then
    log_error "Build nie został utworzony. Sprawdź błędy i spróbuj ponownie."
    exit 1
fi

log_success "Build PWA zakończony pomyślnie!"

# Powrót do głównego katalogu
cd ..

# Konfiguracja Firebase dla PWA
log_info "Konfiguruję Firebase dla PWA..."

# Kopiowanie konfiguracji PWA
cp firebasePWA.json firebase.json
cp .firebasercPWA .firebaserc

# Sprawdzenie czy użytkownik jest zalogowany do Firebase
if ! firebase projects:list &> /dev/null; then
    log_warning "Nie jesteś zalogowany do Firebase. Loguję..."
    firebase login
fi

# Sprawdzenie czy projekt istnieje
if ! firebase projects:list | grep -q "losuje-play"; then
    log_warning "Projekt 'losuje-play' nie istnieje. Tworzę nowy projekt..."
    
    # Tutaj możesz dodać automatyczne tworzenie projektu
    # firebase projects:create losuje-play --display-name "Losuje Play"
    
    log_error "Projekt 'losuje-play' nie istnieje. Utwórz go ręcznie w Firebase Console:"
    log_error "1. Przejdź do https://console.firebase.google.com"
    log_error "2. Kliknij 'Dodaj projekt'"
    log_error "3. Nazwij projekt 'losuje-play'"
    log_error "4. Włącz Hosting i Firestore"
    log_error "5. Uruchom ponownie ten skrypt"
    exit 1
fi

# Deploy na Firebase
log_info "Deployuję na Firebase..."
firebase deploy --only hosting

log_success "🚀 PWA została pomyślnie wdrożona!"
log_info "🌐 URL aplikacji: https://losuje-play.web.app"
log_info "📱 Aplikacja jest gotowa do integracji z Google Play Store"

# Przywrócenie oryginalnej konfiguracji Firebase
log_info "Przywracam oryginalną konfigurację Firebase..."
git checkout firebase.json .firebaserc

log_success "✅ Wszystko gotowe! Aplikacja PWA jest dostępna pod adresem:"
echo ""
echo "🌐 https://losuje-play.web.app"
echo ""
echo "📱 Następne kroki:"
echo "1. Przetestuj aplikację pod powyższym adresem"
echo "2. Skonfiguruj TWA (Trusted Web Activity) dla Google Play"
echo "3. Przygotuj materiały do Google Play Console"
echo "4. Prześlij aplikację do Google Play Store"
echo ""
echo "🎰 Powodzenia z Twoją aplikacją Lotto AI!"





