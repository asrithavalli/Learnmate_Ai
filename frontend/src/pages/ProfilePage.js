import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentProfile from '../components/StudentProfile/StudentProfile';
import { useProfile } from '../context/ProfileContext';
import { generateRoadmap } from '../api/roadmapApi';

function ProfilePage() {
  const { setProfile, setRoadmap, setLoading, setApiError } = useProfile();
  const navigate = useNavigate();

  const handleSubmit = async (profileData) => {
    setApiError(null);
    setLoading(true);

    try {
      const response = await generateRoadmap(profileData);
      
      // Save profile to context
      setProfile(response.profile);
      // Save roadmap to context
      setRoadmap(response.data);
      
      // Save email in localStorage for persistent logins/retrieve
      localStorage.setItem('learnmate_email', profileData.email.toLowerCase().trim());
      
      navigate('/roadmap');
    } catch (err) {
      const message =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        'Something went wrong. Please try again.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return <StudentProfile onSubmit={handleSubmit} />;
}

export default ProfilePage;
