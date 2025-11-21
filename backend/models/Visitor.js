const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  guestName: String,
  hostName: String,
  flatNumber: String,
  entryCode: { type: String, unique: true },

  // Data added by Watchman upon entry
  plateNumber: { type: String, default: null },

  // Store both the cropped plate image (base64 data URL) and the original full capture.
  plateImage: { type: String, default: null },     // cropped plate image (Base64 or data URL)
  originalImage: { type: String, default: null },  // full original capture (Base64 or data URL)

  status: { type: String, enum: ['PENDING', 'INSIDE', 'EXITED'], default: 'PENDING' },
  entryTime: Date,
  exitTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Visitor', VisitorSchema);
