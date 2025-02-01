const express = require("express");
const { Register, Login } = require("../controllers/user");
const router = express.Router();

// for user login and signup and profile update and delete
router.post("/login", Login);
router.post("/register", Register);

module.exports = router;