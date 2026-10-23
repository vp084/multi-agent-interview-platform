import api from "../utils/axios";

export const getBillingPlans = async () => {
  try {
    const response = await api.get("/api/billing/plans");
    return response.data;
  } catch (error) {
    console.error("Error fetching billing plans:", error);
    return {
      success: false,
      plans: [],
      message: error.response?.data?.message || "Failed to fetch plans",
    };
  }
};

export const getRazorpayKey = async () => {
  try {
    const response = await api.get("/api/billing/key");
    return response.data;
  } catch (error) {
    console.error("Error fetching Razorpay key:", error);
    return {
      success: false,
      key: null,
      isConfigured: false,
    };
  }
};

export const createOrder = async (planId) => {
  try {
    const response = await api.post("/api/billing/order", { planId });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create order",
    };
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post("/api/billing/verify", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Payment verification failed",
    };
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await api.get("/api/billing/history");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return {
      success: false,
      payments: [],
      message: error.response?.data?.message || "Failed to fetch transaction history",
    };
  }
};
