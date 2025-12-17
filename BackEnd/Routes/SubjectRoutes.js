const express = require("express");
const router = express.Router();

const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../Controllers/SubjectController");

const {
  authenticateJWT,
  authorizeRoles,
} = require("../Middleware/Authmiddleware");

// Create subject
router.post(
  "/create",
  authenticateJWT,
  authorizeRoles("admin"),
  createSubject
);

// Get all subjects
router.get(
  "/getall",
  authenticateJWT,
  getAllSubjects
);

// Get subject by ID
router.get(
  "getbyid/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  getSubjectById
);

// Update subject
router.put(
  "update/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  updateSubject
);

// Delete subject
router.delete(
  "delete/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  deleteSubject
);

module.exports = router;
