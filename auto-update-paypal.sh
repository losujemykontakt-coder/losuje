#!/bin/bash

# Automatyczny skrypt do aktualizacji konfiguracji PayPal na serwerze OVH
# Uruchom przez KVM na serwerze

set -e  # Zatrzymaj skrypt przy błędzie

echo "🚀 Automatyczna aktualizacja konfiguracji PayPal na serwerze OVH"
echo "================================================================"

# 1. Sprawdź czy jesteśmy w odpowiednim katalogu
if [ ! -d "/root/lotek" ]; then
    echo "❌ Katalog /root/lotek nie istnieje!"
    echo "Upewnij się, że aplikacja jest zainstalowana w /root/lotek"
    exit 1
fi

cd /root/lotek
echo "✅ Przejdź do katalogu: $(pwd)"

# 2. Utwórz plik frontend/.env
echo ""
echo "📝 Tworzenie frontend/.env..."
cat > frontend/.env << 'EOF'
# Konfiguracja frontendu React
# Zmienne środowiskowe dla React muszą zaczynać się od REACT_APP_

# PayPal Configuration (PRAWDZIWE KLUCZE LIVE!)
REACT_APP_PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
REACT_APP_PAYPAL_ENVIRONMENT=live

# Backend URL
REACT_APP_API_URL=https://losuje.pl

# Frontend URL
REACT_APP_FRONTEND_URL=https://losuje.pl
EOF

echo "✅ Utworzono frontend/.env"

# 3. Sprawdź i zaktualizuj backend/.env
echo ""
echo "📝 Sprawdzanie backend/.env..."

if [ ! -f backend/.env ]; then
    echo "❌ Plik backend/.env nie istnieje - tworzę..."
    cat > backend/.env << 'EOF'
# Konfiguracja produkcji dla LOTTO AI
NODE_ENV=production
PORT=3001

# CORS dla produkcji
CORS_ORIGIN=https://losuje.pl

# JWT Secret (zmień na silny, losowy klucz!)
JWT_SECRET=twoj_silny_jwt_secret_produkcja_2024_lotto_ai

# Email (dla resetowania hasła)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj_email@gmail.com
EMAIL_PASS=twoje_haslo_aplikacji
EMAIL_FROM=noreply@losuje.pl

# Przelewy24 - Produkcja (PRAWDZIWE KLUCZE)
PRZELEWY24_MERCHANT_ID=269321
PRZELEWY24_POS_ID=269321
PRZELEWY24_API_KEY=aa2aefcd5f59cdb2b56b40470a6d51ae
PRZELEWY24_CRC=476f49249ee1c6e1
PRZELEWY24_RETURN_URL=https://losuje.pl/payment-success
PRZELEWY24_STATUS_URL=https://losuje.pl/api/przelewy24/status
PRZELEWY24_WEBHOOK_URL=https://losuje.pl/api/przelewy24/webhook
PRZELEWY24_ENVIRONMENT=production

# PayPal - Produkcja (PRAWDZIWE KLUCZE LIVE!)
PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
PAYPAL_CLIENT_SECRET=EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR
PAYPAL_RETURN_URL=https://losuje.pl/payment-success
PAYPAL_CANCEL_URL=https://losuje.pl/payment-cancel
PAYPAL_ENVIRONMENT=live

# Firebase (użyj istniejącego serviceAccountKey.json)
# Plik serviceAccountKey.json musi być w katalogu backend/

# Monitoring
PM2_MONITORING=true
LOG_LEVEL=info
EOF
    echo "✅ Utworzono backend/.env"
else
    echo "✅ Plik backend/.env istnieje"
    
    # Sprawdź czy ma poprawne dane PayPal
    if ! grep -q "PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC" backend/.env; then
        echo "⚠️  Aktualizuję dane PayPal w backend/.env..."
        
        # Usuń stare dane PayPal
        sed -i '/^PAYPAL_/d' backend/.env
        
        # Dodaj nowe dane PayPal
        cat >> backend/.env << 'EOF'

# PayPal - Produkcja (PRAWDZIWE KLUCZE LIVE!)
PAYPAL_CLIENT_ID=Affx9V_8v8IOGAfyMHPooVW70t1eAOGMSoCUCTW-9mrjeeTsHw14cwA6RqN8lqzFRSn7sHi9AG75BGlC
PAYPAL_CLIENT_SECRET=EL-rOID1Th-ByzT-IcWGGxUQNkXw1sz9gwlSK_LeYTTG839kTlRqTY6VrDa2iwoLAkY-5F2edJ2kOkbR
PAYPAL_RETURN_URL=https://losuje.pl/payment-success
PAYPAL_CANCEL_URL=https://losuje.pl/payment-cancel
PAYPAL_ENVIRONMENT=live
EOF
        echo "✅ Zaktualizowano dane PayPal w backend/.env"
    else
        echo "✅ Dane PayPal w backend/.env są już poprawne"
    fi
fi

# 4. Ustaw uprawnienia
echo ""
echo "🔒 Ustawianie uprawnień..."
chmod 600 frontend/.env
chmod 600 backend/.env
echo "✅ Ustawiono uprawnienia 600 dla plików .env"

# 5. Zbuduj frontend
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

# 6. Restart aplikacji
echo ""
echo "🔄 Restart aplikacji..."
pm2 restart all
echo "✅ Aplikacja zrestartowana"

# 7. Sprawdź status
echo ""
echo "🔍 Sprawdzanie statusu..."
pm2 status

echo ""
echo "📋 Ostatnie logi:"
pm2 logs --lines 5

echo ""
echo "================================================================"
echo "✅ AKTUALIZACJA ZAKOŃCZONA POMYŚLNIE!"
echo "================================================================"
echo ""
echo "🌐 Sprawdź aplikację: https://losuje.pl"
echo "📋 Sprawdź logi: pm2 logs"
echo "🔍 Sprawdź konfigurację: cat frontend/.env"
echo ""
echo "🎯 PayPal powinien teraz używać poprawnych danych LIVE!"
