const express = require("express");
const router = express.Router();
const { register, login ,getUsers} = require("../Controllers/UserController");

router.post("/register", register);
router.post("/login", login);
router.get("/getUsers", getUsers);

module.exports = router;