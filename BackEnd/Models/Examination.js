const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  durationMinutes: { type: Number, default: 120 },
  subject: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { timestamps: true });

module.exports = mongoose.model('Examination', examinationSchema);
