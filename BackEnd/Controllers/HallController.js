const Hall = require("../Models/Hall");

exports.createHall = async (req, res) => {
  try {
    const { hallName, capacity } = req.body;

    if (!hallName || !capacity) {
      return res.status(400).json({ message: "Hall name and capacity required" });
    }

    const hall = await Hall.create({ hallName, capacity });

    res.status(201).json({
      message: "Hall created successfully",
      hall,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create hall",
      error: error.message,
    });
  }
};

/* ---------------- GET ALL HALLS ---------------- */
exports.getHalls = async (req, res) => {
  try {
    const halls = await Hall.find().sort({ capacity: -1 });
    res.status(200).json(halls);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch halls",
      error: error.message,
    });
  }
};

exports.allocateStudentsToHalls = async (req, res) => {
  try {
    const { totalStudents } = req.body;

    if (!totalStudents || totalStudents <= 0) {
      return res.status(400).json({ message: "Valid totalStudents required" });
    }

    const halls = await Hall.find().sort({ capacity: -1 });

    let remainingStudents = totalStudents;
    const allocation = [];

    for (const hall of halls) {
      if (remainingStudents <= 0) break;

      const allocated = Math.min(hall.capacity, remainingStudents);
      remainingStudents -= allocated;

      allocation.push({
        hallName: hall.hallName,
        capacity: hall.capacity,
        studentsAllocated: allocated,
        seatsLeft: hall.capacity - allocated,
      });
    }

    res.status(200).json({
      totalStudents,
      allocation,
      remainingStudents, 
      hasOverflow: remainingStudents > 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Allocation failed",
      error: error.message,
    });
  }
};
