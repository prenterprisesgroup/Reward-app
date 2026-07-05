# Refresh Token Architecture Strategy

## Architecture & Flow
1. **Login**: 
   - User authenticates successfully.
   - Server generates a short-lived **Access Token** (e.g., 15 minutes) and a long-lived **Refresh Token** (e.g., 7 days).
   - Access Token is returned in the JSON response payload.
   - Refresh Token is set as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
2. **Accessing Protected Routes**:
   - The frontend includes the Access Token in the `Authorization: Bearer <token>` header.
3. **Token Expiration**:
   - When the Access Token expires, API returns `401 Unauthorized`.
   - Frontend intercepts the `401` and calls a `/api/v1/auth/refresh` endpoint.
   - The server reads the HttpOnly cookie, verifies the Refresh Token against the database (ensuring it's not blacklisted), and issues a new Access Token.
4. **Logout**:
   - The server clears the Refresh Token cookie and adds the current Refresh Token family to the `TokenBlacklist`.

## Security Benefits
- **XSS Protection**: Since the long-lived refresh token is `HttpOnly`, it cannot be stolen via Cross-Site Scripting (XSS).
- **CSRF Protection**: By keeping the Access Token in memory and sending it via headers, we mitigate Cross-Site Request Forgery (CSRF).
- **Revocation**: A database-backed refresh token allows immediate revocation of user sessions (e.g., on password change, account suspension, or logout) without waiting for a 7-day JWT to naturally expire.

## Pros
- Drastically reduces the impact of a stolen Access Token.
- Better session management capabilities (e.g., "Log out of all devices").
- Transparent to the user; they stay logged in without compromising security.

## Migration Plan
1. Add `RefreshToken` schema mapping tokens to `workerId` and `deviceFingerprint`.
2. Update `/api/v1/auth/login` to set the HttpOnly cookie.
3. Create `/api/v1/auth/refresh` endpoint.
4. Update frontend Axios interceptors to seamlessly handle 401s and call `/refresh`.
5. Deprecate the old 7-day Access Token format gracefully by supporting both for 1 version cycle.
