# LightOrigin 3DGS Viewer & Virtual Touring

A high-performance, web-based 3D Gaussian Splatting (3DGS) viewer and interactive virtual tour authoring environment built with WebGPU/WebGL and vanilla JavaScript.

---

## 🌟 Overview

**LO-3DGS-Viewer** provides an end-to-end platform for viewing, customizing, annotating, and linking 3D Gaussian Splatting captures (`.sog`, `.ply`) into fully navigable, cinematic virtual tours.

- **Dual-Mode Operation**:
  - **Editor Mode**: Interactive visual editor with sidebar for camera viewpoints, hotspots, cross-scene portals, media attachments, background customization, and project settings.
  - **Viewer Mode**: Clean, immersive presentation mode with guided tour autoplay, smooth camera transitions, interactive hotspots, WebXR/VR support, and responsive embed capabilities.
- **Zero Build Step**: Native ES6 modules running directly in modern browsers without complex bundler pipelines.
- **Self-Contained Exports**: 1-click standalone `.zip` and HTML packaging with bundled engine and 3D assets.

---

## ⚡ Quick Start

Because ES6 modules and 3DGS asset loaders fetch local data (`.json`, `.sog`), a local HTTP server is required (browsers block `file://` access due to CORS).

### Option 1: Python 3 (Recommended)
```bash
# From the project root:
python -m http.server 6660
```
Then open in Chrome/Edge:
- **Editor**: [http://localhost:6660/](http://localhost:6660/)
- **Viewer**: [http://localhost:6660/?mode=viewer&project=00_3_figures](http://localhost:6660/?mode=viewer&project=00_3_figures)

### Option 2: Node.js (npx)
```bash
npx serve -l 6660 .
# or
npx http-server -p 6660 -c-1
```

### Option 3: VS Code / Cursor Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## 📁 Repository Structure

```
LO-3DGS-Viewer/
├── index.html                   # Application entry point & URL parameter router
├── index.js                     # 3DGS rendering core (PlayCanvas engine bundle)
├── index.css                    # Engine canvas & base viewport layout
├── lightorigin.js               # Application coordinator & subsystem initializer
├── lightorigin.css              # Editor UI, tour overlay, cards & modal design system
├── settings.json                # Default camera, post-processing, and engine settings
├── LightOrigin_3DGS_User_Guide.pdf # Comprehensive illustrated user guide
├── README.md                    # Project overview & quick start (this file)
├── WORKSTATION_TRANSFER.md      # Detailed developer handover & workstation setup guide
├── .md/
│   ├── roadmap.md               # Feature roadmap & milestone tracker
│   └── Marker SVG.md            # Custom SVG vector marker guide & ready-made icons
├── js/                          # Modular application subsystems (ES6 modules)
│   ├── LightOrigin.js           # Core state container & mode detector
│   ├── EventBus.js              # Decoupled publish/subscribe messaging
│   ├── ProjectManager.js        # Project CRUD, import/export, scene swapping & autosave
│   ├── UIManager.js             # Visual editor UI, properties panels, sidebar & inputs
│   ├── CameraManager.js         # Orbit controls, fly-to interpolation & framing
│   ├── HotspotManager.js        # 3D surface-anchored markers, portals & interactive cards
│   ├── TourManager.js           # Sequential waypoint tour navigation & autoplay logic
│   ├── TourUIManager.js         # Viewer tour HUD, progress bar, play/pause controls
│   ├── PickingManager.js        # Splat raycasting & 3D coordinate snapping
│   ├── BackgroundManager.js     # Solid color, gradient, 2D image, and 360° panoramas
│   ├── IconLibrary.js           # Built-in SVG vector icons & glyph presets
│   ├── ExportManager.js         # 1-click standalone ZIP & HTML export builder
│   ├── ZipBuilder.js            # In-memory ZIP packaging utility
│   ├── EmbedManager.js          # Responsive <iframe> embed & QR-code generator modal
│   ├── XRManager.js             # WebXR immersive VR & mobile device gyroscope tilt
│   ├── QRCodeGenerator.js       # Client-side vector QR code renderer
│   ├── MediaHelper.js           # YouTube, Vimeo, direct MP4 & image media embedding
│   ├── Serializer.js            # Project schema serialization & parsing
│   ├── SettingsValidator.js     # Project data schema validation & fallback sanitizer
│   ├── LOCamera.js              # Camera model representation
│   └── project-loader.js        # Standalone project loader utility
├── projects/                    # Packaged demo scenes & sample tour projects
│   ├── 00_3_figures/            # Museum sculptures sample scene (.json + .sog)
│   ├── 01_cactus/               # Cactus plant demo scene
│   ├── 02_kaktus/               # Alternative kaktus demo scene
│   ├── 03_figure/               # Figure sculpture demo scene
│   └── 04_rat/                  # Detailed rat specimen demo scene
└── assets/                      # Panoramas, test images, and logos
```

---

## 🎮 Navigation & URL Query Parameters

| Parameter | Values | Purpose |
|---|---|---|
| `mode` | `viewer` (default: editor) | Launches the clean public Viewer instead of the visual Editor. |
| `project` | `00_3_figures`, `<name>` | Loads the specified project JSON configuration from `projects/<name>/`. |
| `scene` | `path/to/model.sog` | Overrides the 3DGS splat model URL directly. |
| `webgl` | (flag) | Forces WebGL 2.0 rendering fallback instead of WebGPU default. |
| `noui` | (flag) | Hides all overlays and toolbars for clean iframe embedding. |
| `autoplay` | (flag) | Automatically initiates tour autoplay upon scene load. |
| `autospin` | (flag) | Automatically orbits the camera slowly around the scene. |
| `poster` | `<url>` | Displays a blur-fade splash poster image during initial load. |
| `skybox` | `<url>` | Loads an environmental skybox cubemap. |
| `budget` | `<number>` | Limits maximum splat rendering memory/budget. |
| `ministats` | (flag) | Displays real-time FPS and drawcall performance metrics. |
| `debug` | (flag) | Enables verbose console diagnostic logging. |

### Example URLs:
- **Editor (Default scene)**: `http://localhost:6660/`
- **Editor (Specific project)**: `http://localhost:6660/?project=00_3_figures`
- **Viewer (Fullscreen tour)**: `http://localhost:6660/?mode=viewer&project=00_3_figures`
- **Viewer (Autoplay & Autospin)**: `http://localhost:6660/?mode=viewer&project=00_3_figures&autoplay&autospin`
- **Embed Mode (No UI)**: `http://localhost:6660/?mode=viewer&project=00_3_figures&noui`

---

## 🎨 Feature Summary

1. **3DGS Rendering Engine**: Native WebGPU renderer with automatic WebGL fallback, high precision rendering, and post-processing effects (bloom, vignette, color grading).
2. **Interactive Annotations (Hotspots)**: 3D raycasting onto splat points, customizable vector icons, rich markdown text, images, video embeds (YouTube, Vimeo, MP4), audio, and call-to-action buttons.
3. **Cross-Scene Portals (🌀)**: Connected gateways linking separate scenes into multi-room tours with smooth dark-glass transitions and browser history integration (`history.pushState`).
4. **Cinematic Guided Tours**: Step-by-step waypoint tours with autoplay (▶ / ⏸), countdown progress bar, smart interaction pause (auto-pause on manual camera orbit), and configurable step intervals.
5. **Background Customization**: Solid color, customizable gradient angle/colors, static 2D images, and 360° equirectangular panoramas with horizontal rotation calibration.
6. **WebXR & Gyroscope Controls**: 1-click mobile tilt-to-look motion controls and WebXR immersive headset mode.
7. **Export & Sharing**: 1-click client-side `.zip` bundle export containing HTML + engine + project + models, plus live `<iframe>` embed code and mobile QR code generation.

---

## 📖 Further Documentation

- **[Workstation Transfer & Developer Continuation Guide](file:///./WORKSTATION_TRANSFER.md)**: Full handover guide for continuing development on another computer.
- **[Roadmap & Milestones](file:///./.md/roadmap.md)**: Tracking completed phases and upcoming Phase 7 (Floorplan & Mini-Map Radar).
- **[Marker SVG Guide](file:///./.md/Marker%20SVG.md)**: Guide and ready-made SVGs for custom hotspot and portal icons.
- **[LightOrigin User Guide PDF](file:///./LightOrigin_3DGS_User_Guide.pdf)**: Comprehensive illustrated manual.
