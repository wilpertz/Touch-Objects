# Touch Suite: Master Receiver (Follow Master) Specification

## 1. The "Follow Master" Attribute Architecture
Add a persistent boolean attribute (`follow_master` or `master_receiver`) to every client widget (`touch.button`, `touch.hslider`, `touch.vslider`, `touch.menupicker`, `touch.panel`):

* **Default State:** `1` (ON) so newly placed objects immediately inherit the global theme from `touch.master`.
* **State Persistence:** Embedded via the standard patcher save pipeline (`save()` / `embedmessage`) so that saving and reopening the `.maxpat` file preserves each widget's linked or decoupled state.

---

## 2. The Two-Point Interception Gate
Decoupling requires intercepting master data at two critical execution points:

### Gate A: Live Broadcast Gate (During Runtime)
* Whenever `touch.master` broadcasts a new theme payload across `touch_theme_bus`, the client object's listener callback checks `follow_master`.
* If `follow_master === 0` (OFF): The callback immediately returns without applying any geometry, color, or typography updates.

### Gate B: Initialization Gate (On Patch Reopen / Load)
* When a patcher loads, Max restores the widget's locally saved attributes first, then executes the script's global initialization check against `themeBus.theme` and `touch_theme_store` Dict.
* If `follow_master === 0` (OFF): The script skips querying the master dictionary or global bus cache on startup, ensuring local custom styling is not overwritten on patch reopen.

---

## 3. UI Placement & Ergonomics

### Inside the Object Popup Inspector (`jit.window`):
* Place **Follow Master** (or **Master Sync**) as the first row at the top of the inspector's attribute list.
* Clicking the row toggles the state between **ON** and **OFF**.
* Optional: Display a visual indicator (such as an unlinked badge or dimmed status text) when the object is decoupled.

### Inside the Native Max Inspector:
* Exposed as an `onoff` style attribute categorized under **Theme Master Integration** (or **Behavior**).
* Allows patchers to automate or expose the decoupled state to `pattr` preset systems.

---

## 4. Interaction & Decoupling Workflow
Two viable options for handling decoupling:

* **Strict Manual Decoupling (Recommended):** The widget remains locked to `touch.master` until the user deliberately clicks the toggle to **OFF**. Any local edits made while ON will still be overwritten on the next master broadcast.
* **Auto-Detach on Edit:** Opening a widget's local color picker or dragging a local geometry slider automatically sets `follow_master` to **OFF**, ensuring local adjustments are never accidentally destroyed by a subsequent master remote change.