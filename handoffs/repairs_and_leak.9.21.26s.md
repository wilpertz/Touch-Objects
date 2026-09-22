# Max 9 v8ui / jsui Suite: Scanlysis & Audit Report

## Executive Summary

| Script | Leaks / Churn | Pattr Status | Code Bugs / Typos |
| :--- | :--- | :--- | :--- |
| **`touch.mbutton.js`** | Clean task cleanup | Toggle only (Good) | None |
| **`touch.hslider.js`** | **C++ Window Leak**, Matrix Churn | No re-entrancy guard | Typo in `save()` (`border_color[3]`) |
| **`touch.numticker.js`** | **C++ Window Leak** | No re-entrancy guard | None |
| **`touch.pfunction.js`** | **C++ Window Leak**, Matrix Churn | Good dynamic points | **`list()` function declared 3 times** |
| **`touch.ummanu.js`** | **C++ Window Leak** | Comprehensive (2-tier) | Minor `drawSettingsWindow` duplicate |
| **`touch.vslider.js`** | **C++ Window Leak**, Matrix Churn | No re-entrancy guard | Typo in `save()` (`border_color[3]`) |

---

## Part 1: Leaks & Memory Churn

### 1. Severe: Missing `.free()` on `JitterObject("jit.window")`

In `hslider`, `numticker`, `pfunction`, `ummanu`, and `vslider`, the `notifydeleted()` function closes the windows and nulls out the JS pointer:

```javascript
// Current faulty pattern in 5 scripts:
try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
popupWindow = null;
```

* **The Leak**: In Max's Jitter V8 runtime, setting a `JitterObject` variable to `null` does **not** automatically free the underlying C/C++ window peer. If you delete and recreate the object or reload the patcher, invisible floating window instances remain orphaned in memory until Max restarts.
* **The Fix**: You must call `.free()` before setting to `null` (just like you correctly did in `touch.mbutton.js`):

```javascript
try { if (popupWindow) popupWindow.free(); } catch (e) {}
try { if (colorWindow) colorWindow.free(); } catch (e) {}
try { if (tickerWindow) tickerWindow.free(); } catch (e) {}
popupWindow = null; colorWindow = null; tickerWindow = null;
```

### 2. Heap Thrashing: `new JitterMatrix` in 60 FPS Mouse Drag Loops

In `hslider`, `vslider`, and `pfunction`, look at `draw_color_picker_popup()` and `draw_ticker_matrix_popup()`:

```javascript
function draw_color_picker_popup() {
  var winW = 200, winH = 240;
  if (colorMatrix) colorMatrix.freepeer();
  colorMatrix = new JitterMatrix(4, "char", winW, winH); // REALLOCATED ON EVERY MOUSE MOVE
  // ...
```

* **The Churn**: While dragging the color picker or scrubbing the bound ticker, this executes on every single frame, destroying and creating hundreds of raw Jitter matrix peers per second.
* **The Fix**: Use the existing `recycleMatrix(colorMatrix, winW, winH)` function instead of reallocating:

```javascript
colorMatrix = recycleMatrix(colorMatrix, winW, winH);
tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);
```

---

## Part 2: Pattr Ability & Preset Audit

### 1. The Missing `varname` (Invisible to `[autopattr]`)

None of the scripts assign `this.box.varname` automatically. Unless you manually type a Scripting Name into the Max Inspector for every single box, `[autopattr]` will ignore all of them.

* **Fix**: Place this at the top of every script to auto-register with `[autopattr]` immediately upon patcher load:

```javascript
if (this.box && !this.box.varname) {
  this.box.varname = "touch_" + uniqueID;
}
```

### 2. Missing Loop-Safe Guard (`is_transmitting`)

* `touch.mbutton.js` and `touch.ummanu.js` have an `is_transmitting` loop guard.
* `hslider.js`, `vslider.js`, and `numticker.js` do not.
* When `pattrstorage` recalls a preset, `setvalueof()` calls `msg_float()`, which fires `outlet(0, val)`. If `outlet 0` is wired into another object that feeds back into the slider, Max will trigger a stack overflow or freeze.
* **Fix**: Add `is_transmitting` to `msg_float()`:

```javascript
var is_transmitting = false;
function msg_float(v) {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    // update value & redraw
    outlet(0, getScaledValue());
  } finally {
    is_transmitting = false;
  }
}
```

### 3. Specific Object Pattr Behaviors

* **`touch.mbutton.js`**: Excellent implementation. Saving only Toggle buttons (Mode 1) while treating Momentary (0) and Touch-Hold (2) as live-only avoids latching momentary states across preset loads.
* **`touch.ummanu.js`**: Very strong. It handles single indices, multi-menu pairs `[page, idx]`, and raw string name matching on preset recall.
* **`touch.pfunction.js`**: Uncapped dynamic list serialization works well, but suffers from the function collision below.

---

## Part 3: Code Typos & Syntax Bugs

### 1. `touch.pfunction.js`: Duplicate `list()` Function Declarations

At line 585 of `touch.pfunction.js`, you have the full envelope list parser:

```javascript
function list() {
  var args = arrayfromargs(arguments);
  // ...
  points.push({ x: ..., y: ..., curve: ... });
}
```

Then further down (lines 632–638), you have:

```javascript
function list() {
  setvalueof.apply(this, arguments);
}

function list() {
  setvalueof.apply(this, arguments);
}
```

* **The Bug**: In JavaScript, latter function declarations hoist and overwrite earlier ones. The entire custom parsing logic on line 585 is wiped out by the dummy redirection.
* **The Fix**: Delete lines 632–638 in `touch.pfunction.js`.

### 2. `touch.hslider.js` & `touch.vslider.js`: Typo in `save()`

In `save()`:

```javascript
embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], border_color[3]);
//                                                                                                       ^^^^^^^^^^^^^^
```

* **The Bug**: `border_color[3]` is saved instead of `attr_border_color[3]`. If the chassis border and popup attribute borders have different alphas, saving the patcher corrupts the popup border alpha.
* **The Fix**: Change `border_color[3]` to `attr_border_color[3]`.

---

## Part 4: Required Patches

Apply these snippets to your respective files:

### For `touch.hslider.js`, `touch.vslider.js`, and `touch.pfunction.js`

Replace the matrix recreation in both popup functions with `recycleMatrix`:

```javascript
function draw_color_picker_popup() {
  var winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);
  var ctx = new MGraphics(winW, winH);
  // ...
}

function draw_ticker_matrix_popup() {
  var winW = 230, winH = 200;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);
  var ctx = new MGraphics(winW, winH);
  // ...
}
```

### For all scripts missing `.free()` in `notifydeleted()`
(`hslider`, `numticker`, `pfunction`, `ummanu`, `vslider`):

```javascript
function notifydeleted() {
  // Cancel all tasks...

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; } catch (e) {}
  try { if (dropdownWindow) dropdownWindow.visible = 0; } catch (e) {}
  try { if (touchWindow) touchWindow.visible = 0; } catch (e) {}

  // CRITICAL: Call free() to release Jitter C-peers
  try { if (popupWindow) popupWindow.free(); } catch (e) {}
  try { if (colorWindow) colorWindow.free(); } catch (e) {}
  try { if (tickerWindow) tickerWindow.free(); } catch (e) {}
  try { if (dropdownWindow) dropdownWindow.free(); } catch (e) {}
  try { if (touchWindow) touchWindow.free(); } catch (e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch (e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}
  try { if (tickerMatrix) tickerMatrix.freepeer(); } catch (e) {}
  try { if (dropdownMatrix) dropdownMatrix.freepeer(); } catch (e) {}
  try { if (touchMatrix) touchMatrix.freepeer(); } catch (e) {}

  popupWindow = null; colorWindow = null; tickerWindow = null;
  dropdownWindow = null; touchWindow = null;
  outMatrix = null; colorMatrix = null; tickerMatrix = null;
  dropdownMatrix = null; touchMatrix = null;
}
```

### For all scripts without auto-naming

Add this right after initializing your variables:

```javascript
if (this.box && !this.box.varname) {
  this.box.varname = "touch_" + uniqueID;
}
```