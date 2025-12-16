const mongoose = require("mongoose");

/* ---------- Roll Ranges ---------- */
const rollRangeSchema = new mongoose.Schema(
  {
    from: { type: Number, required: true },
    to: { type: Number, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

/* ---------- Subject Allocation ---------- */
const allocationSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    subjectName: { type: String, required: true },
    count: { type: Number, required: true },
    overflow: { type: Boolean, default: false },
    rollRanges: [rollRangeSchema],
  },
  { _id: false }
);

/* ---------- Classroom / Hall Allocation ---------- */
const classroomSchema = new mongoose.Schema(
  {
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },

    hallName: { type: String, required: true }, // snapshot
    capacityAtAllocation: { type: Number, required: true },

    studentsInHall: { type: Number, required: true },
    notFull: { type: Boolean, default: false },
    overflow: { type: Boolean, default: false },

    allocations: [allocationSchema],
  },
  { _id: false }
);

/* ---------- Seating Plan ---------- */
const seatingPlanSchema = new mongoose.Schema(
  {
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examination",
      required: true,
    },

    classrooms: [classroomSchema],

    totalStudents: { type: Number, required: true },
    hasOverflow: { type: Boolean, default: false },
    overflowDetails: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeatingPlan", seatingPlanSchema);