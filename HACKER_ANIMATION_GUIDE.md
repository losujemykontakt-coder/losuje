# Animacja "Tryb Hakera" - AI Ultra Pro

## Opis funkcjonalności

Nowa animacja "Tryb Hakera" została dodana do komponentu AI Ultra Pro jako jedna z opcji animacji podczas generowania liczb lotto. Animacja tworzy immersyjne doświadczenie inspirowane filmami o hakerach z efektem Matrix code rain i terminalem komputerowym.

## Funkcje animacji

### 1. Pełnoekranowe tło Matrix
- Ciemno-zielone tło z gradientem
- Canvas-based animacja spadających znaków Matrix
- Znaki japońskie, cyfry i symbole w kolorze #00ff00
- Efekt opadania z różnymi prędkościami

### 2. Terminal komputerowy
- Futurystyczny design z neonowymi efektami
- LED wskaźniki w rogach (czerwony, żółty, zielony)
- Animowane przyciski kontrolne
- Skaningowa linia w nagłówku

### 3. Komendy terminala
Animacja wyświetla sekwencję komend:
1. `INITIALIZING_QUANTUM_DECRYPTION_PROTOCOL...`
2. `ACCESSING_NEURAL_NETWORK_CORE...`
3. `SCANNING_PROBABILITY_MATRIX...`
4. `ANALYZING_QUANTUM_SEED_PATTERNS...`
5. `DECRYPTING_LUCKY_NUMBER_SEQUENCE...`
6. `CALCULATING_OPTIMAL_COMBINATIONS...`
7. `FINALIZING_CRYPTOGRAPHIC_RESULTS...`
8. `ACCESS_GRANTED — WINNING_NUMBERS:`

### 4. Animacja liczb
- Efekt typewriter - cyfry "piszą się" jedna po drugiej
- Każda liczba pojawia się z animacją obrotu i skalowania
- Kursor migający podczas pisania
- Neonowe efekty świecenia

### 5. Efekty specjalne
- Efekt glitch co 3 sekundy
- Shimmer effect na liczbach
- Pulsujące LED wskaźniki
- Skaningowe efekty w tle

## Techniczne szczegóły

### Komponenty
- `HackerAnimation.js` - główny komponent animacji
- Style CSS w `AILottoGeneratorUltraPro.css`

### Technologie
- React Hooks (useState, useEffect, useRef)
- Framer Motion dla animacji
- Canvas API dla Matrix code rain
- CSS animations i keyframes

### Responsywność
- Dostosowanie do różnych rozmiarów ekranu
- Mobilne wersje z mniejszymi elementami
- Zachowanie proporcji na wszystkich urządzeniach

## Integracja z AI Ultra Pro

### Przekazywanie danych
```javascript
<HackerAnimation 
  onComplete={() => {}} 
  generatedNumbers={generatedNumbers} 
/>
```

### Logika generowania
- Liczby są generowane na początku animacji
- Animacja trwa 5 sekund (dla trybu hakera)
- Po zakończeniu animacji wyświetlane są wyniki

## Kolorystyka

### Główne kolory
- Tło: `#0a0a0a`, `#1a1a2e`, `#16213e`
- Tekst: `#00ff00` (jaskrawozielony)
- Terminal: `#1a1a1a`, `#0d0d0d`
- Liczby: gradient `#00ff00` → `#00cc00` → `#009900`

### Efekty
- Neon glow: `rgba(0, 255, 0, 0.6)`
- Shimmer: `rgba(255, 255, 255, 0.3)`
- Matrix fade: `rgba(0, 0, 0, 0.05)`

## Animacje CSS

### Keyframes
- `glitchEffect` - efekt zakłóceń
- `ledPulse` - pulsowanie LED
- `scanLine` - skaningowa linia
- `shimmerEffect` - efekt błysku
- `typingBlink` - miganie kursora

### Czasowanie
- Komendy: 800ms między liniami
- Pisanie liczb: 150ms między cyframi
- Glitch: co 3 sekundy
- LED pulse: 2 sekundy cykl

## Responsywność

### Breakpointy
- Desktop: > 768px
- Tablet: 768px - 480px  
- Mobile: < 480px

### Dostosowania mobilne
- Mniejsze terminale i liczby
- Zredukowane padding i marginesy
- Dostosowane rozmiary czcionek

## Wydajność

### Optymalizacje
- Canvas zamiast DOM dla Matrix rain
- requestAnimationFrame dla płynności
- CSS transforms zamiast position changes
- Will-change dla lepszego renderingu

### Pamięć
- Cleanup funkcje w useEffect
- CancelAnimationFrame przy unmount
- Minimalne re-rendery

## Użycie

1. Wybierz "Tryb Hakera" z opcji animacji
2. Kliknij "Generuj liczby"
3. Obserwuj animację Matrix code rain
4. Śledź komendy w terminalu
5. Zobacz jak liczby się "piszą"
6. Animacja kończy się automatycznie

## Możliwe rozszerzenia

- Dodanie dźwięków terminala
- Więcej efektów glitch
- Interaktywne elementy
- Różne warianty komend
- Personalizacja kolorystyki
