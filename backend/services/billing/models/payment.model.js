import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        paymentId: {
            type: String,
            default: null,
        },
        signature: {
            type: String,
            default: null,
        },
        planId: {
            type: String,
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        coins: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["created", "completed", "failed"],
            default: "created",
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
