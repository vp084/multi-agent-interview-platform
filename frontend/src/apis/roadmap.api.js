import api from "../utils/axios";

export const generateRoadmap = async (data) => {
  try {
    const response = await api.post("/api/roadmap/generate", data);
    return response.data;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to generate roadmap",
    };
  }
};

export const getAllRoadmaps = async () => {
  try {
    const response = await api.get("/api/roadmap/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return {
      success: false,
      roadmaps: [],
      message: error.response?.data?.message || "Failed to fetch roadmaps",
    };
  }
};

export const getRoadmapById = async (id) => {
  try {
    const response = await api.get(`/api/roadmap/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return {
      success: false,
      roadmap: null,
      message: error.response?.data?.message || "Failed to fetch roadmap",
    };
  }
};

export const updateModuleStatus = async (roadmapId, moduleId, status) => {
  try {
    const response = await api.patch(
      `/api/roadmap/${roadmapId}/module/${moduleId}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating module status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update module status",
    };
  }
};

export const deleteRoadmap = async (roadmapId) => {
  try {
    const response = await api.delete(`/api/roadmap/${roadmapId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete roadmap",
    };
  }
};
