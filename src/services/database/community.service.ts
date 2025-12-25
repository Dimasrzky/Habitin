// src/services/database/community.service.ts
import { supabase } from '../../config/supabase.config';
import { UserService } from './user.service';
import {
  CommunityPostWithUser,
  PostInsert,
  ReactionType,
} from '../../types/community.types';

export class CommunityService {
  /**
   * Get all community posts with user information and current user's reaction
   */
  static async getAllPosts(currentUserId: string, limit = 50) {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (postsError) throw postsError;

      if (!posts || posts.length === 0) {
        return { data: [], error: null };
      }

      // Get unique user IDs
      const userIds = [...new Set(posts.map((p: any) => p.user_id))];

      // Fetch user data from Supabase users table (which syncs with Firebase)
      const userPromises = userIds.map(userId =>
        UserService.getUserById(userId as string)
      );
      const userResults = await Promise.all(userPromises);

      // Create user map
      const userMap = new Map();
      userResults.forEach(result => {
        if (result.data) {
          userMap.set(result.data.id, {
            id: result.data.id,
            full_name: result.data.full_name || 'Anonymous',
            avatar_url: result.data.avatar_url,
          });
        }
      });

      // Get user reactions for all posts
      const postIds = posts.map((p: any) => p.id);
      const { data: reactions, error: reactionsError } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      if (reactionsError) {
        console.warn('Error fetching reactions:', reactionsError);
      }

      // Map reactions to posts
      const reactionMap = new Map<string, ReactionType>();
      reactions?.forEach((r: any) => {
        reactionMap.set(r.post_id, r.reaction_type);
      });

      // Transform data
      const postsWithUser: CommunityPostWithUser[] = posts.map((post: any) => ({
        ...post,
        user: userMap.get(post.user_id) || {
          id: post.user_id,
          full_name: 'Anonymous',
          avatar_url: null,
        },
        user_reaction: reactionMap.get(post.id) || null,
      }));

      return { data: postsWithUser, error: null };
    } catch (error: any) {
      console.error('Error getting posts:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get posts filtered by type
   */
  static async getPostsByType(
    currentUserId: string,
    postType: string,
    limit = 50
  ) {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('post_type', postType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (postsError) throw postsError;

      if (!posts || posts.length === 0) {
        return { data: [], error: null };
      }

      // Get unique user IDs
      const userIds = [...new Set(posts.map((p: any) => p.user_id))];

      // Fetch user data
      const userPromises = userIds.map(userId =>
        UserService.getUserById(userId as string)
      );
      const userResults = await Promise.all(userPromises);

      // Create user map
      const userMap = new Map();
      userResults.forEach(result => {
        if (result.data) {
          userMap.set(result.data.id, {
            id: result.data.id,
            full_name: result.data.full_name || 'Anonymous',
            avatar_url: result.data.avatar_url,
          });
        }
      });

      // Get user reactions
      const postIds = posts.map((p: any) => p.id);
      const { data: reactions } = await supabase
        .from('post_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const reactionMap = new Map<string, ReactionType>();
      reactions?.forEach((r: any) => {
        reactionMap.set(r.post_id, r.reaction_type);
      });

      const postsWithUser: CommunityPostWithUser[] = posts.map((post: any) => ({
        ...post,
        user: userMap.get(post.user_id) || {
          id: post.user_id,
          full_name: 'Anonymous',
          avatar_url: null,
        },
        user_reaction: reactionMap.get(post.id) || null,
      }));

      return { data: postsWithUser, error: null };
    } catch (error: any) {
      console.error('Error getting posts by type:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Create a new post
   */
  static async createPost(post: PostInsert) {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...post,
          reactions_count: {
            likes: 0,
            supports: 0,
            celebrates: 0,
          },
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user data for the created post
      const userResult = await UserService.getUserById(post.user_id);

      const postWithUser = {
        ...data,
        user: userResult.data ? {
          id: userResult.data.id,
          full_name: userResult.data.full_name || 'Anonymous',
          avatar_url: userResult.data.avatar_url,
        } : {
          id: post.user_id,
          full_name: 'Anonymous',
          avatar_url: null,
        },
      };

      return { data: postWithUser, error: null };
    } catch (error: any) {
      console.error('Error creating post:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a post (only by owner)
   */
  static async deletePost(postId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle reaction on a post
   */
  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: ReactionType
  ) {
    try {
      // Check if user already reacted
      const { data: existingReaction, error: checkError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      // Get current post data
      const { data: post, error: postError } = await supabase
        .from('community_posts')
        .select('reactions_count')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      const reactionsCount = { ...post.reactions_count };

      if (existingReaction) {
        // If same reaction, remove it
        if (existingReaction.reaction_type === reactionType) {
          const { error: deleteError } = await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingReaction.id);

          if (deleteError) throw deleteError;

          // Decrement count
          const key = `${reactionType}s` as keyof typeof reactionsCount;
          reactionsCount[key] = Math.max(0, reactionsCount[key] - 1);

          // Update post reactions count
          const { error: updateError } = await supabase
            .from('community_posts')
            .update({ reactions_count: reactionsCount })
            .eq('id', postId);

          if (updateError) throw updateError;

          return { data: { removed: true, reaction: null }, error: null };
        } else {
          // Different reaction, update it
          const { error: updateError } = await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);

          if (updateError) throw updateError;

          // Update counts
          const oldKey = `${existingReaction.reaction_type}s` as keyof typeof reactionsCount;
          const newKey = `${reactionType}s` as keyof typeof reactionsCount;
          reactionsCount[oldKey] = Math.max(0, reactionsCount[oldKey] - 1);
          reactionsCount[newKey] = reactionsCount[newKey] + 1;

          const { error: updatePostError } = await supabase
            .from('community_posts')
            .update({ reactions_count: reactionsCount })
            .eq('id', postId);

          if (updatePostError) throw updatePostError;

          return { data: { removed: false, reaction: reactionType }, error: null };
        }
      } else {
        // No existing reaction, create new
        const { error: insertError } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType,
          });

        if (insertError) throw insertError;

        // Increment count
        const key = `${reactionType}s` as keyof typeof reactionsCount;
        reactionsCount[key] = reactionsCount[key] + 1;

        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ reactions_count: reactionsCount })
          .eq('id', postId);

        if (updateError) throw updateError;

        return { data: { removed: false, reaction: reactionType }, error: null };
      }
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Upload image to Supabase Storage
   */
  static async uploadImage(userId: string, imageUri: string, fileName: string) {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filePath = `community/${userId}/${Date.now()}_${fileName}`;

      const { data, error } = await supabase.storage
        .from('community-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          cacheControl: '3600',
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('community-images')
        .getPublicUrl(filePath);

      return { data: urlData.publicUrl, error: null };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { data: null, error: error.message };
    }
  }
}
