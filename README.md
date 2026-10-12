# GLSL Shader Visualizer

A React + Three.js shader playground inspired by the `backupproject` reference.

## Features

- Live GLSL fragment shader preview
- Template library with starter shader effects
- Editable shader source panel
- Copy-to-clipboard for TouchDesigner workflow
- Automatic uniforms: `uTime` and `uRes`

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notes

- The visualizer accepts shaders using either `fragColor` (TD-style output) or `gl_FragColor`.
- `uTime` is in seconds and `uRes` is the current preview resolution.
