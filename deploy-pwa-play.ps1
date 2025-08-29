# 🚀 Skrypt PowerShell do budowania i deployowania PWA dla Google Play Store
# Autor: Losuje.pl
# Data: $(Get-Date)

param(
    [switch]$SkipBuild,
    [switch]$SkipDeploy
)

# Funkcje pomocnicze
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

Write-Host "🎰 Rozpoczynam budowanie PWA dla Google Play Store..." -ForegroundColor Cyan

# Sprawdzenie czy jesteśmy w odpowiednim katalogu
if (-not (Test-Path "package.json")) {
    Write-Error "Nie znaleziono package.json. Uruchom skrypt z głównego katalogu projektu."
    exit 1
}

# Sprawdzenie czy Node.js jest zainstalowany
try {
    $nodeVersion = node --version
    Write-Info "Node.js wersja: $nodeVersion"
} catch {
    Write-Error "Node.js nie jest zainstalowany. Zainstaluj Node.js i spróbuj ponownie."
    exit 1
}

# Sprawdzenie czy npm jest zainstalowany
try {
    $npmVersion = npm --version
    Write-Info "npm wersja: $npmVersion"
} catch {
    Write-Error "npm nie jest zainstalowany. Zainstaluj npm i spróbuj ponownie."
    exit 1
}

# Sprawdzenie czy Firebase CLI jest zainstalowany
try {
    $firebaseVersion = firebase --version
    Write-Info "Firebase CLI wersja: $firebaseVersion"
} catch {
    Write-Warning "Firebase CLI nie jest zainstalowany. Instaluję..."
    npm install -g firebase-tools
}

if (-not $SkipBuild) {
    # Przejście do katalogu frontend
    Write-Info "Przechodzę do katalogu frontend..."
    Set-Location frontend

    # Instalacja zależności
    Write-Info "Instaluję zależności..."
    npm install

    # Budowanie PWA
    Write-Info "Buduję aplikację PWA..."
    npm run build-pwa

    # Sprawdzenie czy build się udał
    if (-not (Test-Path "build")) {
        Write-Error "Build nie został utworzony. Sprawdź błędy i spróbuj ponownie."
        exit 1
    }

    Write-Success "Build PWA zakończony pomyślnie!"

    # Powrót do głównego katalogu
    Set-Location ..
}

if (-not $SkipDeploy) {
    # Konfiguracja Firebase dla PWA
    Write-Info "Konfiguruję Firebase dla PWA..."

    # Kopiowanie konfiguracji PWA
    Copy-Item firebasePWA.json firebase.json -Force
    Copy-Item .firebasercPWA .firebaserc -Force

    # Sprawdzenie czy użytkownik jest zalogowany do Firebase
    try {
        firebase projects:list | Out-Null
    } catch {
        Write-Warning "Nie jesteś zalogowany do Firebase. Loguję..."
        firebase login
    }

    # Sprawdzenie czy projekt istnieje
    $projects = firebase projects:list
    if ($projects -notmatch "losuje-play") {
        Write-Warning "Projekt 'losuje-play' nie istnieje. Utwórz go ręcznie w Firebase Console:"
        Write-Error "1. Przejdź do https://console.firebase.google.com"
        Write-Error "2. Kliknij 'Dodaj projekt'"
        Write-Error "3. Nazwij projekt 'losuje-play'"
        Write-Error "4. Włącz Hosting i Firestore"
        Write-Error "5. Uruchom ponownie ten skrypt"
        exit 1
    }

    # Deploy na Firebase
    Write-Info "Deployuję na Firebase..."
    firebase deploy --only hosting

    Write-Success "🚀 PWA została pomyślnie wdrożona!"
    Write-Info "🌐 URL aplikacji: https://losuje-play.web.app"
    Write-Info "📱 Aplikacja jest gotowa do integracji z Google Play Store"

    # Przywrócenie oryginalnej konfiguracji Firebase
    Write-Info "Przywracam oryginalną konfigurację Firebase..."
    git checkout firebase.json .firebaserc
}

Write-Success "✅ Wszystko gotowe! Aplikacja PWA jest dostępna pod adresem:"
Write-Host ""
Write-Host "🌐 https://losuje-play.web.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Następne kroki:" -ForegroundColor Yellow
Write-Host "1. Przetestuj aplikację pod powyższym adresem"
Write-Host "2. Skonfiguruj TWA (Trusted Web Activity) dla Google Play"
Write-Host "3. Przygotuj materiały do Google Play Console"
Write-Host "4. Prześlij aplikację do Google Play Store"
Write-Host ""
Write-Host "🎰 Powodzenia z Twoją aplikacją Lotto AI!" -ForegroundColor Green





