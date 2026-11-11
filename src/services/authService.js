import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ALLOWED_DOMAIN, ROLES } from '../config/constants';

/** Strict check: text after the LAST "@" must equal the allowed domain exactly.
 *  Blocks "x@hbplus.fit.evil.com" and "x@evilhbplus.fit". */
export function isAllowedEmail(email) {
  if (typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  return at > 0 && e.slice(at + 1) === ALLOWED_DOMAIN.toLowerCase();
}

/** Create the profile on first login (role = user); return the stored profile. */
export async function syncUserProfile(user) {
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        role: ROLES.USER,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      return { role: ROLES.USER };
    }
    await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
    return { role: snap.data().role || ROLES.USER };
  } catch {
    return { role: ROLES.USER }; // degrade gracefully if DB unreachable
  }
}
