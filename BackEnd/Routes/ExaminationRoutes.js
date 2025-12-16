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
} = require('../Controllers/AllocationController');

const {
  authenticateJWT,
  authorizeRoles
} = require('../Middleware/Authmiddleware');

// Examination CRUD
router.post('/create', authenticateJWT, authorizeRoles('admin'), createExamination);
router.get('/getall', authenticateJWT, authorizeRoles('admin'), getAllExaminations);
router.put('/update/:id', authenticateJWT, authorizeRoles('admin'), updateExamination);
router.delete('/delete/:id', authenticateJWT, authorizeRoles('admin'), deleteExamination);

// Seating allocation
router.post('/:id/allocate', authenticateJWT, authorizeRoles('admin'), allocateSeating);

module.exports = router;
