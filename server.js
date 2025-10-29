const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ INITIALISATION FIREBASE
const serviceAccount = require("./service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log("🔥 Firebase Admin initialisé sur RENDER !");

// ✅ ROUTE RACINE
app.get("/", (req, res) => {
  res.json({
    status: "SERVER_ACTIVE", 
    message: "🎉 Serveur ScanAndGo + Firebase sur RENDER !",
    endpoints: {
      test: "/test",
      notifications: "/send-notification"
    }
  });
});

// ✅ ROUTE TEST
app.get("/test", (req, res) => {
  res.json({
    status: "SUCCESS",
    message: "✅ Route /test FONCTIONNE sur RENDER !",
    firebase: "CONNECTÉ",
    timestamp: new Date().toISOString(),
  });
});

// ✅ ROUTE NOTIFICATIONS RÉELLES
app.post("/send-notification", async (req, res) => {
  try {
    console.log("📨 Notification reçue:", req.body);
    
    const { to, notification, data } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: "Token FCM manquant"
      });
    }

    const message = {
      token: to,
      notification: {
        title: notification?.title || "Nouveau message",
        body: notification?.body || "Vous avez reçu un message",
      },
      data: data || {},
    };

    console.log("🚀 Envoi vers FCM:", message);
    
    const response = await admin.messaging().send(message);
    
    console.log("✅ Notification envoyée avec succès:", response);
    
    res.json({
      success: true,
      message: "✅ Notification envoyée avec FCM !",
      messageId: response
    });

  } catch (error) {
    console.error("❌ Erreur FCM:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ PORT RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVEUR RENDER DÉMARRÉ sur le port ${PORT}`);
});
