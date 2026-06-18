const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Prevents two users from signing up with the same email
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
