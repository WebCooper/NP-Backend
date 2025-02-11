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


const setLive = async (req, res, io, rooms) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        // Set the quiz as live
        quiz.isLive = true;
        await quiz.save();

        // Generate a room number
        const roomId = Math.floor(1000 + Math.random() * 9000).toString();

        // Save the room in the custom rooms object
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { quizId, participants: [] });
        }

        console.log(`📢 Quiz ${quizId} is now LIVE in Room ${roomId}`);

        // Emit an event for room creation to notify the frontend or other clients
        io.emit("room-created", { roomId, quizId });

        // Send the response back to the client
        res.json({ roomId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error });
    }
};

const setNotLive = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        quiz.isLive = false;
        await quiz.save();

        res.json({ message: "Quiz is now not live" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


module.exports = { Create ,getUsersQuizes, deleteQuiz, setLive, setNotLive};
