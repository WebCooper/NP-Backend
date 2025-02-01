const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserRouter = require('./routes/User');
const app = express();
app.use(cors())
app.use(express.json());
const PORT = 5000;

require('dotenv').config();

app.use("/api/user", UserRouter);
const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGO)
        console.log("Connected to DB")
    }catch(error){
        console.log(error)
    }
}

mongoose.connection.on("disconnected",()=>{
    console.log("disconnected from mongodb")
})

app.listen(PORT, (error) => {
    connectDb();
    if (!error)
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
}
);