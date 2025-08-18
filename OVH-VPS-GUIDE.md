# 🚀 Przewodnik zakupu VPS w OVH - Krok po kroku

## 📋 **Krok 1: Wejście na stronę OVH**

1. **Wejdź na:** https://ovhcloud.com/pl/vps
2. **Kliknij:** "Bare Metal & VPS" → "Serwery VPS"

## 🎯 **Krok 2: Wybór planu VPS**

### **Dostępne plany:**

| Plan | vCPU | RAM | SSD | Cena | Rekomendacja |
|------|------|-----|-----|------|--------------|
| **VPS Starter** | 1 | 2GB | 20GB | ~40 zł | ❌ Za słaby |
| **VPS SSD 1** | 1 | 2GB | 40GB | ~50 zł | ❌ Za słaby |
| **VPS SSD 2** | 2 | 4GB | 80GB | ~80 zł | ⭐ **NAJLEPSZY** |
| **VPS SSD 3** | 4 | 8GB | 160GB | ~180 zł | 🔥 Dla wzrostu |
| **VPS SSD 4** | 8 | 16GB | 320GB | ~360 zł | 💰 Dla dużych firm |

### **🎯 Wybierz VPS SSD 2** - Idealny na początek!

**Dlaczego VPS SSD 2?**
- ✅ **2 vCPU** - Wystarczy dla React + Node.js
- ✅ **4GB RAM** - Obsłuży 20k+ użytkowników
- ✅ **80GB SSD** - Dużo miejsca na aplikację
- ✅ **Cena ~80 zł** - Optymalny stosunek cena/wydajność

## 🌍 **Krok 3: Wybór lokalizacji**

### **Wybierz:**
- **Lokalizacja:** Polska / Warszawa
- **Powód:** Najszybsze połączenie dla polskich użytkowników

## 💻 **Krok 4: Wybór systemu operacyjnego**

### **Wybierz:**
- **System:** Ubuntu 22.04 LTS
- **Powód:** Stabilny, popularny, łatwy w konfiguracji

## 🔧 **Krok 5: Dodatkowe opcje**

### **Opcjonalne (możesz pominąć):**
- ❌ **Backup** - Możesz dodać później
- ❌ **Monitoring** - PM2 wystarczy
- ❌ **Firewall** - UFW jest wbudowany

### **Wymagane:**
- ✅ **Domena** - Kup w OVH lub gdzie indziej

## 💳 **Krok 6: Zakup**

1. **Kliknij:** "Zamów teraz"
2. **Wypełnij dane:**
   - Imię i nazwisko
   - Email
   - Telefon
   - Adres
3. **Wybierz płatność:**
   - Karta kredytowa
   - Przelew bankowy
   - PayPal

## 📧 **Krok 7: Po zakupie**

### **Otrzymasz email z:**
- **IP serwera** (np. 51.68.123.45)
- **Hasło root** (zapisz bezpiecznie!)
- **Dane do panelu OVH**

### **Przykład emaila:**
```
Twój VPS jest gotowy!

IP: 51.68.123.45
Login: root
Hasło: Abc123!@#
Panel: https://www.ovh.com/manager/
```

## 🔐 **Krok 8: Pierwsze połączenie**

### **Połącz się przez SSH:**
```bash
ssh root@51.68.123.45
```

### **Zmień hasło root:**
```bash
passwd
```

## 🚀 **Krok 9: Deployment aplikacji**

### **Skopiuj pliki na serwer:**
```bash
# Z Twojego komputera
scp deploy.sh root@51.68.123.45:/root/
```

### **Uruchom deployment:**
```bash
# Na serwerze
ssh root@51.68.123.45
bash deploy.sh
```

## 💰 **Koszty miesięczne**

```
VPS SSD 2: ~80 zł
Domena: ~7 zł
─────────────────
RAZEM: ~87 zł/miesiąc
```

## 📊 **Wydajność VPS SSD 2**

### **Może obsłużyć:**
- ✅ **20,000+ użytkowników** dziennie
- ✅ **1,000+ równoczesnych** połączeń
- ✅ **React + Node.js + Firebase** bez problemów
- ✅ **Web scraping** lotto.pl
- ✅ **Płatności** PayPal/Przelewy24

### **Kiedy upgrade na VPS SSD 3:**
- Gdy masz **50,000+ użytkowników**
- Gdy **RAM przekracza 3.5GB**
- Gdy **CPU przekracza 80%**

## 🎯 **Gotowe!**

Po zakupie VPS SSD 2:
1. **Skopiuj deploy.sh** na serwer
2. **Uruchom deployment**
3. **Kup domenę** i skonfiguruj DNS
4. **Uruchom upload-files.sh**

Twoja aplikacja będzie działać pod adresem: **https://twoja-domena.pl**

**Powodzenia! 🚀**

