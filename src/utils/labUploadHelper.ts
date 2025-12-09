import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
export const UPLOAD_MODAL_SHOWN_KEY = 'upload_modal_shown';
export const LAB_UPLOAD_SKIPPED_KEY = 'lab_upload_skipped';
export const HAS_UPLOADED_LAB_KEY = 'has_uploaded_lab';

/**
 * Mark lab as uploaded successfully
 */
export const markLabAsUploaded = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_UPLOADED_LAB_KEY, 'true');
    await AsyncStorage.removeItem(LAB_UPLOAD_SKIPPED_KEY); // Remove skip flag
    console.log('✅ Lab marked as uploaded');
  } catch (error) {
    console.error('Error marking lab as uploaded:', error);
    throw error;
  }
};

/**
 * Check if user has uploaded lab
 */
export const hasUploadedLab = async (): Promise<boolean> => {
  try {
    const uploaded = await AsyncStorage.getItem(HAS_UPLOADED_LAB_KEY);
    return uploaded === 'true';
  } catch (error) {
    console.error('Error checking lab upload status:', error);
    return false;
  }
};

/**
 * Check if user skipped upload
 */
export const hasSkippedUpload = async (): Promise<boolean> => {
  try {
    const skipped = await AsyncStorage.getItem(LAB_UPLOAD_SKIPPED_KEY);
    return skipped === 'true';
  } catch (error) {
    console.error('Error checking skip status:', error);
    return false;
  }
};

/**
 * Reset all lab upload status (for testing)
 */
export const resetLabUploadStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(UPLOAD_MODAL_SHOWN_KEY);
    await AsyncStorage.removeItem(LAB_UPLOAD_SKIPPED_KEY);
    await AsyncStorage.removeItem(HAS_UPLOADED_LAB_KEY);
  } catch (error) {
    console.error('Error resetting lab upload status:', error);
    throw error;
  }
};