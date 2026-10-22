import type { StateCreator } from 'zustand';
import type { SessionUser } from '@/modules/auth/schemas/authResponse.schema';

// Simple user interface for template
interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  // Only DTOs validated by authService may grant access to production screens.
  sessionUser: SessionUser | null;
  generation: number;
  hasSessionHistory: boolean;
  bootstrapStatus: 'idle' | 'ready';
  acceptSession: (user: SessionUser | null, generation: number) => boolean;
  // Actions
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set, get) => ({
  isAuthenticated: false,
  user: null,
  sessionUser: null,
  generation: 0,
  hasSessionHistory: false,
  bootstrapStatus: 'idle',
  acceptSession: (user, generation) => {
    if (get().generation !== generation) return false;
    set({
      sessionUser: user,
      user: user
        ? { id: user.id, name: user.displayName, email: user.email }
        : null,
      isAuthenticated: !!user,
      hasSessionHistory: get().hasSessionHistory || !!user,
      bootstrapStatus: 'ready',
      generation: generation + 1,
    });
    return true;
  },
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      sessionUser: null,
      bootstrapStatus: 'ready',
      generation: get().generation + 1,
    });
  },

  setUser: (user) => {
    set({
      user,
      sessionUser: null,
      generation: get().generation + 1,
      isAuthenticated: !!user,
    });
  },
});
