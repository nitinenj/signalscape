const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  networkType: String,
  signalStrength: Number
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
