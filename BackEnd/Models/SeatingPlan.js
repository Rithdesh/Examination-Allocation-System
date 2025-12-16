const mongoose = require("mongoose");

/* ---------- Roll Range ---------- */
const rollRangeSchema = new mongoose.Schema(
  {
    from: Number,
    to: Number,
    count: Number,
  },
  { _id: false }
);

/* ---------- Subject Allocation ---------- */
const allocationSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      uppercase: true,
    },
    count: Number,
    rollRanges: [rollRangeSchema],
  },
  { _id: false }
);

/* ---------- Classroom ---------- */
const classroomSchema = new mongoose.Schema(
  {
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },
    hallName: {
      type: String,
      required: false, // 👈 auto-filled
    },
    capacityAtAllocation: Number,
    studentsInHall: Number,
    notFull: Boolean,
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
    totalStudents: Number,
    hasOverflow: Boolean,
    overflowDetails: [String],
  },
  { timestamps: true }
);

/* ======================================================
   🔥 MIDDLEWARE: AUTO-FILL hallName FROM Hall COLLECTION
====================================================== */
seatingPlanSchema.pre("save", async function () {
  const Hall = mongoose.model("Hall");

  for (const classroom of this.classrooms) {
    if (!classroom.hallName && classroom.hall) {
      const hallDoc = await Hall.findById(classroom.hall).select("hallName");
      if (hallDoc) {
        classroom.hallName = hallDoc.hallName;
      }
    }
  }
});


module.exports = mongoose.model("SeatingPlan", seatingPlanSchema);
