const PDFDocument = require("pdfkit");
const SeatingPlan = require("../Models/SeatingPlan");
const Examination = require("../Models/Examination");

exports.exportSeatingPlanPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const seatingPlan = await SeatingPlan.findOne({ examination: id })
      .sort({ createdAt: -1 });

    const exam = await Examination.findById(id);

    if (!seatingPlan || !exam) {
      return res.status(404).json({ message: "Seating plan not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=SeatingPlan_${exam.examName}.pdf`
    );

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    /* ---------- HEADER ---------- */
    doc.fontSize(14).text("OFFICE OF THE CONTROLLER OF EXAMINATIONS", {
      align: "center",
    });
    doc.moveDown(0.5);
    doc.fontSize(12).text("Sri Eshwar College of Engineering", {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(11).text(
      `${exam.examName} – ${exam.date.toDateString()}`,
      { align: "center" }
    );

    doc.moveDown(1.5);

    /* ---------- TABLE ---------- */
    doc.fontSize(10).text(
      "S.No   Hall     Subject                  Register Numbers           Count"
    );
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    let i = 1;
    let total = 0;

    seatingPlan.classrooms.forEach(room => {
      room.allocations.forEach(alloc => {
        alloc.rollRanges.forEach(range => {
          const rangeText =
            range.from === range.to
              ? range.from
              : `${range.from} - ${range.to}`;

          doc.text(
            `${i.toString().padEnd(5)} ` +
              `${room.hallName.padEnd(8)} ` +
              `${alloc.subjectName.padEnd(24)} ` +
              `${rangeText.toString().padEnd(28)} ` +
              `${range.count}`
          );

          i++;
          total += range.count;
        });
      });
    });

    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();
    doc.fontSize(11).text(
      `Total Students: ${total}`,
      { align: "right" }
    );

    doc.moveDown(2);
    doc.text("CONTROLLER OF EXAMINATIONS", { align: "right" });
    console.log("PDF generated successfully");

    doc.end();
  } catch (error) {
    console.error("PDF error:", error);
    res.status(500).json({ message: "PDF generation failed" });
  }
};
