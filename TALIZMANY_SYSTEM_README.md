# System Talizmanów - Dokumentacja

## Przegląd

System talizmanów to funkcjonalność gamifikacji, która motywuje użytkowników do regularnego logowania się do aplikacji poprzez przyznawanie żetonów szczęścia i możliwość wymiany ich na talizmany z różnymi efektami.

## Funkcjonalności

### 1. System Logowania i Żetonów
- Każde zalogowanie = 1 żeton szczęścia
- Seria logowań jest śledzona (consecutive days)
- Żetony kumulują się z czasem

### 2. Talizmany do Zdobycia

| Talizman | Wymagane żetony | Efekt |
|----------|----------------|-------|
| 🍀 4-listna koniczyna | 8 | Preferuje liczby parzyste |
| 🐎 Podkowa | 12 | Preferuje liczby 1-20 |
| ⭐ Gwiazda | 16 | Preferuje liczby pierwsze |
| 🐉 Smok | 20 | Preferuje liczby 7 i wielokrotności 7 |
| ☀️ Słońce | 24 | Preferuje liczby 21-40 |
| 🌙 Księżyc | 28 | Preferuje liczby nieparzyste |
| 💎 Diament | 32 | Preferuje liczby >50 |
| 🔥 Feniks | 36 | Bonus do powtarzalnych liczb |
| 👑 Korona | 40 | Złote liczby dnia (wielokrotności 7) |
| ⚡ Ostateczny talizman | 50 | Najwyższe liczby |

### 3. Aktywowanie Talizmanów
- Użytkownik może aktywować tylko jeden talizman na raz
- Aktywny talizman wpływa na generowanie liczb w generatorze
- Talizman wyświetla się jako ikona w prawym górnym rogu z animacją iskier

### 4. Efekty Wizualne
- Animowane iskry wokół aktywnego talizmanu
- Podświetlanie preferowanych liczb w generatorze
- Powiadomienia o zdobyciu nowych talizmanów

## Struktura Bazy Danych

### Tabela `user_talismans`
```sql
CREATE TABLE user_talismans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  talisman_id INTEGER NOT NULL,
  owned BOOLEAN DEFAULT 0,
  active BOOLEAN DEFAULT 0,
  obtained_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Tabela `login_streaks`
```sql
CREATE TABLE login_streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  current_streak INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  last_login_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Tabela `talisman_bonuses`
```sql
CREATE TABLE talisman_bonuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  talisman_id INTEGER NOT NULL,
  bonus_type TEXT NOT NULL,
  bonus_value TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## API Endpoints

### GET `/api/talismans/:userId`
Pobiera informacje o talizmanach użytkownika.

**Response:**
```json
{
  "success": true,
  "streak": {
    "current_streak": 5,
    "total_tokens": 15,
    "last_login_date": "2024-01-15"
  },
  "eligibility": {
    "currentStreak": 5,
    "totalTokens": 15,
    "availableTalismans": [8, 12],
    "nextTalisman": 16
  },
  "talismans": [
    {
      "id": 1,
      "user_id": 123,
      "talisman_id": 1,
      "owned": true,
      "active": false,
      "obtained_date": "2024-01-10T10:30:00Z"
    }
  ],
  "activeTalisman": {
    "id": 2,
    "user_id": 123,
    "talisman_id": 2,
    "owned": true,
    "active": true,
    "obtained_date": "2024-01-12T14:20:00Z"
  },
  "bonuses": []
}
```

### POST `/api/talismans/grant`
Przyznaje talizman użytkownikowi.

**Request:**
```json
{
  "userId": 123,
  "talismanId": 1
}
```

### POST `/api/talismans/toggle`
Aktywuje/deaktywuje talizman.

**Request:**
```json
{
  "userId": 123,
  "talismanId": 1,
  "active": true
}
```

### POST `/api/talismans/bonus`
Dodaje bonus do talizmanu.

**Request:**
```json
{
  "userId": 123,
  "talismanId": 1,
  "bonusType": "extra_token",
  "bonusValue": "1"
}
```

## Komponenty Frontend

### Talizmany.js
Główny komponent wyświetlający system talizmanów:
- Siatka talizmanów z statusami
- Licznik żetonów i postępu
- Modal szczegółów talizmanu
- Powiadomienia o zdobyciu

### ActiveTalismanDisplay.js
Komponent wyświetlający aktywny talizman:
- Ikona talizmanu w prawym górnym rogu
- Animowane iskry
- Tooltip z nazwą

## Logika Generowania Liczb

Generator liczb został zmodyfikowany aby uwzględniać efekty talizmanów:

```javascript
const generateNumberWithTalisman = (maxNum) => {
  if (!currentTalisman) {
    return Math.floor(Math.random() * maxNum) + 1;
  }
  
  let preferredNumbers = [];
  
  switch (currentTalisman.effect) {
    case 'even':
      // Preferuj liczby parzyste
      for (let i = 2; i <= maxNum; i += 2) {
        preferredNumbers.push(i);
      }
      break;
    // ... inne efekty
  }
  
  // 70% szans na wybranie preferowanej liczby
  if (Math.random() < 0.7 && preferredNumbers.length > 0) {
    return preferredNumbers[Math.floor(Math.random() * preferredNumbers.length)];
  } else {
    return Math.floor(Math.random() * maxNum) + 1;
  }
};
```

## Integracja z Logowaniem

System automatycznie rejestruje logowania i przyznaje żetony:

```javascript
// W endpoint /login
const { registerLogin } = require('./db');
let loginStreakInfo = null;
try {
  loginStreakInfo = await registerLogin(user.id);
} catch (error) {
  console.error('Błąd rejestracji logowania dla talizmanów:', error);
}
```

## Funkcje Bazy Danych

### registerLogin(userId)
Rejestruje logowanie użytkownika i przyznaje żetony.

### getLoginStreak(userId)
Pobiera informacje o serii logowań użytkownika.

### checkTalismanEligibility(userId)
Sprawdza jakie talizmany może otrzymać użytkownik.

### grantTalisman(userId, talismanId)
Przyznaje talizman użytkownikowi.

### toggleTalismanActive(userId, talismanId, active)
Aktywuje/deaktywuje talizman.

### getActiveTalisman(userId)
Pobiera aktywny talizman użytkownika.

## Konfiguracja

System talizmanów jest w pełni skonfigurowany i gotowy do użycia. Wszystkie tabele są automatycznie tworzone przy uruchomieniu aplikacji.

## Testowanie

Aby przetestować system:

1. Zaloguj się do aplikacji
2. Przejdź do zakładki "Talizmany"
3. Sprawdź czy otrzymujesz żetony za logowanie
4. Spróbuj wymienić żetony na talizman
5. Aktywuj talizman i sprawdź czy wpływa na generowanie liczb

## Przyszłe Rozszerzenia

- System bonusów dziennych
- Talizmany sezonowe
- Efekty specjalne dla kombinacji talizmanów
- Statystyki użycia talizmanów
- System rankingowy użytkowników







