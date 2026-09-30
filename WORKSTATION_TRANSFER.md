# Developer Handover & Workstation Continuation Guide
## LightOrigin 3DGS Viewer & Virtual Touring (`LO-3DGS-Viewer`)

> **Purpose**: This guide provides everything required to resume development of the **LO-3DGS-Viewer** project immediately on a new workstation, including setup commands, codebase architecture, recent status, and next tasks.

---

## 🚀 1. Quick Setup on a New Workstation

### 1.1 Prerequisites
- **Git** (installed and configured with your SSH key or GitHub credentials).
- **Runtime for local HTTP server**:
  - **Python 3** (default on macOS/Linux, easily installed on Windows), OR
  - **Node.js** (v18+ recommended with `npx`).
- **Browser**:
  - **Google Chrome** or **Microsoft Edge** (recommended for WebGPU support).
  - Ensure **Hardware Acceleration** is turned ON in browser settings (`chrome://settings/system`).

### 1.2 Clone the Repository
```bash
# Clone the repository
git clone https://github.com/CodeSome3D/LO-3DGS-Viewer.git

# Navigate to the workspace directory
cd LO-3DGS-Viewer

# Verify you are on the main branch
git status
```

### 1.3 Verify 3D Assets Integrity
The repository directly tracks binary `.sog` 3DGS models in `projects/`. Confirm the model files are present and uncorrupted:
```bash
# On Windows PowerShell:
Get-ChildItem -Recurse -Filter *.sog projects/ | Select-Object FullName, Length

# On Linux / macOS:
ls -lh projects/*/*.sog
```
You should see:
- `projects/00_3_figures/00_3_figures.sog` (~23.3 MB)
- `projects/01_cactus/01_cactus.sog` (~3.4 MB)
- `projects/02_kaktus/02_kaktus.sog` (~3.7 MB)
- `projects/03_figure/03_figure.sog` (~20.4 MB)
- `projects/04_rat/04_Rat.sog` (~43.7 MB)

---

## 💻 2. Running Locally (No Build Step)

The project uses **pure native ES6 modules** (`import` / `export`) and PlayCanvas engine bundle (`index.js`). There is **no compilation or bundling step** (no webpack/vite required for normal dev).

⚠️ **Important**: You **cannot** open `index.html` directly via the `file://` protocol. Modern browsers block cross-origin `fetch()` requests and ES module imports from local disk. You **must** serve files through a local HTTP server.

### Start the Server:

#### Option A: Python 3 (Fastest)
```bash
# Run from the repository root:
python -m http.server 6660
```

#### Option B: Node.js / npx
```bash
# Disable caching with -c-1 for instant live reloads:
npx http-server -p 6660 -c-1
# OR
npx serve -l 6660 .
```

#### Option C: VS Code / Cursor
Install the **Live Server** extension, right-click `index.html`, and click **"Open with Live Server"**.

---

## 🌐 3. Key URLs & Operating Modes

Once the server is running on port `6660`:

| Mode | URL | Description |
|---|---|---|
| **Editor (Default)** | [http://localhost:6660/](http://localhost:6660/) | Full authoring environment with sidebar, hotspot tools, background controls. |
| **Editor (Specific Scene)** | [http://localhost:6660/?project=00_3_figures](http://localhost:6660/?project=00_3_figures) | Loads the Museum Figures project directly into the Editor. |
| **Viewer (Tour Mode)** | [http://localhost:6660/?mode=viewer&project=00_3_figures](http://localhost:6660/?mode=viewer&project=00_3_figures) | Clean visitor presentation mode with tour bar and hotspot cards. |
| **Viewer (Autoplay on load)** | [http://localhost:6660/?mode=viewer&project=00_3_figures&autoplay](http://localhost:6660/?mode=viewer&project=00_3_figures&autoplay) | Starts waypoint tour autoplay immediately on load. |
| **Viewer (Autospin)** | [http://localhost:6660/?mode=viewer&project=00_3_figures&autospin](http://localhost:6660/?mode=viewer&project=00_3_figures&autospin) | Orbits the camera smoothly around the scene. |
| **Embed Mode (No UI)** | [http://localhost:6660/?mode=viewer&project=00_3_figures&noui](http://localhost:6660/?mode=viewer&project=00_3_figures&noui) | Hides all UI chrome for clean iframe embedding. |
| **WebGL Fallback** | [http://localhost:6660/?webgl](http://localhost:6660/?webgl) | Forces WebGL 2.0 rendering if WebGPU is unsupported on your GPU. |
| **Performance Stats** | [http://localhost:6660/?ministats](http://localhost:6660/?ministats) | Renders FPS and drawcall graph overlay. |

---

## 📌 4. Current Repository State & Context

### 4.1 Git Commit Baseline
- **Branch**: `main`
- **Origin**: `https://github.com/CodeSome3D/LO-3DGS-Viewer.git`
- **Latest Commits**:
  - `ca69724`: "Manual added" (`LightOrigin_3DGS_User_Guide.pdf` added).
  - `24353a8`: "EOD 16.09.2026" (Project settings & data persistence updates).
  - `3d11b22`: "Fixes" (Tour playback & UI fixes).
  - `ba019f5`: "Logo change" (Horizontal logo asset updates).

### 4.2 ⚠️ Important Caveat: Browser `localStorage` Autosave
In `js/ProjectManager.js`, live edits made in the Editor are autosaved to browser `localStorage` under the key:
```javascript
this.STORAGE_KEY = "lo_editor_autosave";
```
- **If you made unexported edits in the browser on your previous workstation**: Make sure to click **"Export Project"** / **"Save"** in the Editor on that machine to download/update the project's `.json` file in `projects/<name>/<name>.json`, or commit the updated `.json` file to Git.
- On the new workstation, the editor will load fresh from the committed `.json` file in `projects/`.

---

## 🏗️ 5. Architectural Breakdown

The project follows a modular, decoupled manager pattern orchestrated by `lightorigin.js`:

```
               ┌────────────────────────────────────────────────────────┐
               │                      index.html                        │
               │   (Parses URL search params, bootstraps engine)        │
               └───────────┬────────────────────────────────┬───────────┘
                           │                                │
                           ▼                                ▼
                 ┌──────────────────┐             ┌───────────────────┐
                 │     index.js     │             │  lightorigin.js   │
                 │ (PlayCanvas 3DGS │             │(Main coordinator, │
                 │ rendering engine)│             │ orchestrates all) │
                 └─────────┬────────┘             └─────────┬─────────┘
                           │                                │
       ┌───────────────────┼────────────────────────────────┼───────────────────┐
       ▼                   ▼                                ▼                   ▼
┌──────────────┐   ┌──────────────┐                 ┌───────────────┐   ┌───────────────┐
│CameraManager │   │PickingManager│                 │ProjectManager │   │  UIManager    │
│(Orbit/Fly-to)│   │(Raycast 3DGS)│                 │ (CRUD/Switch) │   │ (Sidebar/CSS) │
└──────────────┘   └──────────────┘                 └───────┬───────┘   └───────────────┘
                                                            │
    ┌───────────────────────┬───────────────────────────────┴───────────────────────┐
    ▼                       ▼                               ▼                       ▼
┌──────────────┐    ┌──────────────┐                ┌───────────────┐       ┌───────────────┐
│HotspotManager│    │ TourManager  │                │BackgroundMgr  │       │ ExportManager │
│ (3D Markers/ │    │ (Autoplay/   │                │ (Solid/Grad/  │       │ (Standalone   │
│   Portals)   │    │  Waypoints)  │                │  360 Pano)    │       │  ZIP builder) │
└──────┬───────┘    └──────┬───────┘                └───────────────┘       └───────┬───────┘
       │                   │                                                        │
       ▼                   ▼                                                        ▼
┌──────────────┐    ┌──────────────┐                                        ┌───────────────┐
│ IconLibrary  │    │ TourUIManager│                                        │  ZipBuilder   │
│  (Vector SVG)│    │(Viewer HUD/  │                                        │ (In-memory    │
└──────────────┘    │ Progress bar)│                                        │  compression) │
                    └──────────────┘                                        └───────────────┘
```

### Module Reference Table

| Module | File | Role & Key Responsibilities |
|---|---|---|
| **LightOrigin** | [js/LightOrigin.js](file:///./js/LightOrigin.js) | Central namespace container (`window.lo`). Exposes state flags (`isEditor()`, `isViewer()`). |
| **ProjectManager** | [js/ProjectManager.js](file:///./js/ProjectManager.js) | Loads, saves, exports, and switches projects. Handles cross-scene transitions, URL sync (`history.pushState`), and autosave drafts. |
| **UIManager** | [js/UIManager.js](file:///./js/UIManager.js) | Manages the full Editor sidebar, section accordions, color pickers, gradient tools, hotspot list, portal list, and properties inspector. |
| **HotspotManager** | [js/HotspotManager.js](file:///./js/HotspotManager.js) | Creates, positions, and projects 3D screen-space markers. Renders responsive hotspot modal cards (markdown, media, CTA buttons). Handles portal teleportation. |
| **TourManager** | [js/TourManager.js](file:///./js/TourManager.js) | Sequential tour progression (`next()`, `prev()`). Controls autoplay timer, step duration, and handles auto-pause on user camera interaction. |
| **TourUIManager** | [js/TourUIManager.js](file:///./js/TourUIManager.js) | Bottom viewer HUD bar: step counter (`1 / N`), next/prev buttons, play/pause toggle, and animated countdown progress bar. |
| **CameraManager** | [js/CameraManager.js](file:///./js/CameraManager.js) | Manages camera positioning, orbit distance, FOV, bounding-box framing, and smooth fly-to easing transitions between viewpoints. |
| **PickingManager** | [js/PickingManager.js](file:///./js/PickingManager.js) | Performs raycasting against Gaussian splats to anchor hotspots precisely on 3D geometry. |
| **BackgroundManager**| [js/BackgroundManager.js](file:///./js/BackgroundManager.js) | Handles solid background colors, CSS linear gradients, static 2D images, and 360° equirectangular panoramas with horizontal rotation offset. |
| **IconLibrary** | [js/IconLibrary.js](file:///./js/IconLibrary.js) | Vector SVG glyphs (info, photo, video, audio, star, tag, numbers 1-9, portals) and renderer for custom user-pasted SVG/emojis. |
| **ExportManager** | [js/ExportManager.js](file:///./js/ExportManager.js) | Compiles self-contained standalone `.zip` containing HTML, engine, project configuration, and 3DGS models for offline distribution. |
| **ZipBuilder** | [js/ZipBuilder.js](file:///./js/ZipBuilder.js) | Pure JS in-memory ZIP archive generator (no external npm dependencies). |
| **EmbedManager** | [js/EmbedManager.js](file:///./js/EmbedManager.js) | Modal for generating responsive `<iframe>` code snippets and copyable viewer URLs with toggleable flags (`noui`, `autoplay`, `autospin`). |
| **XRManager** | [js/XRManager.js](file:///./js/XRManager.js) | Controls WebXR immersive VR headset sessions and mobile device orientation (gyroscope tilt-to-look). |
| **QRCodeGenerator** | [js/QRCodeGenerator.js](file:///./js/QRCodeGenerator.js) | Client-side QR code generator for instant mobile testing and SVG download. |
| **MediaHelper** | [js/MediaHelper.js](file:///./js/MediaHelper.js) | Parses and generates responsive embeds for YouTube, Vimeo, direct MP4 video, and audio players in hotspot cards. |
| **Serializer** | [js/Serializer.js](file:///./js/Serializer.js) | Serializes and deserializes the project data format between memory and JSON. |
| **SettingsValidator**| [js/SettingsValidator.js](file:///./js/SettingsValidator.js) | Validates project JSON schema integrity and applies default fallbacks for missing properties. |
| **EventBus** | [js/EventBus.js](file:///./js/EventBus.js) | Lightweight event emitter for decoupled cross-module communication (`on`, `off`, `emit`). |

---

## 🎯 6. Roadmap Status & What's Next

Refer to [.md/roadmap.md](file:///./.md/roadmap.md) for complete historical details.

### Completed Milestones
- [x] **Phase 1**: Core 3DGS Engine, Camera Controls, Backgrounds (Color, Gradient, Image, 360 Panorama), Themes.
- [x] **Phase 2**: 3D Surface Picking, Hotspot Cards, Step-by-step navigation.
- [x] **Phase 3**: Cross-Scene Portals (🌀), Browser History sync, dynamic splat swapping.
- [x] **Phase 4**: Cinematic Portal Transitions, Autoplay, Countdown bar, Smart interaction pause.
- [x] **Phase 5**: Vector SVG Marker Library & Custom SVG/Emoji support (see [.md/Marker SVG.md](file:///./.md/Marker%20SVG.md)).
- [x] **Phase 6**: Rich Hotspot Media (YouTube/Vimeo/MP4 embeds, audio player, markdown rendering, CTA buttons).
- [x] **Phase 8**: Standalone 1-Click ZIP export, Embed Modal generator, QR codes, WebXR & Gyroscope mode.

### 🔮 Immediate Next Milestone: Phase 7 — Floorplan / Mini-Map Radar
The primary pending feature from the roadmap is **Phase 7**:
1. **2D Floorplan Overlay Widget**: A collapsible minimap overlay anchored to a corner of the viewer viewport.
2. **Dynamic Viewing Cone (Radar)**: Top-down projection of the camera's position `(x, z)` and horizontal yaw angle displayed as an animated radar cone.
3. **Interactive Teleport Markers**: Clickable room/hotspot markers on the 2D floorplan to fly the 3D camera directly to that location.
4. **Multi-Level / Multi-Room Support**: Synchronizing floorplans when traveling through cross-scene portals.

---

## 🛠️ 7. Development & Customization Workflows

### How to Add a New 3DGS Project
1. Create a folder in `projects/`: `projects/<my_project>/`.
2. Place your 3D Gaussian Splatting file inside: e.g. `projects/<my_project>/<my_project>.sog`.
3. Create or duplicate a project JSON: `projects/<my_project>/<my_project>.json`.
   Minimal structure:
   ```json
   {
     "project": {
       "name": "My New Project",
       "version": 1,
       "theme": "dark",
       "scene": "./projects/my_project/my_project.sog",
       "autospinOnLoad": false,
       "background": {
         "type": "color",
         "color": "#1a1a1a"
       }
     },
     "cameras": {},
     "hotspots": [],
     "tourSettings": {
       "stepDuration": 5,
       "autoplayOnLoad": false
     }
   }
   ```
4. Load in the browser: `http://localhost:6660/?project=my_project`.

### Modifying Styles & UI Components
- All UI styling is consolidated in [lightorigin.css](file:///./lightorigin.css).
- Theme CSS variables (dark & light) are defined at the top (`:root`, `.lo-theme-dark`, `.lo-theme-light`).
- Changes take effect immediately upon page refresh (no CSS build/compiler needed).

---

## ⚠️ 8. Troubleshooting & Common Pitfalls

| Issue | Cause | Solution |
|---|---|---|
| **CORS error on fetch (`file:///...`)** | Opening `index.html` directly from file manager. | Run a local server: `python -m http.server 6660`. |
| **Black screen or "WebGPU not supported"** | Outdated browser or disabled hardware acceleration. | 1. Use Chrome or Edge.<br>2. Check `chrome://settings/system` (enable hardware acceleration).<br>3. Or add `?webgl` to the URL. |
| **Model fails to load** | Wrong path in `project.scene` or missing `.sog` file. | Check the browser Developer Tools (F12) Network tab. Ensure the relative path matches the file location in `projects/`. |
| **Hotspot card doesn't open** | Active mode is picking mode or viewer is in autoplay transition. | Click once to exit picking mode. In tour autoplay, clicking any marker pauses the tour and displays the card. |
| **Port 6660 already in use** | Another instance or background server running. | Choose another port, e.g. `python -m http.server 8080`, and browse to `http://localhost:8080/`. |

---

## 🤝 Handover Checklist for Your New Machine

- [ ] Repository cloned: `git clone https://github.com/CodeSome3D/LO-3DGS-Viewer.git`
- [ ] Confirmed `.sog` files exist in `projects/00_3_figures/`
- [ ] Started local server (`python -m http.server 6660` or `npx http-server -p 6660 -c-1`)
- [ ] Opened [http://localhost:6660/?mode=viewer&project=00_3_figures](http://localhost:6660/?mode=viewer&project=00_3_figures) and verified 3DGS rendering
- [ ] Opened [http://localhost:6660/?project=00_3_figures](http://localhost:6660/?project=00_3_figures) and verified Editor sidebar controls
- [ ] Ready to implement Phase 7 (Floorplan & Mini-Map Radar) or any custom tasks!
