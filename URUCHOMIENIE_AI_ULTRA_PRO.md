# 🚀 Instrukcje Uruchomienia AI Lotto Generator Ultra Pro

## 📋 Wymagania Wstępne

- Node.js 16+ zainstalowany
- npm lub yarn zainstalowany
- Git zainstalowany

## 🔧 Krok 1: Instalacja Zależności

### Opcja A: Automatyczna instalacja (Linux/Mac)
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Opcja B: Ręczna instalacja
```bash
# Frontend zależności
cd frontend
npm install lottie-react @react-three/fiber @react-three/drei three

# Powrót do głównego katalogu
cd ..
```

## 🚀 Krok 2: Uruchomienie Aplikacji

### Terminal 1 - Backend
```bash
cd backend
npm start
```

Powinieneś zobaczyć:
```
🚀 === BACKEND STARTED ===
🌐 Serwer działa na http://localhost:5000
✅ Backend gotowy do obsługi żądań!
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Powinieneś zobaczyć:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🧪 Krok 3: Testowanie API

### Opcja A: Automatyczny test
```bash
node test-ai-ultra-pro.js
```

### Opcja B: Ręczne testowanie
```bash
# Sprawdzenie statusu API
curl http://localhost:5000/api/ai-ultra-pro/health

# Generowanie liczb dla Lotto
curl http://localhost:5000/api/ai-ultra-pro/generate?game=lotto

# Pobieranie statystyk
curl http://localhost:5000/api/ai-ultra-pro/stats?game=lotto
```

## 🎮 Krok 4: Użycie Aplikacji

1. **Otwórz przeglądarkę** i przejdź do `http://localhost:3000`
2. **Zaloguj się** do aplikacji
3. **Kliknij "🚀 AI Ultra Pro"** w menu nawigacyjnym
4. **Wybierz grę** (Lotto, Mini Lotto, Multi Multi, Eurojackpot, Kaskada)
5. **Wybierz tryb animacji**:
   - 🚀 Ekran startowy - animowana głowa AI
   - 🎰 Maszyna losująca 3D - kule wirują w 3D
   - 💻 Tryb Hackera - terminal z pseudokodem
   - 🔫 Laser AI - AI strzela laserem
   - ♟️ Szachy Lotto - plansza szachowa
6. **Kliknij "🚀 Generuj liczby AI"**
7. **Obserwuj animacje** podczas generowania
8. **Zobacz wyniki** z procentami pewności AI

## 🔍 Sprawdzenie Działania

### W przeglądarce:
- Przejdź do `http://localhost:3000/ai-ultra-pro`
- Sprawdź czy wszystkie tryby animacji działają
- Wygeneruj liczby dla różnych gier

### W konsoli backend:
- Sprawdź logi podczas generowania liczb
- Powinieneś zobaczyć komunikaty:
  ```
  [AI] Analizuję prawdopodobieństwo dla lotto...
  [AI] Analizuję odchylenia standardowe dla lotto...
  [AI] Stosuję prawo Benforda dla zakresu 1-49...
  [AI] Wykonuję symulacje Monte Carlo (1M iteracji)...
  [AI] Stosuję algorytm szachowy (10,000 partii)...
  [AI] Stosuję inteligentny chaos...
  [AI] Obliczam pewność AI...
  ```

## 🐛 Rozwiązywanie Problemów

### Problem: "Module not found" dla lottie-react
```bash
cd frontend
npm install lottie-react
```

### Problem: "Module not found" dla @react-three/fiber
```bash
cd frontend
npm install @react-three/fiber @react-three/drei three
```

### Problem: Backend nie odpowiada
```bash
# Sprawdź czy port 5000 jest wolny
lsof -i :5000

# Jeśli port jest zajęty, zatrzymaj proces
kill -9 <PID>
```

### Problem: Frontend nie łączy się z backendem
```bash
# Sprawdź czy backend działa
curl http://localhost:5000/api/ai-ultra-pro/health

# Sprawdź CORS w backend/index.js
```

### Problem: Animacje nie działają
```bash
# Sprawdź konsolę przeglądarki (F12)
# Upewnij się, że wszystkie zależności są zainstalowane
cd frontend
npm list lottie-react @react-three/fiber @react-three/drei three
```

## 📊 Monitorowanie Wydajności

### Czas generowania liczb:
- Lotto: ~5-10 sekund
- Mini Lotto: ~3-7 sekund
- Multi Multi: ~8-15 sekund

### Użycie pamięci:
- Backend: ~50-100MB
- Frontend: ~20-50MB

### CPU podczas generowania:
- Symulacje Monte Carlo: ~20-30%
- Algorytm szachowy: ~10-15%

## 🔧 Konfiguracja Zaawansowana

### Zmiana portów:
```bash
# Backend - edytuj backend/config.js
PORT=5001

# Frontend - edytuj package.json
"start": "PORT=3001 react-scripts start"
```

### Zmiana algorytmu:
Edytuj `backend/ai-ultra-pro-api.js`:
- Zmień wagi w `applyIntelligentChaos()`
- Dostosuj parametry w filtrach matematycznych
- Zmodyfikuj liczbę symulacji Monte Carlo

### Dodanie nowej gry:
1. Dodaj konfigurację w `getGameConfig()`
2. Dodaj popularne kombinacje w `popularCombinations`
3. Zaktualizuj frontend w `games` array

## 🎯 Funkcje Premium

AI Ultra Pro jest dostępny tylko dla użytkowników z aktywną subskrypcją Premium. Jeśli widzisz komunikat o zablokowanym dostępie:

1. Przejdź do sekcji "Płatności"
2. Wybierz plan Premium
3. Dokonaj płatności
4. Odśwież stronę

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi w konsoli przeglądarki (F12)
2. Sprawdź logi serwera w terminalu backend
3. Uruchom testy: `node test-ai-ultra-pro.js`
4. Sprawdź dokumentację w `AI_LOTTO_GENERATOR_ULTRA_PRO_README.md`

---

**🎉 Gratulacje! AI Lotto Generator Ultra Pro jest gotowy do użycia!**

Teraz możesz cieszyć się zaawansowanym algorytmem AI, który maksymalizuje Twoje szanse na wygraną w lotto! 🚀























