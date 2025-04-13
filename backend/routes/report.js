const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// POST /api/report/post
router.post('/post', async (req, res) => {
  try {
    const { latitude, longitude, networkType, signalStrength } = req.body;
    const newReport = new Report({ latitude, longitude, networkType, signalStrength });
    const savedReport = await newReport.save();

    console.log("Saved report to MongoDB:", savedReport); // 🖨️ This will show the saved object

    res.status(201).json(savedReport);
  } catch (err) {
    res.status(400).json({ error: 'Invalid report format', details: err });
  }
});

// GET /api/report/get - Get all reports
router.get('/get', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;

