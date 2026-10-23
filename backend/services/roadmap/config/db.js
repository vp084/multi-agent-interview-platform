import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected Roadmap DB");
    } catch (error) {
        console.log("Roadmap MongoDB error", error);
    }
};
