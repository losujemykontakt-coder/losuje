#!/bin/bash

# Skrypt do aktualizacji konfiguracji PayPal na serwerze OVH
# Uruchom przez KVM na serwerze

echo "🔧 Aktualizacja konfiguracji PayPal na serwerze OVH..."

# 1. Przejdź do katalogu aplikacji
cd /root/lotek

# 2. Utwórz plik .env w frontend z poprawnymi danymi PayPal
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

echo "✅ Utworzono frontend/.env z poprawnymi danymi PayPal"

# 3. Sprawdź czy backend/.env istnieje i ma poprawne dane
if [ ! -f backend/.env ]; then
    echo "📝 Tworzenie backend/.env..."
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
    echo "✅ backend/.env już istnieje"
fi

# 4. Sprawdź uprawnienia plików
chmod 600 frontend/.env
chmod 600 backend/.env

echo "🔒 Ustawiono odpowiednie uprawnienia dla plików .env"

# 5. Zbuduj frontend z nowymi zmiennymi środowiskowymi
echo "🔨 Budowanie frontendu z nową konfiguracją..."
cd frontend
npm run build

# 6. Restart aplikacji
echo "🔄 Restart aplikacji..."
cd ..
pm2 restart all

echo "✅ Aktualizacja zakończona!"
echo "📋 Sprawdź logi: pm2 logs"
echo "🌐 Sprawdź aplikację: https://losuje.pl"
