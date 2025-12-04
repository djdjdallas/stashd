import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase, onAuthStateChange } from '../lib/supabase';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        user: action.payload?.user || null,
        session: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        session: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        dispatch({ type: 'SET_SESSION', payload: session });
      } catch (error) {
        console.error('Session check error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        dispatch({ type: 'SET_SESSION', payload: session });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SIGN_OUT' });
      } else if (event === 'TOKEN_REFRESHED') {
        dispatch({ type: 'SET_SESSION', payload: session });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { error };
      }

      return { data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { error };
    }
  };

  const signIn = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { error };
      }

      return { data };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { error };
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { error };
      }
      dispatch({ type: 'SIGN_OUT' });
      return {};
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { error };
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
