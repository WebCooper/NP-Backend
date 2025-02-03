const express = require("express");
const Quiz = require("../models/Quiz");
const {Create, getUsersQuizes, deleteQuiz} = require("../controllers/QuizController");

const router = express.Router();

// Create a new quiz
router.post("/create", Create);
// Get all quizzes for a teacher
router.get("/user/:userId", getUsersQuizes);

// Delete a quiz
router.delete("/:quizId",deleteQuiz);

module.exports = router;
