#!/bin/bash

echo "🔍 Sprawdzanie statusu backendu..."

# Sprawdź procesy PM2
echo "📊 Procesy PM2:"
pm2 list

echo ""
echo "📊 Status PM2:"
pm2 status

echo ""
echo "🔍 Sprawdź czy backend odpowiada:"
curl -I https://losuje.pl/api/health

echo ""
echo "🔍 Test CORS z losuje-generator.pl:"
curl -H "Origin: https://losuje-generator.pl" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://losuje.pl/api/health

echo ""
echo "🔍 Test logowania:"
curl -H "Origin: https://losuje-generator.pl" \
     -H "Content-Type: application/json" \
     -X POST \
     -d '{"email":"test@test.com","password":"test"}' \
     https://losuje.pl/api/auth/register-login

echo ""
echo "📋 Logi backendu (ostatnie 20 linii):"
pm2 logs lotek-backend --lines 20
