import { useState, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';

// Debug logging helper
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[MediaLibrary ${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[MediaLibrary ${timestamp}] ${message}`);
  }
};

export function useMediaLibrary() {
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState([]);

  const requestPermission = useCallback(async () => {
    log('Requesting permission...');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    log('Permission request result:', { status });
    setPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const checkPermission = useCallback(async () => {
    log('Checking permission...');
    const { status } = await MediaLibrary.getPermissionsAsync();
    log('Permission check result:', { status });
    setPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const fetchScreenshots = useCallback(async (options = {}) => {
    const { limit = 50, after = null } = options;
    log('fetchScreenshots called with options:', options);

    try {
      setLoading(true);

      // Check permission first
      const hasPermission = await checkPermission();
      log('Has permission:', { hasPermission });
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          log('Permission denied by user');
          return { success: false, error: 'Permission denied' };
        }
      }

      // Try to get screenshots album first
      let assets = [];

      log('Fetching assets from MediaLibrary...');
      // Get recent photos (iOS stores screenshots in main camera roll too)
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: limit,
        after: after,
      });

      assets = result.assets;
      log('Raw assets fetched:', {
        count: assets.length,
        hasNextPage: result.hasNextPage,
        sampleAssets: assets.slice(0, 3).map(a => ({
          id: a.id,
          width: a.width,
          height: a.height,
          ratio: a.height / a.width,
          uri: a.uri?.substring(0, 50) + '...'
        }))
      });

      // Filter to likely screenshots based on aspect ratio (roughly 9:16 or similar portrait)
      const screenAssets = assets.filter(asset => {
        const ratio = asset.height / asset.width;
        // Most phone screenshots have portrait aspect ratio > 1.5
        return ratio > 1.5;
      });

      log('Filtered screenshots:', {
        originalCount: assets.length,
        filteredCount: screenAssets.length,
        filterRatio: '> 1.5'
      });

      setScreenshots(prev => after ? [...prev, ...screenAssets] : screenAssets);

      return {
        success: true,
        assets: screenAssets,
        hasMore: result.hasNextPage,
        endCursor: result.endCursor,
      };
    } catch (error) {
      console.error('Fetch screenshots error:', error);
      log('ERROR fetching screenshots:', { message: error.message, stack: error.stack });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [checkPermission, requestPermission]);

  const getAssetInfo = useCallback(async (assetId) => {
    try {
      const info = await MediaLibrary.getAssetInfoAsync(assetId);
      return { success: true, info };
    } catch (error) {
      console.error('Get asset info error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const clearScreenshots = useCallback(() => {
    setScreenshots([]);
  }, []);

  return {
    permission,
    loading,
    screenshots,
    requestPermission,
    checkPermission,
    fetchScreenshots,
    getAssetInfo,
    clearScreenshots,
  };
}

export default useMediaLibrary;
