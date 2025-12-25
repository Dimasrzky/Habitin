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

    // Read file as blob using fetch API
    const response = await fetch(fileUri);
    const blob = await response.blob();
    console.log('✅ File read as blob, size:', blob.size);

    // Convert blob to ArrayBuffer for React Native compatibility
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
    console.log('✅ Converted to ArrayBuffer');

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

    // Read file as blob using fetch API
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URI prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.log('✅ Base64 conversion complete, length:', base64.length);

    // Verify base64 is valid (should not start with 'data:' or 'file://')
    if (base64.startsWith('data:') || base64.startsWith('file://')) {
      throw new Error('Invalid base64 format: still contains prefix');
    }

    return base64;
  } catch (error: any) {
    console.error('❌ Error converting to base64:', error);
    throw new Error(`Failed to convert image: ${error.message}`);
  }
};