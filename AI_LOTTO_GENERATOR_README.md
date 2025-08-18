# 🤖 AI Lotto Generator - Dokumentacja

## 📋 Opis funkcjonalności

AI Lotto Generator to zaawansowany generator liczb lotto z 5 różnymi trybami AI, każdy z unikalnymi animacjami i efektami wizualnymi. Aplikacja obsługuje 5 gier lotto i jest w pełni responsywna na urządzenia mobilne i komputery.

## 🎯 Obsługiwane gry

1. **Lotto** (6 z 49)
2. **Mini Lotto** (5 z 42)
3. **Multi Multi** (10 z 80)
4. **Eurojackpot** (5 z 50 + 2 z 12)
5. **Ekstra Pensja** (5 z 35 + 1 z 4)

## 🎨 5 Trybów AI

### 1. 🧠 Mózg AI w akcji
- **Opis**: Analiza neuronowa z efektami wizualnymi
- **Animacje**: 
  - Animowana głowa robota
  - Neurony łączące się
  - Teksty pokazywane co 1-2 sekundy
  - Efekt rozbłysku przy odsłonięciu liczb
- **Czas trwania**: ~4.5 sekundy

### 2. 🎰 Maszyna hazardowa
- **Opis**: 3D maszyna z ramieniem robota
- **Animacje**:
  - Maszyna się kręci
  - Ramię robota wyciąga kule
  - Kule odbijają się w środku
  - Efekt konfetti na końcu
- **Czas trwania**: ~6-8 sekund

### 3. 💻 Tryb Hackera
- **Opis**: Terminal z efektami glitch
- **Animacje**:
  - Terminal z wpisywanymi komendami
  - Efekt glitch na ekranie
  - Kolorowe kule z numerami
  - Efekt dźwiękowy (wizualny)
- **Czas trwania**: ~6 sekund

### 4. 🎮 Gra zręcznościowa
- **Opis**: Laser vs poruszające się kule
- **Animacje**:
  - Kule poruszają się po ekranie
  - AI steruje laserem
  - Efekt eksplozji przy trafieniu
  - Fale świetlne na końcu
- **Czas trwania**: ~8-10 sekund

### 5. 🤖 Personifikacja AI
- **Opis**: Avatar z komentarzami
- **Animacje**:
  - Avatar AI z różnymi emoji
  - Chat-bubble z komentarzami
  - Bąbelki w tle
  - Efekt konfetti
- **Czas trwania**: ~10-12 sekund

## 🛠 Technologie

- **React 19.1.0** - Framework UI
- **Framer Motion 12.23.12** - Animacje
- **TailwindCSS 3.4.17** - Stylowanie
- **LocalStorage** - Historia generowań
- **Responsive Design** - Wsparcie mobile/desktop

## 📱 Responsywność

Aplikacja jest w pełni responsywna:
- **Desktop**: Layout 2-kolumnowy (panel kontrolny + główny obszar)
- **Mobile**: Layout 1-kolumnowy (główny obszar + panel kontrolny na dole)
- **Adaptacyjne rozmiary**: Przyciski, kule i teksty dostosowują się do rozmiaru ekranu
- **Touch-friendly**: Wszystkie elementy są optymalizowane dla dotyku

## 🎯 Funkcje

### Podstawowe
- ✅ Wybór gry lotto
- ✅ Wybór trybu AI
- ✅ Generowanie liczb z animacjami
- ✅ Historia ostatnich 5 generowań
- ✅ Kopiowanie wyników do schowka

### Zaawansowane
- ✅ LocalStorage dla historii
- ✅ Responsywny design
- ✅ Animacje Framer Motion
- ✅ Efekty wizualne (konfetti, błyski, glitch)
- ✅ Integracja z systemem płatności

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js 18+
- npm lub yarn

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone <repository-url>
cd lotek
```

2. **Instalacja zależności frontend**
```bash
cd frontend
npm install
```

3. **Instalacja zależności backend**
```bash
cd ../backend
npm install
```

4. **Uruchomienie aplikacji**
```bash
# Terminal 1 - Backend
cd backend
node index.js

# Terminal 2 - Frontend
cd frontend
npm start
```

5. **Otwarcie aplikacji**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📁 Struktura plików

```
frontend/src/components/ai-generator/
├── AILottoGenerator.js          # Główny komponent
├── AIThinkingMode.js            # Tryb 1: Mózg AI
├── LotteryMachineMode.js        # Tryb 2: Maszyna hazardowa
├── HackerMode.js                # Tryb 3: Tryb Hackera
├── ArcadeMode.js                # Tryb 4: Gra zręcznościowa
└── AIPersonaMode.js             # Tryb 5: Personifikacja AI
```

## 🎨 Style i animacje

### Kolory
- **Gradient tła**: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)`
- **Kule główne**: `linear-gradient(135deg, #ff6b6b, #ee5a52)`
- **Kule dodatkowe**: `linear-gradient(135deg, #4ecdc4, #44a08d)`
- **Kule Euro**: `linear-gradient(135deg, #3498db, #2980b9)`

### Animacje
- **Framer Motion**: Wszystkie animacje używają Framer Motion
- **Spring animations**: Naturalne ruchy sprężyste
- **Staggered animations**: Sekwencyjne animacje
- **Hover effects**: Efekty przy najechaniu myszką

## 🔧 Konfiguracja

### Zmienne środowiskowe
```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PAYMENT_TIMEOUT=30000

# Backend (.env)
PORT=3001
NODE_ENV=development
```

### LocalStorage
- **Klucz**: `aiLottoHistory`
- **Format**: Array z obiektami historii
- **Maksymalna liczba**: 5 ostatnich generowań

## 🐛 Rozwiązywanie problemów

### Częste problemy
1. **Animacje nie działają**
   - Sprawdź czy Framer Motion jest zainstalowany
   - Uruchom `npm install framer-motion`

2. **Responsywność nie działa**
   - Sprawdź czy `isMobile` state jest poprawnie ustawiony
   - Sprawdź event listener dla resize

3. **Historia nie zapisuje się**
   - Sprawdź czy LocalStorage jest dostępny
   - Sprawdź format danych w LocalStorage

### Debugowanie
```javascript
// Sprawdzenie stanu mobile
console.log('isMobile:', isMobile);

// Sprawdzenie historii
console.log('History:', localStorage.getItem('aiLottoHistory'));

// Sprawdzenie wybranej gry/trybu
console.log('Selected game:', selectedGame);
console.log('Selected mode:', selectedMode);
```

## 📈 Plan rozwoju

### Krótkoterminowe
- [ ] Dodanie dźwięków do animacji
- [ ] Więcej efektów wizualnych
- [ ] Eksport wyników do PDF

### Długoterminowe
- [ ] Integracja z prawdziwymi danymi lotto
- [ ] Algorytmy predykcyjne AI
- [ ] Statystyki skuteczności
- [ ] Tryb multiplayer

## 🤝 Współpraca

### Zgłaszanie błędów
1. Sprawdź czy problem nie jest już zgłoszony
2. Utwórz nowy issue z opisem problemu
3. Dołącz zrzuty ekranu jeśli potrzebne

### Pull Requests
1. Fork repozytorium
2. Utwórz branch dla nowej funkcjonalności
3. Dodaj testy jeśli możliwe
4. Opisz zmiany w PR

## 📄 Licencja

Projekt jest objęty licencją MIT. Szczegóły w pliku LICENSE.

## 👥 Autorzy

- **Główny developer**: AI Assistant
- **Design**: AI Assistant
- **Animacje**: Framer Motion + AI Assistant

---

**Wersja**: 1.0.0  
**Data**: 2024-01-15  
**Status**: Produkcyjny ✅



