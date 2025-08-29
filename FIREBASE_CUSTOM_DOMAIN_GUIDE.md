# 🌐 Przewodnik konfiguracji domeny niestandardowej losuje.pl w Firebase Hosting

## 🎯 **Cel:**
Zamiana domeny `losuje.web.app` na `losuje.pl` w Firebase Hosting

## 📋 **Wymagania:**
- ✅ Domena `losuje.pl` zarejestrowana w OVH
- ✅ Serwer OVH skonfigurowany
- ✅ Projekt Firebase `losujemy` aktywny
- ✅ Firebase CLI zainstalowany

## 🚀 **Krok 1: Konfiguracja DNS w OVH**

### a) Logowanie do panelu OVH
1. Przejdź do [Panelu OVH](https://www.ovh.com/manager/)
2. Zaloguj się na swoje konto
3. Wybierz domenę `losuje.pl`

### b) Konfiguracja rekordów DNS
W **Strefa DNS** dodaj następujące rekordy:

```
# Rekord A dla głównej domeny
Typ: A
Nazwa: @
Wartość: 151.101.1.195 (Firebase IP)
TTL: 3600

# Rekord A dla www
Typ: A  
Nazwa: www
Wartość: 151.101.1.195 (Firebase IP)
TTL: 3600

# Rekord CNAME dla Firebase
Typ: CNAME
Nazwa: @
Wartość: losujemy.web.app
TTL: 3600
```

## 🔧 **Krok 2: Konfiguracja Firebase Hosting**

### a) Dodanie domeny niestandardowej
```bash
# Zaloguj się do Firebase CLI
firebase login

# Przejdź do katalogu projektu
cd /path/to/your/lotek/project

# Dodaj domenę niestandardową
firebase hosting:sites:add losuje-pl

# Skonfiguruj domenę
firebase hosting:channel:deploy production --site losuje-pl
```

### b) Alternatywnie przez Firebase Console:
1. Przejdź do [Firebase Console](https://console.firebase.google.com)
2. Wybierz projekt `losujemy`
3. Przejdź do **Hosting**
4. Kliknij **Dodaj domenę niestandardową**
5. Wprowadź `losuje.pl`
6. Kliknij **Kontynuuj**

## 📝 **Krok 3: Aktualizacja konfiguracji Firebase**

### a) Aktualizacja firebase.json
```json
{
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

### b) Aktualizacja frontend/src/utils/firebase.js
```javascript
// Konfiguracja Firebase - dynamiczna domena
const getAuthDomain = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "losujemy.firebaseapp.com"; // Dla development
  }
  return hostname; // Dla produkcji (losuje.pl)
};
```

## 🔐 **Krok 4: Konfiguracja SSL**

### a) Firebase automatycznie skonfiguruje SSL
Firebase Hosting automatycznie:
- ✅ Generuje certyfikat SSL
- ✅ Konfiguruje HTTPS
- ✅ Odnawia certyfikat

### b) Sprawdzenie SSL
```bash
# Sprawdź certyfikat
openssl s_client -connect losuje.pl:443 -servername losuje.pl
```

## 🚀 **Krok 5: Deployment**

### a) Build aplikacji
```bash
cd frontend
npm run build
cd ..
```

### b) Deploy na Firebase
```bash
# Deploy hosting
firebase deploy --only hosting

# Lub deploy wszystkiego
firebase deploy
```

## 🔍 **Krok 6: Weryfikacja**

### a) Sprawdź DNS
```bash
# Sprawdź propagację DNS
nslookup losuje.pl
dig losuje.pl

# Sprawdź czy wskazuje na Firebase
curl -I https://losuje.pl
```

### b) Test aplikacji
1. Otwórz https://losuje.pl
2. Sprawdź czy aplikacja ładuje się poprawnie
3. Przetestuj logowanie Firebase Auth
4. Sprawdź czy API działa

## ⚠️ **Ważne uwagi:**

### a) Czas propagacji DNS
- DNS może propagować się do 48 godzin
- Zwykle trwa 15-30 minut
- Użyj [whatsmydns.net](https://whatsmydns.net) do sprawdzenia

### b) Firebase Auth
- Firebase Auth automatycznie obsługuje domenę niestandardową
- Nie wymaga dodatkowej konfiguracji
- Wszystkie popupy logowania będą działać

### c) CORS
- Firebase Hosting automatycznie obsługuje CORS
- Nie wymaga dodatkowej konfiguracji
- API będzie działać poprawnie

## 🐛 **Rozwiązywanie problemów:**

### a) DNS nie propaguje
```bash
# Sprawdź rekordy DNS
dig losuje.pl
nslookup losuje.pl

# Sprawdź czy wskazuje na Firebase IP
# Firebase IP: 151.101.1.195
```

### b) SSL nie działa
```bash
# Sprawdź certyfikat
openssl s_client -connect losuje.pl:443

# Poczekaj 24-48 godzin na automatyczną konfigurację SSL
```

### c) Aplikacja nie ładuje się
```bash
# Sprawdź logi Firebase
firebase hosting:log

# Sprawdź czy build się udał
ls -la frontend/build/
```

## 📊 **Monitoring:**

### a) Firebase Analytics
- Automatycznie śledzi ruch na domenie niestandardowej
- Nie wymaga dodatkowej konfiguracji

### b) Firebase Performance
- Monitoruje wydajność aplikacji
- Dostępne w Firebase Console

## 🎉 **Gotowe!**

Po wykonaniu wszystkich kroków:
- ✅ https://losuje.pl będzie działać
- ✅ SSL będzie skonfigurowany automatycznie
- ✅ Firebase Auth będzie działać
- ✅ API będzie dostępne
- ✅ PWA będzie działać

## 🔄 **Aktualizacje:**

Aby zaktualizować aplikację:
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 📞 **Wsparcie:**

Jeśli masz problemy:
1. Sprawdź [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
2. Sprawdź [Firebase Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)
3. Skontaktuj się z Firebase Support
