import api from "../utils/axios";

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/me");
        return response.data;
    } catch (error) {
        return null;
    }
};

export const useCoins = async (data) => {
    try {
        const payload = typeof data === "number" ? { coins: data } : data;
        const response = await api.post("/api/auth/use-coins", payload);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
