# Authentication Architecture

## Overview

The Nirdiś backend uses **session-based authentication** with **cookie-based sessions** and **Auth.js** as the authentication framework.

## Why Session-Based Authentication Over JWT?

### Security & Revocation
- **Immediate revocation**: Sessions can be invalidated server-side instantly, which is critical for security incidents or user logout.
- **No token storage concerns**: JWTs stored in localStorage are vulnerable to XSS attacks. Session cookies with HttpOnly flag are more secure.
- **Server-side control**: All authentication state is managed server-side, providing better control over user sessions.

### Statelessness Trade-off
- While JWTs offer statelessness, the benefits don't outweigh the security and revocation limitations for this application.
- Session storage overhead is minimal compared to the security gains.
- Database-backed sessions enable better analytics and session management features.

### Guest-to-User Transition
- Sessions make it easier to merge guest data with user accounts when users sign up or log in.
- We can track guest sessions and associate them with user accounts seamlessly.

## Why Cookie-Based Sessions?

### Security Benefits
- **HttpOnly cookies**: Prevent JavaScript access, mitigating XSS attacks.
- **Secure flag**: Ensures cookies only sent over HTTPS in production.
- **SameSite protection**: Reduces CSRF attack surface.

### Seamless User Experience
- Cookies are automatically sent with requests, reducing client-side complexity.
- No need for manual token management in frontend code.
- Works seamlessly across subdomains when configured properly.

### Framework Integration
- Auth.js and most session libraries are designed around cookie-based sessions.
- Better integration with Fastify's cookie handling.

## Why Auth.js?

### Multi-Provider Support
- Built-in support for Google OAuth, email/password, and other providers.
- Consistent API across different authentication methods.
- Easy to add new providers in the future.

### Framework Agnostic
- Works with Fastify (via adapters).
- Well-maintained and actively developed.
- Large community and extensive documentation.

### Session Management
- Built-in session handling that integrates with our database.
- Automatic session creation, validation, and cleanup.
- Secure session token generation and validation.

### Type Safety
- Excellent TypeScript support.
- Type-safe authentication flows.
- Better developer experience.

## Guest → User Merging Strategy

### High-Level Flow

1. **Guest Session Creation**
   - When a user visits without authentication, a `Guest` record is created.
   - A session is established with a guest identifier (not tied to a user).
   - All usage logs are associated with the `guest_id`.

2. **User Authentication**
   - When a user signs up or logs in (via Google OAuth or email), a `User` record is created/retrieved.
   - The existing guest session is identified (via session cookie or device fingerprinting).

3. **Data Merging**
   - All `UsageLog` records with the current `guest_id` are updated to set `user_id` and clear `guest_id`.
   - The `Guest` record's usage counters (`astrology_reads_used`, `palm_reads_used`) are transferred to the user's account if needed.
   - The `Guest` record can be deleted or kept for analytics (TBD based on requirements).

4. **Session Transition**
   - The session is updated to reference the `user_id` instead of `guest_id`.
   - Future requests are authenticated as the user.
   - The user continues their session seamlessly without losing usage history.

### Implementation Considerations

- **Atomicity**: The merge operation should be atomic to prevent data loss.
- **Idempotency**: The merge should be safe to retry if it fails partway through.
- **Analytics**: Consider keeping guest records for analytics even after merging.
- **Edge Cases**: Handle scenarios where a user logs in on a new device (no guest session to merge).

## Security Considerations

- All sessions are stored server-side in the database.
- Session tokens are cryptographically secure and randomly generated.
- Sessions expire after a configurable period of inactivity.
- Password hashing uses industry-standard algorithms (bcrypt/argon2).
- OAuth flows follow OAuth 2.0 best practices.

## Future Considerations

- **Multi-device sessions**: Track and manage sessions across devices.
- **Session analytics**: Monitor active sessions, login patterns, etc.
- **Remember me**: Long-lived sessions for trusted devices.
- **Two-factor authentication**: Can be added as an additional layer on top of session-based auth.
