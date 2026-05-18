## Management System Notice

This repository targets a Lawyer management system.

---
name: web-route-handlers
description: Narrow web helper for Next.js route handlers. Use after a primary root skill when you need route-level request and response patterns, webhook handling, or API endpoint implementation details.
argument-hint: "Describe the route handler behavior, input, and expected response"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Next.js API Route Handlers

For full workflow context, see `docs/project-workflow.md`.

## When to Use This Skill

Use this skill when:

- Creating API endpoints
- Handling different HTTP methods
- Implementing webhooks
- Building REST APIs
- Proxying external APIs

## When to Use Route Handlers vs Server Actions

| Use Case                    | Solution      |
| --------------------------- | ------------- |
| Simple form submission      | Server Action |
| CRUD with forms             | Server Action |
| Third-party webhooks        | Route Handler |
| Complex API with middleware | Route Handler |
| Public API endpoints        | Route Handler |
| File streaming              | Route Handler |

## Basic Route Handler

### File Location

```
app/
└── api/
    └── users/
        ├── route.ts         # /api/users (GET, POST)
        └── [id]/
            └── route.ts     # /api/users/:id (GET, PATCH, DELETE)
```

### Basic Structure

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

// GET /api/users
export async function GET() {
  try {
    const users = await db.user.findMany();
    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await db.user.create({ data: parsed.data });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

### Dynamic Routes

```typescript
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/users/:id
export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/:id
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  try {
    const user = await db.user.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/:id
export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    await db.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
```

## Request Handling

### Query Parameters

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const search = searchParams.get('search') ?? '';
  const status = searchParams.getAll('status'); // For arrays: ?status=active&status=pending

  const users = await db.user.findMany({
    where: {
      name: { contains: search },
      status: { in: status.length > 0 ? status : undefined },
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    data: users,
    meta: { page, limit },
  });
}
```

### Headers

```typescript
export async function GET(request: Request) {
  // Read headers
  const authHeader = request.headers.get('Authorization');
  const contentType = request.headers.get('Content-Type');

  // Validate auth
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const user = await verifyToken(token);

  // Set response headers
  return NextResponse.json(
    { data: user },
    {
      headers: {
        'X-Request-Id': crypto.randomUUID(),
        'Cache-Control': 'private, max-age=3600',
      },
    }
  );
}
```

### Cookies

```typescript
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('sessionId')?.value;

  // ...

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  // Set cookie in response
  const response = NextResponse.json({ success: true });

  response.cookies.set('sessionId', 'abc123', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}
```

## Response Patterns

### JSON Response

```typescript
// Simple
return NextResponse.json({ data: users });

// With status
return NextResponse.json({ data: user }, { status: 201 });

// With headers
return NextResponse.json(
  { data: users },
  {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60',
    },
  }
);
```

### Streaming Response

```typescript
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        controller.enqueue(encoder.encode(`data: ${i}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### File Response

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;

  const filePath = join(process.cwd(), 'files', filename);
  const file = await readFile(filePath);

  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

### Redirect Response

```typescript
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  // Option 1: Next.js redirect (throws)
  redirect('/login');

  // Option 2: NextResponse redirect
  return NextResponse.redirect(new URL('/login', request.url));
}
```

## Validation Pattern

```typescript
// app/api/users/route.ts
import { z } from 'zod';
import { NextResponse } from 'next/server';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['user', 'admin']).default('user'),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export async function POST(request: Request) {
  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // parsed.data is fully typed
  const user = await db.user.create({ data: parsed.data });
  return NextResponse.json({ data: user }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams);

  const parsed = querySchema.safeParse(rawQuery);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { page, limit, search } = parsed.data;

  const users = await db.user.findMany({
    where: search ? { name: { contains: search } } : undefined,
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ data: users });
}
```

## Authentication Pattern

```typescript
// lib/auth.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

// Wrapper for protected routes
export function withAuth(handler: (request: Request, user: User) => Promise<Response>) {
  return async (request: Request) => {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, user);
  };
}

// Usage
export const GET = withAuth(async (request, user) => {
  const data = await getDataForUser(user.id);
  return NextResponse.json({ data });
});
```

## CORS Configuration

```typescript
// app/api/public/route.ts
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight
export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ data: 'public data' }, { headers: corsHeaders });
}
```

## Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

## Route Configuration

```typescript
// app/api/heavy/route.ts

// Increase timeout for slow operations
export const maxDuration = 60; // 60 seconds

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Or force static
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
```

## Checklist for Route Handlers

- [ ] **Validate input** with Zod
- [ ] **Handle errors** with try-catch
- [ ] **Return proper status codes** (200, 201, 400, 401, 404, 500)
- [ ] **Type route context** for params
- [ ] **Await params** in Next.js 15+ / 16
- [ ] **Set appropriate headers** (Cache-Control, CORS)
- [ ] **Authenticate** protected routes
- [ ] **Log errors** for debugging

## Quick Reference

| HTTP Method | Use Case         | Success Status |
| ----------- | ---------------- | -------------- |
| GET         | Fetch resource   | 200            |
| POST        | Create resource  | 201            |
| PUT         | Replace resource | 200            |
| PATCH       | Update resource  | 200            |
| DELETE      | Remove resource  | 204            |

| Status Code | Meaning      |
| ----------- | ------------ |
| 200         | OK           |
| 201         | Created      |
| 204         | No Content   |
| 400         | Bad Request  |
| 401         | Unauthorized |
| 403         | Forbidden    |
| 404         | Not Found    |
| 500         | Server Error |
