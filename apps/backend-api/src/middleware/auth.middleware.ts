import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '../config/firebase';
import { getOrCreateUser, updateLastLogin } from '../services/auth.service';

/**
 * Extended FastifyRequest with authenticated user
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    uid: string;
    email?: string;
    mongoUserId: string;
    tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  };
}

/**
 * Extract token from Authorization header
 */
function extractToken(authorization?: string): string | null {
  if (!authorization) {
    return null;
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware that requires authentication
 * Returns 401 if token is missing or invalid
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractToken(request.headers.authorization);

    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing authentication token',
      });
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Get or create user in MongoDB
    const user = await getOrCreateUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    });

    // Attach user to request
    (request as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      mongoUserId: user._id.toString(),
      tier: user.tier,
    };

    // Update last login asynchronously (don't wait)
    updateLastLogin(user._id.toString()).catch((error) => {
      request.log.error({ error, userId: user._id }, 'Failed to update last login');
    });
  } catch (error: any) {
    request.log.error({ error }, 'Authentication error');

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/id-token-expired') {
      return reply.status(401).send({
        error: 'TokenExpired',
        message: 'Authentication token has expired',
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return reply.status(401).send({
        error: 'TokenRevoked',
        message: 'Authentication token has been revoked',
      });
    }

    if (error.code === 'auth/argument-error') {
      return reply.status(401).send({
        error: 'InvalidToken',
        message: 'Invalid authentication token format',
      });
    }

    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Failed to authenticate',
    });
  }
}

/**
 * Middleware that optionally authenticates
 * Continues without error if token is missing or invalid
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const token = extractToken(request.headers.authorization);

    if (!token) {
      // No token provided, continue without authentication
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);

    // Get or create user in MongoDB
    const user = await getOrCreateUser({
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    });

    // Attach user to request
    (request as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      mongoUserId: user._id.toString(),
      tier: user.tier,
    };

    // Update last login asynchronously (don't wait)
    updateLastLogin(user._id.toString()).catch((error) => {
      request.log.error({ error, userId: user._id }, 'Failed to update last login');
    });
  } catch (error: any) {
    // Log error but continue without authentication
    request.log.warn({ error }, 'Optional authentication failed');
  }
}
