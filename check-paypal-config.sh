#!/bin/bash

# Skrypt do sprawdzenia konfiguracji PayPal na serwerze OVH
# Uruchom przez KVM na serwerze

echo "🔍 Sprawdzanie konfiguracji PayPal na serwerze..."

# 1. Przejdź do katalogu aplikacji
cd /root/lotek

echo "📁 Katalog: $(pwd)"

# 2. Sprawdź plik frontend/.env
echo ""
echo "🔍 FRONTEND/.ENV:"
if [ -f frontend/.env ]; then
    echo "✅ Plik istnieje"
    echo "📋 Zawartość (tylko PayPal):"
    grep -E "REACT_APP_PAYPAL" frontend/.env || echo "❌ Brak konfiguracji PayPal"
else
    echo "❌ Plik nie istnieje"
fi

# 3. Sprawdź plik backend/.env
echo ""
echo "🔍 BACKEND/.ENV:"
if [ -f backend/.env ]; then
    echo "✅ Plik istnieje"
    echo "📋 Zawartość (tylko PayPal):"
    grep -E "PAYPAL" backend/.env || echo "❌ Brak konfiguracji PayPal"
else
    echo "❌ Plik nie istnieje"
fi

# 4. Sprawdź czy aplikacja jest uruchomiona
echo ""
echo "🔍 STATUS APLIKACJI:"
pm2 status

# 5. Sprawdź logi aplikacji
echo ""
echo "🔍 OSTATNIE LOGI (ostatnie 10 linii):"
pm2 logs --lines 10

# 6. Sprawdź czy frontend jest zbudowany
echo ""
echo "🔍 FRONTEND BUILD:"
if [ -d frontend/build ]; then
    echo "✅ Katalog build istnieje"
    ls -la frontend/build/ | head -5
else
    echo "❌ Katalog build nie istnieje"
fi

echo ""
echo "✅ Sprawdzanie zakończone!"
