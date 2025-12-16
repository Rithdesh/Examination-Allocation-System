const Examination = require("../Models/Examination");
const Hall = require("../Models/Hall");
const SeatingPlan = require("../Models/SeatingPlan");

/* -------------------------------------------------------
   Expand roll ranges + individual rolls → sorted list
------------------------------------------------------- */
function normalizeRolls({ rollRanges = [], individualRolls = [] }) {
  const rolls = [];

  for (const r of rollRanges) {
    for (let i = r.from; i <= r.to; i++) {
      rolls.push(i);
    }
  }

  for (const roll of individualRolls) {
    rolls.push(roll);
  }

  return [...new Set(rolls)].sort((a, b) => a - b);
}

/* -------------------------------------------------------
   Convert roll list → compact ranges
------------------------------------------------------- */
function rollsToRanges(rolls) {
  if (!rolls.length) return [];

  const ranges = [];
  let start = rolls[0];
  let prev = rolls[0];

  for (let i = 1; i < rolls.length; i++) {
    if (rolls[i] === prev + 1) {
      prev = rolls[i];
    } else {
      ranges.push({ from: start, to: prev, count: prev - start + 1 });
      start = rolls[i];
      prev = rolls[i];
    }
  }

  ranges.push({ from: start, to: prev, count: prev - start + 1 });
  return ranges;
}

/* -------------------------------------------------------
   CREATE SEATING ALLOCATION
------------------------------------------------------- */
exports.allocateSeating = async (req, res) => {
  try {
    const { id: examId } = req.params;

    /* ---------- Fetch examination ---------- */
    const exam = await Examination.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Examination not found" });
    }

    /* ---------- Fetch halls ---------- */
    const halls = await Hall.find().sort({ capacity: -1 });
    if (!halls.length) {
      return res.status(400).json({ message: "No halls available" });
    }

    /* ---------- Prepare subjects ---------- */
    const subjects = exam.subjects.map(s => {
      const rolls = normalizeRolls(s);
      return {
        subjectName: s.subjectName,
        queue: rolls,
        remaining: rolls.length
      };
    });

    /* ---------- Total students (BEFORE allocation) ---------- */
    const totalStudents = subjects.reduce(
      (sum, s) => sum + s.remaining,
      0
    );

    const classrooms = [];
    let hasOverflow = false;
    const overflowDetails = [];

    /* ===================================================
       CASE 1: SINGLE SUBJECT → SPLIT INTO TWO HALLS
    =================================================== */
    if (subjects.length === 1) {
      const subject = subjects[0];

      if (halls.length === 1) {
        // ⚠️ Only one hall available
        const hall = halls[0];
        const take = Math.min(hall.capacity, subject.remaining);

        const rolls = subject.queue.splice(0, take);
        subject.remaining -= rolls.length;

        classrooms.push({
          hall: hall._id,
          capacityAtAllocation: hall.capacity,
          studentsInHall: rolls.length,
          notFull: rolls.length < hall.capacity,
          allocations: [{
            subjectName: subject.subjectName,
            count: rolls.length,
            rollRanges: rollsToRanges(rolls)
          }]
        });

        hasOverflow = subject.remaining > 0;
        overflowDetails.push(
          "Single-subject exam allocated to one hall – malpractice risk"
        );

      } else {
        // ✅ Split into two halls
        const hallA = halls[0];
        const hallB = halls[1];

        const half = Math.ceil(subject.remaining / 2);

        const aCount = Math.min(half, hallA.capacity);
        const bCount = Math.min(subject.remaining - aCount, hallB.capacity);

        const aRolls = subject.queue.splice(0, aCount);
        const bRolls = subject.queue.splice(0, bCount);

        subject.remaining -= (aRolls.length + bRolls.length);

        classrooms.push(
          {
            hall: hallA._id,
            capacityAtAllocation: hallA.capacity,
            studentsInHall: aRolls.length,
            notFull: aRolls.length < hallA.capacity,
            allocations: [{
              subjectName: subject.subjectName,
              count: aRolls.length,
              rollRanges: rollsToRanges(aRolls)
            }]
          },
          {
            hall: hallB._id,
            capacityAtAllocation: hallB.capacity,
            studentsInHall: bRolls.length,
            notFull: bRolls.length < hallB.capacity,
            allocations: [{
              subjectName: subject.subjectName,
              count: bRolls.length,
              rollRanges: rollsToRanges(bRolls)
            }]
          }
        );
      }

    /* ===================================================
       CASE 2: MULTI-SUBJECT → 2–3 SUBJECT MIX
    =================================================== */
    } else {
      for (const hall of halls) {
        const active = subjects.filter(s => s.remaining > 0);
        if (active.length < 2) break;

        const mixCount = active.length >= 3 ? 3 : 2;
        const selected = active.slice(0, mixCount);

        const base = Math.floor(hall.capacity / mixCount);
        let seatsLeft = hall.capacity;

        const alloc = [];

        for (const subj of selected) {
          const take = Math.min(base, subj.remaining);
          const rolls = subj.queue.splice(0, take);

          subj.remaining -= rolls.length;
          seatsLeft -= rolls.length;

          alloc.push({ subjectName: subj.subjectName, rolls });
        }

        while (seatsLeft > 0) {
          const candidate = selected
            .filter(s => s.remaining > 0)
            .sort((a, b) => b.remaining - a.remaining)[0];

          if (!candidate) break;

          alloc.find(a => a.subjectName === candidate.subjectName)
            .rolls.push(candidate.queue.shift());

          candidate.remaining--;
          seatsLeft--;
        }

        const studentsInHall = alloc.reduce(
          (sum, a) => sum + a.rolls.length,
          0
        );

        classrooms.push({
          hall: hall._id,
          capacityAtAllocation: hall.capacity,
          studentsInHall,
          notFull: studentsInHall < hall.capacity,
          allocations: alloc.map(a => ({
            subjectName: a.subjectName,
            count: a.rolls.length,
            rollRanges: rollsToRanges(a.rolls)
          }))
        });
      }
    }

    /* ---------- Overflow ---------- */
    subjects.forEach(s => {
      if (s.remaining > 0) {
        hasOverflow = true;
        overflowDetails.push(
          `${s.remaining} students unallocated for ${s.subjectName}`
        );
      }
    });

    /* ---------- Save seating plan ----------
       hallName will be auto-filled by schema middleware
    --------------------------------------- */
    const seatingPlan = await SeatingPlan.create({
      examination: examId,
      classrooms,
      totalStudents,
      hasOverflow,
      overflowDetails
    });

    res.status(201).json({
      message: "Malpractice-safe seating allocation completed",
      seatingPlan
    });

  } catch (error) {
    console.error("Allocation error:", error);
    res.status(500).json({
      message: "Allocation failed",
      error: error.message
    });
  }
};

/* -------------------------------------------------------
   FETCH SEATING PLAN
------------------------------------------------------- */
exports.getSeatingPlanByExam = async (req, res) => {
  try {
    const { id } = req.params;

    const seatingPlan = await SeatingPlan
      .findOne({ examination: id })
      .sort({ createdAt: -1 })
      .populate("classrooms.hall", "hallName capacity");

    if (!seatingPlan) {
      return res.status(404).json({ message: "No seating plan found" });
    }

    res.status(200).json({
      message: "Seating plan fetched successfully",
      seatingPlan
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch seating plan",
      error: error.message
    });
  }
};
