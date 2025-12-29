// src/services/database/user.service.ts
import { auth } from '../../config/firebase.config';
import { supabase, supabaseAdmin } from '../../config/supabase.config';
import { eventManager, EVENTS } from '../../utils/eventEmitter';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  activity_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  activity_level?: string;
}

export class UserService {
  private static readonly BUCKET_NAME = 'avatars';

  /**
   * Ensure user exists in database (sync from Firebase Auth)
   */
  static async ensureUserExists(
    userId: string,
    email: string,
    fullName?: string
  ): Promise<{ data: User | null; error: string | null }> {
    try {
      console.log('🔍 Checking if user exists:', userId);

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking user:', fetchError);
        return { data: null, error: fetchError.message };
      }

      if (existingUser) {
        console.log('✅ User already exists');
        return { data: existingUser, error: null };
      }

      console.log('➕ Creating new user in database...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            full_name: fullName || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating user:', insertError);
        return { data: null, error: insertError.message };
      }

      console.log('✅ User created successfully');
      return { data: newUser, error: null };
    } catch (error: any) {
      console.error('❌ Error in ensureUserExists:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(
    userId: string
  ): Promise<{ data: User | null; error: string | null }> {
    try {
      console.log('📥 Fetching user from database:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ User fetched successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error in getUserById:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update user profile data
   */
  static async updateUser(
    userId: string,
    updates: UpdateUserData
  ): Promise<{ data: User | null; error: string | null }> {
    try {
      console.log('💾 Updating user profile:', userId);

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ User updated successfully');

      // 🔔 EMIT EVENT
      eventManager.emit(EVENTS.USER_PROFILE_UPDATED, {
        userId,
        updates,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error in updateUser:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Upload avatar image to Supabase Storage and update user record
   */
  static async updateAvatar(
      userId: string,
      imageUri: string
    ): Promise<{ data: { avatar_url: string } | null; error: string | null }> {
      try {
        // 1. SECURITY CHECK: Pastikan user yang login sama dengan userId
        const currentUser = auth.currentUser;
        if (!currentUser || currentUser.uid !== userId) {
          console.error('❌ Security violation: User mismatch');
          return {
            data: null,
            error: 'Unauthorized: You can only update your own avatar',
          };
        }

        console.log('📤 Starting avatar upload process...');
        console.log('Image URI:', imageUri);

        // 2. Read file using fetch
        console.log('📖 Reading file with fetch...');
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Security: Validate file size (max 5MB)
        if (blob.size > 5 * 1024 * 1024) {
          return {
            data: null,
            error: 'File too large. Maximum size is 5MB',
          };
        }

        // Security: Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(blob.type)) {
          return {
            data: null,
            error: 'Invalid file type. Only images are allowed',
          };
        }

        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });

        console.log('✅ File validated, size:', arrayBuffer.byteLength, 'bytes');

        // 3. Generate secure filename (prevent path traversal)
        const fileExt = blob.type.split('/')[1] || 'jpg';
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`; // Always in user's folder

        console.log('📁 Upload path:', filePath);

        // 4. Delete old avatar if exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        if (existingUser?.avatar_url) {
          try {
            const oldPath = existingUser.avatar_url.split('/').slice(-2).join('/');
            console.log('🗑️ Deleting old avatar:', oldPath);

            // Use admin client to delete (bypass RLS)
            await supabaseAdmin.storage.from(this.BUCKET_NAME).remove([oldPath]);
          } catch (deleteError) {
            console.warn('⚠️ Could not delete old avatar:', deleteError);
          }
        }

        // 5. Upload using ADMIN client (bypass RLS, security checked in app)
        console.log('⬆️ Uploading to Supabase Storage...');
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from(this.BUCKET_NAME)
          .upload(filePath, arrayBuffer, {
            contentType: blob.type,
            upsert: true,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          throw uploadError;
        }

        console.log('✅ Upload successful:', uploadData);

        // 6. Get public URL
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log('🔗 Public URL:', publicUrl);

        // 7. Update user record
        console.log('💾 Updating user record with avatar_url...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user record:', updateError);
          throw updateError;
        }

        console.log('✅ Avatar updated successfully in database');

        eventManager.emit(EVENTS.USER_AVATAR_UPDATED, {
          userId,
          avatarUrl: publicUrl,
        });

        // Emit juga event umum profile updated
        eventManager.emit(EVENTS.USER_PROFILE_UPDATED, { userId });

        return {
          data: { avatar_url: publicUrl },
          error: null,
        };
      } catch (error: any) {
        console.error('❌ Error in updateAvatar:', error);
        return {
          data: null,
          error: error.message || 'Failed to upload avatar',
        };
      }
    }

  /**
   * Delete user avatar
   */
  static async deleteAvatar(
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Security check
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== userId) {
        return {
          success: false,
          error: 'Unauthorized: You can only delete your own avatar',
        };
      }

      console.log('🗑️ Deleting avatar for user:', userId);

      const { data: user } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (!user?.avatar_url) {
        return { success: true, error: null };
      }

      const filePath = user.avatar_url.split('/').slice(-2).join('/');

      // Use admin client untuk delete
      const { error: deleteError } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (deleteError) {
        console.error('❌ Error deleting from storage:', deleteError);
        throw deleteError;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating user record:', updateError);
        throw updateError;
      }

      console.log('✅ Avatar deleted successfully');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ Error in deleteAvatar:', error);
      return { success: false, error: error.message };
    }
  }
}