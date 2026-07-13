import axios from 'axios';

/**
 * POST /api/generate-quiz
 *
 * @param {{ careerGoal: string, skillGaps: Array, recommendedSkills: Array }} roadmap
 * @returns {Promise<{ careerGoal: string, generatedBy: string, questions: Array }>}
 */
export async function generateQuiz(roadmap) {
  const response = await axios.post('/api/generate-quiz', {
    careerGoal:        roadmap.careerGoal,
    skillGaps:         roadmap.skillGaps         || [],
    recommendedSkills: roadmap.recommendedSkills  || [],
  });
  return response.data.data;
}
