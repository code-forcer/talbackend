// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  proof: { type: String, required: true }, // Store file path or file name if you save the file
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);
