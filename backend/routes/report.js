const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// POST /api/report
router.post('/', async (req, res) => {
  try {
    const { latitude, longitude, networkType, signalStrength } = req.body;
    const newReport = new Report({ latitude, longitude, networkType, signalStrength });
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (err) {
    res.status(400).json({ error: 'Invalid report format', details: err });
  }
});

module.exports = router;
