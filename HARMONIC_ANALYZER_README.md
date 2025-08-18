# 🎵 Harmonic Lotto Analyzer + Smart Generator

## Opis projektu

**Harmonic Lotto Analyzer + Smart Generator** to zaawansowany system analizy i generowania liczb lotto oparty na **Prawie Harmonicznych Odległości**. System analizuje historyczne wyniki lotto pod kątem odstępów między kolejnymi liczbami, wykrywając wzorce harmoniczne i prawidłowości w rozkładzie liczb.

## 🎯 Zasada działania

### Analiza Harmoniczna
1. **Obliczanie odstępów** - Dla każdego losowania obliczamy różnice między kolejnymi liczbami
2. **Analiza rozkładu** - Badamy rozkład tych odstępów w czasie
3. **Wykrywanie wzorców** - Sprawdzamy czy średnia odstępów jest bliska wartości 7-8 (harmoniczna)
4. **Porównanie czasowe** - Analizujemy statystyki w różnych oknach czasowych (2005-2009, 2010-2014, 2015-2019, 2020-2025)

### Generowanie Inteligentne
1. **Rozkład prawdopodobieństwa** - Budujemy rozkład na podstawie histogramu odstępów
2. **Generowanie odstępów** - Losujemy odstępy z rozkładu prawdopodobieństwa
3. **Konwersja na liczby** - Zamieniamy odstępy na liczby lotto
4. **Filtry matematyczne** - Stosujemy zaawansowane filtry optymalizacyjne
5. **Monte Carlo** - Używamy symulacji do walidacji zestawów

## ⚡ Strategie generowania

### 🎯 Zrównoważona (Balanced)
- **Opis**: Łączy różne podejścia - 50% z poolu hot+cold liczb, 50% z rozkładu harmonicznych odstępów
- **Zastosowanie**: Optymalna dla większości graczy
- **Czas generowania**: ~2-3 sekundy

### 🔥 Gorące liczby (Hot)
- **Opis**: Faworyzuje liczby, które często występowały w historii
- **Zasada**: Bazuje na założeniu, że popularne liczby mają tendencję do powtarzania się
- **Czas generowania**: ~2-3 sekundy

### ❄️ Zimne liczby (Cold)
- **Opis**: Faworyzuje liczby, które rzadko występowały w historii
- **Zasada**: Bazuje na teorii wyrównywania się szans w długim terminie
- **Czas generowania**: ~2-3 sekundy

### ♟️ Strategia szachowa (Chess)
- **Opis**: Zaawansowana strategia wykorzystująca Monte Carlo symulacje (10k gier) i heurystyki
- **Zasada**: Najbardziej zaawansowana metoda, ale wymaga więcej czasu
- **Czas generowania**: ~5-10 sekund

## 🛠️ Filtry matematyczne

### Filtr parzystości
- **Zasada**: Co najmniej 2 i maksymalnie 4 parzyste liczby
- **Cel**: Zapewnienie zrównoważonego rozkładu parzystości

### Filtr rozkładu niskie/wysokie
- **Zasada**: Rozkład 50/50 (±1) między liczbami niskimi i wysokimi
- **Cel**: Unikanie skrajności w rozkładzie

### Filtr sekwencji
- **Zasada**: Nie więcej niż 2 kolejne liczby
- **Cel**: Unikanie popularnych wzorców sekwencyjnych

### Filtr klastrów
- **Zasada**: Nie więcej niż 2 liczby w tej samej dziesiątce
- **Cel**: Zapewnienie równomiernego rozkładu

### Filtr popularności
- **Zasada**: Unikanie wzorców dat urodzin i popularnych sekwencji
- **Cel**: Eliminacja często wybieranych kombinacji

## 📊 Obsługiwane gry

- **Lotto** (6/49) - Główna gra lotto
- **Mini Lotto** (5/42) - Mniejsza gra lotto
- **Multi Multi** (10/80) - Gra z większą liczbą liczb
- **Eurojackpot** (5/50) - Europejska gra lotto

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js 14+
- npm lub yarn

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Dostęp
- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- Harmonic Analyzer: http://localhost:3000/harmonic-analyzer (po zalogowaniu)

## 📡 API Endpointy

### Generowanie zestawów
```http
POST /api/harmonic/generate
Content-Type: application/json

{
  "game": "lotto",
  "strategy": "balanced",
  "nSets": 5
}
```

### Pobieranie statystyk
```http
GET /api/harmonic/stats
```

### Nowa analiza
```http
POST /api/harmonic/analyze
```

### Aktualizacja danych
```http
POST /api/harmonic/update
```

### Histogram odstępów
```http
GET /api/harmonic/histogram
```

### Okna czasowe
```http
GET /api/harmonic/time-windows
```

### Informacje o systemie
```http
GET /api/harmonic/info
```

## 📈 Przykład odpowiedzi API

```json
{
  "success": true,
  "sets": [
    {
      "numbers": [7, 13, 23, 31, 37, 42],
      "confidence": 0.85,
      "strategy": "balanced",
      "gaps": [6, 10, 8, 6, 5],
      "analysis": {
        "sum": 153,
        "evenCount": 3,
        "oddCount": 3,
        "lowCount": 3,
        "highCount": 3
      }
    }
  ],
  "strategy": "balanced",
  "game": "lotto",
  "generatedAt": "2024-01-15T10:30:00.000Z",
  "harmonicAnalysis": {
    "meanGap": 7.2,
    "isHarmonic": true
  }
}
```

## 🎨 Funkcje frontendu

### Animacje i efekty
- **Framer Motion** - Płynne animacje komponentów
- **Lottie** - Animowane ikony i efekty
- **Progress Bar** - Wizualizacja kroków generowania
- **Confidence Indicators** - Wskaźniki pewności dla każdej liczby

### Interaktywność
- **Responsive Design** - Dostosowanie do różnych urządzeń
- **Real-time Updates** - Aktualizacje w czasie rzeczywistym
- **Export JSON** - Eksport wyników do pliku JSON
- **Strategy Selection** - Wybór strategii z opisami

### Wizualizacje
- **Harmonic Balls** - Animowane kulki z liczbami
- **Stats Cards** - Karty ze statystykami
- **Progress Steps** - Kroki procesu generowania
- **Confidence Colors** - Kolorystyczne wskaźniki pewności

## 🔧 Konfiguracja

### Backend (config.js)
```javascript
module.exports = {
  HARMONIC: {
    CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minut
    MAX_SETS: 20,
    MONTE_CARLO_ITERATIONS: 10000,
    HARMONIC_RANGE: [7, 8]
  }
}
```

### Frontend
- Automatyczne pobieranie statystyk przy ładowaniu
- Cache'owanie wyników w localStorage
- Responsive breakpoints dla różnych urządzeń

## 📊 Analiza wyników

### Metryki jakości
- **Confidence Score** - Ocena pewności zestawu (0-1)
- **Harmonic Alignment** - Zgodność z wzorcami harmonicznymi
- **Statistical Balance** - Równowaga statystyczna
- **Popularity Avoidance** - Unikanie popularnych kombinacji

### Interpretacja wyników
- **Confidence > 0.8** - Wysoka pewność
- **Confidence 0.6-0.8** - Średnia pewność
- **Confidence < 0.6** - Niska pewność

## ⚠️ Ważne uwagi

### Zastrzeżenia prawne
- **Żadna metoda nie gwarantuje trafienia 6/6**
- **System optymalizuje jedynie statystyczne cechy zestawów**
- **Gry hazardowe mogą uzależniać**
- **Używaj odpowiedzialnie**

### Ograniczenia techniczne
- **Dane historyczne** - Jakość zależy od dostępności danych
- **Czas generowania** - Strategia szachowa wymaga więcej czasu
- **Cache** - Statystyki są cache'owane przez 5 minut
- **API Limits** - Maksymalnie 20 zestawów na żądanie

## 🐛 Rozwiązywanie problemów

### Błąd "Nie udało się pobrać danych"
- Sprawdź połączenie internetowe
- Sprawdź czy backend działa
- Sprawdź logi serwera

### Błąd "Nie udało się wygenerować zestawu"
- Zmniejsz liczbę zestawów
- Spróbuj inną strategię
- Sprawdź czy filtry nie są zbyt restrykcyjne

### Wolne generowanie
- Strategia szachowa wymaga więcej czasu
- Sprawdź obciążenie serwera
- Spróbuj strategię zrównoważoną

## 📝 Historia wersji

### v1.0.0 (2024-01-15)
- ✅ Analiza harmonicznych odstępów
- ✅ 4 strategie generowania
- ✅ Monte Carlo symulacje
- ✅ Zaawansowane filtry matematyczne
- ✅ Responsywny frontend z animacjami
- ✅ API endpointy
- ✅ Eksport wyników
- ✅ Dokumentacja

## 🤝 Współpraca

### Struktura plików
```
backend/
├── harmonic-analyzer.js    # Analiza harmoniczna
├── harmonic-generator.js   # Generator liczb
├── harmonic-api.js         # API endpointy
└── data/                   # Dane historyczne

frontend/src/components/harmonic-analyzer/
├── HarmonicAnalyzer.js     # Główny komponent
└── HarmonicAnalyzer.css    # Style CSS
```

### Dodawanie nowych funkcji
1. Dodaj logikę w odpowiednim pliku backend
2. Utwórz endpoint API
3. Dodaj komponent frontend
4. Zaktualizuj dokumentację

## 📞 Wsparcie

- **Email**: support@harmonic-lotto.com
- **GitHub Issues**: https://github.com/harmonic-lotto/issues
- **Dokumentacja**: https://harmonic-lotto.com/docs

---

**Harmonic Lotto Analyzer + Smart Generator** - Zaawansowana analiza i generowanie liczb lotto oparte na Prawie Harmonicznych Odległości.

