import mongoose from "mongoose";
import dotenv  from "dotenv";

dotenv.config();

async function connectDb(){
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/videotube`);
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDb