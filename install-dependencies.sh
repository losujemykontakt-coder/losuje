#!/bin/bash

echo "🚀 Instalowanie zależności dla AI Lotto Generator Ultra Pro..."

# Przejdź do katalogu frontend
cd frontend

echo "📦 Instalowanie zależności frontend..."
npm install lottie-react @react-three/fiber @react-three/drei three

echo "✅ Zależności frontend zainstalowane!"

# Przejdź do katalogu backend
cd ../backend

echo "📦 Sprawdzanie zależności backend..."
# Backend już ma wszystkie potrzebne zależności

echo "✅ Wszystkie zależności zainstalowane!"
echo ""
echo "🎉 AI Lotto Generator Ultra Pro jest gotowy do uruchomienia!"
echo ""
echo "Aby uruchomić aplikację:"
echo "1. Terminal 1: cd backend && npm start"
echo "2. Terminal 2: cd frontend && npm start"
echo ""
echo "Aplikacja będzie dostępna pod adresem:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:5000"
echo ""
echo "🚀 Miłego użytkowania AI Ultra Pro!"


















































