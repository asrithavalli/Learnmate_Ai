import api from './axiosInstance';

export async function generateQuiz(roadmap) {
  const response = await api.post('/api/generate-quiz', {
    careerGoal:        roadmap.careerGoal,
    skillGaps:         roadmap.skillGaps         || [],
    recommendedSkills: roadmap.recommendedSkills  || [],
  });
  return response.data.data;
}
