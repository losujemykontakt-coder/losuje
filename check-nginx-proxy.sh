#!/bin/bash

echo "🔍 SPRAWDZANIE KONFIGURACJI NGINX PROXY..."

echo "📋 Konfiguracja Nginx:"
sudo cat /etc/nginx/sites-available/losuje.pl

echo ""
echo "🔍 Test Nginx:"
sudo nginx -t

echo ""
echo "🔍 Status Nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🔍 Test proxy_pass:"
curl -I https://losuje.pl/api/health

echo ""
echo "🔍 Test bezpośrednio backendu:"
curl -I http://localhost:3001/api/health

echo ""
echo "🔍 Sprawdź port 3001:"
netstat -tlnp | grep :3001

echo ""
echo "🔍 Logi Nginx error:"
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "🔍 Logi Nginx access:"
sudo tail -10 /var/log/nginx/access.log

echo ""
echo "✅ Sprawdzenie zakończone!"
