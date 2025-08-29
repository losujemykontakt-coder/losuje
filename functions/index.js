const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const app = express();

// Middleware do logowania requestów
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use(cors({origin: true}));
app.use(express.json());

// Test endpoint - obsługuje zarówno /test jak i /api/test
app.get(["/test", "/api/test"], (req, res) => {
  console.log("🔍 Test endpoint wywołany");
  res.json({
    message: "Firebase Functions backend działa!",
    timestamp: new Date().toISOString(),
    environment: "firebase-functions",
  });
});

// Health endpoint - obsługuje zarówno /health jak i /api/health
app.get(["/health", "/api/health"], (req, res) => {
  res.json({
    status: "OK",
    service: "Firebase Functions",
    timestamp: new Date().toISOString(),
  });
});

// Statistics endpoints - obsługuje zarówno /statistics/:game jak i /api/statistics/:game
app.get(["/statistics/:game", "/api/statistics/:game"], async (req, res) => {
  try {
    const {game} = req.params;
    console.log("🔍 Pobieranie statystyk dla:", game);

    // Mock data dla statystyk
    const mockStats = {
      mostCommon: [7, 23, 34, 12, 45, 8],
      leastCommon: [13, 27, 38, 41, 2, 19],
      lastDrawn: [15, 22, 31, 9, 44, 17],
      hotNumbers: [7, 23, 34],
      coldNumbers: [13, 27, 38],
      game: game,
      lastUpdate: new Date().toISOString(),
    };

    res.json(mockStats);
  } catch (error) {
    console.error("❌ Błąd statystyk:", error);
    res.status(500).json({
      success: false,
      error: "Błąd serwera",
    });
  }
});

// Payment methods endpoint - obsługuje zarówno /payment/methods jak i /api/payment/methods
app.get(["/payment/methods", "/api/payment/methods"], async (req, res) => {
  try {
    console.log("🔍 Pobieranie metod płatności");

    const paymentMethods = [
      {id: "paypal", name: "PayPal", enabled: true},
      {id: "card", name: "Karta płatnicza", enabled: true},
      {id: "blik", name: "BLIK", enabled: true},
      {id: "przelewy24", name: "Przelewy24", enabled: true},
    ];

    res.json({
      success: true,
      methods: paymentMethods,
    });
  } catch (error) {
    console.error("❌ Błąd metod płatności:", error);
    res.status(500).json({
      success: false,
      error: "Błąd serwera",
    });
  }
});

// Harmonic stats endpoint - obsługuje zarówno /harmonic/stats jak i /api/harmonic/stats
app.get(["/harmonic/stats", "/api/harmonic/stats"], async (req, res) => {
  try {
    console.log("🔍 Pobieranie statystyk harmonicznych");

    const harmonicStats = {
      harmonicAnalysis: {
        frequency: 440,
        amplitude: 0.8,
        phase: 0.5,
      },
      recommendations: [1, 7, 14, 21, 28, 35],
      confidence: 0.85,
    };

    res.json(harmonicStats);
  } catch (error) {
    console.error("❌ Błąd statystyk harmonicznych:", error);
    res.status(500).json({
      success: false,
      error: "Błąd serwera",
    });
  }
});

// Middleware do sprawdzania autoryzacji Firebase
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        success: false,
        error: "Brak tokena autoryzacji"
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Błąd weryfikacji tokena:", error);
    return res.status(403).json({
      success: false,
      error: "Nieprawidłowy token autoryzacji"
    });
  }
};

// Talismans endpoint - obsługuje zarówno /talismans/:userId jak i /api/talismans/:userId
app.get(["/talismans/:userId", "/api/talismans/:userId"], verifyFirebaseToken, async (req, res) => {
  try {
    const {userId} = req.params;
    console.log("🔍 Pobieranie talizmanów dla:", userId);

    // Sprawdź czy użytkownik ma dostęp do tego userId
    if (req.user.uid !== userId) {
      return res.status(403).json({
        success: false,
        error: "Brak uprawnień do tego zasobu"
      });
    }

    const talismans = [
      {
        id: "1",
        name: "Smok Szczęścia",
        type: "fire",
        rarity: "rare",
        power: 85,
        description: "Starożytny smok przynoszący szczęście w grach",
      },
      {
        id: "2",
        name: "Księżycowy Amulet",
        type: "moon",
        rarity: "epic",
        power: 92,
        description: "Magiczny amulet połączony z mocą księżyca",
      },
    ];

    res.json({
      success: true,
      talismans: talismans,
      userId: userId,
    });
  } catch (error) {
    console.error("❌ Błąd talizmanów:", error);
    res.status(500).json({
      success: false,
      error: "Błąd serwera",
    });
  }
});

// PayPal endpoints - obsługuje zarówno /paypal/create jak i /api/paypal/create
app.post(["/paypal/create", "/api/paypal/create"], async (req, res) => {
  try {
    const { amount, currency, description, email, plan } = req.body;
    console.log("🔍 Tworzenie zamówienia PayPal:", { amount, currency, description, email, plan });

    // Mock response dla PayPal create order
    const mockOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      id: mockOrderId,
      status: "CREATED",
      amount: amount,
      currency: currency,
      description: description,
      email: email,
      plan: plan,
      created_time: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Błąd tworzenia zamówienia PayPal:", error);
    res.status(500).json({
      success: false,
      error: "Błąd tworzenia zamówienia PayPal"
    });
  }
});

// PayPal capture endpoint - obsługuje zarówno /paypal/capture/:orderId jak i /api/paypal/capture/:orderId
app.post(["/paypal/capture/:orderId", "/api/paypal/capture/:orderId"], async (req, res) => {
  try {
    const { orderId } = req.params;
    const { plan } = req.body;
    console.log("🔍 Finalizacja płatności PayPal:", { orderId, plan });

    // Mock response dla PayPal capture
    res.json({
      success: true,
      orderId: orderId,
      status: "COMPLETED",
      plan: plan,
      transactionId: `TXN_${Date.now()}`,
      captured_time: new Date().toISOString()
    });
  } catch (error) {
    console.error("❌ Błąd finalizacji PayPal:", error);
    res.status(500).json({
      success: false,
      error: "Błąd finalizacji płatności PayPal"
    });
  }
});

exports.api = functions.https.onRequest(app);