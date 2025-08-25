#!/bin/bash

echo "🗑️ Usuwanie komunikatów o błędach z interfejsu użytkownika..."

# Katalog frontend
FRONTEND_DIR="/var/www/losuje.pl/lotek/frontend/src"

# Przejdź do katalogu frontend
cd "$FRONTEND_DIR"

echo "📝 Usuwanie komunikatów o błędach..."

# Usuń komunikaty o błędach z HarmonicAnalyzer.js
sed -i "s/setError('Nie udało się pobrać statystyk harmonicznych');/\/\/ Błąd pobierania statystyk - bez komunikatu dla użytkownika/" components/harmonic-analyzer/HarmonicAnalyzer.js

# Usuń komunikaty o błędach z FinalStatistics.js
sed -i "s/setError('Nie udało się załadować statystyk');/\/\/ Błąd ładowania statystyk - bez komunikatu dla użytkownika/" components/statistics/FinalStatistics.js

# Usuń komunikaty o błędach z Statistics.js
sed -i "s/setError('Błąd pobierania danych. Używam domyślnych danych.');/\/\/ Błąd pobierania danych - bez komunikatu dla użytkownika/" components/statistics/Statistics.js

# Usuń komunikaty o błędach z NewStatistics.js
sed -i "s/setError(err.message);/\/\/ Błąd - bez komunikatu dla użytkownika/" components/statistics/NewStatistics.js

# Usuń komunikaty o błędach z useLottoData.js
sed -i "s/setError(err.message);/\/\/ Błąd - bez komunikatu dla użytkownika/" hooks/useLottoData.js

echo "✅ Komunikaty o błędach usunięte!"
echo "🌐 Zbuduj aplikację ponownie:"
echo "cd /var/www/losuje.pl/lotek/frontend"
echo "npm run build"
