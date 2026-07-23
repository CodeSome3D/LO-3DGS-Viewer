settings.json

&#x20;       │

&#x20;       ▼

ConfigurationLoader

&#x20;       │

&#x20;       ▼

Viewer

&#x20;       │

&#x20;┌────┴──────┐

&#x20;│               │

&#x20;▼               ▼

Camera       Scene

Manager      Manager

&#x20;│               │

&#x20;▼               ▼

Orbit      Gaussian Splats





\## Viewer



Responsible for:



\- initialization

\- render loop

\- resize

\- lifecycle



\---



\## CameraManager



Responsible for:



\- orbit mode

\- fps mode

\- transitions

\- camera presets



\---



\## SceneManager



Responsible for:



\- loading splats

\- unloading

\- visibility



\---



\## Settings



Loaded only once.



settings.json



↓



Config object



↓



Viewer initialization





window.lo.captureCamera()



Returns



{

position,

rotation,

target,

fov

}





settings.json

↓

Viewer

↓

CameraManager

↓

Renderer

↓

Frame

