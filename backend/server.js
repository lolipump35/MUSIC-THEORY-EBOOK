const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Importer CORS
const authRoutes = require('./routes/authRoutes');

dotenv.config(); // Charger les variables d'environnement

const app = express();
const port = 5000;

const corsOptions = {
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Permet uniquement cette origine
  credentials: true, // Permet les cookies et les credentials
};

app.use(cors(corsOptions));

app.use(express.json());

// Connexion à MongoDB avec Mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('✅ Database connected'))
.catch((err) => console.error('❌ Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.listen(port, () => {
  console.log(`✅Server is running on port ${port}`);
});
