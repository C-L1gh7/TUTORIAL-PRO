# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (HMR, port 5173+)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

## Architecture

Tutorial Pro is a React 18 + Vite 5 + Tailwind CSS 3 image annotation and tutorial-making SPA. Users paste screenshots (Ctrl+V), annotate with shapes/text/mosaic/spotlight, crop, and export each step as a PNG.

All editor state lives in a single `App.jsx` component (~680 lines). Tools operate on an HTML5 `<canvas>` via imperative drawing functions — React only manages state; actual rendering to canvas is manual.

### Key data flow

1. `images` state array holds all steps: `{ id, src, shapes[], spotlights[], history[], historyIndex }`
2. `activeImgIndex` selects the current image; derived state (`shapes`, `spotlights`) syncs via a `useEffect`
3. Mouse events (`handleMouseDown/Move/Up`) capture canvas coordinates → update `shapes`/`spotlights`/`tempRect`
4. `render()` (async, useCallback) re-draws the canvas: base image → mosaic → spotlights → other shapes → tool preview
5. `updateImageState()` pushes to both React state and the per-image history stack for undo

### Tools (`src/constants.js`)

| Tool | Key | Behavior |
|---|---|---|
| SELECT (`V`) | No drawing | |
| RECT (`R`) | Drag → commits on mouseup | Rect stored as `{type, x, y, w, h, color}` |
| ARROW (`A`) | Drag → commits on mouseup | Arrow stored like rect with `ex, ey` |
| TEXT (`T`) | Click → textarea overlay → Ctrl+Enter/blur commits | Text stored as `{type, x, y, text, color}` |
| MOSAIC (`M`) | Drag (brush) → commits on mouseup | Pixelation mask; stored as `{type, path[], size, intensity}` |
| SPOTLIGHT (`S`) | Drag → auto-applies on mouseup (no confirm) | Multiple allowed; non-destructive overlay |
| CROP (`C`) | Drag → confirm/cancel button appears | Resets image `src` and clears shapes; supports Escape to cancel |

### Canvas rendering order

1. Base image
2. Mosaic shapes (pixelation masks applied to source image)
3. Spotlight overlay (evenodd fill with `STYLES.spotlight.overlayColor`)
4. RECT, ARROW, TEXT shapes
5. Live preview rect (dashed border for crop/spotlight, solid for rect/arrow)

Coordinates are translated from CSS pixels to canvas pixels via `getPos()` which divides `canvas.width / getBoundingClientRect().width`.

### Undo system

Each image has a `history[]` array and `historyIndex`. Every `updateImageState()` call pushes a snapshot `{ shapes, spotlights, src }` to history. Undo restores the previous snapshot. New actions after an undo truncate any "future" history (standard undo/redo pattern, though redo itself is not wired to UI).

### Important constraints

- Declaration order in `App.jsx` matters: `const` variables used in `useEffect` dependency arrays must be declared **before** the effect. The shortcuts `useEffect` depends on `handleUndo`, so `handleUndo` (and `updateImageState` which it calls) must appear earlier in the component body.
- `render()` has a generation counter (`renderGen`) to cancel stale async renders when the user rapidly switches images or draws.
- Canvas uses `image-rendering: pixelated` CSS — important for screenshot clarity.
- The `TUTORIAL_PRO_backup.html` is a standalone single-file reference implementation (CDN-loaded React/Babel/Tailwind). It can serve as a functional reference but lacks text/mosaic/keyboard-shortcut features present in the React app.
- GitHub Pages deployment: push to `main` → builds via `.github/workflows/deploy.yml` → deploys `dist/` to `gh-pages` branch. Uncomment `base` in `vite.config.js` when deploying.

### File map

```
src/
  main.jsx              — React mount point
  App.jsx               — All editor state, canvas logic, mouse events, tool actions
  index.css             — Tailwind directives + body bg + scrollbar styles
  constants.js          — TOOLS, TOOL_DETAILS, STYLES, COLORS, BRUSH_SIZES
  components/
    Sidebar.jsx          — Left panel: step thumbnails, delete button
    Toolbar.jsx          — Top bar: tool buttons, color picker, brush size, undo/clear/export
    ProjectNameModal.jsx — Startup modal: project naming
```
