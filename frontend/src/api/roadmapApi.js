import api from './axiosInstance';

/**
 * POST /api/generate-roadmap
 * Sends profile details and optional resume as multipart/form-data.
 *
 * @param {object} profile
 * @returns {Promise<object>} response data containing generated roadmap and student profile
 */
export async function generateRoadmap(profile) {
  const formData = new FormData();
  formData.append('name',          profile.fullName);
  formData.append('email',         profile.email);
  formData.append('college',       profile.college);
  formData.append('branch',        profile.branch);
  formData.append('year',          profile.currentYear);
  formData.append('skills',        profile.skills || '');
  formData.append('careerGoal',    profile.careerGoal);
  formData.append('learningHours', Number(profile.dailyTime));

  if (profile.resumeFile) {
    formData.append('resume', profile.resumeFile);
  }

  const response = await api.post('/api/generate-roadmap', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
