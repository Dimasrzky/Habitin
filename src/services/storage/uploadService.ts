import { decode } from 'base64-arraybuffer';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { auth } from '../../config/firebase.config';
import { supabaseStorage } from '../../config/supabase.storage';

/**
 * Upload lab image to Supabase Storage
 * Uses service role client to bypass RLS
 */
export const uploadLabImage = async (
  fileUri: string,
  userId: string
): Promise<string> => {
  try {
    console.log('📤 Starting file upload...');
    console.log('📄 File URI:', fileUri);
    console.log('👤 User ID:', userId);

    // Verify Firebase Auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated - Firebase Auth not found');
    }
    console.log('🔐 Firebase User:', currentUser.uid);

    // Security check: verify user ID matches
    if (currentUser.uid !== userId) {
      throw new Error('User ID mismatch - security violation');
    }

    // Read file as base64
    const base64 = await readAsStringAsync(fileUri, {
      encoding: 'base64',
    });
    console.log('✅ File read as base64, length:', base64.length);

    // Decode to ArrayBuffer for upload
    const arrayBuffer = decode(base64);

    // Generate unique filename
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `lab-results/${userId}/${fileName}`;

    console.log('📁 Upload path:', filePath);

    // Upload using SERVICE ROLE client (bypasses RLS)
    const { data, error } = await supabaseStorage.storage
      .from('lab-results')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }

    console.log('✅ Upload successful:', data.path);

    // Get public URL
    const { data: urlData } = supabaseStorage.storage
      .from('lab-results')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL:', publicUrl);

    return publicUrl;
  } catch (error: any) {
    console.error('❌ Upload service error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Convert file to CLEAN base64 string (without data URI prefix)
 * This is used for Google Vision API which requires raw base64
 */
export const convertToBase64 = async (fileUri: string): Promise<string> => {
  try {
    console.log('🔄 Converting file to base64...');
    console.log('📄 File URI:', fileUri);

    // Read file as base64
    const base64 = await readAsStringAsync(fileUri, {
      encoding: 'base64',
    });

    console.log('✅ Base64 conversion complete, length:', base64.length);

    // ✅ CRITICAL: Remove data URI prefix if present
    // expo-file-system/legacy should return clean base64, but let's be safe
    let cleanBase64 = base64;
    
    if (base64.startsWith('data:')) {
      console.log('⚠️ Found data URI prefix, removing...');
      cleanBase64 = base64.split(',')[1];
      console.log('✅ Cleaned base64, new length:', cleanBase64.length);
    }

    // Verify base64 is valid (should not start with 'data:' or 'file://')
    if (cleanBase64.startsWith('data:') || cleanBase64.startsWith('file://')) {
      throw new Error('Invalid base64 format: still contains prefix');
    }

    return cleanBase64;
  } catch (error: any) {
    console.error('❌ Error converting to base64:', error);
    throw new Error(`Failed to convert image: ${error.message}`);
  }
};