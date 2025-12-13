type EventCallback = (data?: any) => void;

interface EventMap {
  [eventName: string]: EventCallback[];
}

class SimpleEventEmitter {
  private events: EventMap = {};

  /**
   * Subscribe to an event
   * @param eventName - Name of the event
   * @param callback - Function to call when event is emitted
   */
  on(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    // Add callback to listeners array
    this.events[eventName].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event
   * @param callback - Function to remove
   */
  off(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      console.warn(`⚠️ No listeners found for event: ${eventName}`);
      return;
    }

    // Clean up if no listeners left
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  /**
   * Emit an event
   * @param eventName - Name of the event
   * @param data - Data to pass to listeners
   */
  emit(eventName: string, data?: any): void {
    if (!this.events[eventName]) {
      return;
    }

    // Call all listeners
    this.events[eventName].forEach((callback, index) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`  ❌ Error in listener ${index + 1} for ${eventName}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param eventName - Optional: specific event name to clear
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      const count = this.events[eventName]?.length || 0;
      delete this.events[eventName];
      console.log(`🧹 Removed all listeners for ${eventName} (count: ${count})`);
    } else {
      const totalCount = Object.values(this.events).reduce(
        (sum, listeners) => sum + listeners.length,
        0
      );
      this.events = {};
      console.log(`🧹 Removed all event listeners (total: ${totalCount})`);
    }
  }

  /**
   * Get listener count for an event
   * @param eventName - Name of the event
   * @returns Number of listeners
   */
  listenerCount(eventName: string): number {
    return this.events[eventName]?.length || 0;
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * Check if event has listeners
   * @param eventName - Name of the event
   * @returns True if event has listeners
   */
  hasListeners(eventName: string): boolean {
    return (this.events[eventName]?.length || 0) > 0;
  }

  /**
   * Subscribe to an event (one-time only)
   * @param eventName - Name of the event
   * @param callback - Function to call when event is emitted (only once)
   */
  once(eventName: string, callback: EventCallback): void {
    const onceWrapper: EventCallback = (data) => {
      callback(data);
      this.off(eventName, onceWrapper);
    };

    this.on(eventName, onceWrapper);
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Global instance for reminder events
 * Use this throughout your app
 */
export const reminderEvents = new SimpleEventEmitter();

// ==================== EVENT CONSTANTS ====================

/**
 * Standard event names for reminder operations
 * Use these constants instead of string literals
 */
export const REMINDER_EVENTS = {
  CREATED: 'reminder:created',
  UPDATED: 'reminder:updated',
  DELETED: 'reminder:deleted',
  TOGGLED: 'reminder:toggled',
  REFRESH: 'reminder:refresh',
} as const;

// ==================== TYPESCRIPT TYPES ====================

/**
 * Type for event names (for type safety)
 */
export type ReminderEventType = typeof REMINDER_EVENTS[keyof typeof REMINDER_EVENTS];

/**
 * Type for event data payloads
 */
export interface ReminderEventData {
  [REMINDER_EVENTS.CREATED]: {
    id: string;
    title: string;
    reminder_time: string;
  };
  [REMINDER_EVENTS.UPDATED]: {
    id: string;
    updates: any;
  };
  [REMINDER_EVENTS.DELETED]: string; // Just the ID
  [REMINDER_EVENTS.TOGGLED]: {
    id: string;
    active: boolean;
  };
  [REMINDER_EVENTS.REFRESH]: void;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Typed event emitter wrapper for reminder events
 */
export const emitReminderEvent = <K extends ReminderEventType>(
  event: K,
  data: ReminderEventData[K]
): void => {
  reminderEvents.emit(event, data);
};

/**
 * Typed event listener wrapper for reminder events
 */
export const onReminderEvent = <K extends ReminderEventType>(
  event: K,
  callback: (data: ReminderEventData[K]) => void
): void => {
  reminderEvents.on(event, callback);
};

// ==================== EXPORT FOR TESTING ====================

/**
 * Export the class for creating additional instances if needed
 */
export { SimpleEventEmitter };

