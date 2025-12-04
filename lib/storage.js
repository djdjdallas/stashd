import { supabase } from './supabase';
import { analyzeImage, uriToBase64, generateVideoIdea } from './api';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const BUCKET_NAME = 'saved-items';

// Debug logging helper
const log = (message, data = null) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[Storage ${timestamp}] ${message}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  } else {
    console.log(`[Storage ${timestamp}] ${message}`);
  }
};

/**
 * Convert a ph:// URI to a local file:// URI
 * iOS Photo Library URIs (ph://) can't be fetched directly, we need the localUri
 * @param {string} uri - The URI to convert
 * @returns {Promise<string>} The local file URI
 */
const getLocalUri = async (uri) => {
  // If it's already a file:// URI, return as-is
  if (uri.startsWith('file://')) {
    log('URI is already a file:// URI');
    return uri;
  }

  // If it's a ph:// URI, get the local URI from MediaLibrary
  if (uri.startsWith('ph://')) {
    log('Converting ph:// URI to local file URI...');
    // Extract the asset ID from the ph:// URI
    // Format: ph://ASSET_ID/L0/001
    const assetId = uri.replace('ph://', '').split('/')[0];
    log('Asset ID:', assetId);

    const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
    log('Asset info retrieved:', {
      localUri: assetInfo.localUri?.substring(0, 50) + '...',
      mediaType: assetInfo.mediaType,
    });

    if (!assetInfo.localUri) {
      throw new Error('Could not get local URI for asset');
    }

    return assetInfo.localUri;
  }

  // For other URIs (http, https, etc.), return as-is
  return uri;
};

/**
 * Upload an image to Supabase Storage
 * @param {string} uri - Local image URI (must be file:// URI)
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Upload result with URL and path
 */
export const uploadImage = async (uri, userId) => {
  log('uploadImage called', { uri: uri?.substring(0, 50) + '...', userId });

  try {
    // Determine file extension and content type from URI
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = `${userId}/${Date.now()}.${extension}`;
    log('Uploading to path:', fileName);
    log('Content type:', contentType);

    // Read file as base64 using expo-file-system
    log('Reading file as base64...');
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    log('Base64 read, length:', base64.length);

    // Convert base64 to ArrayBuffer using base64-arraybuffer
    const arrayBuffer = decode(base64);
    log('ArrayBuffer created:', { byteLength: arrayBuffer.byteLength });

    log('Uploading to Supabase Storage...');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      log('Supabase upload error:', error);
      throw error;
    }

    log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    log('Public URL generated:', urlData.publicUrl);

    return {
      success: true,
      path: fileName,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    log('ERROR in uploadImage:', { message: error.message, stack: error.stack });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} path - Storage path
 * @returns {Promise<Object>} Delete result
 */
export const deleteImage = async (path) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process and save an image (upload + AI analysis + database insert)
 * @param {string} uri - Local image URI (can be ph:// or file://)
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Saved item result
 */
export const processAndSaveImage = async (uri, userId) => {
  log('=== processAndSaveImage START ===');
  log('Input:', { uri: uri?.substring(0, 50) + '...', userId });

  try {
    // 0. Convert ph:// URI to file:// URI if needed
    log('Step 0: Converting URI to local file URI...');
    const localUri = await getLocalUri(uri);
    log('Local URI:', localUri?.substring(0, 80) + '...');

    // 1. Upload image
    log('Step 1: Uploading image...');
    const uploadResult = await uploadImage(localUri, userId);
    log('Upload result:', uploadResult);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // 2. Analyze with AI
    log('Step 2: Converting to base64...');
    const base64 = await uriToBase64(localUri);
    log('Base64 ready, length:', base64?.length);

    log('Step 3: Calling AI analysis...');
    const analysisResult = await analyzeImage(base64);
    log('Analysis result:', analysisResult);

    // 3. Save to database
    log('Step 4: Saving to database...');
    const insertData = {
      user_id: userId,
      image_url: uploadResult.url,
      storage_path: uploadResult.path,
      category: analysisResult.data.category,
      source_platform: analysisResult.data.source_platform,
      extracted_text: analysisResult.data.extracted_text,
      ai_confidence: analysisResult.data.confidence,
    };
    log('Insert data:', insertData);

    const { data, error } = await supabase
      .from('saved_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      log('Database insert error:', error);
      // Clean up uploaded image if database insert fails
      await deleteImage(uploadResult.path);
      throw error;
    }

    log('Database insert successful:', data);

    // 4. Increment save count
    log('Step 5: Incrementing save count...');
    await supabase.rpc('increment_save_count', { p_user_id: userId });

    log('=== processAndSaveImage SUCCESS ===');
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Process and save error:', error);
    log('=== processAndSaveImage ERROR ===', { message: error.message, stack: error.stack });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process and save an image with user-selected category
 * @param {string} uri - Local image URI (can be ph:// or file://)
 * @param {string} userId - User's ID
 * @param {string} category - User-selected category
 * @returns {Promise<Object>} Saved item result with generated content
 */
export const processWithCategory = async (uri, userId, category) => {
  log('=== processWithCategory START ===');
  log('Input:', { uri: uri?.substring(0, 50) + '...', userId, category });

  try {
    // 0. Convert ph:// URI to file:// URI if needed
    log('Step 0: Converting URI to local file URI...');
    const localUri = await getLocalUri(uri);
    log('Local URI:', localUri?.substring(0, 80) + '...');

    // 1. Upload image
    log('Step 1: Uploading image...');
    const uploadResult = await uploadImage(localUri, userId);
    log('Upload result:', uploadResult);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // 2. Convert to base64 for AI processing
    log('Step 2: Converting to base64...');
    const base64 = await uriToBase64(localUri);
    log('Base64 ready, length:', base64?.length);

    // 3. Generate content based on category
    log('Step 3: Generating content for category:', category);
    let generatedData = {
      title: '',
      hook: '',
      outline: [],
      format: 'short',
      platform: 'other',
      extractedText: '',
      confidence: 0,
    };

    if (category === 'video_idea' || category === 'hook' || category === 'script') {
      // Use AI to generate content
      const result = await generateVideoIdea(base64, category);
      if (result.success) {
        generatedData = result.data;
      } else {
        log('AI generation failed, using defaults');
      }
    } else if (category === 'thumbnail' || category === 'visual') {
      // For thumbnails and visuals, just extract basic text
      const result = await generateVideoIdea(base64, category);
      if (result.success) {
        generatedData.extractedText = result.data.extractedText;
        generatedData.title = result.data.title;
      }
    }

    // 4. Save to database
    log('Step 4: Saving to database...');
    const insertData = {
      user_id: userId,
      image_url: uploadResult.url,
      storage_path: uploadResult.path,
      category: category,
      source_platform: generatedData.platform,
      extracted_text: generatedData.extractedText,
      ai_confidence: generatedData.confidence,
      generated_title: generatedData.title || null,
      generated_hook: generatedData.hook || null,
      generated_outline: generatedData.outline?.length > 0 ? generatedData.outline : null,
      suggested_format: generatedData.format || null,
      suggested_platform: generatedData.platform || null,
    };
    log('Insert data:', insertData);

    const { data, error } = await supabase
      .from('saved_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      log('Database insert error:', error);
      // Clean up uploaded image if database insert fails
      await deleteImage(uploadResult.path);
      throw error;
    }

    log('Database insert successful:', data);

    // 5. Increment save count
    log('Step 5: Incrementing save count...');
    await supabase.rpc('increment_save_count', { p_user_id: userId });

    log('=== processWithCategory SUCCESS ===');
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Process with category error:', error);
    log('=== processWithCategory ERROR ===', { message: error.message, stack: error.stack });
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get saved items for a user with optional filtering
 * @param {string} userId - User's ID
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Items result
 */
export const getSavedItems = async (userId, options = {}) => {
  const { category, limit = 20, offset = 0, searchQuery } = options;

  try {
    let query = supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.textSearch('extracted_text', searchQuery);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
      count,
    };
  } catch (error) {
    console.error('Get items error:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Get category counts for a user
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Category counts
 */
export const getCategoryCounts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .select('category')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const counts = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: counts,
    };
  } catch (error) {
    console.error('Get counts error:', error);
    return {
      success: false,
      error: error.message,
      data: {},
    };
  }
};

/**
 * Update a saved item
 * @param {string} itemId - Item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export const updateSavedItem = async (itemId, updates) => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a saved item
 * @param {string} itemId - Item ID
 * @param {string} storagePath - Storage path for cleanup
 * @returns {Promise<Object>} Delete result
 */
export const deleteSavedItem = async (itemId, storagePath) => {
  try {
    // Delete from database
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    // Delete from storage
    if (storagePath) {
      await deleteImage(storagePath);
    }

    return { success: true };
  } catch (error) {
    console.error('Delete item error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
