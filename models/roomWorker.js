const { parentPort, workerData , threadId} = require("worker_threads");

const { roomId } = workerData;

console.log(`🧵 Worker Thread ${threadId} started for Room ${workerData.roomId}`);

let participants = [];

parentPort.on("message", (message) => {
    switch (message.type) {
        case "ADD_PARTICIPANT":
            participants.push(message.data);
            console.log(`👤 ${message.data.username} joined Room ${roomId}`);
            break;

        case "REMOVE_PARTICIPANT":
            participants = participants.filter(p => p.id !== message.data.id);
            console.log(`🚪 ${message.data.username} left Room ${roomId}`);
            break;

        case "CLOSE":
            console.log(`🛑 Closing Room ${roomId}`);
            parentPort.close();
            break;
    }
});
