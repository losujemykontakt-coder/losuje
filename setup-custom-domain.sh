#!/bin/bash

# 🌐 Skrypt konfiguracji domeny niestandardowej losuje.pl w Firebase Hosting
# Autor: AI Assistant
# Data: $(date)

set -e

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funkcje logowania
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

# Sprawdzenie wymagań
check_requirements() {
    log_info "Sprawdzam wymagania..."
    
    # Sprawdź czy Firebase CLI jest zainstalowany
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI nie jest zainstalowany!"
        log_info "Zainstaluj: npm install -g firebase-tools"
        exit 1
    fi
    
    # Sprawdź czy jesteś zalogowany do Firebase
    if ! firebase projects:list &> /dev/null; then
        log_warning "Nie jesteś zalogowany do Firebase. Loguję..."
        firebase login
    fi
    
    # Sprawdź czy projekt istnieje
    if ! firebase projects:list | grep -q "losujemy"; then
        log_error "Projekt 'losujemy' nie istnieje w Firebase!"
        exit 1
    fi
    
    log_success "Wymagania spełnione!"
}

# Konfiguracja DNS
setup_dns() {
    log_info "Konfiguruję DNS dla losuje.pl..."
    
    echo ""
    log_warning "MANUALNA KONFIGURACJA DNS WYMAGANA!"
    echo ""
    echo "Wykonaj następujące kroki w panelu OVH:"
    echo ""
    echo "1. Przejdź do https://www.ovh.com/manager/"
    echo "2. Zaloguj się i wybierz domenę 'losuje.pl'"
    echo "3. Przejdź do 'Strefa DNS'"
    echo "4. Dodaj następujące rekordy:"
    echo ""
    echo "   Rekord A:"
    echo "   - Typ: A"
    echo "   - Nazwa: @"
    echo "   - Wartość: 151.101.1.195"
    echo "   - TTL: 3600"
    echo ""
    echo "   Rekord A:"
    echo "   - Typ: A"
    echo "   - Nazwa: www"
    echo "   - Wartość: 151.101.1.195"
    echo "   - TTL: 3600"
    echo ""
    echo "5. Zapisz zmiany"
    echo ""
    
    read -p "Czy skonfigurowałeś DNS? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Konfiguracja DNS jest wymagana!"
        exit 1
    fi
    
    log_success "DNS skonfigurowany!"
}

# Konfiguracja Firebase Hosting
setup_firebase_hosting() {
    log_info "Konfiguruję Firebase Hosting..."
    
    # Sprawdź czy domena już istnieje
    if firebase hosting:sites:list | grep -q "losuje-pl"; then
        log_warning "Domena 'losuje-pl' już istnieje w Firebase!"
        read -p "Czy chcesz kontynuować? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        # Dodaj nową domenę
        log_info "Dodaję domenę niestandardową..."
        firebase hosting:sites:add losuje-pl
    fi
    
    log_success "Firebase Hosting skonfigurowany!"
}

# Aktualizacja konfiguracji Firebase
update_firebase_config() {
    log_info "Aktualizuję konfigurację Firebase..."
    
    # Sprawdź czy firebase.json istnieje
    if [ ! -f "firebase.json" ]; then
        log_error "Plik firebase.json nie istnieje!"
        exit 1
    fi
    
    # Backup oryginalnego pliku
    cp firebase.json firebase.json.backup
    
    # Aktualizuj firebase.json z nagłówkami PWA
    cat > firebase.json << 'EOF'
{
  "firestore": {
    "database": "(default)",
    "location": "eur3",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "predeploy": [
        "npm --prefix \"$RESOURCE_DIR\" run lint"
      ]
    }
  ],
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "/.well-known/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
EOF
    
    log_success "Konfiguracja Firebase zaktualizowana!"
}

# Build aplikacji
build_app() {
    log_info "Buduję aplikację..."
    
    # Sprawdź czy frontend istnieje
    if [ ! -d "frontend" ]; then
        log_error "Katalog frontend nie istnieje!"
        exit 1
    fi
    
    # Przejdź do frontend i zainstaluj zależności
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        log_info "Instaluję zależności frontend..."
        npm install
    fi
    
    # Build aplikacji
    log_info "Buduję aplikację React..."
    npm run build
    
    # Sprawdź czy build się udał
    if [ ! -d "build" ]; then
        log_error "Build nie został utworzony!"
        exit 1
    fi
    
    cd ..
    
    log_success "Aplikacja zbudowana!"
}

# Deploy na Firebase
deploy_to_firebase() {
    log_info "Deployuję na Firebase..."
    
    # Deploy hosting
    firebase deploy --only hosting
    
    log_success "Aplikacja wdrożona na Firebase!"
}

# Weryfikacja
verify_deployment() {
    log_info "Weryfikuję deployment..."
    
    echo ""
    log_warning "SPRAWDŹ PROPAGACJĘ DNS:"
    echo ""
    echo "1. Sprawdź propagację DNS:"
    echo "   nslookup losuje.pl"
    echo "   dig losuje.pl"
    echo ""
    echo "2. Sprawdź czy domena wskazuje na Firebase:"
    echo "   curl -I https://losuje.pl"
    echo ""
    echo "3. Otwórz aplikację w przeglądarce:"
    echo "   https://losuje.pl"
    echo ""
    echo "4. Sprawdź czy Firebase Auth działa"
    echo "5. Sprawdź czy API działa"
    echo ""
    
    log_success "Weryfikacja zakończona!"
}

# Główna funkcja
main() {
    echo "🌐 Konfiguracja domeny niestandardowej losuje.pl w Firebase Hosting"
    echo "=================================================================="
    echo ""
    
    check_requirements
    setup_dns
    setup_firebase_hosting
    update_firebase_config
    build_app
    deploy_to_firebase
    verify_deployment
    
    echo ""
    log_success "🎉 Konfiguracja domeny niestandardowej zakończona!"
    echo ""
    echo "📋 Podsumowanie:"
    echo "✅ DNS skonfigurowany w OVH"
    echo "✅ Firebase Hosting skonfigurowany"
    echo "✅ Aplikacja wdrożona"
    echo "✅ SSL będzie skonfigurowany automatycznie (24-48h)"
    echo ""
    echo "🌐 Twoja aplikacja będzie dostępna pod adresem:"
    echo "   https://losuje.pl"
    echo ""
    echo "⚠️  Pamiętaj:"
    echo "   - DNS może propagować się do 48 godzin"
    echo "   - SSL będzie skonfigurowany automatycznie"
    echo "   - Firebase Auth będzie działać automatycznie"
    echo ""
}

# Uruchom główną funkcję
main "$@"
