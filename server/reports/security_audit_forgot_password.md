# Forgot Password Security Audit & Enhancements

This report summarizes the security audit and subsequent enhancements performed on the `forgot-password` and `reset-password` API endpoints.

## 1. Audit Findings

| Category | Finding | Risk |
| :--- | :--- | :--- |
| **Token Storage** | Reset tokens were stored in plaintext in the database. | **High**: If the database is compromised, an attacker can reset any user's password. |
| **Rate Limiting** | No rate limiting was applied to the `/forgot-password` endpoint. | **Medium**: Potential for spam and email enumeration at scale. |
| **Validation** | Missing or weak input validation (e.g., password length < 6). | **Medium**: Allows weak passwords and potentially malformed data. |
| **User Enumeration** | Implementation was mostly generic, but could be improved with better logging. | **Low**: Standard generic response was already in place. |
| **Audit Logging** | Minimal logging for failed or successful reset attempts. | **Low**: Difficult to track abuse or troubleshoot issues. |

## 2. Implemented Enhancements

### 🛡️ Token Hashing
- **Change**: Switched from plaintext storage to SHA-256 hashing for password reset tokens.
- **Security Impact**: Even if the database is leaked, reset tokens are useless without their plaintext counterpart.
- **Location**: [auth.controller.js](file:///c:/Users/yashk/Desktop/beacon/server/controllers/auth.controller.js)

### 🚦 Rate Limiting
- **Change**: Added `forgotPasswordLimiter` which restricts an IP to 3 requests per 15 minutes.
- **Security Impact**: Prevents automated scripts from spamming the service or attempting large-scale enumeration.
- **Location**: [rateLimiter.js](file:///c:/Users/yashk/Desktop/beacon/server/utils/rateLimiter.js) and [auth.routes.js](file:///c:/Users/yashk/Desktop/beacon/server/routes/auth.routes.js)

### ✅ Strict Validation
- **Change**: Integrated `express-validator` for both endpoints.
  - `forgot-password`: Validates email format and normalizes it.
  - `reset-password`: Enforces complex password requirements (8+ chars, upper, lower, digit, special).
- **Location**: [auth.validation.js](file:///c:/Users/yashk/Desktop/beacon/server/config/validation/auth.validation.js)

### 📝 Audit Logging
- **Change**: Added `console.info` for successful events and `console.warn` for suspicious activities (e.g., invalid tokens).
- **Location**: [auth.controller.js](file:///c:/Users/yashk/Desktop/beacon/server/controllers/auth.controller.js)

### 🧪 Automated Testing
- **Change**: Created a comprehensive test suite covering happy paths, edge cases, and abuse scenarios.
- **Location**: [auth.forgotPassword.test.js](file:///c:/Users/yashk/Desktop/beacon/server/tests/auth.forgotPassword.test.js)

## 3. Verification Results
The test suite `auth.forgotPassword.test.js` was executed and all 8 tests passed, confirming:
- Generic responses for both existing and non-existent emails.
- Successful reset flow with hashed tokens.
- Rejection of expired or invalid tokens.
- Rejection of weak passwords.
- Validation of email format.
