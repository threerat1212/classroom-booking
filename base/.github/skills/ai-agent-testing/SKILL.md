## Management System Notice

This repository targets a Lawyer management system.

---
name: ai-agent-testing
description: Browser automation testing workflows for this project using Chrome DevTools MCP. Use when testing UI features, running audits, debugging console errors, or verifying API calls. Triggers on tasks involving browser testing, Lighthouse audits, performance tracing, network debugging, or login/form automation.
argument-hint: "Describe the UI flow or browser QA scenario to verify"
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# AI Agent Frontend Testing

For full workflow context, see `docs/project-workflow.md`.

## Project Context

- **Frontend**: `http://localhost:3000` (start: `cd web && pnpm run dev`)
- **API**: `http://localhost:3002` (common-api backend)
- **Auth**: common-api JWT via `/api/v1/auth/login`, consumed by `/login`
- **Test Credentials**: local seed users use placeholder hashes; create or update a local valid test user before protected-flow QA
- **Framework**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- **UI Language**: Thai (form labels/placeholders are in Thai)

> **If Chrome DevTools MCP isn't responding**, clear the cache first — resolves ~90% of issues.

## Chrome DevTools MCP — 29 Tools

| Category | Tools |
|----------|-------|
| **Input** (9) | `click`, `drag`, `fill`, `fill_form`, `handle_dialog`, `hover`, `press_key`, `type_text`, `upload_file` |
| **Navigation** (6) | `close_page`, `list_pages`, `navigate_page`, `new_page`, `select_page`, `wait_for` |
| **Emulation** (2) | `emulate`, `resize_page` |
| **Performance** (4) | `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`, `take_memory_snapshot` |
| **Network** (2) | `get_network_request`, `list_network_requests` |
| **Debugging** (6) | `evaluate_script`, `get_console_message`, `lighthouse_audit`, `list_console_messages`, `take_screenshot`, `take_snapshot` |

## Core Rules

1. **Always snapshot before interacting** — never blindly click
2. **Use accessibility refs** from snapshots, not CSS selectors
3. **Check console errors** after every major interaction
4. **Login first** before testing protected pages
5. **Wait for navigation** — snapshot again after clicks that navigate
6. **Prefer snapshots** over screenshots (more token-efficient)
7. **Close browser** when done to free resources

## Testing Workflows

### Login Flow
1. `navigate_page` → `http://localhost:3000/login`
2. `take_snapshot` → find form field refs
3. `fill` ref for email → locally configured test email such as `admin@lawyer.local`
4. `fill` ref for password → local test password
5. `click` ref for login button
6. `take_snapshot` → verify redirect to dashboard

### Form Submission Test
1. Navigate to form page
2. `take_snapshot` → identify all form fields
3. Fill each field with test data
4. Click submit
5. `take_snapshot` → verify success or error messages
6. `list_network_requests` → verify API call was made

### Performance Audit
1. `navigate_page` → target URL
2. `performance_start_trace`
3. Interact with page or wait for load
4. `performance_stop_trace`
5. `performance_analyze_insight` → get actionable recommendations

### Lighthouse Audit
1. `navigate_page` → target URL
2. `lighthouse_audit` → full report with scores

### Network Debugging
1. `navigate_page` → target page
2. `list_network_requests` → see all API calls
3. `get_network_request` → inspect specific request/response

### Console Error Detection
1. Navigate to page
2. Perform interactions
3. `list_console_messages` → check for errors/warnings
4. `get_console_message` → get source-mapped stack traces

## Key Pages

| Page | URL |
|------|-----|
| Login | `/login` |
| Dashboard | `/th/dashboard` |
| Debtors | `/th/debtors` |
| Assignments | `/th/assignments` |
| Call Records | `/th/call-records` |
| Payments | `/th/payments` |
| Imports | `/th/imports` |
| Exports | `/th/exports` |
| Users | `/th/users` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Page not loading | Ensure dev server running: `cd web && pnpm run dev` |
| Login fails | Check common-api running on port 3002 and verify the local test user's password hash is valid |
| Element not found | Take fresh snapshot — refs change between navigations |
| Console errors | Check `list_console_messages` for details |
| Slow responses | Check network requests for failed/slow API calls |
| MCP not responding | Clear cache first |
