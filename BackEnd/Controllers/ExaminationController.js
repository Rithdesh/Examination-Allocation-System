const Examination = require("../Models/Examination");

// CREATE EXAMINATION
const createExamination = async (req, res) => {
  try {
    const {
      examname,
      date,
      subject,
      duration,
      hall
      
    } = req.body;

    if (!subject || !hall || !duration || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check exam clash
    const existingExam = await Examination.findOne({
      date,
      subject,
      duration,
      hall
    });

    if (existingExam) {
      return res.status(409).json({ message: "Exam already scheduled at this time" });
    }

    const exam = new Examination({
      date,
      subject,
      duration,
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
  updateExamination,
  deleteExamination
};
