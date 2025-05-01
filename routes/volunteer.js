const express = require("express");
const Volunteer = require("../model/Volunteer");
const router = express.Router();
const bodyParser = require("body-parser");

// Middleware to parse JSON
router.use(bodyParser.json());

// POST: Submit Volunteer Form
router.post("/volunteers/submit", async (req, res) => {
  const { name, email, message } = req.body;

  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newVolunteer = new Volunteer({ name, email, message });
    await newVolunteer.save();
    res.status(201).json({ message: "Volunteer form submitted successfully!" });
  } catch (error) {
    console.error("Error saving volunteer:", error);
    res.status(500).json({ error: "Failed to save volunteer data." });
  }
});

// GET: Retrieve All Volunteers (Admin)
router.get("/volunteers/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 }); // Newest first
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
});

// DELETE: Remove a Volunteer by ID (Admin)
router.delete("/volunteers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Volunteer.findByIdAndDelete(id);
    res.json({ message: "Volunteer deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete volunteer." });
  }
});

module.exports = router;
