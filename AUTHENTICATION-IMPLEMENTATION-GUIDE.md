# Authentication Implementation Guide for apps/web

**Purpose:** Implement production-ready authentication using better-auth and TanStack Start, learning from web-old's implementation while avoiding its pitfalls.

**Target:** This guide is for implementing authentication in `apps/web` (TanStack Start app) with Clean Architecture principles.

## 🎯 Quick Status

**✅ IMPLEMENTATION COMPLETE** - All phases 1-3 finished, ready for testing

| Status | Item |
|--------|------|
| ✅ | better-auth installed and configured |
| ✅ | Database tables created and verified |
| ✅ | Server and client auth setup |
| ✅ | Login/logout UI components |
| ✅ | Protected routes with guards |
| ✅ | TEST_USER replaced with real auth |
| ✅ | Type check passing |
| ✅ | Lint passing |
| ✅ | Build succeeding |
| 🧪 | Ready for OAuth flow testing |

**See [Implementation Status](#implementation-status) for details.**

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Critical Analysis of web-old](#critical-analysis-of-web-old)
3. [Implementation Guidelines](#implementation-guidelines)
4. [Better-Auth Documentation Summary](#better-auth-documentation-summary)
5. [TanStack Start Auth Patterns](#tanstack-start-auth-patterns)
6. [Implementation Tasks](#implementation-tasks)
7. [File Structure](#file-structure)

---

## Architecture Overview

### Technology Stack
- **better-auth** v1.3.27+ - Authentication framework
- **TanStack Start** - Full-stack React framework with SSR
- **Kysely** - Type-safe SQL query builder (already in use)
- **PostgreSQL** - Database (already configured)
- **Google OAuth** - Social authentication provider

### Authentication Flow
1. User clicks "Sign in with Google"
2. better-auth redirects to Google OAuth
3. Google redirects back to callback URL
4. better-auth creates session (HTTP-only cookie)
5. Session stored in PostgreSQL
6. Protected routes check session via server functions
7. Client receives user data via `useSession()` hook

### Database Schema
Required tables (better-auth standard):
- `user` - User profiles with additional fields (activePlan, activeSubscriptionId, preferredLocale)
- `session` - Active sessions
- `account` - OAuth provider connections
- `verification` - Email verification tokens

---

## Critical Analysis of web-old

### ISSUES TO AVOID ❌

#### 1. Unsafe Type Assertions
**Location:** `web-old/src/server/functions/tasks.ts:14`
```typescript
// ❌ BAD: Type assertion bypasses safety
const session = await auth.api.getSession({
  headers: request.headers as any,
});
```

**Problem:** `as any` defeats TypeScript type checking
**Solution:** Use proper header typing or type guards

---

#### 2. Duplicate getCurrentUser() Function
**Locations:**
- `web-old/src/server/functions/tasks.ts:11-28`
- `web-old/src/server/functions/user.ts:11-28`

```typescript
// ❌ BAD: Duplicated in multiple files
async function getCurrentUser(): Promise<User> {
  const request = getWebRequest();
  const session = await auth.api.getSession({
    headers: request.headers as any,
  });

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  return { /* map session to user */ };
}
```

**Problems:**
- Code duplication violates DRY principle
- No centralized auth logic
- Cannot add features like audit logging
- Inconsistent error handling

**Solution:** Create single shared utility function

---

#### 3. String-Based Error Messages
```typescript
// ❌ BAD: Unstructured error
throw new Error("UNAUTHORIZED");
```

**Problems:**
- Client cannot distinguish error types
- No error recovery strategies
- No context for debugging
- Cannot handle different auth failures differently

**Solution:** Use typed error classes or error codes

---

#### 4. Incomplete Route Guards
**Location:** `web-old/src/routes/_authenticated/_subscribed.tsx:8-16`
```typescript
// ❌ BAD: Says "Redirecting" but never redirects
function SubscriptionLayout() {
  const { currentUser } = useCurrentUser();

  if (!currentUser || !currentUser.activePlan) {
    return <div>Redirecting to subscription...</div>;  // Never actually redirects!
  }

  return <Outlet />;
}
```

**Problem:** User sees "Redirecting..." indefinitely
**Solution:** Use `useNavigate()` or `throw redirect()`

---

#### 5. Mixing Auth States with Errors
**Location:** `web-old/src/providers/SessionProvider.tsx:38-51`
```typescript
// ❌ BAD: Both conditions throw errors
export const useCurrentUser = () => {
  const { session, error } = useSession();

  if (!session) {
    throw new Error("useCurrentUser must be used within a SessionProvider");
  }

  if (error) {
    throw new Error("Error fetching session", { cause: error });
  }

  return { currentUser: session.user };
};
```

**Problems:**
- Cannot distinguish "not authenticated" from "network error"
- Breaks React error boundaries with wrong context
- No recovery path for transient errors

**Solution:** Return error state separately from authentication state

---

#### 6. Framework-Specific Coupling
```typescript
// ❌ BAD: Tightly coupled to Vinxi
import { getWebRequest } from "vinxi/http";

async function getCurrentUser() {
  const request = getWebRequest();  // Cannot test or reuse
  // ...
}
```

**Problems:**
- Cannot unit test without full server environment
- Cannot migrate to different framework
- Cannot share logic with standard Node.js endpoints

**Solution:** Use dependency injection or framework-agnostic patterns

---

#### 7. No Connection Error Handling
**Location:** `packages/db/src/connection.ts:9-16`
```typescript
// ❌ BAD: No error handling
export const createPgPool = (sentry?: SentryInterface) => {
  if (!pgPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    pgPool = sentry ? createSentryInstrumentedPool(pool, sentry) : pool;
  }
  return pgPool;
};
```

**Problem:** Pool creation could fail silently
**Solution:** Add error event listeners and validation

---

### PATTERNS TO KEEP ✅

#### 1. Clean Architecture Separation
- Auth logic separated from business logic
- Use cases don't directly depend on auth mechanism
- Repositories abstract database access

#### 2. Context-Based Session Management
```typescript
// ✅ GOOD: React Context for session state
<SessionProvider>
  {/* App has access to useSession() and useCurrentUser() */}
</SessionProvider>
```

#### 3. Better-Auth Integration
- Production-ready library
- Good TypeScript support
- Battle-tested OAuth implementation

#### 4. Router-Level Route Guards
```typescript
// ✅ GOOD: Protected routes via layout
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();
    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    return { user };
  },
});
```

---

## Implementation Guidelines

### Core Principles

1. **Type Safety First**
   - No `as any` assertions
   - Use type guards for runtime validation
   - Leverage TypeScript strict mode

2. **DRY (Don't Repeat Yourself)**
   - Single source of truth for auth logic
   - Reusable auth utilities
   - Centralized error handling

3. **Explicit Error Handling**
   - Return error states, don't just throw
   - Distinguish auth errors from network errors
   - Provide recovery paths

4. **Testability**
   - Avoid framework-specific functions in business logic
   - Use dependency injection
   - Mock-friendly abstractions

5. **Security by Default**
   - HTTP-only cookies
   - SameSite cookie settings
   - CSRF protection enabled
   - No secrets in code

### DO ✅

- Use `createServerFn` for auth-related server functions
- Use `beforeLoad` in route definitions for protection
- Return user context from protected route loaders
- Use better-auth's built-in CSRF protection
- Store sessions in PostgreSQL (already configured)
- Use `inferAdditionalFields` for type inference
- Centralize `getCurrentUser()` logic
- Use typed errors or error codes
- Handle both "not authenticated" and "error" states
- Add connection error listeners to database pool

### DON'T ❌

- Don't use `as any` for type assertions
- Don't duplicate `getCurrentUser()` across files
- Don't throw generic string errors
- Don't use `getWebRequest()` in shared utilities
- Don't forget to actually redirect when showing "Redirecting..."
- Don't mix authentication state with error state
- Don't create global singleton pools without error handling
- Don't ignore the `error` return from `useSession()`
- Don't trust request headers without validation
- Don't commit `.env` files with OAuth secrets

---

## Better-Auth Documentation Summary

### Installation

```bash
pnpm add better-auth
```

### Environment Variables
Create `.env` file:
```env
BETTER_AUTH_SECRET=<random-string>  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000  # Dev, change for prod
DATABASE_URL=postgresql://user:password@localhost:5432/db  # Already have this
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
```

### Server Setup: Create `src/utils/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { getKyselyDb } from "@tasks/db";

export const auth = betterAuth({
  database: getKyselyDb(),  // Use existing Kysely instance

  // Additional user fields (Clean Architecture domain entities)
  user: {
    additionalFields: {
      activePlan: {
        type: "string",  // "pro" | null
        required: false,
      },
      activeSubscriptionId: {
        type: "string",
        required: false,
      },
      preferredLocale: {
        type: "string",  // "en" | "fr" | null
        required: false,
      },
    },
  },

  // Google OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,  // 5 minutes
    },
  },
});
```

### Database Schema Migration

```bash
# Generate migration
pnpm db:create better-auth-tables

# Or use better-auth CLI
npx @better-auth/cli migrate
```

The CLI will create 4 tables: `user`, `session`, `account`, `verification`

### Mount Handler: Create `src/routes/api/auth/$.ts`

```typescript
import { auth } from '@/utils/auth';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
```

### Cookie Plugin for TanStack Start

```typescript
import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
  // ... other config
  plugins: [
    reactStartCookies(),  // Must be LAST in plugins array
  ],
});
```

### Client Setup: Create `src/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      activePlan: {
        type: "string",
        required: false,
      },
      activeSubscriptionId: {
        type: "string",
        required: false,
      },
      preferredLocale: {
        type: "string",
        required: false,
      },
    }),
  ],
  fetchOptions: {
    fetchOnWindowFocus: false,
  },
});
```

### Session Provider: Create `src/providers/SessionProvider.tsx`

```typescript
import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/auth-client";

interface SessionContextType {
  session: ReturnType<typeof authClient.useSession>["data"];
  isLoading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();

  return (
    <SessionContext.Provider
      value={{
        session: session || null,
        isLoading: isPending,
        error: error || null,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};

// For protected routes - returns user or null
export const useCurrentUser = () => {
  const { session, error, isLoading } = useSession();

  return {
    currentUser: session?.user || null,
    isLoading,
    error,
  };
};
```

### Login Component

```typescript
import { authClient } from "@/auth-client";

export function LoginWithGoogle() {
  const handleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/",  // Redirect after login
    });
  };

  return (
    <button onClick={handleLogin}>
      Sign in with Google
    </button>
  );
}
```

### Google OAuth Configuration

**Get credentials from:** https://console.cloud.google.com/apis/dashboard

**Authorized redirect URIs:**
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

**Environment variables:**
```env
GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<client-secret>
```

---

## TanStack Start Auth Patterns

### Session Hook (Built-in)

```typescript
import { useSession } from "@tanstack/react-start/server";

export function useAppSession() {
  return useSession({
    name: 'app-session',
    password: process.env.SESSION_SECRET!,  // Min 32 chars
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
```

**Note:** With better-auth, session management is handled automatically. This TanStack pattern is only needed for custom session implementations.

### Server Function for Auth

```typescript
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@/utils/auth";

export const getCurrentUserFn = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return null;  // Not authenticated
    }

    return {
      id: session.user.id,
      email: session.user.email,
      activePlan: session.user.activePlan as "pro" | null,
      activeSubscriptionId: session.user.activeSubscriptionId || null,
      preferredLocale: session.user.preferredLocale as "en" | "fr" | null,
    };
  });
```

### Protected Route Layout

```typescript
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getCurrentUserFn } from "@/server/functions/auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn();

    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user };
  },
  component: () => <Outlet />,
});
```

### Security Best Practices

1. **Password Security:** Use bcrypt with 12+ salt rounds (better-auth uses scrypt by default)
2. **Rate Limiting:** Implement on login endpoints (5 attempts per 15 minutes)
3. **CSRF Protection:** Enabled by default in better-auth
4. **HTTP-only Cookies:** Prevents XSS attacks
5. **SameSite Cookies:** Prevents CSRF attacks
6. **Secure Flag:** HTTPS-only in production
7. **Session Expiration:** Configure maxAge limits

---

## Implementation Tasks

### Phase 1: Core Setup (Priority 1) ✅

1. **Install Dependencies**
   - [x] `pnpm add better-auth` (v1.3.28)
   - [x] Verify `@tasks/db` is in dependencies

2. **Environment Configuration**
   - [x] Add `BETTER_AUTH_SECRET` to `.env`
   - [x] Add `BETTER_AUTH_URL` to `.env`
   - [x] Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - [x] Ensure `.env` is in `.gitignore`

3. **Database Schema**
   - [x] Run `npx @better-auth/cli migrate` OR
   - [x] Create migration file manually with 4 tables
   - [x] Verify tables created: `user`, `session`, `account`, `verification`

4. **Server Auth Setup**
   - [x] Create `src/utils/auth.ts` with better-auth config
   - [x] Configure Kysely adapter: `database: getKyselyDb()`
   - [x] Add user additional fields (activePlan, activeSubscriptionId, preferredLocale)
   - [x] Add Google OAuth provider
   - [x] Add `reactStartCookies()` plugin (LAST in array)

5. **Mount Auth Handler**
   - [x] Create `src/routes/api/auth/$.ts`
   - [x] Add GET and POST handlers
   - [x] Test endpoint: `curl http://localhost:3000/api/auth/session`

### Phase 2: Client Setup (Priority 2) ✅

6. **Client Initialization**
   - [x] Create `src/auth-client.ts`
   - [x] Configure baseURL (simplified, no additional plugins needed)

7. **Session Provider**
   - [x] Create `src/providers/SessionProvider.tsx`
   - [x] Implement `useSession()` hook
   - [x] Implement `useCurrentUser()` hook (returns null, not throw)
   - [x] Wrap app in `<SessionProvider>` in root route

8. **Login UI**
   - [x] Create `src/components/LoginWithGoogle.tsx`
   - [x] Create `src/routes/login.tsx`
   - [x] Add Google OAuth button
   - [x] Handle `callbackURL` redirect parameter

9. **Logout**
   - [x] Create `src/components/LogoutButton.tsx`
   - [x] Call `authClient.signOut()`
   - [x] Add to Header component

### Phase 3: Protected Routes (Priority 3) ✅

10. **Create Centralized Auth Utility**
    - [x] Create `src/server/functions/auth.ts`
    - [x] Implement `getCurrentUserFn()` server function
    - [x] Return `User` type from `@tasks/core`
    - [x] Map better-auth session to domain `User` entity
    - [x] Handle errors gracefully (return null, not throw)

11. **Protected Route Layout**
    - [x] Create `src/routes/_authenticated.tsx`
    - [x] Add `beforeLoad` hook calling `getCurrentUserFn()`
    - [x] Redirect to `/login` if not authenticated
    - [x] Pass redirect URL in search params
    - [x] Return user context from loader

12. **Update Todos Route**
    - [x] Move `src/routes/todos.tsx` to `src/routes/_authenticated/todos.tsx`
    - [x] Update `src/server/functions/tasks.ts`
    - [x] Replace `TEST_USER` with `getCurrentUserFn()`
    - [x] Handle case where user is null

### Phase 4: Testing & Refinement (Priority 4)

13. **Test Authentication Flow**
    - [ ] Test Google OAuth login flow
    - [ ] Test session persistence across page reloads
    - [ ] Test logout flow
    - [ ] Test protected route access (authenticated)
    - [ ] Test protected route redirect (unauthenticated)

14. **Error Handling**
    - [ ] Test network errors during auth
    - [ ] Test expired sessions
    - [ ] Test invalid OAuth callbacks
    - [ ] Add user-friendly error messages

15. **Security Verification**
    - [ ] Verify cookies are HTTP-only
    - [ ] Verify cookies have SameSite attribute
    - [ ] Verify HTTPS in production
    - [ ] Verify no secrets in committed code
    - [ ] Test CSRF protection

### Phase 5: Optional Enhancements

16. **Subscription Guard (If Needed)**
    - [ ] Create `src/routes/_authenticated/_subscribed.tsx`
    - [ ] Check `currentUser.activePlan`
    - [ ] Actually redirect to subscription page (use `throw redirect()`)

17. **Audit Logging (If Needed)**
    - [ ] Log login events
    - [ ] Log logout events
    - [ ] Log failed auth attempts

18. **Rate Limiting (If Needed)**
    - [ ] Add rate limiter middleware
    - [ ] Configure limits (5 per 15 min)

---

## File Structure

```
apps/web/
├── src/
│   ├── auth-client.ts                      # Client auth initialization
│   ├── utils/
│   │   └── auth.ts                         # Server auth initialization
│   ├── providers/
│   │   └── SessionProvider.tsx             # Session context
│   ├── components/
│   │   ├── LoginWithGoogle.tsx             # Login button
│   │   ├── LogoutButton.tsx                # Logout button
│   │   └── Header.tsx                      # Nav with auth status
│   ├── routes/
│   │   ├── __root.tsx                      # Wrap with SessionProvider
│   │   ├── login.tsx                       # Login page
│   │   ├── _authenticated.tsx              # Protected layout
│   │   ├── _authenticated/
│   │   │   ├── todos.tsx                   # Protected todos route
│   │   │   └── _subscribed.tsx             # Subscription guard (optional)
│   │   └── api/
│   │       └── auth/
│   │           └── $.ts                    # Auth handler endpoint
│   └── server/
│       └── functions/
│           ├── auth.ts                     # getCurrentUserFn()
│           └── tasks.ts                    # Use getCurrentUserFn()
├── .env                                    # Secrets (NOT committed)
└── .env.example                            # Template (committed)

packages/db/
└── src/
    └── migrations/
        └── XXXXXX_create-auth-tables.ts    # Auth schema
```

---

## Environment Variables Template

Create `.env.example` (commit this):
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=<get-from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<get-from-google-cloud-console>
```

---

## Key Differences from web-old

| Aspect | web-old ❌ | New Implementation ✅ |
|--------|-----------|---------------------|
| getCurrentUser() | Duplicated in 2 files | Single shared function |
| Type Assertions | `as any` used | Proper typing |
| Error Handling | Throws string errors | Returns null or typed errors |
| Route Guards | Incomplete redirect | Proper `throw redirect()` |
| Error States | Mixed with auth states | Separate error handling |
| Framework Coupling | Tight Vinxi coupling | Framework-agnostic where possible |
| Connection Errors | No handling | Add error listeners |
| useCurrentUser() | Throws if no user | Returns null if no user |
| Testing | Not testable | Dependency injection ready |

---

## Success Criteria

- [ ] User can sign in with Google OAuth (ready for testing)
- [ ] User can sign out (ready for testing)
- [ ] Session persists across page reloads (ready for testing)
- [x] Protected routes redirect to login when unauthenticated
- [x] Todos route uses real user (not TEST_USER)
- [x] No `as any` type assertions (only necessary type casts in getCurrentUserFn)
- [x] No duplicate auth logic (single getCurrentUserFn)
- [x] Error states handled gracefully (returns null, not throw)
- [ ] All tests pass: `pnpm test` (no tests written yet)
- [x] Type check passes: `pnpm typecheck` ✅
- [x] Lint passes: `pnpm check:fix` ✅
- [x] Production build succeeds: `pnpm build` ✅

---

## Additional Resources

- Better Auth Docs: https://www.better-auth.com/docs
- TanStack Start Auth Guide: https://tanstack.com/start/latest/docs/framework/react/guide/authentication
- Google OAuth Setup: https://console.cloud.google.com/apis/dashboard
- Better Auth TanStack Integration: https://www.better-auth.com/docs/integrations/tanstack

---

## Notes

- The existing `@tasks/core` package already has `User` entity with required fields ✅
- The existing `@tasks/db` package has Kysely configured for PostgreSQL ✅
- Google OAuth credentials are already in `.env` (verified from context) ✅
- Database is running and migrations are working ✅
- ~~Current implementation uses `TEST_USER` hardcoded - this will be replaced~~ **COMPLETED** ✅

---

## Implementation Status

**STATUS: ✅ IMPLEMENTATION COMPLETE**

All phases 1-3 have been successfully implemented following the guidelines in this document.

### What's Implemented:
- ✅ better-auth server configuration with Kysely adapter
- ✅ Google OAuth integration
- ✅ Session management with reactStartCookies plugin
- ✅ Client auth initialization
- ✅ SessionProvider with proper error handling
- ✅ Login and logout UI components
- ✅ **Single centralized** getCurrentUserFn() (no duplication)
- ✅ Protected route layout with beforeLoad guards
- ✅ Todos route now uses real authentication
- ✅ Type-safe throughout (pnpm typecheck passes)
- ✅ Production build succeeds (pnpm build passes)

### Implementation Notes:
1. **Auth Client**: Simplified configuration using only baseURL (better-auth handles field inference automatically)
2. **getCurrentUserFn**: Uses type assertion `ctx as { request: Request }` to access request in server function context (necessary due to TanStack Start typing limitations)
3. **Button Components**: Used native HTML buttons with Tailwind instead of @tasks/ui components to avoid build issues
4. **Route Structure**: Todos moved to `_authenticated/todos.tsx` for automatic protection

### Next Steps (Testing):
1. Start development server: `pnpm dev`
2. Navigate to http://localhost:3000/todos (should redirect to /login)
3. Click "Sign in with Google"
4. Test OAuth flow
5. Verify session persistence
6. Test logout functionality

### Known Limitations:
- OAuth callback URL must be configured in Google Cloud Console: `http://localhost:3000/api/auth/callback/google`
- Production URL will need separate OAuth credentials
