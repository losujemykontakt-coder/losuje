# 🌐 Konfiguracja DNS dla losuje.pl

## 📋 **Krok 1: Panel DNS**

### **Gdzie kupiłeś domenę?**
- **OVH:** https://www.ovh.com/manager/
- **Inne:** Panel Twojego dostawcy domeny

### **Znajdź sekcję:**
- **DNS Zone** lub **Zarządzanie DNS**
- **Rekordy DNS** lub **DNS Records**

## 🎯 **Krok 2: Dodaj rekordy DNS**

### **Po zakupie VPS otrzymasz IP serwera (np. 51.68.123.45)**

#### **Rekord A (główny):**
```
Typ: A
Nazwa: @ (lub pusta)
Wartość: 51.68.123.45 (twoj-ip-serwera)
TTL: 3600 (lub domyślny)
```

#### **Rekord CNAME (www):**
```
Typ: CNAME
Nazwa: www
Wartość: losuje.pl
TTL: 3600 (lub domyślny)
```

## 📝 **Przykład konfiguracji:**

| Typ | Nazwa | Wartość | TTL |
|-----|-------|---------|-----|
| A | @ | 51.68.123.45 | 3600 |
| CNAME | www | losuje.pl | 3600 |

## ⏱️ **Propagacja DNS:**

### **Czas propagacji:**
- **OVH:** 5-15 minut
- **Inne:** 15-60 minut

### **Sprawdź propagację:**
```bash
# W terminalu
nslookup losuje.pl
nslookup www.losuje.pl

# Lub online: https://www.whatsmydns.net/
```

## ✅ **Test konfiguracji:**

### **Po propagacji DNS:**
```bash
# Sprawdź czy domena wskazuje na serwer
ping losuje.pl
ping www.losuje.pl
```

### **Powinno zwrócić:**
```
Pinging losuje.pl [51.68.123.45] with 32 bytes of data:
Reply from 51.68.123.45: bytes=32 time=15ms TTL=54
```

## 🔧 **Jeśli masz problemy:**

### **Sprawdź:**
1. **Czy IP jest poprawne**
2. **Czy rekordy są zapisane**
3. **Czy minęło 15-60 minut**

### **Kontakt z supportem:**
- **OVH:** Chat online w panelu
- **Inne:** Email do supportu

## 🎯 **Gotowe!**

Po konfiguracji DNS:
- `losuje.pl` → Twoj serwer
- `www.losuje.pl` → Twoj serwer

**Następny krok:** Deployment aplikacji na serwer



