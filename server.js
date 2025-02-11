const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

const UserRouter = require('./routes/UserRoutes.js');
const QuizRouter = require('./routes/QuizRoutes.js');
const QuestionRouter = require('./routes/QuestionRoutes.js');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

const PORT = process.env.PORT || 4001;

// CORS configuration
const corsOptions = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Disconnected from MongoDB");
});

// API Routes
app.use("/api/user", UserRouter);
app.use("/api/quiz", QuizRouter);
app.use("/api/question", QuestionRouter);

const rooms = new Map(); // Use a Map to store room data
app.set("rooms", rooms); // Make rooms accessible via req.app.get("rooms")

io.on("connection", (socket) => {
    console.log(`🔵 New client connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, username }) => {
        if (!rooms.has(roomId)) {
            // If the room doesn't exist, create it
            rooms.set(roomId, { participants: [] });
        }

        const room = rooms.get(roomId);

        // Add the user to the room
        socket.join(roomId);
        const user = { id: socket.id, username };
        room.participants.push(user);

        console.log(`👤 ${username} joined Room ${roomId}`);

        // Send updated participants list to ALL users in the room
        io.to(roomId).emit("user-joined", { participants: room.participants });
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);

        // Remove the user from all rooms
        rooms.forEach((room, roomId) => {
            room.participants = room.participants.filter(p => p.id !== socket.id);
            io.to(roomId).emit("user-joined", { participants: room.participants }); // Notify others
        });
    });
});

server.listen(PORT, async () => {
    await connectDb();
    console.log(`🚀 Server is running on port ${PORT}`);
});

