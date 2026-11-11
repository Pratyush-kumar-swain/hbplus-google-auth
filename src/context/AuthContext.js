import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut, onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ALLOWED_DOMAIN, ERROR_RESTRICTED } from '../config/constants';
import { isAllowedEmail, syncUserProfile } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [initializing, setInitializing] = useState(true); // restoring session
  const [signingIn, setSigningIn] = useState(false);       // button spinner
  const [error, setError] = useState(null);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // Single gate: EVERY sign-in (web or native) passes through here.
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) { setUser(null); setRole(null); setInitializing(false); return; }
      if (!isAllowedEmail(fbUser.email) || !fbUser.emailVerified) {
        setError(ERROR_RESTRICTED);
        await signOut(auth);
        setSigningIn(false);
        return;
      }
      const profile = await syncUserProfile(fbUser);
      setRole(profile.role);
      setUser(fbUser);
      setError(null);
      setSigningIn(false);
      setInitializing(false);
    });
  }, []);

  // Native: finish once Google returns an ID token
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const cred = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, cred).catch(() => {
        setError('Sign-in failed. Please try again.'); setSigningIn(false);
      });
    } else {
      if (response.type === 'error') setError('Sign-in failed. Please try again.');
      setSigningIn(false);
    }
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    setError(null); setSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' }); // UX hint only
        await signInWithPopup(auth, provider);
      } else {
        await promptAsync();
      }
    } catch (e) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Please try again.');
      }
      setSigningIn(false);
    }
  }, [promptAsync]);

  const logout = useCallback(async () => { await signOut(auth); }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin: role === 'admin', initializing, signingIn, error, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
