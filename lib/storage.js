import { supabase } from './supabase';
import { analyzeImage, uriToBase64 } from './api';

const BUCKET_NAME = 'saved-items';

/**
 * Upload an image to Supabase Storage
 * @param {string} uri - Local image URI
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Upload result with URL and path
 */
export const uploadImage = async (uri, userId) => {
  try {
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Fetch the image as blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Convert blob to array buffer for Supabase
    const arrayBuffer = await blob.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      success: true,
      path: fileName,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
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
 * @param {string} uri - Local image URI
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} Saved item result
 */
export const processAndSaveImage = async (uri, userId) => {
  try {
    // 1. Upload image
    const uploadResult = await uploadImage(uri, userId);
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // 2. Analyze with AI
    const base64 = await uriToBase64(uri);
    const analysisResult = await analyzeImage(base64);

    // 3. Save to database
    const { data, error } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        image_url: uploadResult.url,
        storage_path: uploadResult.path,
        category: analysisResult.data.category,
        source_platform: analysisResult.data.source_platform,
        extracted_text: analysisResult.data.extracted_text,
        ai_confidence: analysisResult.data.confidence,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded image if database insert fails
      await deleteImage(uploadResult.path);
      throw error;
    }

    // 4. Increment save count
    await supabase.rpc('increment_save_count', { p_user_id: userId });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Process and save error:', error);
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
