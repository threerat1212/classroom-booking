> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# AI Agent Frontend Testing Guide

> Comprehensive guide for setting up and using AI-powered browser testing tools in the lawyer project.

## Table of Contents

1. [Overview](#overview)
2. [Tools Installed](#tools-installed)
3. [Architecture](#architecture)
4. [Setup & Configuration](#setup--configuration)
5. [Chrome DevTools MCP (Primary)](#chrome-devtools-mcp-primary)
6. [Playwright MCP (VS Code)](#playwright-mcp-vs-code)
7. [Playwright CLI (Terminal)](#playwright-cli-terminal)
8. [Testing Workflows](#testing-workflows)
9. [Page Reference](#page-reference)
10. [Troubleshooting](#troubleshooting)
11. [Tool Comparison](#tool-comparison)

---

## Overview

AI agent testing allows AI assistants (GitHub Copilot, Claude, etc.) to directly control a browser to test the frontend. Instead of writing traditional test files, the AI agent:

1. Opens a real browser via tools
2. Navigates to pages
3. Takes accessibility snapshots (not screenshots) for token-efficiency
4. Interacts with elements using refs from the snapshot
5. Verifies state changes
6. Reports console errors and network issues

### Why AI Agent Testing?

| Benefit             | Description                                               |
| ------------------- | --------------------------------------------------------- |
| **No test code**    | AI tests the app just like a human would                  |
| **Exploratory**     | AI discovers issues while exploring                       |
| **Self-healing**    | Snapshots + refs adapt to UI changes                      |
| **Real browser**    | Tests actual rendering, not JSDOM                         |
| **Token-efficient** | Accessibility tree uses far fewer tokens than screenshots |

---

## Tools Installed

### 1. Chrome DevTools MCP (`chrome-devtools-mcp`) — PRIMARY

- **Type**: MCP Server (VS Code integration)
- **Author**: Google (official Chrome team)
- **Stars**: 28.6k+ on GitHub
- **Config**: `.vscode/mcp.json`
- **Best for**: Performance profiling, Lighthouse audits, network debugging, console errors with source-mapped stack traces

### 2. Playwright MCP (`@playwright/mcp`)

- **Type**: MCP Server (VS Code integration)
- **Stars**: 28.7k+ (via microsoft/playwright-mcp)
- **Downloads**: 1.5M+ weekly on npm
- **Config**: `.vscode/mcp.json`
- **Best for**: Accessibility-tree snapshots, form automation, self-healing interactions

### 3. Playwright CLI (`@playwright/cli`)

- **Type**: Global CLI tool
- **Stars**: 5.3k (microsoft/playwright-cli)
- **Install**: `npm install -g @playwright/cli@latest`
- **Best for**: Token-efficient scripted flows, CI-ready testing

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    AI Agent (Copilot/Claude)                  │
│                                                              │
│  ┌───────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Chrome DevTools   │  │ Playwright   │  │ Playwright   │  │
│  │ MCP (Primary)     │  │ MCP          │  │ CLI          │  │
│  │                   │  │              │  │              │  │
│  │ navigate_page     │  │ browser_nav  │  │ open         │  │
│  │ take_snapshot     │  │ browser_snap │  │ snapshot     │  │
│  │ click / fill      │  │ browser_click│  │ click / fill │  │
│  │ lighthouse_audit  │  │ browser_fill │  │ screenshot   │  │
│  │ perf_start_trace  │  │ browser_type │  │ console      │  │
│  │ list_network_reqs │  │              │  │ network      │  │
│  └────────┬──────────┘  └──────┬───────┘  └──────┬───────┘  │
│           └─────────────┬──────┴─────────────────┘           │
│                         ▼                                    │
│              ┌──────────────────┐                             │
│              │  Chrome Browser   │                             │
│              └────────┬─────────┘                             │
│                       ▼                                      │
│              ┌──────────────────┐                             │
│              │  localhost:3000   │ ← Next.js dev server       │
│              └────────┬─────────┘                             │
│                       ▼                                      │
│              ┌──────────────────┐                             │
│              │  localhost:3002   │ ← common-api backend       │
│              └──────────────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Setup & Configuration

### Prerequisites

1. **Node.js v20+** — required for all tools
2. **Chrome browser** — stable version, installed locally
3. **Dev server running** — `cd web && pnpm run dev`
4. **API server running** — `cd common-api && make run` (or Docker)

### Configuration Files

| File                                              | Purpose                                     |
| ------------------------------------------------- | ------------------------------------------- |
| `.vscode/mcp.json`                                | Chrome DevTools MCP + Playwright MCP config |
| `.github/skills/README.md`                        | Root skill catalog and routing entrypoint   |
| `.github/skills/lawyer-management-system/SKILL.md`| Default repository direction skill          |
| `.github/skills/ai-agent-testing/SKILL.md`        | Browser testing workflow skill              |
| `web/.github/instructions/ai-testing.instructions.md` | Path-specific testing instructions      |

### Skill Routing

For this repository:

1. Start with `.github/skills/lawyer-management-system/SKILL.md` for project direction.
2. Use `.github/skills/ai-agent-testing/SKILL.md` for browser testing workflow.
3. Apply `web/.github/instructions/ai-testing.instructions.md` for path-specific testing details.

### `.vscode/mcp.json` Configuration

```json
{
  "servers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest", "--viewport=1280x720"]
    },
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser=chrome",
        "--viewport-size=1280x720",
        "--console-level=error",
        "--caps=vision,pdf,testing"
      ]
    }
  }
}
```

---

## Chrome DevTools MCP (Primary)

The **recommended** tool for AI agent testing. Built by Google's Chrome DevTools team.

### 29 Tools in 6 Categories

| Category            | Tools                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Input (9)**       | `click`, `drag`, `fill`, `fill_form`, `handle_dialog`, `hover`, `press_key`, `type_text`, `upload_file`                   |
| **Navigation (6)**  | `close_page`, `list_pages`, `navigate_page`, `new_page`, `select_page`, `wait_for`                                        |
| **Emulation (2)**   | `emulate`, `resize_page`                                                                                                  |
| **Performance (4)** | `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`, `take_memory_snapshot`                |
| **Network (2)**     | `get_network_request`, `list_network_requests`                                                                            |
| **Debugging (6)**   | `evaluate_script`, `get_console_message`, `lighthouse_audit`, `list_console_messages`, `take_screenshot`, `take_snapshot` |

### Key Advantages Over Playwright MCP

- **Lighthouse audits** — run full Lighthouse directly from AI agent
- **Performance traces** — record and analyze Chrome DevTools traces
- **Source-mapped stack traces** — console errors show original TypeScript locations
- **Memory snapshots** — detect memory leaks
- **Network inspection** — detailed request/response with headers and bodies
- **No WebDriver** — uses Puppeteer/CDP directly (more reliable)

### Usage Patterns

#### Performance Audit

```
Prompt: "Check the performance of localhost:3000"
→ navigate_page → performance_start_trace → interact → performance_stop_trace → performance_analyze_insight
```

#### Lighthouse Audit

```
Prompt: "Run a Lighthouse audit on localhost:3000"
→ navigate_page → lighthouse_audit
```

#### Console Error Detection

```
Prompt: "Check for errors on the orders page"
→ navigate_page → list_console_messages → get_console_message (for details)
```

#### Network Debugging

```
Prompt: "Why is the product list not loading?"
→ navigate_page → list_network_requests → get_network_request (check failed requests)
```

---

## Playwright MCP (VS Code)

### Available Tools

| Tool                       | Description                            |
| -------------------------- | -------------------------------------- |
| `browser_navigate`         | Navigate to a URL                      |
| `browser_snapshot`         | Get accessibility tree of current page |
| `browser_click`            | Click element by ref from snapshot     |
| `browser_type`             | Type text (into focused element)       |
| `browser_fill`             | Fill input field by ref with value     |
| `browser_select_option`    | Select dropdown option                 |
| `browser_hover`            | Hover over element                     |
| `browser_drag`             | Drag and drop between elements         |
| `browser_press_key`        | Press keyboard key                     |
| `browser_take_screenshot`  | Capture screenshot (needs vision cap)  |
| `browser_console_messages` | Read browser console messages          |
| `browser_network_requests` | List network requests                  |
| `browser_tab_list`         | List open tabs                         |
| `browser_tab_new`          | Open new tab                           |
| `browser_close`            | Close the browser                      |

### Snapshot vs Screenshot

| Feature      | Snapshot              | Screenshot                      |
| ------------ | --------------------- | ------------------------------- |
| Token cost   | Low (~200-500 tokens) | High (~1000+ tokens via vision) |
| Element refs | Yes (e.g. e5, e12)    | No                              |
| Interaction  | Can click/fill refs   | Must use coordinates            |
| Text content | Full text in tree     | May be hard to read             |
| Recommended  | Always first choice   | For visual verification only    |

---

## Playwright CLI (Terminal)

### Quick Reference

```bash
# Navigation
playwright-cli open http://localhost:3000 --headed
playwright-cli goto http://localhost:3000/orders
playwright-cli go-back
playwright-cli reload
playwright-cli close

# Inspection
playwright-cli snapshot
playwright-cli console error
playwright-cli network
playwright-cli screenshot --filename=test.png

# Interaction
playwright-cli click e5
playwright-cli fill e3 "test@example.com"
playwright-cli type "search query"
playwright-cli press Enter
playwright-cli select e7 "option_value"
playwright-cli check e12
playwright-cli hover e4

# Sessions
playwright-cli -s=admin open http://localhost:3000 --headed
playwright-cli -s=admin snapshot
playwright-cli list
playwright-cli close-all

# DevTools
playwright-cli console
playwright-cli console warning
playwright-cli network
playwright-cli tracing-start
playwright-cli tracing-stop

# Responsive
playwright-cli resize 375 812     # Mobile
playwright-cli resize 768 1024    # Tablet
playwright-cli resize 1280 720    # Desktop
```

---

## Testing Workflows

### Workflow 1: Login Test

```bash
# MCP approach
browser_navigate → http://localhost:3000/login
browser_snapshot → find email ref (e5), password ref (e7), button ref (e9)
browser_fill ref=e5 value="admin@lawyer.local"
browser_fill ref=e7 value="<local-test-password>"
browser_click ref=e9
browser_snapshot → verify dashboard page loaded
browser_console_messages → check for errors
```

```bash
# CLI approach
playwright-cli open http://localhost:3000/login --headed
playwright-cli snapshot
playwright-cli fill e5 "admin@lawyer.local"
playwright-cli fill e7 "<local-test-password>"
playwright-cli click e9
playwright-cli snapshot
playwright-cli console error
```

### Workflow 2: Page Navigation Test

```
1. Login (Workflow 1)
2. Navigate to target page
3. Snapshot → verify page structure
4. Check for expected elements (tables, buttons, forms)
5. Check console for errors
6. Check network for failed API calls
```

### Workflow 3: Form Submission Test

```
1. Navigate to form page
2. Snapshot → map all form fields
3. Fill each field
4. Click submit
5. Snapshot → check success/error state
6. Check network → verify API call
```

### Workflow 4: Responsive Test

```bash
playwright-cli open http://localhost:3000 --headed
# Desktop
playwright-cli resize 1280 720
playwright-cli screenshot --filename=desktop.png
# Tablet
playwright-cli resize 768 1024
playwright-cli screenshot --filename=tablet.png
# Mobile
playwright-cli resize 375 812
playwright-cli screenshot --filename=mobile.png
playwright-cli close
```

### Workflow 5: Error Detection

```
1. Navigate to page
2. Perform typical user actions
3. Check console messages for errors
4. Check network for failed requests (4xx, 5xx)
5. If errors found → investigate root cause
```

---

## Page Reference

| Page           | URL               | Auth Required | Key Test Points                        |
| -------------- | ----------------- | ------------- | -------------------------------------- |
| Login          | `/login`          | No            | Form validation, credentials, redirect |
| Dashboard      | `/`               | Yes           | Stats cards, charts, data loading      |
| Debtors        | `/th/debtors`     | Yes           | Table, filters, detail workflow        |
| Assignments    | `/th/assignments` | Yes           | Bulk assignment and workload states    |
| Call Records   | `/th/call-records` | Yes          | Call log list and validation           |
| Payments       | `/th/payments`    | Yes           | Payment table, summary, form states    |
| Imports        | `/th/imports`     | Yes           | Upload, sessions, logs, errors         |
| Exports        | `/th/exports`     | Yes           | Export request and download states     |
| Users          | `/th/users`       | Yes           | Admin CRUD and role/status controls    |

### Test Credentials

The development seed uses `admin@lawyer.local`, `supervisor@lawyer.local`, and `agent1@lawyer.local`, but the committed seed hashes are placeholders. Before browser QA, create or update a local test user with a valid bcrypt password and use that local password in the login flow.

---

## Troubleshooting

| Problem                     | Solution                                                |
| --------------------------- | ------------------------------------------------------- |
| `browser_navigate` fails    | Ensure dev server running: `cd web && pnpm run dev`     |
| Login fails                 | Ensure common-api running on port 3002                  |
| Element ref not found       | Take fresh snapshot — refs change after navigation      |
| Console errors on page load | May be MSW/service worker related — check if persistent |
| Network requests failing    | Check API server status, CORS settings                  |
| Slow page load              | Check for large data fetches or missing loading states  |
| Playwright CLI not found    | Install: `npm install -g @playwright/cli@latest`        |
| MCP tools not available     | Restart VS Code; check `.vscode/mcp.json`               |
| Browser won't open          | Kill stale processes: `playwright-cli kill-all`         |
| Thai text issues            | Accessibility tree handles Thai correctly               |

---

## Tool Comparison

### Research Summary (2025)

| Tool                    | Stars | Type             | Token Cost | Best For                                         |
| ----------------------- | ----- | ---------------- | ---------- | ------------------------------------------------ |
| **Chrome DevTools MCP** | 28.6k | MCP Server       | Medium     | **Primary** — performance, Lighthouse, debugging |
| **Playwright MCP**      | 28.7k | MCP Server       | Medium     | Accessibility snapshots, form automation         |
| **Playwright CLI**      | 5.3k  | CLI              | Low        | Token-efficient scripted flows                   |
| **Browser-Use**         | 80.5k | Python Framework | High       | Autonomous AI agents                             |
| **Stagehand**           | 21.5k | Node Framework   | High       | AI-native web automation                         |

### Why This Three-Tool Stack

1. **Chrome DevTools MCP (Primary)** — Official Google tool. Best for debugging: performance traces, Lighthouse audits, network inspection, console errors with source-mapped stack traces. Uses Puppeteer/CDP directly.
2. **Playwright MCP (Complement)** — Microsoft's accessibility-tree approach. Best for form filling and element interaction via refs.
3. **Playwright CLI (Lightweight)** — Token-efficient terminal commands. Best for scripted flows and CI.

### Tool Selection Guide

| Task                            | Use                   |
| ------------------------------- | --------------------- |
| "Check the performance"         | Chrome DevTools MCP   |
| "Run a Lighthouse audit"        | Chrome DevTools MCP   |
| "Why is this page slow?"        | Chrome DevTools MCP   |
| "Check for console errors"      | Chrome DevTools MCP   |
| "Debug network requests"        | Chrome DevTools MCP   |
| "Fill out and submit this form" | Playwright MCP        |
| "Test the login flow"           | Playwright MCP or CLI |
| "Take responsive screenshots"   | Playwright CLI        |
| "Quick scripted test sequence"  | Playwright CLI        |
