const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of choices
    correctOption: { type: Number, required: true }, // Index of correct choice
});

module.exports = mongoose.model("Question", QuestionSchema);
