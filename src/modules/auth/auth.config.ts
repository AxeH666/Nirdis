import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "@auth/core/providers/google";
import type { AuthConfig } from "@auth/core";
import { prisma } from "../../config/prisma";

/**
 * Auth.js configuration for Fastify + Prisma + Google OAuth
 *
 * Key configuration requirements:
 * 1. PrismaAdapter for database sessions
 * 2. Explicit cookie settings for non-Next.js environments
 * 3. trustHost: true for environments without AUTH_URL
 * 4. Proper callback handlers for session/user data
 */

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Base URL for auth - required for proper redirect URLs
const baseUrl = process.env.AUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Ensure we get profile info including email
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
    // Session expires in 30 days
    maxAge: 30 * 24 * 60 * 60,
    // Refresh session every 24 hours
    updateAge: 24 * 60 * 60,
  },

  // CRITICAL: Secret must be set for CSRF token generation
  secret: process.env.AUTH_SECRET,

  // Trust the Host header - required for non-Vercel deployments
  trustHost: true,

  // Explicit cookie configuration for non-Next.js environments
  // This prevents "MissingCSRF" errors by ensuring consistent cookie behavior
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: isProduction ? "__Secure-authjs.callback-url" : "authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction ? "__Host-authjs.csrf-token" : "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    pkceCodeVerifier: {
      name: isProduction ? "__Secure-authjs.pkce.code_verifier" : "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    state: {
      name: isProduction ? "__Secure-authjs.state" : "authjs.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        maxAge: 60 * 15, // 15 minutes
      },
    },
    nonce: {
      name: isProduction ? "__Secure-authjs.nonce" : "authjs.nonce",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  callbacks: {
    // Called when session is accessed
    async session({ session, user }) {
      // Add user ID to session for client access
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },

    // Called on successful sign in
    async signIn({ user, account, profile }) {
      // Allow all Google sign-ins by default
      // Add custom logic here if you need to restrict access
      if (account?.provider === "google" && profile?.email) {
        return true;
      }
      return true;
    },

    // Called when redirect URL is generated
    async redirect({ url, baseUrl: callbackBaseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${callbackBaseUrl}${url}`;
      }
      // Allow URLs on the same origin
      if (new URL(url).origin === callbackBaseUrl) {
        return url;
      }
      // Default to base URL
      return callbackBaseUrl;
    },
  },

  // Event handlers for debugging/logging
  events: {
    async signIn({ user, account }) {
      console.log(`[Auth] User signed in: ${user.email} via ${account?.provider}`);
    },
    signOut: async (params) => {
      if ("session" in params && params.session) {
        const session = params.session;
        // safe to use session here
      }

      if ("token" in params && params.token) {
        const token = params.token;
        // optional: handle token-based signout
      }
    },
    async createUser({ user }) {
      console.log(`[Auth] New user created: ${user.email}`);
    },
    async linkAccount({ user, account }) {
      console.log(`[Auth] Account linked: ${user.email} -> ${account.provider}`);
    },
  },

  // Show detailed errors in development only
  debug: process.env.NODE_ENV === "development",

  // Custom pages (optional - uncomment to use custom pages)
  // pages: {
  //   signIn: "/login",
  //   error: "/auth/error",
  // },
};
