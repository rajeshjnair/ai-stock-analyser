import { auth } from '../config/firebase';
import { UserModel } from '../models/user.model';
import type { UserTier } from '@ai-stock-analyser/shared';

/**
 * Firebase user information
 */
export interface FirebaseUserInfo {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
}

/**
 * Verify Firebase ID token
 * @param token - Firebase ID token from client
 * @returns Decoded token with user information
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token expired');
    }
    if (error.code === 'auth/id-token-revoked') {
      throw new Error('Token revoked');
    }
    if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Get user from MongoDB or create if doesn't exist
 * @param firebaseUser - Firebase user information
 * @returns MongoDB user document
 */
export async function getOrCreateUser(firebaseUser: FirebaseUserInfo) {
  const { uid, email, emailVerified, displayName, photoURL } = firebaseUser;

  // Try to find existing user
  let user = await UserModel.findOne({ firebaseUid: uid });

  if (user) {
    // Update user info if changed
    let hasChanges = false;

    if (email && user.email !== email) {
      user.email = email;
      hasChanges = true;
    }

    if (emailVerified !== undefined && user.emailVerified !== emailVerified) {
      user.emailVerified = emailVerified;
      hasChanges = true;
    }

    if (displayName && user.displayName !== displayName) {
      user.displayName = displayName;
      hasChanges = true;
    }

    if (photoURL && user.photoURL !== photoURL) {
      user.photoURL = photoURL;
      hasChanges = true;
    }

    if (hasChanges) {
      await user.save();
    }

    return user;
  }

  // Create new user
  user = await UserModel.create({
    firebaseUid: uid,
    email: email || '',
    displayName: displayName || '',
    photoURL: photoURL || '',
    tier: 'FREE' as UserTier,
    watchlist: [],
  });

  return user;
}

/**
 * Update user's last login timestamp
 * @param userId - MongoDB user ID
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, {
    updatedAt: new Date(),
  });
}

/**
 * Get user by MongoDB ID
 * @param userId - MongoDB user ID
 * @returns User document or null
 */
export async function getUserById(userId: string) {
  return UserModel.findById(userId);
}

/**
 * Get user by Firebase UID
 * @param firebaseUid - Firebase user ID
 * @returns User document or null
 */
export async function getUserByFirebaseUid(firebaseUid: string) {
  return UserModel.findOne({ firebaseUid });
}

/**
 * Update user tier
 * @param userId - MongoDB user ID
 * @param tier - New user tier
 */
export async function updateUserTier(userId: string, tier: UserTier): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { tier });
}
