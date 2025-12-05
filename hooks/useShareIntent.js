import { useState, useEffect, useCallback } from 'react';
import { useShareIntentContext, ShareIntentProvider } from 'expo-share-intent';

/**
 * Hook to handle incoming shared images from the native share sheet.
 * Handles both cold start (app opened via share) and warm start (app already open).
 *
 * @returns {Object} Share intent state and handlers
 * - shareIntent: The current share intent data (or null)
 * - hasShareIntent: Boolean indicating if there's a pending share intent
 * - clearShareIntent: Function to clear the current share intent
 * - sharedFiles: Array of shared file objects with path, mimeType, fileName
 */
export function useShareIntent() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntentContext();

  // Extract shared files from the share intent
  const sharedFiles = shareIntent?.files || [];

  // Clear the share intent after processing
  const clearShareIntent = useCallback(() => {
    resetShareIntent();
  }, [resetShareIntent]);

  return {
    shareIntent,
    hasShareIntent,
    clearShareIntent,
    sharedFiles,
    error,
  };
}

// Re-export the provider for use in _layout.js
export { ShareIntentProvider };

export default useShareIntent;
