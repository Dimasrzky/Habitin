import auth from '@react-native-firebase/auth';

export const firebaseAuth = auth();

// Fungsi Register
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Fungsi Login
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Fungsi Logout
export const logout = async () => {
  try {
    await firebaseAuth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Fungsi cek user saat ini
export const getCurrentUser = () => {
  return firebaseAuth.currentUser;
};