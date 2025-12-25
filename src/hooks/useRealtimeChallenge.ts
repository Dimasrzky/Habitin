import { useEffect } from 'react';
import { auth } from '../config/firebase.config';
import { supabase } from '../config/supabase.config';

interface UseRealtimeChallengeProps {
  onChallengeUpdate: () => void;
  enabled?: boolean;
}

/**
 * Hook untuk subscribe ke perubahan real-time pada user_active_challenges
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

    // Subscribe to changes on user_active_challenges table
    const channel = supabase
      .channel('user-challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'user_active_challenges',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 Challenge realtime update:', payload.eventType);
          // Trigger callback to refetch data
          onChallengeUpdate();
        }
      )
      .subscribe();

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('🔕 Unsubscribing from challenge updates');
      supabase.removeChannel(channel);
    };
  }, [enabled, onChallengeUpdate]);
};
