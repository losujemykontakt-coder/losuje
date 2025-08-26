# 🚀 SZYBKI DEPLOYMENT - WRZUCAMY APLIKACJĘ!

## 📋 **KROK 1: Podaj IP serwera**

### **Z emaila OVH skopiuj IP i edytuj pliki:**

#### **Edytuj `deploy-losuje.sh`:**
```bash
# Linia 6 - zmień na swoje IP
SERVER_IP="51.68.123.45"  # ZASTĄP SWOIM IP Z EMAILA OVH
```

#### **Edytuj `update-app.sh`:**
```bash
# Linia 6 - zmień na swoje IP
SERVER_IP="51.68.123.45"  # ZASTĄP SWOIM IP Z EMAILA OVH
```

## 🎯 **KROK 2: Uruchom deployment**

### **Opcja A: Szybki deployment (30 minut)**
```bash
# 1. Nadaj uprawnienia
chmod +x deploy-losuje.sh

# 2. Uruchom deployment
./deploy-losuje.sh
```

### **Opcja B: Pełny deployment (45 minut)**
```bash
# 1. Skopiuj deploy.sh na serwer
scp deploy.sh root@51.68.123.45:/root/

# 2. Połącz się z serwerem
ssh root@51.68.123.45

# 3. Uruchom deployment
bash deploy.sh
```

## 🔧 **KROK 3: Konfiguracja DNS**

### **W panelu DNS dodaj:**
```
A    @    51.68.123.45    3600
CNAME    www    losuje.pl    3600
```

## ✅ **KROK 4: Sprawdź działanie**

### **Po 15-30 minutach:**
- **Aplikacja:** https://losuje.pl
- **Backend:** https://losuje.pl/api/test

## 🚨 **JEŚLI COŚ NIE DZIAŁA:**

### **Sprawdź logi:**
```bash
ssh root@51.68.123.45 'pm2 logs lotek-backend'
```

### **Sprawdź status:**
```bash
ssh root@51.68.123.45 'pm2 status'
```

## 📞 **POMOC:**

### **Jeśli masz problemy:**
1. **Sprawdź czy IP jest poprawne**
2. **Sprawdź czy DNS jest skonfigurowane**
3. **Sprawdź logi aplikacji**

### **Kontakt:**
- **OVH Support:** Chat w panelu
- **Logi:** SSH na serwer

## 🎯 **GOTOWE!**

Po deploymentu:
- ✅ **Aplikacja działa:** https://losuje.pl
- ✅ **SSL/HTTPS:** Automatycznie skonfigurowane
- ✅ **Monitoring:** PM2 + Nginx
- ✅ **Backup:** Codzienny automatyczny

**POWODZENIA! 🚀**






















