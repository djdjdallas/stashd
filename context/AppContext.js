import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getSavedItems, getCategoryCounts, processAndSaveImage, deleteSavedItem, updateSavedItem } from '../lib/storage';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const initialState = {
  items: [],
  categoryCounts: {},
  loading: false,
  refreshing: false,
  error: null,
  hasMore: true,
  currentCategory: 'all',
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload.items,
        hasMore: action.payload.hasMore,
        loading: false,
        refreshing: false,
      };
    case 'APPEND_ITEMS':
      return {
        ...state,
        items: [...state.items, ...action.payload.items],
        hasMore: action.payload.hasMore,
        loading: false,
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [action.payload, ...state.items],
        categoryCounts: {
          ...state.categoryCounts,
          [action.payload.category]: (state.categoryCounts[action.payload.category] || 0) + 1,
        },
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case 'REMOVE_ITEM':
      const removedItem = state.items.find(i => i.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        categoryCounts: removedItem ? {
          ...state.categoryCounts,
          [removedItem.category]: Math.max(0, (state.categoryCounts[removedItem.category] || 1) - 1),
        } : state.categoryCounts,
      };
    case 'SET_CATEGORY_COUNTS':
      return { ...state, categoryCounts: action.payload };
    case 'SET_CURRENT_CATEGORY':
      return { ...state, currentCategory: action.payload, items: [], hasMore: true };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  const fetchItems = useCallback(async (options = {}) => {
    if (!user) return;

    const { refresh = false, category = state.currentCategory } = options;

    if (refresh) {
      dispatch({ type: 'SET_REFRESHING', payload: true });
    } else {
      dispatch({ type: 'SET_LOADING', payload: true });
    }

    const offset = refresh ? 0 : state.items.length;
    const result = await getSavedItems(user.id, {
      category: category === 'all' ? null : category,
      offset,
      limit: 20,
    });

    if (result.success) {
      if (refresh || offset === 0) {
        dispatch({
          type: 'SET_ITEMS',
          payload: {
            items: result.data,
            hasMore: result.data.length === 20,
          },
        });
      } else {
        dispatch({
          type: 'APPEND_ITEMS',
          payload: {
            items: result.data,
            hasMore: result.data.length === 20,
          },
        });
      }
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error });
    }
  }, [user, state.currentCategory, state.items.length]);

  const fetchCategoryCounts = useCallback(async () => {
    if (!user) return;

    const result = await getCategoryCounts(user.id);
    if (result.success) {
      dispatch({ type: 'SET_CATEGORY_COUNTS', payload: result.data });
    }
  }, [user]);

  const saveImage = useCallback(async (uri) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const result = await processAndSaveImage(uri, user.id);
    if (result.success) {
      dispatch({ type: 'ADD_ITEM', payload: result.data });
    }
    return result;
  }, [user]);

  const removeItem = useCallback(async (itemId, storagePath) => {
    const result = await deleteSavedItem(itemId, storagePath);
    if (result.success) {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    }
    return result;
  }, []);

  const editItem = useCallback(async (itemId, updates) => {
    const result = await updateSavedItem(itemId, updates);
    if (result.success) {
      dispatch({ type: 'UPDATE_ITEM', payload: result.data });
    }
    return result;
  }, []);

  const setCategory = useCallback((category) => {
    dispatch({ type: 'SET_CURRENT_CATEGORY', payload: category });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    fetchItems,
    fetchCategoryCounts,
    saveImage,
    removeItem,
    editItem,
    setCategory,
    reset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
