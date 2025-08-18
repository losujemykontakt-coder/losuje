# 🚀 Mechanizm Cache'owania Statystyk - Przewodnik

## 📋 Problem
Aplikacja pobierała statystyki za każdym razem gdy użytkownik zmieniał grę w generatorze, mimo że system już pobrał statystyki podczas włączania aplikacji. To powodowało niepotrzebne paski ładowania i opóźnienia.

## ✅ Rozwiązanie
Zaimplementowano mechanizm cache'owania statystyk, który:

### 🔄 Jak działa cache:
1. **Automatyczna aktualizacja**: Backend aktualizuje statystyki co 10 minut
2. **Cache w plikach**: Statystyki są zapisywane w plikach JSON w folderze `backend/cache/`
3. **Szybki dostęp**: Frontend najpierw sprawdza cache przed próbą pobrania z API
4. **Czas wygaśnięcia**: Cache wygasa po 10 minutach

### 📁 Struktura cache:
```
backend/cache/
├── stats_lotto.json
├── stats_miniLotto.json
├── stats_multiMulti.json
└── stats_eurojackpot.json
```

### 🔧 Funkcje cache'owania:

#### `getStatsFromCache(gameType)`
- Sprawdza czy istnieje plik cache dla danej gry
- Weryfikuje wiek cache (maksymalnie 10 minut)
- Zwraca dane z cache lub `null`

#### `saveStatsToCache(gameType, stats)`
- Zapisuje statystyki do pliku cache
- Dodaje timestamp i metadane
- Obsługuje błędy zapisu

### 🌐 Endpointy API:

#### `GET /api/statistics/:gameType`
- **Priorytet 1**: Sprawdza cache
- **Priorytet 2**: Próbuje API lotto.pl
- **Priorytet 3**: Używa scrapera
- **Priorytet 4**: Domyślne statystyki

#### `POST /api/clear-stats-cache`
- Usuwa wszystkie pliki cache
- Wymaga dostępu premium
- Zwraca status operacji

### 🎯 Korzyści:
1. **Szybkość**: Natychmiastowe odpowiedzi z cache
2. **Oszczędność**: Mniej requestów do API lotto.pl
3. **Stabilność**: Działa nawet gdy API jest niedostępne
4. **UX**: Brak pasków ładowania dla danych z cache

### 📊 Logi:
```
✅ Używam cache dla lotto (wiek: 45s)
✅ Zwracam statystyki z cache dla lotto
💾 Zapisano cache dla lotto
⏰ Cache dla lotto wygasł (wiek: 605s)
```

### 🛠️ Konfiguracja:
- **Czas wygaśnięcia**: 10 minut (600 000 ms)
- **Lokalizacja cache**: `backend/cache/`
- **Format plików**: JSON z timestamp
- **Automatyczna aktualizacja**: Co 10 minut

### 🔍 Debugowanie:
1. Sprawdź logi backend dla informacji o cache
2. Sprawdź folder `backend/cache/` dla plików
3. Użyj endpoint `/api/clear-stats-cache` do resetu
4. Monitoruj wiek cache w logach

### 🚨 Uwagi:
- Cache jest automatycznie odświeżany co 10 minut
- Pliki cache są tworzone automatycznie
- Błędy cache nie blokują działania aplikacji
- Frontend pokazuje źródło danych (cache/api/scraper/default)

