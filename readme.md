# Touch Objects (Touch JSUI Suite)

A native, high-performance tactile interface suite and spatial state-morphing ecosystem for **Cycling '74 Max 9** (`v8ui` / `jsui`).

---

## ⚡ Overview & Motivation

Max patches are traditionally tethered to mouse precision and nested `bpatcher` hierarchies. When performing live or migrating control surfaces to iPads and external touch displays, legacy solutions like Mira often fall short—introducing latency, visual scaling artifacts, and clunky touch hitboxes.

**Touch Objects** was engineered to solve these exact friction points:
* **Pad & Screen Mirroring Native:** Purpose-built for low-latency laptop-to-tablet screen mirroring (Sidecar, Duet, Luna, touch monitors, and web canvases).
* **Rethinking the bpatcher Bottleneck:** Self-contained, borderless floating component inspectors and draggable chassis panels (`touch.panel`) eliminate rigid subpatcher nesting.
* **Proximity Easing & Hybrid Input:** Sliders and tickers seamlessly switch between direct mouse precision and proximity-accelerated touch physics.
* **Global Theme Bus:** Zero patch cords required for styling. A centralized master broadcaster (`touch.master`) pushes unified palettes, geometry, and glass diffusion shaders across all listening objects in real time.
* **Spatial Preset Morphing:** Instant snapshot interpolation, 2D matrix morphing, and direct disk-backed JSON state synchronization with `pattrstorage`.

---

## 📦 Component Suite

### 1. Sliders & Continuous Controls
* **`touch.hslider` / `touch.vslider`**
  * Proximity-easing dragging, hold-repeat stepping, and discrete tap increments.
  * **Dual Chassis Styles:** *Ribbon* (technical reticle brackets with crossbar needle) or *Rail* (minimalist guide wire with floating solid orb).
  * **Decoupled Typography:** Rotated two-pass text engine separating label prefix from dynamic numeric values.
  * **Built-in 50/50 Attrui Inspector:** Right-click or touch the launcher dot to access a floating parameter inspector with bound tickers and HSV color pickers.

* **`touch.numticker`**
  * High-precision numeric display with vertical per-digit scrubbing and directional split tapping.
  * **Dual Touch Interfaces:** Tap to spawn either a multi-column vertical fader array or a full scientific keypad with sign toggle and backspace.
  * Integrated protruding or inline name tags with automated abbreviation modes (*No Vowels*, *Caps Only*, *Initials*).

### 2. Multi-State & Logic
* **`touch.mbutton`**
  * 1D multi-button strip configurable as horizontal rows or vertical stacks (1 to 16 cells).
  * Independent multi-toggle mode or exclusive radio-group mode (matching `live.tab`).
  * Per-button action modes: Momentary (with configurable flash duration), Toggle, or Touch-Hold.
  * Slash-delimited dual-state text rendering (`"OffText/OnText"`, e.g., `"Mute/Active"`).
  * **Signum Activity Gate (Outlet 1):** Real-time binary activity flag without external logic math. Outlet 0 outputs targeted `[tag state]` pairs for direct pairing with `[route]`.

### 3. Modulation & Curves
* **`touch.pfunction`**
  * Multi-breakpoint curve and envelope generator with oscilloscope reticle framing.
  * True exponential ease curves (`curve~` formatted) and straight linear segments (`line~` formatted).
  * L-frame graticule with boundary latching (locking endpoints to X min / X max).
  * Continuous coordinate streaming or bang-on-release output.

### 4. Menus & Browsing
* **`touch.ummanu`**
  * Left/Right immediate touch picker with scrub navigation and hold-to-repeat stepping.
  * Expands into a centered floating dropdown list on demand.
  * **MultiMenu Paging:** Browse multiple categories and banks via pagination chevrons or swipe gestures.
  * **Background Data Inlet:** Asynchronously accepts lists directly from `[folder]` to load presets and devices without locking the UI thread.

### 5. Presets & Spatial Morphing
* **`touch.status`**
  * 2D spatial preset morph grid and modular snapshot controller.
  * 1D strip or 2D matrix topology (`4/1`, `2/2`, `1/8`, etc.) with continuous float interpolation between adjacent snapshots.
  * Long-press slot stamping palette with quick-naming category tags.
  * Direct bidirectional bridge to `[pattrstorage]` with automated JSON disk synchronization in the package `states/` directory.

### 6. Chassis, Panels & Global Theme Master
* **`touch.master`**
  * The global aesthetic and configuration engine. Broadcasts palettes, reticle dimensions, glass panel diffusion, and inspector themes across the wireless `touch_theme_bus`.
  * Multi-row preset matrix with continuous row-morph faders and JSON preset disk storage.
  * Interactive 4-page canvas inspector and floating HSV spectrum color wheel.

* **`touch.panel`**
  * Optical diffusion glass backdrop featuring a 16-stop cosine directional diffusion smear engine.
  * Transparent pass-through mode (`ignoreclick = 1`) or window-drag mode to freely reposition borderless floating subpatcher windows.

---

## 🎨 Global Theme Engine

All objects listen wirelessly to `touch.master` via shared memory (`Global("touch_theme_bus")`). Updating a color, border radius, or glass diffusion setting on the master instantly propagates across your entire patch without drawing a single patch cord:

```text
                    [ touch.master ]  <-- Global Theme Bus
                    /      |       \
       [ touch.hslider ]   |   [ touch.mbutton ]
                           |
                    [ touch.status ]
```

---

## 🚀 Installation

1. Clone or download this repository into your Max Packages directory:
   * **macOS:** `~/Documents/Max 9/Packages/Touch Objects`
   * **Windows:** `C:\Users\<YourUsername>\Documents\Max 9\Packages\Touch Objects`

2. Launch (or restart) **Max 9**.

---

## 💡 Quick Start

1. Open Max 9 and instantiate any object:
   * `[touch.hslider]`
   * `[touch.mbutton]`
   * `[touch.numticker]`
   * `[touch.status]`
2. **Open the Inspector:** Right-click any component or click the red dot in its upper-right corner to open its floating 50/50 Attrui inspector.
3. **Explore Help Patchers:** Open any object's dedicated help file (e.g., `touch.hslider.maxhelp`).
4. **Theme Synchronization:** Add a `[touch.master]` to your patch to control the visual styling of all Touch components simultaneously.

---

## ⚙️ Technical Requirements

* **Environment:** Cycling '74 **Max 9** (native `v8ui` / `jsui` architecture).
* **Dependencies:** None! 100% native vanilla Max.
* **Platform:** macOS & Windows (optimized for touch screens and mirrored iPad displays).

---

## 👤 Author

Developed by **Wil Pertz** ([@wilpertz](https://github.com/wilpertz))