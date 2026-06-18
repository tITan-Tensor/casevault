const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // The password hasher
const jwt = require('jsonwebtoken'); // The digital ID card generator
const User = require('../models/User'); // Importing our User blueprint

// Route: POST /api/auth/register
// Purpose: Create a new user account
router.post('/register', async (req, res) => {
  try {
    // 1. Extract the data the user typed into the frontend form
    const { name, email, password } = req.body;

    // 2. Check if a user with this email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // 3. Hash the password (CRITICAL SECURITY STEP)
    // We generate "salt" (random characters) and mix it with the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the new user in the database
    const newUser = new User({
      name,
      email,
      password: hashedPassword // We save the scrambled version, NEVER the real one
    });

    await newUser.save(); // This permanently writes it to MongoDB

    // 5. Send a success message back to the frontend
    res.status(201).json({ message: 'User successfully registered!' });

  } catch (error) {
    console.log('Registration Error:', error.message);
    res.status(500).json({ error: 'Server crashed during registration' });
  }
});

module.exports = router;



// Route: POST /api/auth/login
// Purpose: Authenticate user and return a JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 2. Compare the typed password with the scrambled database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Create the JWT Payload (The data hidden inside the badge)
    const payload = {
      user: {
        id: user.id // We pack their MongoDB ID inside the token
      }
    };

    // 4. Sign the token using our secret key
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 5. Send the token to the frontend
   // Send BOTH the token and the user's email back to the frontend
      res.json({ token, email: user.email }); 

  } catch (error) {
    console.log('Login Error:', error.message);
    res.status(500).json({ error: 'Server crashed during login' });
  }
});
