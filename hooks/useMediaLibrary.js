import { useState, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';

export function useMediaLibrary() {
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshots, setScreenshots] = useState([]);

  const requestPermission = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const checkPermission = useCallback(async () => {
    const { status } = await MediaLibrary.getPermissionsAsync();
    setPermission(status === 'granted');
    return status === 'granted';
  }, []);

  const fetchScreenshots = useCallback(async (options = {}) => {
    const { limit = 50, after = null } = options;

    try {
      setLoading(true);

      // Check permission first
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return { success: false, error: 'Permission denied' };
        }
      }

      // Try to get screenshots album first
      let assets = [];

      // Get recent photos (iOS stores screenshots in main camera roll too)
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        first: limit,
        after: after,
      });

      assets = result.assets;

      // Filter to likely screenshots based on aspect ratio (roughly 9:16 or similar portrait)
      const screenAssets = assets.filter(asset => {
        const ratio = asset.height / asset.width;
        // Most phone screenshots have portrait aspect ratio > 1.5
        return ratio > 1.5;
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
