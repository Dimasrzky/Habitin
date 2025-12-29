// src/services/database/community.service.ts
import { supabase } from '../../config/supabase.config';
import { CommunityPostWithUser, ReactionType } from '../../types/community.types';
import { eventManager, EVENTS } from '../../utils/eventEmitter';

export class CommunityService {
  /**
   * Get all posts with user info and current user's reaction
   */
  static async getAllPosts(
    currentUserId: string
  ): Promise<{ data: CommunityPostWithUser[]; error: string | null }> {
    try {
      console.log('📥 Fetching all community posts...');

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users!user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching posts:', error);
        return { data: [], error: error.message };
      }

      // Get reactions count and user's reaction for each post
      const postsWithReactions = await Promise.all(
        (data || []).map(async (post) => {
          const reactions = await this.getPostReactions(post.id, currentUserId);
          return {
            ...post,
            reactions_count: reactions.counts,
            user_reaction: reactions.userReaction,
          };
        })
      );

      console.log('✅ Posts fetched successfully:', postsWithReactions.length);
      return { data: postsWithReactions as CommunityPostWithUser[], error: null };
    } catch (error: any) {
      console.error('❌ Error in getAllPosts:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get posts filtered by type
   */
  static async getPostsByType(
    currentUserId: string,
    postType: string
  ): Promise<{ data: CommunityPostWithUser[]; error: string | null }> {
    try {
      console.log('📥 Fetching posts by type:', postType);

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users!user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_type', postType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching posts by type:', error);
        return { data: [], error: error.message };
      }

      // Get reactions count and user's reaction for each post
      const postsWithReactions = await Promise.all(
        (data || []).map(async (post) => {
          const reactions = await this.getPostReactions(post.id, currentUserId);
          return {
            ...post,
            reactions_count: reactions.counts,
            user_reaction: reactions.userReaction,
          };
        })
      );

      console.log('✅ Posts fetched successfully:', postsWithReactions.length);
      return { data: postsWithReactions as CommunityPostWithUser[], error: null };
    } catch (error: any) {
      console.error('❌ Error in getPostsByType:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Get reactions count and user's reaction for a post
   */
  private static async getPostReactions(
    postId: string,
    currentUserId: string
  ): Promise<{
    counts: { likes: number; supports: number; celebrates: number };
    userReaction?: ReactionType;
  }> {
    try {
      // Get all reactions for this post
      const { data: reactions, error } = await supabase
        .from('post_reactions')
        .select('reaction_type, user_id')
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return {
          counts: { likes: 0, supports: 0, celebrates: 0 },
        };
      }

      // Count reactions by type
      const counts = {
        likes: 0,
        supports: 0,
        celebrates: 0,
      };

      let userReaction: ReactionType | undefined;

      reactions?.forEach((reaction) => {
        if (reaction.reaction_type === 'like') counts.likes++;
        if (reaction.reaction_type === 'support') counts.supports++;
        if (reaction.reaction_type === 'celebrate') counts.celebrates++;

        if (reaction.user_id === currentUserId) {
          userReaction = reaction.reaction_type as ReactionType;
        }
      });

      return { counts, userReaction };
    } catch (error) {
      console.error('Error in getPostReactions:', error);
      return {
        counts: { likes: 0, supports: 0, celebrates: 0 },
      };
    }
  }

  /**
   * Toggle reaction on a post (like, support, celebrate)
   */
  static async toggleReaction(
    postId: string,
    userId: string,
    reactionType: ReactionType
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🔄 Toggling reaction:', { postId, userId, reactionType });

      // Check if user already has a reaction on this post
      const { data: existingReaction, error: fetchError } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error checking existing reaction:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // If user already has the same reaction, remove it (toggle off)
      if (existingReaction && existingReaction.reaction_type === reactionType) {
        console.log('🗑️ Removing existing reaction');
        const { error: deleteError } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting reaction:', deleteError);
          return { success: false, error: deleteError.message };
        }

        console.log('✅ Reaction removed');
        return { success: true, error: null };
      }

      // If user has a different reaction, update it
      if (existingReaction && existingReaction.reaction_type !== reactionType) {
        console.log('🔄 Updating reaction type');
        const { error: updateError } = await supabase
          .from('post_reactions')
          .update({ reaction_type: reactionType, updated_at: new Date().toISOString() })
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating reaction:', updateError);
          return { success: false, error: updateError.message };
        }

        console.log('✅ Reaction updated');
        return { success: true, error: null };
      }

      // If no existing reaction, create new one
      console.log('➕ Creating new reaction');
      const { error: insertError } = await supabase
        .from('post_reactions')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        console.error('Error creating reaction:', insertError);
        return { success: false, error: insertError.message };
      }

      console.log('✅ Reaction created');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ Error in toggleReaction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new post
   */
  static async createPost(
    userId: string,
    content: string,
    postType: string,
    imageUrl?: string,
    metrics?: any
  ): Promise<{ data: any | null; error: string | null }> {
    try {
      console.log('➕ Creating new post...');
      console.log('Post data:', { userId, content, postType, imageUrl, metrics });

      // 🔥 FIX: Pastikan data flat, bukan nested
      const postData = {
        user_id: userId,
        content: content,
        post_type: postType,
        image_url: imageUrl || null,
        metrics: metrics || null,
        created_at: new Date().toISOString(),
      };

      console.log('📦 Prepared post data:', postData);

      const { data, error } = await supabase
        .from('community_posts')
        .insert(postData) // Single object, not array
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating post:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Post created successfully:', data);

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error in createPost:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(
    postId: string,
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🗑️ Deleting post:', postId);

      // Delete post (reactions will be deleted automatically with CASCADE)
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId); // Security: only owner can delete

      if (error) {
        console.error('❌ Error deleting post:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Post deleted successfully');

      // 🔔 EMIT EVENT
      eventManager.emit(EVENTS.POST_DELETED, { postId });

      return { success: true, error: null };
    } catch (error: any) {
      console.error('❌ Error in deletePost:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a post
   */
  static async updatePost(
    postId: string,
    userId: string,
    updates: {
      content?: string;
      image_url?: string;
      metrics?: any;
    }
  ): Promise<{ data: any | null; error: string | null }> {
    try {
      console.log('🔄 Updating post:', postId);

      const { data, error } = await supabase
        .from('community_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', userId) // Security: only owner can update
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating post:', error);
        return { data: null, error: error.message };
      }

      console.log('✅ Post updated successfully');

      // 🔔 EMIT EVENT
      eventManager.emit(EVENTS.POST_UPDATED, { post: data });

      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error in updatePost:', error);
      return { data: null, error: error.message };
    }
  }
}