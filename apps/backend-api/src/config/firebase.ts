import admin from 'firebase-admin';
import { env } from './env.js';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // Initialize with service account credentials
    if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      // Use default credentials (e.g., from GOOGLE_APPLICATION_CREDENTIALS env var)
      admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }

    console.log('Firebase Admin SDK initialized successfully');
    return admin.app();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

initializeFirebase();

// Export Firebase Auth instance
export const auth = admin.auth();

// Helper function to verify Firebase ID token
export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

// Helper function to get user by UID
export async function getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

// Helper function to create custom token
export async function createCustomToken(uid: string, claims?: object): Promise<string> {
  try {
    return await auth.createCustomToken(uid, claims);
  } catch (error) {
    console.error('Create custom token error:', error);
    throw error;
  }
}

export { admin };
