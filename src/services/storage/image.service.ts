import * as FileSystem from 'expo-file-system';
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
      // Baca file sebagai base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Generate unique filename
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Convert base64 to Blob untuk upload
      const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const blob = new Blob([arrayBuffer], { type: `image/${fileExt}` });

      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, blob, {
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

  // Delete image dari Supabase Storage
  static async deleteImage(filePath: string) {
    try {
      const { error } = await supabase.storage
        .from('user-uploads')
        .remove([filePath]);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}