import { createContext, useContext, useState } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [roadmap,  setRoadmap]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState(null);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, roadmap, setRoadmap, loading, setLoading, apiError, setApiError }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
