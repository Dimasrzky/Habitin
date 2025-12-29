import { StorageError } from '@supabase/storage-js';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase.config';

export class ImageService {
  // Pick image dari gallery
  static async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  }

  // Upload image ke Supabase Storage
  static async uploadAvatar(userId: string, uri: string) {
    try {
      // Fetch image and convert to ArrayBuffer (React Native compatible)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for React Native compatibility
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      // Generate unique filename
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload ke Supabase Storage using ArrayBuffer
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        error: null,
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { url: null, path: null, error: error.message };
    }
  }

  static async uploadCommunityImage(
    userId: string,
    imageUri: string
  ): Promise<{ url: string | null; error: string | null }> {
    try {
      console.log('📤 Uploading image to Supabase Storage...');
      console.log('📁 Image URI:', imageUri);

      // Validasi
      if (!userId || !userId.trim()) {
        return { url: null, error: 'User ID tidak valid' };
      }

      if (!imageUri || !imageUri.trim()) {
        return { url: null, error: 'Image URI tidak valid' };
      }

      // 🔥 FIX: Convert image URI ke Base64
      console.log('🔄 Converting image to base64...');
      const base64 = await this.convertImageToBase64(imageUri);
      
      if (!base64) {
        throw new Error('Gagal mengkonversi gambar ke base64');
      }

      console.log('✅ Base64 conversion successful');
      console.log('📦 Base64 length:', base64.length);

      // Validasi ukuran (approx 5MB in base64)
      const estimatedSize = (base64.length * 3) / 4; // Convert base64 length to bytes
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (estimatedSize > maxSize) {
        return { 
          url: null, 
          error: 'Ukuran gambar terlalu besar. Maksimal 5MB' 
        };
      }

      console.log('📦 Estimated size:', (estimatedSize / 1024).toFixed(2), 'KB');

      // Generate unique filename
      const fileExt = this.getFileExtension(imageUri);
      const fileName = `post_${Date.now()}.${fileExt}`;
      
      // Path: {userId}/{fileName}
      const filePath = `${userId}/${fileName}`;

      console.log('🗂️ Upload path:', filePath);
      console.log('🪣 Bucket name: community-images');

      // 🔥 FIX: Decode base64 ke ArrayBuffer untuk Supabase
      console.log('🔄 Decoding base64 to ArrayBuffer...');
      const arrayBuffer = decode(base64);

      // Upload ke Supabase Storage dengan ArrayBuffer
      console.log('📤 Uploading to Supabase...');
      const { data, error } = await supabase.storage
        .from('community-images')
        .upload(filePath, arrayBuffer, {
          contentType: this.getContentType(fileExt),
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        
        const storageError = error as StorageError;
        console.error('Error details:', {
          message: storageError.message,
          name: storageError.name,
        });

        // User-friendly error messages
        let errorMessage = storageError.message;
        
        if (errorMessage.includes('Bucket not found')) {
          errorMessage = 'Bucket storage belum dikonfigurasi. Hubungi admin.';
        } else if (errorMessage.includes('row-level security')) {
          errorMessage = 'Tidak memiliki izin untuk upload. Pastikan Anda sudah login.';
        } else if (errorMessage.includes('already exists')) {
          errorMessage = 'File dengan nama yang sama sudah ada.';
        }

        return { url: null, error: errorMessage };
      }

      console.log('✅ Upload successful:', data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', urlData.publicUrl);

      return { url: urlData.publicUrl, error: null };

    } catch (error: any) {
      console.error('❌ Error in uploadCommunityImage:', error);
      return { 
        url: null, 
        error: error.message || 'Terjadi kesalahan saat upload gambar' 
      };
    }
  }

  /**
   * Convert image URI to Base64
   */
  private static async convertImageToBase64(uri: string): Promise<string | null> {
    try {
      // Fetch image as blob first
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to base64 using FileReader
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data URI prefix (e.g., "data:image/jpeg;base64,")
          const base64 = base64String.split(',')[1];
          resolve(base64);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file as base64'));
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      return null;
    }
  }

  /**
   * Get file extension from URI
   */
  private static getFileExtension(uri: string): string {
    const extension = uri.split('.').pop()?.toLowerCase();
    
    // Map common extensions
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (extension && validExtensions.includes(extension)) {
      return extension;
    }
    
    // Default to jpg if unknown
    return 'jpg';
  }

  /**
   * Get content type from file extension
   */
  private static getContentType(extension: string): string {
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };

    return contentTypes[extension] || 'image/jpeg';
  }

  /**
   * Delete image dari storage
   */
  static async deleteCommunityImage(
    imageUrl: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🗑️ Deleting image from storage...');

      // Validasi URL
      if (!imageUrl || !imageUrl.includes('community-images')) {
        return { success: false, error: 'Invalid image URL' };
      }

      // Extract file path from URL
      const urlParts = imageUrl.split('/community-images/');
      if (urlParts.length !== 2) {
        return { success: false, error: 'Invalid image URL format' };
      }

      const filePath = urlParts[1];
      console.log('📁 File path to delete:', filePath);

      const { error } = await supabase.storage
        .from('community-images')
        .remove([filePath]);

      if (error) {
        console.error('❌ Error deleting image:', error);
        const storageError = error as StorageError;
        return { success: false, error: storageError.message };
      }

      console.log('✅ Image deleted successfully');
      return { success: true, error: null };

    } catch (error: any) {
      console.error('❌ Error in deleteCommunityImage:', error);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat hapus gambar' 
      };
    }
  }

  /**
   * Get public URL for an image
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('community-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}