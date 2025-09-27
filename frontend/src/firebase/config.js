// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAWjJnyY2p1sDG8R2g4qPT-COi4apDIDL8",
  authDomain: "app.nextnrgie.fr",
  projectId: "next-nr-gie",
  storageBucket: "next-nr-gie.firebasestorage.app",
  messagingSenderId: "770967302109",
  appId: "1:770967302109:web:ecd7573ab8947d4f4d5034",
  measurementId: "G-75K1FMH1W0"
};

// Action URL settings for password reset
export const getActionCodeSettings = () => ({
  // URL you want to redirect back to after password reset
  url: 'https://app.nextnrgie.fr/login',
  // This must be true for email link sign-in
  handleCodeInApp: false,
});
