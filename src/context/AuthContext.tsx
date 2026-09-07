import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, logoutUser } from '../firebase/auth';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isBroker: boolean;
  isClient: boolean;
  loginAsTestAdmin: () => void;
  logout: () => Promise<void>;
}

const mockTestAdminUser = {
  uid: 'test-admin-uid-123456',
  email: 'admin@eliteimoveis.com',
  displayName: 'Administrador (Teste)',
  emailVerified: true,
  isAnonymous: false,
} as unknown as FirebaseUser;

const mockTestAdminProfile: UserProfile = {
  id: 'test-admin-uid-123456',
  name: 'Administrador (Teste)',
  email: 'admin@eliteimoveis.com',
  role: 'ADMIN',
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  isBroker: false,
  isClient: false,
  loginAsTestAdmin: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if test admin is saved in localStorage
    const savedTestAdmin = localStorage.getItem('elite_test_admin');
    if (savedTestAdmin === 'true') {
      setCurrentUser(mockTestAdminUser);
      setUserProfile(mockTestAdminProfile);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If we are currently in test admin mode, do not overwrite unless user logged into real firebase
      if (!user && localStorage.getItem('elite_test_admin') === 'true') {
        setCurrentUser(mockTestAdminUser);
        setUserProfile(mockTestAdminProfile);
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      if (user) {
        localStorage.removeItem('elite_test_admin');
        const profile = await getUserProfile(user.uid);
        // If email is an admin email, ensure admin role
        const isAdminEmail = user.email?.toLowerCase().includes('admin') || user.email?.toLowerCase() === 'leandrojaspion19@gmail.com';
        if (profile) {
          if (isAdminEmail && profile.role !== 'ADMIN') {
            profile.role = 'ADMIN';
          }
          setUserProfile(profile);
        } else {
          setUserProfile({
            id: user.uid,
            name: user.displayName || (isAdminEmail ? 'Administrador Teste' : 'Usuário'),
            email: user.email || '',
            role: isAdminEmail ? 'ADMIN' : 'CLIENTE',
            active: true,
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginAsTestAdmin = () => {
    localStorage.setItem('elite_test_admin', 'true');
    setCurrentUser(mockTestAdminUser);
    setUserProfile(mockTestAdminProfile);
  };

  const logout = async () => {
    localStorage.removeItem('elite_test_admin');
    setCurrentUser(null);
    setUserProfile(null);
    await logoutUser();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin: userProfile?.role === 'ADMIN',
    isBroker: userProfile?.role === 'CORRETOR',
    isClient: userProfile?.role === 'CLIENTE',
    loginAsTestAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
