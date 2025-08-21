# 🚀 Deployment na OVH z domeną losuje.pl

## 📋 **Szybki start**

Aby wdrożyć aplikację Lotek na serwer OVH z domeną `losuje.pl`, wykonaj następujące kroki:

### **1. Zakup VPS w OVH**
- Wejdź na: https://ovhcloud.com/pl/vps
- Wybierz **VPS SSD 2** (2 vCPU, 4GB RAM, 80GB SSD)
- System: Ubuntu 22.04 LTS
- Lokalizacja: Polska / Warszawa

### **2. Deployment na serwer**
```bash
# Połącz się z serwerem
ssh root@51.77.220.61

# Skopiuj skrypt deploymentu
scp deploy-ovh-git.sh root@51.77.220.61:/root/

# Uruchom deployment
chmod +x deploy-ovh-git.sh
./deploy-ovh-git.sh
```

### **3. Konfiguracja DNS**
1. Przejdź do panelu OVH: https://www.ovh.com/manager/
2. Wybierz domenę `losuje.pl`
3. Dodaj rekordy A wskazujące na IP serwera
4. Poczekaj na propagację (1-2 godziny)

### **4. Konfiguracja SSL**
```bash
certbot --nginx -d losuje.pl -d www.losuje.pl --non-interactive --agree-tos --email admin@losuje.pl
```

### **5. Sprawdzenie statusu**
```bash
./check-deployment.sh
```

## 📁 **Pliki deploymentu**

| Plik | Opis |
|------|------|
| `deploy-ovh-git.sh` | Kompletny skrypt deploymentu |
| `quick-deploy-ovh.sh` | Szybki deployment dla testów |
| `check-deployment.sh` | Sprawdzanie statusu systemu |
| `OVH-DEPLOYMENT-GUIDE.md` | Szczegółowy przewodnik |
| `DNS-CONFIG-GUIDE.md` | Konfiguracja DNS |
| `.github/workflows/deploy.yml` | GitHub Actions |

## 🎯 **Co otrzymujesz**

- ✅ **Aplikacja działająca** na https://losuje.pl
- ✅ **Automatyczne deploymenty** przez Git
- ✅ **SSL/HTTPS** automatycznie skonfigurowany
- ✅ **Monitoring** i zarządzanie aplikacją
- ✅ **Backup** system z automatycznym czyszczeniem
- ✅ **Firewall** i bezpieczeństwo
- ✅ **Rate limiting** dla API
- ✅ **Gzip compression** dla lepszej wydajności

## 🛠️ **Zarządzanie aplikacją**

### **Aktualizacja kodu:**
```bash
# Ręczna aktualizacja
/var/www/losuje.pl/update.sh

# Lub przez Git
cd /var/www/losuje.pl/lotek
git pull origin main
cd frontend && npm ci && npm run build
cd ../backend && npm ci --production
pm2 restart lotek-backend
```

### **Monitoring:**
```bash
# Status aplikacji
pm2 status

# Monitor w czasie rzeczywistym
pm2 monit

# Logi aplikacji
pm2 logs lotek-backend

# Sprawdzenie statusu systemu
./check-deployment.sh
```

## 💰 **Koszty**

- **VPS SSD 2:** ~80 zł/miesiąc
- **Domena losuje.pl:** ~7 zł/miesiąc
- **Razem:** ~87 zł/miesiąc

### **Wydajność VPS SSD 2:**
- ✅ **20,000+ użytkowników** dziennie
- ✅ **1,000+ równoczesnych** połączeń
- ✅ **React + Node.js + Firebase**
- ✅ **Web scraping** lotto.pl
- ✅ **Płatności** PayPal/Przelewy24

## 🚨 **Rozwiązywanie problemów**

### **Aplikacja nie działa:**
```bash
pm2 status
pm2 logs lotek-backend
pm2 restart lotek-backend
```

### **Nginx nie działa:**
```bash
systemctl status nginx
nginx -t
systemctl restart nginx
```

### **SSL nie działa:**
```bash
certbot certificates
certbot renew --dry-run
```

### **DNS nie działa:**
```bash
nslookup losuje.pl
dig losuje.pl
```

## 📚 **Szczegółowe przewodniki**

- **[OVH-DEPLOYMENT-GUIDE.md](OVH-DEPLOYMENT-GUIDE.md)** - Kompletny przewodnik deploymentu
- **[DNS-CONFIG-GUIDE.md](DNS-CONFIG-GUIDE.md)** - Konfiguracja DNS
- **[DEPLOYMENT-OVH-GITHUB.md](DEPLOYMENT-OVH-GITHUB.md)** - GitHub Actions
- **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** - Podsumowanie wszystkich plików

## 🎉 **Gotowe!**

Po wdrożeniu Twoja aplikacja będzie dostępna na:
- **URL:** https://losuje.pl
- **Serwer:** OVH VPS
- **Deployment:** Automatyczny przez Git
- **SSL:** Automatyczny przez Certbot
- **Monitoring:** PM2

### **Przydatne linki:**
- **Aplikacja:** https://losuje.pl
- **Panel OVH:** https://www.ovh.com/manager/
- **GitHub:** https://github.com/losujemykontakt-coder/losuje

**Powodzenia! 🚀**




