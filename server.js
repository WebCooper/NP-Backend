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
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
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

const rooms = new Map();
const roomWorkers = new Map(); // Store room workers

app.set("rooms", rooms);
app.set("roomWorkers", roomWorkers);

io.on("connection", (socket) => {
    console.log(`🔵 New client connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, username }) => {
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { participants: [], quizId: null });
        }

        const room = rooms.get(roomId);
        const user = { id: socket.id, username };
        room.participants.push(user);
        socket.join(roomId);

        console.log(`👤 ${username} joined Room ${roomId}`);

        let threadId = null;
        if (roomWorkers.has(roomId)) {
            const worker = roomWorkers.get(roomId);
            threadId = worker.threadId;
        }

        io.to(roomId).emit("room-details", {
            quizId: room.quizId,
            threadId: threadId,
            hostId: room.hostId,
        });

        io.to(roomId).emit("user-joined", { participants: room.participants });
    });


    socket.on("disconnect", () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);

        rooms.forEach((room, roomId) => {
            room.participants = room.participants.filter(p => p.id !== socket.id);
            io.to(roomId).emit("user-joined", { participants: room.participants });

            // Notify the worker thread
            if (roomWorkers.has(roomId)) {
                roomWorkers.get(roomId).postMessage({
                    type: "REMOVE_PARTICIPANT",
                    data: { id: socket.id },
                });
            }
        });
    });
});

server.listen(PORT, async () => {
    await connectDb();
    console.log(`🚀 Server is running on port ${PORT}`);
});

