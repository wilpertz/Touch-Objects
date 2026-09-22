// ============================================================================
// touch.master.js - Max 9 v8ui / jsui
// THEME MASTER + ZERO-SCROLL PRESET MATRIX
// (4-Page Architecture: Objects, Panels, Special, Popups)
// ============================================================================

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 1;
setinletassist(0, "bang / presets / attribute messages");
setoutletassist(0, "theme attribute messages");

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. GLOBAL STATE STORE & PERSISTENT DICT
// =============================================================
var bus = new Global("touch_theme_bus");
if (!bus.subscribers || typeof bus.subscribers !== "object") {
    bus.subscribers = {};
}

var themeDict = new Dict("touch_theme_store");
var presetDict = new Dict("touch_theme_presets");

// Resolve absolute path next to the current patcher file
function getPresetFilePath() {
    if (this.patcher && this.patcher.filepath) {
        var fp = this.patcher.filepath;
        var lastSlash = Math.max(fp.lastIndexOf("/"), fp.lastIndexOf("\\"));
        if (lastSlash !== -1) {
            return fp.substring(0, lastSlash + 1) + "touch_theme_presets.json";
        }
    }
    return "touch_theme_presets.json";
}

function loadColor(key, fallback) {
    if (themeDict.contains(key)) {
        var v = themeDict.get(key);
        if (Array.isArray(v) && v.length >= 4) {
            return [Number(v[0]), Number(v[1]), Number(v[2]), Number(v[3])];
        }
    }
    return fallback;
}

// 4 Pages: Objects, Panels, Special, Popups
var master_categories = ["Objects", "Panels", "Special", "Popups"];
var active_page = themeDict.contains("active_page") ? Math.max(0, Math.min(3, Number(themeDict.get("active_page")))) : 0;
var glide_enabled = 1;

// --- PAGE 0: OBJECTS ---
var bg_color         = loadColor("bg_color", [0.12, 0.12, 0.14, 0.85]);
var border_color     = loadColor("border_color", [0.45, 0.45, 0.50, 1.00]);
var text_color       = loadColor("text_color", [0.92, 0.94, 0.98, 1.00]);
var highlight_color  = loadColor("highlight_color", [1.00, 0.22, 0.25, 1.00]);

var border_radius    = themeDict.contains("border_radius")    ? Number(themeDict.get("border_radius"))    : 8.0;
var border_thickness = themeDict.contains("border_thickness") ? Number(themeDict.get("border_thickness")) : 1.2;
var border_extension = themeDict.contains("border_extension") ? Number(themeDict.get("border_extension")) : 6.0;

// --- PAGE 1: PANELS ---
var panel_glass_inner  = loadColor("panel_glass_inner", [0.39, 0.39, 0.39, 0.43]);
var panel_glass_outer  = loadColor("panel_glass_outer", [0.13, 0.13, 0.13, 0.63]);
var panel_border_color = loadColor("panel_border_color", [0.33, 0.33, 0.33, 0.69]);

var panel_border_radius = themeDict.contains("panel_border_radius") ? Number(themeDict.get("panel_border_radius")) : 20.0;
var panel_border_size   = themeDict.contains("panel_border_size")   ? Number(themeDict.get("panel_border_size"))   : 0.5;
var panel_glass_spread  = themeDict.contains("panel_glass_spread")  ? Number(themeDict.get("panel_glass_spread"))  : 120.0;

// --- PAGE 2: SPECIAL ---
var popup_dot_color     = loadColor("popup_dot_color", [1.00, 0.00, 0.00, 1.00]);
var slider_rail_color   = loadColor("slider_rail_color", [1.00, 0.00, 0.00, 1.00]);
var slider_handle_color = loadColor("slider_handle_color", [1.00, 1.00, 1.00, 1.00]);
var decimal_color       = loadColor("decimal_color", [1.00, 1.00, 1.00, 0.75]);
var mode_color          = loadColor("mode_color", [0.85, 0.85, 0.90, 1.00]);
var slider_rail_breadth = themeDict.contains("slider_rail_breadth") ? Number(themeDict.get("slider_rail_breadth")) : 2.5;

// --- PAGE 3: POPUPS / INSPECTORS ---
var pop_bgcolor         = loadColor("pop_bgcolor", [0.12, 0.12, 0.15, 1.00]);
var attr_bg_color       = loadColor("attr_bg_color", [0.22, 0.22, 0.22, 1.00]);
var attr_border_color   = loadColor("attr_border_color", [0.28, 0.28, 0.32, 1.00]);
var attr_slider_color   = loadColor("attr_slider_color", [0.50, 0.50, 0.50, 1.00]);
var attr_text_color     = loadColor("attr_text_color", [1.00, 1.00, 1.00, 1.00]);

// =============================================================
// PRESET & TAG SUBSYSTEM STATE
// =============================================================
var preset_cols         = 5;
var preset_rows         = 1;
var preset_mode         = 0;
var active_preset_idx   = -1;
var is_naming_active    = false;
var naming_target_slot  = -1;
var naming_buffer       = "";
var presets_cache       = [];

var raw_quick_tags      = "NEON DARK GLASS STAGE CYBER ACID CLEAN INIT";
var row_slider_norms    = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
var active_row_slider   = -1;

var presetWindow = new JitterObject("jit.window", "tmaster_pre_" + uniqueID);
presetWindow.floating = 1;
presetWindow.visible = 0;
presetWindow.border = 1;
presetWindow.grow = 0;
presetWindow.size = [420, 108];
presetWindow.title = "Theme Presets Matrix";

var presetMatrix = new JitterMatrix(4, "char", 420, 108);
var presetListener = null;

bus.theme = {
    bg_color: bg_color, border_color: border_color, text_color: text_color, font_color: text_color,
    highlight_color: highlight_color, handle_color: highlight_color, btn_color_off: bg_color, btn_color_on: highlight_color,
    border_radius: border_radius, border_thickness: border_thickness, border_extension: border_extension,
    corner_radius: border_radius, bordersize: border_thickness, pop_bgcolor: pop_bgcolor,
    panel_glass_inner: panel_glass_inner, panel_glass_outer: panel_glass_outer, panel_border_color: panel_border_color,
    panel_border_radius: panel_border_radius, panel_border_size: panel_border_size, panel_glass_spread: panel_glass_spread,
    popup_dot_color: popup_dot_color, slider_rail_color: slider_rail_color, track_color: slider_rail_color,
    slider_handle_color: slider_handle_color, decimal_color: decimal_color, mode_color: mode_color,
    slider_rail_breadth: slider_rail_breadth, track_breadth: slider_rail_breadth, accent_color: highlight_color,
    attr_bg_color: attr_bg_color, attr_border_color: attr_border_color,
    attr_slider_color: attr_slider_color, attr_text_color: attr_text_color
};

function recycleMatrix(mat, w, h) {
    if (!mat) return new JitterMatrix(4, "char", w, h);
    var d = mat.dim;
    if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
    return mat;
}

function onresize(w, h) { mgraphics.redraw(); }
onresize.local = 1;

function get_dimensions() {
    var sz = mgraphics.size;
    if (sz && sz[0] > 10 && sz[1] > 10) return { w: sz[0], h: sz[1] };
    if (this.box && this.box.rect) {
        var r = this.box.rect;
        return { w: Math.max(40, r[2] - r[0]), h: Math.max(40, r[3] - r[1]) };
    }
    return { w: 180, h: 230 };
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(c1, c2, t) {
    return [
        lerp(c1[0], c2[0], t),
        lerp(c1[1], c2[1], t),
        lerp(c1[2], c2[2], t),
        lerp(c1[3] !== undefined ? c1[3] : 1.0, c2[3] !== undefined ? c2[3] : 1.0, t)
    ];
}

function rgbToHsv(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = (max === 0 ? 0 : d / max), v = max;
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}

function hsvToRgb(h, s, v) {
    var r, g, b, i = Math.floor(h * 6), f = h * 6 - i;
    var p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
    }
    return [r, g, b];
}

function get_tag_list() {
    var str = (raw_quick_tags || "").trim();
    if (!str) return [];
    return str.split(/\s+/).filter(function(s) { return s.length > 0; });
}

function get_tag_grid_info() {
    var tags = get_tag_list();
    var cols = 4;
    var rows = Math.max(1, Math.ceil(tags.length / cols));
    return { tags: tags, cols: cols, rows: rows, totalSlots: rows * cols };
}

// =============================================================
// 2. BROADCASTER & STREAMING
// =============================================================
var lastBroadcastTime = 0;
var broadcastIntervalMs = 25;

function cleanSubscribers() {
    if (!bus.subscribers || typeof bus.subscribers !== "object") {
        bus.subscribers = {};
    }
}

function outputThemeMessages() {
    if (outlets > 0) {
        outlet(0, ["bg_color"].concat(bus.theme.bg_color));
        outlet(0, ["border_color"].concat(bus.theme.border_color));
        outlet(0, ["text_color"].concat(bus.theme.text_color));
        outlet(0, ["font_color"].concat(bus.theme.text_color));
        outlet(0, ["highlight_color"].concat(bus.theme.highlight_color));
        outlet(0, ["handle_color"].concat(bus.theme.highlight_color));
        outlet(0, ["btn_color_off"].concat(bus.theme.btn_color_off));
        outlet(0, ["btn_color_on"].concat(bus.theme.btn_color_on));

        outlet(0, "border_radius", bus.theme.border_radius);
        outlet(0, "border_thickness", bus.theme.border_thickness);
        outlet(0, "border_extension", bus.theme.border_extension);
        outlet(0, "corner_radius", bus.theme.border_radius);
        outlet(0, "bordersize", bus.theme.border_thickness);

        outlet(0, ["panel_glass_inner"].concat(bus.theme.panel_glass_inner));
        outlet(0, ["panel_glass_outer"].concat(bus.theme.panel_glass_outer));
        outlet(0, ["panel_border_color"].concat(bus.theme.panel_border_color));
        outlet(0, "panel_border_radius", bus.theme.panel_border_radius);
        outlet(0, "panel_border_size", bus.theme.panel_border_size);
        outlet(0, "panel_glass_spread", bus.theme.panel_glass_spread);

        outlet(0, ["popup_dot_color"].concat(bus.theme.popup_dot_color));
        outlet(0, ["slider_rail_color"].concat(bus.theme.slider_rail_color));
        outlet(0, ["slider_handle_color"].concat(bus.theme.slider_handle_color));
        outlet(0, ["decimal_color"].concat(bus.theme.decimal_color));
        outlet(0, ["mode_color"].concat(bus.theme.mode_color));
        outlet(0, "slider_rail_breadth", bus.theme.slider_rail_breadth);
        outlet(0, "track_breadth", bus.theme.slider_rail_breadth);

        outlet(0, ["pop_bgcolor"].concat(bus.theme.pop_bgcolor));
        outlet(0, ["attr_bg_color"].concat(bus.theme.attr_bg_color));
        outlet(0, ["attr_border_color"].concat(bus.theme.attr_border_color));
        outlet(0, ["attr_slider_color"].concat(bus.theme.attr_slider_color));
        outlet(0, ["attr_text_color"].concat(bus.theme.attr_text_color));
    }
}

function broadcast(force) {
    var now = new Date().getTime();
    if (force || (now - lastBroadcastTime >= broadcastIntervalMs)) {
        lastBroadcastTime = now;
        cleanSubscribers();

        if (bus.subscribers) {
            for (var k in bus.subscribers) {
                if (bus.subscribers.hasOwnProperty(k) && typeof bus.subscribers[k] === "function") {
                    try { bus.subscribers[k](bus.theme); } catch(e) {}
                }
            }
        }

        try {
            messnamed("touch_theme_bus", "update");
        } catch(e) {}

        if (force) {
            outputThemeMessages();
        }
    }
}

function syncThemeFromMaster(isCommit) {
    bus.theme.bg_color         = bg_color;
    bus.theme.border_color     = border_color;
    bus.theme.text_color       = text_color;
    bus.theme.font_color       = text_color;
    bus.theme.highlight_color  = highlight_color;
    bus.theme.handle_color     = highlight_color;
    bus.theme.btn_color_off    = bg_color;
    bus.theme.btn_color_on     = highlight_color;
    bus.theme.accent_color     = highlight_color;

    bus.theme.border_radius    = border_radius;
    bus.theme.border_thickness = border_thickness;
    bus.theme.border_extension = border_extension;
    bus.theme.corner_radius    = border_radius;
    bus.theme.bordersize       = border_thickness;

    bus.theme.panel_glass_inner   = panel_glass_inner;
    bus.theme.panel_glass_outer   = panel_glass_outer;
    bus.theme.panel_border_color  = panel_border_color;
    bus.theme.panel_border_radius = panel_border_radius;
    bus.theme.panel_border_size   = panel_border_size;
    bus.theme.panel_glass_spread  = panel_glass_spread;

    bus.theme.popup_dot_color     = popup_dot_color;
    bus.theme.slider_rail_color   = slider_rail_color;
    bus.theme.slider_handle_color = slider_handle_color;
    bus.theme.decimal_color       = decimal_color;
    bus.theme.mode_color          = mode_color;
    bus.theme.slider_rail_breadth = slider_rail_breadth;
    bus.theme.track_breadth       = slider_rail_breadth;

    bus.theme.pop_bgcolor         = pop_bgcolor;
    bus.theme.attr_bg_color       = attr_bg_color;
    bus.theme.attr_border_color   = attr_border_color;
    bus.theme.attr_slider_color   = attr_slider_color;
    bus.theme.attr_text_color     = attr_text_color;

    themeDict.set("active_page", active_page);
    themeDict.set("bg_color", bg_color);
    themeDict.set("border_color", border_color);
    themeDict.set("text_color", text_color);
    themeDict.set("highlight_color", highlight_color);
    themeDict.set("border_radius", border_radius);
    themeDict.set("border_thickness", border_thickness);
    themeDict.set("border_extension", border_extension);
    themeDict.set("panel_glass_inner", panel_glass_inner);
    themeDict.set("panel_glass_outer", panel_glass_outer);
    themeDict.set("panel_border_color", panel_border_color);
    themeDict.set("panel_border_radius", panel_border_radius);
    themeDict.set("panel_border_size", panel_border_size);
    themeDict.set("panel_glass_spread", panel_glass_spread);
    themeDict.set("popup_dot_color", popup_dot_color);
    themeDict.set("slider_rail_color", slider_rail_color);
    themeDict.set("slider_handle_color", slider_handle_color);
    themeDict.set("decimal_color", decimal_color);
    themeDict.set("mode_color", mode_color);
    themeDict.set("slider_rail_breadth", slider_rail_breadth);

    themeDict.set("pop_bgcolor", pop_bgcolor);
    themeDict.set("attr_bg_color", attr_bg_color);
    themeDict.set("attr_border_color", attr_border_color);
    themeDict.set("attr_slider_color", attr_slider_color);
    themeDict.set("attr_text_color", attr_text_color);

    broadcast(isCommit);
}

// =============================================================
// 3. COLOR PICKER
// =============================================================
var colorWindow = new JitterObject("jit.window", "tmaster_col_" + uniqueID);
colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0;
colorWindow.size = [200, 240];
var colorMatrix = new JitterMatrix(4, "char", 200, 240);
var colorListener = null;
var active_color_target = "bg_color";
var picker_drag_zone = 0;
var cur_h = 0.15, cur_s = 0.85, cur_v = 0.85, cur_a = 0.85;

function getTargetColor(targetKey) {
    if (targetKey === "border_color") return border_color;
    if (targetKey === "text_color") return text_color;
    if (targetKey === "highlight_color") return highlight_color;
    if (targetKey === "panel_glass_inner") return panel_glass_inner;
    if (targetKey === "panel_glass_outer") return panel_glass_outer;
    if (targetKey === "panel_border_color") return panel_border_color;
    if (targetKey === "popup_dot_color") return popup_dot_color;
    if (targetKey === "slider_rail_color") return slider_rail_color;
    if (targetKey === "slider_handle_color") return slider_handle_color;
    if (targetKey === "decimal_color") return decimal_color;
    if (targetKey === "mode_color") return mode_color;
    if (targetKey === "pop_bgcolor") return pop_bgcolor;
    if (targetKey === "attr_bg_color") return attr_bg_color;
    if (targetKey === "attr_border_color") return attr_border_color;
    if (targetKey === "attr_slider_color") return attr_slider_color;
    if (targetKey === "attr_text_color") return attr_text_color;
    return bg_color;
}

function getTargetTitle(targetKey) {
    if (targetKey === "border_color") return "Border Color";
    if (targetKey === "text_color") return "Text Color";
    if (targetKey === "highlight_color") return "Highlight Color";
    if (targetKey === "panel_glass_inner") return "Glass Inner";
    if (targetKey === "panel_glass_outer") return "Glass Outer";
    if (targetKey === "panel_border_color") return "Panel Border";
    if (targetKey === "popup_dot_color") return "Popup Dot Color";
    if (targetKey === "slider_rail_color") return "Slider Rail Color";
    if (targetKey === "slider_handle_color") return "Slider Knob/Line";
    if (targetKey === "decimal_color") return "Decimal Color";
    if (targetKey === "mode_color") return "Mode Color";
    if (targetKey === "pop_bgcolor") return "Popup BG";
    if (targetKey === "attr_bg_color") return "Attr BG";
    if (targetKey === "attr_border_color") return "Attr Border";
    if (targetKey === "attr_slider_color") return "Attr Slider";
    if (targetKey === "attr_text_color") return "Attr Text";
    return "Body Color";
}

function initPickerFromTarget() {
    var target = getTargetColor(active_color_target);
    var hsv = rgbToHsv(target[0], target[1], target[2]);
    cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2];
    cur_a = (target[3] !== undefined ? target[3] : 1.0);
}

function applyPickerToTarget() {
    var rgb = hsvToRgb(cur_h, cur_s, cur_v);
    var rgba = [rgb[0], rgb[1], rgb[2], cur_a];

    if (active_color_target === "bg_color") bg_color = rgba;
    else if (active_color_target === "border_color") border_color = rgba;
    else if (active_color_target === "text_color") text_color = rgba;
    else if (active_color_target === "highlight_color") highlight_color = rgba;
    else if (active_color_target === "panel_glass_inner") panel_glass_inner = rgba;
    else if (active_color_target === "panel_glass_outer") panel_glass_outer = rgba;
    else if (active_color_target === "panel_border_color") panel_border_color = rgba;
    else if (active_color_target === "popup_dot_color") popup_dot_color = rgba;
    else if (active_color_target === "slider_rail_color") slider_rail_color = rgba;
    else if (active_color_target === "slider_handle_color") slider_handle_color = rgba;
    else if (active_color_target === "decimal_color") decimal_color = rgba;
    else if (active_color_target === "mode_color") mode_color = rgba;
    else if (active_color_target === "pop_bgcolor") pop_bgcolor = rgba;
    else if (active_color_target === "attr_bg_color") attr_bg_color = rgba;
    else if (active_color_target === "attr_border_color") attr_border_color = rgba;
    else if (active_color_target === "attr_slider_color") attr_slider_color = rgba;
    else if (active_color_target === "attr_text_color") attr_text_color = rgba;

    syncThemeFromMaster(true);
    mgraphics.redraw();
}

function draw_color_picker_popup() {
    var winW = 200, winH = 240;
    colorMatrix = recycleMatrix(colorMatrix, winW, winH);

    var ctx = new MGraphics(winW, winH);
    ctx.set_source_rgba(0.11, 0.11, 0.13, 1.0);
    ctx.rectangle(0, 0, winW, winH); ctx.fill();

    ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
    ctx.arc(14, 14, 6.0, 0, Math.PI * 2); ctx.fill();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
    ctx.move_to(28, 17); ctx.show_text(getTargetTitle(active_color_target));

    var hueX = 10, hueY = 28, hueW = 180, hueH = 16;
    var huePat = ctx.pattern_create_linear(hueX, 0, hueX + hueW, 0);
    huePat.add_color_stop_rgba(0.00, 1,0,0,1); huePat.add_color_stop_rgba(0.17, 1,1,0,1);
    huePat.add_color_stop_rgba(0.33, 0,1,0,1); huePat.add_color_stop_rgba(0.50, 0,1,1,1);
    huePat.add_color_stop_rgba(0.67, 0,0,1,1); huePat.add_color_stop_rgba(0.83, 1,0,1,1);
    huePat.add_color_stop_rgba(1.00, 1,0,0,1);
    ctx.set_source(huePat);
    ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3); ctx.fill();

    var hIndX = hueX + cur_h * hueW;
    ctx.set_source_rgba(1, 1, 1, 1); ctx.set_line_width(1.5);
    ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

    var svX = 10, svY = 50, svW = 180, svH = 115;
    var pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
    ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
    ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

    var satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
    satPat.add_color_stop_rgba(0.0, 1,1,1,1); satPat.add_color_stop_rgba(1.0, 1,1,1,0);
    ctx.set_source(satPat);
    ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

    var valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
    valPat.add_color_stop_rgba(0.0, 0,0,0,0); valPat.add_color_stop_rgba(1.0, 0,0,0,1);
    ctx.set_source(valPat);
    ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

    var svIndX = svX + cur_s * svW;
    var svIndY = svY + (1.0 - cur_v) * svH;
    ctx.set_source_rgba(cur_v > 0.4 ? [0,0,0,0.9] : [1,1,1,0.9]);
    ctx.set_line_width(1.2);
    ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2); ctx.stroke();

    var opX = 10, opY = 172, opW = 180, opH = 16;
    ctx.set_source_rgba(0.2, 0.2, 0.22, 1.0);
    ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3); ctx.fill();
    var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
    var opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
    opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
    opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
    ctx.set_source(opPat);
    ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3); ctx.fill();

    var opIndX = opX + cur_a * opW;
    ctx.set_source_rgba(1, 1, 1, 1); ctx.set_line_width(1.5);
    ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

    var swX = 10, swY = 196, swW = 180, swH = 34;
    ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
    ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3); ctx.fill();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(cur_v > 0.5 ? [0,0,0,0.8] : [1,1,1,0.9]);
    ctx.move_to(swX + 8, swY + 21);
    ctx.show_text("Opacity: " + Math.round(cur_a * 100) + "%");

    var img = new Image(ctx);
    img.tonamedmatrix(colorMatrix.name);
    colorWindow.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
    if (event.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
    if (event.eventname === "mouse") {
        var a = arrayfromargs(event.args), mx = a[0], my = a[1], mbut = a[2];
        if (mbut === 0) { picker_drag_zone = 0; return; }

        if (mbut) {
            if (mx < 24 && my < 24) { colorWindow.visible = 0; picker_drag_zone = 0; mgraphics.redraw(); return; }
            if (picker_drag_zone === 0) {
                if (mx >= 10 && mx <= 190 && my >= 24 && my <= 46) picker_drag_zone = 1;
                else if (mx >= 10 && mx <= 190 && my >= 48 && my <= 168) picker_drag_zone = 2;
                else if (mx >= 10 && mx <= 190 && my >= 170 && my <= 190) picker_drag_zone = 3;
            }
            if (picker_drag_zone === 1) cur_h = clamp((mx - 10) / 180, 0.0, 1.0);
            else if (picker_drag_zone === 2) {
                cur_s = clamp((mx - 10) / 180, 0.0, 1.0);
                cur_v = clamp(1.0 - (my - 50) / 115, 0.0, 1.0);
            } else if (picker_drag_zone === 3) {
                cur_a = clamp((mx - 10) / 180, 0.0, 1.0);
            }
            applyPickerToTarget();
            draw_color_picker_popup();
        }
    }
}
colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);

function openColorPicker(targetKey, anchorX, anchorY) {
    active_color_target = targetKey;
    initPickerFromTarget();
    colorWindow.title = getTargetTitle(targetKey);

    if (this.box) {
        var is_pres = (this.patcher && this.patcher.getattr("presentation") == 1);
        var originX = 0, originY = 0;
        if (is_pres) {
            var pr = this.box.getattr("presentation_rect");
            if (pr && pr.length >= 2) { originX = pr[0]; originY = pr[1]; }
        } else if (this.box.rect) {
            originX = this.box.rect[0]; originY = this.box.rect[1];
        }
        colorWindow.pos = [originX + anchorX + 10, originY + anchorY - 40];
    }
    colorWindow.visible = 1;
    colorWindow.front();
    draw_color_picker_popup();
}

// =============================================================
// 4. PRESET DATA STORAGE & ROW MORPH ENGINE
// =============================================================
function loadPresetsFromDict() {
    presets_cache = [];
    var totalSlots = preset_cols * preset_rows;
    for (var i = 0; i < totalSlots; i++) {
        var key = "slot_" + i;
        if (presetDict && presetDict.contains(key)) {
            try {
                var rawVal = presetDict.get(key);
                if (typeof rawVal === "string") {
                    presets_cache.push(JSON.parse(rawVal));
                } else if (typeof rawVal === "object" && rawVal !== null) {
                    presets_cache.push(rawVal);
                } else {
                    presets_cache.push({ name: "[EMPTY]", is_set: false, data: null });
                }
            } catch(e) {
                presets_cache.push({ name: "[EMPTY]", is_set: false, data: null });
            }
        } else {
            presets_cache.push({ name: "[EMPTY]", is_set: false, data: null });
        }
    }
}

function captureThemeSnapshot(nameStr) {
    return {
        name: nameStr || "Preset",
        is_set: true,
        data: {
            bg_color: bg_color.slice(0), border_color: border_color.slice(0), text_color: text_color.slice(0),
            highlight_color: highlight_color.slice(0),
            border_radius: border_radius, border_thickness: border_thickness, border_extension: border_extension,
            panel_glass_inner: panel_glass_inner.slice(0), panel_glass_outer: panel_glass_outer.slice(0),
            panel_border_color: panel_border_color.slice(0), panel_border_radius: panel_border_radius,
            panel_border_size: panel_border_size, panel_glass_spread: panel_glass_spread,
            popup_dot_color: popup_dot_color.slice(0), slider_rail_color: slider_rail_color.slice(0),
            slider_handle_color: slider_handle_color.slice(0), decimal_color: decimal_color.slice(0),
            mode_color: mode_color.slice(0), slider_rail_breadth: slider_rail_breadth,
            pop_bgcolor: pop_bgcolor.slice(0), attr_bg_color: attr_bg_color.slice(0),
            attr_border_color: attr_border_color.slice(0), attr_slider_color: attr_slider_color.slice(0),
            attr_text_color: attr_text_color.slice(0)
        }
    };
}

function applyRawThemeData(d, isCommit) {
    if (!d) return;
    if (d.bg_color) bg_color = d.bg_color.slice(0);
    if (d.border_color) border_color = d.border_color.slice(0);
    if (d.text_color) text_color = d.text_color.slice(0);
    if (d.highlight_color) highlight_color = d.highlight_color.slice(0);
    if (d.border_radius !== undefined) border_radius = Number(d.border_radius);
    if (d.border_thickness !== undefined) border_thickness = Number(d.border_thickness);
    if (d.border_extension !== undefined) border_extension = Number(d.border_extension);

    if (d.panel_glass_inner) panel_glass_inner = d.panel_glass_inner.slice(0);
    if (d.panel_glass_outer) panel_glass_outer = d.panel_glass_outer.slice(0);
    if (d.panel_border_color) panel_border_color = d.panel_border_color.slice(0);
    if (d.panel_border_radius !== undefined) panel_border_radius = Number(d.panel_border_radius);
    if (d.panel_border_size !== undefined) panel_border_size = Number(d.panel_border_size);
    if (d.panel_glass_spread !== undefined) panel_glass_spread = Number(d.panel_glass_spread);

    if (d.popup_dot_color) popup_dot_color = d.popup_dot_color.slice(0);
    if (d.slider_rail_color) slider_rail_color = d.slider_rail_color.slice(0);
    if (d.slider_handle_color) slider_handle_color = d.slider_handle_color.slice(0);
    if (d.decimal_color) decimal_color = d.decimal_color.slice(0);
    if (d.mode_color) mode_color = d.mode_color.slice(0);
    if (d.slider_rail_breadth !== undefined) slider_rail_breadth = Number(d.slider_rail_breadth);

    if (d.pop_bgcolor) pop_bgcolor = d.pop_bgcolor.slice(0);
    if (d.attr_bg_color) attr_bg_color = d.attr_bg_color.slice(0);
    if (d.attr_border_color) attr_border_color = d.attr_border_color.slice(0);
    if (d.attr_slider_color) attr_slider_color = d.attr_slider_color.slice(0);
    if (d.attr_text_color) attr_text_color = d.attr_text_color.slice(0);

    syncThemeFromMaster(isCommit === true);
    mgraphics.redraw();
}

function recallThemeSnapshot(snap) {
    if (!snap || !snap.data) return;
    applyRawThemeData(snap.data, true);
}

function morphRowPresets(rowIdx, norm, isFinal) {
    norm = clamp(norm, 0.0, 1.0);
    row_slider_norms[rowIdx] = norm;

    var startSlot = rowIdx * preset_cols;
    var virtualPos = norm * (preset_cols - 1);
    var colA = Math.floor(virtualPos);
    var colB = Math.min(preset_cols - 1, colA + 1);
    var frac = virtualPos - colA;

    var slotA = presets_cache[startSlot + colA];
    var slotB = presets_cache[startSlot + colB];

    var hasA = (slotA && slotA.is_set && slotA.data);
    var hasB = (slotB && slotB.is_set && slotB.data);

    if (hasA && hasB) {
        var A = slotA.data, B = slotB.data;
        var blended = {
            bg_color: lerpColor(A.bg_color, B.bg_color, frac),
            border_color: lerpColor(A.border_color, B.border_color, frac),
            text_color: lerpColor(A.text_color, B.text_color, frac),
            highlight_color: lerpColor(A.highlight_color, B.highlight_color, frac),
            border_radius: lerp(A.border_radius, B.border_radius, frac),
            border_thickness: lerp(A.border_thickness, B.border_thickness, frac),
            border_extension: lerp(A.border_extension, B.border_extension, frac),

            panel_glass_inner: lerpColor(A.panel_glass_inner, B.panel_glass_inner, frac),
            panel_glass_outer: lerpColor(A.panel_glass_outer, B.panel_glass_outer, frac),
            panel_border_color: lerpColor(A.panel_border_color, B.panel_border_color, frac),
            panel_border_radius: lerp(A.panel_border_radius, B.panel_border_radius, frac),
            panel_border_size: lerp(A.panel_border_size, B.panel_border_size, frac),
            panel_glass_spread: lerp(A.panel_glass_spread, B.panel_glass_spread, frac),

            popup_dot_color: lerpColor(A.popup_dot_color, B.popup_dot_color, frac),
            slider_rail_color: lerpColor(A.slider_rail_color, B.slider_rail_color, frac),
            slider_handle_color: lerpColor(A.slider_handle_color, B.slider_handle_color, frac),
            decimal_color: lerpColor(A.decimal_color, B.decimal_color, frac),
            mode_color: lerpColor(A.mode_color, B.mode_color, frac),
            slider_rail_breadth: lerp(A.slider_rail_breadth, B.slider_rail_breadth, frac),

            pop_bgcolor: lerpColor(A.pop_bgcolor || [0.12, 0.12, 0.15, 1], B.pop_bgcolor || [0.12, 0.12, 0.15, 1], frac),
            attr_bg_color: lerpColor(A.attr_bg_color || [0.22, 0.22, 0.22, 1], B.attr_bg_color || [0.22, 0.22, 0.22, 1], frac),
            attr_border_color: lerpColor(A.attr_border_color || [0.28, 0.28, 0.32, 1], B.attr_border_color || [0.28, 0.28, 0.32, 1], frac),
            attr_slider_color: lerpColor(A.attr_slider_color || [0.5, 0.5, 0.5, 1], B.attr_slider_color || [0.5, 0.5, 0.5, 1], frac),
            attr_text_color: lerpColor(A.attr_text_color || [1, 1, 1, 1], B.attr_text_color || [1, 1, 1, 1], frac)
        };
        applyRawThemeData(blended, isFinal);
    } else if (hasA) {
        applyRawThemeData(slotA.data, isFinal);
    } else if (hasB) {
        applyRawThemeData(slotB.data, isFinal);
    }
}

// =============================================================
// 5. PRESET MODAL & MATRIX
// =============================================================
function get_row_total_height() {
    return 42 + 4 + 14;
}

function calculate_preset_window_size() {
    var margin = 10, cellW = 72, gap = 6, headerH = 38;
    var rowBlockH = get_row_total_height();
    var rowSpacing = 10;
    var w = margin * 2 + preset_cols * cellW + (preset_cols - 1) * gap;
    var h = headerH + preset_rows * rowBlockH + (preset_rows - 1) * rowSpacing + margin;
    var minH = (preset_rows === 1) ? 108 : 155;

    // Expand window when Naming & Capture Dialog is active to prevent clipping
    if (is_naming_active) {
        var tInfo = get_tag_grid_info();
        var modalRequiredH = 110 + tInfo.rows * 24 + 20;
        h = Math.max(h, modalRequiredH);
        minH = Math.max(minH, modalRequiredH);
    }

    return [Math.max(420, w), Math.max(minH, h)];
}

function update_preset_window_dimensions() {
    var sz = calculate_preset_window_size();
    presetWindow.size = sz;
    if (presetMatrix) presetMatrix.freepeer();
    presetMatrix = new JitterMatrix(4, "char", sz[0], sz[1]);
}

function start_naming(slotIdx) {
    is_naming_active = true;
    naming_target_slot = slotIdx;
    var existing = presets_cache[slotIdx];
    naming_buffer = (existing && existing.is_set) ? existing.name : ("Preset " + (slotIdx + 1));
    presetWindow.floating = 0;
    update_preset_window_dimensions();
    presetWindow.front();
    draw_preset_matrix_popup();
}

function draw_preset_matrix_popup() {
    var sz = calculate_preset_window_size();
    var winW = sz[0], winH = sz[1];

    if (!presetMatrix || presetMatrix.dim[0] !== winW || presetMatrix.dim[1] !== winH) {
        if (presetMatrix) presetMatrix.freepeer();
        presetMatrix = new JitterMatrix(4, "char", winW, winH);
    }

    var ctx = new MGraphics(winW, winH);
    ctx.set_source_rgba(0.10, 0.10, 0.12, 0.98);
    ctx.rectangle(0, 0, winW, winH); ctx.fill();

    // Close Button
    ctx.set_source_rgba(0.85, 0.20, 0.20, 1.0);
    ctx.arc(14, 15, 5.5, 0, Math.PI * 2); ctx.fill();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(10);
    ctx.set_source_rgba(0.9, 0.92, 0.96, 1.0);
    ctx.move_to(28, 18);
    ctx.show_text("PRESET MATRIX (" + (preset_cols * preset_rows) + " SLOTS)");

    var modeW = 105, modeH = 20;
    var modeX = winW - modeW - 120, modeY = 6;
    var isArm = (preset_mode === 1);

    ctx.set_source_rgba(isArm ? [0.90, 0.20, 0.20, 1.0] : [0.18, 0.22, 0.28, 1.0]);
    ctx.rectangle_rounded(modeX, modeY, modeW, modeH, 4, 4); ctx.fill();
    ctx.set_source_rgba(isArm ? [1, 1, 1, 1] : [0.4, 0.45, 0.5, 1.0]);
    ctx.set_line_width(1.0);
    ctx.rectangle_rounded(modeX, modeY, modeW, modeH, 4, 4); ctx.stroke();
    ctx.set_font_size(9);
    ctx.set_source_rgba(isArm ? [1, 1, 1, 1] : [0.85, 0.88, 0.92, 1.0]);
    var modeText = isArm ? "ARM / STORE" : "MODE: RECALL";
    var mTm = ctx.text_measure(modeText);
    ctx.move_to(modeX + (modeW - mTm[0]) * 0.5, modeY + 14);
    ctx.show_text(modeText);

    var rowBtnW = 50, rowBtnH = 20;
    var btnMinusX = winW - rowBtnW * 2 - 14, btnPlusX = winW - rowBtnW - 8, btnY = 6;

    ctx.set_source_rgba(0.18, 0.20, 0.24, 1.0);
    ctx.rectangle_rounded(btnMinusX, btnY, rowBtnW, rowBtnH, 3, 3); ctx.fill();
    ctx.set_source_rgba(0.35, 0.38, 0.45, 1.0); ctx.set_line_width(0.8);
    ctx.rectangle_rounded(btnMinusX, btnY, rowBtnW, rowBtnH, 3, 3); ctx.stroke();
    ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
    ctx.move_to(btnMinusX + 9, btnY + 14); ctx.show_text("- Row");

    ctx.set_source_rgba(0.18, 0.20, 0.24, 1.0);
    ctx.rectangle_rounded(btnPlusX, btnY, rowBtnW, rowBtnH, 3, 3); ctx.fill();
    ctx.set_source_rgba(0.35, 0.38, 0.45, 1.0); ctx.set_line_width(0.8);
    ctx.rectangle_rounded(btnPlusX, btnY, rowBtnW, rowBtnH, 3, 3); ctx.stroke();
    ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
    ctx.move_to(btnPlusX + 9, btnY + 14); ctx.show_text("+ Row");

    ctx.set_source_rgba(0.25, 0.25, 0.30, 0.6); ctx.set_line_width(0.75);
    ctx.move_to(8, 32); ctx.line_to(winW - 8, 32); ctx.stroke();

    var margin = 10, gap = 6, startY = 38;
    var totalW = winW - margin * 2;
    var cellW = (totalW - (preset_cols - 1) * gap) / preset_cols;
    var cellH = 42;
    var rowBlockH = get_row_total_height();
    var rowSpacing = 10;

    loadPresetsFromDict();

    for (var r = 0; r < preset_rows; r++) {
        var rowBaseY = startY + r * (rowBlockH + rowSpacing);

        for (var c = 0; c < preset_cols; c++) {
            var idx = r * preset_cols + c;
            var cellX = margin + c * (cellW + gap);
            var cellY = rowBaseY;

            var slotData = presets_cache[idx] || { name: "[EMPTY]", is_set: false };
            var isSlotActive = (active_preset_idx === idx);

            ctx.set_source_rgba(slotData.is_set ? (isSlotActive ? [0.22, 0.25, 0.32, 1.0] : [0.15, 0.16, 0.19, 1.0]) : [0.12, 0.12, 0.14, 0.7]);
            ctx.rectangle_rounded(cellX, cellY, cellW, cellH, 4, 4); ctx.fill();

            if (isArm) {
                ctx.set_source_rgba(0.85, 0.25, 0.25, 0.8); ctx.set_line_width(1.0);
            } else if (isSlotActive) {
                ctx.set_source_rgba(highlight_color); ctx.set_line_width(1.5);
            } else {
                ctx.set_source_rgba(slotData.is_set ? [0.35, 0.38, 0.44, 0.7] : [0.22, 0.22, 0.26, 0.5]); ctx.set_line_width(0.8);
            }
            ctx.rectangle_rounded(cellX, cellY, cellW, cellH, 4, 4); ctx.stroke();

            ctx.select_font_face("Arial", "normal", "bold"); ctx.set_font_size(8);
            ctx.set_source_rgba(slotData.is_set ? [0.65, 0.70, 0.78, 1.0] : [0.4, 0.42, 0.46, 0.8]);
            ctx.move_to(cellX + 5, cellY + 12);
            ctx.show_text((idx + 1 < 10 ? "0" : "") + (idx + 1));

            ctx.set_font_size(9);
            ctx.set_source_rgba(slotData.is_set ? text_color : [0.45, 0.48, 0.52, 0.8]);
            var lbl = slotData.name;
            while (lbl.length > 0 && ctx.text_measure(lbl)[0] > cellW - 8) lbl = lbl.slice(0, -1);
            var lblTm = ctx.text_measure(lbl);
            ctx.move_to(cellX + (cellW - lblTm[0]) * 0.5, cellY + 27);
            ctx.show_text(lbl);
        }

        var sliderY = rowBaseY + cellH + 4;
        var sliderH = 12;
        ctx.set_source_rgba(0.14, 0.15, 0.18, 1.0);
        ctx.rectangle_rounded(margin, sliderY, totalW, sliderH, 2, 2); ctx.fill();

        ctx.set_source_rgba(0.35, 0.38, 0.44, 0.7);
        ctx.set_line_width(2.0);
        for (var tc = 0; tc < preset_cols; tc++) {
            var tickX = margin + tc * (cellW + gap) + cellW * 0.5;
            ctx.move_to(tickX, sliderY); ctx.line_to(tickX, sliderY + sliderH); ctx.stroke();
        }

        var curNorm = row_slider_norms[r] || 0.0;
        var hX = margin + curNorm * (totalW - 16);
        ctx.set_source_rgba(highlight_color);
        ctx.rectangle_rounded(hX, sliderY + 1, 16, sliderH - 2, 2, 2); ctx.fill();
        ctx.set_source_rgba(1, 1, 1, 0.9); ctx.set_line_width(0.8);
        ctx.rectangle_rounded(hX, sliderY + 1, 16, sliderH - 2, 2, 2); ctx.stroke();
    }

    // Modern Studio Naming & Capture Dialog
    if (is_naming_active) {
        ctx.set_source_rgba(0.04, 0.04, 0.06, 0.95);
        ctx.rectangle(0, 0, winW, winH); ctx.fill();

        var tInfo = get_tag_grid_info();
        var cardW = Math.min(390, winW - 24);
        var cardH = 110 + tInfo.rows * 24;
        var cardX = (winW - cardW) * 0.5;
        var cardY = (winH - cardH) * 0.5;

        // Dialog Body
        ctx.set_source_rgba(0.13, 0.14, 0.17, 1.0);
        ctx.rectangle_rounded(cardX, cardY, cardW, cardH, 6, 6); ctx.fill();

        ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
        ctx.set_line_width(1.0);
        ctx.rectangle_rounded(cardX, cardY, cardW, cardH, 6, 6); ctx.stroke();

        // Title Header
        ctx.select_font_face("Arial", "normal", "bold");
        ctx.set_font_size(9.5);
        ctx.set_source_rgba(0.85, 0.88, 0.94, 1.0);
        ctx.move_to(cardX + 14, cardY + 20);
        ctx.show_text("NAME PRESET FOR SLOT " + (naming_target_slot + 1) + ":");

        // Input Box
        var inputX = cardX + 14, inputY = cardY + 28, inputW = cardW - 78, inputH = 26;
        ctx.set_source_rgba(0.07, 0.07, 0.09, 1.0);
        ctx.rectangle_rounded(inputX, inputY, inputW, inputH, 4, 4); ctx.fill();

        ctx.set_source_rgba(0.35, 0.38, 0.44, 0.9);
        ctx.set_line_width(1.0);
        ctx.rectangle_rounded(inputX, inputY, inputW, inputH, 4, 4); ctx.stroke();

        ctx.select_font_face("Arial", "normal", "bold");
        ctx.set_font_size(11);
        ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
        ctx.move_to(inputX + 10, inputY + 17);
        ctx.show_text((naming_buffer || "") + "_");

        // Clear Pill Button
        var clrX = inputX + inputW + 6, clrW = 44, clrH = 26;
        ctx.set_source_rgba(0.24, 0.20, 0.20, 1.0);
        ctx.rectangle_rounded(clrX, inputY, clrW, clrH, 4, 4); ctx.fill();
        ctx.set_source_rgba(0.40, 0.28, 0.28, 1.0);
        ctx.set_line_width(0.75);
        ctx.rectangle_rounded(clrX, inputY, clrW, clrH, 4, 4); ctx.stroke();

        ctx.select_font_face("Arial", "normal", "bold");
        ctx.set_font_size(8.5);
        ctx.set_source_rgba(0.9, 0.6, 0.6, 1.0);
        ctx.move_to(clrX + 8, inputY + 16.5);
        ctx.show_text("CLEAR");

        // Quick-Tags Grid
        var tagAreaY = cardY + 62;
        var tagColW = (cardW - 28 - (tInfo.cols - 1) * 6) / tInfo.cols;
        var tagH = 19;

        for (var tr = 0; tr < tInfo.rows; tr++) {
            var currY = tagAreaY + tr * 24;
            for (var tc = 0; tc < tInfo.cols; tc++) {
                var tagIdx = tr * tInfo.cols + tc;
                var currX = cardX + 14 + tc * (tagColW + 6);
                var isSlotFilled = (tagIdx < tInfo.tags.length);
                var tagLabel = isSlotFilled ? tInfo.tags[tagIdx] : "<blank>";

                ctx.set_source_rgba(isSlotFilled ? [0.18, 0.20, 0.25, 1.0] : [0.12, 0.12, 0.14, 0.4]);
                ctx.rectangle_rounded(currX, currY, tagColW, tagH, 3, 3); ctx.fill();

                ctx.set_source_rgba(0.28, 0.30, 0.36, 0.8);
                ctx.set_line_width(0.75);
                ctx.rectangle_rounded(currX, currY, tagColW, tagH, 3, 3); ctx.stroke();

                ctx.select_font_face("Arial", "normal", "bold");
                ctx.set_font_size(8.5);
                ctx.set_source_rgba(isSlotFilled ? [0.88, 0.90, 0.96, 1.0] : [0.35, 0.35, 0.40, 0.6]);
                var tTm = ctx.text_measure(tagLabel);
                ctx.move_to(currX + (tagColW - tTm[0]) * 0.5, currY + 13.5);
                ctx.show_text(tagLabel);
            }
        }

        // Action Buttons (Cancel / Save & Capture)
        var btnY = tagAreaY + tInfo.rows * 24 + 6;
        var btnH = 26, btnW = 120;
        var btnCancelX = cardX + 14, btnSaveX = cardX + cardW - btnW - 14;

        // Cancel Button
        ctx.set_source_rgba(0.20, 0.21, 0.25, 1.0);
        ctx.rectangle_rounded(btnCancelX, btnY, btnW, btnH, 4, 4); ctx.fill();
        ctx.set_source_rgba(0.35, 0.36, 0.42, 1.0);
        ctx.set_line_width(0.75);
        ctx.rectangle_rounded(btnCancelX, btnY, btnW, btnH, 4, 4); ctx.stroke();

        ctx.select_font_face("Arial", "normal", "bold");
        ctx.set_font_size(9);
        ctx.set_source_rgba(0.85, 0.85, 0.90, 1.0);
        var canTm = ctx.text_measure("CANCEL");
        ctx.move_to(btnCancelX + (btnW - canTm[0]) * 0.5, btnY + 17);
        ctx.show_text("CANCEL");

        // Save & Capture Button
        ctx.set_source_rgba(highlight_color);
        ctx.rectangle_rounded(btnSaveX, btnY, btnW, btnH, 4, 4); ctx.fill();

        ctx.set_source_rgba(1.0, 1.0, 1.0, 0.6);
        ctx.set_line_width(0.75);
        ctx.rectangle_rounded(btnSaveX, btnY, btnW, btnH, 4, 4); ctx.stroke();

        ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
        var savTm = ctx.text_measure("SAVE & CAPTURE");
        ctx.move_to(btnSaveX + (btnW - savTm[0]) * 0.5, btnY + 17);
        ctx.show_text("SAVE & CAPTURE");
    }

    var img = new Image(ctx);
    img.tonamedmatrix(presetMatrix.name);
    presetWindow.jit_matrix(presetMatrix.name);
}

function commit_preset_save() {
    if (naming_target_slot < 0) return;
    var finalName = (naming_buffer || "").trim();
    if (finalName.length === 0) finalName = "Preset " + (naming_target_slot + 1);

    var snapshot = captureThemeSnapshot(finalName);
    presetDict.set("slot_" + naming_target_slot, JSON.stringify(snapshot));

    var pPath = getPresetFilePath();
    try {
        presetDict.export_json(pPath);
    } catch (e) {}

    active_preset_idx = naming_target_slot;
    is_naming_active = false;
    preset_mode = 0;
    naming_target_slot = -1;
    naming_buffer = "";
    presetWindow.floating = 1;

    update_preset_window_dimensions();
    loadPresetsFromDict();
    draw_preset_matrix_popup();
}

function abort_preset_save() {
    is_naming_active = false;
    naming_target_slot = -1;
    naming_buffer = "";
    presetWindow.floating = 1;
    update_preset_window_dimensions();
    draw_preset_matrix_popup();
}

function handleNamingKey(charcode) {
    if (!is_naming_active) return;
    if (charcode === 8 || charcode === 127) {
        if (naming_buffer.length > 0) naming_buffer = naming_buffer.slice(0, -1);
        draw_preset_matrix_popup();
        return;
    }
    if (charcode === 13 || charcode === 10) { commit_preset_save(); return; }
    if (charcode === 27) { abort_preset_save(); return; }
    if (charcode >= 32 && charcode <= 126) {
        if (naming_buffer.length < 18) {
            naming_buffer += String.fromCharCode(charcode);
            draw_preset_matrix_popup();
        }
    }
}

function presetWindowListenerCallback(event) {
    if (event.eventname === "close") {
        presetWindow.visible = 0; is_naming_active = false; presetWindow.floating = 1; return;
    }
    if (event.eventname === "key") {
        handleNamingKey(event.args[0]); return;
    }
    if (event.eventname === "mouse") {
        var a = arrayfromargs(event.args), mx = a[0], my = a[1], mbut = a[2];
        var sz = calculate_preset_window_size(), winW = sz[0], winH = sz[1];

        if (mbut === 0) {
            if (active_row_slider !== -1) {
                var finishedRow = active_row_slider;
                active_row_slider = -1;
                morphRowPresets(finishedRow, row_slider_norms[finishedRow], true);
                draw_preset_matrix_popup();
            }
            return;
        }

        if (active_row_slider !== -1 && mbut === 1) {
            var margin = 10;
            var totalW = winW - margin * 2;
            var sNorm = clamp((mx - margin) / totalW, 0.0, 1.0);
            morphRowPresets(active_row_slider, sNorm, false);
            draw_preset_matrix_popup();
            return;
        }

        if (mbut === 1 && mx < 24 && my < 24) {
            presetWindow.visible = 0; is_naming_active = false; presetWindow.floating = 1; return;
        }

        if (is_naming_active) {
            if (mbut !== 1) return;
            var tInfo = get_tag_grid_info();
            var cardW = Math.min(390, winW - 24);
            var cardH = 110 + tInfo.rows * 24;
            var cardX = (winW - cardW) * 0.5, cardY = (winH - cardH) * 0.5;
            var inputX = cardX + 14, inputW = cardW - 78, inputY = cardY + 28, inputH = 26;

            // Clear Button Click
            var clrX = inputX + inputW + 6, clrW = 44, clrH = 26;
            if (mx >= clrX && mx <= clrX + clrW && my >= inputY && my <= inputY + clrH) {
                naming_buffer = ""; draw_preset_matrix_popup(); return;
            }

            // Quick-Tags Click
            var tagAreaY = cardY + 62;
            var tagColW = (cardW - 28 - (tInfo.cols - 1) * 6) / tInfo.cols;
            var tagH = 19;
            for (var tr = 0; tr < tInfo.rows; tr++) {
                var currY = tagAreaY + tr * 24;
                if (my >= currY && my <= currY + tagH) {
                    for (var tc = 0; tc < tInfo.cols; tc++) {
                        var currX = cardX + 14 + tc * (tagColW + 6);
                        if (mx >= currX && mx <= currX + tagColW) {
                            var tagIdx = tr * tInfo.cols + tc;
                            if (tagIdx < tInfo.tags.length) {
                                naming_buffer = tInfo.tags[tagIdx];
                                draw_preset_matrix_popup();
                            }
                            return;
                        }
                    }
                }
            }

            // Action Buttons Click
            var btnY = tagAreaY + tInfo.rows * 24 + 6;
            var btnH = 26, btnW = 120;
            var btnCancelX = cardX + 14, btnSaveX = cardX + cardW - btnW - 14;

            if (mx >= btnSaveX && mx <= btnSaveX + btnW && my >= btnY && my <= btnY + btnH) {
                commit_preset_save(); return;
            }
            if (mx >= btnCancelX && mx <= btnCancelX + btnW && my >= btnY && my <= btnY + btnH) {
                abort_preset_save(); return;
            }
            return;
        }

        var modeW = 105, modeH = 20;
        var modeX = winW - modeW - 120, modeY = 6;
        if (mbut === 1 && mx >= modeX && mx <= modeX + modeW && my >= modeY && my <= modeY + modeH) {
            preset_mode = (preset_mode === 0) ? 1 : 0;
            draw_preset_matrix_popup();
            return;
        }

        var rowBtnW = 50, rowBtnH = 20;
        var btnMinusX = winW - rowBtnW * 2 - 14, btnPlusX = winW - rowBtnW - 8, btnY = 6;
        if (mbut === 1 && mx >= btnMinusX && mx <= btnMinusX + rowBtnW && my >= btnY && my <= btnY + rowBtnH) {
            subtract_preset_row(); return;
        }
        if (mbut === 1 && mx >= btnPlusX && mx <= btnPlusX + rowBtnW && my >= btnY && my <= btnY + rowBtnH) {
            add_preset_row(); return;
        }

        var margin = 10, gap = 6, startY = 38;
        var totalW = winW - margin * 2;
        var cellW = (totalW - (preset_cols - 1) * gap) / preset_cols;
        var cellH = 42;
        var rowBlockH = get_row_total_height();
        var rowSpacing = 10;

        for (var r = 0; r < preset_rows; r++) {
            var rowBaseY = startY + r * (rowBlockH + rowSpacing);
            var sliderY = rowBaseY + cellH + 4;
            var sliderH = 12;

            if (mbut === 1 && mx >= margin && mx <= margin + totalW && my >= sliderY - 4 && my <= sliderY + sliderH + 4) {
                active_row_slider = r;
                var sNorm = clamp((mx - margin) / totalW, 0.0, 1.0);
                morphRowPresets(r, sNorm, false);
                draw_preset_matrix_popup();
                return;
            }

            if (mbut === 1) {
                for (var c = 0; c < preset_cols; c++) {
                    var idx = r * preset_cols + c;
                    var cellX = margin + c * (cellW + gap);
                    if (mx >= cellX && mx <= cellX + cellW && my >= rowBaseY && my <= rowBaseY + cellH) {
                        if (preset_mode === 1) {
                            start_naming(idx);
                        } else {
                            var snap = presets_cache[idx];
                            if (snap && snap.is_set) {
                                active_preset_idx = idx;
                                recallThemeSnapshot(snap);
                                draw_preset_matrix_popup();
                            }
                        }
                        return;
                    }
                }
            }
        }
    }
}
presetListener = new JitterListener(presetWindow.name, presetWindowListenerCallback);

function openPresetWindow() {
    update_preset_window_dimensions();
    presetWindow.title = "Presets Grid (" + preset_cols + "x" + preset_rows + ")";

    if (this.box) {
        var is_pres = (this.patcher && this.patcher.getattr("presentation") == 1);
        var originX = 100, originY = 100;
        if (is_pres) {
            var pr = this.box.getattr("presentation_rect");
            if (pr && pr.length >= 2) { originX = pr[0]; originY = pr[1]; }
        } else if (this.box.rect) {
            originX = this.box.rect[0]; originY = this.box.rect[1];
        }
        presetWindow.pos = [originX + 195, originY];
    }
    presetWindow.floating = 1;
    presetWindow.visible = 1;
    presetWindow.front();
    draw_preset_matrix_popup();
}

function closePresetWindow() {
    presetWindow.visible = 0;
    is_naming_active = false;
    presetWindow.floating = 1;
}

function presets(v) {
    if (v === undefined) {
        if (presetWindow.visible) closePresetWindow();
        else openPresetWindow();
    } else {
        if (Number(v) > 0) openPresetWindow();
        else closePresetWindow();
    }
}

function add_preset_row() {
    if (preset_rows < 6) {
        preset_rows++;
        update_preset_window_dimensions();
        draw_preset_matrix_popup();
    }
}

function subtract_preset_row() {
    if (preset_rows > 1) {
        preset_rows--;
        update_preset_window_dimensions();
        draw_preset_matrix_popup();
    }
}

// =============================================================
// 6. MAX ATTRIBUTES & INSPECTOR DECLARATIONS
// =============================================================
declareattribute("active_page", "get_active_page", "set_active_page", 1, {
    type: "int", style: "enumindex", enumvals: ["Objects", "Panels", "Special", "Popups"], label: "Active Page", category: "Theme Master"
});
function get_active_page() { return active_page; }
function set_active_page(v) { active_page = Math.max(0, Math.min(3, Number(v))); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("glide", "get_glide", "set_glide", 1, {
    type: "int", style: "onoff", label: "Touch Glide Easing", category: "Theme Master"
});
function get_glide() { return glide_enabled; }
function set_glide(v) { glide_enabled = v ? 1 : 0; }

declareattribute("preset_cols", "get_preset_cols", "set_preset_cols", 1, {
    type: "int", label: "Preset Columns", category: "Preset Grid"
});
function get_preset_cols() { return preset_cols; }
function set_preset_cols(v) {
    preset_cols = Math.max(2, Math.min(8, parseInt(v, 10)));
    update_preset_window_dimensions();
    if (presetWindow.visible) draw_preset_matrix_popup();
}

declareattribute("preset_rows", "get_preset_rows", "set_preset_rows", 1, {
    type: "int", label: "Preset Rows", category: "Preset Grid"
});
function get_preset_rows() { return preset_rows; }
function set_preset_rows(v) {
    preset_rows = Math.max(1, Math.min(6, parseInt(v, 10)));
    update_preset_window_dimensions();
    if (presetWindow.visible) draw_preset_matrix_popup();
}

declareattribute("quick_tags", "get_quick_tags", "set_quick_tags", 1, {
    type: "symbol", label: "Quick-Tag Names (Space-separated)", category: "Preset Grid"
});
function get_quick_tags() { return raw_quick_tags; }
function set_quick_tags() {
    var a = arrayfromargs(arguments);
    raw_quick_tags = a.join(" ").trim();
    if (presetWindow.visible && is_naming_active) draw_preset_matrix_popup();
}

declareattribute("border_radius", "get_border_radius", "set_border_radius", 1, { type: "float", label: "Border Radius", category: "Sizes" });
function get_border_radius() { return border_radius; }
function set_border_radius(v) { border_radius = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("border_thickness", "get_border_thickness", "set_border_thickness", 1, { type: "float", label: "Border Thickness", category: "Sizes" });
function get_border_thickness() { return border_thickness; }
function set_border_thickness(v) { border_thickness = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("border_extension", "get_border_extension", "set_border_extension", 1, { type: "float", label: "Border Extension", category: "Sizes" });
function get_border_extension() { return border_extension; }
function set_border_extension(v) { border_extension = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("panel_border_radius", "get_panel_border_radius", "set_panel_border_radius", 1, { type: "float", label: "Panel Border Radius", category: "Sizes" });
function get_panel_border_radius() { return panel_border_radius; }
function set_panel_border_radius(v) { panel_border_radius = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("panel_border_size", "get_panel_border_size", "set_panel_border_size", 1, { type: "float", label: "Panel Border Size", category: "Sizes" });
function get_panel_border_size() { return panel_border_size; }
function set_panel_border_size(v) { panel_border_size = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("panel_glass_spread", "get_panel_glass_spread", "set_panel_glass_spread", 1, { type: "float", label: "Glass Spread", category: "Sizes" });
function get_panel_glass_spread() { return panel_glass_spread; }
function set_panel_glass_spread(v) { panel_glass_spread = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

declareattribute("slider_rail_breadth", "get_slider_rail_breadth", "set_slider_rail_breadth", 1, { type: "float", label: "Slider Rail Breadth", category: "Sizes" });
function get_slider_rail_breadth() { return slider_rail_breadth; }
function set_slider_rail_breadth(v) { slider_rail_breadth = parseFloat(v); syncThemeFromMaster(true); mgraphics.redraw(); }

function bang() { syncThemeFromMaster(true); }

// =============================================================
// 7. RESPONSIVE LAYOUT ENGINE & CANVAS PAINT
// =============================================================
function getInlineLayout(w, h, numRows) {
    var marginX = 4.0, marginY = 4.0, tabH = 22.0, tabY = marginY;
    var contentTop = tabY + tabH + 6.0;
    var totalAvailH = Math.max(24.0, h - contentTop - marginY);
    var rowH = totalAvailH / numRows;
    var fontSize = 9.0, wireH = Math.max(2.2, Math.min(4.5, rowH * 0.18));
    var labelColW = Math.max(62.0, Math.ceil(fontSize * 8.0) + 4.0);
    var trackX = marginX + labelColW + 4.0;
    var trackW = Math.max(20.0, w - marginX - 2.0 - trackX);

    var preW = 48.0;
    var preX = w - marginX - preW;
    var tabW = Math.max(60.0, preX - marginX - 6.0);

    return {
        marginX: marginX, marginY: marginY, tabY: tabY, tabW: tabW, tabH: tabH,
        preX: preX, preW: preW, preH: tabH,
        contentTop: contentTop, labelX: marginX + 1.0, trackX: trackX, trackW: trackW, wireH: wireH,
        fontSize: fontSize, rowH: rowH,
        getRowCenterY: function(i) { return contentTop + (i + 0.5) * rowH; }
    };
}

function setSliderNorm(page, idx, norm) {
    norm = clamp(norm, 0.0, 1.0);
    if (page === 0) {
        if (idx === 0) border_radius = norm * 25.0;
        else if (idx === 1) border_thickness = 0.5 + norm * 5.5;
        else if (idx === 2) border_extension = norm * 40.0;
    } else if (page === 1) {
        if (idx === 0) panel_border_radius = norm * 50.0;
        else if (idx === 1) panel_border_size = norm * 5.0;
        else if (idx === 2) panel_glass_spread = 5.0 + norm * 495.0;
    } else if (page === 2) {
        if (idx === 0) slider_rail_breadth = 0.5 + norm * 24.5;
    }
}

function paint() {
    var dims = get_dimensions();
    var w = dims.w, h = dims.h;
    if (!w || !h || w < 20 || h < 20) return;

    var rowDefs = [];
    if (active_page === 0) {
        rowDefs = [
            { label: "Body Color",    isColor: true,  color: bg_color },
            { label: "Border Color",  isColor: true,  color: border_color },
            { label: "Text Color",    isColor: true,  color: text_color },
            { label: "Highlight Col", isColor: true,  color: highlight_color },
            { label: "Border Rad",    isColor: false, sliderIdx: 0, norm: border_radius / 25.0 },
            { label: "Border Thk",    isColor: false, sliderIdx: 1, norm: (border_thickness - 0.5) / 5.5 },
            { label: "Border Ext",    isColor: false, sliderIdx: 2, norm: border_extension / 40.0 }
        ];
    } else if (active_page === 1) {
        rowDefs = [
            { label: "Glass Inner",   isColor: true,  color: panel_glass_inner },
            { label: "Glass Outer",   isColor: true,  color: panel_glass_outer },
            { label: "Border Color",  isColor: true,  color: panel_border_color },
            { label: "Border Rad",    isColor: false, sliderIdx: 0, norm: panel_border_radius / 50.0 },
            { label: "Border Size",   isColor: false, sliderIdx: 1, norm: panel_border_size / 5.0 },
            { label: "Spread",        isColor: false, sliderIdx: 2, norm: (panel_glass_spread - 5.0) / 495.0 }
        ];
    } else if (active_page === 2) {
        rowDefs = [
            { label: "Popup Dot",     isColor: true,  color: popup_dot_color },
            { label: "Rail Color",    isColor: true,  color: slider_rail_color },
            { label: "Knob / Line",   isColor: true,  color: slider_handle_color },
            { label: "Decimal Col",   isColor: true,  color: decimal_color },
            { label: "Mode Color",    isColor: true,  color: mode_color },
            { label: "Rail Breadth",  isColor: false, sliderIdx: 0, norm: clamp((slider_rail_breadth - 0.5) / 24.5, 0.0, 1.0) }
        ];
    } else if (active_page === 3) {
        rowDefs = [
            { label: "Popup BG",      isColor: true,  color: pop_bgcolor },
            { label: "Attr BG",       isColor: true,  color: attr_bg_color },
            { label: "Attr Border",   isColor: true,  color: attr_border_color },
            { label: "Attr Slider",   isColor: true,  color: attr_slider_color },
            { label: "Attr Text",     isColor: true,  color: attr_text_color }
        ];
    }

    var layout = getInlineLayout(w, h, rowDefs.length);

    // Category Menu Capsule
    mgraphics.set_source_rgba(bg_color);
    mgraphics.rectangle_rounded(layout.marginX, layout.tabY, layout.tabW, layout.tabH, 3, 3);
    mgraphics.fill();

    mgraphics.set_source_rgba(border_color);
    mgraphics.set_line_width(border_thickness);
    mgraphics.rectangle_rounded(layout.marginX, layout.tabY, layout.tabW, layout.tabH, 3, 3);
    mgraphics.stroke();

    // Touch Markers
    mgraphics.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.75);
    mgraphics.set_line_width(2.0);

    mgraphics.move_to(layout.marginX + 8, layout.tabY + 4);
    mgraphics.line_to(layout.marginX + 8, layout.tabY + layout.tabH - 4);

    mgraphics.move_to(layout.marginX + layout.tabW - 8, layout.tabY + 4);
    mgraphics.line_to(layout.marginX + layout.tabW - 8, layout.tabY + layout.tabH - 4);

    var midX = layout.marginX + layout.tabW * 0.5;
    mgraphics.move_to(midX, layout.tabY + 3);
    mgraphics.line_to(midX, layout.tabY + 6);
    mgraphics.move_to(midX, layout.tabY + layout.tabH - 6);
    mgraphics.line_to(midX, layout.tabY + layout.tabH - 3);
    mgraphics.stroke();

    // Category Label
    mgraphics.select_font_face("Arial", "normal", "bold");
    mgraphics.set_font_size(11.0);
    mgraphics.set_source_rgba(text_color);
    var cat = master_categories[active_page];
    var tm = mgraphics.text_measure(cat);
    mgraphics.move_to(layout.marginX + (layout.tabW - tm[0]) * 0.5, layout.tabY + 15);
    mgraphics.show_text(cat);

    // Standalone [Presets] Pill
    mgraphics.set_source_rgba(bg_color);
    mgraphics.rectangle_rounded(layout.preX, layout.tabY, layout.preW, layout.preH, 3, 3);
    mgraphics.fill();

    mgraphics.set_source_rgba(highlight_color);
    mgraphics.set_line_width(border_thickness);
    mgraphics.rectangle_rounded(layout.preX, layout.tabY, layout.preW, layout.preH, 3, 3);
    mgraphics.stroke();

    mgraphics.set_font_size(8.5);
    mgraphics.set_source_rgba(text_color);
    var pTm = mgraphics.text_measure("Presets");
    mgraphics.move_to(layout.preX + (layout.preW - pTm[0]) * 0.5, layout.tabY + 14.5);
    mgraphics.show_text("Presets");

    // Attribute Rows
    for (var i = 0; i < rowDefs.length; i++) {
        var rd = rowDefs[i];
        var cy = layout.getRowCenterY(i);

        mgraphics.set_font_size(layout.fontSize);
        mgraphics.set_source_rgba(text_color);
        mgraphics.move_to(layout.labelX, cy + 3.0);
        mgraphics.show_text(rd.label);

        if (rd.isColor) {
            var swH = Math.max(10, Math.min(18, layout.rowH * 0.65));
            mgraphics.set_source_rgba(rd.color);
            mgraphics.rectangle_rounded(layout.trackX, cy - swH * 0.5, layout.trackW, swH, 3, 3);
            mgraphics.fill();
            mgraphics.set_source_rgba(1, 1, 1, 0.45);
            mgraphics.set_line_width(0.75);
            mgraphics.rectangle_rounded(layout.trackX, cy - swH * 0.5, layout.trackW, swH, 3, 3);
            mgraphics.stroke();
        } else {
            var trackY = cy - layout.wireH * 0.5;
            mgraphics.set_source_rgba(0.2, 0.25, 0.3, 0.85);
            mgraphics.rectangle_rounded(layout.trackX, trackY, layout.trackW, layout.wireH, layout.wireH * 0.5, layout.wireH * 0.5);
            mgraphics.fill();

            var orbX = layout.trackX + rd.norm * layout.trackW;
            mgraphics.set_source_rgba(highlight_color);
            mgraphics.arc(orbX, cy, 4.5, 0, Math.PI * 2);
            mgraphics.fill();
        }
    }
}

// =============================================================
// 8. DIRECT-DRIVE INTERACTION ENGINE
// =============================================================
var activeContinuousSlider = -1;

function updateDirectSlider(x) {
    if (activeContinuousSlider === -1) return;
    var dims = get_dimensions();
    var numRows = (active_page === 0) ? 7 : (active_page === 1 ? 6 : (active_page === 2 ? 6 : 5));
    var layout = getInlineLayout(dims.w, dims.h, numRows);
    var targetNorm = clamp((x - layout.trackX) / layout.trackW, 0.0, 1.0);

    setSliderNorm(active_page, activeContinuousSlider, targetNorm);
    mgraphics.redraw();
    syncThemeFromMaster(false);
}

function onclick(x, y) {
    var dims = get_dimensions();
    var numRows = (active_page === 0) ? 7 : (active_page === 1 ? 6 : (active_page === 2 ? 6 : 5));
    var layout = getInlineLayout(dims.w, dims.h, numRows);

    if (y <= layout.contentTop - 3.0) {
        if (x >= layout.preX) {
            presets();
            return;
        }

        if (x >= layout.marginX && x <= layout.marginX + layout.tabW) {
            var midX = layout.marginX + layout.tabW * 0.5;
            var stepDir = (x > midX) ? 1 : -1;
            active_page = (active_page + stepDir + 4) % 4;
            themeDict.set("active_page", active_page);
            syncThemeFromMaster(true);
            mgraphics.redraw();
            return;
        }
        return;
    }

    var rowIdx = Math.floor((y - layout.contentTop) / layout.rowH);
    if (rowIdx < 0 || rowIdx >= numRows) return;

    if (active_page === 0) {
        if (rowIdx === 0) openColorPicker("bg_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 1) openColorPicker("border_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 2) openColorPicker("text_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 3) openColorPicker("highlight_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx >= 4) {
            activeContinuousSlider = rowIdx - 4;
            updateDirectSlider(x);
        }
    } else if (active_page === 1) {
        if (rowIdx === 0) openColorPicker("panel_glass_inner", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 1) openColorPicker("panel_glass_outer", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 2) openColorPicker("panel_border_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx >= 3) {
            activeContinuousSlider = rowIdx - 3;
            updateDirectSlider(x);
        }
    } else if (active_page === 2) {
        if (rowIdx === 0) openColorPicker("popup_dot_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 1) openColorPicker("slider_rail_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 2) openColorPicker("slider_handle_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 3) openColorPicker("decimal_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 4) openColorPicker("mode_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 5) {
            activeContinuousSlider = 0;
            updateDirectSlider(x);
        }
    } else if (active_page === 3) {
        if (rowIdx === 0) openColorPicker("pop_bgcolor", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 1) openColorPicker("attr_bg_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 2) openColorPicker("attr_border_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 3) openColorPicker("attr_slider_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
        else if (rowIdx === 4) openColorPicker("attr_text_color", layout.trackX + layout.trackW, layout.getRowCenterY(rowIdx));
    }
}

function ondrag(x, y, but) {
    if (but === 0) { onmouseup(); return; }
    if (activeContinuousSlider !== -1) {
        updateDirectSlider(x);
    }
}

function onmouseup() {
    if (activeContinuousSlider !== -1) {
        activeContinuousSlider = -1;
        syncThemeFromMaster(true);
        mgraphics.redraw();
    }
}

// =============================================================
// 9. INLET DISPATCHER & EMBEDDED PERSISTENCE
// =============================================================
function embed_preset(slotIdx, jsonStr) {
    if (slotIdx !== undefined && jsonStr) {
        presetDict.set("slot_" + slotIdx, jsonStr);
        loadPresetsFromDict();
        if (presetWindow.visible) draw_preset_matrix_popup();
    }
}

function anything() {
    var args = arrayfromargs(arguments);

    if (messagename === "embed_preset") {
        embed_preset(args[0], args.slice(1).join(" "));
        return;
    }
    if (messagename === "clear_bus") {
        bus.subscribers = {};
        post("touch_theme_bus: subscribers flushed.\n");
        return;
    }
    if (messagename === "presets" || messagename === "preset_popup") {
        presets.apply(this, args); return;
    }
    if (messagename === "add_row") {
        add_preset_row(); return;
    }
    if (messagename === "sub_row" || messagename === "subtract_row") {
        subtract_preset_row(); return;
    }
    if (messagename === "quick_tags") {
        set_quick_tags.apply(this, args); return;
    }
}

function save() {
    // Embed live master theme state so restarting Max doesn't revert to defaults
    embedmessage("set_active_page", active_page);
    embedmessage("set_border_radius", border_radius);
    embedmessage("set_border_thickness", border_thickness);
    embedmessage("set_border_extension", border_extension);
    embedmessage("set_panel_border_radius", panel_border_radius);
    embedmessage("set_panel_border_size", panel_border_size);
    embedmessage("set_panel_glass_spread", panel_glass_spread);
    embedmessage("set_slider_rail_breadth", slider_rail_breadth);

    

    var totalSlots = preset_cols * preset_rows;
    for (var i = 0; i < totalSlots; i++) {
        var key = "slot_" + i;
        if (presetDict.contains(key)) {
            var val = presetDict.get(key);
            embedmessage("embed_preset", i, typeof val === "string" ? val : JSON.stringify(val));
        }
    }

    try {
        presetDict.export_json(getPresetFilePath());
    } catch(e) {}
}

function notifydeleted() {
    try { colorListener.subjectname = ""; } catch (e) {}
    try { presetListener.subjectname = ""; } catch (e) {}

    try { colorWindow.visible = 0; } catch (e) {}
    try { presetWindow.visible = 0; } catch (e) {}

    // Explicitly release C++ window peers
    try { if (colorWindow) colorWindow.free(); } catch (e) {}
    try { if (presetWindow) presetWindow.free(); } catch (e) {}

    try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}
    try { if (presetMatrix) presetMatrix.freepeer(); } catch (e) {}

    colorWindow = null;
    presetWindow = null;
    colorMatrix = null;
    presetMatrix = null;
}

// Initial Boot Sequence
try {
    presetDict.import_json(getPresetFilePath());
} catch(e) {}

loadPresetsFromDict();
syncThemeFromMaster(true);