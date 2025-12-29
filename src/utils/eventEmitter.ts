// src/utils/eventManager.ts

type EventCallback = (data?: any) => void;

class EventManager {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe ke event tertentu
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName)!.add(callback);

    // Return unsubscribe function
    return () => {  
      this.events.get(eventName)?.delete(callback);
    };
  }

  /**
   * Emit event ke semua subscribers
   */
  emit(eventName: string, data?: any): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Unsubscribe listener tertentu dari event
   * Jika callback tidak diberikan, hapus semua listeners untuk event tersebut
   */
  off(eventName: string, callback?: EventCallback): void {
    if (!callback) {
      // Hapus semua listeners untuk event ini
      this.events.delete(eventName);
    } else {
      // Hapus callback tertentu
      this.events.get(eventName)?.delete(callback);
    }
  }

  /**
   * Clear semua events
   */
  clear(): void {
    this.events.clear();
  }
}

// Singleton instance
export const eventManager = new EventManager();

// Event names constants untuk type safety
export const EVENTS = {
  // User events
  USER_PROFILE_UPDATED: 'user:profile:updated',
  USER_AVATAR_UPDATED: 'user:avatar:updated',
  
  // Community events
  POST_CREATED: 'community:post:created',
  POST_UPDATED: 'community:post:updated',
  POST_DELETED: 'community:post:deleted',
  COMMENT_ADDED: 'community:comment:added',
  
  // Challenge events
  CHALLENGE_PROGRESS_UPDATED: 'challenge:progress:updated',
  CHALLENGE_COMPLETED: 'challenge:completed',
  CHALLENGE_STARTED: 'challenge:started',
  
  // Health data events
  HEALTH_DATA_UPDATED: 'health:data:updated',
  LAB_RESULT_ADDED: 'health:lab:added',
} as const;

// Reminder-specific events and event emitter instance
export const REMINDER_EVENTS = {
  CREATED: 'reminder:created',
  UPDATED: 'reminder:updated',
  DELETED: 'reminder:deleted',
  TOGGLED: 'reminder:toggled',
} as const;

export const reminderEvents = new EventManager();