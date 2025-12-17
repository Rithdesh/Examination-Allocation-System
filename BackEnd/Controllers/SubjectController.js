const Subject = require("../Models/Subject");

/* -------- CREATE SUBJECT -------- */
exports.createSubject = async (req, res) => {
  try {
    let { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Subject name is required" });
    }
    
    const existing = await Subject.findOne({
      name: name.trim().toUpperCase(),
    });
    name = name.trim().toUpperCase();
    if (existing) {
      return res.status(409).json({ message: "Subject already exists" });
    }

    const subject = await Subject.create({ name, code });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject", error: error.message });
  }
};

/* -------- GET ALL SUBJECTS -------- */
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects", error: error.message });
  }
};

/* -------- GET SUBJECT BY ID -------- */
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subject", error: error.message });
  }
};

/* -------- UPDATE SUBJECT -------- */
exports.updateSubject = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.name) {
      updates.name = updates.name.trim().toUpperCase();
    }
    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update subject", error: error.message });
  }
};

/* -------- DELETE SUBJECT -------- */
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subject", error: error.message });
  }
};
