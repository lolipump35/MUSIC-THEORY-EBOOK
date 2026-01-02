require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ----------------------------
// Import des routes
// ----------------------------
const authRoutes = require("./routes/authRoutes");
const stripeWebhook = require("./routes/stripeWebhook");
const routes = require("./routes/index"); // index.js global pour /videos et autres routes
const userPreferenceRoutes = require("./routes/userPreferenceRoutes"); // route préférence plateforme
const programRoutes = require("./routes/programRoutes"); // <-- notre route programmes
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------
// Webhook Stripe (avant express.json())
// ----------------------------
app.use("/webhook", stripeWebhook);

// ----------------------------
// Middleware CORS
// ----------------------------
const allowedOrigins = [
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "https://music-theory-ebook.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // autoriser Postman ou fetch local
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `La CORS policy ne permet pas l'accès depuis ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};

// 1. Middleware CORS : doit être avant toutes les routes API
app.use(cors(corsOptions));

// 2. Middleware JSON
app.use(express.json());

// 3. Static (frontend)
app.use(express.static("public"));

// 4. Routes API
app.use("/api/auth", authRoutes);
app.use("/api", routes);
app.use("/api/user", userPreferenceRoutes);
app.use("/api/me", programRoutes);


// ----------------------------
// Connexion à MongoDB
// ----------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));


// ----------------------------
// Route par défaut
// ----------------------------
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// ----------------------------
// Route Stripe checkout
// ----------------------------
app.post("/create-checkout-session", authMiddleware, async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

  const userId = req.user.userId;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Formation Guitare Débutant" },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------
// Dashboard protégé
// ----------------------------
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role,
    message: "Bienvenue sur ton dashboard 🚀",
  });
});

// ----------------------------
// Démarrage du serveur
// ----------------------------
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Allowed Origins:", allowedOrigins);
});
