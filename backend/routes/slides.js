const express = require('express');
const router = express.Router();
const Slide = require('../models/Slide'); // Our slide blueprint
const auth = require('../middleware/auth'); // Our Bouncer
const fetchUser = require('../middleware/auth.js');
// Route: GET /api/slides
// Purpose: Fetch all slides (Supports pagination, search, filter, sort)
// Access: Public (Anyone can view the gallery)
router.get('/', async (req, res) => {
  try {
    // 1. Grab the instructions from the URL (e.g., ?page=1&limit=10&search=strategy)
    const { page = 1, limit = 10, search, tag, sort = 'latest' } = req.query;

    // 2. Build the search filter
    let query = {};

    // If the user typed in the search bar, look in the title OR description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // 'i' means case-insensitive
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // If the user clicked a specific category tab (like 'Finance')
    if (tag) {
      query.tags = tag;
    }

    // 3. Build the sorting rule (Latest Submissions)
    let sortOption = {};
    if (sort === 'latest') {
      sortOption.createdAt = -1; // -1 means newest first (descending)
    } else {
      sortOption.createdAt = 1;  // 1 means oldest first (ascending)
    }

    // 4. Ask MongoDB for the data, applying all filters and pagination
    const slides = await Slide.find(query)
      .sort(sortOption)
      .limit(limit * 1) // Force limit to be a number
      .skip((page - 1) * limit); // The math to skip items from previous pages

    // 5. Count the total number of items so our frontend knows how many pages exist
    const totalItems = await Slide.countDocuments(query);

    // 6. Send the payload back to the browser
    res.json({
      slides,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page)
    });

  } catch (error) {
    console.log('Fetch Error:', error.message);
    res.status(500).json({ error: 'Server crashed while fetching slides' });
  }
});

// Route: POST /api/slides
// Purpose: Upload a new slide
// Access: Protected (Requires JWT)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags, previewUrl, fileUrl } = req.body;

    // 1. Create a new slide entry using the data from the frontend
    const newSlide = new Slide({
      title,
      description,
      tags,
      previewUrl,
      fileUrl,
      uploadedBy: req.user.id // This comes directly from our Bouncer!
    });

    // 2. Save it permanently to MongoDB
    const savedSlide = await newSlide.save();

    // 3. Send the saved data back to confirm it worked
    res.status(201).json(savedSlide);

  } catch (error) {
    console.log('Upload Error:', error.message);
    res.status(500).json({ error: 'Server crashed while saving the slide' });
  }
});
// --- THE MISSING DELIVERABLES ---

// Route: GET /api/slides/:id
// Purpose: Fetch a single slide by its ID
// Access: Public
router.get('/:id', async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: "Presentation not found" });
    }
    res.json(slide);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Route: PUT /api/slides/:id
// Purpose: Update an existing slide
// Access: Protected (Requires JWT)
router.put('/:id', fetchUser, async (req, res) => {
  try {
    // Find the slide by ID and update it with the new data from the request body
    // { new: true } tells MongoDB to send back the updated version, not the old one
    const updatedSlide = await Slide.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );

    if (!updatedSlide) {
      return res.status(404).json({ error: "Presentation not found" });
    }
    
    res.json(updatedSlide);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Route: DELETE /api/slides/:id
// Purpose: Delete a slide
// Access: Protected (Requires JWT)
router.delete('/:id', fetchUser, async (req, res) => {
  try {
    const deletedSlide = await Slide.findByIdAndDelete(req.params.id);
    
    if (!deletedSlide) {
      return res.status(404).json({ error: "Presentation not found" });
    }

    res.json({ success: "Presentation successfully deleted", slide: deletedSlide });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
