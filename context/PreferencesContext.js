import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
  CREATOR_TYPE: '@stashd_creator_type',
  ONBOARDING_COMPLETE: '@stashd_onboarding_complete',
};

// Creator types
export const CREATOR_TYPES = {
  CONTENT_CREATOR: 'content_creator',
  SOFTWARE_DEVELOPER: 'software_developer',
};

const initialState = {
  creatorType: null, // 'content_creator' | 'software_developer' | null
  onboardingComplete: false,
  loading: true,
  syncing: false,
};

function preferencesReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    case 'SET_CREATOR_TYPE':
      return { ...state, creatorType: action.payload };
    case 'SET_ONBOARDING_COMPLETE':
      return { ...state, onboardingComplete: action.payload };
    case 'LOAD_PREFERENCES':
      return {
        ...state,
        creatorType: action.payload.creatorType,
        onboardingComplete: action.payload.onboardingComplete,
        loading: false,
      };
    case 'RESET':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export function PreferencesProvider({ children }) {
  const [state, dispatch] = useReducer(preferencesReducer, initialState);
  const { user } = useAuth();

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    loadLocalPreferences();
  }, []);

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (user && state.creatorType) {
      syncPreferencesToSupabase();
    } else if (user && !state.creatorType) {
      // User logged in but no local preference - check Supabase
      loadPreferencesFromSupabase();
    }
  }, [user]);

  // Load preferences from local storage
  const loadLocalPreferences = async () => {
    try {
      const [creatorType, onboardingComplete] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CREATOR_TYPE),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
      ]);

      dispatch({
        type: 'LOAD_PREFERENCES',
        payload: {
          creatorType: creatorType || null,
          onboardingComplete: onboardingComplete === 'true',
        },
      });
    } catch (error) {
      console.error('Error loading preferences:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load preferences from Supabase (for returning users)
  const loadPreferencesFromSupabase = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('creator_type')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading preferences from Supabase:', error);
        return;
      }

      if (data?.creator_type) {
        // Save to local storage and update state
        await AsyncStorage.setItem(STORAGE_KEYS.CREATOR_TYPE, data.creator_type);
        dispatch({ type: 'SET_CREATOR_TYPE', payload: data.creator_type });
      }
    } catch (error) {
      console.error('Error loading preferences from Supabase:', error);
    }
  };

  // Sync local preferences to Supabase
  const syncPreferencesToSupabase = async () => {
    if (!user || !state.creatorType) return;

    dispatch({ type: 'SET_SYNCING', payload: true });

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            creator_type: state.creatorType,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error syncing preferences to Supabase:', error);
      }
    } catch (error) {
      console.error('Error syncing preferences:', error);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  // Set creator type (saves locally and syncs to Supabase if logged in)
  const setCreatorType = useCallback(async (type) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CREATOR_TYPE, type);
      dispatch({ type: 'SET_CREATOR_TYPE', payload: type });

      // Sync to Supabase if user is logged in
      if (user) {
        dispatch({ type: 'SET_SYNCING', payload: true });
        await supabase
          .from('user_preferences')
          .upsert(
            { user_id: user.id, creator_type: type },
            { onConflict: 'user_id' }
          );
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    } catch (error) {
      console.error('Error setting creator type:', error);
    }
  }, [user]);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
      dispatch({ type: 'SET_ONBOARDING_COMPLETE', payload: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  // Check if creator type is selected
  const hasCreatorType = state.creatorType !== null;

  // Check if user is a content creator
  const isContentCreator = state.creatorType === CREATOR_TYPES.CONTENT_CREATOR;

  // Check if user is a software developer
  const isSoftwareDeveloper = state.creatorType === CREATOR_TYPES.SOFTWARE_DEVELOPER;

  // Reset preferences (for testing/logout)
  const resetPreferences = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CREATOR_TYPE,
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      ]);
      dispatch({ type: 'RESET' });
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  }, []);

  const value = {
    ...state,
    hasCreatorType,
    isContentCreator,
    isSoftwareDeveloper,
    setCreatorType,
    completeOnboarding,
    resetPreferences,
    syncPreferencesToSupabase,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export default PreferencesContext;
