import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth } from "./config";

// Set session persistence type
const setPersistenceType = async (persistenceType = 'local') => {
  try {
    const persistenceMode = persistenceType === 'session' 
      ? browserSessionPersistence 
      : browserLocalPersistence;
      
    await setPersistence(auth, persistenceMode);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting persistence:', error);
    return { success: false, error: error.message };
  }
};

// Create a new user with email and password
export const registerWithEmailAndPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user profile with displayName
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const loginWithEmailAndPassword = async (email, password, rememberMe = true) => {
  try {
    // Set persistence type based on rememberMe flag
    await setPersistenceType(rememberMe ? 'local' : 'session');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Store user ID in localStorage or sessionStorage based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem('authUserId', userCredential.user.uid);
    } else {
      sessionStorage.setItem('authUserId', userCredential.user.uid);
    }
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async (rememberMe = true) => {
  try {
    // Set persistence type based on rememberMe flag
    await setPersistenceType(rememberMe ? 'local' : 'session');
    
    const provider = new GoogleAuthProvider();
    // Add scopes for additional Google permissions if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    const userCredential = await signInWithPopup(auth, provider);
    
    // Store user ID in localStorage or sessionStorage based on rememberMe preference
    if (rememberMe) {
      localStorage.setItem('authUserId', userCredential.user.uid);
    } else {
      sessionStorage.setItem('authUserId', userCredential.user.uid);
    }
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const logoutUser = async () => {
  try {
    // Clear any stored auth data
    localStorage.removeItem('authUserId');
    sessionStorage.removeItem('authUserId');
    
    // Sign out from Firebase
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated based on both Firebase auth and local storage
export const isUserAuthenticated = () => {
  const currentUser = auth.currentUser;
  const storedUserId = localStorage.getItem('authUserId') || sessionStorage.getItem('authUserId');
  
  // User is authenticated if Firebase has a current user AND the user ID matches what we have stored
  return !!currentUser && currentUser.uid === storedUserId;
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};
