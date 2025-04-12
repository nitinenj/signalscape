const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  networkType: {
    type: String,
    enum: ['WiFi', 'LTE', '5G'],
    required: true,
  },
  signalStrength: {
    type: Number, // e.g. RSSI in dBm
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', ReportSchema);
