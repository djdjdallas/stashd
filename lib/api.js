import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

/**
 * Analyze an image using Claude AI
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} Analysis result with category, platform, text, confidence
 */
export const analyzeImage = async (imageBase64) => {
  try {
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: {
        category: result.category || 'other',
        source_platform: result.source_platform || 'other',
        extracted_text: result.extracted_text || '',
        confidence: result.confidence || 0,
      },
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    // Return fallback data instead of failing
    return {
      success: false,
      data: {
        category: 'other',
        source_platform: 'other',
        extracted_text: '',
        confidence: 0,
      },
      error: error.message,
    };
  }
};

/**
 * Convert image URI to base64
 * @param {string} uri - Local image URI
 * @returns {Promise<string>} Base64 encoded string
 */
export const uriToBase64 = async (uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('URI to base64 error:', error);
    throw error;
  }
};

/**
 * Resize image before upload for optimization
 * @param {string} uri - Local image URI
 * @param {number} maxWidth - Maximum width (default 1200)
 * @returns {Promise<string>} Resized image URI
 */
export const resizeImage = async (uri, maxWidth = 1200) => {
  // For MVP, we'll skip resizing and use the original
  // In production, use expo-image-manipulator
  return uri;
};
