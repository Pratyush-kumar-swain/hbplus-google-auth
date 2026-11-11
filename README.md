# HB+ Portal – Google login restricted to @hbplus.fit

React Native (Expo) + React Native for Web + Firebase Auth/Firestore. One codebase runs on Android, iOS and the browser.

## Setup
1. `npm install && npx expo install --fix` (aligns package versions with your Expo SDK)
2. **Firebase console**: create a project → Authentication → enable **Google** → Firestore Database (production mode) → paste `firestore.rules` into Rules.
3. Add a Web app in Firebase, copy its config. In Google Cloud → Credentials, create OAuth client IDs for Web (Firebase makes one automatically), Android and iOS.
4. `cp .env.example .env` and fill the values (`EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit`).
5. Run: `npm run web` | `npm run android` | `npm run ios`.
6. Add your deployed domain under Firebase → Authentication → Settings → **Authorized domains**.

## Deploy (Netlify)
Import the repo. Build command `npx expo export -p web`, publish dir `dist` (already in `netlify.toml`). Add all `EXPO_PUBLIC_*` variables in Netlify → Site settings → Environment variables.

## Authentication flow
1. User taps **Login with Google** (popup on web, `expo-auth-session` on mobile).
2. Firebase signs the user in and `onAuthStateChanged` fires.
3. The email is validated. If it is not `@hbplus.fit` (or not verified) the user is signed out immediately and sees: *"Access restricted. Please login using your official domain email."*
4. Otherwise a `users/{uid}` document is created (role `user`) or read, and the Dashboard opens.
5. **Log out** calls `signOut` and returns to Login.

## How domain restriction works (defense in depth)
- **UX hint**: Google `hd` parameter pre-filters the account picker (not trusted for security).
- **Client check**: `isAllowedEmail()` compares the text after the last `@` for exact equality, so `a@hbplus.fit.evil.com` fails.
- **Single gate**: every login path (web and native) goes through the auth listener, so none can skip the check.
- **Server-side**: `firestore.rules` rejects reads/writes unless the verified token email ends in `@hbplus.fit`. Client checks can be bypassed; rules cannot.

## Route protection
`RootNavigator` registers the Dashboard screen only when a user exists. Visiting `/dashboard` while signed out lands on Login.

## Token handling
Firebase manages ID tokens and refresh and persists them (IndexedDB on web, AsyncStorage on native). The app never stores tokens manually or in `localStorage`, and never logs them. Secrets are not committed (`.env` is git-ignored; Firebase web keys are public by design and protected by rules and authorized domains).

## Roles
New users get `role: "user"`. Rules prevent users from changing their own role. To make an admin, edit the `role` field to `admin` in Firestore. The dashboard shows admin-only content accordingly.

## Structure
```
src/config      constants, firebase init
src/services    domain validation, user profile DB
src/context     AuthContext (state, sign-in, logout)
src/navigation  protected routing
src/screens     Login, Dashboard
```
