// ============================================================================
// touch.ummanu.js - Max 9 v8ui / jsui
// TOUCH MULTIMENU + ADSTATUS HARDWARE INGEST ENGINE
// (Default Touch Mode [v_mode=0], Inlet 0 Hardware Stream, Inlet 1 Folders)
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
    mgraphics.init();
}
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 2;
outlets = 3;
this.numinlets = 2;
this.numoutlets = 3;

setinletassist(0, "Inlet 0: Selection (Int) / adstatus stream (clear, append, set) / Attributes / Messages");
setinletassist(1, "Inlet 1: Dedicated Folder Ingest (append, set <idx> <file>, folder_menu, clear_folders)");
setoutletassist(0, "Outlet 0: Configured output (Prefix+Item [Default] / Raw / Item Name / Prefix+Index)");
setoutletassist(1, "Outlet 1: Local item index in active menu (0 to N-1)");
setoutletassist(2, "Outlet 2: Active menu / page index (to folder router)");

var uniqueID = Math.floor(Math.random() * 1000000);

var SETTINGS_WIN_X      = 100;
var SETTINGS_WIN_Y      = 100;

// ============================================================================
// DUAL-MODE x TOOLBAR 4-STATE OFFSET MATRIX (Calibrated Screen Offsets)
// ============================================================================
// 1. TOOLBARS ON - Patching Mode
var TB_PATCH_OFFSET_X     = 33;
var TB_PATCH_OFFSET_Y     = 10;

// 2. TOOLBARS ON - Presentation Mode
var TB_PRES_OFFSET_X      = 33;
var TB_PRES_OFFSET_Y      = 10;

// 3. NO TOOLBARS - Patching Mode
var NOTB_PATCH_OFFSET_X   = 0;
var NOTB_PATCH_OFFSET_Y   = -20;

// 4. NO TOOLBARS - Presentation Mode
var NOTB_PRES_OFFSET_X    = 0;
var NOTB_PRES_OFFSET_Y    = -20;

var v_mode              = 0;                  // 0 = Touch Mode (DEFAULT), 1 = Menu Dropdown
var multimenu           = 0;                  // 0 = Single Menu, 1 = MultiMenu Folder Browser
var touch_output_mode   = 0;                  // 0 = Instant Touch (DEFAULT), 1 = Staged Confirm
var output_type         = 0;                  // 0 = Prefix + Item (DEFAULT), 1 = Raw File, 2 = Item Name, 3 = Prefix + Index
var show_markers        = 1;                  // 1 = Show Left/Right divider markers
var is_staged_pending   = false;
var is_transmitting     = false;              // Loop guard for adstatus feedback loops

var active_menu_idx     = 0;                  // Active category page index
var pending_folder_menu = 0;                  // Tracks target folder page
var menus               = [];                 // [{ title: "", items: [{ display: "", raw: "" }], selected_idx: 0 }]

var v_show_arrow        = 1;
var v_allow_popup       = 1;
var v_fontsize          = 13;
var v_font_name         = "Arial";
var prefix_text         = "Mode, Instruments, Devices, Input, Video, Data";
var hold_speed          = 90.0;

// Prefix Label Formatting & Case Engine
var label_mode          = 0;                  // 0 = Full, 1 = No Vowels, 2 = Caps Only, 3 = First Letter, 4 = No Text
var label_mode_names    = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
var case_mode           = 0;                  // 0 = First Cap, 1 = All Cap, 2 = All Small
var case_mode_names     = ["First Cap", "All Cap", "All Small"];

// Geometry
var bordersize          = 1.5;
var corner_radius       = 12.0;
var border_extension    = 6.0;

// Colors
var bgcolor             = [0.14, 0.14, 0.16, 0.95];
var textcolor           = [0.95, 0.96, 0.98, 1.00];
var bordercolor         = [0.42, 0.42, 0.48, 0.90];
var highlight_color     = [1.00, 0.22, 0.25, 1.00];
var popup_dot_color     = [0.85, 0.85, 0.85, 0.70];
var pop_bgcolor         = [0.12, 0.12, 0.15, 1.00];
var mode_color          = [0.85, 0.85, 0.90, 1.00];

// Popup Attrui UI Colors (Complete 5-Color Theme Suite)
var attr_bg_color       = [0.22, 0.22, 0.22, 1.00];
var attr_border_color   = [0.28, 0.28, 0.32, 1.00];
var attr_slider_color   = [0.50, 0.50, 0.50, 1.00];
var attr_text_color     = [1.00, 1.00, 1.00, 1.00];

// Standard 5-Tier Popup Visibility Masks
var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

// Scalable Touch Window Size
var popup_mini_w        = 270;
var popup_mini_h        = 95;
var is_resizing_window  = 0;
var start_click_x       = 0;
var start_click_y       = 0;
var start_resize_w      = 270;
var start_resize_h      = 95;

// Default items list
var raw_modes_input     = "1 2 3 4 5 6";

// Dropdown Navigation & Timing
var dropdown_hover_row         = -1;
var DROPDOWN_HEADER_H          = 24;
var dropdown_open_time         = 0;
var last_close_time            = 0;
var dropdown_mouse_latched     = false;
var dropdown_opened_from_popup = false;
var dropdownWatchdog           = null;
var last_mouse_inside_time     = 0;
var has_entered_dropdown       = false;

// Touch Drag / Hold State
var dragStartX          = 0;
var dragStartY          = 0;
var hasDraggedActive    = false;
var is_holding          = 0;
var hold_gate_passed    = 0;
var holdTask            = null;
var click_time          = 0;
var last_step_time      = 0;

// Touch Drag / Hold State (Popup Preview)
var pop_is_holding      = 0;
var pop_hold_gate       = 0;
var popHoldTask         = null;
var pop_click_time      = 0;
var pop_last_step       = 0;

// Settings UI State
var showSettings        = 0;
var cached_prev_y       = 28;
var active_pop_slider   = -1;

// Debounce task for batching rapid file influx or adstatus appends
var streamRefreshTask = new Task(function() {
    syncModesWithActiveMenus();
    redraw_all();
    if (dropdownWindow && dropdownWindow.visible) {
        repositionAndResizeDropdown();
    }
    if (popupWindow && popupWindow.visible) {
        drawSettingsWindow();
    }
});

function redraw_all() {
    mgraphics.redraw();
    if (typeof notifyclients === "function") notifyclients();
}

// =============================================================
// ROBUST PATTR HOOKS FOR UMMANU (TOUCH & MENU MODES)
// =============================================================
function getvalueof() {
    // If MultiMenu is active, save [menu_page, item_index]; otherwise save item_index
    if (multimenu === 1) {
        return [active_menu_idx, get_selected()];
    }
    return get_selected();
}

function setvalueof() {
    if (is_transmitting) return;
    var args = arrayfromargs(arguments);
    while (args.length === 1 && Array.isArray(args[0])) {
        args = args[0];
    }
    if (args.length === 0) return;

    // Pattern 1: MultiMenu format [page_idx, item_idx]
    if (args.length >= 2 && typeof args[0] === "number" && typeof args[1] === "number") {
        active_menu_idx = Math.max(0, Math.min(menus.length - 1, Math.floor(args[0])));
        pending_folder_menu = active_menu_idx;
        if (menus[active_menu_idx] && menus[active_menu_idx].items) {
            var items = menus[active_menu_idx].items;
            menus[active_menu_idx].selected_idx = Math.max(0, Math.min(items.length - 1, Math.floor(args[1])));
        }
        commitSelection();
        return;
    }

    // Pattern 2: Numerical index (works for both Touch scrub and Menu dropdown)
    if (typeof args[0] === "number" || (!isNaN(Number(args[0])) && String(args[0]).trim() !== "")) {
        msg_int(args[0]);
        return;
    }

    // Pattern 3: Text / Symbol recall (e.g. "Clean Tone", "Default")
    var targetStr = args.join(" ").toLowerCase().trim();
    ensureMenuExists(active_menu_idx);
    var m = menus[active_menu_idx];
    if (m && m.items) {
        for (var i = 0; i < m.items.length; i++) {
            if (String(m.items[i].display).toLowerCase().trim() === targetStr ||
                String(m.items[i].raw).toLowerCase().trim() === targetStr) {
                m.selected_idx = i;
                commitSelection();
                return;
            }
        }
    }
}

// ============================================================================
// 2. TOUCH.MASTER BUS & MUTEX DISPATCHER
// ============================================================================
var bus = new Global("touch_theme_bus");
if (!bus.subscribers || typeof bus.subscribers !== "object") {
    bus.subscribers = {};
}

function parseColorArgs(args, fallback) {
    if (args === undefined || args === null) return fallback;
    var list = [];
    if (Array.isArray(args)) {
        list = args;
    } else if (typeof args === "object" && typeof args.length === "number") {
        for (var i = 0; i < args.length; i++) list.push(args[i]);
    } else {
        list = [args];
    }

    while (list.length === 1 && (Array.isArray(list[0]) || (typeof list[0] === "object" && list[0] !== null && typeof list[0].length === "number"))) {
        var inner = list[0];
        list = [];
        for (var j = 0; j < inner.length; j++) list.push(inner[j]);
    }

    if (list.length < 3) return fallback;
    var r = Number(list[0]), g = Number(list[1]), b = Number(list[2]);
    var a = list.length > 3 ? Number(list[3]) : 1.0;
    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return fallback;
    return [r, g, b, a];
}

function loadThemeFromDict() {
    var themeDict = new Dict("touch_theme_store");
    if (!themeDict) return;
    try {
        if (themeDict.contains("bg_color")) bgcolor = parseColorArgs(themeDict.get("bg_color"), bgcolor);
        if (themeDict.contains("border_color")) bordercolor = parseColorArgs(themeDict.get("border_color"), bordercolor);
        if (themeDict.contains("text_color")) textcolor = parseColorArgs(themeDict.get("text_color"), textcolor);
        if (themeDict.contains("highlight_color")) highlight_color = parseColorArgs(themeDict.get("highlight_color"), highlight_color);
        if (themeDict.contains("popup_dot_color")) popup_dot_color = parseColorArgs(themeDict.get("popup_dot_color"), popup_dot_color);
        if (themeDict.contains("pop_bgcolor")) pop_bgcolor = parseColorArgs(themeDict.get("pop_bgcolor"), pop_bgcolor);
        if (themeDict.contains("mode_color")) mode_color = parseColorArgs(themeDict.get("mode_color"), mode_color);

        if (themeDict.contains("attr_bg_color")) attr_bg_color = parseColorArgs(themeDict.get("attr_bg_color"), attr_bg_color);
        if (themeDict.contains("attr_border_color")) attr_border_color = parseColorArgs(themeDict.get("attr_border_color"), attr_border_color);
        if (themeDict.contains("attr_slider_color")) attr_slider_color = parseColorArgs(themeDict.get("attr_slider_color"), attr_slider_color);
        if (themeDict.contains("attr_text_color")) attr_text_color = parseColorArgs(themeDict.get("attr_text_color"), attr_text_color);

        if (themeDict.contains("border_radius")) corner_radius = Number(themeDict.get("border_radius"));
        if (themeDict.contains("border_thickness")) bordersize = Number(themeDict.get("border_thickness"));
        if (themeDict.contains("border_extension")) border_extension = Number(themeDict.get("border_extension"));
    } catch(e) {}
}

function onBusMessage(msg) {
    if (!msg) return;

    if (msg.action === "close_dropdown" && msg.sender !== uniqueID) {
        closeDropdownMenu();
        return;
    }

    try {
        if (msg.bg_color) bgcolor = parseColorArgs(msg.bg_color, bgcolor);
        if (msg.border_color) bordercolor = parseColorArgs(msg.border_color, bordercolor);
        if (msg.text_color) textcolor = parseColorArgs(msg.text_color, textcolor);
        else if (msg.font_color) textcolor = parseColorArgs(msg.font_color, textcolor);
        if (msg.highlight_color) highlight_color = parseColorArgs(msg.highlight_color, highlight_color);
        else if (msg.accent_color) highlight_color = parseColorArgs(msg.accent_color, highlight_color);
        if (msg.popup_dot_color) popup_dot_color = parseColorArgs(msg.popup_dot_color, popup_dot_color);
        else if (msg.dot_color) popup_dot_color = parseColorArgs(msg.dot_color, popup_dot_color);
        if (msg.pop_bgcolor) pop_bgcolor = parseColorArgs(msg.pop_bgcolor, pop_bgcolor);
        if (msg.mode_color) mode_color = parseColorArgs(msg.mode_color, mode_color);

        if (msg.attr_bg_color) attr_bg_color = parseColorArgs(msg.attr_bg_color, attr_bg_color);
        if (msg.attr_border_color) attr_border_color = parseColorArgs(msg.attr_border_color, attr_border_color);
        if (msg.attr_slider_color) attr_slider_color = parseColorArgs(msg.attr_slider_color, attr_slider_color);
        if (msg.attr_text_color) attr_text_color = parseColorArgs(msg.attr_text_color, attr_text_color);

        if (msg.border_radius !== undefined) corner_radius = Number(msg.border_radius);
        if (msg.border_thickness !== undefined) bordersize = Number(msg.border_thickness);
        if (msg.border_extension !== undefined) border_extension = Number(msg.border_extension);

        redraw_all();
        if (dropdownWindow && dropdownWindow.visible) drawDropdownMenu();
        if (popupWindow && popupWindow.visible) drawSettingsWindow();
    } catch(e) {}
}

bus.subscribers[uniqueID] = onBusMessage;
loadThemeFromDict();

function broadcastBus(obj) {
    if (!bus || !bus.subscribers) return;
    for (var k in bus.subscribers) {
        if (bus.subscribers.hasOwnProperty(k) && typeof bus.subscribers[k] === "function") {
            try { bus.subscribers[k](obj); } catch(e) {}
        }
    }
}

// =============================================================
// 3. ATOM PARSING & SANITIZATION
// =============================================================
function cleanQuotes(str) {
    if (!str || typeof str !== "string") return "";
    var s = str.trim();
    s = s.replace(/\\+"/g, '');
    s = s.replace(/^"+|"+$/g, '');
    return s.trim();
}

function parseTokenString(str) {
    if (!str || typeof str !== "string") return [];
    var s = str.trim();
    s = s.replace(/\\+"/g, '"');

    var tokens = [];
    var re = /"([^"]+)"|'([^']+)'|([^\s"',]+)/g;
    var match;
    while ((match = re.exec(s)) !== null) {
        if (match[1] !== undefined) tokens.push(match[1]);
        else if (match[2] !== undefined) tokens.push(match[2]);
        else if (match[3] !== undefined) tokens.push(match[3]);
    }
    return tokens;
}

function apply_case(str, c_mode) {
    if (!str || typeof str !== "string") return "";
    if (c_mode === 1) return str.toUpperCase();
    if (c_mode === 2) return str.toLowerCase();
    return str.toLowerCase().replace(/(?:^|\s|\/|-)\w/g, function (match) {
        return match.toUpperCase();
    });
}

function get_display_label(rawTxt, is_preview) {
    if (!rawTxt || typeof rawTxt !== "string") return "";
    if (label_mode === 4) return "";
    if (is_preview) return apply_case(rawTxt, case_mode);

    if (label_mode === 2) {
        var caps = rawTxt.replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
        if (caps.length > 0) return caps;
        var words = rawTxt.trim().split(/\s+/);
        var fb = "";
        for (var i = 0; i < words.length; i++) {
            if (words[i].length > 0) fb += words[i].charAt(0).toUpperCase();
        }
        return fb.length > 0 ? fb : rawTxt.charAt(0).toUpperCase();
    }

    if (label_mode === 3) {
        var words3 = rawTxt.trim().split(/\s+/);
        var initials = "";
        for (var k = 0; k < words3.length; k++) {
            if (words3[k].length > 0) initials += words3[k].charAt(0).toUpperCase();
        }
        return initials.length > 0 ? initials : rawTxt.charAt(0).toUpperCase();
    }

    if (label_mode === 1) {
        var cleanFull = apply_case(rawTxt, case_mode);
        var words1 = cleanFull.split(/\s+/);
        var resWords = [];
        for (var j = 0; j < words1.length; j++) {
            var w = words1[j];
            if (w.length <= 1) {
                resWords.push(w);
                continue;
            }
            var firstChar = w.charAt(0);
            var rest = w.slice(1).replace(/[aeiouAEIOU]/g, "");
            resWords.push(firstChar + rest);
        }
        return resWords.join(" ").trim();
    }

    return apply_case(rawTxt, case_mode);
}

function stripFilename(filename) {
    var s = String(filename).trim();
    s = s.replace(/\.maxpat$/i, "");
    var parts = s.split(".");
    if (parts.length > 1) {
        parts.shift();
        return parts.join(" ");
    }
    return s.replace(/_/g, " ");
}

function syncModesWithActiveMenus() {
    if (!menus || menus.length === 0) return;
    var pageStrings = [];
    for (var i = 0; i < menus.length; i++) {
        var m = menus[i];
        if (!m || !m.items) continue;
        var itemStrs = [];
        for (var j = 0; j < m.items.length; j++) {
            var raw = m.items[j].display;
            if (raw.indexOf(" ") !== -1) itemStrs.push('"' + raw + '"');
            else itemStrs.push(raw);
        }
        pageStrings.push(itemStrs.join(" "));
    }
    raw_modes_input = pageStrings.join(" , ");
}

// =============================================================
// 4. MENU DATA STRUCTURE
// =============================================================
function getPrefixList() {
    var raw = (prefix_text || "").trim();
    if (!raw) return [];
    if (raw.indexOf(",") !== -1) {
        return raw.split(",").map(function(s) { return cleanQuotes(s); }).filter(function(s) { return s.length > 0; });
    }
    return raw.split(/\s+/).map(function(s) { return cleanQuotes(s); }).filter(function(s) { return s.length > 0; });
}

function initDefaultMenus() {
    var pList = getPrefixList();
    if (pList.length === 0) pList = ["Mode"];

    menus = [];
    for (var i = 0; i < pList.length; i++) {
        menus.push({
            title: pList[i],
            items: [{ display: "Default", raw: "Default" }],
            selected_idx: 0,
            is_folder: false
        });
    }

    var cleanInput = (raw_modes_input || "").replace(/\\+"/g, '"').trim();
    var segments = cleanInput.split(",");
    for (var s = 0; s < segments.length && s < menus.length; s++) {
        var rawTokens = parseTokenString(segments[s]);
        if (rawTokens.length > 0) {
            menus[s].items = rawTokens.map(function(tok) {
                return { display: tok, raw: tok };
            });
        }
    }

    active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));
    pending_folder_menu = active_menu_idx;
}

function ensureMenuExists(idx) {
    while (menus.length <= idx) {
        var pList = getPrefixList();
        var title = (pList[menus.length] !== undefined) ? pList[menus.length] : ("Menu " + (menus.length + 1));
        menus.push({
            title: title,
            items: [],
            selected_idx: 0,
            is_folder: false
        });
    }
}

// =============================================================
// 5. INLET 0: LIVE ADSTATUS, HARDWARE & ATTRIBUTE INGEST
// =============================================================

// Clear menu items on Inlet 0 without wiping the category prefix
function clear_items_inlet0() {
    ensureMenuExists(active_menu_idx);
    menus[active_menu_idx].items = [];
    menus[active_menu_idx].selected_idx = 0;
    is_staged_pending = false;

    if (streamRefreshTask) {
        streamRefreshTask.cancel();
        streamRefreshTask.schedule(15);
    }
}

// Append hardware item on Inlet 0 (joins multi-word strings cleanly)
function append_item_inlet0(args) {
    if (!args || args.length === 0) return;
    var itemStr = args.join(" ").trim();
    if (!itemStr) return;

    ensureMenuExists(active_menu_idx);
    var m = menus[active_menu_idx];
    if (m.items.length === 1 && m.items[0].raw === "Default") {
    m.items = [];
}

    m.items.push({
        display: itemStr,
        raw: itemStr
    });

    if (streamRefreshTask) {
        streamRefreshTask.cancel();
        streamRefreshTask.schedule(15);
    }
}

// Silent Selection Protocol (adstatus 'set <index>' or 'set <symbol>')
function set_selected_silent(val) {
    ensureMenuExists(active_menu_idx);
    var m = menus[active_menu_idx];
    if (!m.items || m.items.length === 0) return;

    var targetIdx = -1;
    if (typeof val === "number" || !isNaN(Number(val))) {
        targetIdx = Math.max(0, Math.min(m.items.length - 1, Math.floor(Number(val))));
    } else {
        var targetStr = String(val).toLowerCase().trim();
        for (var i = 0; i < m.items.length; i++) {
            if (String(m.items[i].display).toLowerCase().trim() === targetStr ||
                String(m.items[i].raw).toLowerCase().trim() === targetStr) {
                targetIdx = i;
                break;
            }
        }
    }

    if (targetIdx !== -1) {
        if (m.selected_idx === targetIdx && !is_staged_pending) return; // Prevent loops
        m.selected_idx = targetIdx;
        is_staged_pending = false;
        redraw_all();
        if (dropdownWindow && dropdownWindow.visible) drawDropdownMenu();
        if (popupWindow && popupWindow.visible) drawSettingsWindow();
    }
}

// =============================================================
// 6. INLET 1: DEDICATED FOLDER & MULTIMENU INGEST HANDLERS
// =============================================================
function append() {
    var args = arrayfromargs(arguments);
    
    // If arriving from adstatus on Inlet 0:
    if (inlet === 0) {
        append_item_inlet0(args);
        return;
    }

    if (args.length === 0) return;
    var filename = args.join(" ").trim();
    if (!filename || filename === "t.empty.maxpat" || filename === "empty") return;

    ensureMenuExists(active_menu_idx);
    var m = menus[active_menu_idx];
    if (!m.is_folder || (m.items.length === 1 && m.items[0].raw === "Default")) {
        m.items = [];
        m.is_folder = true;
    }

    m.items.push({
        display: stripFilename(filename),
        raw: filename
    });

    if (streamRefreshTask) {
        streamRefreshTask.cancel();
        streamRefreshTask.schedule(20);
    }
}


function set() {
    var args = arrayfromargs(arguments);
    
    // If arriving from adstatus on Inlet 0 (e.g. 'set 1'):
    if (inlet === 0) {
        if (args.length >= 1) {
            set_selected_silent(args[0]);
        }
        return;
    }

    if (args.length < 2) return;
    var idx = parseInt(args[0], 10);
    var filename = args.slice(1).join(" ").trim();
    if (isNaN(idx) || !filename || filename === "t.empty.maxpat" || filename === "empty") return;

    ensureMenuExists(active_menu_idx);
    var m = menus[active_menu_idx];
    if (!m.is_folder || (m.items.length === 1 && m.items[0].raw === "Default")) {
        m.items = [];
        m.is_folder = true;
    }

    m.items[idx] = {
        display: stripFilename(filename),
        raw: filename
    };

    if (streamRefreshTask) {
        streamRefreshTask.cancel();
        streamRefreshTask.schedule(20);
    }
}

function clear() {
    // If arriving from adstatus on Inlet 0:
    if (inlet === 0) {
        clear_items_inlet0();
        return;
    }

    ensureMenuExists(active_menu_idx);
    menus[active_menu_idx].items = [];
    menus[active_menu_idx].selected_idx = 0;
    menus[active_menu_idx].is_folder = true;

    if (streamRefreshTask) {
        streamRefreshTask.cancel();
        streamRefreshTask.schedule(20);
    }
}

function menu(v) {
    var idx = parseInt(v, 10);
    if (!isNaN(idx) && idx >= 0) {
        active_menu_idx = idx;
        pending_folder_menu = idx;
        ensureMenuExists(active_menu_idx);
        redraw_all();
        if (dropdownWindow && dropdownWindow.visible) repositionAndResizeDropdown();
        if (popupWindow && popupWindow.visible) drawSettingsWindow();
    }
}

function folder_menu() {
    var args = arrayfromargs(arguments);
    if (args.length === 0) return;

    var targetPage = pending_folder_menu;
    var rawFiles = args;

    var firstArgStr = String(args[0]).trim();
    var parsedInt = parseInt(firstArgStr, 10);
    if (!isNaN(parsedInt) && firstArgStr.indexOf(".") === -1) {
        targetPage = parsedInt;
        rawFiles = args.slice(1);
    }

    var newItems = [];
    for (var i = 0; i < rawFiles.length; i++) {
        var f = String(rawFiles[i]).trim();
        if (f.length > 0 && f !== "t.empty.maxpat" && f !== "empty") {
            newItems.push({
                display: stripFilename(f),
                raw: f
            });
        }
    }

    if (newItems.length === 0) {
        newItems.push({ display: "Empty", raw: "Empty" });
    }

    ensureMenuExists(targetPage);
    menus[targetPage].items = newItems;
    menus[targetPage].is_folder = true;
    menus[targetPage].selected_idx = 0;

    active_menu_idx = targetPage;
    pending_folder_menu = targetPage;
    is_staged_pending = false;

    syncModesWithActiveMenus();
    redraw_all();
    if (dropdownWindow && dropdownWindow.visible) repositionAndResizeDropdown();
    if (popupWindow && popupWindow.visible) drawSettingsWindow();
}

function clear_folders() {
    initDefaultMenus();
    is_staged_pending = false;
    redraw_all();
    if (popupWindow && popupWindow.visible) drawSettingsWindow();
}

// =============================================================
// 7. SCREEN RESOLVER (ZERO "BAD OBJECT" CRASHES)
// =============================================================
function getBoxScreenPos() {
    var cur_box = this.box;
    var cur_patcher = this.patcher;
    if (!cur_box || !cur_patcher) return { x: 100, y: 100, w: 140, h: 30 };

    function resolveLayerBox(b, p) {
        if (!b) return { x: 0, y: 0, w: 140, h: 30, isPres: false };
        var isP = false;
        try {
            if (p && (p.getattr("presentation") == 1 || p.getattr("openinpresentation") == 1)) {
                isP = true;
            }
        } catch(e) {}

        var pr = null;
        try { pr = b.getattr("presentation_rect"); } catch(e) {}

        if (isP && pr && pr.length >= 4 && (pr[2] > 0 || pr[3] > 0)) {
            return { x: pr[0], y: pr[1], w: pr[2], h: pr[3], isPres: true };
        }

        var r = b.rect;
        if (!r || r.length < 4) return { x: 0, y: 0, w: 140, h: 30, isPres: false };
        return { x: r[0], y: r[1], w: r[2] - r[0], h: r[3] - r[1], isPres: false };
    }

    var rThis = resolveLayerBox(cur_box, cur_patcher);
    var cur_x = rThis.x;
    var cur_y = rThis.y;
    var bw = (mgraphics.size && mgraphics.size[0] > 0) ? mgraphics.size[0] : rThis.w;
    var bh = (mgraphics.size && mgraphics.size[1] > 0) ? mgraphics.size[1] : rThis.h;
    bw = Math.max(bw, rThis.w);

    if (!rThis.isPres && cur_patcher.scrolloffset) {
        cur_x -= cur_patcher.scrolloffset[0];
        cur_y -= cur_patcher.scrolloffset[1];
    }

    var pWalk = cur_patcher;
    while (pWalk && pWalk.parentpatcher) {
        var pParent = pWalk.parentpatcher;
        var pBox = null;
        try { pBox = pWalk.box; } catch(e) {}
        if (!pBox) break;

        var rBpatcher = resolveLayerBox(pBox, pParent);

        var b_off = [0, 0];
        try {
            var bo = pBox.getattr("offset");
            if (bo && bo.length >= 2) { 
                b_off[0] = bo[0];
                b_off[1] = bo[1]; 
            }
        } catch(e) {}

        cur_x += (rBpatcher.x - b_off[0]);
        cur_y += (rBpatcher.y - b_off[1]);

        if (!rBpatcher.isPres && pParent.scrolloffset) {
            cur_x -= pParent.scrolloffset[0];
            cur_y -= pParent.scrolloffset[1];
        }
        pWalk = pParent;
    }

    var top_win = [0, 0];
    if (pWalk && pWalk.wind && pWalk.wind.location) {
        top_win = [pWalk.wind.location[0], pWalk.wind.location[1]];
    }

    var isTopPres = false;
    try {
        if (pWalk && pWalk.getattr("presentation") == 1) isTopPres = true;
    } catch(e) {}

    var chromeY = 26;
    var hasToolbars = false;
    try {
        if (pWalk && pWalk.getattr("toolbarvisible") == 1) hasToolbars = true;
    } catch(e) {}

    var activeOffsetX = 0;
    var activeOffsetY = 0;

    if (hasToolbars) {
        if (isTopPres) {
            activeOffsetX = TB_PRES_OFFSET_X;
            activeOffsetY = TB_PRES_OFFSET_Y;
        } else {
            activeOffsetX = TB_PATCH_OFFSET_X;
            activeOffsetY = TB_PATCH_OFFSET_Y;
        }
    } else {
        if (isTopPres) {
            activeOffsetX = NOTB_PRES_OFFSET_X;
            activeOffsetY = NOTB_PRES_OFFSET_Y;
        } else {
            activeOffsetX = NOTB_PATCH_OFFSET_X;
            activeOffsetY = NOTB_PATCH_OFFSET_Y;
        }
    }

    return { 
        x: top_win[0] + cur_x + activeOffsetX, 
        y: top_win[1] + cur_y + chromeY + activeOffsetY, 
        w: Math.round(bw), 
        h: Math.round(bh) 
    };
}

// =============================================================
// 8. FLOATING WINDOWS & MATRIX RECYCLING
// =============================================================
function recycleMatrix(mat, w, h) {
    if (!mat) return new JitterMatrix(4, "char", w, h);
    var d = mat.dim;
    if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
    return mat;
}

var dropdownWindow = new JitterObject("jit.window", "tummanu_drop_" + uniqueID);
dropdownWindow.floating = 1; dropdownWindow.visible = 0; dropdownWindow.border = 0; dropdownWindow.grow = 0;
dropdownWindow.mouseidle = 1;
var dropdownMatrix = null;

var colorWindow    = new JitterObject("jit.window", "tummanu_col_" + uniqueID);
colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0; 
colorWindow.title  = "Color Picker";
colorWindow.size   = [200, 240];
var colorMatrix    = null;

var popupWindow    = new JitterObject("jit.window", "tummanu_set_" + uniqueID);
popupWindow.floating = 1; popupWindow.visible = 0; popupWindow.border = 1; popupWindow.grow = 0; 
popupWindow.title  = "Touch Ummanu Settings";
popupWindow.size   = [270, 420];
var popupMatrix    = null;

// =============================================================
// 9. MODERN HSV COLOR PICKER
// =============================================================
var active_color_target = "bgcolor";
var picker_drag_zone = 0;
var cur_h = 0.15, cur_s = 0.85, cur_v = 0.85, cur_a = 1.0;

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

function openColorPicker(targetKey, anchorX, anchorY) {
    active_color_target = targetKey;
    var col = (targetKey === "bgcolor") ? bgcolor : (targetKey === "textcolor") ? textcolor :
              (targetKey === "bordercolor") ? bordercolor : (targetKey === "highlight_color") ? highlight_color :
              (targetKey === "popup_dot_color") ? popup_dot_color : (targetKey === "mode_color") ? mode_color :
              (targetKey === "attr_bg_color") ? attr_bg_color : (targetKey === "attr_border_color") ? attr_border_color :
              (targetKey === "attr_slider_color") ? attr_slider_color : (targetKey === "attr_text_color") ? attr_text_color : pop_bgcolor;
    var hsv = rgbToHsv(col[0], col[1], col[2]);
    cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2]; cur_a = (col[3] !== undefined ? col[3] : 1.0);

    var scrW = 1920, scrH = 1080;
    try { if (max && max.screensize) { scrW = max.screensize[0]; scrH = max.screensize[1]; } } catch(e) {}

    var posX = anchorX + 10;
    var posY = anchorY - 30;

    if (posX + 200 > scrW - 20) posX = anchorX - 210;
    if (posY + 240 > scrH - 40) posY = scrH - 240 - 40;
    posX = Math.max(10, posX);
    posY = Math.max(30, posY);

    colorWindow.title = "Color: " + targetKey;
    colorWindow.pos = [Math.round(posX), Math.round(posY)];
    colorWindow.visible = 1;
    colorWindow.front();
    drawColorPicker();
}

function applyPickerColor() {
    var rgb = hsvToRgb(cur_h, cur_s, cur_v);
    var rgba = [rgb[0], rgb[1], rgb[2], cur_a];

    if (active_color_target === "bgcolor") bgcolor = rgba;
    else if (active_color_target === "textcolor") textcolor = rgba;
    else if (active_color_target === "bordercolor") bordercolor = rgba;
    else if (active_color_target === "highlight_color") highlight_color = rgba;
    else if (active_color_target === "popup_dot_color") popup_dot_color = rgba;
    else if (active_color_target === "pop_bgcolor") pop_bgcolor = rgba;
    else if (active_color_target === "mode_color") mode_color = rgba;
    else if (active_color_target === "attr_bg_color") attr_bg_color = rgba;
    else if (active_color_target === "attr_border_color") attr_border_color = rgba;
    else if (active_color_target === "attr_slider_color") attr_slider_color = rgba;
    else if (active_color_target === "attr_text_color") attr_text_color = rgba;

    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
    if (dropdownWindow.visible) drawDropdownMenu();
}

function drawColorPicker() {
    var w = 200, h = 240;
    colorMatrix = recycleMatrix(colorMatrix, w, h);
    var ctx = new MGraphics(w, h);

    ctx.set_source_rgba(pop_bgcolor);
    ctx.rectangle(0, 0, w, h);
    ctx.fill();

    ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
    ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(textcolor);
    ctx.move_to(26, 17);
    ctx.show_text(active_color_target);

    var hx = 10, hy = 28, hw = 180, hh = 14;
    var hPat = ctx.pattern_create_linear(hx, 0, hx + hw, 0);
    hPat.add_color_stop_rgba(0.0, 1,0,0,1); hPat.add_color_stop_rgba(0.17, 1,1,0,1);
    hPat.add_color_stop_rgba(0.33, 0,1,0,1); hPat.add_color_stop_rgba(0.5, 0,1,1,1);
    hPat.add_color_stop_rgba(0.67, 0,0,1,1); hPat.add_color_stop_rgba(0.83, 1,0,1,1);
    hPat.add_color_stop_rgba(1.0, 1,0,0,1);
    ctx.set_source(hPat);
    ctx.rectangle_rounded(hx, hy, hw, hh, 2, 2);
    ctx.fill();

    ctx.set_source_rgba(1, 1, 1, 1);
    ctx.set_line_width(1.5);
    ctx.arc(hx + cur_h * hw, hy + hh * 0.5, 4, 0, Math.PI * 2);
    ctx.stroke();

    var sx = 10, sy = 48, sw = 180, sh = 115;
    var baseRGB = hsvToRgb(cur_h, 1.0, 1.0);
    ctx.set_source_rgba(baseRGB[0], baseRGB[1], baseRGB[2], 1.0);
    ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
    ctx.fill();

    var sPat = ctx.pattern_create_linear(sx, 0, sx + sw, 0);
    sPat.add_color_stop_rgba(0.0, 1,1,1,1); sPat.add_color_stop_rgba(1.0, 1,1,1,0);
    ctx.set_source(sPat);
    ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
    ctx.fill();

    var vPat = ctx.pattern_create_linear(0, sy, 0, sy + sh);
    vPat.add_color_stop_rgba(0.0, 0,0,0,0); vPat.add_color_stop_rgba(1.0, 0,0,0,1);
    ctx.set_source(vPat);
    ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
    ctx.fill();

    ctx.set_source_rgba(cur_v > 0.4 ? [0,0,0,0.9] : [1,1,1,0.9]);
    ctx.arc(sx + cur_s * sw, sy + (1.0 - cur_v) * sh, 4.5, 0, Math.PI * 2);
    ctx.stroke();

    var ax = 10, ay = 170, aw = 180, ah = 14;
    var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
    var aPat = ctx.pattern_create_linear(ax, 0, ax + aw, 0);
    aPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
    aPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
    ctx.set_source(aPat);
    ctx.rectangle_rounded(ax, ay, aw, ah, 2, 2);
    ctx.fill();

    ctx.set_source_rgba(1, 1, 1, 1);
    ctx.arc(ax + cur_a * aw, ay + ah * 0.5, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
    ctx.rectangle_rounded(10, 192, 180, 36, 3, 3);
    ctx.fill();

    var img = new Image(ctx);
    img.tonamedmatrix(colorMatrix.name);
    colorWindow.jit_matrix(colorMatrix.name);
}

var colorListener = new JitterListener(colorWindow.name, function(e) {
    if (e.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
    if (e.eventname === "mouse") {
        var a = arrayfromargs(e.args), mx = a[0], my = a[1], but = a[2];
        if (!but) { picker_drag_zone = 0; return; }
        if (mx < 22 && my < 22) { colorWindow.visible = 0; return; }

        if (picker_drag_zone === 0) {
            if (my >= 26 && my <= 44) picker_drag_zone = 1;
            else if (my >= 48 && my <= 165) picker_drag_zone = 2;
            else if (my >= 168 && my <= 186) picker_drag_zone = 3;
        }

        if (picker_drag_zone === 1) cur_h = Math.max(0, Math.min(1, (mx - 10) / 180));
        else if (picker_drag_zone === 2) {
            cur_s = Math.max(0, Math.min(1, (mx - 10) / 180));
            cur_v = Math.max(0, Math.min(1, 1.0 - (my - 48) / 117));
        } else if (picker_drag_zone === 3) cur_a = Math.max(0, Math.min(1, (mx - 10) / 180));

        applyPickerColor();
        drawColorPicker();
    }
});

// =============================================================
// 10. FLUSH-LEFT DROPDOWN MENU
// =============================================================
function closeDropdownMenu() {
    if (dropdownWatchdog) {
        dropdownWatchdog.cancel();
        dropdownWatchdog = null;
    }
    if (dropdownWindow && dropdownWindow.visible) {
        dropdownWindow.visible = 0;
        last_close_time = new Date().getTime();
    }
    dropdown_hover_row = -1;
    dropdown_mouse_latched = false;
    has_entered_dropdown = false;
}

function startDropdownWatchdog() {
    if (dropdownWatchdog) dropdownWatchdog.cancel();
    last_mouse_inside_time = new Date().getTime();
    has_entered_dropdown = false;

    dropdownWatchdog = new Task(function() {
        if (!dropdownWindow || !dropdownWindow.visible) {
            if (dropdownWatchdog) { dropdownWatchdog.cancel(); dropdownWatchdog = null; }
            return;
        }
        var now = new Date().getTime();
        if (has_entered_dropdown && (now - last_mouse_inside_time > 2000)) {
            closeDropdownMenu();
        }
    }, this);
    dropdownWatchdog.interval = 30;
    dropdownWatchdog.repeat();
}

function repositionAndResizeDropdown() {
    if (!dropdownWindow || !dropdownWindow.visible) return;
    if (!menus || menus.length === 0) return;

    var curMenuData = menus[active_menu_idx];
    var pageCount = (curMenuData && curMenuData.items) ? curMenuData.items.length : 1;
    var hasHeader = (multimenu === 1 && menus.length > 1);
    var itemRowH = v_fontsize + 10;
    var newH = (hasHeader ? DROPDOWN_HEADER_H : 0) + (pageCount * itemRowH) + 8;

    // 1. Measure the widest text entry in the active menu
    var measurer = new MGraphics(10, 10);
    measurer.select_font_face(v_font_name);
    measurer.set_font_size(v_fontsize);

    var maxItemW = 0;
    if (curMenuData && curMenuData.items) {
        for (var m = 0; m < curMenuData.items.length; m++) {
            var it = curMenuData.items[m];
            var str = (it && it.display !== undefined) ? String(it.display) : String(it);
            var tm = measurer.text_measure(str);
            if (tm && tm[0] > maxItemW) {
                maxItemW = tm[0];
            }
        }
    }

    // Measure category header title if MultiMenu is active
    if (hasHeader) {
        measurer.select_font_face(v_font_name, "normal", "bold");
        measurer.set_font_size(10);
        var pTitle = get_display_label(curMenuData.title || "", true);
        var tmH = measurer.text_measure(pTitle);
        var headerW = (tmH ? tmH[0] : 60) + 48; // Padding for '<' and '>' navigation glyphs
        if (headerW > maxItemW) maxItemW = headerW;
    }

    // Add left indent (14px) + right safety padding (16px)
    var contentW = Math.ceil(maxItemW + 30);
    var menuW, menuX, menuY;

    if (dropdown_opened_from_popup && popupWindow && popupWindow.visible) {
        var popPos = popupWindow.pos;
        var popSize = popupWindow.size;
        var prevX = 12;
        var prevY = cached_prev_y;
        var prevW = popSize[0] - 24;
        var rows = get_settings_rows();
        var prevH = (rows.length > 0) ? 36 : (popSize[1] - prevY - 10);

        menuW = Math.max(Math.round(prevW), contentW);
        menuX = Math.round(popPos[0] + prevX);
        menuY = Math.round(popPos[1] + prevY + prevH + 2);
    } else {
        var boxPos = getBoxScreenPos();
        // Auto-fit: Use widest text width or box width (whichever is larger)
        menuW = Math.max(boxPos.w, contentW, 100);
        menuX = Math.round(boxPos.x);
        menuY = Math.round(boxPos.y + boxPos.h + 2);
    }

    // Keep dropdown inside the physical screen boundaries
    var scrW = 1920, scrH = 1080;
    try {
        if (max && max.screensize) {
            scrW = max.screensize[0];
            scrH = max.screensize[1];
        }
    } catch(e) {}

    menuX = Math.max(10, Math.min(menuX, scrW - menuW - 10));
    if (menuY + newH > scrH - 30) {
        var anchorTop = (dropdown_opened_from_popup && popupWindow && popupWindow.visible) 
            ? (popupWindow.pos[1] + cached_prev_y) 
            : boxPos.y;
        menuY = Math.max(30, anchorTop - newH - 2);
    }

    dropdownWindow.size = [menuW, newH];
    dropdownWindow.pos = [menuX, menuY];
    drawDropdownMenu();
}
function openDropdownMenu(from_popup) {
    broadcastBus({ action: "close_dropdown", sender: uniqueID });

    if (!menus || menus.length === 0) initDefaultMenus();

    dropdown_opened_from_popup = (from_popup === true);

    active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));
    pending_folder_menu = active_menu_idx;
    outlet(2, active_menu_idx);

    dropdown_hover_row = -1;
    dropdown_mouse_latched = false;

    dropdownWindow.visible = 1;
    dropdownWindow.front();

    repositionAndResizeDropdown();
    startDropdownWatchdog();
}

function drawDropdownMenu() {
    if (!dropdownWindow.visible) return;
    if (!menus || menus.length === 0) return;

    active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));
    var curMenu = menus[active_menu_idx];
    if (!curMenu || !curMenu.items) return;

    var size = dropdownWindow.size, w = size[0], h = size[1];
    dropdownMatrix = recycleMatrix(dropdownMatrix, w, h);
    var ctx = new MGraphics(w, h);

    ctx.set_source_rgba(pop_bgcolor);
    ctx.rectangle(0, 0, w, h);
    ctx.fill();

    ctx.set_source_rgba(bordercolor);
    ctx.set_line_width(bordersize);
    ctx.rectangle(bordersize * 0.5, bordersize * 0.5, w - bordersize, h - bordersize);
    ctx.stroke();

    var hasHeader = (multimenu === 1 && menus.length > 1);
    var startY = 4;

    if (hasHeader) {
        ctx.set_source_rgba(bgcolor);
        ctx.rectangle(bordersize, bordersize, w - bordersize * 2, DROPDOWN_HEADER_H);
        ctx.fill();

        ctx.select_font_face(v_font_name, "normal", "bold");
        ctx.set_font_size(10);
        ctx.set_source_rgba(highlight_color);

        ctx.move_to(8, 16); ctx.show_text("‹");
        ctx.move_to(w - 14, 16); ctx.show_text("›");

        var pTitle = get_display_label(curMenu.title || "", true);
        var tm = ctx.text_measure(pTitle);
        ctx.set_source_rgba(textcolor);
        ctx.move_to((w - (tm ? tm[0] : 60)) * 0.5, 16);
        ctx.show_text(pTitle);

        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.4);
        ctx.set_line_width(1.0);
        ctx.move_to(0, DROPDOWN_HEADER_H);
        ctx.line_to(w, DROPDOWN_HEADER_H);
        ctx.stroke();

        startY = DROPDOWN_HEADER_H + 4;
    }

    var itemRowH = v_fontsize + 10;
    ctx.select_font_face(v_font_name);
    ctx.set_font_size(v_fontsize);

    for (var i = 0; i < curMenu.items.length; i++) {
        var rowY = startY + i * itemRowH;
        var itemObj = curMenu.items[i];
        var itemLabel = (itemObj && itemObj.display !== undefined) ? itemObj.display : String(itemObj);

        if (i === curMenu.selected_idx) {
            ctx.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], 0.35);
            ctx.rectangle(bordersize + 1, rowY, w - (bordersize + 1) * 2, itemRowH);
            ctx.fill();

            ctx.set_source_rgba(highlight_color);
            ctx.rectangle(bordersize + 2, rowY + 2, 3.5, itemRowH - 4);
            ctx.fill();
        } else if (i === dropdown_hover_row) {
            ctx.set_source_rgba(1.0, 1.0, 1.0, 0.08);
            ctx.rectangle(bordersize + 1, rowY, w - (bordersize + 1) * 2, itemRowH);
            ctx.fill();
        }

        ctx.set_source_rgba(textcolor);
        ctx.move_to(14, rowY + itemRowH * 0.5 + v_fontsize * 0.33);
        ctx.show_text(itemLabel);
    }

    var img = new Image(ctx);
    img.tonamedmatrix(dropdownMatrix.name);
    dropdownWindow.jit_matrix(dropdownMatrix.name);
}

var dropdownListener = new JitterListener(dropdownWindow.name, function(e) {
    if (e.eventname === "key" && e.args[0] === 27) {
        closeDropdownMenu();
        return;
    }

    if (e.eventname === "mouse" || e.eventname === "mouseidle") {
        var args = arrayfromargs(e.args), mx = args[0], my = args[1], mbut = (e.eventname === "mouse") ? args[2] : 0;
        var size = dropdownWindow.size, w = size[0], h = size[1];

        if (mx >= 0 && mx <= w && my >= 0 && my <= h) {
            has_entered_dropdown = true;
            last_mouse_inside_time = new Date().getTime();
        } else {
            if (has_entered_dropdown || mx < -20 || mx > w + 20 || my < -20 || my > h + 20) {
                closeDropdownMenu();
                return;
            }
        }

        if (mbut === 0) dropdown_mouse_latched = false;

        var hasHeader = (multimenu === 1 && menus.length > 1);
        var itemRowH = v_fontsize + 10;
        var startY = hasHeader ? (DROPDOWN_HEADER_H + 4) : 4;

        if (menus && menus[active_menu_idx] && menus[active_menu_idx].items) {
            if (my >= startY && mx >= 0 && mx <= w && my <= h) {
                var hoverRow = Math.floor((my - startY) / itemRowH);
                if (hoverRow >= 0 && hoverRow < menus[active_menu_idx].items.length) {
                    if (hoverRow !== dropdown_hover_row) {
                        dropdown_hover_row = hoverRow;
                        drawDropdownMenu();
                    }
                }
            } else if (dropdown_hover_row !== -1) {
                dropdown_hover_row = -1;
                drawDropdownMenu();
            }
        }

        if (mbut === 1 && !dropdown_mouse_latched) {
            if (hasHeader && my < DROPDOWN_HEADER_H && mx >= 0 && mx <= w) {
                dropdown_mouse_latched = true;
                var dir = (mx > w * 0.5) ? 1 : -1;
                switchMenuPage(dir);
                return;
            }

            if (my >= startY && mx >= 0 && mx <= w && my <= h) {
                dropdown_mouse_latched = true;
                var clickedRow = Math.floor((my - startY) / itemRowH);
                var curMenu = menus[active_menu_idx];
                if (curMenu && curMenu.items && clickedRow >= 0 && clickedRow < curMenu.items.length) {
                    curMenu.selected_idx = clickedRow;
                    is_staged_pending = false;
                    outputData();
                    closeDropdownMenu();
                    redraw_all();
                    if (popupWindow.visible) drawSettingsWindow();
                }
            }
        }
    }
});

function switchMenuPage(dir) {
    if (!menus || menus.length <= 1) return;
    active_menu_idx = (active_menu_idx + dir + menus.length) % menus.length;
    pending_folder_menu = active_menu_idx;
    dropdown_hover_row = -1;

    outlet(2, active_menu_idx);

    repositionAndResizeDropdown();
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
}

// =============================================================
// 11. LOCAL SETTINGS INSPECTOR
// =============================================================
function get_settings_rows() {
    if (!show_settings_attrs) return [];

    var list = [];
    var outLabels = ["Prefix + Item", "Raw File", "Item Name", "Prefix + Index"];

    if (mask_performance) {
        list.push({ name: "Mode", val: (v_mode ? "Menu" : "Touch"), is_toggle: true, action: "mode" });
        list.push({ name: "MultiMenu", val: (multimenu ? "ON" : "OFF"), is_toggle: true, action: "multimenu" });
        list.push({ name: "Output", val: outLabels[output_type], is_toggle: true, action: "output_type" });
        list.push({ name: "Touch Out", val: (touch_output_mode ? "Staged" : "Instant"), is_toggle: true, action: "touch_out" });
        list.push({ name: "Zone Markers", val: (show_markers ? "ON" : "OFF"), is_toggle: true, action: "markers" });
        list.push({ name: "Hold Speed", val: hold_speed.toFixed(0) + "ms", pct: Math.min(1.0, Math.max(0.0, (hold_speed - 10.0) / 240.0)), is_slider: true, action: "hold_speed" });
        list.push({ name: "Arrow Glyph", val: (v_show_arrow ? "ON" : "OFF"), is_toggle: true, action: "arrow" });
    }

    if (mask_labels) {
        list.push({ name: "Prefix Style", val: label_mode_names[label_mode], is_toggle: true, action: "label_mode" });
        list.push({ name: "Prefix Case", val: case_mode_names[case_mode], is_toggle: true, action: "case_mode" });
    }

    if (mask_geometry) {
        list.push({ name: "Radius", val: corner_radius.toFixed(1), pct: Math.min(1.0, Math.max(0.0, corner_radius / 24.0)), is_slider: true, action: "radius" });
        list.push({ name: "Border Size", val: bordersize.toFixed(1), pct: Math.min(1.0, Math.max(0.0, bordersize / 4.0)), is_slider: true, action: "bordersize" });
        list.push({ name: "Extension", val: border_extension.toFixed(1), pct: Math.min(1.0, Math.max(0.0, border_extension / 20.0)), is_slider: true, action: "extension" });
    }

    if (mask_colors) {
        list.push({ name: "BG Color", val: bgcolor, is_color: true, col: bgcolor, key: "bgcolor", action: "color" });
        list.push({ name: "Border Color", val: bordercolor, is_color: true, col: bordercolor, key: "bordercolor", action: "color" });
        list.push({ name: "Highlight", val: highlight_color, is_color: true, col: highlight_color, key: "highlight_color", action: "color" });
        list.push({ name: "Text Color", val: textcolor, is_color: true, col: textcolor, key: "textcolor", action: "color" });
        list.push({ name: "Mode Prefix", val: mode_color, is_color: true, col: mode_color, key: "mode_color", action: "color" });
        list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, col: popup_dot_color, key: "popup_dot_color", action: "color" });
    }

    if (mask_popup_colors) {
        list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, col: pop_bgcolor, key: "pop_bgcolor", action: "color" });
        list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, col: attr_bg_color, key: "attr_bg_color", action: "color" });
        list.push({ name: "Attr Border", val: attr_border_color, is_color: true, col: attr_border_color, key: "attr_border_color", action: "color" });
        list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, col: attr_slider_color, key: "attr_slider_color", action: "color" });
        list.push({ name: "Attr Text", val: attr_text_color, is_color: true, col: attr_text_color, key: "attr_text_color", action: "color" });
    }
    return list;
}

function calculate_popup_height(num_rows) {
    if (num_rows === 0) return popup_mini_h;
    return 32 + num_rows * 28 + 12 + 36 + 14;
}

function update_popup_dimensions() {
    var rows = get_settings_rows();
    var calculated_w = (rows.length === 0) ? popup_mini_w : 270;
    var calculated_h = calculate_popup_height(rows.length);
    
    // Force native OS window frame to exact width and height using rect
    popupWindow.rect = [
        SETTINGS_WIN_X, 
        SETTINGS_WIN_Y, 
        SETTINGS_WIN_X + calculated_w, 
        SETTINGS_WIN_Y + calculated_h
    ];

    if (popupWindow.visible) {
        drawSettingsWindow();
    }
}

function position_popup_window() {
    // Handled atomically by popupWindow.rect in update_popup_dimensions
}

function open_popup() {
    showSettings = 1;
    update_popup_dimensions();
    position_popup_window();
    popupWindow.visible = 1;
    popupWindow.front();
    drawSettingsWindow();
}

function close_popup() {
    showSettings = 0;
    popupWindow.visible = 0;
    colorWindow.visible = 0;
    if (dropdownWindow.visible && dropdown_opened_from_popup) {
        closeDropdownMenu();
    }
    stop_pop_holding();
    active_pop_slider = -1;
    redraw_all();
}

function popup(v) {
    if (v === undefined) {
        if (popupWindow.visible) close_popup();
        else open_popup();
    } else {
        if (Number(v) > 0) open_popup();
        else close_popup();
    }
}

function drawSettingsWindow() {
    var rows = get_settings_rows();
    var has_rows = rows.length > 0;
    var calculated_h = calculate_popup_height(rows.length);
    var w = has_rows ? 270 : popup_mini_w;
    var h = calculated_h;

    popupMatrix = recycleMatrix(popupMatrix, w, h);
    var ctx = new MGraphics(w, h);

    ctx.set_source_rgba(pop_bgcolor);
    ctx.rectangle(0, 0, w, h);
    ctx.fill();

    // Red Close Button
    ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
    ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.select_font_face("Arial", "normal", "normal");
    ctx.set_font_size(9);
    ctx.set_source_rgba(textcolor[0], textcolor[1], textcolor[2], 0.45);
    ctx.move_to(24, 17);
    ctx.show_text("close");

    // Hide/Show Toggle Button
    var tglW = 44, tglH = 16;
    var tglX = w - tglW - 12, tglY = 6;
    var tglR = Math.max(2, Math.min(6, corner_radius * 0.3));

    ctx.set_source_rgba(attr_bg_color);
    ctx.rectangle_rounded(tglX, tglY, tglW, tglH, tglR, tglR);
    ctx.fill();

    if (bordersize > 0) {
        ctx.set_source_rgba(attr_border_color);
        ctx.set_line_width(Math.min(bordersize, 1.0));
        ctx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, tglR, tglR);
        ctx.stroke();
    }

    ctx.select_font_face(v_font_name, "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(attr_text_color);
    var tglLabel = show_settings_attrs ? "hide" : "show";
    var tglTm = ctx.text_measure(tglLabel);
    var tglTextX = tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5;
    ctx.move_to(tglTextX, tglY + 11.5);
    ctx.show_text(tglLabel);

    var currentY = 32;

    // 50/50 ATTRUI ROWS
    var rowX = 12;
    var rowW = w - 24;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    for (var i = 0; i < rows.length; i++) {
        var ry = currentY + i * 28;
        var r = rows[i];

        ctx.set_source_rgba(attr_bg_color);
        ctx.rectangle(rowX, ry, rowW, 26);
        ctx.fill();

        ctx.select_font_face(v_font_name, "normal", "normal");
        ctx.set_font_size(10);
        ctx.set_source_rgba(attr_text_color);
        ctx.move_to(rowX + 6, ry + 17);
        ctx.show_text(r.name);

        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.35);
        ctx.set_line_width(1.0);
        ctx.move_to(midX, ry + 3);
        ctx.line_to(midX, ry + 23);
        ctx.stroke();

        var vY = ry + 4;
        var vH = 18;

        if (r.is_color) {
            ctx.set_source_rgba(r.col);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.fill();

            ctx.set_source_rgba(attr_border_color);
            ctx.set_line_width(1.0);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.stroke();
        } else if (r.is_slider) {
            ctx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.fill();

            var fillW = Math.max(0, Math.min(valBoxW, (r.pct !== undefined ? r.pct : 0.0) * valBoxW));
            ctx.set_source_rgba(attr_slider_color);
            ctx.rectangle(valBoxX, vY, fillW, vH);
            ctx.fill();

            ctx.set_source_rgba(attr_border_color);
            ctx.set_line_width(1.0);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.stroke();

            ctx.set_source_rgba(attr_text_color);
            ctx.move_to(valBoxX + 6, ry + 17);
            ctx.show_text(String(r.val));
        } else {
            ctx.set_source_rgba(0.14, 0.14, 0.17, 0.70);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.fill();

            ctx.set_source_rgba(attr_border_color);
            ctx.set_line_width(0.75);
            ctx.rectangle(valBoxX, vY, valBoxW, vH);
            ctx.stroke();

            ctx.set_source_rgba(attr_text_color);
            var vTm = ctx.text_measure(String(r.val));
            var vStrW = vTm ? vTm[0] : 20;
            ctx.move_to(valBoxX + Math.max(6, (valBoxW - vStrW) * 0.5), ry + 17);
            ctx.show_text(String(r.val));
        }
    }

    if (has_rows) {
        currentY += rows.length * 28 + 4;
        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.35);
        ctx.set_line_width(1.0);
        ctx.move_to(10, currentY);
        ctx.line_to(w - 10, currentY);
        ctx.stroke();
        currentY += 8;
    } else {
        currentY = 28;
    }

    // BOTTOM DOCKED MENU PREVIEW
    var prevX = 12;
    var prevY = currentY;
    cached_prev_y = prevY;
    var prevW = w - 24;
    var prevH = has_rows ? 36 : (h - prevY - 10);

    var prevInset = bordersize * 0.5;
    var prw = prevW - bordersize;
    var prh = prevH - bordersize;
    var scaleRatio = prevH / 36.0;
    var pr_r = Math.max(0, Math.min(corner_radius * scaleRatio, prw * 0.5, prh * 0.5));
    var pr_ew = Math.min(border_extension * scaleRatio, Math.max(0, (prw - 2 * pr_r) * 0.5));
    var pr_eh = Math.min(border_extension * scaleRatio, Math.max(0, (prh - 2 * pr_r) * 0.5));

    ctx.set_source_rgba(bgcolor);
    ctx.rectangle_rounded(prevX + prevInset, prevY + prevInset, prw, prh, pr_r, pr_r);
    ctx.fill();

    if (bordersize > 0) {
        drawCorners(ctx, prevX + prevInset, prevY + prevInset, prw, prh, pr_r, pr_ew, pr_eh);
    }

    if (show_markers && v_mode === 0) {
        draw_zone_markers(ctx, prevX, prevY, prevW, prevH, prevInset, true);
    }

    if (v_mode === 1 && v_show_arrow) {
        var aX = prevX + prevW - 16;
        ctx.set_source_rgba(highlight_color);
        ctx.new_path();
        ctx.move_to(aX - 4, prevY + prevH * 0.5 - 2);
        ctx.line_to(aX + 4, prevY + prevH * 0.5 - 2);
        ctx.line_to(aX, prevY + prevH * 0.5 + 3);
        ctx.close_path();
        ctx.fill();
    }

    var prevFontSize = Math.max(12, Math.min(22, Math.round(v_fontsize * scaleRatio)));
    ctx.select_font_face(v_font_name);
    ctx.set_font_size(prevFontSize);

    var curMenu = menus[active_menu_idx];
    var rawPrefix = (curMenu && curMenu.title) ? curMenu.title : "Mode";
    var itemObj = (curMenu && curMenu.items && curMenu.items[curMenu.selected_idx]) ? curMenu.items[curMenu.selected_idx] : null;
    var rawItem = (itemObj && itemObj.display !== undefined) ? itemObj.display : "Default";

    var formattedPrefix = get_display_label(rawPrefix, true);
    var pfxStr = (formattedPrefix !== "") ? (formattedPrefix + ": ") : "";
    var itemText = rawItem;

    var pTextStart = (show_markers && v_mode === 0 && touch_output_mode === 1) 
        ? (prevX + prevW * 0.28 + 4) 
        : (prevX + 10 + bordersize);
    var pRightLimit = (show_markers && v_mode === 0 && touch_output_mode === 1)
        ? (prevX + prevW * 0.72 - 4)
        : (prevX + prevW - 22);
    var pMaxW = Math.max(20, pRightLimit - pTextStart);

    var pfxTm = pfxStr.length > 0 ? ctx.text_measure(pfxStr) : [0, 0];
    var pfxW = pfxTm[0];
    var itemMaxW = Math.max(0, pMaxW - pfxW);
    var dispItem = itemText;

    if (itemMaxW > 0) {
        if (ctx.text_measure(dispItem)[0] > itemMaxW) {
            while (dispItem.length > 0 && ctx.text_measure(dispItem + "..")[0] > itemMaxW) {
                dispItem = dispItem.slice(0, -1);
            }
            dispItem += "..";
        }
    } else {
        dispItem = "";
    }

    var prevTextY = prevY + prevH * 0.5 + prevFontSize * 0.33;

    if (pfxStr.length > 0) {
        ctx.set_source_rgba(mode_color);
        ctx.move_to(pTextStart, prevTextY);
        ctx.show_text(pfxStr);
    }

    if (dispItem.length > 0) {
        ctx.set_source_rgba(textcolor);
        ctx.move_to(pTextStart + pfxW, prevTextY);
        ctx.show_text(dispItem);
    }

    if (!has_rows) {
        ctx.new_path();
        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.6);
        ctx.set_line_width(1.2);
        ctx.move_to(w - 12, h - 4); ctx.line_to(w - 4, h - 12);
        ctx.move_to(w - 8, h - 4);  ctx.line_to(w - 4, h - 8);
        ctx.stroke();
    }

    var img = new Image(ctx);
    img.tonamedmatrix(popupMatrix.name);
    popupWindow.jit_matrix(popupMatrix.name);
}

function stop_pop_holding() {
    pop_is_holding = 0;
    pop_hold_gate = 0;
    if (popHoldTask) {
        popHoldTask.cancel();
        popHoldTask = null;
    }
}

var popupListener = new JitterListener(popupWindow.name, function(e) {
    if (e.eventname === "close") { 
        close_popup();
        return; 
    }
    if (e.eventname === "mouse") {
        var args = arrayfromargs(e.args), mx = args[0], my = args[1], mbut = args[2];
        var rows = get_settings_rows();
        var has_rows = rows.length > 0;
        
        // Match drawing canvas dimensions directly
        var w = has_rows ? 270 : popup_mini_w;
        var h = calculate_popup_height(rows.length);

        if (mbut === 0) {
            is_resizing_window = 0;
            active_pop_slider = -1;
            stop_pop_holding();
            return;
        }
        // ... [keep the rest of popupListener exactly the same] ...

        if (mbut === 1) {
            var tglW = 44, tglH = 16;
            var tglX = w - tglW - 12, tglY = 6;
            if (mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
                show_settings_attrs = show_settings_attrs ? 0 : 1;
                update_popup_dimensions();
                return;
            }

            if (is_resizing_window && !has_rows) {
                var deltaW = mx - start_click_x;
                var deltaH = my - start_click_y;
                popup_mini_w = Math.max(260, Math.min(start_resize_w + deltaW, 420));
                popup_mini_h = Math.max(85, Math.min(start_resize_h + deltaH, 150));
                update_popup_dimensions();
                return;
            }

            if (!has_rows && mx >= w - 16 && my >= h - 16) {
                is_resizing_window = 1;
                start_click_x = mx;
                start_click_y = my;
                start_resize_w = w;
                start_resize_h = h;
                return;
            }

            if (mx < 24 && my < 24) { 
                close_popup();
                return; 
            }

            if (active_pop_slider !== -1 && active_pop_slider < rows.length) {
                var sData = rows[active_pop_slider];
                var rowW = w - 24;
                var midX = 12 + rowW * 0.5;
                var valBoxX = midX + 4;
                var valBoxW = rowW * 0.5 - 8;
                var pct = Math.max(0.0, Math.min(1.0, (mx - valBoxX) / Math.max(1.0, valBoxW)));

                if (sData.action === "radius") corner_radius = pct * 24.0;
                else if (sData.action === "bordersize") bordersize = pct * 4.0;
                else if (sData.action === "extension") border_extension = pct * 20.0;
                else if (sData.action === "hold_speed") hold_speed = Math.max(10.0, 10.0 + pct * 240.0);

                redraw_all();
                drawSettingsWindow();
                return;
            }

            if (has_rows && my >= 32 && my < 32 + rows.length * 28) {
                var row = Math.floor((my - 32) / 28);
                if (row >= 0 && row < rows.length) {
                    stop_pop_holding();
                    var rData = rows[row];
                    var rowW = w - 24;
                    var midX = 12 + rowW * 0.5;
                    var valBoxX = midX + 4;
                    var valBoxW = rowW * 0.5 - 8;
                    var pct = Math.max(0.0, Math.min(1.0, (mx - valBoxX) / Math.max(1.0, valBoxW)));

                    if (rData.is_slider) {
                        active_pop_slider = row;
                        if (rData.action === "radius") corner_radius = pct * 24.0;
                        else if (rData.action === "bordersize") bordersize = pct * 4.0;
                        else if (rData.action === "extension") border_extension = pct * 20.0;
                        else if (rData.action === "hold_speed") hold_speed = Math.max(10.0, 10.0 + pct * 240.0);
                        redraw_all();
                        drawSettingsWindow();
                        return;
                    }

                    if (rData.action === "mode") { v_mode = v_mode ? 0 : 1; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "multimenu") { multimenu = multimenu ? 0 : 1; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "output_type") { output_type = (output_type + 1) % 4; drawSettingsWindow(); }
                    else if (rData.action === "touch_out") { touch_output_mode = touch_output_mode ? 0 : 1; is_staged_pending = false; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "markers") { show_markers = show_markers ? 0 : 1; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "arrow") { v_show_arrow = v_show_arrow ? 0 : 1; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "label_mode") { label_mode = (label_mode + 1) % 5; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "case_mode") { case_mode = (case_mode + 1) % 3; redraw_all(); drawSettingsWindow(); }
                    else if (rData.action === "color") openColorPicker(rData.key, popupWindow.pos[0] + 180, popupWindow.pos[1] + 32 + row * 28 + 14);
                    return;
                }
            }

            var prevX = 12, prevY = cached_prev_y;
            var prevW = w - 24;
            var prevH = has_rows ? 36 : (h - prevY - 10);

            if (mx >= prevX && mx <= prevX + prevW && my >= prevY && my <= prevY + prevH) {
                if (v_mode === 1) {
                    stop_pop_holding();
                    if (dropdownWindow.visible) closeDropdownMenu();
                    else openDropdownMenu(true);
                } else {
                    var dir = (mx > prevX + prevW * 0.5) ? 1 : -1;

                    if (!pop_is_holding) {
                        stepLocalItem(dir, touch_output_mode === 0);
                        drawSettingsWindow();

                        pop_is_holding = 1;
                        pop_hold_gate = 0;
                        pop_click_time = new Date().getTime();
                        pop_last_step = pop_click_time;
                        if (popHoldTask) { popHoldTask.cancel(); popHoldTask = null; }

                        popHoldTask = new Task(function() {
                            if (!pop_is_holding) { stop_pop_holding(); return; }
                            var now = new Date().getTime();
                            if (pop_hold_gate === 0) {
                                if (now - pop_click_time >= 350) {
                                    pop_hold_gate = 1;
                                    pop_last_step = now;
                                    stepLocalItem(dir, touch_output_mode === 0);
                                    drawSettingsWindow();
                                }
                            } else {
                                if (now - pop_last_step >= hold_speed) {
                                    pop_last_step = now;
                                    stepLocalItem(dir, touch_output_mode === 0);
                                    drawSettingsWindow();
                                }
                            }
                        }, this);
                        popHoldTask.interval = 15;
                        popHoldTask.repeat();
                    }
                }
            } else {
                stop_pop_holding();
            }
        }
    }
});

// =============================================================
// 12. CANVAS PAINT (TWO-PASS PREFIX & ITEM SPLIT)
// =============================================================
function drawCorners(ctx, x, y, w, h, r, ew, eh) {
    ctx.set_source_rgba(bordercolor);
    ctx.set_line_width(bordersize);

    ctx.new_path();
    if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); else ctx.move_to(x, y);
    ctx.line_to(x + r + ew, y); ctx.move_to(x, y + r); ctx.line_to(x, y + r + eh);
    ctx.stroke();

    ctx.new_path();
    if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0); else ctx.move_to(x + w, y);
    ctx.line_to(x + w, y + r + eh); ctx.move_to(x + w - r - ew, y); ctx.line_to(x + w - r, y);
    ctx.stroke();

    ctx.new_path();
    if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); else ctx.move_to(x + w, y + h);
    ctx.line_to(x + w - r - ew, y + h); ctx.move_to(x + w, y + h - r); ctx.line_to(x + w, y + h - r - eh);
    ctx.stroke();

    ctx.new_path();
    if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI); else ctx.move_to(x, y + h);
    ctx.line_to(x, y + h - r - eh); ctx.move_to(x + r + ew, y + h); ctx.line_to(x + r, y + h);
    ctx.stroke();
}

function draw_zone_markers(ctx, x, y, w, h, inset, is_popup) {
    var lineW = bordersize > 0 ? Math.min(bordersize, 1.2) : 1.0;
    ctx.set_line_width(lineW);

    if (touch_output_mode === 1) {
        var zLeft = x + w * 0.28;
        var zRight = x + w * 0.72;

        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.35);
        ctx.move_to(zLeft, y + h * 0.22); ctx.line_to(zLeft, y + h * 0.78);
        ctx.move_to(zRight, y + h * 0.22); ctx.line_to(zRight, y + h * 0.78);
        ctx.stroke();

        ctx.select_font_face(v_font_name, "normal", "bold");
        ctx.set_font_size(Math.max(8, Math.min(11, v_fontsize * 0.85)));
        ctx.set_source_rgba(textcolor[0], textcolor[1], textcolor[2], 0.40);
        ctx.move_to(x + inset + 5, y + h * 0.5 + 3.5); ctx.show_text("‹");
        ctx.move_to(x + w - inset - 12, y + h * 0.5 + 3.5); ctx.show_text("›");
    } else {
        var midX = x + w * 0.5;
        var tickH = is_popup ? Math.max(4, Math.min(10, 6.0 * (h / 36.0))) : 2.0;

        ctx.set_source_rgba(bordercolor[0], bordercolor[1], bordercolor[2], 0.50);
        ctx.move_to(midX, y + inset);
        ctx.line_to(midX, y + inset + tickH);
        ctx.move_to(midX, y + h - inset - tickH);
        ctx.line_to(midX, y + h - inset);
        ctx.stroke();
    }
}

function paint() {
    var sz = mgraphics.size;
    var w = sz[0], h = sz[1];
    var inset = bordersize * 0.5, rw = w - bordersize, rh = h - bordersize;
    var r = Math.max(0, Math.min(corner_radius, rw * 0.5, rh * 0.5));
    var ew = Math.min(border_extension, Math.max(0, (rw - 2 * r) * 0.5));
    var eh = Math.min(border_extension, Math.max(0, (rh - 2 * r) * 0.5));

    mgraphics.set_source_rgba(bgcolor);
    mgraphics.rectangle_rounded(inset, inset, rw, rh, r, r);
    mgraphics.fill();

    if (bordersize > 0) drawCorners(mgraphics, inset, inset, rw, rh, r, ew, eh);

    if (show_markers && v_mode === 0) {
        draw_zone_markers(mgraphics, 0, 0, w, h, inset, false);
    }

    var arrowX = v_allow_popup ? (w - 20) : (w - 14);

    if (v_mode === 1 && v_show_arrow) {
        mgraphics.set_source_rgba(highlight_color);
        mgraphics.new_path();
        mgraphics.move_to(arrowX - 4, h * 0.5 - 2);
        mgraphics.line_to(arrowX + 4, h * 0.5 - 2);
        mgraphics.line_to(arrowX, h * 0.5 + 3);
        mgraphics.close_path();
        mgraphics.fill();
    }

    if (v_mode === 0 && touch_output_mode === 1 && is_staged_pending) {
        mgraphics.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], 0.25);
        mgraphics.rectangle_rounded(inset + 2, inset + 2, rw - 4, rh - 4, Math.max(0, r - 2), Math.max(0, r - 2));
        mgraphics.fill();
    }

    mgraphics.select_font_face(v_font_name);
    mgraphics.set_font_size(v_fontsize);

    if (!menus || menus.length === 0) initDefaultMenus();
    active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));

    var curMenu = menus[active_menu_idx];
    var rawPrefix = (curMenu && curMenu.title) ? curMenu.title : "Mode";
    var itemObj = (curMenu && curMenu.items && curMenu.items[curMenu.selected_idx]) ? curMenu.items[curMenu.selected_idx] : null;
    var rawItem = (itemObj && itemObj.display !== undefined) ? itemObj.display : "Default";

    var formattedPrefix = get_display_label(rawPrefix, false);
    var pfxStr = (formattedPrefix !== "") ? (formattedPrefix + ": ") : "";
    var itemText = rawItem;

    var textStart = (show_markers && v_mode === 0 && touch_output_mode === 1) 
        ? (w * 0.28 + 4) 
        : Math.max(12, r * 0.75 + bordersize);
    var rightLimit = (show_markers && v_mode === 0 && touch_output_mode === 1)
        ? (w * 0.72 - 4)
        : ((v_mode === 1 && v_show_arrow) ? (arrowX - 8) : (w - 16));
    var maxW = Math.max(16, rightLimit - textStart);

    var pfxTm = pfxStr.length > 0 ? mgraphics.text_measure(pfxStr) : [0, 0];
    var pfxW = pfxTm[0];

    var itemMaxW = Math.max(0, maxW - pfxW);
    var dispItem = itemText;

    if (itemMaxW > 0) {
        if (mgraphics.text_measure(dispItem)[0] > itemMaxW) {
            while (dispItem.length > 0 && mgraphics.text_measure(dispItem + "..")[0] > itemMaxW) {
                dispItem = dispItem.slice(0, -1);
            }
            dispItem += "..";
        }
    } else {
        dispItem = "";
    }

    var textY = h * 0.5 + v_fontsize * 0.33;

    if (pfxStr.length > 0) {
        mgraphics.set_source_rgba(mode_color);
        mgraphics.move_to(textStart, textY);
        mgraphics.show_text(pfxStr);
    }

    if (dispItem.length > 0) {
        mgraphics.set_source_rgba(textcolor);
        mgraphics.move_to(textStart + pfxW, textY);
        mgraphics.show_text(dispItem);
    }

    if (v_allow_popup) {
        var dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
        var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
        mgraphics.set_source_rgba(popup_dot_color);
        mgraphics.new_path();
        mgraphics.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
        mgraphics.fill();
    }
}

// =============================================================
// 13. SELECTION CONTROLLER & OUTPUT ENGINE
// =============================================================
function stepLocalItem(dir, fireImmediate) {
    if (!menus || menus.length === 0) return;
    active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));
    var curMenu = menus[active_menu_idx];
    if (!curMenu || !curMenu.items || curMenu.items.length === 0) return;

    curMenu.selected_idx = (curMenu.selected_idx + dir + curMenu.items.length) % curMenu.items.length;

    if (fireImmediate) {
        is_staged_pending = false;
        outputData();
    } else {
        is_staged_pending = true;
    }
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
    if (dropdownWindow.visible) drawDropdownMenu();
}

function commitSelection() {
    is_staged_pending = false;
    outputData();
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
    if (dropdownWindow.visible) drawDropdownMenu();
}

function outputData() {
    if (is_transmitting) return; // Prevent any feedback loop
    is_transmitting = true;

    try {
        if (!menus || menus.length === 0) return;
        active_menu_idx = Math.max(0, Math.min(active_menu_idx, menus.length - 1));
        var curMenu = menus[active_menu_idx];
        if (!curMenu || !curMenu.items) return;

        var itemObj = curMenu.items[curMenu.selected_idx] || null;
        var rawVal = (itemObj && itemObj.raw !== undefined) ? itemObj.raw : "";
        var dispVal = (itemObj && itemObj.display !== undefined) ? itemObj.display : "";

        var outPrefix = get_display_label(curMenu.title || "", false);
        outPrefix = outPrefix.replace(/:+$/, "").trim();

        if (output_type === 1) {
            outlet(0, rawVal);
        } else if (output_type === 2) {
            outlet(0, dispVal);
        } else if (output_type === 3) {
            if (outPrefix !== "") outlet(0, [outPrefix, curMenu.selected_idx]);
            else outlet(0, curMenu.selected_idx);
        } else {
            if (outPrefix !== "") outlet(0, [outPrefix, dispVal]);
            else outlet(0, dispVal);
        }

        outlet(1, curMenu.selected_idx);
        outlet(2, active_menu_idx);
    } finally {
        is_transmitting = false;
    }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
    var sz = mgraphics.size, w = sz[0], h = sz[1];
    var is_right_click = (ctrl === 1);

    if (v_allow_popup) {
        var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
        var dotX = w - dotMargin;
        var dotY = dotMargin;
        var hitR = Math.max(4.0, Math.min(8.0, Math.min(w, h) * 0.20));
        var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));

        if (distToDot <= hitR || is_right_click) {
            if (popupWindow.visible) close_popup();
            else open_popup();
            return;
        }
    }

    if (dropdownWindow.visible || (new Date().getTime() - last_close_time < 250)) {
        closeDropdownMenu();
        return;
    }

    if (v_mode === 1) {
        openDropdownMenu(false);
    } else {
        var zLeft = w * 0.28;
        var zRight = w * 0.72;

        if (touch_output_mode === 1) {
            if (x < zLeft) {
                stepLocalItem(-1, false);
                start_hold_task(-1, false);
            } else if (x > zRight) {
                stepLocalItem(1, false);
                start_hold_task(1, false);
            } else {
                commitSelection();
            }
        } else {
            var dir = (x > w * 0.5) ? 1 : -1;
            stepLocalItem(dir, true);
            start_hold_task(dir, true);
        }
    }
}

function start_hold_task(dir, fireImmediate) {
    is_holding = 1;
    hold_gate_passed = 0;
    click_time = new Date().getTime();
    last_step_time = click_time;
    if (holdTask) { holdTask.cancel(); holdTask = null; }

    holdTask = new Task(function() {
        if (!is_holding) {
            if (holdTask) { holdTask.cancel(); holdTask = null; }
            return;
        }
        var now = new Date().getTime();
        if (hold_gate_passed === 0) {
            if (now - click_time >= 350) {
                hold_gate_passed = 1;
                last_step_time = now;
                stepLocalItem(dir, fireImmediate);
            }
        } else {
            if (now - last_step_time >= hold_speed) {
                last_step_time = now;
                stepLocalItem(dir, fireImmediate);
            }
        }
    }, this);
    holdTask.interval = 15;
    holdTask.repeat();
}

function onmousedown(x, y) {
    dragStartX = x; dragStartY = y; hasDraggedActive = false;
}

function ondrag(x, y, but) {
    if (but === 0) { onmouseup(); return; }
    if (v_mode === 1) return;

    var dx = x - dragStartX, dy = y - dragStartY;
    var thresholdX = 14;
    var thresholdY = 16;

    if (multimenu === 1 && Math.abs(dy) > thresholdY && Math.abs(dy) > Math.abs(dx)) {
        hasDraggedActive = true;
        if (holdTask) { holdTask.cancel(); holdTask = null; }
        var pageDir = (dy > 0) ? 1 : -1;
        switchMenuPage(pageDir);
        dragStartX = x; dragStartY = y;
        return;
    }

    if (Math.abs(dx) > thresholdX) {
        hasDraggedActive = true;
        if (holdTask) { holdTask.cancel(); holdTask = null; }
        var itemDir = (dx > 0) ? 1 : -1;
        stepLocalItem(itemDir, touch_output_mode === 0);
        dragStartX = x; dragStartY = y;
    }
}

function onmouseup() {
    is_holding = 0;
    hold_gate_passed = 0;
    if (holdTask) { holdTask.cancel(); holdTask = null; }
}

function onidleout() { onmouseup(); }

function bang() { outputData(); }

function msg_int(v) { 
    if (inlet === 1) {
        if (multimenu === 1 && v_mode === 1) menu(v);
        return;
    }

    if (menus && menus[active_menu_idx] && menus[active_menu_idx].items) {
        var items = menus[active_menu_idx].items;
        menus[active_menu_idx].selected_idx = Math.max(0, Math.min(items.length - 1, parseInt(v, 10))); 
    }
    commitSelection(); 
}

function msg_float(v) { msg_int(v); }

// =============================================================
// 14. GETTERS, SETTERS & INLET DISPATCH ENGINE
// =============================================================
function get_modes() { return raw_modes_input; }
function set_modes() {
    var args = arrayfromargs(arguments);
    if (args.length === 0) return;

    var parsedTokens = [];
    for (var i = 0; i < args.length; i++) {
        var strAtom = String(args[i]).trim();
        strAtom = strAtom.replace(/^\\*"+|\\*"+$/g, '').trim();
        
        if (strAtom.indexOf(",") !== -1) {
            parsedTokens.push(",");
        } else if (strAtom.indexOf(" ") !== -1) {
            var subWords = parseTokenString(strAtom);
            if (subWords.length > 1) {
                for (var w = 0; w < subWords.length; w++) parsedTokens.push(subWords[w]);
            } else {
                parsedTokens.push(strAtom);
            }
        } else if (strAtom.length > 0) {
            parsedTokens.push(strAtom);
        }
    }

    var reconstructed = [];
    for (var k = 0; k < parsedTokens.length; k++) {
        var tok = parsedTokens[k];
        if (tok === ",") reconstructed.push(",");
        else if (tok.indexOf(" ") !== -1) reconstructed.push('"' + tok + '"');
        else reconstructed.push(tok);
    }

    raw_modes_input = reconstructed.join(" ");
    initDefaultMenus();
    redraw_all();
    if (dropdownWindow.visible) drawDropdownMenu();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_selected() {
    if (menus && menus[active_menu_idx]) return menus[active_menu_idx].selected_idx;
    return 0;
}
function set_selected(v) { msg_int(v); }

function get_mode() { return v_mode; }
function set_mode(v) {
    v_mode = parseInt(v, 10) ? 1 : 0;
    if (v_mode === 0) closeDropdownMenu();
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_multimenu() { return multimenu; }
function set_multimenu(v) {
    multimenu = parseInt(v, 10) ? 1 : 0;
    redraw_all();
    if (dropdownWindow.visible) drawDropdownMenu();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_output_type() { return output_type; }
function set_output_type(v) {
    var p = parseInt(v, 10);
    if (!isNaN(p)) output_type = Math.max(0, Math.min(3, p));
    if (popupWindow.visible) drawSettingsWindow();
}

function get_touch_output() { return touch_output_mode; }
function set_touch_output(v) {
    touch_output_mode = parseInt(v, 10) ? 1 : 0;
    is_staged_pending = false;
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_show_markers() { return show_markers; }
function set_show_markers(v) {
    show_markers = parseInt(v, 10) ? 1 : 0;
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_prefix() { return prefix_text; }
function set_prefix() {
    var args = arrayfromargs(arguments);
    var cleanTokens = [];
    for (var i = 0; i < args.length; i++) {
        var a = String(args[i]).replace(/^\\*"+|\\*"+$/g, '').trim();
        if (a.length > 0) cleanTokens.push(a);
    }
    prefix_text = cleanTokens.join(" ");
    initDefaultMenus();
    redraw_all();
    if (dropdownWindow.visible) drawDropdownMenu();
    if (popupWindow.visible) drawSettingsWindow();
}

function get_label_mode() { return label_mode; }
function set_label_mode(v) {
    var p = parseInt(v, 10);
    if (!isNaN(p)) label_mode = Math.max(0, Math.min(4, p));
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
    if (dropdownWindow.visible) drawDropdownMenu();
}
function set_label_style(v) { set_label_mode(v); }
function get_label_style() { return get_label_mode(); }

function get_case_mode() { return case_mode; }
function set_case_mode(v) {
    var p = parseInt(v, 10);
    if (!isNaN(p)) case_mode = Math.max(0, Math.min(2, p));
    redraw_all();
    if (popupWindow.visible) drawSettingsWindow();
    if (dropdownWindow.visible) drawDropdownMenu();
}
function set_case_style(v) { set_case_mode(v); }
function get_case_style() { return get_case_mode(); }

function get_fontsize() { return v_fontsize; }
function set_fontsize(v) { v_fontsize = Math.max(6, parseInt(v, 10)); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_font_name() { return v_font_name; }
function set_font_name(v) { v_font_name = String(v); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_hold_speed() { return hold_speed; }
function set_hold_speed(v) { hold_speed = Math.max(10.0, parseFloat(v) || 90.0); }

function get_show_arrow() { return v_show_arrow; }
function set_show_arrow(v) { v_show_arrow = parseInt(v, 10) ? 1 : 0; redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_allow_popup() { return v_allow_popup; }
function set_allow_popup(v) { v_allow_popup = parseInt(v, 10) ? 1 : 0; redraw_all(); }

function get_bordersize() { return bordersize; }
function set_bordersize(v) { bordersize = Math.max(0.0, parseFloat(v)); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_corner_radius() { return corner_radius; }
function set_corner_radius(v) { corner_radius = Math.max(0.0, parseFloat(v)); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_border_extension() { return border_extension; }
function set_border_extension(v) { border_extension = Math.max(0.0, parseFloat(v)); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_bgcolor() { return bgcolor; }
function set_bgcolor() { bgcolor = parseColorArgs(arguments, bgcolor); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_textcolor() { return textcolor; }
function set_textcolor() { textcolor = parseColorArgs(arguments, textcolor); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_bordercolor() { return bordercolor; }
function set_bordercolor() { bordercolor = parseColorArgs(arguments, bordercolor); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_highlight_color() { return highlight_color; }
function set_highlight_color() { highlight_color = parseColorArgs(arguments, highlight_color); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_mode_color() { return mode_color; }
function set_mode_color() { mode_color = parseColorArgs(arguments, mode_color); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_popup_dot_color() { return popup_dot_color; }
function set_popup_dot_color() { popup_dot_color = parseColorArgs(arguments, popup_dot_color); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }
function set_dot_color() { set_popup_dot_color.apply(this, arguments); }
function get_dot_color() { return popup_dot_color; }

function get_pop_bgcolor() { return pop_bgcolor; }
function set_pop_bgcolor(v) { pop_bgcolor = parseColorArgs(arguments, pop_bgcolor); redraw_all(); if (popupWindow.visible) drawSettingsWindow(); }

function get_attr_bg_color() { return attr_bg_color; }
function set_attr_bg_color() { attr_bg_color = parseColorArgs(arguments, attr_bg_color); if (popupWindow.visible) drawSettingsWindow(); }

function get_attr_border_color() { return attr_border_color; }
function set_attr_border_color() { attr_border_color = parseColorArgs(arguments, attr_border_color); if (popupWindow.visible) drawSettingsWindow(); }

function get_attr_slider_color() { return attr_slider_color; }
function set_attr_slider_color() { attr_slider_color = parseColorArgs(arguments, attr_slider_color); if (popupWindow.visible) drawSettingsWindow(); }

function get_attr_text_color() { return attr_text_color; }
function set_attr_text_color() { attr_text_color = parseColorArgs(arguments, attr_text_color); if (popupWindow.visible) drawSettingsWindow(); }

function get_show_settings_attrs() { return show_settings_attrs; }
function set_show_settings_attrs(v) { 
    show_settings_attrs = parseInt(v, 10) ? 1 : 0; 
    update_popup_dimensions(); 
}

function get_mask_performance() { return mask_performance; }
function set_mask_performance(v) { mask_performance = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_labels() { return mask_labels; }
function set_mask_labels(v) { mask_labels = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_geometry() { return mask_geometry; }
function set_mask_geometry(v) { mask_geometry = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_colors() { return mask_colors; }
function set_mask_colors(v) { mask_colors = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_popup_colors() { return mask_popup_colors; }
function set_mask_popup_colors(v) { mask_popup_colors = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function set_popup_mini_size(w, h) {
    var pw = parseFloat(w), ph = parseFloat(h);
    if (!isNaN(pw)) popup_mini_w = Math.max(260, Math.min(pw, 420));
    if (!isNaN(ph)) popup_mini_h = Math.max(85, Math.min(ph, 150));
    update_popup_dimensions();
}

function get_popup_mini_size() {
    return [popup_mini_w, popup_mini_h];
}

// Dedicated Ingest Router
function anything() {
    var args = arrayfromargs(arguments);

    // =========================================================
    // INLET 1: DEDICATED FOLDER & MULTIMENU DATA STREAM ONLY
    // =========================================================
    if (inlet === 1) {
        if (messagename === "append") { append.apply(this, args); return; }
        if (messagename === "set") { set.apply(this, args); return; }
        if (messagename === "clear") { clear(); return; }
        if (messagename === "menu" || messagename === "page") { menu(args[0]); return; }
        if (messagename === "folder_menu") { folder_menu.apply(this, args); return; }
        if (messagename === "clear_folders") { clear_folders(); return; }

        var rawName = (args.length > 0) ? (messagename + " " + args.join(" ")) : messagename;
        append(rawName);
        return;
    }

    // =========================================================
    // INLET 0: ADSTATUS, HARDWARE STREAMS, CONTROLS & THEME
    // =========================================================

    // 1. adstatus / hardware stream: 'clear'
    if (messagename === "clear") {
        clear_items_inlet0();
        return;
    }

    // 2. adstatus / hardware stream: 'append <Device Name>'
    if (messagename === "append") {
        append_item_inlet0(args);
        return;
    }

    // 3. adstatus / silent selection: 'set <index>' or 'set <symbol>'
    if (messagename === "set") {
        if (args.length >= 1) {
            set_selected_silent(args[0]);
            return;
        }
    }

    // 4. Global theme updates
    var key = messagename.toLowerCase().replace(/^set_?/, "");

    if (key === "update" || key === "theme_update" || key === "refresh_theme") {
        loadThemeFromDict();
        redraw_all();
        if (dropdownWindow && dropdownWindow.visible) drawDropdownMenu();
        if (popupWindow && popupWindow.visible) drawSettingsWindow();
        return;
    }

    // 5. Aliases & Setter Handlers
    if (key === "bg_color" || key === "bgcolor") { set_bgcolor.apply(this, args); return; }
    if (key === "border_color" || key === "bordercolor") { set_bordercolor.apply(this, args); return; }
    if (key === "text_color" || key === "textcolor" || key === "font_color") { set_textcolor.apply(this, args); return; }
    if (key === "highlight_color" || key === "highlightcolor" || key === "accent_color") { set_highlight_color.apply(this, args); return; }
    if (key === "mode_color" || key === "modecolor") { set_mode_color.apply(this, args); return; }
    if (key === "popup_dot_color" || key === "popupdotcolor" || key === "dot_color" || key === "dotcolor") { set_popup_dot_color.apply(this, args); return; }
    if (key === "pop_bgcolor" || key === "popbgcolor") { set_pop_bgcolor.apply(this, args); return; }
    if (key === "attr_bg_color" || key === "attr_bgcolor") { set_attr_bg_color.apply(this, args); return; }
    if (key === "attr_border_color" || key === "attr_bordercolor") { set_attr_border_color.apply(this, args); return; }
    if (key === "attr_slider_color" || key === "attr_slidercolor") { set_attr_slider_color.apply(this, args); return; }
    if (key === "attr_text_color" || key === "attr_textcolor") { set_attr_text_color.apply(this, args); return; }
    if (key === "show_settings_attrs" || key === "show_attrs" || key === "showattrs") { set_show_settings_attrs.apply(this, args); return; }
    if (key === "border_radius" || key === "corner_radius" || key === "cornerradius") { set_corner_radius.apply(this, args); return; }
    if (key === "border_thickness" || key === "bordersize" || key === "border_size") { set_bordersize.apply(this, args); return; }
    if (key === "border_extension" || key === "borderextension") { set_border_extension.apply(this, args); return; }
    if (key === "touch_output" || key === "touchoutput") { set_touch_output.apply(this, args); return; }
    if (key === "output_type" || key === "outputtype") { set_output_type.apply(this, args); return; }
    if (key === "show_markers" || key === "showmarkers" || key === "markers") { set_show_markers.apply(this, args); return; }
    if (key === "label_mode" || key === "label_style" || key === "labelmode") { set_label_mode.apply(this, args); return; }
    if (key === "case_mode" || key === "case_style" || key === "casemode") { set_case_mode.apply(this, args); return; }

    var setterName = "set_" + key;
    if (typeof this[setterName] === "function") {
        this[setterName].apply(this, args);
    }
}

// =============================================================
// 15. DECLARE ATTRIBUTES
// =============================================================
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Menu"], label: "Interaction Mode", category: "Performance", getter: "get_mode", setter: "set_mode", embed: 1 });
declareattribute("multimenu", { type: "int", style: "onoff", label: "MultiMenu Enabled", category: "Performance", getter: "get_multimenu", setter: "set_multimenu", embed: 1 });
declareattribute("output_type", { type: "int", style: "enumindex", enumvals: ["Prefix + Item", "Raw File (pcontrol)", "Item Name (adstatus)", "Prefix + Index"], label: "Output Type", category: "Performance", getter: "get_output_type", setter: "set_output_type", embed: 1 });
declareattribute("touch_output", { type: "int", style: "enumindex", enumvals: ["Instant (Scrub)", "Staged (Safe for pcontrol)"], label: "Touch Output Mode", category: "Performance", getter: "get_touch_output", setter: "set_touch_output", embed: 1 });
declareattribute("show_markers", { type: "int", style: "onoff", label: "Show Zone Markers", category: "Performance", getter: "get_show_markers", setter: "set_show_markers", embed: 1 });
declareattribute("hold_speed", { type: "float", label: "Touch Hold Speed (ms)", category: "Performance", getter: "get_hold_speed", setter: "set_hold_speed", embed: 1 });
declareattribute("show_arrow", { type: "int", style: "onoff", label: "Show Dropdown Arrow", category: "Performance", getter: "get_show_arrow", setter: "set_show_arrow", embed: 1 });

declareattribute("selected", { type: "int", label: "Selected Index", category: "Menu Config", getter: "get_selected", setter: "set_selected", embed: 1 });
declareattribute("prefix", { label: "Prefix / Category Names", category: "Menu Config", getter: "get_prefix", setter: "set_prefix", embed: 1 });
declareattribute("modes", { label: "Modes List / Items", category: "Menu Config", getter: "get_modes", setter: "set_modes", embed: 1 });
declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Settings Dot", category: "Menu Config", getter: "get_allow_popup", setter: "set_allow_popup", embed: 1 });

declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Prefix Case Style", category: "Labels", getter: "get_case_mode", setter: "set_case_mode", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Prefix Label Style", category: "Labels", getter: "get_label_mode", setter: "set_label_mode", embed: 1 });

declareattribute("corner_radius", { type: "float", label: "Border Radius", category: "Geometry", getter: "get_corner_radius", setter: "set_corner_radius", embed: 1 });
declareattribute("bordersize", { type: "float", label: "Border Thickness", category: "Geometry", getter: "get_bordersize", setter: "set_bordersize", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", category: "Geometry", getter: "get_border_extension", setter: "set_border_extension", embed: 1 });

declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", category: "Typography", getter: "get_font_name", setter: "set_font_name", embed: 1 });
declareattribute("fontsize", { type: "int", label: "Font Size", category: "Typography", getter: "get_fontsize", setter: "set_fontsize", embed: 1 });

declareattribute("bgcolor", { type: "rgba", style: "rgba", label: "Background Color", category: "Button Colors", getter: "get_bgcolor", setter: "set_bgcolor", embed: 1 });
declareattribute("bordercolor", { type: "rgba", style: "rgba", label: "Border Color", category: "Button Colors", getter: "get_bordercolor", setter: "set_bordercolor", embed: 1 });
declareattribute("highlight_color", { type: "rgba", style: "rgba", label: "Highlight Color", category: "Button Colors", getter: "get_highlight_color", setter: "set_highlight_color", embed: 1 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode Prefix Color", category: "Button Colors", getter: "get_mode_color", setter: "set_mode_color", embed: 1 });
declareattribute("textcolor", { type: "rgba", style: "rgba", label: "Text Color", category: "Button Colors", getter: "get_textcolor", setter: "set_textcolor", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", category: "Button Colors", getter: "get_popup_dot_color", setter: "set_popup_dot_color", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", category: "Popup Colors", getter: "get_pop_bgcolor", setter: "set_pop_bgcolor", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", category: "Popup Colors", getter: "get_attr_bg_color", setter: "set_attr_bg_color", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", category: "Popup Colors", getter: "get_attr_border_color", setter: "set_attr_border_color", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", category: "Popup Colors", getter: "get_attr_slider_color", setter: "set_attr_slider_color", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", category: "Popup Colors", getter: "get_attr_text_color", setter: "set_attr_text_color", embed: 1 });

declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", category: "Popup Masks", getter: "get_show_settings_attrs", setter: "set_show_settings_attrs", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", category: "Popup Masks", getter: "get_mask_performance", setter: "set_mask_performance", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", category: "Popup Masks", getter: "get_mask_labels", setter: "set_mask_labels", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", category: "Popup Masks", getter: "get_mask_geometry", setter: "set_mask_geometry", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Button Colors", category: "Popup Masks", getter: "get_mask_colors", setter: "set_mask_colors", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", category: "Popup Masks", getter: "get_mask_popup_colors", setter: "set_mask_popup_colors", embed: 1 });

// =============================================================
// 16. STATE PERSISTENCE
// =============================================================
function save() {
    embedmessage("set_modes", raw_modes_input);
    embedmessage("set_prefix", prefix_text);
    embedmessage("set_mode", v_mode);
    embedmessage("set_multimenu", multimenu);
    embedmessage("set_output_type", output_type);
    embedmessage("set_touch_output", touch_output_mode);
    embedmessage("set_show_markers", show_markers);
    embedmessage("set_show_arrow", v_show_arrow);
    embedmessage("set_allow_popup", v_allow_popup);
    embedmessage("set_hold_speed", hold_speed);
    embedmessage("set_fontsize", v_fontsize);
    embedmessage("set_font_name", v_font_name);

    embedmessage("set_label_mode", label_mode);
    embedmessage("set_case_mode", case_mode);

    embedmessage("set_bordersize", bordersize);
    embedmessage("set_corner_radius", corner_radius);
    embedmessage("set_border_extension", border_extension);

    embedmessage("set_bgcolor", bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    embedmessage("set_textcolor", textcolor[0], textcolor[1], textcolor[2], textcolor[3]);
    embedmessage("set_bordercolor", bordercolor[0], bordercolor[1], bordercolor[2], bordercolor[3]);
    embedmessage("set_highlight_color", highlight_color[0], highlight_color[1], highlight_color[2], highlight_color[3]);
    embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
    embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);
    embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);

    embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
    embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
    embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
    embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

    embedmessage("set_show_settings_attrs", show_settings_attrs);
    embedmessage("set_mask_performance", mask_performance);
    embedmessage("set_mask_labels", mask_labels);
    embedmessage("set_mask_geometry", mask_geometry);
    embedmessage("set_mask_colors", mask_colors);
    embedmessage("set_mask_popup_colors", mask_popup_colors);

    embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);
}

// =============================================================
// 17. CLEANUP & DELETION
// =============================================================
function notifydeleted() {
    if (holdTask) { holdTask.cancel(); holdTask = null; }
    if (streamRefreshTask) { streamRefreshTask.cancel(); streamRefreshTask = null; }
    if (dropdownWatchdog) { dropdownWatchdog.cancel(); dropdownWatchdog = null; }
    stop_pop_holding();
    active_pop_slider = -1;

    try {
        if (bus && bus.subscribers && bus.subscribers[uniqueID]) {
            delete bus.subscribers[uniqueID];
        }
    } catch(e) {}

    try { dropdownListener.subjectname = ""; } catch(e) {}
    try { colorListener.subjectname = ""; } catch(e) {}
    try { popupListener.subjectname = ""; } catch(e) {}

    try { dropdownWindow.visible = 0; } catch(e) {}
    try { colorWindow.visible = 0; } catch(e) {}
    try { popupWindow.visible = 0; } catch(e) {}

    try { if (dropdownWindow) dropdownWindow.free(); } catch(e) {}
    try { if (colorWindow) colorWindow.free(); } catch(e) {}
    try { if (popupWindow) popupWindow.free(); } catch(e) {}

    try { if (dropdownMatrix) dropdownMatrix.freepeer(); } catch(e) {}
    try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}
    try { if (popupMatrix) popupMatrix.freepeer(); } catch(e) {}

    dropdownWindow = null;
    colorWindow = null;
    popupWindow = null;
    dropdownMatrix = null;
    colorMatrix = null;
    popupMatrix = null;
}

initDefaultMenus();
redraw_all();