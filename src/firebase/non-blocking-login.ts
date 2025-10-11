
import { signInAnonymously, Auth } from 'firebase/auth';

/**
 * Initiates an anonymous sign-in process non-blockingly.
 * It does not wait for the sign-in to complete and handles errors silently.
 * This is useful for creating a seamless experience where the user gets a
 * temporary account in the background without any UI interruption.
 * @param {Auth} auth - The Firebase Auth instance.
 */
export function initiateAnonymousSignIn(auth: Auth): void {
  signInAnonymously(auth).catch((error) => {
    // Silently handle errors. In a production app, you might want to
    // log these to an error reporting service.
    console.error('Anonymous sign-in failed', error);
  });
}
