# Skrypt PowerShell do wykonania commit zmian
Write-Host "🔧 Dodawanie zmian do Git..." -ForegroundColor Green

# Dodaj wszystkie zmiany
git add .

# Sprawdź status
Write-Host "📋 Status Git:" -ForegroundColor Yellow
git status

# Wykonaj commit
Write-Host "💾 Wykonywanie commit..." -ForegroundColor Green
git commit -m "Fix PayPal configuration - use .env files instead of hardcoded values

- Updated App.js to use process.env.REACT_APP_PAYPAL_CLIENT_ID
- Added scripts for updating PayPal config on OVH server via KVM
- Created auto-update-paypal.sh for automatic configuration
- Created update-app-via-git.sh for Git-based updates
- Added comprehensive guides for KVM and Git updates
- Fixed PayPal environment to use 'live' instead of 'production'
- Added proper error handling and validation scripts

PayPal will now use correct LIVE environment data from .env files"

Write-Host "✅ Commit wykonany!" -ForegroundColor Green

# Pokaż ostatni commit
Write-Host "📋 Ostatni commit:" -ForegroundColor Yellow
git log --oneline -1
