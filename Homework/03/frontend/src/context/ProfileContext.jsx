import { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/api';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  const fetchHealthProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileAPI.getHealthProfile();
      setHealthProfile(response.data.healthProfile);
      return response.data.healthProfile;
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveHealthProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileAPI.saveHealthProfile(profileData);
      setHealthProfile(response.data.healthProfile);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    healthProfile,
    loading,
    error,
    fetchHealthProfile,
    saveHealthProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
