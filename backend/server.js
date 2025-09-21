require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

const authRoutes = require("./routes/authRoutes");

const app = express();
const port = 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

const corsOptions = {
  origin: (origin, callback) => {
    console.log("CORS check, origin:", origin);

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
app.use(express.static("public")); // pour servir success.html, cancel.html
app.use(express.json());

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Routes auth
app.use("/api/auth", authRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// ✅ Route Stripe
app.post("/create-checkout-session", async (req, res) => {
  console.log("🚀 /create-checkout-session called");
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
      success_url: `http://127.0.0.1:5501/success.html`,
      cancel_url: `http://127.0.0.1:5501/cancel.html`,
    });
    console.log("Session created:", session.url);
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Démarrage du serveur
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
