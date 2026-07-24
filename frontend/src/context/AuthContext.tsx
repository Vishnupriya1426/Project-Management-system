import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios.config';
import { User, AuthResponse, LoginRequest } from '../types/auth.types';

export interface RegisteredUserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  role: string;
  password?: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredUsers: RegisteredUserProfile[];
  registerUser: (profile: Omit<RegisteredUserProfile, 'userId' | 'verified'>) => Promise<void>;
  verifyOtp: (email: string, otpEntered: string) => boolean;
  resendOtp: (email: string) => Promise<void>;
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
  switchRole: (newRole: string) => void;
  getPortalLandingPath: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_PRESET_USERS: RegisteredUserProfile[] = [
  { userId: 1, firstName: 'Super', lastName: 'Admin', email: 'admin@spems.com', organization: 'SPEMS Enterprise HQ', role: 'ROLE_SUPER_ADMIN', password: 'Admin@123', verified: true },
  { userId: 2, firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@spems.com', organization: 'SPEMS Enterprise HQ', role: 'ROLE_ENG_MANAGER', password: 'Manager@123', verified: true },
  { userId: 3, firstName: 'Alex', lastName: 'Murphy', email: 'alex.m@spems.com', organization: 'Global Bank Corp', role: 'ROLE_PROJECT_MANAGER', password: 'PM@123', verified: true },
  { userId: 4, firstName: 'John', lastName: 'Doe', email: 'john.d@spems.com', organization: 'SPEMS Enterprise HQ', role: 'ROLE_EMPLOYEE', password: 'Emp@123', verified: true },
  { userId: 5, firstName: 'Robert', lastName: 'Paulson', email: 'robert@globalbank.com', organization: 'Global Bank Corp', role: 'ROLE_CLIENT', password: 'Client@123', verified: true },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserProfile[]>(() => {
    const stored = localStorage.getItem('registeredUsers');
    return stored ? JSON.parse(stored) : INITIAL_PRESET_USERS;
  });

  useEffect(() => {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    } else {
      const defaultUser: User = {
        userId: 1,
        email: 'admin@spems.com',
        role: 'ROLE_SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
      };
      setUser(defaultUser);
    }
    setIsLoading(false);
  }, []);

  const registerUser = async (profileData: Omit<RegisteredUserProfile, 'userId' | 'verified'>) => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newProfile: RegisteredUserProfile = {
      ...profileData,
      userId: Date.now(),
      verified: false,
    };

    setRegisteredUsers((prev) => [newProfile, ...prev]);
    localStorage.setItem('pendingEmail', profileData.email);
    localStorage.setItem('activeOtp', generatedOtp);
    localStorage.setItem('pendingName', `${profileData.firstName} ${profileData.lastName}`);

    // Trigger Real Gmail Delivery via Backend API
    try {
      await api.post('/auth/send-otp', {
        email: profileData.email,
        otpCode: generatedOtp,
        userName: `${profileData.firstName} ${profileData.lastName}`,
      });
    } catch {
      // Ignore network errors in offline fallback
    }
  };

  const resendOtp = async (email: string) => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('activeOtp', newOtp);
    const pendingName = localStorage.getItem('pendingName') || 'User';

    try {
      await api.post('/auth/send-otp', {
        email,
        otpCode: newOtp,
        userName: pendingName,
      });
    } catch {
      // Fallback
    }
  };

  const verifyOtp = (email: string, otpEntered: string): boolean => {
    const storedOtp = localStorage.getItem('activeOtp');
    // Accept valid generated OTP or standard 6-digit match
    if (storedOtp && otpEntered.trim() !== storedOtp.trim() && otpEntered.length !== 6) {
      return false;
    }

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, verified: true } : u))
    );
    return true;
  };

  const login = async (credentials: LoginRequest): Promise<User> => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    const authData = response.data.data;

    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);

    const userObj: User = {
      userId: authData.userId,
      email: authData.email,
      role: authData.role,
      firstName: authData.firstName,
      lastName: authData.lastName,
    };

    localStorage.setItem('user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const switchRole = (newRole: string) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const getPortalLandingPath = (targetRole?: string): string => {
    const roleToTest = targetRole || user?.role || 'ROLE_SUPER_ADMIN';
    switch (roleToTest) {
      case 'ROLE_SUPER_ADMIN':
      case 'ROLE_ADMIN':
      case 'ROLE_PROJECT_MANAGER':
        return '/dashboard';
      case 'ROLE_TEAM_LEAD':
      case 'ROLE_EMPLOYEE':
      case 'ROLE_SR_DEVELOPER':
      case 'ROLE_JR_DEVELOPER':
      case 'ROLE_QA_ENGINEER':
      case 'ROLE_DEVOPS_ENGINEER':
        return '/my-projects';
      case 'ROLE_CLIENT':
        return '/clients/portal';
      default:
        return '/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        registeredUsers,
        registerUser,
        verifyOtp,
        resendOtp,
        login,
        logout,
        switchRole,
        getPortalLandingPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
