import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID?.trim();
    const key_secret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!key_id || !key_secret || key_id === "rzp_test_placeholder" || key_secret === "rzp_secret_placeholder") {
        return null;
    }

    try {
        return new Razorpay({
            key_id,
            key_secret,
        });
    } catch (err) {
        console.error("Failed to initialize Razorpay instance:", err.message);
        return null;
    }
};
