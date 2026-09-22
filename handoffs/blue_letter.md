# OPEN TECHNICAL SUBMISSION / ARCHITECTURAL DEFECT REPORT ("BLUE LETTER")

**TO:** Cycling '74 Engineering & Product Architecture  
**FROM:** Max/MSP UI Systems & `jsui`/`v8ui` Developers  
**DATE:** September 2026  
**SUBJECT:** Critical API Defect: `patcher.wind.location` Omits Internal Toolbar Gutters in Screen Coordinate Resolution  
**SEVERITY:** High (Prevents reliable anchoring of floating sub-windows/menus to `jsui` elements)

---

## 1. Executive Summary & Defect Statement

In Max 8 and Max 9 (`jsui` / `v8ui`), when a developer attempts to anchor an auxiliary floating context (such as a borderless `jit.window`, custom contextual dropdown, color picker, or tooltip) directly against an on-screen `jsui` object, **it is currently impossible to determine the true screen position of the canvas programmatically.**

### The Core Architectural Defect:
> **`this.patcher.wind.location` returns exclusively the outer OS-level window frame rectangle.**  
> It does **not** expose or account for internal toolbar gutters—specifically the `~38px` left sidebar and `~40px` top toolbar introduced when `toolbarvisible == 1`. 

Because Max provides no `canvas_to_screen(x, y)` translation method in JavaScript, developers are forced to reverse-engineer arbitrary pixel offsets across a 4-quadrant state matrix just to keep floating UI elements aligned with the objects that spawned them.

---

## 2. Empirical Proof: The 4-State Offset Matrix

To achieve flush, zero-drift alignment for a floating menu underneath a `jsui` object, we were forced to calibrate and hardcode the following **4-State Offset Matrix** into our codebase:

| State | Configuration | Calibrated Offsets Required | Architectural Reason (The C74 Discrepancy) |
| :--- | :--- | :--- | :--- |
| **State 1** | **Toolbars ON + Patching Mode** | `X = +150`, `Y = -40` | Compensates for Max's `~38px` left sidebar, `~40px` top toolbar, and internal canvas grid gutter. |
| **State 2** | **Toolbars ON + Presentation Mode** | `X = +38`, `Y = +10` | Max preserves the `38px` left sidebar gutter in presentation view, but alters the top toolbar behavior. |
| **State 3** | **No Toolbars + Patching Mode** | `X = 0`, `Y = -20` | Toolbars stripped (`toolbarvisible 0`); canvas sits at `(0, 0)`, requiring only the baseline titlebar chrome offset (`-20`). |
| **State 4** | **No Toolbars + Presentation Mode** | `X = 0`, `Y = -20` | Completely frameless performance mode (`toolbarvisible 0`). Matches State 3 baseline. |

### The Inconsistency:
If a patcher has `toolbarvisible 1`, Max's left sidebar pushes the canvas **38 pixels to the right** in *both* Patching and Presentation mode. Yet `wind.location[0]` reports the exact same screen X coordinate regardless of whether toolbars are visible, collapsed, or stripped. 

---

## 3. Technical Breakdown of the Pipeline Failure

In Javascript, the standard tree-walk to determine absolute screen position requires traversing:
[Target Box Coordinates in Canvas]

[bpatcher scroll offsets]

[Parent bpatcher rects]

[Top-level Patcher wind.location]

### Where the API breaks down:
1. **No Canvas Gutter Metrics:** `patcher.getattr("toolbarvisible")` returns a boolean, but exposes no gutter dimensions. There is no attribute exposing `sidebar_width` (`38px`) or `header_height` (`40px`).
2. **`presentation_rect` Desynchronization:** If a patcher has `openinpresentation == 1`, `p.getattr("presentation")` can report ambiguous states during active editing in patching mode, causing `presentation_rect` to be polled even when the object is visually rendered at `b.rect`.
3. **No Native Coordinate Transformer:** Unlike JUCE (`localPointToGlobal`), web DOM (`getBoundingClientRect`), or Cocoa (`convertRect:toView:`), Max's JS API has **zero native methods** to convert a box’s local canvas `rect` to global desktop screen space.

---

## 4. Impact on the Max Ecosystem

* **Broken Modular Toolkits:** Modern modular UI systems that rely on borderless `jit.window` instances to overcome Max's native menu limitations drift and misalign whenever moved between clean runtime environments (`toolbarvisible 0`) and standard development environments (`toolbarvisible 1`).
* **Brittle Codebases:** Developers are forced to maintain brittle tables of hardcoded pixel guesses that break across display scales, OS titlebar changes, and future Max point updates.

---

## 5. Requested Resolution / Proposed Fix

We formally request that the Cycling '74 core engineering team implement either of the following native solutions in the Max JS / V8 engine:

### Solution A (Preferred: Native Coordinate Transformer)
Expose a native coordinate translation method on `maxobj` / `patcher`:
```javascript
// Returns absolute OS screen coordinates [x, y, w, h] of the box,
// natively taking into account titlebars, toolbars, sidebars, bpatchers, and presentation mode:
var screenRect = this.box.getScreenRect();

Signed,
Developers of touch.objects and the Max/MSP Advanced UI Community