\# Project Context



\## Vision



The goal is to create a reusable interactive Gaussian Splat viewer

based on LightOrigin.



The viewer should be easy to embed into any website and expose a

stable JavaScript API.



It is intended for product visualization,

photogrammetry,

architecture

and interactive presentations.



\---



\## Current priorities



1\. Stable camera API

2\. Reliable settings.json

3\. Orbit/FPS switching

4\. Viewer API

5\. Performance optimization



\---



\## Important design decisions



Camera state is controlled only through CameraManager.



Viewer settings are loaded from settings.json.



Debug helpers are exposed through:



window.lo



Current helper functions include:



\- captureCamera()

\- goToCamera()

\- forceOrbit()

\- forceFPS()

\- setCameraSpeed()

\- pickCenter()



These APIs should remain stable.



\---



\## Things already solved



\- viewer initialization

\- camera manager

\- orbit mode

\- FPS mode

\- inspector

\- camera serialization

\- animation playback



Avoid redesigning these systems.



\## Session summary

- Confirmed `.roo` documentation and project rules before changing code.
- Implemented viewer support for editor-saved `.lo.json` projects via `?mode=viewer&project=yourproject.lo.json`.
- Updated `index.html` to resolve project values from `window.project.project[...]` and to use saved scene URLs from editor `.lo.json` files.
- Updated `lightorigin.js` viewer initialization to load the project when the `project` query parameter exists, reapply theme after import, and start tours after project load.
- Preserved legacy format compatibility and existing viewer behavior.



\---



\## Known issues



(list)



\---



\## Lessons learned



Large refactors tend to introduce regressions.



Prefer incremental changes.



Avoid changing multiple systems simultaneously.

