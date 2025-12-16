const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
  examname: {type:String},
  date: { type: Date, required: true },
  durationMinutes: { type: Number, default: 120 },
  subjects: [
  {
    subjectName: String,
    rollRanges: [{ from: Number, to: Number }],
    individualRolls: [Number]
  }
],
  hall: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Examination', examinationSchema);
