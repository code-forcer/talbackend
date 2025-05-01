const express = require("express");
const multer = require("multer");
const Donation = require("../model/Donation");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// Serve uploaded proof files publicly
router.use("/uploads", express.static(uploadDir));

// Submit donation with file upload
router.post("/api/donate/submit", upload.single("proof"), async (req, res) => {
  const { name, email, amount } = req.body;
  const proof = req.file ? req.file.filename : null; // Store only the filename

  // Validate input
  if (!name || !email || !amount || !proof) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const donation = new Donation({ name, email, amount, proof });
    await donation.save();
    res.status(201).json({ message: "Donation submitted successfully!" });
  } catch (error) {
    console.error("Error saving donation:", error);
    res.status(500).json({ error: "Failed to save donation. Please try again later." });
  }
});

// Get all donations
router.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ error: "Failed to fetch donations." });
  }
});

// Download proof of payment
router.get("/api/donations/download/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "File not found." });
  }
});

// Delete donation and its proof file
router.delete("/api/donations/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found." });
    }

    // Delete the proof file if it exists
    const proofPath = path.join(uploadDir, donation.proof);
    if (fs.existsSync(proofPath)) {
      fs.unlinkSync(proofPath);
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation deleted successfully." });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ error: "Failed to delete donation." });
  }
});

module.exports = router;
