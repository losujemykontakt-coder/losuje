#!/bin/bash

echo "🔧 Naprawianie CORS w backend..."

# Katalog backend
BACKEND_DIR="/var/www/losuje.pl/lotek/backend"

# Przejdź do katalogu backend
cd "$BACKEND_DIR"

# Zastąp wszystkie wystąpienia allowedOrigins
echo "📝 Aktualizowanie allowedOrigins..."

# Zastąp pierwsze wystąpienie (linia ~190)
sed -i 's/const allowedOrigins = \['\''https:\/\/losuje.pl'\'', '\''http:\/\/localhost:3000'\'', '\''http:\/\/127.0.0.1:3000'\''\];/const allowedOrigins = ['\''https:\/\/losuje.pl'\'', '\''https:\/\/losuje-generator.pl'\'', '\''http:\/\/localhost:3000'\'', '\''http:\/\/127.0.0.1:3000'\''\];/' index.js

# Zastąp drugie wystąpienie (linia ~230)
sed -i 's/const allowedOrigins = \['\''https:\/\/losuje.pl'\'', '\''http:\/\/localhost:3000'\'', '\''http:\/\/127.0.0.1:3000'\''\];/const allowedOrigins = ['\''https:\/\/losuje.pl'\'', '\''https:\/\/losuje-generator.pl'\'', '\''http:\/\/localhost:3000'\'', '\''http:\/\/127.0.0.1:3000'\''\];/' index.js

echo "✅ CORS naprawiony!"
echo "🔄 Restartuj backend..."
sudo systemctl restart losuje-backend

echo "🌐 Sprawdź: https://losuje-generator.pl/"
