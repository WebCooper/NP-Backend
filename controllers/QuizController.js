const Quiz = require("../models/Quiz");

const Create = async (req, res) => {
    try {
        const { title, userId } = req.body;
        const newQuiz = new Quiz({ title, userId });
        await newQuiz.save();
        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getUsersQuizes = async (req, res) => {
    try {
        id = req.params.userId;
        const quizzes = await Quiz.find({userId: id}).exec();
        res.status(200).json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.quizId);
        res.status(200).json({ message: "Quiz deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = { Create ,getUsersQuizes, deleteQuiz};
