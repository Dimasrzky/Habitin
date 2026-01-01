import { useEffect } from 'react';
import { auth } from '../config/firebase.config';
import { supabase } from '../config/supabase.config';

interface UseRealtimeChallengeProps {
  onChallengeUpdate: () => void;
  enabled?: boolean;
}

/**
 * Hook untuk subscribe ke perubahan real-time pada:
 * - user_active_challenges (start, abandon, complete challenge)
 * - user_challenge_tasks (complete task)
 * - user_challenge_stats (stats update)
 * Akan trigger callback saat ada perubahan (INSERT, UPDATE, DELETE)
 */
export const useRealtimeChallenge = ({
  onChallengeUpdate,
  enabled = true,
}: UseRealtimeChallengeProps) => {
  useEffect(() => {
    if (!enabled) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userId = currentUser.uid;

    // Use unique channel name to prevent duplicate subscriptions
    const channelName = `user-challenges-${userId}-${Date.now()}`;

    // Subscribe to changes on multiple tables for comprehensive realtime updates
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_active_challenges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Active challenge update:', payload.eventType);
          onChallengeUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Task completion updates
          schema: 'public',
          table: 'user_challenge_tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Challenge task update:', payload.eventType);
          onChallengeUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Stats updates
          schema: 'public',
          table: 'user_challenge_stats',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Challenge stats update:', payload.eventType);
          onChallengeUpdate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('🔔 Subscribed to challenge realtime updates:', channelName);
        }
      });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('🔕 Unsubscribing from challenge updates:', channelName);
      supabase.removeChannel(channel);
    };
  }, [enabled, onChallengeUpdate]);
};
