#!/bin/bash

# Skrypt do aktualizacji aplikacji przez Git na serwerze OVH
# Uruchom przez KVM na serwerze

echo "🚀 Aktualizacja aplikacji przez Git na serwerze OVH"
echo "=================================================="

# 1. Przejdź do katalogu aplikacji
cd /root/lotek
echo "✅ Katalog: $(pwd)"

# 2. Sprawdź status Git
echo ""
echo "🔍 Status Git:"
git status

# 3. Pobierz najnowsze zmiany z Git
echo ""
echo "📥 Pobieranie najnowszych zmian z Git..."
git fetch origin

# 4. Sprawdź czy są nowe zmiany
echo ""
echo "🔍 Sprawdzanie nowych zmian..."
if git log HEAD..origin/main --oneline | grep -q .; then
    echo "✅ Znaleziono nowe zmiany - aktualizuję..."
    
    # 5. Przełącz na main branch
    git checkout main
    
    # 6. Pobierz zmiany
    git pull origin main
    
    echo "✅ Pobrano najnowsze zmiany"
else
    echo "ℹ️  Brak nowych zmian"
fi

# 7. Sprawdź czy pliki .env istnieją
echo ""
echo "🔍 Sprawdzanie plików .env..."
if [ -f frontend/.env ]; then
    echo "✅ frontend/.env istnieje"
    echo "📋 PayPal Client ID:"
    grep "REACT_APP_PAYPAL_CLIENT_ID" frontend/.env || echo "❌ Brak Client ID"
else
    echo "❌ frontend/.env nie istnieje - tworzę..."
    cat > frontend/.env << 'EOF'
# Konfiguracja frontendu React
REACT_APP_PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
REACT_APP_PAYPAL_ENVIRONMENT=live
REACT_APP_API_URL=https://losuje.pl
REACT_APP_FRONTEND_URL=https://losuje.pl
EOF
    chmod 600 frontend/.env
    echo "✅ Utworzono frontend/.env"
fi

if [ -f backend/.env ]; then
    echo "✅ backend/.env istnieje"
    echo "📋 PayPal Environment:"
    grep "PAYPAL_ENVIRONMENT" backend/.env || echo "❌ Brak environment"
else
    echo "❌ backend/.env nie istnieje - tworzę..."
    cat > backend/.env << 'EOF'
# Konfiguracja produkcji dla LOTTO AI
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://losuje.pl
JWT_SECRET=twoj_silny_jwt_secret_produkcja_2024_lotto_ai

# PayPal - Produkcja (PRAWDZIWE KLUCZE LIVE!)
PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
PAYPAL_CLIENT_SECRET=EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR
PAYPAL_RETURN_URL=https://losuje.pl/payment-success
PAYPAL_CANCEL_URL=https://losuje.pl/payment-cancel
PAYPAL_ENVIRONMENT=live
EOF
    chmod 600 backend/.env
    echo "✅ Utworzono backend/.env"
fi

# 8. Zbuduj frontend z nowymi zmianami
echo ""
echo "🔨 Budowanie frontendu..."
cd frontend

# Sprawdź czy node_modules istnieje
if [ ! -d "node_modules" ]; then
    echo "⚠️  Instaluję zależności..."
    npm install
fi

echo "🔨 Uruchamiam build..."
npm run build

cd ..
echo "✅ Frontend zbudowany"

# 9. Restart aplikacji
echo ""
echo "🔄 Restart aplikacji..."
pm2 restart all
echo "✅ Aplikacja zrestartowana"

# 10. Sprawdź status
echo ""
echo "🔍 Sprawdzanie statusu..."
pm2 status

echo ""
echo "📋 Ostatnie logi:"
pm2 logs --lines 5

echo ""
echo "=================================================="
echo "✅ AKTUALIZACJA ZAKOŃCZONA POMYŚLNIE!"
echo "=================================================="
echo ""
echo "🌐 Sprawdź aplikację: https://losuje.pl"
echo "📋 Sprawdź logi: pm2 logs"
echo "🔍 Sprawdź konfigurację: cat frontend/.env"
echo ""
echo "🎯 Aplikacja teraz używa danych z plików .env!"
