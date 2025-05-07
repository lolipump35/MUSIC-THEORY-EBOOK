const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Importer CORS
const authRoutes = require('./routes/authRoutes');

dotenv.config(); // Charger les variables d'environnement

const app = express();
const port = 5000;


// Middleware pour activer CORS
app.use(cors());  // Permet toutes les connexions CORS

// Si tu veux restreindre les origines autorisées :
/*
app.use(cors({
  origin: 'http://localhost:3000', // Permet uniquement les requêtes depuis ce domaine
}));
// */

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Connexion à MongoDB avec Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Database connection error: ', err));

// Routes
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
