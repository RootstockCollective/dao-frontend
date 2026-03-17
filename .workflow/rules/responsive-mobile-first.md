---
description: Mobile-first responsive design conventions for all UI components
---

# Responsive Design — Mobile First

Apply to ALL new UI components. When editing existing components, migrate touched layout code toward mobile-first if the change is proportional (per `tech-debt-on-touch.md`).

## Core Principle

**Build for mobile, enhance for desktop.** Tailwind base classes define the mobile layout. Use `md:` (768px — matches `MOBILE_DESKTOP_BREAKPOINT` in `src/lib/constants.ts`) to add desktop enhancements.

## Layout Rules

### Stacking order

- **Mobile (base):** vertical stack (`flex flex-col`).
- **Desktop (`md:`):** horizontal row or grid (`md:flex-row`, `md:grid-cols-N`).

```tsx
// Mobile-first
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
```

### Metrics / card grids

- Mobile: fluid-width cards that fill available space.
- Desktop: fixed-width cards in a flex-wrap row or CSS grid.
- Target pattern for new components: `w-full md:w-[214px] md:min-w-[180px]`.
- Existing components may use `w-[214px] min-w-[180px]` with `flex-wrap` — this works but isn't optimal on narrow screens. Migrate when touching these components.

### Spacing

- Provide a base gap value, then override for desktop: `gap-4 md:gap-6`, `px-4 md:px-6`.
- Every `md:` spacing override must have a base value. Example: `gap-x-6 md:gap-x-20` is correct — `gap-x-6` is the mobile fallback.

## Touch Targets

- Interactive elements (buttons, links, toggles): minimum `h-11` (44px) on mobile for touch accessibility.
- Ensure touch/tap equivalents exist for hover-only interactions where possible.

## Responsive Rendering Strategy

Choose the right tool for responsive behavior:

| Scenario | Approach |
|----------|----------|
| Show/hide content by breakpoint | CSS classes: `hidden md:block` / `md:hidden` |
| DOM structure fundamentally changes (e.g., mobile accordion vs desktop table) | `useIsDesktop()` hook |
| Computed `style` prop depends on viewport (e.g., dynamic backgrounds) | `useIsDesktop()` hook |
| Popover/tooltip positioning differs by viewport | `useIsDesktop()` hook |
| Modal needs fullscreen on mobile | `useIsDesktop()` hook |

**Prefer CSS when possible** — it avoids an extra client boundary and doesn't flash on hydration. Use `useIsDesktop()` (`src/shared/hooks/useIsDesktop.ts`) when CSS alone cannot express the difference.

## Typography & Readability

- Body text: minimum `text-sm` (14px) on mobile.
- Section headings: use responsive sizing when appropriate (`text-lg md:text-xl`).
- Long values (addresses, hashes): truncate or wrap — never cause horizontal scroll.

## Testing Considerations

- When a component uses `useIsDesktop()` for structural differences, test both mobile and desktop render paths.
- Components that only use CSS responsive classes (no JS branching) do not need separate mobile/desktop tests — CSS behavior is trusted.
- Use stable `data-testid` attributes across breakpoints for new components. Avoid `isDesktop ? 'foo-desktop' : 'foo-mobile'` patterns in new code.

## Breakpoint Reference

| Token | Width | Usage |
|-------|-------|-------|
| *(base)* | < 768px | Mobile — all base Tailwind classes |
| `md:` | >= 768px | Desktop — matches `MOBILE_DESKTOP_BREAKPOINT` |
| `lg:` | >= 1024px | Wide desktop — use sparingly |
