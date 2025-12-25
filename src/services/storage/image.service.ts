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