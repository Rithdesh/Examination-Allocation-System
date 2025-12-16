const express = require('express');
const router = express.Router();
const {
  createExamination,
  getAllExaminations,
  getExaminationById,
  updateExamination,
  deleteExamination,
} = require('../Controllers/ExaminationController');

const {authenticateToken,authorizeRoles} = require('../Middleware/AuthMiddleware');

router.post('exam/', authenticateToken, authorizeRoles(['admin']), createExamination);
router.get('exam/', authenticateToken, authorizeRoles(['admin']), getAllExaminations);
router.get('exam/:id', authenticateToken, authorizeRoles(['admin']), getExaminationById);
router.put('exam/:id', authenticateToken, authorizeRoles(['admin']), updateExamination);
router.delete('exam/:id', authenticateToken, authorizeRoles(['admin']), deleteExamination);

module.exports = router;
