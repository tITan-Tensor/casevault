const mongoose = require('mongoose');

// Define the blueprint for a slide entry
const slideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A title is required'],
    trim: true // Removes accidental spaces at the beginning/end
  },
  description: {
    type: String,
    required: [true, 'A description is required']
  },
  tags: {
    type: [String], // An array of strings (e.g., ["Finance", "Strategy"])
    default: []
  },
  previewUrl: {
    type: String, // We will store the URL of the uploaded image
    required: [true, 'A preview image URL is required']
  },
  fileUrl: {
    type: String, // We will store the URL of the uploaded PDF/PPTX
    required: [true, 'A file URL is required']
  }
}, {
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt' dates
});

// Compile the schema into a model and export it
module.exports = mongoose.model('Slide', slideSchema);