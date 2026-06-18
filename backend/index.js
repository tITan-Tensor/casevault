global.crypto = require('crypto');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // 1. IMPORT CORS HERE
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MIDDLEWARE ---
app.use(cors()); // 2. OPEN THE GATES HERE
app.use(express.json());
// ... rest of the file stays the same

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to the MongoDB Pantry!'))
  .catch((error) => console.log('❌ Database connection failed:', error.message));

// --- 3. ROUTES ---
// The two lines we just added! This connects your URL endpoints to your router files.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/slides', require('./routes/slides'));

// Our original test route
app.get('/', (req, res) => {
  res.send('The E-Cell backend kitchen is open, and the pantry is connected!');
});

// --- 4. START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
