const express = require('express');
const router = express.Router();

const {
  createExamination,
  getAllExaminations,
  updateExamination,
  deleteExamination,
} = require('../Controllers/ExaminationController');

const {
  allocateSeating,
  getSeatingPlanByExam
} = require('../Controllers/AllocationController');

const {
  authenticateJWT,
  authorizeRoles
} = require('../Middleware/Authmiddleware');

const { exportSeatingPlanPDF } = require("../Controllers/PdfController");

// Examination CRUD
router.post('/create', authenticateJWT, authorizeRoles('admin'), createExamination);
router.get('/getall', authenticateJWT, authorizeRoles('admin'), getAllExaminations);
router.put('/update/:id', authenticateJWT, authorizeRoles('admin'), updateExamination);
router.delete('/delete/:id', authenticateJWT, authorizeRoles('admin'), deleteExamination);

// Seating allocation
router.post('/allocate/:id', authenticateJWT, authorizeRoles('admin'), allocateSeating);
router.get("/seatingplan/:id",authenticateJWT, authorizeRoles("admin"),getSeatingPlanByExam);

// Export seating plan as PDF
router.get("/exportpdf/:id", authenticateJWT, authorizeRoles("admin"), exportSeatingPlanPDF);

module.exports = router;
