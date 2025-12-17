const mongoose = require("mongoose");

const rollRangeSchema = new mongoose.Schema(
  {
    from: Number,
    to: Number
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      uppercase: true
    },
    rollRanges: [rollRangeSchema],
    individualRolls: [Number]
  },
  { _id: false }
);

const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true
    },
    subjects: {
      type: [subjectSchema],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Examination", examinationSchema);
