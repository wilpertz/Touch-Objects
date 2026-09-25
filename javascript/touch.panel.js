// ============================================================================
// touch.panel.js - Max 9 v8ui / jsui
// Soft Build - Subpatch Background Chassis & Diffusion Glass
// Synchronized with touch.master (Panels Page) with Standalone Fallback
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
    mgraphics.init();
}
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
setinletassist(0, "panel theme messages from master or patcher");

if (this.box) {
    this.box.border = 0;
}

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// STATE & OPTICAL PROPERTIES
// =============================================================
var border_radius = 20.0;
var border_size = 0.5;
var glass_spread = 120.0;
var drag_patch = 0;

var glass_inner  = [0.39, 0.39, 0.39, 0.43];
var glass_outer  = [0.13, 0.13, 0.13, 0.63];
var border_color = [0.33, 0.33, 0.33, 0.69];

function updateIgnoreClick() {
    if (this.box) {
        this.box.ignoreclick = drag_patch ? 0 : 1;
    }
}
updateIgnoreClick();

function safeArray(val, fallback) {
    if (!val) return fallback;
    var target = val;
    while (Array.isArray(target) && target.length === 1 && (Array.isArray(target[0]) || typeof target[0] === "object")) {
        target = target[0];
    }
    if (Array.isArray(target) && target.length >= 3) return target.map(Number);
    if (typeof target === "string") {
        var s = target.trim().split(/\s+/).map(Number);
        if (s.length >= 3) return s;
    }
    if (typeof target === "number") return [target, target, target, 1.0];
    try {
        var arr = arrayfromargs(val);
        while (Array.isArray(arr) && arr.length === 1 && (Array.isArray(arr[0]) || typeof arr[0] === "object")) {
            arr = arr[0];
        }
        if (arr.length >= 3) return arr.map(Number);
    } catch(e) {}
    return fallback;
}

// =============================================================
// 1. GLOBAL SUBSCRIBER & MASTER SYNC
// =============================================================
var bus = new Global("touch_theme_bus");
if (!bus.subscribers || typeof bus.subscribers !== "object") {
    bus.subscribers = {};
}

var themeDict = new Dict("touch_theme_store");

// Helper: Checks if Master has published live theme data
function hasThemeData(t) {
    if (!t || typeof t !== "object") return false;
    return !!(
        t.panel_glass_inner || t.glass_inner ||
        t.panel_glass_outer || t.glass_outer ||
        t.panel_border_color || t.border_color ||
        t.panel_glass_spread !== undefined || t.glass_spread !== undefined
    );
}

// Helper: Checks if Master store Dict contains data
function hasDictData(d) {
    if (!d) return false;
    try {
        return (
            d.contains("panel_glass_inner") || d.contains("glass_inner") ||
            d.contains("panel_border_color") || d.contains("border_color")
        );
    } catch(e) {
        return false;
    }
}

function syncFromMasterTheme(themeObj) {
    var t = themeObj || (bus && bus.theme);

    // Rule 1: Master is active -> Master takes full control
    if (hasThemeData(t)) {
        if (t.panel_glass_inner)  glass_inner   = safeArray(t.panel_glass_inner, glass_inner);
        else if (t.glass_inner)   glass_inner   = safeArray(t.glass_inner, glass_inner);

        if (t.panel_glass_outer)  glass_outer   = safeArray(t.panel_glass_outer, glass_outer);
        else if (t.glass_outer)   glass_outer   = safeArray(t.glass_outer, glass_outer);

        if (t.panel_border_color) border_color  = safeArray(t.panel_border_color, border_color);
        else if (t.border_color)  border_color  = safeArray(t.border_color, border_color);

        if (t.panel_glass_spread !== undefined) glass_spread = Number(t.panel_glass_spread);
        else if (t.glass_spread !== undefined)  glass_spread = Number(t.glass_spread);

        if (t.panel_border_size !== undefined)           border_size = Number(t.panel_border_size);
        else if (t.panel_border_thickness !== undefined) border_size = Number(t.panel_border_thickness);
        else if (t.border_size !== undefined)            border_size = Number(t.border_size);
        else if (t.border_thickness !== undefined)       border_size = Number(t.border_thickness);

        if (t.panel_border_radius !== undefined) border_radius = Number(t.panel_border_radius);
        else if (t.border_radius !== undefined)  border_radius = Number(t.border_radius);
        else if (t.corner_radius !== undefined)  border_radius = Number(t.corner_radius);

        mgraphics.redraw();
        return;
    } 
    
    // Check fallback Dict
    if (hasDictData(themeDict)) {
        if (themeDict.contains("panel_glass_inner")) {
            glass_inner   = safeArray(themeDict.get("panel_glass_inner"), glass_inner);
            glass_outer   = safeArray(themeDict.get("panel_glass_outer"), glass_outer);
            border_color  = safeArray(themeDict.get("panel_border_color"), border_color);
            border_radius = Number(themeDict.get("panel_border_radius"));
            border_size   = Number(themeDict.get("panel_border_size"));
            glass_spread  = Number(themeDict.get("panel_glass_spread"));
        } else if (themeDict.contains("glass_inner")) {
            glass_inner   = safeArray(themeDict.get("glass_inner"), glass_inner);
            glass_outer   = safeArray(themeDict.get("glass_outer"), glass_outer);
            border_color  = safeArray(themeDict.get("border_color"), border_color);
            border_radius = Number(themeDict.get("border_radius"));
            border_size   = Number(themeDict.get("border_size"));
            glass_spread  = Number(themeDict.get("glass_spread"));
        }
        mgraphics.redraw();
        return;
    }

    // Rule 2: No Master active -> keep the last saved file state intact
    mgraphics.redraw();
}

// Rule 3: Master broadcasts later -> instant takeover
function onLiveThemeBroadcast(t) {
    syncFromMasterTheme(t);
}

bus.subscribers[uniqueID] = onLiveThemeBroadcast;

// =============================================================
// 2. INCOMING MESSAGES & ROUTING
// =============================================================
function bang() {
    syncFromMasterTheme();
}

function anything() {
    var args = arrayfromargs(arguments);
    var name = messagename.replace(/^panel_/, "").replace(/^set_/, "").toLowerCase();

    if (name === "update" || name === "theme_update" || name === "theme_sync" || name === "refresh" || name === "refresh_theme") {
        syncFromMasterTheme();
        return;
    }

    if (name === "border_thickness" || name === "bordersize" || name === "border_size") name = "border_size";
    if (name === "corner_radius" || name === "cornerradius") name = "border_radius";

    if (typeof this["set_" + name] === "function") {
        this["set_" + name].apply(this, args);
        mgraphics.redraw();
    }
}

// =============================================================
// 3. ATTRIBUTES & INSPECTOR
// =============================================================
declareattribute("drag_patch", {
    type: "int", style: "onoff", setter: "set_drag_patch", getter: "get_drag_patch", embed: 1, label: "Drag Patch Window", category: "Panel Behavior"
});
function get_drag_patch() { return drag_patch; }
function set_drag_patch(v) { 
    drag_patch = v ? 1 : 0; 
    updateIgnoreClick();
    mgraphics.redraw();
}

declareattribute("border_color", {
    type: "rgba", style: "rgba", setter: "set_border_color", getter: "get_border_color", embed: 1, label: "Border Color"
});
function get_border_color() { return border_color; }
function set_border_color() { border_color = safeArray(arguments, border_color); mgraphics.redraw(); }

declareattribute("border_radius", {
    type: "float", setter: "set_border_radius", getter: "get_border_radius", embed: 1, label: "Border Radius"
});
function get_border_radius() { return border_radius; }
function set_border_radius(v) { border_radius = Math.max(0.0, Number(v)); mgraphics.redraw(); }

declareattribute("border_size", {
    type: "float", setter: "set_border_size", getter: "get_border_size", embed: 1, label: "Border Size"
});
function get_border_size() { return border_size; }
function set_border_size(v) { border_size = Math.max(0.0, Number(v)); mgraphics.redraw(); }

declareattribute("glass_inner", {
    type: "rgba", style: "rgba", setter: "set_glass_inner", getter: "get_glass_inner", embed: 1, label: "Glass Inner"
});
function get_glass_inner() { return glass_inner; }
function set_glass_inner() { glass_inner = safeArray(arguments, glass_inner); mgraphics.redraw(); }

declareattribute("glass_outer", {
    type: "rgba", style: "rgba", setter: "set_glass_outer", getter: "get_glass_outer", embed: 1, label: "Glass Outer Smear"
});
function get_glass_outer() { return glass_outer; }
function set_glass_outer() { glass_outer = safeArray(arguments, glass_outer); mgraphics.redraw(); }

declareattribute("glass_spread", {
    type: "float", setter: "set_glass_spread", getter: "get_glass_spread", embed: 1, label: "Glass Spread"
});
function get_glass_spread() { return glass_spread; }
function set_glass_spread(v) { glass_spread = Math.max(1.0, Number(v)); mgraphics.redraw(); }

// =============================================================
// 4. 16-STOP ULTRA-SMOOTH COSINE DIFFUSION ENGINE
// =============================================================
function applyUltraSmoothStops(pat, r, g, b, peakAlpha, fadeEndFrac) {
    var numStops = 16;
    for (var s = 0; s <= numStops; s++) {
        var t = s / numStops;
        var stopPos = t * fadeEndFrac;
        var factor = 0.5 * (1.0 + Math.cos(Math.PI * t));
        var alpha = peakAlpha * Math.pow(factor, 1.35);
        pat.add_color_stop_rgba(stopPos, r, g, b, alpha);
    }
    if (fadeEndFrac < 1.0) {
        pat.add_color_stop_rgba(1.0, r, g, b, 0.0);
    }
}

// =============================================================
// 5. PAINT PIPELINE
// =============================================================
function paint() {
    var sz = mgraphics.size;
    var w = (sz && sz[0] > 0) ? sz[0] : 100;
    var h = (sz && sz[1] > 0) ? sz[1] : 100;
    if (w < 4 || h < 4) return;

    mgraphics.save();

    var outerR = Math.min(border_radius, Math.min(w, h) * 0.5);

    var inC = safeArray(glass_inner, [0.39, 0.39, 0.39, 0.43]);
    var outC = safeArray(glass_outer, [0.13, 0.13, 0.13, 0.63]);
    var bC = safeArray(border_color, [0.33, 0.33, 0.33, 0.69]);

    var inR = inC[0], inG = inC[1], inB = inC[2], inA = inC[3] !== undefined ? inC[3] : 0.43;
    var outR = outC[0], outG = outC[1], outB = outC[2], outA = outC[3] !== undefined ? outC[3] : 0.63;
    var bR = bC[0], bG = bC[1], bB = bC[2], bA = bC[3] !== undefined ? bC[3] : 0.69;

    // 1. Base Substrate Fill
    mgraphics.set_source_rgba(inR, inG, inB, inA);
    mgraphics.rectangle_rounded(0, 0, w, h, outerR, outerR);
    mgraphics.fill();

    // 2. 16-Stop Cosine Diffusion Smear
    if (outA > 0.001 && glass_spread > 0) {
        var maxSpreadY = Math.min(h * 0.50, glass_spread);
        var maxSpreadX = Math.min(w * 0.50, glass_spread);
        var peakA = outA * 0.55;

        function fillDirectionalPass(x1, y1, x2, y2, fadeEndFrac) {
            var pat = mgraphics.pattern_create_linear(x1, y1, x2, y2);
            if (!pat) return;
            applyUltraSmoothStops(pat, outR, outG, outB, peakA, fadeEndFrac);
            mgraphics.set_source(pat);
            mgraphics.rectangle_rounded(0, 0, w, h, outerR, outerR);
            mgraphics.fill();
        }

        fillDirectionalPass(0, 0, 0, h, maxSpreadY / h);
        fillDirectionalPass(0, h, 0, 0, maxSpreadY / h);
        fillDirectionalPass(0, 0, w, 0, maxSpreadX / w);
        fillDirectionalPass(w, 0, 0, 0, maxSpreadX / w);
    }

    // 3. Perimeter Border
    if (border_size > 0.001 && bA > 0.001) {
        var halfB = border_size * 0.5;
        var strokeW = w - border_size;
        var strokeH = h - border_size;
        var strokeR = Math.max(0.0, outerR - halfB);

        mgraphics.set_source_rgba(bR, bG, bB, bA);
        mgraphics.set_line_width(border_size);
        mgraphics.rectangle_rounded(halfB, halfB, strokeW, strokeH, strokeR, strokeR);
        mgraphics.stroke();
    }

    mgraphics.restore();
}

function onresize(w, h) {
    mgraphics.redraw();
}
onresize.local = 1;

// =============================================================
// 6. WINDOW DRAG (Direct Patcher Window Tracking)
// =============================================================
var dragLastX = 0;
var dragLastY = 0;
var isDraggingWindow = false;

function onclick(x, y) {
    if (!drag_patch) return;
    dragLastX = x;
    dragLastY = y;
    isDraggingWindow = true;
}

function ondrag(x, y, but) {
    if (!drag_patch) return;
    if (but === 0) {
        isDraggingWindow = false;
        return;
    }
    
    var p = this.patcher;
    if (isDraggingWindow && p && p.wind) {
        var dx = x - dragLastX;
        var dy = y - dragLastY;
        
        if (dx !== 0 || dy !== 0) {
            var rect = p.wind.location;
            var w = rect[2] - rect[0];
            var h = rect[3] - rect[1];
            
            var newLeft = rect[0] + dx;
            var newTop  = rect[1] + dy;
            
            p.wind.location = [newLeft, newTop, newLeft + w, newTop + h];
            
            // Compensate for the window moving beneath the cursor
            dragLastX = x - dx;
            dragLastY = y - dy;
        }
    }
}

function onmouseup() {
    isDraggingWindow = false;
}

// =============================================================
// 7. LIFECYCLE & PERSISTENCE
// =============================================================

// Runs when patcher opens, AFTER Max restores saved file attributes
function loadbang() {
    syncFromMasterTheme();
}

// Saves fallback snapshot into the .maxpat file
function save() {
    embedmessage("set_drag_patch", drag_patch);
    embedmessage("set_border_radius", border_radius);
    embedmessage("set_border_size", border_size);
    embedmessage("set_glass_spread", glass_spread);
    embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
    embedmessage("set_glass_inner", glass_inner[0], glass_inner[1], glass_inner[2], glass_inner[3]);
    embedmessage("set_glass_outer", glass_outer[0], glass_outer[1], glass_outer[2], glass_outer[3]);
}

// Clean up global subscriber list when deleted
function notifydeleted() {
    try {
        if (bus && bus.subscribers && bus.subscribers[uniqueID]) {
            delete bus.subscribers[uniqueID];
        }
    } catch(e) {}
}

// Immediate paint on script compile / file save
syncFromMasterTheme();
mgraphics.redraw();