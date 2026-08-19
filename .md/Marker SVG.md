# Custom Marker SVG & Icon Guide

This guide explains how to use custom SVG vector icons, emojis, and text for Hotspots and Portals in the **LightOrigin 3DGS Viewer & Editor**.

---

## 📍 How to Apply a Custom Icon in the Editor

1. Open the **Editor** (`http://172.16.200.44:6660/`).
2. Click any **Hotspot** or **Portal** in the 3D viewport or sidebar to select it.
3. In the right **Properties** panel, locate the **Icon** grid.
4. Click the **Custom** button (the pencil/edit icon).
5. An input field labeled **"Custom SVG / Emoji / Text"** will appear.
6. Paste your `<svg>...</svg>` vector markup, emoji, or text (up to 3 symbols).

---

## 🎨 Best Practices for Marker SVGs

To ensure your SVG scales and displays crisply inside the circular marker:

- **ViewBox**: Use `viewBox="0 0 24 24"` for consistent square proportions.
- **Dimensions**: Use `width="14" height="14"` (or `12`–`16` px).
- **Coloring**: Use `fill="currentColor"` or `stroke="currentColor"` so the icon automatically inherits the marker's text color.
- **Stroke Width**: `stroke-width="2"` or `stroke-width="2.2"` looks best at marker scale.

---

## 📋 Ready-to-Use SVG Examples (Copy & Paste)

You can copy and paste any of these SVG strings directly into the **Custom** input field:

### 1. ❤️ Heart
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
```

### 2. 👑 Crown
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
```

### 3. ☕ Coffee Cup
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>
```

### 4. 💎 Diamond
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M10 3l-2 6 4 12 4-12-2-6M2 9h20"/></svg>
```

### 5. 🏠 Home / Building
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
```

### 6. 🎟️ Ticket
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><line x1="13" y1="5" x2="13" y2="19" stroke-dasharray="2 2"/></svg>
```

### 7. 🔒 Lock
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
```

### 8. ⚡ Lightning Bolt
```xml
<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
```

---

## 🔤 Custom Text & Emojis

If you enter text or emojis instead of an `<svg>` tag:
- **Maximum Length**: Automatically capped to **3 characters** (e.g. `VIP`, `100`, `A1`, `💎`, `🍕`).
- **Compact Font Sizing**: 3-character labels automatically scale down slightly to fit neatly within the circular boundary.

---

## 🌐 Recommended Free Icon Sources

You can copy SVG icons from any of these libraries:
- [Lucide Icons](https://lucide.dev/icons/) *(Recommended — click any icon & select "Copy SVG")*
- [Heroicons](https://heroicons.com/) *(Click "Copy SVG")*
- [SVG Repo](https://www.svgrepo.com/) *(Search & Copy SVG)*
