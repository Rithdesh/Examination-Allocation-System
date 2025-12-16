const Examination = require("../Models/Examination");
const SeatingPlan = require("../Models/SeatingPlan");

const createExamination = async (req, res) => {
  try {
    const {
      examName,
      date,
      durationMinutes, // ✅ FIXED
      subjects,
    } = req.body;

    /* ---- basic validation ---- */
    if (
      !examName ||
      !date ||
      typeof durationMinutes !== "number" ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        message: "Exam name, date, durationMinutes, and at least one subject are required",
      });
    }

    /* ---- duplicate exam check ---- */
    const existingExam = await Examination.findOne({
      date,
    });

    if (existingExam) {
      return res.status(409).json({
        message: "Examination already exists for this date",
      });
    }

    /* ---- validate & normalize subjects ---- */
    const formattedSubjects = subjects.map((s, index) => {
      if (!s.subjectName) {
        throw new Error(`subjectName missing for subject at index ${index}`);
      }

      return {
        subjectName: s.subjectName.trim().toUpperCase(),
        rollRanges: Array.isArray(s.rollRanges) ? s.rollRanges : [],
        individualRolls: Array.isArray(s.individualRolls) ? s.individualRolls : [],
      };
    });

    /* ---- create exam ---- */
    const exam = await Examination.create({
      examName: examName.trim(),
      date,
      durationMinutes, // ✅ FIXED
      subjects: formattedSubjects,
    });

    res.status(201).json({
      message: "Examination created successfully",
      exam,
    });
  } catch (error) {
    console.error("createExamination error:", error);
    res.status(500).json({
      message: "Failed to create examination",
      error: error.message,
    });
  }
};


// GET ALL EXAMINATIONS
const getAllExaminations = async (req, res) => {
  try {
    const exams = await Examination.find().populate("subject");
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE EXAMINATION
const updateExamination = async (req, res) => {
  try {
    const exam = await Examination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Examination not found" });
    }

    res.status(200).json({
      message: "Examination updated successfully",
      exam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE EXAMINATION
const deleteExamination = async (req, res) => {
  try {
    const exam = await Examination.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: "Examination not found" });
    }

    res.status(200).json({ message: "Examination deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* -------- GET SEATING PLAN BY EXAM -------- */



module.exports = {
  createExamination,
  getAllExaminations,
  updateExamination,
  deleteExamination
};
