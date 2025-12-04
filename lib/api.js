// Use Supabase Edge Function for image analysis
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging helper
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[API ${timestamp}] ${message}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  } else {
    console.log(`[API ${timestamp}] ${message}`);
  }
};

log('API module initialized');
log('Supabase URL:', SUPABASE_URL);
log('Supabase anon key present:', !!SUPABASE_ANON_KEY);

/**
 * Analyze an image using Claude AI via Supabase Edge Function
 * @param {string} imageBase64 - Base64 encoded image data
 * @returns {Promise<Object>} Analysis result with category, platform, text, confidence
 */
export const analyzeImage = async (imageBase64) => {
  const requestUrl = `${SUPABASE_URL}/functions/v1/analyze-image`;
  log('analyzeImage called');
  log('Request URL:', requestUrl);
  log('Base64 length:', imageBase64?.length || 0);

  try {
    log('Sending POST request to Supabase Edge Function...');
    const startTime = Date.now();

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ imageBase64 }),
    });

    const elapsed = Date.now() - startTime;
    log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      elapsed: `${elapsed}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    log('API response parsed:', result);

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
    log('ERROR in analyzeImage:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
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
 * @param {string} uri - Local image URI (must be file:// URI)
 * @returns {Promise<string>} Base64 encoded string
 */
export const uriToBase64 = async (uri) => {
  log('uriToBase64 called with URI:', uri?.substring(0, 100) + '...');

  try {
    // Use expo-file-system legacy API to read file as base64
    const FileSystem = require('expo-file-system/legacy');
    log('Reading file as base64 using FileSystem...');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    log('Base64 conversion complete:', { length: base64?.length || 0 });
    return base64;
  } catch (error) {
    console.error('URI to base64 error:', error);
    log('ERROR in uriToBase64:', { message: error.message, stack: error.stack });
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

/**
 * Generate video idea from image using Claude AI via Supabase Edge Function
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {string} category - The category selected by user
 * @returns {Promise<Object>} Generated video idea with title, hook, outline, etc.
 */
export const generateVideoIdea = async (imageBase64, category) => {
  const requestUrl = `${SUPABASE_URL}/functions/v1/generate-video-idea`;
  log('generateVideoIdea called');
  log('Request URL:', requestUrl);
  log('Category:', category);
  log('Base64 length:', imageBase64?.length || 0);

  try {
    log('Sending POST request to Supabase Edge Function...');
    const startTime = Date.now();

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ imageBase64, category }),
    });

    const elapsed = Date.now() - startTime;
    log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      elapsed: `${elapsed}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    log('API response parsed:', result);

    return {
      success: true,
      data: {
        title: result.title || '',
        hook: result.hook || '',
        outline: result.outline || [],
        format: result.format || 'short',
        platform: result.platform || 'tiktok',
        extractedText: result.extractedText || '',
        confidence: result.confidence || 0,
      },
    };
  } catch (error) {
    console.error('Video idea generation error:', error);
    log('ERROR in generateVideoIdea:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message,
    };
  }
};
