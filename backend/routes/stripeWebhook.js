const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Erreur webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (!userId) {
      console.warn("⚠️ Aucun client_reference_id trouvé dans la session.");
    } else {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $addToSet: { purchases: "formation_debutant" } },
          { new: true } // renvoie le document mis à jour
        );
        console.log("✅ Achat ajouté à l'utilisateur :", updatedUser);
      } catch (err) {
        console.error("❌ Erreur maj user:", err.message);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
