// src/types/community.types.ts

export type PostType = 'progress' | 'tips' | 'photo' | 'story';
export type ReactionType = 'like' | 'support' | 'celebrate';

export interface CommunityPost {
  id: string;
  user_id: string;
  post_type: PostType;
  content: string;
  image_url?: string | null;
  metrics?: {
    steps?: number;
    calories?: number;
    distance?: number;
    duration?: number;
  } | null;
  reactions_count: {
    likes: number;
    supports: number;
    celebrates: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CommunityPostWithUser extends CommunityPost {
  user: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
  user_reaction?: ReactionType | null;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

// Database Insert Types
export interface PostInsert {
  user_id: string;
  post_type: PostType;
  content: string;
  image_url?: string | null;
  metrics?: {
    steps?: number;
    calories?: number;
    distance?: number;
    duration?: number;
  } | null;
}

export interface ReactionInsert {
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
}
