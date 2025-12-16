const Examination = require("../Models/Examination");

// CREATE EXAMINATION
const createExamination = async (req, res) => {
  try {
    const {
      subject,
      department,
      semester,
      examDate,
      startTime,
      endTime,
      hall
    } = req.body;

    if (!subject || !department || !semester || !examDate || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check exam clash
    const existingExam = await Examination.findOne({
      department,
      semester,
      examDate,
      startTime
    });

    if (existingExam) {
      return res.status(409).json({ message: "Exam already scheduled at this time" });
    }

    const exam = new Examination({
      subject,
      department,
      semester,
      examDate,
      startTime,
      endTime,
      hall
    });

    await exam.save();

    res.status(201).json({
      message: "Examination created successfully",
      exam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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

// GET EXAM BY DEPARTMENT & SEMESTER
const getExaminationsByDeptAndSem = async (req, res) => {
  try {
    const { department, semester } = req.query;

    const exams = await Examination.find({
      department,
      semester
    }).populate("subject");

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

module.exports = {
  createExamination,
  getAllExaminations,
  getExaminationsByDeptAndSem,
  updateExamination,
  deleteExamination
};
