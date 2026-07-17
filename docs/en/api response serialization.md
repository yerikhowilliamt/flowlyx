# 📝 Changelog Documentation: API Serialization & Swagger Integration

This document summarizes all architectural changes and features implemented on the `feature/api-response-serialization` branch. The main focus of this development is standardizing the API response format to comply with enterprise production levels, while fully integrating the Swagger interactive documentation.

---

## ✨ New Features & Architectural Changes

### 1. Automatic Serialization System (_Class-Transformer_)

- **Objective:** Ensure the API never accidentally leaks sensitive data (such as `passwordHash` or other internal database columns) to the client.
- **Dependency Installation:** Added `class-transformer` into `package.json` (`apps/api`).
- **Interceptor Creation:** Created `SerializeInterceptor` (`src/common/interceptors/serialize.interceptor.ts`) that wraps responses using `plainToInstance` with the strict parameter `excludeExtraneousValues: true`.
- **Controller Refactor:** Removed manual data stripping logic (e.g., `const { passwordHash, ...result } = user;`) from Controllers. Data stripping is now automatically handled by the Interceptor in the background.

### 2. Snake Case Format Standardization

- **Objective:** The industry standard for JSON responses is `snake_case` (e.g., `access_token`), while TypeScript code uses `camelCase` (e.g., `accessToken`).
- **Global Transformation:** Updated 100% of the DTO Models (e.g., `UserResponse`, `WorkspaceSummary`, etc.) automatically.
- Added `{ name: 'snake_case_format' }` parameters to both `@ApiProperty` (for Swagger alignment) and `@Expose` (for `class-transformer` data parsing).
- **Auth Update:** Modified the `/auth/login` endpoint response structure from returning `{ accessToken }` to returning `{ access_token }`.

### 3. Comprehensive Swagger (OpenAPI) Documentation

- **Grouping (@ApiTags):** Automatically injected `@ApiTags('Module Name')` into all controllers (`Auth`, `Users`, `Organizations`, `Workspaces`, `Projects`, `Boards`, `Lists`, `Tasks`, `Subtasks`, `Labels`, and `Project Members`) to cleanly categorize endpoints instead of clustering them under the "default" label.
- **Response Specifications:** Embedded `@ApiOperation`, `@ApiOkResponse`, and `@ApiCreatedResponse` into all CRUD endpoints across all controllers, linking them to relevant models (e.g., `@ApiOkResponse({ type: [WorkspaceSummary] })`).

---

## 🔒 Security Audit Confirmation

The current Auth Token system has been reviewed and deemed compliant with production security standards for Single Page Application (SPA) architectures:

1. **Refresh Token** is securely sent via Cookie (`httpOnly: true`, `secure: true`, `sameSite: 'strict'`) to prevent XSS (Cross-Site Scripting) vulnerabilities.
2. **Access Token** is sent via the JSON body response to be temporarily stored in client memory (state), keeping the system immune to CSRF (Cross-Site Request Forgery) exploits.
