# Frankenmode Specification & Implementation Guide

## 1. Overview: What is Frankenmode?
Frankenmode is the universal decoupling subsystem for the entire `touch.*` Max 9 UI suite (`touch.objects`).

In standard mode, all client widgets in the suite (`touch.button`, `touch.slider`, `touch.dial`, `touch.ummanu`, `touch.numticker`, `touch.panel`, etc.) link to the master bus (`Global("touch_theme_bus")`) and pull palette tokens from the shared memory dictionary (`Dict("touch_theme_store")`).

When an object enters **Frankenmode** (`sync_to_master = 0`):
1. **Bus Immunity:** It ignores all real-time theme broadcasts, slider scrubbing, and preset morphs originating from `touch.master.js`.
2. **Dict Shield:** It bypasses `loadThemeFromDict()` on patcher load, preventing Max's shared RAM cache from overwriting local colors.
3. **Local Sovereignty:** All styling parameters are edited locally in that object's own settings popup and saved strictly to that object's patcher state via `embedmessage()`.

---

## 2. The Core Problem: Why Max Needs Frankenmode
Max manages named `Dict` objects globally across the application session:
* If `touch.master.js` is opened in Patch A, it populates `Dict("touch_theme_store")` in application RAM.
* If you close Patch A and open Patch B (which contains any standalone `touch.*` widget), that widget's boot routine executes `loadThemeFromDict()`.
* It finds the lingering `touch_theme_store` in RAM and overwrites the local colors, even though `touch.master.js` was never placed in Patch B.
* If `touch.master.js` lives in the same patch, its boot routine automatically runs `syncThemeFromMaster()`, instantly flattening every `touch.*` object to the global palette.

**Frankenmode eliminates this by putting a hard gate in front of both the bus listener and the dictionary loader in every `touch.*` client object.**

---

## 3. Universal Client Object Integration (Any `touch.*` Object)

Drop these 6 steps into any `touch.*` script to give it Frankenmode capability:

### Step A: Declare State Variable (Top of Script)
```javascript
var sync_to_master = 1; // 1 = Linked to Master (Default), 0 = Frankenmode (Custom Local Styling)
```

### Step B: Shield the Dict Loader
```javascript
function loadThemeFromDict() {
    if (sync_to_master === 0) return; // FRANKEN SHIELD: Never touch RAM dict when unlinked!
    
    var themeDict = new Dict("touch_theme_store");
    if (!themeDict) return;
    try {
        if (themeDict.contains("bg_color")) background_color = parseColorArgs([themeDict.get("bg_color")], background_color);
        if (themeDict.contains("border_color")) border_color = parseColorArgs([themeDict.get("border_color")], border_color);
        // ... apply other object-specific theme tokens ...
    } catch(e) {}
}
```

### Step C: Shield the Bus Listener
```javascript
function onBusMessage(msg) {
    if (!msg) return;

    // Mutex commands (like closing menus/popups) ALWAYS pass through for UI safety:
    if (msg.action === "close_dropdown" && msg.sender !== uniqueID) {
        if (typeof closeDropdownMenu === "function") closeDropdownMenu();
        return;
    }

    // Master Emergency Force-Sync override (optional):
    if (msg.action === "force_sync_all") {
        sync_to_master = 1;
        mgraphics.redraw();
        if (typeof draw_popup_to_window === "function") draw_popup_to_window();
        if (typeof drawSettingsWindow === "function") drawSettingsWindow();
    }

    // FRANKEN SHIELD: Discard incoming theme broadcasts if decoupled
    if (sync_to_master === 0) return;

    // ... standard theme application follows ...
}
```

### Step D: Add Getters, Setters & Message Routing
```javascript
function get_sync_to_master() { return sync_to_master; }
function set_sync_to_master(v) {
    sync_to_master = parseInt(v, 10) ? 1 : 0;
    if (sync_to_master === 1) {
        loadThemeFromDict(); // Re-conform immediately to master theme when re-enabled
    }
    mgraphics.redraw();
    if (typeof showSettings !== "undefined" && showSettings) {
        if (typeof draw_popup_to_window === "function") draw_popup_to_window();
        if (typeof drawSettingsWindow === "function") drawSettingsWindow();
    }
}

// In anything() dispatcher:
if (key === "sync_to_master" || key === "master_sync" || key === "frankenmode") {
    set_sync_to_master(args[0]);
    return;
}
```

### Step E: Attribute Declaration & Patcher Persistence
```javascript
// Add to declareattribute section:
declareattribute("sync_to_master", {
    type: "int",
    style: "onoff",
    label: "Sync to Master",
    category: "Behavior",
    getter: "get_sync_to_master",
    setter: "set_sync_to_master",
    embed: 1
});

// Add inside save() function:
embedmessage("set_sync_to_master", sync_to_master);
```

### Step F: Add to 50/50 Attrui Inspector Popup
In the row definition list (`get_visible_rows()` or `get_settings_rows()`):
```javascript
rows.push({
    name: "Sync to Master",
    val: sync_to_master ? "ON" : "OFF (Franken)",
    is_toggle: true,
    action: "sync_to_master",
    target_id: 99
});
```

In the popup mouse click/toggle handler:
```javascript
if (r.action === "sync_to_master" || r.target_id === 99) {
    set_sync_to_master(sync_to_master ? 0 : 1);
}
```

---

## 4. Master Controller Hooks (`touch.master.js`)
Add global broadcast utilities to `touch.master.js` to control the fleet:

```javascript
// Force all objects in patch back to Master Theme:
function align_all_objects() {
    broadcastBus({ action: "force_sync_all" });
    syncThemeFromMaster(true);
}

// Release all objects in patch to Frankenmode:
function release_all_objects() {
    broadcastBus({ action: "release_all_franken" });
}
```

In client objects to support the global release command:
```javascript
if (msg.action === "release_all_franken") {
    sync_to_master = 0;
    mgraphics.redraw();
}
```

---

## 5. Universal Verification Checklist
Apply this checklist to any `touch.*` object implementing Frankenmode:

- [ ] **Live Scrub Isolation:** Toggle `Sync to Master: OFF` on the object. Drag sliders or morph presets in `touch.master`. The object must NOT change appearance.
- [ ] **Local Independence:** Change color/geometry locally in the object's settings window. Only this object updates; neither `touch.master` nor peer objects are affected.
- [ ] **Save / Reload with Master Present:** Save patch, close Max, and reopen the patch. The object retains its custom local styling and is NOT flattened by `touch.master` on startup.
- [ ] **Re-coupling:** Toggle `Sync to Master: ON`. The object instantly snaps back into lockstep with the global master theme.