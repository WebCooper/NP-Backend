const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const UserRouter = require('./routes/UserRoutes.js');
const QuizRouter = require('./routes/QuizRoutes.js');
const QuestionRouter = require('./routes/QuestionRoutes.js');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4001;

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Exit process if MongoDB connection fails
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Disconnected from MongoDB");
});

// API Routes
app.use("/api/user", UserRouter);
app.use("/api/quiz", QuizRouter);
app.use("/api/question", QuestionRouter);

// Start the Server
app.listen(PORT, async () => {
    await connectDb();
    console.log(`🚀 Server is running on port ${PORT}`);
});
