# 🚀 Przewodnik wdrożenia PWA dla Google Play Store

## 📋 Przegląd

Stworzyliśmy specjalną wersję PWA dla Google Play Store z następującymi cechami:

### ✅ **Funkcje PWA:**
- **Bez landing page** - bezpośrednie przejście do logowania/rejestracji
- **Google Play Billing** - płatności zgodne z Google Play Store
- **Osobna domena** - `losuje-generator.pl` (nie wpływa na `losuje.pl`)
- **PWA gotowe** - manifest.json, service worker, asset links
- **Responsive design** - działa na wszystkich urządzeniach

### 🔒 **Bezpieczeństwo:**
- **Osobne pliki** - nie narusza `losuje.pl`
- **Osobne płatności** - Google Play Billing zamiast PayPal
- **Osobna konfiguracja** - niezależne ustawienia

## 🛠️ Struktura plików

```
frontend/
├── src/
│   ├── AppPWA.js              # Główna aplikacja PWA (bez landing page)
│   ├── indexPWA.js            # Entry point dla PWA
│   ├── utils/
│   │   └── googlePlayBilling.js  # System płatności Google Play
│   └── components/
│       └── GooglePlayPayments.js  # Komponent płatności
├── package-pwa.json           # Konfiguracja dla PWA
├── build-pwa.sh              # Skrypt budowania PWA
└── public/
    ├── manifest.json          # PWA manifest
    ├── sw.js                  # Service Worker
    └── .well-known/
        └── assetlinks.json    # TWA asset links
```

## 🚀 Budowanie PWA

### **Krok 1: Budowanie lokalne**
```bash
cd frontend
chmod +x build-pwa.sh
./build-pwa.sh
```

### **Krok 2: Wdrożenie na serwer**
```bash
# Skopiuj zbudowane pliki
cp -r build/* /var/www/losuje-generator.pl/dist/

# Ustaw uprawnienia
sudo chown -R www-data:www-data /var/www/losuje-generator.pl/dist/

# Przeładuj Nginx
sudo systemctl reload nginx
```

## 📱 Google Play Store - Krok po kroku

### **1. Przygotowanie TWA (Trusted Web Activity)**

```bash
# Instalacja Bubblewrap
npm install -g @bubblewrap/cli

# Inicjalizacja TWA
cd frontend
bubblewrap init --manifest https://losuje-generator.pl/manifest.json
```

### **2. Konfiguracja Android**

Edytuj `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest package="com.losuje.generator">
  <application
    android:label="Magiczny Zestaw Dnia"
    android:icon="@mipmap/ic_launcher">
    <!-- ... -->
  </application>
</manifest>
```

### **3. Budowanie APK/AAB**

```bash
# Budowanie APK
bubblewrap build

# Budowanie AAB (zalecane dla Google Play)
bubblewrap build --target apk
```

### **4. Google Play Console**

#### **A. Utworzenie aplikacji**
1. Przejdź do [Google Play Console](https://play.google.com/console)
2. Kliknij "Utwórz aplikację"
3. Nazwa: "Magiczny Zestaw Dnia"
4. Język: Polski
5. Typ: Gra
6. Płatność: Darmowa

#### **B. Wypełnienie informacji**
- **Opis:** "Generator liczb Lotto z magicznymi animacjami"
- **Kategoria:** Gry > Kasynowe
- **Ikony:** 512x512 px
- **Screenshoty:** 1080x1920 px (minimum 2)

#### **C. Produkty płatne**
Dodaj produkty zgodne z `googlePlayBilling.js`:
- `premium_monthly` - 9.99 PLN
- `premium_yearly` - 59.99 PLN  
- `premium_lifetime` - 199.99 PLN
- `coins_100` - 4.99 PLN
- `coins_500` - 19.99 PLN

## 💳 System płatności

### **Google Play Billing API**
- ✅ Zgodny z dokumentacją Google
- ✅ Subskrypcje automatyczne
- ✅ Zakupy jednorazowe
- ✅ Przywracanie zakupów
- ✅ Symulacja w PWA

### **Produkty:**
```javascript
// Subskrypcje
premium_monthly: "9.99 PLN"    // Miesięczny
premium_yearly: "59.99 PLN"    // Roczny (oszczędność 40%)
premium_lifetime: "199.99 PLN" // Dożywotni

// Monety
coins_100: "4.99 PLN"          // 100 monet
coins_500: "19.99 PLN"         // 500 monet
```

## 🔧 Konfiguracja serwera

### **Nginx dla PWA:**
```nginx
server {
    server_name losuje-generator.pl www.losuje-generator.pl;
    root /var/www/losuje-generator.pl/dist;
    index index.html;
    
    # PWA headers
    location /manifest.json {
        add_header Cache-Control "no-cache";
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
    
    # TWA asset links
    location /.well-known/assetlinks.json {
        add_header Content-Type application/json;
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🎯 Różnice między wersjami

| Funkcja | losuje.pl | losuje-generator.pl |
|---------|-----------|---------------------|
| Landing page | ✅ Tak | ❌ Nie |
| Płatności | PayPal/Przelewy24 | Google Play Billing |
| Domena | losuje.pl | losuje-generator.pl |
| Google Play | ❌ Nie | ✅ Tak |
| PWA | ❌ Nie | ✅ Tak |

## 🚀 Wdrożenie

### **Automatyczne wdrożenie:**
```bash
# Na serwerze
cd /var/www/losuje.pl/lotek
git pull origin main
cd frontend
./build-pwa.sh
cp -r build/* /var/www/losuje-generator.pl/dist/
sudo systemctl reload nginx
```

### **Sprawdzenie:**
1. Otwórz `https://losuje-generator.pl`
2. Sprawdź czy nie ma landing page
3. Sprawdź czy płatności to Google Play
4. Sprawdź czy PWA działa na telefonie

## 📋 Checklista przed publikacją

### **Techniczne:**
- [ ] PWA działa offline
- [ ] Manifest.json poprawny
- [ ] Service Worker działa
- [ ] Asset links skonfigurowane
- [ ] HTTPS aktywny
- [ ] Responsive design

### **Google Play:**
- [ ] APK/AAB wygenerowany
- [ ] Ikony 512x512 px
- [ ] Screenshoty 1080x1920 px
- [ ] Opis aplikacji
- [ ] Polityka prywatności
- [ ] Produkty płatne skonfigurowane

### **Prawne:**
- [ ] Konto dewelopera ($25)
- [ ] Polityka prywatności
- [ ] Regulamin
- [ ] Zgody użytkownika

## 🎉 Gotowe!

Po wykonaniu wszystkich kroków:
1. **PWA działa** na `losuje-generator.pl`
2. **Google Play Store** gotowe do publikacji
3. **losuje.pl** pozostaje nienaruszone
4. **Płatności** zgodne z Google Play

**Aplikacja gotowa do publikacji!** 🚀
