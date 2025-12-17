const Examination = require("../Models/Examination");
const SeatingPlan = require("../Models/SeatingPlan");
const Subject = require("../Models/Subject");

// CREATE EXAMINATION
const createExamination = async (req, res) => {
  try {
    const {
      examName,
      date,
      durationMinutes,
      subjects
    } = req.body;

    /* ---------- Basic validation ---------- */
    if (
      !examName ||
      !date ||
      typeof durationMinutes !== "number" ||
      durationMinutes <= 0 ||
      !Array.isArray(subjects) ||
      subjects.length === 0
    ) {
      return res.status(400).json({
        message:
          "Exam name, date, durationMinutes, and at least one subject are required"
      });
    }

    /* ---------- Normalize subject names ---------- */
    const requestedSubjectNames = subjects.map(s =>
      s.subjectName?.trim().toUpperCase()
    );

    if (requestedSubjectNames.includes(undefined)) {
      return res.status(400).json({
        message: "Each subject must contain a valid subjectName"
      });
    }

    /* ---------- Validate subjects against DB ---------- */
    const existingSubjects = await Subject.find({
      name: { $in: requestedSubjectNames }
    }).select("name");

    const existingSubjectNames = existingSubjects.map(s =>
      s.name.toUpperCase()
    );

    const invalidSubjects = requestedSubjectNames.filter(
      s => !existingSubjectNames.includes(s)
    );

    if (invalidSubjects.length > 0) {
      return res.status(400).json({
        message: "Invalid subject(s) provided",
        invalidSubjects
      });
    }

    /* ---------- Prevent duplicate exam on same date ---------- */
    const existingExam = await Examination.findOne({
      examName: examName.trim(),
      date: new Date(date)
    });

    if (existingExam) {
      return res.status(409).json({
        message: "Examination already exists for this date"
      });
    }

    /* ---------- Normalize subjects for storage ---------- */
    const formattedSubjects = subjects.map(s => ({
      subjectName: s.subjectName.trim().toUpperCase(),
      rollRanges: Array.isArray(s.rollRanges)
        ? s.rollRanges.map(r => ({
            from: Number(r.from),
            to: Number(r.to)
          }))
        : [],
      individualRolls: Array.isArray(s.individualRolls)
        ? s.individualRolls.map(Number)
        : []
    }));

    /* ---------- Create examination ---------- */
    const exam = await Examination.create({
      examName: examName.trim(),
      date: new Date(date),
      durationMinutes,
      subjects: formattedSubjects
    });

    res.status(201).json({
      message: "Examination created successfully",
      exam
    });
  } catch (error) {
    console.error("createExamination error:", error.message);
    res.status(500).json({
      message: "Failed to create examination",
      error: error.message
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
