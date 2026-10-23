import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected Billing DB");
    } catch (error) {
        console.error("Billing MongoDB error:", error.message);
    }
};
