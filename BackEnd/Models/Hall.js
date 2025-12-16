const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema(
  {
    hallName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hall", hallSchema);
