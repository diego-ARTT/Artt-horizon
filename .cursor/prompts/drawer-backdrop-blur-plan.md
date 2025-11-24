# Drawer Backdrop Blur Effect Implementation Plan

## Overview

Add a configurable background blur effect to drawer overlays (backdrop) to improve visual focus and modern aesthetics.

## Current Implementation

### Existing Backdrop Styles

- Location: `assets/base.css` lines 1245-1249
- Current backdrop uses:
  - `backdrop-filter: brightness(1)` - only adjusts brightness
  - `background: rgb(var(--backdrop-color-rgb) / var(--backdrop-opacity))` - semi-transparent overlay
- Drawers inherit from `.dialog-modal::backdrop` since `.dialog-drawer` doesn't have specific backdrop styles

### Drawer Usage

- Size guide drawer: `.dialog-drawer` class
- Filters drawer: `.dialog-drawer` class
- Header drawer: Uses separate `.menu-drawer__backdrop` implementation
- Popup link drawer: `.dialog-drawer` class

## Implementation Approach

### Option A: Add Blur to All Drawer Backdrops (Recommended)

**Pros:**

- Consistent experience across all drawers
- Simple implementation
- Better visual focus

**Cons:**

- Applies to all drawers (may want different behavior)

### Option B: Make Blur Configurable Per Drawer

**Pros:**

- Maximum flexibility
- Can enable/disable per drawer type

**Cons:**

- More complex implementation
- Requires settings in multiple blocks

### Option C: Theme-Level Setting

**Pros:**

- Single control point
- Consistent across all drawers
- Easy to toggle

**Cons:**

- Less granular control

## Recommended Implementation: Option A + C (Hybrid)

1. **Add blur to drawer backdrops** by default
2. **Add theme setting** to control blur intensity (0-20px range)
3. **Use CSS custom property** for easy theming

## Technical Details

### CSS Implementation

```css
.dialog-drawer::backdrop {
  backdrop-filter: blur(var(--drawer-backdrop-blur, 8px)) brightness(1);
  background: rgb(var(--backdrop-color-rgb) / var(--backdrop-opacity));
}
```

### CSS Custom Property

- Name: `--drawer-backdrop-blur`
- Default: `8px` (moderate blur)
- Range: `0px` (no blur) to `20px` (strong blur)
- Location: Theme settings or CSS variables file

### Performance Considerations

- `backdrop-filter` can impact performance on lower-end devices
- Consider adding `will-change: backdrop-filter` for optimization
- Test on mobile devices for performance impact

## Implementation Steps

1. **Add CSS for drawer backdrop blur**
   - Update `assets/base.css`
   - Add `.dialog-drawer::backdrop` specific styles
   - Include transition for smooth blur animation

2. **Add theme setting (optional)**
   - Add to `config/settings_schema.json`
   - Create range input for blur intensity
   - Default: 8px

3. **Test across drawer types**
   - Size guide drawer
   - Filters drawer
   - Popup link drawer
   - Header drawer (if applicable)

4. **Performance testing**
   - Test on mobile devices
   - Check animation smoothness
   - Verify no layout shifts

## Browser Support

- `backdrop-filter` is well-supported in modern browsers
- Fallback: Browsers without support will show standard backdrop (no blur)
- No polyfill needed (graceful degradation)

## Accessibility Considerations

- Blur effect doesn't affect accessibility
- Ensure backdrop opacity remains sufficient for contrast
- Maintain focus indicators visibility

## Future Enhancements

- Per-drawer blur intensity settings
- Different blur styles (gaussian, motion blur)
- Animation options for blur appearance
