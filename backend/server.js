require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");

// ----------------------------
// Import des routes
// ----------------------------
const authRoutes = require("./routes/authRoutes");
const stripeWebhook = require("./routes/stripeWebhook");
const routes = require("./routes/index");
const userPreferenceRoutes = require("./routes/userPreferenceRoutes");
const programRoutes = require("./routes/programRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------
// Webhook Stripe (AVANT express.json)
// ----------------------------
app.use("/webhook", stripeWebhook);

// ----------------------------
// Middleware CORS
// ----------------------------
const allowedOrigins = [
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "https://music-theory-ebook.onrender.com",
  "https://musictheoryebookfrontvercel.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// ----------------------------
// JSON
// ----------------------------
app.use(express.json());

/* ======================================================
   ✅ SERVING DES FICHIERS STATIQUES (OPTION A)
   ====================================================== */



/* ======================================================
   CONFIG DYNAMIQUE
   ====================================================== */

app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.API_BASE_URL = "${process.env.API_BASE_URL}";
  `);
});

/* ======================================================
   ROUTES API
   ====================================================== */

app.use("/api/auth", authRoutes);
app.use("/api", routes);
app.use("/api/user", userPreferenceRoutes);
app.use("/api/me", programRoutes);
app.use("/admin", adminRoutes);

// ----------------------------
// MongoDB
// ----------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

// ----------------------------
// Route simple
// ----------------------------
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// ----------------------------
// Stripe checkout
// ----------------------------
app.post("/create-checkout-session", authMiddleware, async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }

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
      client_reference_id: req.user.userId,
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
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
// Démarrage serveur
// ----------------------------
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log("NODE_ENV:", process.env.NODE_ENV);
});


// change 