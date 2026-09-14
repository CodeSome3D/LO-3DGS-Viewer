# LightOrigin 3DGS Viewer & Virtual Touring — Roadmap

Welcome to the project roadmap for **LO-3DGS-Viewer**. This document outlines completed milestones, current work in progress, and planned future capabilities.

---

## 🏁 Completed Milestones

### Phase 1: Core Viewer & Environment
- [x] **3DGS Rendering Engine**: High-performance Gaussian Splatting rendering with WebGPU / WebGL support.
- [x] **Camera & Controls**: Orbit, pan, zoom, custom bounding-box framing, and autospin.
- [x] **Background Customization**:
  - Solid Color
  - Gradients (Linear, customizable colors & angles)
  - 2D Static Images
  - 360° Equirectangular Panorama with horizontal rotation offset
- [x] **Themes**: Dark and Light theme presets with theme-aware logo switching.

### Phase 2: Hotspots & Annotations
- [x] **3D Surface Picking**: Raycasting on splat geometries to anchor hotspots precisely.
- [x] **Camera Views**: Binding camera vantage points to individual hotspots with smooth fly-to animations.
- [x] **Hotspot Cards**: Titles, descriptions, color picker, reordering, and deleting.
- [x] **Viewer Tour Navigation**: Sequential `< >` stepping through annotations with progress indicator (`1 / N`).

### Phase 3: Virtual Touring & Portals 🌀
- [x] **Cross-Scene Portals**: Special gateways linking separate 3DGS scenes into an interconnected virtual tour.
- [x] **Visual Identity**: Glowing pulsing **🌀** icon with dynamic cyan halo.
- [x] **Isolated Navigation**: Separate Hotspots vs. Portals lists in Editor; portals excluded from step-by-step hotspot tour sequences.
- [x] **Browser History & URL Sync**: Automatic `history.pushState` URL address bar updates (`?project=...`) and Back/Forward browser button navigation.
- [x] **Dynamic Splat Swapping**: Reliable loading, caching, and unloading of `.sog`/`.ply` models across scenes.

### Phase 4: Tour Transitions & Autoplay
- [x] **Cinematic Portal Transitions**: Full-screen dark-glass overlay with glowing swirl animation during scene loading to prevent asset flicker.
- [x] **Guided Tour Autoplay (▶ / ⏸)**: Interactive Play/Pause button in the Viewer tour bar.
- [x] **Smooth Progress Countdown**: Dynamic countdown progress bar showing time until next camera transition.
- [x] **Smart Interaction Pause**: Automatically pauses autoplay when the user manually rotates, pans, or zooms the camera.
- [x] **Project Tour Settings**: Configurable step duration (3s, 5s, 8s, 10s, 15s) and "Autoplay tour on load" toggle in the Editor.

### Phase 5: Marker Icon Library 🎨
- [x] **Vector SVG & Glyph Presets**: Built-in icons for Info (ℹ️), Photo (📷), Video (🎬), Audio (🔊), Pin (📍), Detail (🔍), Star (⭐), Tag (🏷️), Idea (💡), Door (🚪), Cart (🛒), Numbers 1–9, and Portal (🌀 / 🚀 / 🌐 / ➡️).
- [x] **Custom SVG / Emoji / Symbol Support**: Input custom SVG markup or text/emojis (limited to 3 symbols).
- [x] **Visual Icon Picker**: Grid selector in the Editor properties panel with real-time viewport updates.
- [x] **Project Persistence**: Seamless serialization in project JSON.

### Phase 6: Rich Hotspot Media & Content 🎬
- [x] **Media Attachments**:
  - **Images**: Responsive image banner embedded inside hotspot cards.
  - **Videos**: Auto-detected YouTube, Vimeo, and direct MP4 video embeds (responsive 16:9 player).
  - **Audio**: Sound clips and audio narration player.
- [x] **Rich Text & Markdown Formatting**: Client-side Markdown rendering supporting `**bold**`, `*italic*`, `[links](url)`, `# headings`, and `• bullets`.
- [x] **Call-to-Action (CTA) Buttons**: Interactive custom action buttons embedded in hotspot cards.
- [x] **Editor Integration & Serialization**: Dedicated Media & CTA controls in Properties panel and project JSON persistence.

### Phase 8: Standalone Export & Embedding 📦
- [x] **1-Click Zip / HTML Bundle**: Self-contained client-side `.zip` packaging of project data, 3DGS models, and standalone engine files.
- [x] **Share & Embed Modal Generator**: Live responsive `<iframe>` code snippet generator, shareable viewer URL, and parameter toggles (`autospin`, `autoplay`, `noui`, `theme`).
- [x] **QR Code Mobile Quick-Scan**: Instant vector QR code generation and SVG download for launching tours on phones.
- [x] **WebXR & Mobile Gyroscope Mode**: Spatial VR headset viewing and phone motion tilt-to-look camera controls.
- [x] **Viewer Quick Toolbar**: Floating top-right action bar with Share, Fullscreen, and VR/Motion buttons.

---

## 🔮 Future Milestones

### Phase 7: Floorplan / Mini-Map Radar
- [ ] **2D Floorplan Overlay**: Top-down floorplan widget showing user position and viewing cone radar.
- [ ] **Interactive Markers**: Clickable points on the floorplan to teleport across rooms.
- [ ] **Multi-Level / Multi-Room Support**: Switch floorplans when traveling through portals.
