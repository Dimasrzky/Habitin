import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HAS_LAUNCHED: 'hasLaunched',
  USER_DATA: 'userData',
  AUTH_TOKEN: 'authToken',
};

class StorageService {
  async setHasLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
    } catch (error) {
      console.error('Error setting hasLaunched:', error);
    }
  }

  async getHasLaunched(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
      return value !== null;
    } catch (error) {
      console.error('Error getting hasLaunched:', error);
      return false;
    }
  }

  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(userData)
      );
    } catch (error) {
      console.error('Error setting userData:', error);
    }
  }

  async getUserData(): Promise<any | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting userData:', error);
      return null;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default new StorageService();