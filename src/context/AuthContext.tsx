import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth } from '../services/firebase';

export const COACH_CREDENTIALS = {
  email: 'bflfitness@gmail.com',
  password: '123456'
};

export const ADMIN_CREDENTIALS = {
  email: 'admin@bflfitness.com',
  password: '123456'
};

export const ADMIN_MASS_CREDENTIALS = {
  email: 'mass@bflfitness.com',
  password: '123456'
};

export const ADMIN_POUYA_CREDENTIALS = {
  email: 'pouya@bflfitness.com',
  password: '123456'
};

export const ADMIN_MASS_PROFILE: UserProfile = {
  id: 'admin_mass_narimanian',
  uid: 'admin_mass_narimanian',
  email: 'mass@bflfitness.com',
  displayName: 'Mass Narimanian (Founder & Admin)',
  role: 'admin',
  photoURL: '/assets/founders/mass-gym.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  hasCompletedIntake: true,
  coachId: 'admin_mass_narimanian'
};

export const ADMIN_POUYA_PROFILE: UserProfile = {
  id: 'admin_pouya_marghzari',
  uid: 'admin_pouya_marghzari',
  email: 'pouya@bflfitness.com',
  displayName: 'Pouya Marghzari (Founder & Admin)',
  role: 'admin',
  photoURL: '/assets/founders/pouya-boxing.jpg',
  createdAt: '2024-01-01T00:00:00Z',
  hasCompletedIntake: true,
  coachId: 'admin_pouya_marghzari'
};

export const ADMIN_PROFILE: UserProfile = ADMIN_MASS_PROFILE;

export const COACH_MARCUS_PROFILE: UserProfile = {
  id: 'coach_marcus_vance',
  uid: 'coach_marcus_vance',
  email: 'bflfitness@gmail.com',
  displayName: 'Coach Marcus Vance',
  role: 'coach',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  createdAt: '2025-01-01T00:00:00Z',
  hasCompletedIntake: true,
  coachId: 'coach_marcus_vance'
};

export const HEAD_COACH_PROFILE = COACH_MARCUS_PROFILE;

export const COACH_SARAH_PROFILE: UserProfile = {
  id: 'coach_sarah_jenkins',
  uid: 'coach_sarah_jenkins',
  email: 'sarah.bflfitness@gmail.com',
  displayName: 'Coach Sarah Jenkins',
  role: 'coach',
  photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  createdAt: '2025-01-01T00:00:00Z',
  hasCompletedIntake: true,
  coachId: 'coach_sarah_jenkins'
};

export interface RegisteredClientAccount {
  uid: string;
  email: string;
  password: string;
  name: string;
  role: 'client';
  createdAt: string;
  planId?: string;
  hasCompletedIntake: boolean;
  photoURL?: string;
  assignedCoachId?: string;
  primaryGoal?: string;
}

const SEED_CLIENTS: RegisteredClientAccount[] = [
  {
    uid: 'client_alex',
    email: 'alex.rivera@example.com',
    password: 'password123',
    name: 'Alex Rivera',
    role: 'client',
    createdAt: '2026-02-15T00:00:00Z',
    planId: 'plan_elite',
    hasCompletedIntake: true,
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    assignedCoachId: 'admin_mass_narimanian',
    primaryGoal: 'recomp'
  },
  {
    uid: 'client_jordan',
    email: 'jordan.lee@example.com',
    password: 'password123',
    name: 'Jordan Lee',
    role: 'client',
    createdAt: '2026-02-01T00:00:00Z',
    planId: 'plan_lifestyle',
    hasCompletedIntake: true,
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    assignedCoachId: 'admin_pouya_marghzari',
    primaryGoal: 'fat_loss'
  }
];

interface AuthContextType {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (email: string, pass: string, name: string, role?: UserRole, planId?: string, primaryGoal?: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  loginAsDemo: (role: 'coach' | 'client' | 'admin', specificAdmin?: 'mass' | 'pouya') => void;
  switchRole: (role: 'admin' | 'coach' | 'client', specificAdmin?: 'mass' | 'pouya') => void;
  switchAdminUser: (adminId: 'admin_mass_narimanian' | 'admin_pouya_marghzari') => void;
  toggleRole: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeIntake: () => void;
  registeredClients: RegisteredClientAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'bfl_auth_user_v1';
const CLIENTS_STORAGE_KEY = 'bfl_registered_clients_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store registered clients in persistent localStorage
  const [registeredClients, setRegisteredClients] = useState<RegisteredClientAccount[]>(() => {
    try {
      const saved = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return SEED_CLIENTS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  // Sync active user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Sync registered clients to localStorage
  useEffect(() => {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(registeredClients));
  }, [registeredClients]);

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPass = pass.trim();

      if (!normalizedEmail) {
        throw new Error('Email address is required.');
      }
      if (!normalizedPass) {
        throw new Error('Password is required.');
      }

      // 1. ADMIN & COACH AUTHENTICATION (HARDCODED BYPASS)
      if (
        normalizedEmail === ADMIN_MASS_CREDENTIALS.email.toLowerCase() ||
        normalizedEmail === 'mass.narimanian@bflfitness.com'
      ) {
        if (normalizedPass === ADMIN_MASS_CREDENTIALS.password || normalizedPass === 'password123') {
          setUser(ADMIN_MASS_PROFILE);
          return ADMIN_MASS_PROFILE;
        } else {
          throw new Error('Incorrect password for Mass Narimanian.');
        }
      }

      if (
        normalizedEmail === ADMIN_POUYA_CREDENTIALS.email.toLowerCase() ||
        normalizedEmail === 'pouya.marghzari@bflfitness.com'
      ) {
        if (normalizedPass === ADMIN_POUYA_CREDENTIALS.password || normalizedPass === 'password123') {
          setUser(ADMIN_POUYA_PROFILE);
          return ADMIN_POUYA_PROFILE;
        } else {
          throw new Error('Incorrect password for Pouya Marghzari.');
        }
      }

      if (normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
        if (normalizedPass === ADMIN_CREDENTIALS.password || normalizedPass === 'password123') {
          setUser(ADMIN_MASS_PROFILE);
          return ADMIN_MASS_PROFILE;
        } else {
          throw new Error('Incorrect password for Administrator account.');
        }
      }

      // Check if credentials match Coach bflfitness@gmail.com / 123456
      if (normalizedEmail === COACH_CREDENTIALS.email.toLowerCase()) {
        if (normalizedPass === COACH_CREDENTIALS.password) {
          setUser(COACH_MARCUS_PROFILE);
          return COACH_MARCUS_PROFILE;
        } else {
          throw new Error('Incorrect password for Coach Marcus Vance. Please check your credentials.');
        }
      }

      // 2. CLIENT AUTHENTICATION (STANDARD FLOW)
      // Clients must explicitly register before they can log in
      const matchedClient = registeredClients.find(
        (c) => c.email.trim().toLowerCase() === normalizedEmail
      );

      if (!matchedClient) {
        throw new Error(
          'No client account found for this email. Clients must register before logging in.'
        );
      }

      if (matchedClient.password !== normalizedPass) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }

      const clientProfile: UserProfile = {
        uid: matchedClient.uid,
        email: matchedClient.email,
        displayName: matchedClient.name,
        role: 'client',
        photoURL: matchedClient.photoURL,
        createdAt: matchedClient.createdAt,
        assignedCoachId: matchedClient.assignedCoachId || 'coach_marcus_vance',
        activePlanId: matchedClient.planId || 'plan_elite',
        hasCompletedIntake: matchedClient.hasCompletedIntake
      };

      setUser(clientProfile);
      return clientProfile;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole = 'client',
    planId?: string,
    primaryGoal?: string
  ): Promise<UserProfile> => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPass = pass.trim();
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Please enter your full name.');
      }
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Please provide a valid email address.');
      }
      if (normalizedPass.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Disallow client registration using coach email
      if (normalizedEmail === COACH_CREDENTIALS.email.toLowerCase()) {
        throw new Error(
          'bflfitness@gmail.com is reserved for the coaching staff. Please use the Sign In tab.'
        );
      }

      // Check if client account already exists
      const existing = registeredClients.find(
        (c) => c.email.trim().toLowerCase() === normalizedEmail
      );
      if (existing) {
        throw new Error('An account with this email is already registered. Please sign in instead.');
      }

      // Create new client record
      const newAccount: RegisteredClientAccount = {
        uid: 'client_' + Date.now(),
        email: normalizedEmail,
        password: normalizedPass,
        name: trimmedName,
        role: 'client',
        createdAt: new Date().toISOString(),
        planId: planId || 'plan_elite',
        hasCompletedIntake: false,
        assignedCoachId: 'coach_marcus_vance',
        primaryGoal: primaryGoal || 'hypertrophy'
      };

      // Add to registered clients store
      setRegisteredClients((prev) => [...prev, newAccount]);

      // Synchronize into Coach roster in localStorage if available
      try {
        const rosterRaw = localStorage.getItem('bfl_clients');
        if (rosterRaw) {
          const roster = JSON.parse(rosterRaw);
          if (!roster.some((r: any) => r.email?.toLowerCase() === normalizedEmail)) {
            roster.unshift({
              id: newAccount.uid,
              name: newAccount.name,
              email: newAccount.email,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              status: 'active',
              planName: planId === 'plan_lifestyle' ? 'Lifestyle Fitness' : '1-on-1 Elite Coaching',
              adherenceRate: 100,
              joinedDate: new Date().toISOString().split('T')[0],
              primaryGoal: primaryGoal || 'Muscle Hypertrophy',
              startingWeightKg: 78,
              currentWeightKg: 78,
              targetWeightKg: 74,
              daysPerWeek: 4
            });
            localStorage.setItem('bfl_clients', JSON.stringify(roster));
          }
        }
      } catch {
        // ignore
      }

      const clientProfile: UserProfile = {
        uid: newAccount.uid,
        email: newAccount.email,
        displayName: newAccount.name,
        role: 'client',
        createdAt: newAccount.createdAt,
        assignedCoachId: 'coach_marcus_vance',
        activePlanId: newAccount.planId,
        hasCompletedIntake: false
      };

      setUser(clientProfile);
      return clientProfile;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (auth) {
        try {
          await auth.signOut();
        } catch {
          // ignore
        }
      }
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (demoRole: 'coach' | 'client' | 'admin', specificAdmin?: 'mass' | 'pouya') => {
    if (demoRole === 'admin') {
      if (specificAdmin === 'pouya') {
        setUser(ADMIN_POUYA_PROFILE);
      } else {
        setUser(ADMIN_MASS_PROFILE);
      }
    } else if (demoRole === 'coach') {
      setUser(HEAD_COACH_PROFILE);
    } else {
      const alexClient = registeredClients.find(c => c.email === 'alex.rivera@example.com') || SEED_CLIENTS[0];
      const clientProfile: UserProfile = {
        id: alexClient.uid,
        uid: alexClient.uid,
        email: alexClient.email,
        displayName: alexClient.name,
        role: 'client',
        photoURL: alexClient.photoURL,
        createdAt: alexClient.createdAt,
        assignedCoachId: 'admin_mass_narimanian',
        coachId: 'admin_mass_narimanian',
        activePlanId: 'plan_elite',
        hasCompletedIntake: true
      };
      setUser(clientProfile);
    }
  };

  const switchRole = (newRole: 'admin' | 'coach' | 'client', specificAdmin?: 'mass' | 'pouya') => {
    if (newRole === 'admin') {
      if (specificAdmin === 'pouya') {
        setUser(ADMIN_POUYA_PROFILE);
      } else {
        setUser(ADMIN_MASS_PROFILE);
      }
    } else if (newRole === 'coach') {
      setUser(HEAD_COACH_PROFILE);
    } else {
      loginAsDemo('client');
    }
  };

  const switchAdminUser = (adminId: 'admin_mass_narimanian' | 'admin_pouya_marghzari') => {
    if (adminId === 'admin_pouya_marghzari') {
      setUser(ADMIN_POUYA_PROFILE);
    } else {
      setUser(ADMIN_MASS_PROFILE);
    }
  };

  const toggleRole = () => {
    if (user?.role === 'admin') {
      setUser(HEAD_COACH_PROFILE);
    } else {
      setUser(ADMIN_MASS_PROFILE);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const completeIntake = () => {
    setUser((prev) => (prev ? { ...prev, hasCompletedIntake: true } : null));
    // Also mark intake as completed in registered clients list
    if (user) {
      setRegisteredClients((prev) =>
        prev.map((c) =>
          c.uid === user.uid || c.email === user.email
            ? { ...c, hasCompletedIntake: true }
            : c
        )
      );
    }
  };

  const currentUser: UserProfile | null = user
    ? {
        ...user,
        id: user.id || user.uid,
        coachId: user.coachId || user.assignedCoachId || (user.role === 'coach' || user.role === 'admin' ? (user.id || user.uid) : undefined)
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        role: currentUser?.role || 'client',
        loading,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
        switchRole,
        switchAdminUser,
        toggleRole,
        updateProfile,
        completeIntake,
        registeredClients
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

