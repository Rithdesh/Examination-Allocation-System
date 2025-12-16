const mongoose = require("mongoose");

/* ---------- Roll Range Schema ---------- */
const rollRangeSchema = new mongoose.Schema(
  {
    from: {
      type: Number,
      required: true,
    },
    to: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ---------- Subject Schema ---------- */
const examSubjectSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // 🔥 normalization
    },
    rollRanges: {
      type: [rollRangeSchema],
      default: [],
    },
    individualRolls: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

/* ---------- Examination Schema ---------- */
const examinationSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      default: 120,
      min: 30,
    },

    subjects: {
      type: [examSubjectSchema],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one subject is required",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Examination", examinationSchema);
