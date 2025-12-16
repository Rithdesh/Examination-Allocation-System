const Examination = require("../Models/Examination");
const Hall = require("../Models/Hall");
const SeatingPlan = require("../Models/SeatingPlan");

/* ---------- normalize roll ranges + individuals ---------- */
function normalizeRolls({ rollRanges = [], individualRolls = [] }) {
  const rolls = [];

  for (const r of rollRanges) {
    for (let i = r.from; i <= r.to; i++) rolls.push(i);
  }

  for (const roll of individualRolls) rolls.push(roll);

  return [...new Set(rolls)].sort((a, b) => a - b);
}

/* ---------- rolls → compact ranges ---------- */
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

/* ---------- MAIN ALLOCATION ---------- */
exports.allocateSeating = async (req, res) => {
  try {
    const { id: examId } = req.params;

    const exam = await Examination.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Examination not found" });
    }

    const halls = await Hall.find().sort({ capacity: -1 });
    if (!halls.length) {
      return res.status(400).json({ message: "No halls available" });
    }

    /* prepare subject queues */
    const subjects = exam.subjects.map(s => ({
      subjectName: s.subjectName,
      queue: normalizeRolls(s),
      remaining: 0,
    }));

    subjects.forEach(s => (s.remaining = s.queue.length));

    const classrooms = [];
    let hasOverflow = false;
    const overflowDetails = [];

    /* allocate hall by hall */
    for (const hall of halls) {
      const active = subjects.filter(s => s.remaining > 0);
      if (active.length < 2) break;

      // decide how many subjects to mix (2 or 3)
      const mixCount = active.length >= 3 ? 3 : 2;
      const selected = active.slice(0, mixCount);

      const baseShare = Math.floor(hall.capacity / mixCount);
      let seatsLeft = hall.capacity;

      const allocations = [];

      // base allocation
      for (const subj of selected) {
        const take = Math.min(baseShare, subj.remaining);
        const rolls = subj.queue.splice(0, take);

        subj.remaining -= rolls.length;
        seatsLeft -= rolls.length;

        allocations.push({
          subjectName: subj.subjectName,
          rolls,
        });
      }

      // distribute remaining seats safely
      while (seatsLeft > 0) {
        const candidate = selected
          .filter(s => s.remaining > 0)
          .sort((a, b) => b.remaining - a.remaining)[0];

        if (!candidate) break;

        const roll = candidate.queue.shift();
        candidate.remaining--;

        const target = allocations.find(
          a => a.subjectName === candidate.subjectName
        );
        target.rolls.push(roll);

        seatsLeft--;
      }

      const studentsInHall = allocations.reduce(
        (sum, a) => sum + a.rolls.length,
        0
      );

      classrooms.push({
        hall: hall._id,
        hallName: hall.hallName,
        capacityAtAllocation: hall.capacity,
        studentsInHall,
        notFull: studentsInHall < hall.capacity,
        allocations: allocations.map(a => ({
          subjectName: a.subjectName,
          count: a.rolls.length,
          rollRanges: rollsToRanges(a.rolls),
        })),
      });
    }

    /* overflow detection */
    subjects.forEach(s => {
      if (s.remaining > 0) {
        hasOverflow = true;
        overflowDetails.push(
          `${s.remaining} students unallocated for ${s.subjectName}`
        );
      }
    });

    const totalStudents = subjects.reduce(
      (sum, s) => sum + s.queue.length + s.remaining,
      0
    );

    const plan = await SeatingPlan.create({
      examination: examId,
      classrooms,
      totalStudents,
      hasOverflow,
      overflowDetails,
    });

    res.status(201).json({
      message: "Malpractice-safe seating allocation completed",
      seatingPlan: plan,
    });
  } catch (error) {
    console.error("Allocation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
