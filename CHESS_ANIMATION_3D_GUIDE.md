# Animacja "Szachy Lotto" 3D - AI Ultra Pro

## Opis funkcjonalności

Nowa animacja "Szachy Lotto" została całkowicie przeprojektowana z wykorzystaniem Three.js, tworząc futurystyczną planszę szachową 3D z animowanymi pionkami i efektami holograficznymi. Animacja łączy elegancję gry w szachy z nowoczesną technologią 3D.

## Funkcje animacji

### 1. Plansza szachowa 3D
- **Futurystyczny design** - Ciemne szkło z neonowymi liniami
- **64 pola** w tradycyjnym układzie szachowym
- **Animowane podświetlenie** - Pola pulsują podczas animacji
- **Delikatne obracanie** - Plansza obraca się pod lekkim kątem

### 2. Pionki szachowe 3D
- **6 różnych typów** - Pion, Skoczek, Goniec, Wieża, Hetman, Król
- **Metaliczno-neonowe materiały** - Z efektami świecenia
- **Interaktywne** - Reagują na hover z zmianą koloru
- **Animowane ruchy** - Płynne przesunięcia z efektami unoszenia

### 3. Efekty świetlne
- **Neonowe oświetlenie** - Turkus, fiolet i złoto
- **Pulsujące LED** - Pod aktywnymi pionkami
- **Bloom effect** - Delikatne rozmycie świateł
- **Atmosferyczna mgła** - Tworzy głębię sceny

### 4. Animacja kamery
- **Cinematic movement** - Delikatne poruszanie się wokół planszy
- **Auto-rotation** - Automatyczne obracanie z kontrolą użytkownika
- **Dynamiczne ujęcia** - Kamera podąża za akcją

### 5. Hologramy liczb
- **3D tekst** - Liczby wyświetlane jako hologramy
- **Animowane unoszenie** - Delikatne ruchy w powietrzu
- **Neonowe świecenie** - Cyjanowe światło wokół liczb
- **Sekwencyjne pojawianie** - Liczby ujawniają się jedna po drugiej

## Techniczne szczegóły

### Komponenty 3D
- `ChessBoard` - Plansza szachowa z 64 polami
- `ChessPiece` - Pionki z różnymi geometriami
- `NumberHologram` - Hologramy liczb
- `ChessScene` - Główna scena 3D

### Geometrie pionków
- **Pion** - Cylinder (0.3, 0.3, 0.8)
- **Skoczek** - Sfera (0.3, 8, 6)
- **Goniec** - Cylinder (0.2, 0.4, 0.8)
- **Wieża** - Box (0.4, 0.8, 0.4)
- **Hetman** - Sfera (0.35, 8, 6)
- **Król** - Cylinder (0.25, 0.25, 1)

### Materiały
- **Metalness**: 0.8
- **Roughness**: 0.2
- **Emissive**: Aktywne pionki świecą
- **Transparency**: Podświetlone pola

## Fazy animacji

### 1. Inicjalizacja (1 sekunda)
- Plansza pojawia się z efektem fade-in
- Kamera ustawia się w pozycji startowej
- Pionki są rozmieszczone na planszy

### 2. Ruchy pionków (6 sekund)
- Każdy pionek aktywuje się kolejno
- Pionek unosi się i świeci
- Wykonuje ruch do losowej pozycji
- Dezaktywuje się po ruchu

### 3. Ujawnianie liczb (4 sekundy)
- Hologramy liczb pojawiają się nad planszą
- Każda liczba ma animację pojawienia
- Liczby układają się w rząd

### 4. Zakończenie (2 sekundy)
- Wszystkie liczby są widoczne
- Kamera wykonuje finalne ujęcie
- Animacja kończy się

## Kolorystyka

### Główne kolory
- **Tło**: `#0a0a0a`, `#1a1a2e`, `#16213e`
- **Plansza**: `#f0d9b5` (białe), `#b58863` (czarne)
- **Pionki**: `#444444` (nieaktywne), `#00ff88` (aktywne)
- **Hologramy**: `#00ffff` (cyjan)

### Oświetlenie
- **Ambient**: 0.3 intensity
- **Point Light 1**: `#00ffff` (turkus)
- **Point Light 2**: `#ff00ff` (fiolet)
- **Point Light 3**: `#ffff00` (złoto)

## Animacje i efekty

### Ruchy pionków
- **Unoszenie**: `Math.sin(time * 3) * 0.2 + 0.5`
- **Obrót**: `rotation.y += 0.02`
- **Lerp movement**: Płynne przejścia między pozycjami

### Kamera
- **Pozycja X**: `Math.sin(time * 0.1) * 2`
- **Pozycja Z**: `Math.cos(time * 0.1) * 2`
- **Auto-rotate**: 0.5 speed

### Hologramy
- **Unoszenie**: `Math.sin(time * 2) * 0.1`
- **Obrót**: `Math.sin(time) * 0.1`
- **Intensywność światła**: 3

## Responsywność

### Breakpointy
- **Desktop**: > 768px - wysokość 500px
- **Tablet**: 768px - 480px - wysokość 350px
- **Mobile**: < 480px - wysokość 300px

### Dostosowania
- Mniejsze rozmiary czcionek na mobile
- Zredukowane padding w overlay
- Zachowanie proporcji 3D

## Wydajność

### Optymalizacje
- **useMemo** dla obliczeń planszy
- **useFrame** dla animacji
- **Cleanup** funkcje w useEffect
- **LOD** dla geometrii

### Pamięć
- Minimalne re-rendery
- Efektywne zarządzanie stanem
- Cleanup przy unmount

## Integracja z AI Ultra Pro

### Przekazywanie danych
```javascript
<ChessAnimation 
  onComplete={() => {}} 
  generatedNumbers={generatedNumbers} 
/>
```

### Czasowanie
- **Całkowity czas**: 13 sekund
- **Faza ruchów**: 6 sekund
- **Faza ujawniania**: 4 sekundy
- **Faza końcowa**: 2 sekundy

## Użycie

1. Wybierz "Szachy Lotto" z opcji animacji
2. Kliknij "Generuj liczby"
3. Obserwuj inicjalizację planszy 3D
4. Śledź ruchy pionków po planszy
5. Zobacz ujawnianie hologramów liczb
6. Animacja kończy się automatycznie

## Możliwe rozszerzenia

- **Dźwięki szachowe** - Kliknięcia pionków
- **Efekty cząsteczek** - Przy eksplozji pionków
- **Więcej typów pionków** - Dodatkowe figury
- **Interaktywne ruchy** - Kliknięcie pionka
- **Różne style planszy** - Tematyczne warianty
- **Efekty post-processing** - Bloom, DOF, SSAO
