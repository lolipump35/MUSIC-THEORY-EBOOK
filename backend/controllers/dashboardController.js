const User = require("../models/user");

exports.getDashboard = async (req, res) => {
  try {
    console.log("🔥 Dashboard route appelée. Utilisateur :", req.user);

    // ✅ UTILISER _id (pas id)
    const user = req.user;



    if (!user) {
      console.log("❌ Utilisateur non trouvé en base pour l'id :", userId);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        role: user.role
      },
      assignedModules: user.assignedModules || [],
      userCreatedModules: user.userCreatedModules || []
    });

  } catch (error) {
    console.error("❌ Erreur dashboard :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
