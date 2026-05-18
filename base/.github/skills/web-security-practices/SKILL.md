## Management System Notice

This repository targets a Lawyer management system.

---
name: web-security-practices
description: Narrow web helper for Next.js security details. Use after a primary root skill when you need authentication, XSS and CSRF prevention, secret handling, or security-header guidance.
argument-hint: "Describe the security concern and affected route or component"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Security Best Practices

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Implementing authentication
- Handling user input
- Managing secrets and API keys
- Configuring security headers
- Preventing common vulnerabilities

## ⚠️ CRITICAL: Never Expose Secrets

**Never use `NEXT_PUBLIC_` prefix for sensitive data!**

```bash
# ❌ WRONG - Exposed to client
NEXT_PUBLIC_API_SECRET=secret123
NEXT_PUBLIC_DATABASE_URL=postgresql://...

# ✅ CORRECT - Server-only
API_SECRET=secret123
DATABASE_URL=postgresql://...
```

## Environment Variable Security

### Server-Only Secrets

```typescript
// ✅ Only accessible in Server Components, API routes, actions
const secret = process.env.API_SECRET;
const dbUrl = process.env.DATABASE_URL;

// ❌ Undefined in client components (good!)
// These won't leak to browser
```

### Validate Environment Variables

```typescript
// config/env.ts
import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(32),
  JWT_SECRET: z.string().min(32),
});

// Validate at startup
export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  API_SECRET: process.env.API_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
});
```

## Authentication

### JWT Handling

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: TokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
```

### Secure Cookie Settings

```typescript
// ✅ CORRECT - Secure cookie configuration
response.cookies.set('token', token, {
  httpOnly: true, // Prevent XSS access
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'lax', // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24, // 1 day
});
```

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

## Input Validation

### Validate All User Input

```typescript
import { z } from 'zod';

// Define strict schemas
const userInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s]+$/),
});

// Validate in API routes
export async function POST(request: Request) {
  const body = await request.json();

  const result = userInputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
  }

  // Use validated data
  const { email, password, name } = result.data;
}
```

### Sanitize HTML Output

```tsx
// ❌ WRONG - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userContent }} />;

// ✅ CORRECT - Sanitize with DOMPurify
import DOMPurify from 'isomorphic-dompurify';

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(userContent, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    }),
  }}
/>;
```

## XSS Prevention

### React Auto-Escapes

```tsx
// ✅ Safe - React escapes by default
<div>{userInput}</div>

// ❌ Dangerous - Only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: content }} />
```

### URL Validation

```typescript
// Validate URLs before redirecting
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url, 'https://yourdomain.com');
    // Only allow same-origin or trusted domains
    return parsed.origin === 'https://yourdomain.com';
  } catch {
    return false;
  }
};

// ✅ Safe redirect
if (isValidUrl(redirectUrl)) {
  redirect(redirectUrl);
} else {
  redirect('/');
}
```

## CSRF Protection

### Server Actions (Built-in Protection)

```typescript
'use server';

// Server Actions have built-in CSRF protection
export async function submitForm(data: FormData) {
  // Safe from CSRF
}
```

### API Routes (Manual Protection)

```typescript
// For non-Server-Action API routes
export async function POST(request: Request) {
  // Verify origin
  const origin = request.headers.get('origin');
  if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  // Or use CSRF tokens
  const csrfToken = request.headers.get('x-csrf-token');
  if (!(await verifyCsrfToken(csrfToken))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
}
```

## Security Headers

### Middleware Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}
```

### Content Security Policy

```typescript
// next.config.mjs
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://api.yourservice.com;
  frame-ancestors 'none';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

## SQL Injection Prevention

### Use Parameterized Queries

```typescript
// ❌ WRONG - SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ CORRECT - Parameterized query (Prisma)
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// ✅ CORRECT - Parameterized query (raw SQL)
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
```

## Rate Limiting

```typescript
// Simple in-memory rate limiter (use Redis in production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now - record.timestamp > windowMs) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count++;
  return true;
}

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Process request
}
```

## File Upload Security

```typescript
// Validate file uploads
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Generate safe filename
  const safeFilename = `${crypto.randomUUID()}.${file.type.split('/')[1]}`;

  // Process file...
}
```

## Sensitive Data Handling

### Logging

```typescript
// ❌ WRONG - Logging sensitive data
console.log('User login:', { email, password });

// ✅ CORRECT - Redact sensitive fields
console.log('User login:', { email, password: '[REDACTED]' });

// Better - Use structured logging
logger.info('User login attempt', {
  email,
  timestamp: new Date().toISOString(),
});
```

### Error Messages

```typescript
// ❌ WRONG - Leaking internal details
return NextResponse.json({
  error: `Database error: ${error.message}`,
  stack: error.stack,
});

// ✅ CORRECT - Generic error, log details server-side
console.error('Database error:', error);
return NextResponse.json({
  error: 'An unexpected error occurred',
});
```

## Checklist for Security

- [ ] **No secrets in NEXT*PUBLIC*** variables
- [ ] **Validate all input** with Zod
- [ ] **Sanitize HTML** before rendering
- [ ] **Use httpOnly cookies** for tokens
- [ ] **Set security headers** in middleware
- [ ] **Implement rate limiting**
- [ ] **Use parameterized queries**
- [ ] **Validate file uploads**
- [ ] **Don't log sensitive data**
- [ ] **Generic error messages** to users

## Quick Reference

| Vulnerability     | Prevention                       |
| ----------------- | -------------------------------- |
| XSS               | React escaping, DOMPurify        |
| CSRF              | Server Actions, SameSite cookies |
| SQL Injection     | Parameterized queries (Prisma)   |
| Secrets Exposure  | Server-only env vars             |
| Clickjacking      | X-Frame-Options: DENY            |
| Session Hijacking | httpOnly, Secure cookies         |
