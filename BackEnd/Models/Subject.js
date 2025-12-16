const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // 🔥 normalization
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // allows nulls
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
