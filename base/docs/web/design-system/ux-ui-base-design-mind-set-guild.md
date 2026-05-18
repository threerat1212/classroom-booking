> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# UX/UI Mindset Guide

> The 7 principles to think about before writing any UI code.

---

## 1. Proximity (Group Related Things)

- Related items should be close together
- Unrelated items should have clear space between them
- Use whitespace as a visual grouping tool, not just decoration
- Example: Form labels directly above their inputs, not floating

**Test**: Can a new user tell which items belong together just by looking?

---

## 2. Progressive Disclosure

- Show only what the user needs RIGHT NOW
- Hide advanced options behind "Show more" or expandable sections
- Use tabs, accordions, or stepped wizards for complex content
- Don't force users to process everything at once

**Test**: Is there anything on screen that 80% of users don't need?

---

## 3. Context Preservation

- Never lose the user's place
- Use modals/drawers for edits instead of navigating to a new page
- Preserve scroll position when returning from detail views
- Keep filter/search state when navigating back

**Test**: After completing an action, is the user back where they started?

---

## 4. Spatial Stability

- Elements should NOT jump around between states
- Reserve space for loading content (use skeletons)
- Keep navigation in the same position across all pages
- Buttons should not move when content above them changes

**Test**: Does anything shift position when data loads or state changes?

---

## 5. Visual Hierarchy

Guide the eye using size, weight, color, and spacing:

```
Page Title (24-30px, bold, gray-900)
  Section Title (18-20px, semibold, gray-900)
    Card Title (16px, semibold, gray-900)
      Body Text (14px, normal, gray-700)
        Caption (12px, medium, gray-500)
```

- Bigger = more important
- Bolder = more important
- Higher contrast = more important
- Primary color = interactive element

**Test**: Where does your eye go first? That should be the most important element.

---

## 6. Reduce Cognitive Load

- Max ~7 visible choices at a time (Miller's Law)
- Group related actions together
- Use familiar patterns (users expect logo top-left, nav on left, etc.)
- Break complex forms into steps
- Use defaults when possible to reduce decisions

**Test**: Could a new user figure this out without help?

---

## 7. Feedback Loops

Every user action must get a visible response:

| Action                    | Feedback                                      |
| ------------------------- | --------------------------------------------- |
| Click button              | Loading spinner or disabled state             |
| Submit form               | Success toast or error messages               |
| Delete item               | Confirmation dialog first, then success toast |
| Hover interactive element | Cursor change + visual highlight              |
| Focus input               | Border color change                           |
| Background process        | Progress bar or status update                 |
| Empty state               | Helpful message + suggested action            |

**Test**: Can the user ALWAYS tell what's happening?

---

## Quick Decision Framework

When designing any UI element, ask in order:

1. **What is the user trying to do?** (goal)
2. **What do they need to see?** (only show this)
3. **What might go wrong?** (error states)
4. **How will they know it worked?** (feedback)
5. **Where do they go next?** (flow)

---

## Common Mistakes

| Mistake                          | Fix                                      |
| -------------------------------- | ---------------------------------------- |
| Showing everything at once       | Use progressive disclosure               |
| No loading states                | Add skeleton/spinner for all async       |
| Navigating away for simple edits | Use modal/drawer                         |
| Inconsistent button placement    | Actions always in same position          |
| No empty states                  | Always show helpful message when no data |
| Tiny touch targets               | Min 44x44px clickable area               |
