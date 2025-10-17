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

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------
// Webhook Stripe (doit venir avant express.json())
// ----------------------------
app.use("/webhook", stripeWebhook);

// ----------------------------
// Middleware CORS
// ----------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS check, origin:", origin);

    if (process.env.NODE_ENV === "development") {
      callback(null, true);
      return;
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public")); // pour success.html, cancel.html

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
// Routes Auth
// ----------------------------
app.use("/api/auth", authRoutes);

// ----------------------------
// Routes globales (dont MUX)
// ----------------------------
app.use("/api", routes);
// Cela inclut maintenant :
// - /api/auth/...   → routes d’authentification
// - /api/videos/... → routes MUX (via videoRoutes.js)

// ----------------------------
// Route test
// ----------------------------
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// ----------------------------
// Route Stripe
// ----------------------------
app.post("/create-checkout-session", authMiddleware, async (req, res) => {
  console.log("🔹 req.user :", req.user);

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

  const userId = req.user.userId;
  console.log("🔹 userId pour Stripe :", userId);

  try {
    const { userId } = req.body; // récupère l'utilisateur connecté
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
app.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ userId: req.user.userId });
});

// ----------------------------
// Démarrage du serveur
// ----------------------------
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Allowed Origins:", allowedOrigins);
});
