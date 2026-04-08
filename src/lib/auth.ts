/**
 * JWT authentication utilities.
 * Server-side only — use in Next.js API routes.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

interface JWTTokenPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COOKIE_NAME = "auth_token";
const TOKEN_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing environment variable: JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

/**
 * Hash a plain-text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------

/**
 * Create a signed JWT containing the given payload.
 * The token expires in 7 days.
 */
export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify<JWTTokenPayload>(token, getSecret());
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

// ---------------------------------------------------------------------------
// Cookie helper
// ---------------------------------------------------------------------------

/**
 * Read the `auth_token` cookie, verify the JWT, and return the user payload.
 * Returns `null` if the cookie is missing or the token is invalid.
 */
export async function getAuthFromCookies(
  cookies: ReadonlyRequestCookies,
): Promise<TokenPayload | null> {
  const token = cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
