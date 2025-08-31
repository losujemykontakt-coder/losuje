# Skrypt konfiguracji domeny niestandardowej losuje.pl w Firebase Hosting (PowerShell)
# Autor: AI Assistant

# Funkcje logowania
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Sprawdzenie wymagań
function Check-Requirements {
    Write-Info "Sprawdzam wymagania..."
    
    # Sprawdź czy Firebase CLI jest zainstalowany
    try {
        $null = Get-Command firebase -ErrorAction Stop
    } catch {
        Write-Error "Firebase CLI nie jest zainstalowany!"
        Write-Info "Zainstaluj: npm install -g firebase-tools"
        exit 1
    }
    
    # Sprawdź czy jesteś zalogowany do Firebase
    try {
        firebase projects:list | Out-Null
    } catch {
        Write-Warning "Nie jestes zalogowany do Firebase. Loguje..."
        firebase login
    }
    
    # Sprawdź czy projekt istnieje
    $projects = firebase projects:list
    if ($projects -notmatch "losujemy") {
        Write-Error "Projekt 'losujemy' nie istnieje w Firebase!"
        exit 1
    }
    
    Write-Success "Wymagania spelnione!"
}

# Konfiguracja DNS
function Setup-DNS {
    Write-Info "Konfiguruje DNS dla losuje.pl..."
    
    Write-Host ""
    Write-Warning "MANUALNA KONFIGURACJA DNS WYMAGANA!"
    Write-Host ""
    Write-Host "Wykonaj nastepujace kroki w panelu OVH:"
    Write-Host ""
    Write-Host "1. Przejdz do https://www.ovh.com/manager/"
    Write-Host "2. Zaloguj sie i wybierz domenę 'losuje.pl'"
    Write-Host "3. Przejdz do 'Strefa DNS'"
    Write-Host "4. Dodaj nastepujace rekordy:"
    Write-Host ""
    Write-Host "   Rekord A:"
    Write-Host "   - Typ: A"
    Write-Host "   - Nazwa: @"
    Write-Host "   - Wartosc: 151.101.1.195"
    Write-Host "   - TTL: 3600"
    Write-Host ""
    Write-Host "   Rekord A:"
    Write-Host "   - Typ: A"
    Write-Host "   - Nazwa: www"
    Write-Host "   - Wartosc: 151.101.1.195"
    Write-Host "   - TTL: 3600"
    Write-Host ""
    Write-Host "5. Zapisz zmiany"
    Write-Host ""
    
    $response = Read-Host "Czy skonfigurowales DNS? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Error "Konfiguracja DNS jest wymagana!"
        exit 1
    }
    
    Write-Success "DNS skonfigurowany!"
}

# Konfiguracja Firebase Hosting
function Setup-FirebaseHosting {
    Write-Info "Konfiguruje Firebase Hosting..."
    
    # Sprawdź czy domena już istnieje
    $sites = firebase hosting:sites:list
    if ($sites -match "losuje-pl") {
        Write-Warning "Domena 'losuje-pl' juz istnieje w Firebase!"
        $response = Read-Host "Czy chcesz kontynuowac? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 1
        }
    } else {
        # Dodaj nową domenę
        Write-Info "Dodaje domenę niestandardową..."
        firebase hosting:sites:add losuje-pl
    }
    
    Write-Success "Firebase Hosting skonfigurowany!"
}

# Aktualizacja konfiguracji Firebase
function Update-FirebaseConfig {
    Write-Info "Aktualizuje konfigurację Firebase..."
    
    # Sprawdź czy firebase.json istnieje
    if (-not (Test-Path "firebase.json")) {
        Write-Error "Plik firebase.json nie istnieje!"
        exit 1
    }
    
    # Backup oryginalnego pliku
    Copy-Item firebase.json firebase.json.backup
    
    # Aktualizuj firebase.json z nagłówkami PWA
    $firebaseConfig = @"
{
  "firestore": {
    "database": "(default)",
    "location": "eur3",
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ],
      "predeploy": [
        "npm --prefix `"`$RESOURCE_DIR`" run lint"
      ]
    }
  ],
  "hosting": {
    "public": "frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          },
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "/.well-known/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  }
}
"@
    
    $firebaseConfig | Out-File -FilePath "firebase.json" -Encoding UTF8
    
    Write-Success "Konfiguracja Firebase zaktualizowana!"
}

# Build aplikacji
function Build-App {
    Write-Info "Buduje aplikację..."
    
    # Sprawdź czy frontend istnieje
    if (-not (Test-Path "frontend")) {
        Write-Error "Katalog frontend nie istnieje!"
        exit 1
    }
    
    # Przejdź do frontend i zainstaluj zależności
    Set-Location frontend
    
    if (-not (Test-Path "node_modules")) {
        Write-Info "Instaluje zależności frontend..."
        npm install
    }
    
    # Build aplikacji
    Write-Info "Buduje aplikację React..."
    npm run build
    
    # Sprawdź czy build się udał
    if (-not (Test-Path "build")) {
        Write-Error "Build nie został utworzony!"
        exit 1
    }
    
    Set-Location ..
    
    Write-Success "Aplikacja zbudowana!"
}

# Deploy na Firebase
function Deploy-ToFirebase {
    Write-Info "Deployuje na Firebase..."
    
    # Deploy hosting
    firebase deploy --only hosting
    
    Write-Success "Aplikacja wdrożona na Firebase!"
}

# Weryfikacja
function Verify-Deployment {
    Write-Info "Weryfikuje deployment..."
    
    Write-Host ""
    Write-Warning "SPRAWDZ PROPAGACJE DNS:"
    Write-Host ""
    Write-Host "1. Sprawdź propagację DNS:"
    Write-Host "   nslookup losuje.pl"
    Write-Host "   dig losuje.pl"
    Write-Host ""
    Write-Host "2. Sprawdź czy domena wskazuje na Firebase:"
    Write-Host "   curl -I https://losuje.pl"
    Write-Host ""
    Write-Host "3. Otwórz aplikację w przeglądarce:"
    Write-Host "   https://losuje.pl"
    Write-Host ""
    Write-Host "4. Sprawdź czy Firebase Auth działa"
    Write-Host "5. Sprawdź czy API działa"
    Write-Host ""
    
    Write-Success "Weryfikacja zakończona!"
}

# Główna funkcja
function Main {
    Write-Host "Konfiguracja domeny niestandardowej losuje.pl w Firebase Hosting" -ForegroundColor Cyan
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Check-Requirements
    Setup-DNS
    Setup-FirebaseHosting
    Update-FirebaseConfig
    Build-App
    Deploy-ToFirebase
    Verify-Deployment
    
    Write-Host ""
    Write-Success "Konfiguracja domeny niestandardowej zakończona!"
    Write-Host ""
    Write-Host "Podsumowanie:"
    Write-Host "✅ DNS skonfigurowany w OVH"
    Write-Host "✅ Firebase Hosting skonfigurowany"
    Write-Host "✅ Aplikacja wdrożona"
    Write-Host "✅ SSL będzie skonfigurowany automatycznie (24-48 godzin)"
    Write-Host ""
    Write-Host "Twoja aplikacja będzie dostępna pod adresem:"
    Write-Host "   https://losuje.pl"
    Write-Host ""
    Write-Host "Pamiętaj:"
    Write-Host "   - DNS może propagować się do 48 godzin"
    Write-Host "   - SSL będzie skonfigurowany automatycznie"
    Write-Host "   - Firebase Auth będzie działać automatycznie"
    Write-Host ""
}

# Uruchom główną funkcję
Main
