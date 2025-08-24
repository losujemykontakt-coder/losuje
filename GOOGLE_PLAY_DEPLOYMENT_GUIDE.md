# Przewodnik wdrożenia na Google Play Store

## 1. Przygotowanie PWA

Twoja aplikacja jest już skonfigurowana jako PWA z:
- ✅ Manifest.json
- ✅ Service Worker
- ✅ HTTPS (wymagane)
- ✅ Responsive design

## 2. Instalacja Bubblewrap (TWA)

```bash
# Instalacja Node.js (jeśli nie masz)
# Pobierz z: https://nodejs.org/

# Instalacja Bubblewrap
npm install -g @bubblewrap/cli

# Sprawdź czy masz zainstalowane:
# - Java JDK 11+
# - Android Studio
# - Android SDK
```

## 3. Konfiguracja Android Studio

1. Otwórz Android Studio
2. Zainstaluj Android SDK (API level 29+)
3. Skonfiguruj zmienne środowiskowe:
   ```bash
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

## 4. Inicjalizacja TWA

```bash
cd frontend
bubblewrap init --manifest https://losuje-generator.pl/manifest.json
```

## 5. Konfiguracja aplikacji

Edytuj `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest package="com.lotek.generator">
  <application
    android:label="Magiczny Zestaw Dnia"
    android:icon="@mipmap/ic_launcher">
    <!-- ... -->
  </application>
</manifest>
```

## 6. Budowanie APK/AAB

```bash
# Budowanie APK
bubblewrap build

# Lub budowanie AAB (zalecane dla Google Play)
bubblewrap build --target apk
```

## 7. Google Play Console

### A. Utworzenie konta
1. Przejdź do [Google Play Console](https://play.google.com/console)
2. Zapłać $25 (jednorazowo)
3. Wypełnij dane dewelopera

### B. Utworzenie aplikacji
1. Kliknij "Utwórz aplikację"
2. Nazwa: "Magiczny Zestaw Dnia"
3. Język domyślny: Polski
4. Aplikacja czy gra: Gra
5. Darmowa czy płatna: Darmowa

### C. Wypełnienie informacji
1. **Opis aplikacji:**
   ```
   Magiczny Zestaw Dnia - Generator Liczb Lotto
   
   Losuj szczęśliwe liczby Lotto z naszym magicznym generatorem! 
   Darmowy generator liczb Lotto z animacjami i efektami wizualnymi.
   
   Funkcje:
   • Generator liczb Lotto
   • Magiczny zestaw dnia
   • Animowane losowanie
   • Historia wyników
   • Statystyki
   • Talizmany
   
   Pobierz teraz i spróbuj szczęścia!
   ```

2. **Krótki opis:** "Generator liczb Lotto z magicznymi animacjami"

3. **Kategoria:** Gry > Kasynowe

4. **Ikony:**
   - Wysokiej rozdzielczości: 512x512 px
   - Promocyjna grafika: 1024x500 px

5. **Screenshoty:**
   - Telefon: 1080x1920 px (minimum 2)
   - Tablet: 1920x1080 px (opcjonalnie)

### D. Zawartość aplikacji
1. **Wersja aplikacji:**
   - Prześlij plik AAB
   - Wersja: 1.0.0
   - Opis zmian: "Pierwsza wersja aplikacji"

2. **Zawartość ocen:**
   - Wiek: 3+
   - Kategorie: Brak

### E. Cennik i dystrybucja
1. **Cennik:** Darmowa
2. **Kraje:** Wszystkie kraje
3. **Urządzenia:** Telefony i tablety

## 8. Wymagania prawne

### A. Polityka prywatności
Utwórz stronę z polityką prywatności na: `https://lotek-generator.pl/privacy`

### B. Zgody
- ✅ Zgoda na przetwarzanie danych
- ✅ Informacja o plikach cookie
- ✅ Zgoda na powiadomienia

## 9. Publikacja

1. **Przejrzyj aplikację** - sprawdź wszystkie sekcje
2. **Prześlij do recenzji** - Google przejrzy aplikację (1-7 dni)
3. **Publikacja** - po zatwierdzeniu aplikacja pojawi się w sklepie

## 10. Po publikacji

### A. Monitorowanie
- Recenzje użytkowników
- Statystyki pobrań
- Raporty awarii

### B. Aktualizacje
- Regularne aktualizacje PWA
- Nowe wersje TWA
- Odpowiadanie na recenzje

## 11. Rozwiązywanie problemów

### Błędy recenzji Google Play:
- **Zawartość:** Upewnij się, że aplikacja nie promuje hazardu
- **Techniczne:** Sprawdź czy PWA działa offline
- **Prawne:** Dodaj politykę prywatności

### Problemy z TWA:
```bash
# Sprawdź logi
bubblewrap doctor

# Aktualizuj Bubblewrap
npm update -g @bubblewrap/cli

# Wyczyść cache
bubblewrap clean
```

## 12. Optymalizacja

### A. Performance
- Kompresja obrazów
- Lazy loading
- Service worker cache

### B. SEO
- Meta tagi
- Structured data
- Sitemap

### C. UX
- Szybkie ładowanie
- Intuicyjny interfejs
- Responsive design

## 13. Linki przydatne

- [Google Play Console](https://play.google.com/console)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [TWA Documentation](https://developers.google.com/web/android/trusted-web-activity)
