import api from "../utils/axios";

export const getResume = async () => {
  try {
    const response = await api.get("/api/resume");
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const analyzeGithubProjectApi = async ({ repoUrl, targetRole, targetJD }) => {
  const response = await api.post("/api/resume/project/analyze-github", {
    repoUrl,
    targetRole,
    targetJD,
  });
  return response.data;
};

export const generateProjectBulletsApi = async ({
  repoData,
  targetRole,
  targetJD,
  detectedTech,
  interviewAnswers,
  bulletStyle = "xyz",
}) => {
  const response = await api.post("/api/resume/project/generate-bullets", {
    repoData,
    targetRole,
    targetJD,
    detectedTech,
    interviewAnswers,
    bulletStyle,
  });
  return response.data;
};

export const polishBulletApi = async ({
  originalBullet,
  instruction,
  techStack,
  targetRole,
}) => {
  const response = await api.post("/api/resume/project/polish-bullet", {
    originalBullet,
    instruction,
    techStack,
    targetRole,
  });
  return response.data;
};


