# 🌐 Konfiguracja DNS dla losuje.pl na OVH

## 📋 **Krok 1: Dostęp do panelu OVH**

1. **Wejdź na:** https://www.ovh.com/manager/
2. **Zaloguj się** swoimi danymi OVH
3. **Wybierz domenę** `losuje.pl` z listy

## 🎯 **Krok 2: Konfiguracja strefy DNS**

### a) Przejdź do strefy DNS:
1. Kliknij na domenę `losuje.pl`
2. Przejdź do zakładki **"Strefa DNS"**
3. Kliknij **"Edytuj strefę"**

### b) Dodaj rekordy A:
```
Typ: A
Nazwa: @ (lub zostaw puste)
Wartość: 51.77.220.61 (IP Twojego serwera OVH)
TTL: 3600
```

```
Typ: A
Nazwa: www
Wartość: 51.77.220.61 (IP Twojego serwera OVH)
TTL: 3600
```

### c) Dodaj rekord CNAME (opcjonalnie):
```
Typ: CNAME
Nazwa: api
Wartość: losuje.pl
TTL: 3600
```

## 🔧 **Krok 3: Konfiguracja subdomen (opcjonalnie)**

### a) Dla API:
```
Typ: A
Nazwa: api
Wartość: 51.77.220.61
TTL: 3600
```

### b) Dla panelu administracyjnego:
```
Typ: A
Nazwa: admin
Wartość: 51.77.220.61
TTL: 3600
```

## 📧 **Krok 4: Konfiguracja poczty (opcjonalnie)**

### a) Rekordy MX:
```
Typ: MX
Nazwa: @
Wartość: mx1.ovh.net
Priorytet: 1
TTL: 3600
```

```
Typ: MX
Nazwa: @
Wartość: mx2.ovh.net
Priorytet: 5
TTL: 3600
```

### b) Rekord TXT dla SPF:
```
Typ: TXT
Nazwa: @
Wartość: "v=spf1 include:mx.ovh.com ~all"
TTL: 3600
```

## 🔍 **Krok 5: Sprawdzenie propagacji**

### a) Sprawdź lokalnie:
```bash
nslookup losuje.pl
nslookup www.losuje.pl
```

### b) Sprawdź globalnie:
- Wejdź na: https://www.whatsmydns.net/
- Wpisz `losuje.pl`
- Sprawdź propagację w różnych lokalizacjach

### c) Sprawdź przez terminal:
```bash
dig losuje.pl
dig www.losuje.pl
```

## ⏱️ **Krok 6: Czas propagacji**

### Typowe czasy propagacji:
- **TTL 3600 (1 godzina):** 1-2 godziny
- **TTL 1800 (30 min):** 30-60 minut
- **TTL 300 (5 min):** 5-15 minut

### Przyspieszenie propagacji:
1. **Zmniejsz TTL** do 300 sekund
2. **Poczekaj** na propagację starego TTL
3. **Zmień IP** na nowe
4. **Przywróć TTL** do 3600

## 🚨 **Krok 7: Rozwiązywanie problemów**

### Problem: "Domena nie działa"
**Rozwiązanie:**
1. Sprawdź czy IP jest poprawne
2. Sprawdź czy serwer odpowiada: `ping 51.77.220.61`
3. Sprawdź czy Nginx działa na serwerze
4. Sprawdź logi: `tail -f /var/log/nginx/error.log`

### Problem: "SSL nie działa"
**Rozwiązanie:**
1. Sprawdź czy DNS jest skonfigurowany
2. Uruchom Certbot: `certbot --nginx -d losuje.pl`
3. Sprawdź certyfikat: `certbot certificates`

### Problem: "Wolna propagacja"
**Rozwiązanie:**
1. Zmniejsz TTL do 300 sekund
2. Poczekaj 1-2 godziny
3. Sprawdź propagację na whatsmydns.net

## 📊 **Krok 8: Monitorowanie DNS**

### a) Sprawdź status domeny:
```bash
whois losuje.pl
```

### b) Sprawdź rekordy DNS:
```bash
dig +short losuje.pl
dig +short www.losuje.pl
```

### c) Sprawdź MX rekordy:
```bash
dig +short MX losuje.pl
```

## 🔐 **Krok 9: Bezpieczeństwo DNS**

### a) Rekordy DNSSEC (jeśli obsługiwane):
1. Włącz DNSSEC w panelu OVH
2. Dodaj rekordy DS
3. Sprawdź status: `dig +dnssec losuje.pl`

### b) Rekordy CAA (opcjonalnie):
```
Typ: CAA
Nazwa: @
Wartość: 0 issue "letsencrypt.org"
TTL: 3600
```

## 🎉 **Gotowe!**

Po skonfigurowaniu DNS:

1. **Poczekaj** na propagację (1-2 godziny)
2. **Sprawdź** czy domena działa: `curl -I http://losuje.pl`
3. **Skonfiguruj SSL:** `certbot --nginx -d losuje.pl`
4. **Przetestuj** aplikację: https://losuje.pl

### Przydatne komendy:
```bash
# Sprawdź status domeny
curl -I https://losuje.pl

# Sprawdź SSL
openssl s_client -connect losuje.pl:443 -servername losuje.pl

# Sprawdź propagację
dig +trace losuje.pl
```

**Twoja domena losuje.pl jest teraz gotowa! 🚀**






