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
const authMiddleware = require("./middleware/authMiddleware");
const routes = require("./routes/index"); // index.js global (inclura les routes vidéo)
const userPreferenceRoutes = require("./routes/userPreferenceRoutes"); // <-- notre nouvelle route

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------
// Webhook Stripe (doit venir avant express.json())
// ----------------------------
app.use("/webhook", stripeWebhook);

// ----------------------------
// Middleware CORS
// ----------------------------
const allowedOrigins = [
  "http://127.0.0.1:5501",  // frontend local
  "http://localhost:5501",  // alternative
  "https://music-theory-ebook.onrender.com" // ton futur frontend sur Render
];

const corsOptions = {
  origin: function(origin, callback) {
    // autorise les requêtes sans origin (ex: Postman ou fetch local)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `La CORS policy ne permet pas l'accès depuis ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// Appliquer CORS
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));

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
// Routes
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api", routes); // index.js global pour /videos et autres routes existantes
app.use("/api/user", userPreferenceRoutes); // <-- route pour la préférence de plateforme

// ----------------------------
// Route par défaut
// ----------------------------
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// ----------------------------
// Route Stripe
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
      client_reference_id: userId, // ID utilisateur
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
// Route dashboard protégée
// ----------------------------
app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role, // très important pour savoir si admin
    message: "Bienvenue sur ton dashboard 🚀"
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
