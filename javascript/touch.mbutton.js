// ============================================================================
// touch.mbutton.js - Max 9 v8ui / jsui
// Multi-Button 1D Strip with 1-Axis Full-Screen Drag Resizing,
// Active Bang Execution, Slash-Delimiter Dual-State Labels ("Off/On"),
// Loop-Safe Re-Entrancy Guard, 3 Outlets:
//   Outlet 0 (Left):   All button states as list [s0 s1 ... sn]
//   Outlet 1 (Middle): Event message [name/index state] for [route]
//   Outlet 2 (Right):  Activity gate / Signum (1 if any on, 0 if all off)
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "Inlet: bang / int / list / [tag state] / set; messages");
setoutletassist(0, "Outlet 0: All button states as list");
setoutletassist(1, "Outlet 1: Event message [name/index state] for [route]");
setoutletassist(2, "Outlet 2: Activity gate / Signum (1 if any on, 0 if all off)");

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. STATE & ARRAY TOPOLOGY (SCALES UP TO 64 BUTTONS)
// =============================================================
var count = 1;             // Default to 1 (scales up to 64)
var direction = 0;         // 0 = Horizontal strip, 1 = Vertical strip
var group_mode = 0;        // 0 = Independent, 1 = Live (exclusive live.tab mode)
var global_mode = 2;       // 0 = Momentary, 1 = Toggle, 2 = Touch-Hold (Default)
var mode_names = ["Momentary", "Toggle", "Touch-Hold"];
var flash_time = 100;      // Milliseconds for momentary flash (mode 0)
var allow_popup = 1;

var states = [0];
var button_modes = [2];    // Default Touch-Hold
var flash_tasks = [null];

// Loop-Safe Re-Entrancy Guard
var is_transmitting = false;

// Dual-State Label Default ("OffText/OnText")
var labels_raw = "Touch/Hold";
var parsed_labels = ["Touch/Hold"];
var label_mode = 0;        // 0 = Full, 1 = No Vowels, 2 = Caps Only, 3 = First Letter, 4 = No Text
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];

var case_mode = 0;         // 0 = First Cap, 1 = All Cap, 2 = All Small
var case_mode_names = ["First Cap", "All Cap", "All Small"];

var font_name = "Arial";
var text_size = 12;
var font_style = 0;        // 0 = Regular, 1 = Bold, 2 = Italic, 3 = Bold Italic
var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];

var current_w = 100;       // Standard single button width
var current_h = 40;        // Standard single button height

// =============================================================
// 2. GEOMETRY & PALETTES
// =============================================================
var border_radius = 4.0;
var border_thickness = 1.2;
var border_extension = 6.0;

// Component Colors
var btn_color_off = [0.12, 0.12, 0.14, 1.0];
var btn_color_on  = [1.00, 0.22, 0.25, 1.0]; // Active Highlight Color
var border_color  = [0.45, 0.45, 0.50, 1.0];
var text_color    = [0.95, 0.95, 0.95, 1.0];
var mode_color    = [0.85, 0.85, 0.90, 1.0];
var popup_dot_color = [1.0, 0.0, 0.0, 1.0];
var text_color_mode = 1; // 0 = Auto Luminance, 1 = Manual / Master

// Popup Attrui UI Colors (Full 5-Color Theme Suite)
var pop_bgcolor       = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

// Standard 5-Tier Popup Visibility Masks
var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var showSettings       = 0;
var popup_window_width = 270;
var popup_mini_w       = 270; // Horizontal default width
var popup_mini_h       = 90;  // Horizontal default height
var start_resize_w     = 270;
var start_resize_h     = 90;
var is_resizing_window = 0;

// =============================================================
// 3. JITTER SUB-WINDOWS & RECYCLING
// =============================================================
var active_cell_pressed = -1;
var popup_active_cell   = -1;
var active_pop_target   = -1;
var active_color_target = "border_color";
var is_mouse_down_anywhere = 0;
var picker_drag_zone    = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

var scrollTask  = null;
var lastMouseX  = 0;
var lastMouseY  = 0;
var start_click_x = 0;
var start_click_y = 0;

var popupWindow = new JitterObject("jit.window", "mbtn_set_" + uniqueID);
popupWindow.floating = 1;
popupWindow.visible = 0;
popupWindow.border = 1;
popupWindow.grow = 0;
popupWindow.title = "Touch Button Settings";

var colorWindow = new JitterObject("jit.window", "mbtn_col_" + uniqueID);
colorWindow.floating = 1;
colorWindow.visible = 0;
colorWindow.border = 1;
colorWindow.grow = 0;
colorWindow.title = "Color Picker";
colorWindow.size = [200, 240];

var outMatrix   = null;
var colorMatrix = new JitterMatrix(4, "char", 200, 240);

var windowListener = null;
var colorListener  = null;

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 246, h: 46 };

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

// =============================================================
// PATTR HOOKS: ONLY TOGGLE BUTTONS SAVE TO PRESETS
// =============================================================
function getvalueof() {
  var saved = [];
  for (var i = 0; i < count; i++) {
    var m = button_modes[i] !== undefined ? button_modes[i] : global_mode;
    saved.push((m === 1) ? (states[i] || 0) : 0);
  }
  return saved;
}

function setvalueof() {
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length === 0) return;

  for (var i = 0; i < count; i++) {
    var m = button_modes[i] !== undefined ? button_modes[i] : global_mode;
    if (m === 1) {
      states[i] = (i < args.length && Number(args[i]) > 0) ? 1 : 0;
    } else {
      states[i] = 0;
    }
  }

  redraw_all();
  output_state();
}

// =============================================================
// 4. MATH, UTILITIES & HSV ENGINES
// =============================================================
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function rgbToHsv(r, g, b) {
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var d = max - min;
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
  var r, g, b;
  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = v; b = t; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [r, g, b];
}

function rgba_values(args, fallback) {
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

function get_font_weight() {
  return (font_style === 1 || font_style === 3) ? "bold" : "normal";
}

function get_font_slant() {
  return (font_style === 2 || font_style === 3) ? "italic" : "normal";
}

function get_dimensions() {
  var sz = mgraphics.size;
  if (sz && sz[0] > 0 && sz[1] > 0) {
    current_w = sz[0];
    current_h = sz[1];
    return { w: current_w, h: current_h };
  }
  if (this.box && this.box.rect) {
    var r = this.box.rect;
    current_w = Math.max(10, r[2] - r[0]);
    current_h = Math.max(10, r[3] - r[1]);
  }
  return { w: current_w, h: current_h };
}

function onresize(w, h) {
  if (w > 0 && h > 0) {
    current_w = w;
    current_h = h;
  }
  mgraphics.redraw();
}
onresize.local = 1;

function stop_scrolling() {
  if (scrollTask) {
    scrollTask.cancel();
    scrollTask = null;
  }
}

function redraw_all() {
  mgraphics.redraw();
  if (typeof notifyclients === "function") {
    notifyclients();
  }
  if (showSettings) draw_popup_to_window();
}

// =============================================================
// 5. ARRAY MANAGEMENT, ROUTE TAGS & AUTOPADDING
// =============================================================
function parse_tokens(str) {
  if (!str || typeof str !== "string") return [];
  var s = str.trim();
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

function sync_arrays() {
  var oldStates = states.slice(0);
  states = [];
  var newModes = [];

  for (var i = 0; i < count; i++) {
    states.push(i < oldStates.length ? oldStates[i] : 0);
    newModes.push(i < button_modes.length ? button_modes[i] : global_mode);
  }
  button_modes = newModes;

  for (var k = 0; k < flash_tasks.length; k++) {
    if (flash_tasks[k]) {
      try { flash_tasks[k].cancel(); } catch (e) {}
    }
  }
  flash_tasks = [];
  for (var m = 0; m < count; m++) flash_tasks.push(null);

  var rawTokens = parse_tokens(labels_raw);
  parsed_labels = [];
  for (var j = 0; j < count; j++) {
    if (j < rawTokens.length) {
      parsed_labels.push(rawTokens[j]);
    } else {
      parsed_labels.push("<empty>");
    }
  }
}

function get_button_tag(idx) {
  if (idx < 0 || idx >= count) return idx;
  var rawToken = parsed_labels[idx];
  if (!rawToken || rawToken === "<empty>") {
    return idx;
  }
  if (rawToken.indexOf("/") !== -1) {
    var parts = rawToken.split("/");
    rawToken = parts[0].trim();
  }
  var num = Number(rawToken);
  if (!isNaN(num) && rawToken !== "") {
    return num;
  }
  return rawToken;
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

function get_effective_cell_text_color(cellIdx) {
  if (text_color_mode === 1) return text_color;
  var curBg = states[cellIdx] ? btn_color_on : btn_color_off;
  var lum = 0.2126 * curBg[0] + 0.7152 * curBg[1] + 0.0722 * curBg[2];
  return (lum < 0.5) ? [0.92, 0.94, 0.98, 1.0] : [0.10, 0.12, 0.15, 1.0];
}

// =============================================================
// 6. OUTPUT ENGINE: LIST (0) -> ROUTE (1) -> SIGNUM (2)
// =============================================================
function output_state(changed_index) {
  if (is_transmitting) return;
  is_transmitting = true;

  try {
    // Outlet 2 (Right): Signum / Activity Gate (1 if any on, 0 if all off)
    var anyActive = 0;
    for (var i = 0; i < count; i++) {
      if (states[i] > 0) {
        anyActive = 1;
        break;
      }
    }
    outlet(2, anyActive);

    // Outlet 1 (Middle): Name + Value [tag state] for [route]
    if (changed_index !== undefined && changed_index >= 0 && changed_index < count) {
      var tag = get_button_tag(changed_index);
      outlet(1, [tag, states[changed_index]]);
    } else {
      for (var b = 0; b < count; b++) {
        var t = get_button_tag(b);
        outlet(1, [t, states[b]]);
      }
    }

    // Outlet 0 (Left): All states as list [0 1 0 ...]
    var full_list = [];
    for (var s = 0; s < count; s++) {
      full_list.push(states[s] > 0 ? 1 : 0);
    }
    outlet(0, full_list);
  } finally {
    is_transmitting = false;
  }
}

function trigger_flash(cellIdx, silent) {
  states[cellIdx] = 1;
  redraw_all();
  if (!silent) output_state(cellIdx);

  if (flash_tasks[cellIdx]) {
    try { flash_tasks[cellIdx].cancel(); } catch (e) {}
  }
  var tsk = new Task(function () {
    states[cellIdx] = 0;
    redraw_all();
    if (!silent) output_state(cellIdx);
  }, this);
  tsk.schedule(flash_time);
  flash_tasks[cellIdx] = tsk;
}

function handle_cell_press(cellIdx) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;

  if (cellMode === 0) {
    if (group_mode === 1) {
      for (var k = 0; k < count; k++) {
        if (k !== cellIdx && states[k] !== 0) {
          states[k] = 0;
          output_state(k);
        }
      }
    }
    trigger_flash(cellIdx, false);
    return;
  }

  if (cellMode === 1) {
    if (group_mode === 1) {
      if (states[cellIdx] === 1) return;
      for (var j = 0; j < count; j++) {
        if (j !== cellIdx && states[j] !== 0) {
          states[j] = 0;
          output_state(j);
        }
      }
      states[cellIdx] = 1;
    } else {
      states[cellIdx] = states[cellIdx] ? 0 : 1;
    }
    redraw_all();
    output_state(cellIdx);
    return;
  }

  if (cellMode === 2) {
    if (group_mode === 1) {
      for (var m = 0; m < count; m++) {
        if (m !== cellIdx && states[m] !== 0) {
          states[m] = 0;
          output_state(m);
        }
      }
    }
    if (states[cellIdx] === 1) return;
    states[cellIdx] = 1;
    redraw_all();
    output_state(cellIdx);
  }
}

function handle_cell_release(cellIdx) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;
  if (cellMode === 2) {
    if (states[cellIdx] !== 0) {
      states[cellIdx] = 0;
      redraw_all();
      output_state(cellIdx);
    }
  }
}

function set_button_state_direct(cellIdx, val, silent) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;

  if (val === "bang" || val === "trigger") {
    handle_cell_press(cellIdx);
    if (cellMode === 2) handle_cell_release(cellIdx);
    return;
  }

  var numVal = parseInt(val, 10);
  if (isNaN(numVal)) return;

  var targetState = numVal > 0 ? 1 : 0;

  if (cellMode === 0) {
    if (targetState === 1) trigger_flash(cellIdx, silent);
    return;
  }

  if (group_mode === 0 && states[cellIdx] === targetState) {
    return;
  }

  if (group_mode === 1) {
    if (targetState === 1) {
      if (states[cellIdx] === 1) return;
      for (var j = 0; j < count; j++) {
        if (j !== cellIdx && states[j] !== 0) {
          states[j] = 0;
          if (!silent) output_state(j);
        }
      }
      states[cellIdx] = 1;
    } else {
      if (states[cellIdx] === 0) return;
      states[cellIdx] = 0;
    }
  } else {
    states[cellIdx] = targetState;
  }

  redraw_all();
  if (!silent) output_state(cellIdx);
}

// =============================================================
// 7. INLET MESSAGE PARSER
// =============================================================
function bang() {
  var targetIdx = 0;
  var cellMode = button_modes[targetIdx] !== undefined ? button_modes[targetIdx] : global_mode;

  if (cellMode === 1) {
    handle_cell_press(targetIdx);
  } else if (cellMode === 0) {
    trigger_flash(targetIdx, false);
  } else if (cellMode === 2) {
    handle_cell_press(targetIdx);
    if (flash_tasks[targetIdx]) {
      try { flash_tasks[targetIdx].cancel(); } catch (e) {}
    }
    var tsk = new Task(function () {
      handle_cell_release(targetIdx);
    }, this);
    tsk.schedule(Math.max(50, flash_time));
    flash_tasks[targetIdx] = tsk;
  }
}

function dump() {
  output_state();
}

function msg_int(v) {
  var val = parseInt(v, 10);
  if (isNaN(val)) return;

  if (count === 1) {
    set_button_state_direct(0, val, false);
  } else {
    if (val >= 0 && val < count) {
      handle_cell_press(val);
      if (button_modes[val] === 2) handle_cell_release(val);
    }
  }
}

function list() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length === 2 && typeof args[0] === "number" && args[0] >= 0 && args[0] < count) {
    set_button_state_direct(Math.floor(args[0]), args[1], false);
    return;
  }

  var hasChange = false;
  if (group_mode === 1) {
    var activeFound = -1;
    for (var k = 0; k < count && k < args.length; k++) {
      if (Number(args[k]) > 0) { activeFound = k; break; }
    }
    for (var m = 0; m < count; m++) {
      var nextSt = (m === activeFound) ? 1 : 0;
      if (states[m] !== nextSt) { states[m] = nextSt; hasChange = true; }
    }
  } else {
    for (var i = 0; i < count && i < args.length; i++) {
      var st = Number(args[i]) > 0 ? 1 : 0;
      if (states[i] !== st) {
        states[i] = st;
        hasChange = true;
      }
    }
  }

  if (hasChange) {
    redraw_all();
    output_state();
  }
}

function set() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  if (args.length === 2 && typeof args[0] === "number" && args[0] >= 0 && args[0] < count) {
    set_button_state_direct(Math.floor(args[0]), args[1], true);
    return;
  }

  for (var i = 0; i < count && i < args.length; i++) {
    states[i] = Number(args[i]) > 0 ? 1 : 0;
  }
  redraw_all();
}

function clear() {
  var hadActive = false;
  for (var i = 0; i < count; i++) {
    if (states[i] !== 0) hadActive = true;
    states[i] = 0;
  }
  if (hadActive) {
    redraw_all();
    output_state();
  }
}

// =============================================================
// 8. DRAW ENGINE
// =============================================================
function draw_common_path(ctx, x, y, w, h, r) {
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  } else {
    ctx.rectangle(x, y, w, h);
  }
  ctx.close_path();
}

function draw_corners(ctx, x, y, w, h, r, extW, extH, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  else ctx.move_to(x, y);
  ctx.line_to(x + r + extW, y);
  ctx.move_to(x, y + r);
  ctx.line_to(x, y + r + extH);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + extH);
  ctx.move_to(x + w - r - extW, y);
  ctx.line_to(x + w - r, y);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - extW, y + h);
  ctx.move_to(x + w, y + h - r);
  ctx.line_to(x + w, y + h - r - extH);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - extH);
  ctx.move_to(x + r + extW, y + h);
  ctx.line_to(x + r, y + h);
  ctx.stroke();
}

function get_cell_bounds(idx, w, h, inset, dir) {
  var d = (dir !== undefined) ? dir : direction;
  var rw = Math.max(1, w - inset * 2);
  var rh = Math.max(1, h - inset * 2);
  if (d === 0) {
    var cellW = rw / count;
    return { x: inset + idx * cellW, y: inset, w: cellW, h: rh };
  } else {
    var cellH = rh / count;
    return { x: inset, y: inset + idx * cellH, w: rw, h: cellH };
  }
}

function draw_cell_fill(ctx, cb, i, totalCount, dir, rad, col) {
  ctx.set_source_rgba(col);
  var r = Math.min(rad, cb.w * 0.5, cb.h * 0.5);

  if (r <= 0 || totalCount <= 1) {
    if (totalCount <= 1 && r > 0) {
      draw_common_path(ctx, cb.x, cb.y, cb.w, cb.h, r);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
    ctx.fill();
    return;
  }

  ctx.new_path();
  if (dir === 0) {
    if (i === 0) {
      ctx.move_to(cb.x + cb.w, cb.y);
      ctx.line_to(cb.x + cb.w, cb.y + cb.h);
      ctx.arc(cb.x + r, cb.y + cb.h - r, r, Math.PI / 2, Math.PI);
      ctx.arc(cb.x + r, cb.y + r, r, Math.PI, Math.PI * 1.5);
    } else if (i === totalCount - 1) {
      ctx.move_to(cb.x, cb.y + cb.h);
      ctx.line_to(cb.x, cb.y);
      ctx.arc(cb.x + cb.w - r, cb.y + r, r, -Math.PI / 2, 0);
      ctx.arc(cb.x + cb.w - r, cb.y + cb.h - r, r, 0, Math.PI / 2);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
  } else {
    if (i === 0) {
      ctx.move_to(cb.x + cb.w, cb.y + cb.h);
      ctx.line_to(cb.x, cb.y + cb.h);
      ctx.arc(cb.x + r, cb.y + r, r, Math.PI, Math.PI * 1.5);
      ctx.arc(cb.x + cb.w - r, cb.y + r, r, -Math.PI / 2, 0);
    } else if (i === totalCount - 1) {
      ctx.move_to(cb.x, cb.y);
      ctx.line_to(cb.x + cb.w, cb.y);
      ctx.arc(cb.x + cb.w - r, cb.y + cb.h - r, r, 0, Math.PI / 2);
      ctx.arc(cb.x + r, cb.y + cb.h - r, r, Math.PI / 2, Math.PI);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
  }
  ctx.close_path();
  ctx.fill();
}

function draw_mbutton_strip(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 4.0 : border_radius;
  var r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  // 1. Chassis Body Fill
  ctx.set_source_rgba(btn_color_off);
  draw_common_path(ctx, inset, inset, rw, rh, r);
  ctx.fill();

  // 2. Individual Active Cell Highlight Fills
  for (var i = 0; i < count; i++) {
    if (states[i] > 0) {
      var cb = get_cell_bounds(i, w, h, inset, direction);
      draw_cell_fill(ctx, cb, i, count, direction, r, btn_color_on);
    }
  }

  // 3. Hairline Cell Dividers
  if (count > 1) {
    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    ctx.set_line_width(1.0);

    for (var d = 1; d < count; d++) {
      if (direction === 0) {
        var divX = inset + d * (rw / count);
        ctx.move_to(divX, inset);
        ctx.line_to(divX, inset + rh);
      } else {
        var divY = inset + d * (rh / count);
        ctx.move_to(inset, divY);
        ctx.line_to(inset + rw, divY);
      }
      ctx.stroke();
    }
  }

  // 4. Corner Reticle Brackets
  if (b > 0) {
    draw_corners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  // 5. Button Typography
  var scaleRatio = is_preview ? Math.max(0.8, Math.min(1.4, h / 36.0)) : 1.0;
  var curFontSize = is_preview ? Math.max(8, Math.min(14, Math.round(11 * scaleRatio))) : text_size;
  ctx.select_font_face(font_name, get_font_slant(), get_font_weight());
  ctx.set_font_size(curFontSize);

  var fe = ctx.font_extents();
  var fontAscent = fe["0"] || fe.ascent || curFontSize;

  for (var j = 0; j < count; j++) {
    var cb2 = get_cell_bounds(j, w, h, inset, direction);
    var rawToken = parsed_labels[j] !== undefined ? parsed_labels[j] : ("" + (j + 1));
    var isEmpty = (rawToken === "<empty>");
    var cellState = states[j] > 0 ? 1 : 0;

    var rawTxt = rawToken;
    if (rawToken.indexOf("/") !== -1) {
      var slashParts = rawToken.split("/");
      rawTxt = cellState ? slashParts[1] : slashParts[0];
    }

    var dispTxt = get_display_label(rawTxt, is_preview);

    if (dispTxt && dispTxt.length > 0) {
      var tm = ctx.text_measure(dispTxt);
      var tw = tm ? tm[0] : curFontSize * 0.6 * dispTxt.length;
      var textX = cb2.x + (cb2.w - tw) * 0.5;
      var textY = cb2.y + cb2.h * 0.5 + fontAscent * 0.33;

      var txtCol = get_effective_cell_text_color(j);
      if (isEmpty) {
        ctx.set_source_rgba(txtCol[0], txtCol[1], txtCol[2], 0.35);
      } else {
        ctx.set_source_rgba(txtCol);
      }
      ctx.move_to(textX, textY);
      ctx.show_text(dispTxt);
    }
  }

  // 6. Red Popup Launcher Dot
  if (!is_preview && allow_popup === 1) {
    var dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  var dims = get_dimensions();
  draw_mbutton_strip(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 9. MAIN CANVAS MOUSE ENGINE
// =============================================================
function get_hit_cell(x, y, w, h, dir) {
  var d = (dir !== undefined) ? dir : direction;
  var b = border_thickness * 0.5;
  var rw = Math.max(1, w - b * 2);
  var rh = Math.max(1, h - b * 2);
  if (d === 0) {
    var cellW = rw / count;
    var idxX = Math.floor((x - b) / cellW);
    return clamp(idxX, 0, count - 1);
  } else {
    var cellH = rh / count;
    var idxY = Math.floor((y - b) / cellH);
    return clamp(idxY, 0, count - 1);
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  var w = dims.w, h = dims.h;
  var is_right_click = (ctrl === 1);

  if (allow_popup === 1) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var dotX = w - dotMargin;
    var dotY = dotMargin;
    var hitR = Math.max(4.0, Math.min(8.0, Math.min(w, h) * 0.20));

    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= hitR || is_right_click) {
      popup();
      return;
    }
  }

  if (button === 0) {
    onmouseup();
    return;
  }

  var hit = get_hit_cell(x, y, w, h, direction);
  active_cell_pressed = hit;
  handle_cell_press(hit);
}

function ondrag(x, y, button) {
  if (button === 0) onmouseup();
}

function onmouseup() {
  if (active_cell_pressed !== -1) {
    handle_cell_release(active_cell_pressed);
    active_cell_pressed = -1;
  }
}

function onidleout() {
  onmouseup();
}

function onidle() {
  if (active_cell_pressed !== -1) onmouseup();
}

// =============================================================
// 10. 5-TIER POPUP WINDOW
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  // Tier 1: Performance
  if (mask_performance === 1) {
    list.push({ name: "Button Count", val: count, pct: (count - 1) / 63.0, is_slider: true, target_id: 101 });
    list.push({ name: "Orientation", val: direction === 1 ? "Vertical" : "Horizontal", is_toggle: true, target_id: 102 });
    list.push({ name: "Group Mode", val: group_mode === 1 ? "Live" : "Independent", is_toggle: true, target_id: 103 });
    list.push({ name: "Set All Modes", val: mode_names[global_mode], is_toggle: true, target_id: 104 });
    list.push({ name: "Flash Time", val: flash_time + "ms", pct: (flash_time - 1) / 999.0, is_slider: true, target_id: 105 });
  }

  // Tier 2: Labels
  if (mask_labels === 1) {
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 201 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 203 });
  }

  // Tier 3: Geometry
  if (mask_geometry === 1) {
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 301 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 302 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 303 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 6) / 36.0, is_slider: true, target_id: 304 });
  }

  // Tier 4: Button Colors
  if (mask_colors === 1) {
    list.push({ name: "Text Auto/Man", val: text_color_mode === 0 ? "Auto" : "Manual", is_toggle: true, target_id: 401 });
    list.push({ name: "Btn Color Off", val: btn_color_off, is_color: true, key: "btn_color_off" });
    list.push({ name: "Highlight (On)", val: btn_color_on, is_color: true, key: "btn_color_on" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
  }

  // Tier 5: Popup Colors
  if (mask_popup_colors === 1) {
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_preview_height(has_rows) {
  if (!has_rows) return Math.max(42, popup_mini_h - 28 - 14);
  if (direction === 1) {
    return Math.max(85, Math.min(220, count * 26 + 10));
  }
  return 46;
}

function get_popup_dimensions_map() {
  var rows = get_visible_rows_map();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  var prevH = get_preview_height(true);
  var calculated_h = 28 + prevH + 12 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_popup_dimensions_map();
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Touch Button Settings";
    popupWindow.visible = 1;
    popupWindow.front();
    draw_popup_to_window();
  } else {
    popupWindow.visible = 0;
  }
}

function draw_popup_to_window() {
  if (!showSettings || allow_popup !== 1) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_popup_to_window_deferred() {
  if (!showSettings || allow_popup !== 1) return;
  var dims = get_popup_dimensions_map();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  popupWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  // Close Dot & Label
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Toggle Hide/Show Button Pill
  var tglW = 44, tglH = 16;
  var tglX = w - tglW - 12, tglY = 6;
  var tglR = Math.max(2, Math.min(6, border_radius * 0.3));

  pCtx.set_source_rgba(attr_bg_color);
  pCtx.rectangle_rounded(tglX, tglY, tglW, tglH, tglR, tglR);
  pCtx.fill();

  if (border_thickness > 0) {
    pCtx.set_source_rgba(attr_border_color);
    pCtx.set_line_width(Math.min(border_thickness, 1.0));
    pCtx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, tglR, tglR);
    pCtx.stroke();
  }

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = pCtx.text_measure(tglLabel);
  var tglTextX = tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5;
  pCtx.move_to(tglTextX, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // ADAPTIVE PREVIEW CHASSIS
  var prevX = 12, prevY = 28;
  var prevW = Math.max(40, w - 24);
  var prevH = get_preview_height(has_rows);

  var stripW = (direction === 1 && has_rows) ? Math.max(80, Math.min(130, prevW * 0.45)) : prevW;
  var stripX = prevX + (prevW - stripW) * 0.5;

  cached_preview_rect = { x: stripX, y: prevY, w: stripW, h: prevH };

  pCtx.save();
  pCtx.translate(stripX, prevY);
  draw_mbutton_strip(pCtx, stripW, prevH, true);
  pCtx.restore();

  // Directional 1-Axis Pull Grips (Mini mode only)
  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    if (direction === 0) {
      pCtx.move_to(w - 6, h - 14); pCtx.line_to(w - 6, h - 4);
      pCtx.move_to(w - 10, h - 14); pCtx.line_to(w - 10, h - 4);
    } else {
      pCtx.move_to(w - 14, h - 6); pCtx.line_to(w - 4, h - 6);
      pCtx.move_to(w - 14, h - 10); pCtx.line_to(w - 4, h - 10);
    }
    pCtx.stroke();
  }

  // 50/50 ATTRIBUTE ROWS STACKED VERTICALLY
  if (has_rows) {
    var divY = prevY + prevH + 8;
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    var sY = divY + 8;
    var rowX = 12, rowW = w - 24;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], rY = sY + i * 28;

      pCtx.set_source_rgba(attr_bg_color);
      pCtx.rectangle(rowX, rY, rowW, 26);
      pCtx.fill();

      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      var vY = rY + 4, vH = 18;

      if (r.is_color) {
        pCtx.set_source_rgba(r.val);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        var fillW = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
        pCtx.set_source_rgba(attr_slider_color);
        pCtx.rectangle(valBoxX, vY, fillW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, fillW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        pCtx.move_to(valBoxX + 6, rY + 17);
        pCtx.show_text(String(r.val));
      } else {
        pCtx.set_source_rgba(0.14, 0.14, 0.17, 0.70);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(0.75);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        var vTm = pCtx.text_measure(String(r.val));
        var vStrW = vTm ? vTm[0] : 20;
        pCtx.move_to(valBoxX + Math.max(6, (valBoxW - vStrW) * 0.5), rY + 17);
        pCtx.show_text(String(r.val));
      }
    }
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

// =============================================================
// 11. 1-AXIS FULL-SCREEN MINI DRAG SIZING
// =============================================================
function apply_slider_target(target_id, targetPct) {
  if (target_id === 101) set_count(Math.round(1 + targetPct * 63));
  else if (target_id === 105) set_flash_time(Math.round(1 + targetPct * 999));
  else if (target_id === 301) set_border_radius(targetPct * 25.0);
  else if (target_id === 302) set_border_thickness(targetPct * 10.0);
  else if (target_id === 303) set_border_extension(targetPct * 50.0);
  else if (target_id === 304) set_text_size(Math.round(6 + targetPct * 36));
  redraw_all();
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) update_popup_dimensions();
  else {
    popupWindow.visible = 0;
    colorWindow.visible = 0;
  }
  mgraphics.redraw();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = mbut === 1 && is_mouse_down_anywhere === 0;
    is_mouse_down_anywhere = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    var dims = get_popup_dimensions_map();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    if (mbut === 0) {
      is_resizing_window = 0;
      if (popup_active_cell !== -1) {
        handle_cell_release(popup_active_cell);
        popup_active_cell = -1;
      }
      active_pop_target = -1;
      stop_scrolling();
      return;
    }

    // 1-AXIS FULL-SCREEN MINI DRAG
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;

      if (direction === 0) {
        popup_mini_w = Math.max(160, Math.min(start_resize_w + deltaW, 3840));
        popup_mini_h = 90;
      } else {
        popup_mini_w = 130;
        popup_mini_h = Math.max(140, Math.min(start_resize_h + deltaH, 2160));
      }
      update_popup_dimensions();
      return;
    }

    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx;
      start_click_y = my;
      start_resize_w = w;
      start_resize_h = h;
      return;
    }

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0;
      colorWindow.visible = 0;
      stop_scrolling();
      mgraphics.redraw();
      return;
    }

    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // Interactive Preview Click
    var prevMaxY = pr.y + pr.h;
    if (mbut && my >= pr.y && my <= prevMaxY && mx >= pr.x && mx <= pr.x + pr.w && active_pop_target === -1) {
      var localX = mx - pr.x;
      var localY = my - pr.y;
      var hitCell = get_hit_cell(localX, localY, pr.w, pr.h, direction);
      if (is_pop_tap) {
        popup_active_cell = hitCell;
        handle_cell_press(hitCell);
      }
      return;
    }

    if (!has_rows) return;

    var sY = pr.y + pr.h + 16;
    var rowW = w - 24;
    var midX = 12 + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    var rIdx = Math.floor((my - sY) / 28);
    if (rIdx >= 0 && rIdx < rows.length) {
      var r = rows[rIdx];
      var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

      if (r.is_slider || r.pct !== undefined) {
        active_pop_target = r.target_id;
        apply_slider_target(r.target_id, pct);

        stop_scrolling();
        scrollTask = new Task(function () {
          if (active_pop_target === -1) return;
          var targetPct = clamp((lastMouseX - valBoxX) / valBoxW, 0, 1);
          apply_slider_target(active_pop_target, targetPct);
        }, this);
        scrollTask.interval = 15;
        scrollTask.repeat();
      } else if (is_pop_tap) {
        if (r.target_id === 102) set_direction(direction ? 0 : 1);
        else if (r.target_id === 103) set_group_mode(group_mode ? 0 : 1);
        else if (r.target_id === 104) set_all_modes((global_mode + 1) % 3);
        else if (r.target_id === 201) set_label_mode((label_mode + 1) % 5);
        else if (r.target_id === 202) set_case_mode((case_mode + 1) % 3);
        else if (r.target_id === 203) set_font_style((font_style + 1) % 4);
        else if (r.target_id === 401) set_text_color_mode(text_color_mode === 0 ? 1 : 0);
        else if (r.is_color) {
          active_color_target = r.key;
          initPickerFromTarget();
          if (popupWindow && popupWindow.pos) {
            colorWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + sY + rIdx * 28 + 14];
          }
          colorWindow.visible = 1;
          colorWindow.front();
          draw_color_picker_popup();
        }
      }
      draw_popup_to_window();
    }
  }
}

// =============================================================
// 12. SUB-WINDOW: MODERN HSV COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "btn_color_off" || name === "bg_color") return btn_color_off;
  if (name === "btn_color_on" || name === "highlight_color") return btn_color_on;
  if (name === "border_color") return border_color;
  if (name === "text_color") return text_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

function get_color_target_label(name) {
  if (name === "btn_color_off") return "Btn Color Off";
  if (name === "btn_color_on") return "Highlight (On)";
  if (name === "border_color") return "Border Color";
  if (name === "text_color") return "Text Color";
  if (name === "popup_dot_color") return "Popup Dot";
  if (name === "pop_bgcolor") return "Popup BG";
  if (name === "attr_bg_color") return "Attr BG";
  if (name === "attr_border_color") return "Attr Border";
  if (name === "attr_slider_color") return "Attr Slider";
  if (name === "attr_text_color") return "Attr Text";
  return "Color Picker";
}

function initPickerFromTarget() {
  var arr = get_color_target(active_color_target) || [1, 1, 1, 1];
  var hsv = rgbToHsv(arr[0], arr[1], arr[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2];
  cur_a = (arr[3] !== undefined ? arr[3] : 1.0);
}

function applyPickerToTarget() {
  var rgb = hsvToRgb(cur_h, cur_s, cur_v);
  var arr = get_color_target(active_color_target);
  if (arr) {
    arr[0] = rgb[0]; arr[1] = rgb[1]; arr[2] = rgb[2]; arr[3] = cur_a;
  }
  redraw_all();
}

function draw_color_picker_popup() {
  var winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 6.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
  ctx.move_to(28, 17);
  ctx.show_text(get_color_target_label(active_color_target));

  var hueX = 10, hueY = 28, hueW = 180, hueH = 16;
  var huePat = ctx.pattern_create_linear(hueX, 0, hueX + hueW, 0);
  huePat.add_color_stop_rgba(0.00, 1.0, 0.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.17, 1.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.33, 0.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.50, 0.0, 1.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.67, 0.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.83, 1.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(1.00, 1.0, 0.0, 0.0, 1.0);
  ctx.set_source(huePat);
  ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3);
  ctx.fill();

  var hIndX = hueX + cur_h * hueW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var svX = 10, svY = 50, svW = 180, svH = 115;
  var pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1.0, 1.0, 1.0, 1.0);
  satPat.add_color_stop_rgba(1.0, 1.0, 1.0, 1.0, 0.0);
  ctx.set_source(satPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0.0, 0.0, 0.0, 0.0);
  valPat.add_color_stop_rgba(1.0, 0.0, 0.0, 0.0, 1.0);
  ctx.set_source(valPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var svIndX = svX + cur_s * svW;
  var svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var opX = 10, opY = 172, opW = 180, opH = 16;
  ctx.set_source_rgba(0.2, 0.2, 0.22, 1.0);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();
  var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  var opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
  opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(opPat);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();

  var opIndX = opX + cur_a * opW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(cur_v > 0.5 ? [0, 0, 0, 0.8] : [1, 1, 1, 0.9]);
  ctx.move_to(swX + 8, swY + 21);
  ctx.show_text("Opacity: " + Math.round(cur_a * 100) + "%");

  var img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  colorWindow.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
  if (event.eventname === "close") { showColorWindow = 0; picker_drag_zone = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { picker_drag_zone = 0; return; }

    if (mbut) {
      if (mx < 24 && my < 24) {
        colorWindow.visible = 0; picker_drag_zone = 0; redraw_all(); return;
      }
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

// =============================================================
// 13. ATTRIBUTES GETTERS & SETTERS
// =============================================================
function set_count(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    count = clamp(p, 1, 64);
    if (count === 1 && labels_raw === "1 2 3 4") {
      labels_raw = "Touch/Hold";
    }
    sync_arrays();
    update_popup_dimensions();
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_count() { return count; }

function set_direction(v) {
  if (typeof v === "string") {
    direction = (v.toLowerCase().indexOf("vert") !== -1 || v === "1") ? 1 : 0;
  } else {
    direction = parseInt(v, 10) ? 1 : 0;
  }

  if (direction === 0) {
    popup_mini_h = 90;
    popup_mini_w = Math.max(200, popup_mini_w);
  } else {
    popup_mini_w = 130;
    popup_mini_h = Math.max(180, popup_mini_h);
  }

  update_popup_dimensions();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_direction() { return direction; }

function set_group_mode(v) {
  if (typeof v === "string") {
    group_mode = (v.toLowerCase().indexOf("live") !== -1 || v === "1") ? 1 : 0;
  } else {
    group_mode = parseInt(v, 10) ? 1 : 0;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_group_mode() { return group_mode; }

function set_all_modes(v) {
  var m = clamp(parseInt(v, 10) || 0, 0, 2);
  global_mode = m;
  for (var i = 0; i < count; i++) {
    button_modes[i] = m;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_all_modes() { return global_mode; }

function set_flash_time(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    flash_time = clamp(p, 1, 1000);
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_flash_time() { return flash_time; }

function set_modes() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;
  
  var tokens = [];
  for (var a = 0; a < args.length; a++) {
    var str = String(args[a]).trim();
    var parts = str.split(/\s+/);
    for (var p = 0; p < parts.length; p++) {
      if (parts[p].length > 0) tokens.push(parts[p]);
    }
  }

  button_modes = [];
  for (var i = 0; i < count; i++) {
    if (i < tokens.length) {
      button_modes.push(clamp(parseInt(tokens[i], 10) || 0, 0, 2));
    } else {
      button_modes.push(global_mode);
    }
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_modes() { return button_modes.slice(0, count).join(" "); }
function set_button_modes() { set_modes.apply(this, arguments); }
function get_button_modes() { return get_modes(); }

function set_labels() {
  var args = arrayfromargs(arguments);
  labels_raw = args.join(" ");
  sync_arrays();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_labels() { return labels_raw; }

function set_label_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    label_mode = clamp(p, 0, 4);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_label_mode() { return label_mode; }

function set_case_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    case_mode = clamp(p, 0, 2);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_case_mode() { return case_mode; }

function set_font_style(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    font_style = clamp(p, 0, 3);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_font_style() { return font_style; }

function set_font_name(v) {
  if (v !== undefined && v !== null) {
    font_name = String(v);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_font_name() { return font_name; }

function set_text_size(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    text_size = Math.max(6, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_text_size() { return text_size; }

function set_border_radius(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_radius = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_radius() { return border_radius; }

function set_border_thickness(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_thickness = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_extension = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_extension() { return border_extension; }

function set_text_color_mode(v) {
  text_color_mode = parseInt(v, 10) ? 1 : 0;
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_text_color_mode() { return text_color_mode; }

function set_btn_color_off() { 
  btn_color_off = rgba_values(arguments, btn_color_off); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_btn_color_off() { return btn_color_off; }
function set_bg_color() { set_btn_color_off.apply(this, arguments); }
function get_bg_color() { return btn_color_off; }

function set_btn_color_on() { 
  btn_color_on = rgba_values(arguments, btn_color_on); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_btn_color_on() { return btn_color_on; }
function set_highlight_color() { set_btn_color_on.apply(this, arguments); }
function get_highlight_color() { return btn_color_on; }

function set_border_color() { 
  border_color = rgba_values(arguments, border_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_border_color() { return border_color; }

function set_text_color() { 
  text_color = rgba_values(arguments, text_color); 
  text_color_mode = 1; 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_text_color() { return text_color; }

function set_popup_dot_color() { 
  popup_dot_color = rgba_values(arguments, popup_dot_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_popup_dot_color() { return popup_dot_color; }

function set_pop_bgcolor() { 
  pop_bgcolor = rgba_values(arguments, pop_bgcolor); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_pop_bgcolor() { return pop_bgcolor; }

function set_attr_bg_color() { 
  attr_bg_color = rgba_values(arguments, attr_bg_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_bg_color() { return attr_bg_color; }

function set_attr_border_color() { 
  attr_border_color = rgba_values(arguments, attr_border_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_border_color() { return attr_border_color; }

function set_attr_slider_color() { 
  attr_slider_color = rgba_values(arguments, attr_slider_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_slider_color() { return attr_slider_color; }

function set_attr_text_color() { 
  attr_text_color = rgba_values(arguments, attr_text_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_text_color() { return attr_text_color; }

function set_allow_popup(v) {
  allow_popup = parseInt(v, 10) ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_allow_popup() { return allow_popup; }

function set_show_settings_attrs(v) {
  show_settings_attrs = parseInt(v, 10) ? 1 : 0;
  update_popup_dimensions();
  if (typeof notifyclients === "function") notifyclients();
}
function get_show_settings_attrs() { return show_settings_attrs; }

function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(120, Math.min(pw, 3840));
  if (!isNaN(ph)) popup_mini_h = Math.max(80, Math.min(ph, 2160));
  update_popup_dimensions();
  if (typeof notifyclients === "function") notifyclients();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function set_mask_performance(v) { 
  mask_performance = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_performance() { return mask_performance; }

function set_mask_labels(v) { 
  mask_labels = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_labels() { return mask_labels; }

function set_mask_geometry(v) { 
  mask_geometry = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_geometry() { return mask_geometry; }

function set_mask_colors(v) { 
  mask_colors = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_colors() { return mask_colors; }

function set_mask_popup_colors(v) { 
  mask_popup_colors = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_popup_colors() { return mask_popup_colors; }

// Dedicated Message Router
function anything() {
  var args = arrayfromargs(arguments);
  var msg = messagename.toLowerCase();

  if (msg === "set") {
    set.apply(this, args);
    return;
  }

  for (var b = 0; b < count; b++) {
    var bTag = String(get_button_tag(b)).toLowerCase();
    if (msg === bTag) {
      var aVal = args.length > 0 ? args[0] : "bang";
      set_button_state_direct(b, aVal, false);
      return;
    }
  }

  var btnMatch = msg.match(/^(?:button|btn)_?(\d+)$/);
  if (btnMatch) {
    var bNum = parseInt(btnMatch[1], 10);
    var bIdx = bNum - 1;
    var argVal = args.length > 0 ? args[0] : "bang";
    set_button_state_direct(bIdx, argVal, false);
    return;
  }

  if (msg === "button" || msg === "btn") {
    if (args.length >= 1) {
      var bNum2 = parseInt(args[0], 10);
      var bIdx2 = bNum2 - 1;
      var argVal2 = args.length > 1 ? args[1] : "bang";
      set_button_state_direct(bIdx2, argVal2, false);
    }
    return;
  }

  if (msg === "update" || msg === "theme_update" || msg === "refresh" || msg === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }

  var name = msg.replace(/^set_?/, "");
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";
  if (name === "accent_color") name = "btn_color_on";
  if (name === "highlight_color") name = "btn_color_on";
  if (name === "bg_color") name = "btn_color_off";
  if (name === "orientation") name = "direction";
  if (name === "num_buttons" || name === "buttons") name = "count";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 14. MAX DECLAREATTRIBUTE DEFINITIONS (COUNT SCALES UP TO 64)
// =============================================================
declareattribute("count", { type: "int", label: "Button Count", setter: "set_count", getter: "get_count", category: "Performance", min: 1, max: 64, embed: 1 });
declareattribute("direction", { type: "int", style: "enumindex", enumvals: ["Horizontal", "Vertical"], label: "Strip Orientation", setter: "set_direction", getter: "get_direction", category: "Performance", embed: 1 });
declareattribute("group_mode", { type: "int", style: "enumindex", enumvals: ["Independent", "Live"], label: "Group Mode", setter: "set_group_mode", getter: "get_group_mode", category: "Performance", embed: 1 });
declareattribute("modes", { type: "symbol", label: "Per-Button Modes (0=Mom, 1=Tog, 2=Hold)", setter: "set_modes", getter: "get_modes", category: "Performance", embed: 1 });
declareattribute("flash_time", { type: "int", label: "Flash Time (ms)", setter: "set_flash_time", getter: "get_flash_time", category: "Performance", min: 1, max: 1000, embed: 1 });

declareattribute("labels", { type: "symbol", label: "Labels List (use / for Off/On)", setter: "set_labels", getter: "get_labels", category: "Labels", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Labels", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Labels", embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Labels", embed: 1 });
declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Labels", embed: 1 });
declareattribute("text_size", { type: "int", label: "Font Size", setter: "set_text_size", getter: "get_text_size", category: "Labels", embed: 1 });

declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 1 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Popup", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup Masks", embed: 1 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup Masks", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", setter: "set_mask_performance", getter: "get_mask_performance", category: "Popup Masks", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", setter: "set_mask_labels", getter: "get_mask_labels", category: "Popup Masks", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", setter: "set_mask_geometry", getter: "get_mask_geometry", category: "Popup Masks", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Button Colors", setter: "set_mask_colors", getter: "get_mask_colors", category: "Popup Masks", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", setter: "set_mask_popup_colors", getter: "get_mask_popup_colors", category: "Popup Masks", embed: 1 });

declareattribute("text_color_mode", { type: "int", style: "enumindex", enumvals: ["Auto Luminance", "Manual / Master"], label: "Text Color Mode", setter: "set_text_color_mode", getter: "get_text_color_mode", category: "Button Colors", embed: 1 });
declareattribute("btn_color_off", { type: "rgba", style: "rgba", label: "Btn Color Off", setter: "set_btn_color_off", getter: "get_btn_color_off", category: "Button Colors", embed: 1 });
declareattribute("btn_color_on", { type: "rgba", style: "rgba", label: "Highlight (On)", setter: "set_btn_color_on", getter: "get_btn_color_on", category: "Button Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Button Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Button Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Button Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

// =============================================================
// 15. WIRELESS THEME BUS SUBSCRIBER
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
}

function loadThemeFromDict() {
  var initDict = new Dict("touch_theme_store");
  if (!initDict) return;
  try {
    if (initDict.contains("border_radius")) set_border_radius(initDict.get("border_radius"));
    if (initDict.contains("border_thickness")) set_border_thickness(initDict.get("border_thickness"));
    if (initDict.contains("border_extension")) set_border_extension(initDict.get("border_extension"));

    if (initDict.contains("btn_color_off")) set_btn_color_off(initDict.get("btn_color_off"));
    else if (initDict.contains("bg_color")) set_btn_color_off(initDict.get("bg_color"));

    if (initDict.contains("border_color")) set_border_color(initDict.get("border_color"));
    if (initDict.contains("text_color")) set_text_color(initDict.get("text_color"));

    if (initDict.contains("btn_color_on")) set_btn_color_on(initDict.get("btn_color_on"));
    else if (initDict.contains("highlight_color")) set_btn_color_on(initDict.get("highlight_color"));

    if (initDict.contains("popup_dot_color")) set_popup_dot_color(initDict.get("popup_dot_color"));
    if (initDict.contains("pop_bgcolor")) set_pop_bgcolor(initDict.get("pop_bgcolor"));
    if (initDict.contains("attr_bg_color")) set_attr_bg_color(initDict.get("attr_bg_color"));
    if (initDict.contains("attr_border_color")) set_attr_border_color(initDict.get("attr_border_color"));
    if (initDict.contains("attr_slider_color")) set_attr_slider_color(initDict.get("attr_slider_color"));
    if (initDict.contains("attr_text_color")) set_attr_text_color(initDict.get("attr_text_color"));

    redraw_all();
  } catch(e) {}
}

function onThemeUpdate(theme) {
  if (!theme) return;
  try {
    if (theme.border_radius !== undefined) set_border_radius(theme.border_radius);
    if (theme.border_thickness !== undefined) set_border_thickness(theme.border_thickness);
    if (theme.border_extension !== undefined) set_border_extension(theme.border_extension);

    if (theme.btn_color_off) set_btn_color_off(theme.btn_color_off);
    else if (theme.bg_color) set_btn_color_off(theme.bg_color);

    if (theme.border_color) set_border_color(theme.border_color);

    if (theme.btn_color_on) set_btn_color_on(theme.btn_color_on);
    else if (theme.highlight_color) set_btn_color_on(theme.highlight_color);

    if (theme.text_color) set_text_color(theme.text_color);

    if (theme.popup_dot_color) set_popup_dot_color(theme.popup_dot_color);
    if (theme.pop_bgcolor) set_pop_bgcolor(theme.pop_bgcolor);
    if (theme.attr_bg_color) set_attr_bg_color(theme.attr_bg_color);
    if (theme.attr_border_color) set_attr_border_color(theme.attr_border_color);
    if (theme.attr_slider_color) set_attr_slider_color(theme.attr_slider_color);
    if (theme.attr_text_color) set_attr_text_color(theme.attr_text_color);

    redraw_all();
  } catch(e) {}
}

themeBus.subscribers[uniqueID] = onThemeUpdate;

if (themeBus && themeBus.theme && (themeBus.theme.bg_color || themeBus.theme.border_color)) {
  onThemeUpdate(themeBus.theme);
} else {
  loadThemeFromDict();
}

// =============================================================
// 16. PERSISTENCE (SAVE) & LIFECYCLE DESTRUCTION
// =============================================================
function save() {
  embedmessage("set_count", count);
  embedmessage("set_direction", direction);
  embedmessage("set_group_mode", group_mode);
  embedmessage("set_all_modes", global_mode);
  embedmessage("set_flash_time", flash_time);
  embedmessage("set_modes", button_modes.slice(0, count).join(" "));
  embedmessage("set_labels", labels_raw);

  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_font_style", font_style);
  embedmessage("set_font_name", font_name);
  embedmessage("set_text_size", text_size);

  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);

  embedmessage("set_allow_popup", allow_popup);
  embedmessage("set_show_settings_attrs", show_settings_attrs);
  embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);

  embedmessage("set_mask_performance", mask_performance);
  embedmessage("set_mask_labels", mask_labels);
  embedmessage("set_mask_geometry", mask_geometry);
  embedmessage("set_mask_colors", mask_colors);
  embedmessage("set_mask_popup_colors", mask_popup_colors);

  embedmessage("set_text_color_mode", text_color_mode);
  embedmessage("set_btn_color_off", btn_color_off[0], btn_color_off[1], btn_color_off[2], btn_color_off[3]);
  embedmessage("set_btn_color_on", btn_color_on[0], btn_color_on[1], btn_color_on[2], btn_color_on[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  var flatStates = [];
  for (var s = 0; s < count; s++) {
    var m = button_modes[s] !== undefined ? button_modes[s] : global_mode;
    flatStates.push((m === 1) ? (states[s] || 0) : 0);
  }
  embedmessage.apply(this, ["set"].concat(flatStates));
}

function notifydeleted() {
  if (render_task) {
    try { render_task.cancel(); } catch (e) {}
  }
  if (scrollTask) {
    try { scrollTask.cancel(); } catch (e) {}
  }
  for (var i = 0; i < flash_tasks.length; i++) {
    if (flash_tasks[i]) {
      try { flash_tasks[i].cancel(); } catch (e) {}
    }
  }

  try {
    if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) {
      delete themeBus.subscribers[uniqueID];
    }
  } catch (e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}

  try { if (popupWindow) popupWindow.free(); } catch (e) {}
  try { if (colorWindow) colorWindow.free(); } catch (e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch (e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}

  popupWindow = null;
  colorWindow = null;
  outMatrix = null;
  colorMatrix = null;
}

// Initial Sync
sync_arrays();

// Attach Jitter Listeners
windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
colorListener  = new JitterListener(colorWindow.name, colorWindowListenerCallback);

function trigger_flash(cellIdx, silent) {
  states[cellIdx] = 1;
  redraw_all();
  if (!silent) output_state(cellIdx);

  if (flash_tasks[cellIdx]) {
    try { flash_tasks[cellIdx].cancel(); } catch (e) {}
  }
  var tsk = new Task(function () {
    states[cellIdx] = 0;
    redraw_all();
    if (!silent) output_state(cellIdx);
  }, this);
  tsk.schedule(flash_time);
  flash_tasks[cellIdx] = tsk;
}

function handle_cell_press(cellIdx) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;

  if (cellMode === 0) {
    if (group_mode === 1) {
      for (var k = 0; k < count; k++) {
        if (k !== cellIdx && states[k] !== 0) {
          states[k] = 0;
          output_state(k);
        }
      }
    }
    trigger_flash(cellIdx, false);
    return;
  }

  if (cellMode === 1) {
    if (group_mode === 1) {
      if (states[cellIdx] === 1) return;
      for (var j = 0; j < count; j++) {
        if (j !== cellIdx && states[j] !== 0) {
          states[j] = 0;
          output_state(j);
        }
      }
      states[cellIdx] = 1;
    } else {
      states[cellIdx] = states[cellIdx] ? 0 : 1;
    }
    redraw_all();
    output_state(cellIdx);
    return;
  }

  if (cellMode === 2) {
    if (group_mode === 1) {
      for (var m = 0; m < count; m++) {
        if (m !== cellIdx && states[m] !== 0) {
          states[m] = 0;
          output_state(m);
        }
      }
    }
    if (states[cellIdx] === 1) return;
    states[cellIdx] = 1;
    redraw_all();
    output_state(cellIdx);
  }
}

function handle_cell_release(cellIdx) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;
  if (cellMode === 2) {
    if (states[cellIdx] !== 0) {
      states[cellIdx] = 0;
      redraw_all();
      output_state(cellIdx);
    }
  }
}

function set_button_state_direct(cellIdx, val, silent) {
  if (cellIdx < 0 || cellIdx >= count) return;
  var cellMode = button_modes[cellIdx] !== undefined ? button_modes[cellIdx] : global_mode;

  if (val === "bang" || val === "trigger") {
    handle_cell_press(cellIdx);
    if (cellMode === 2) handle_cell_release(cellIdx);
    return;
  }

  var numVal = parseInt(val, 10);
  if (isNaN(numVal)) return;

  var targetState = numVal > 0 ? 1 : 0;

  if (cellMode === 0) {
    if (targetState === 1) trigger_flash(cellIdx, silent);
    return;
  }

  if (group_mode === 0 && states[cellIdx] === targetState) {
    return;
  }

  if (group_mode === 1) {
    if (targetState === 1) {
      if (states[cellIdx] === 1) return;
      for (var j = 0; j < count; j++) {
        if (j !== cellIdx && states[j] !== 0) {
          states[j] = 0;
          if (!silent) output_state(j);
        }
      }
      states[cellIdx] = 1;
    } else {
      if (states[cellIdx] === 0) return;
      states[cellIdx] = 0;
    }
  } else {
    states[cellIdx] = targetState;
  }

  redraw_all();
  if (!silent) output_state(cellIdx);
}

// =============================================================
// 7. INLET MESSAGE PARSER
// =============================================================
function bang() {
  var targetIdx = 0;
  var cellMode = button_modes[targetIdx] !== undefined ? button_modes[targetIdx] : global_mode;

  if (cellMode === 1) {
    handle_cell_press(targetIdx);
  } else if (cellMode === 0) {
    trigger_flash(targetIdx, false);
  } else if (cellMode === 2) {
    handle_cell_press(targetIdx);
    if (flash_tasks[targetIdx]) {
      try { flash_tasks[targetIdx].cancel(); } catch (e) {}
    }
    var tsk = new Task(function () {
      handle_cell_release(targetIdx);
    }, this);
    tsk.schedule(Math.max(50, flash_time));
    flash_tasks[targetIdx] = tsk;
  }
}

function dump() {
  output_state();
}

function msg_int(v) {
  var val = parseInt(v, 10);
  if (isNaN(val)) return;

  if (count === 1) {
    set_button_state_direct(0, val, false);
  } else {
    if (val >= 0 && val < count) {
      handle_cell_press(val);
      if (button_modes[val] === 2) handle_cell_release(val);
    }
  }
}

function list() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length === 2 && typeof args[0] === "number" && args[0] >= 0 && args[0] < count) {
    set_button_state_direct(Math.floor(args[0]), args[1], false);
    return;
  }

  var hasChange = false;
  if (group_mode === 1) {
    var activeFound = -1;
    for (var k = 0; k < count && k < args.length; k++) {
      if (Number(args[k]) > 0) { activeFound = k; break; }
    }
    for (var m = 0; m < count; m++) {
      var nextSt = (m === activeFound) ? 1 : 0;
      if (states[m] !== nextSt) { states[m] = nextSt; hasChange = true; }
    }
  } else {
    for (var i = 0; i < count && i < args.length; i++) {
      var st = Number(args[i]) > 0 ? 1 : 0;
      if (states[i] !== st) {
        states[i] = st;
        hasChange = true;
      }
    }
  }

  if (hasChange) {
    redraw_all();
    output_state();
  }
}

function set() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  if (args.length === 2 && typeof args[0] === "number" && args[0] >= 0 && args[0] < count) {
    set_button_state_direct(Math.floor(args[0]), args[1], true);
    return;
  }

  for (var i = 0; i < count && i < args.length; i++) {
    states[i] = Number(args[i]) > 0 ? 1 : 0;
  }
  redraw_all();
}

function clear() {
  var hadActive = false;
  for (var i = 0; i < count; i++) {
    if (states[i] !== 0) hadActive = true;
    states[i] = 0;
  }
  if (hadActive) {
    redraw_all();
    output_state();
  }
}

// =============================================================
// 8. DRAW ENGINE
// =============================================================
function draw_common_path(ctx, x, y, w, h, r) {
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  } else {
    ctx.rectangle(x, y, w, h);
  }
  ctx.close_path();
}

function draw_corners(ctx, x, y, w, h, r, extW, extH, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  else ctx.move_to(x, y);
  ctx.line_to(x + r + extW, y);
  ctx.move_to(x, y + r);
  ctx.line_to(x, y + r + extH);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + extH);
  ctx.move_to(x + w - r - extW, y);
  ctx.line_to(x + w - r, y);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - extW, y + h);
  ctx.move_to(x + w, y + h - r);
  ctx.line_to(x + w, y + h - r - extH);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - extH);
  ctx.move_to(x + r + extW, y + h);
  ctx.line_to(x + r, y + h);
  ctx.stroke();
}

function get_cell_bounds(idx, w, h, inset, dir) {
  var d = (dir !== undefined) ? dir : direction;
  var rw = Math.max(1, w - inset * 2);
  var rh = Math.max(1, h - inset * 2);
  if (d === 0) {
    var cellW = rw / count;
    return { x: inset + idx * cellW, y: inset, w: cellW, h: rh };
  } else {
    var cellH = rh / count;
    return { x: inset, y: inset + idx * cellH, w: rw, h: cellH };
  }
}

function draw_cell_fill(ctx, cb, i, totalCount, dir, rad, col) {
  ctx.set_source_rgba(col);
  var r = Math.min(rad, cb.w * 0.5, cb.h * 0.5);

  if (r <= 0 || totalCount <= 1) {
    if (totalCount <= 1 && r > 0) {
      draw_common_path(ctx, cb.x, cb.y, cb.w, cb.h, r);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
    ctx.fill();
    return;
  }

  ctx.new_path();
  if (dir === 0) {
    if (i === 0) {
      ctx.move_to(cb.x + cb.w, cb.y);
      ctx.line_to(cb.x + cb.w, cb.y + cb.h);
      ctx.arc(cb.x + r, cb.y + cb.h - r, r, Math.PI / 2, Math.PI);
      ctx.arc(cb.x + r, cb.y + r, r, Math.PI, Math.PI * 1.5);
    } else if (i === totalCount - 1) {
      ctx.move_to(cb.x, cb.y + cb.h);
      ctx.line_to(cb.x, cb.y);
      ctx.arc(cb.x + cb.w - r, cb.y + r, r, -Math.PI / 2, 0);
      ctx.arc(cb.x + cb.w - r, cb.y + cb.h - r, r, 0, Math.PI / 2);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
  } else {
    if (i === 0) {
      ctx.move_to(cb.x + cb.w, cb.y + cb.h);
      ctx.line_to(cb.x, cb.y + cb.h);
      ctx.arc(cb.x + r, cb.y + r, r, Math.PI, Math.PI * 1.5);
      ctx.arc(cb.x + cb.w - r, cb.y + r, r, -Math.PI / 2, 0);
    } else if (i === totalCount - 1) {
      ctx.move_to(cb.x, cb.y);
      ctx.line_to(cb.x + cb.w, cb.y);
      ctx.arc(cb.x + cb.w - r, cb.y + cb.h - r, r, 0, Math.PI / 2);
      ctx.arc(cb.x + r, cb.y + cb.h - r, r, Math.PI / 2, Math.PI);
    } else {
      ctx.rectangle(cb.x, cb.y, cb.w, cb.h);
    }
  }
  ctx.close_path();
  ctx.fill();
}

function draw_mbutton_strip(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 4.0 : border_radius;
  var r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  // 1. Chassis Body Fill
  ctx.set_source_rgba(btn_color_off);
  draw_common_path(ctx, inset, inset, rw, rh, r);
  ctx.fill();

  // 2. Individual Active Cell Highlight Fills
  for (var i = 0; i < count; i++) {
    if (states[i] > 0) {
      var cb = get_cell_bounds(i, w, h, inset, direction);
      draw_cell_fill(ctx, cb, i, count, direction, r, btn_color_on);
    }
  }

  // 3. Hairline Cell Dividers
  if (count > 1) {
    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    ctx.set_line_width(1.0);

    for (var d = 1; d < count; d++) {
      if (direction === 0) {
        var divX = inset + d * (rw / count);
        ctx.move_to(divX, inset);
        ctx.line_to(divX, inset + rh);
      } else {
        var divY = inset + d * (rh / count);
        ctx.move_to(inset, divY);
        ctx.line_to(inset + rw, divY);
      }
      ctx.stroke();
    }
  }

  // 4. Corner Reticle Brackets
  if (b > 0) {
    draw_corners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  // 5. Button Typography
  var scaleRatio = is_preview ? Math.max(0.8, Math.min(1.4, h / 36.0)) : 1.0;
  var curFontSize = is_preview ? Math.max(8, Math.min(14, Math.round(11 * scaleRatio))) : text_size;
  ctx.select_font_face(font_name, get_font_slant(), get_font_weight());
  ctx.set_font_size(curFontSize);

  var fe = ctx.font_extents();
  var fontAscent = fe["0"] || fe.ascent || curFontSize;

  for (var j = 0; j < count; j++) {
    var cb2 = get_cell_bounds(j, w, h, inset, direction);
    var rawToken = parsed_labels[j] !== undefined ? parsed_labels[j] : ("" + (j + 1));
    var isEmpty = (rawToken === "<empty>");
    var cellState = states[j] > 0 ? 1 : 0;

    var rawTxt = rawToken;
    if (rawToken.indexOf("/") !== -1) {
      var slashParts = rawToken.split("/");
      rawTxt = cellState ? slashParts[1] : slashParts[0];
    }

    var dispTxt = get_display_label(rawTxt, is_preview);

    if (dispTxt && dispTxt.length > 0) {
      var tm = ctx.text_measure(dispTxt);
      var tw = tm ? tm[0] : curFontSize * 0.6 * dispTxt.length;
      var textX = cb2.x + (cb2.w - tw) * 0.5;
      var textY = cb2.y + cb2.h * 0.5 + fontAscent * 0.33;

      var txtCol = get_effective_cell_text_color(j);
      if (isEmpty) {
        ctx.set_source_rgba(txtCol[0], txtCol[1], txtCol[2], 0.35);
      } else {
        ctx.set_source_rgba(txtCol);
      }
      ctx.move_to(textX, textY);
      ctx.show_text(dispTxt);
    }
  }

  // 6. Red Popup Launcher Dot
  if (!is_preview && allow_popup === 1) {
    var dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  var dims = get_dimensions();
  draw_mbutton_strip(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 9. MAIN CANVAS MOUSE ENGINE (BIDIRECTIONAL SCRUB/RESTORE)
// =============================================================
var pre_drag_states = [];
var drag_start_cell = -1;
var last_drag_cell  = -1;
var drag_target_val = 1;

function get_hit_cell(x, y, w, h, dir) {
  var d = (dir !== undefined) ? dir : direction;
  var b = border_thickness * 0.5;
  var rw = Math.max(1, w - b * 2);
  var rh = Math.max(1, h - b * 2);
  if (d === 0) {
    var cellW = rw / count;
    var idxX = Math.floor((x - b) / cellW);
    return clamp(idxX, 0, count - 1);
  } else {
    var cellH = rh / count;
    var idxY = Math.floor((y - b) / cellH);
    return clamp(idxY, 0, count - 1);
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  var w = dims.w, h = dims.h;
  var is_right_click = (ctrl === 1);

  if (allow_popup === 1) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var dotX = w - dotMargin;
    var dotY = dotMargin;
    var hitR = Math.max(4.0, Math.min(8.0, Math.min(w, h) * 0.20));

    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= hitR || is_right_click) {
      popup();
      return;
    }
  }

  if (button === 0) {
    onmouseup();
    return;
  }

  // Snapshot all states before drag starts
  pre_drag_states = states.slice(0);

  var hit = get_hit_cell(x, y, w, h, direction);
  drag_start_cell = hit;
  last_drag_cell  = hit;
  active_cell_pressed = hit;

  handle_cell_press(hit);
  drag_target_val = states[hit] ? 1 : 0;
}

function ondrag(x, y, button) {
  if (button === 0) {
    onmouseup();
    return;
  }
  if (drag_start_cell === -1) return;

  var dims = get_dimensions();
  var hit = get_hit_cell(x, y, dims.w, dims.h, direction);
  if (hit === last_drag_cell) return;
  last_drag_cell = hit;

  if (group_mode === 1) {
    // Live/Radio exclusive mode: scrub single active selection
    handle_cell_press(hit);
    return;
  }

  // Dynamic range between start of drag and current cursor position
  var minC = Math.min(drag_start_cell, hit);
  var maxC = Math.max(drag_start_cell, hit);
  var hasChanged = false;

  for (var i = 0; i < count; i++) {
    var inRange = (i >= minC && i <= maxC);
    // If inside current range, apply drag target; if outside, restore pre-drag state
    var desiredState = inRange ? drag_target_val : pre_drag_states[i];

    if (states[i] !== desiredState) {
      states[i] = desiredState;
      hasChanged = true;
      output_state(i);
    }
  }

  if (hasChanged) {
    redraw_all();
  }
}

function onmouseup() {
  if (drag_start_cell !== -1) {
    // Mode 2 (Touch-Hold) cells release back to 0 on mouseup
    for (var i = 0; i < count; i++) {
      var m = button_modes[i] !== undefined ? button_modes[i] : global_mode;
      if (m === 2 && states[i] !== 0) {
        states[i] = 0;
        output_state(i);
      }
    }
  }

  drag_start_cell = -1;
  last_drag_cell  = -1;
  pre_drag_states = [];
  active_cell_pressed = -1;
  redraw_all();
}

function onidleout() {
  onmouseup();
}

function onidle() {
  if (drag_start_cell !== -1 || active_cell_pressed !== -1) {
    onmouseup();
  }
}


// =============================================================
// 10. 5-TIER POPUP WINDOW
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  // Tier 1: Performance
  if (mask_performance === 1) {
    list.push({ name: "Button Count", val: count, pct: (count - 1) / 63.0, is_slider: true, target_id: 101 });
    list.push({ name: "Orientation", val: direction === 1 ? "Vertical" : "Horizontal", is_toggle: true, target_id: 102 });
    list.push({ name: "Group Mode", val: group_mode === 1 ? "Live" : "Independent", is_toggle: true, target_id: 103 });
    list.push({ name: "Set All Modes", val: mode_names[global_mode], is_toggle: true, target_id: 104 });
    list.push({ name: "Flash Time", val: flash_time + "ms", pct: (flash_time - 1) / 999.0, is_slider: true, target_id: 105 });
  }

  // Tier 2: Labels
  if (mask_labels === 1) {
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 201 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 203 });
  }

  // Tier 3: Geometry
  if (mask_geometry === 1) {
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 301 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 302 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 303 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 6) / 36.0, is_slider: true, target_id: 304 });
  }

  // Tier 4: Button Colors
  if (mask_colors === 1) {
    list.push({ name: "Text Auto/Man", val: text_color_mode === 0 ? "Auto" : "Manual", is_toggle: true, target_id: 401 });
    list.push({ name: "Btn Color Off", val: btn_color_off, is_color: true, key: "btn_color_off" });
    list.push({ name: "Highlight (On)", val: btn_color_on, is_color: true, key: "btn_color_on" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
  }

  // Tier 5: Popup Colors
  if (mask_popup_colors === 1) {
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_preview_height(has_rows) {
  if (!has_rows) return Math.max(42, popup_mini_h - 28 - 14);
  if (direction === 1) {
    return Math.max(85, Math.min(220, count * 26 + 10));
  }
  return 46;
}

function get_popup_dimensions_map() {
  var rows = get_visible_rows_map();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  var prevH = get_preview_height(true);
  var calculated_h = 28 + prevH + 12 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_popup_dimensions_map();
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Touch Button Settings";
    popupWindow.visible = 1;
    popupWindow.front();
    draw_popup_to_window();
  } else {
    popupWindow.visible = 0;
  }
}

function draw_popup_to_window() {
  if (!showSettings || allow_popup !== 1) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_popup_to_window_deferred() {
  if (!showSettings || allow_popup !== 1) return;
  var dims = get_popup_dimensions_map();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  popupWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  // Close Dot & Label
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Toggle Hide/Show Button Pill
  var tglW = 44, tglH = 16;
  var tglX = w - tglW - 12, tglY = 6;
  var tglR = Math.max(2, Math.min(6, border_radius * 0.3));

  pCtx.set_source_rgba(attr_bg_color);
  pCtx.rectangle_rounded(tglX, tglY, tglW, tglH, tglR, tglR);
  pCtx.fill();

  if (border_thickness > 0) {
    pCtx.set_source_rgba(attr_border_color);
    pCtx.set_line_width(Math.min(border_thickness, 1.0));
    pCtx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, tglR, tglR);
    pCtx.stroke();
  }

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = pCtx.text_measure(tglLabel);
  var tglTextX = tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5;
  pCtx.move_to(tglTextX, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // ADAPTIVE PREVIEW CHASSIS
  var prevX = 12, prevY = 28;
  var prevW = Math.max(40, w - 24);
  var prevH = get_preview_height(has_rows);

  var stripW = (direction === 1 && has_rows) ? Math.max(80, Math.min(130, prevW * 0.45)) : prevW;
  var stripX = prevX + (prevW - stripW) * 0.5;

  cached_preview_rect = { x: stripX, y: prevY, w: stripW, h: prevH };

  pCtx.save();
  pCtx.translate(stripX, prevY);
  draw_mbutton_strip(pCtx, stripW, prevH, true);
  pCtx.restore();

  // Directional 1-Axis Pull Grips (Mini mode only)
  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    if (direction === 0) {
      // Horizontal mode: Vertical ticks indicating horizontal pull!
      pCtx.move_to(w - 6, h - 14); pCtx.line_to(w - 6, h - 4);
      pCtx.move_to(w - 10, h - 14); pCtx.line_to(w - 10, h - 4);
    } else {
      // Vertical mode: Horizontal ticks indicating vertical pull!
      pCtx.move_to(w - 14, h - 6); pCtx.line_to(w - 4, h - 6);
      pCtx.move_to(w - 14, h - 10); pCtx.line_to(w - 4, h - 10);
    }
    pCtx.stroke();
  }

  // 50/50 ATTRIBUTE ROWS STACKED VERTICALLY
  if (has_rows) {
    var divY = prevY + prevH + 8;
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    var sY = divY + 8;
    var rowX = 12, rowW = w - 24;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], rY = sY + i * 28;

      pCtx.set_source_rgba(attr_bg_color);
      pCtx.rectangle(rowX, rY, rowW, 26);
      pCtx.fill();

      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      var vY = rY + 4, vH = 18;

      if (r.is_color) {
        pCtx.set_source_rgba(r.val);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        var fillW = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
        pCtx.set_source_rgba(attr_slider_color);
        pCtx.rectangle(valBoxX, vY, fillW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, fillW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        pCtx.move_to(valBoxX + 6, rY + 17);
        pCtx.show_text(String(r.val));
      } else {
        pCtx.set_source_rgba(0.14, 0.14, 0.17, 0.70);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(0.75);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        var vTm = pCtx.text_measure(String(r.val));
        var vStrW = vTm ? vTm[0] : 20;
        pCtx.move_to(valBoxX + Math.max(6, (valBoxW - vStrW) * 0.5), rY + 17);
        pCtx.show_text(String(r.val));
      }
    }
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

// =============================================================
// 11. 1-AXIS FULL-SCREEN MINI DRAG SIZING
// =============================================================
function apply_slider_target(target_id, targetPct) {
  if (target_id === 101) set_count(Math.round(1 + targetPct * 63));
  else if (target_id === 105) set_flash_time(Math.round(1 + targetPct * 999));
  else if (target_id === 301) set_border_radius(targetPct * 25.0);
  else if (target_id === 302) set_border_thickness(targetPct * 10.0);
  else if (target_id === 303) set_border_extension(targetPct * 50.0);
  else if (target_id === 304) set_text_size(Math.round(6 + targetPct * 36));
  redraw_all();
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) update_popup_dimensions();
  else {
    popupWindow.visible = 0;
    colorWindow.visible = 0;
  }
  mgraphics.redraw();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = mbut === 1 && is_mouse_down_anywhere === 0;
    is_mouse_down_anywhere = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    var dims = get_popup_dimensions_map();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    if (mbut === 0) {
      is_resizing_window = 0;
      if (popup_active_cell !== -1) {
        handle_cell_release(popup_active_cell);
        popup_active_cell = -1;
      }
      active_pop_target = -1;
      stop_scrolling();
      return;
    }

    // 1-AXIS FULL-SCREEN MINI DRAG
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;

      if (direction === 0) {
        // Horizontal: Height strictly locked at 90; Width allows full-screen drag!
        popup_mini_w = Math.max(160, Math.min(start_resize_w + deltaW, 3840));
        popup_mini_h = 90;
      } else {
        // Vertical: Width strictly locked at 130; Height allows full-screen drag!
        popup_mini_w = 130;
        popup_mini_h = Math.max(140, Math.min(start_resize_h + deltaH, 2160));
      }
      update_popup_dimensions();
      return;
    }

    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx;
      start_click_y = my;
      start_resize_w = w;
      start_resize_h = h;
      return;
    }

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0;
      colorWindow.visible = 0;
      stop_scrolling();
      mgraphics.redraw();
      return;
    }

    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // Interactive Preview Click
    var prevMaxY = pr.y + pr.h;
    if (mbut && my >= pr.y && my <= prevMaxY && mx >= pr.x && mx <= pr.x + pr.w && active_pop_target === -1) {
      var localX = mx - pr.x;
      var localY = my - pr.y;
      var hitCell = get_hit_cell(localX, localY, pr.w, pr.h, direction);
      if (is_pop_tap) {
        popup_active_cell = hitCell;
        handle_cell_press(hitCell);
      }
      return;
    }

    if (!has_rows) return;

    var sY = pr.y + pr.h + 16;
    var rowW = w - 24;
    var midX = 12 + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    var rIdx = Math.floor((my - sY) / 28);
    if (rIdx >= 0 && rIdx < rows.length) {
      var r = rows[rIdx];
      var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

      if (r.is_slider || r.pct !== undefined) {
        active_pop_target = r.target_id;
        apply_slider_target(r.target_id, pct);

        stop_scrolling();
        scrollTask = new Task(function () {
          if (active_pop_target === -1) return;
          var targetPct = clamp((lastMouseX - valBoxX) / valBoxW, 0, 1);
          apply_slider_target(active_pop_target, targetPct);
        }, this);
        scrollTask.interval = 15;
        scrollTask.repeat();
      } else if (is_pop_tap) {
        if (r.target_id === 102) set_direction(direction ? 0 : 1);
        else if (r.target_id === 103) set_group_mode(group_mode ? 0 : 1);
        else if (r.target_id === 104) set_all_modes((global_mode + 1) % 3);
        else if (r.target_id === 201) set_label_mode((label_mode + 1) % 5);
        else if (r.target_id === 202) set_case_mode((case_mode + 1) % 3);
        else if (r.target_id === 203) set_font_style((font_style + 1) % 4);
        else if (r.target_id === 401) set_text_color_mode(text_color_mode === 0 ? 1 : 0);
        else if (r.is_color) {
          active_color_target = r.key;
          initPickerFromTarget();
          if (popupWindow && popupWindow.pos) {
            colorWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + sY + rIdx * 28 + 14];
          }
          colorWindow.visible = 1;
          colorWindow.front();
          draw_color_picker_popup();
        }
      }
      draw_popup_to_window();
    }
  }
}

// =============================================================
// 12. SUB-WINDOW: MODERN HSV COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "btn_color_off" || name === "bg_color") return btn_color_off;
  if (name === "btn_color_on" || name === "highlight_color") return btn_color_on;
  if (name === "border_color") return border_color;
  if (name === "text_color") return text_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

function get_color_target_label(name) {
  if (name === "btn_color_off") return "Btn Color Off";
  if (name === "btn_color_on") return "Highlight (On)";
  if (name === "border_color") return "Border Color";
  if (name === "text_color") return "Text Color";
  if (name === "popup_dot_color") return "Popup Dot";
  if (name === "pop_bgcolor") return "Popup BG";
  if (name === "attr_bg_color") return "Attr BG";
  if (name === "attr_border_color") return "Attr Border";
  if (name === "attr_slider_color") return "Attr Slider";
  if (name === "attr_text_color") return "Attr Text";
  return "Color Picker";
}

function initPickerFromTarget() {
  var arr = get_color_target(active_color_target) || [1, 1, 1, 1];
  var hsv = rgbToHsv(arr[0], arr[1], arr[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2];
  cur_a = (arr[3] !== undefined ? arr[3] : 1.0);
}

function applyPickerToTarget() {
  var rgb = hsvToRgb(cur_h, cur_s, cur_v);
  var arr = get_color_target(active_color_target);
  if (arr) {
    arr[0] = rgb[0]; arr[1] = rgb[1]; arr[2] = rgb[2]; arr[3] = cur_a;
  }
  redraw_all();
}

function draw_color_picker_popup() {
  var winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 6.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
  ctx.move_to(28, 17);
  ctx.show_text(get_color_target_label(active_color_target));

  var hueX = 10, hueY = 28, hueW = 180, hueH = 16;
  var huePat = ctx.pattern_create_linear(hueX, 0, hueX + hueW, 0);
  huePat.add_color_stop_rgba(0.00, 1.0, 0.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.17, 1.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.33, 0.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.50, 0.0, 1.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.67, 0.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.83, 1.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(1.00, 1.0, 0.0, 0.0, 1.0);
  ctx.set_source(huePat);
  ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3);
  ctx.fill();

  var hIndX = hueX + cur_h * hueW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var svX = 10, svY = 50, svW = 180, svH = 115;
  var pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1.0, 1.0, 1.0, 1.0);
  satPat.add_color_stop_rgba(1.0, 1.0, 1.0, 1.0, 0.0);
  ctx.set_source(satPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0.0, 0.0, 0.0, 0.0);
  valPat.add_color_stop_rgba(1.0, 0.0, 0.0, 0.0, 1.0);
  ctx.set_source(valPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  var svIndX = svX + cur_s * svW;
  var svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var opX = 10, opY = 172, opW = 180, opH = 16;
  ctx.set_source_rgba(0.2, 0.2, 0.22, 1.0);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();
  var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  var opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
  opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(opPat);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();

  var opIndX = opX + cur_a * opW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(cur_v > 0.5 ? [0, 0, 0, 0.8] : [1, 1, 1, 0.9]);
  ctx.move_to(swX + 8, swY + 21);
  ctx.show_text("Opacity: " + Math.round(cur_a * 100) + "%");

  var img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  colorWindow.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
  if (event.eventname === "close") { showColorWindow = 0; picker_drag_zone = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { picker_drag_zone = 0; return; }

    if (mbut) {
      if (mx < 24 && my < 24) {
        colorWindow.visible = 0; picker_drag_zone = 0; redraw_all(); return;
      }
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

// =============================================================
// 13. ATTRIBUTES GETTERS & SETTERS
// =============================================================
function set_count(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    count = clamp(p, 1, 64); // Scales up to 64 buttons!
    if (count === 1 && labels_raw === "1 2 3 4") {
      labels_raw = "Touch/Hold";
    }
    sync_arrays();
    update_popup_dimensions();
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_count() { return count; }

function set_direction(v) {
  if (typeof v === "string") {
    direction = (v.toLowerCase().indexOf("vert") !== -1 || v === "1") ? 1 : 0;
  } else {
    direction = parseInt(v, 10) ? 1 : 0;
  }

  // Automatic Resting Aspect-Ratio Snapping
  if (direction === 0) {
    popup_mini_h = 90;
    popup_mini_w = Math.max(200, popup_mini_w);
  } else {
    popup_mini_w = 130;
    popup_mini_h = Math.max(180, popup_mini_h);
  }

  update_popup_dimensions();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_direction() { return direction; }

function set_group_mode(v) {
  if (typeof v === "string") {
    group_mode = (v.toLowerCase().indexOf("live") !== -1 || v === "1") ? 1 : 0;
  } else {
    group_mode = parseInt(v, 10) ? 1 : 0;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_group_mode() { return group_mode; }

function set_all_modes(v) {
  var m = clamp(parseInt(v, 10) || 0, 0, 2);
  global_mode = m;
  for (var i = 0; i < count; i++) {
    button_modes[i] = m;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_all_modes() { return global_mode; }

function set_flash_time(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    flash_time = clamp(p, 1, 1000);
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_flash_time() { return flash_time; }

function set_modes() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;
  
  var tokens = [];
  for (var a = 0; a < args.length; a++) {
    var str = String(args[a]).trim();
    var parts = str.split(/\s+/);
    for (var p = 0; p < parts.length; p++) {
      if (parts[p].length > 0) tokens.push(parts[p]);
    }
  }

  button_modes = [];
  for (var i = 0; i < count; i++) {
    if (i < tokens.length) {
      button_modes.push(clamp(parseInt(tokens[i], 10) || 0, 0, 2));
    } else {
      button_modes.push(global_mode);
    }
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_modes() { return button_modes.slice(0, count).join(" "); }
function set_button_modes() { set_modes.apply(this, arguments); }
function get_button_modes() { return get_modes(); }

function set_labels() {
  var args = arrayfromargs(arguments);
  labels_raw = args.join(" ");
  sync_arrays();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_labels() { return labels_raw; }

function set_label_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    label_mode = clamp(p, 0, 4);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_label_mode() { return label_mode; }

function set_case_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    case_mode = clamp(p, 0, 2);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_case_mode() { return case_mode; }

function set_font_style(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    font_style = clamp(p, 0, 3);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_font_style() { return font_style; }

function set_font_name(v) {
  if (v !== undefined && v !== null) {
    font_name = String(v);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_font_name() { return font_name; }

function set_text_size(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    text_size = Math.max(6, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_text_size() { return text_size; }

function set_border_radius(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_radius = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_radius() { return border_radius; }

function set_border_thickness(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_thickness = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) {
    border_extension = Math.max(0, p);
    redraw_all();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function get_border_extension() { return border_extension; }

function set_text_color_mode(v) {
  text_color_mode = parseInt(v, 10) ? 1 : 0;
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_text_color_mode() { return text_color_mode; }

function set_btn_color_off() { 
  btn_color_off = rgba_values(arguments, btn_color_off); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_btn_color_off() { return btn_color_off; }
function set_bg_color() { set_btn_color_off.apply(this, arguments); }
function get_bg_color() { return btn_color_off; }

function set_btn_color_on() { 
  btn_color_on = rgba_values(arguments, btn_color_on); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_btn_color_on() { return btn_color_on; }
function set_highlight_color() { set_btn_color_on.apply(this, arguments); }
function get_highlight_color() { return btn_color_on; }

function set_border_color() { 
  border_color = rgba_values(arguments, border_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_border_color() { return border_color; }

function set_text_color() { 
  text_color = rgba_values(arguments, text_color); 
  text_color_mode = 1; 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_text_color() { return text_color; }

function set_popup_dot_color() { 
  popup_dot_color = rgba_values(arguments, popup_dot_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_popup_dot_color() { return popup_dot_color; }

function set_pop_bgcolor() { 
  pop_bgcolor = rgba_values(arguments, pop_bgcolor); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_pop_bgcolor() { return pop_bgcolor; }

function set_attr_bg_color() { 
  attr_bg_color = rgba_values(arguments, attr_bg_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_bg_color() { return attr_bg_color; }

function set_attr_border_color() { 
  attr_border_color = rgba_values(arguments, attr_border_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_border_color() { return attr_border_color; }

function set_attr_slider_color() { 
  attr_slider_color = rgba_values(arguments, attr_slider_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_slider_color() { return attr_slider_color; }

function set_attr_text_color() { 
  attr_text_color = rgba_values(arguments, attr_text_color); 
  redraw_all(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_attr_text_color() { return attr_text_color; }

function set_allow_popup(v) {
  allow_popup = parseInt(v, 10) ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0;
  }
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_allow_popup() { return allow_popup; }

function set_show_settings_attrs(v) {
  show_settings_attrs = parseInt(v, 10) ? 1 : 0;
  update_popup_dimensions();
  if (typeof notifyclients === "function") notifyclients();
}
function get_show_settings_attrs() { return show_settings_attrs; }

// Full-Screen bounds support
function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(120, Math.min(pw, 3840));
  if (!isNaN(ph)) popup_mini_h = Math.max(80, Math.min(ph, 2160));
  update_popup_dimensions();
  if (typeof notifyclients === "function") notifyclients();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function set_mask_performance(v) { 
  mask_performance = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_performance() { return mask_performance; }

function set_mask_labels(v) { 
  mask_labels = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_labels() { return mask_labels; }

function set_mask_geometry(v) { 
  mask_geometry = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_geometry() { return mask_geometry; }

function set_mask_colors(v) { 
  mask_colors = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_colors() { return mask_colors; }

function set_mask_popup_colors(v) { 
  mask_popup_colors = parseInt(v, 10) ? 1 : 0; 
  update_popup_dimensions(); 
  if (typeof notifyclients === "function") notifyclients();
}
function get_mask_popup_colors() { return mask_popup_colors; }

// Dedicated Message Router
function anything() {
  var args = arrayfromargs(arguments);
  var msg = messagename.toLowerCase();

  // 1. Silent Set: set <index> <state> or set <s0> <s1> ...
  if (msg === "set") {
    set.apply(this, args);
    return;
  }

  // 2. Target by Button Name/Tag: e.g. "edit 1", "snap bang", "touch on"
  for (var b = 0; b < count; b++) {
    var bTag = String(get_button_tag(b)).toLowerCase();
    if (msg === bTag) {
      var aVal = args.length > 0 ? args[0] : "bang";
      set_button_state_direct(b, aVal, false);
      return;
    }
  }

  // 3. Individual Button Ingest: button_1 $1, btn_2 $1
  var btnMatch = msg.match(/^(?:button|btn)_?(\d+)$/);
  if (btnMatch) {
    var bNum = parseInt(btnMatch[1], 10);
    var bIdx = bNum - 1;
    var argVal = args.length > 0 ? args[0] : "bang";
    set_button_state_direct(bIdx, argVal, false);
    return;
  }

  // 4. button <index> <val>
  if (msg === "button" || msg === "btn") {
    if (args.length >= 1) {
      var bNum2 = parseInt(args[0], 10);
      var bIdx2 = bNum2 - 1;
      var argVal2 = args.length > 1 ? args[1] : "bang";
      set_button_state_direct(bIdx2, argVal2, false);
    }
    return;
  }

  // 5. Theme Bus updates
  if (msg === "update" || msg === "theme_update" || msg === "refresh" || msg === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }

  // 6. Aliases
  var name = msg.replace(/^set_?/, "");
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";
  if (name === "accent_color") name = "btn_color_on";
  if (name === "highlight_color") name = "btn_color_on";
  if (name === "bg_color") name = "btn_color_off";
  if (name === "orientation") name = "direction";
  if (name === "num_buttons" || name === "buttons") name = "count";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 14. MAX DECLAREATTRIBUTE DEFINITIONS (COUNT SCALES UP TO 64)
// =============================================================
declareattribute("count", { type: "int", label: "Button Count", setter: "set_count", getter: "get_count", category: "Performance", min: 1, max: 64, embed: 1 });
declareattribute("direction", { type: "int", style: "enumindex", enumvals: ["Horizontal", "Vertical"], label: "Strip Orientation", setter: "set_direction", getter: "get_direction", category: "Performance", embed: 1 });
declareattribute("group_mode", { type: "int", style: "enumindex", enumvals: ["Independent", "Live"], label: "Group Mode", setter: "set_group_mode", getter: "get_group_mode", category: "Performance", embed: 1 });
declareattribute("modes", { type: "symbol", label: "Per-Button Modes (0=Mom, 1=Tog, 2=Hold)", setter: "set_modes", getter: "get_modes", category: "Performance", embed: 1 });
declareattribute("flash_time", { type: "int", label: "Flash Time (ms)", setter: "set_flash_time", getter: "get_flash_time", category: "Performance", min: 1, max: 1000, embed: 1 });

declareattribute("labels", { type: "symbol", label: "Labels List (use / for Off/On)", setter: "set_labels", getter: "get_labels", category: "Labels", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Labels", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Labels", embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Labels", embed: 1 });
declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Labels", embed: 1 });
declareattribute("text_size", { type: "int", label: "Font Size", setter: "set_text_size", getter: "get_text_size", category: "Labels", embed: 1 });

declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 1 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Popup", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup Masks", embed: 1 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup Masks", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", setter: "set_mask_performance", getter: "get_mask_performance", category: "Popup Masks", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", setter: "set_mask_labels", getter: "get_mask_labels", category: "Popup Masks", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", setter: "set_mask_geometry", getter: "get_mask_geometry", category: "Popup Masks", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Button Colors", setter: "set_mask_colors", getter: "get_mask_colors", category: "Popup Masks", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", setter: "set_mask_popup_colors", getter: "get_mask_popup_colors", category: "Popup Masks", embed: 1 });

declareattribute("text_color_mode", { type: "int", style: "enumindex", enumvals: ["Auto Luminance", "Manual / Master"], label: "Text Color Mode", setter: "set_text_color_mode", getter: "get_text_color_mode", category: "Button Colors", embed: 1 });
declareattribute("btn_color_off", { type: "rgba", style: "rgba", label: "Btn Color Off", setter: "set_btn_color_off", getter: "get_btn_color_off", category: "Button Colors", embed: 1 });
declareattribute("btn_color_on", { type: "rgba", style: "rgba", label: "Highlight (On)", setter: "set_btn_color_on", getter: "get_btn_color_on", category: "Button Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Button Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Button Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Button Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

// =============================================================
// 15. WIRELESS THEME BUS SUBSCRIBER
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
}

function loadThemeFromDict() {
  var initDict = new Dict("touch_theme_store");
  if (!initDict) return;
  try {
    if (initDict.contains("border_radius")) set_border_radius(initDict.get("border_radius"));
    if (initDict.contains("border_thickness")) set_border_thickness(initDict.get("border_thickness"));
    if (initDict.contains("border_extension")) set_border_extension(initDict.get("border_extension"));

    if (initDict.contains("btn_color_off")) set_btn_color_off(initDict.get("btn_color_off"));
    else if (initDict.contains("bg_color")) set_btn_color_off(initDict.get("bg_color"));

    if (initDict.contains("border_color")) set_border_color(initDict.get("border_color"));
    if (initDict.contains("text_color")) set_text_color(initDict.get("text_color"));

    if (initDict.contains("btn_color_on")) set_btn_color_on(initDict.get("btn_color_on"));
    else if (initDict.contains("highlight_color")) set_btn_color_on(initDict.get("highlight_color"));

    if (initDict.contains("popup_dot_color")) set_popup_dot_color(initDict.get("popup_dot_color"));
    if (initDict.contains("pop_bgcolor")) set_pop_bgcolor(initDict.get("pop_bgcolor"));
    if (initDict.contains("attr_bg_color")) set_attr_bg_color(initDict.get("attr_bg_color"));
    if (initDict.contains("attr_border_color")) set_attr_border_color(initDict.get("attr_border_color"));
    if (initDict.contains("attr_slider_color")) set_attr_slider_color(initDict.get("attr_slider_color"));
    if (initDict.contains("attr_text_color")) set_attr_text_color(initDict.get("attr_text_color"));

    redraw_all();
  } catch(e) {}
}

function onThemeUpdate(theme) {
  if (!theme) return;
  try {
    if (theme.border_radius !== undefined) set_border_radius(theme.border_radius);
    if (theme.border_thickness !== undefined) set_border_thickness(theme.border_thickness);
    if (theme.border_extension !== undefined) set_border_extension(theme.border_extension);

    if (theme.btn_color_off) set_btn_color_off(theme.btn_color_off);
    else if (theme.bg_color) set_btn_color_off(theme.bg_color);

    if (theme.border_color) set_border_color(theme.border_color);

    if (theme.btn_color_on) set_btn_color_on(theme.btn_color_on);
    else if (theme.highlight_color) set_btn_color_on(theme.highlight_color);

    if (theme.text_color) set_text_color(theme.text_color);

    if (theme.popup_dot_color) set_popup_dot_color(theme.popup_dot_color);
    if (theme.pop_bgcolor) set_pop_bgcolor(theme.pop_bgcolor);
    if (theme.attr_bg_color) set_attr_bg_color(theme.attr_bg_color);
    if (theme.attr_border_color) set_attr_border_color(theme.attr_border_color);
    if (theme.attr_slider_color) set_attr_slider_color(theme.attr_slider_color);
    if (theme.attr_text_color) set_attr_text_color(theme.attr_text_color);

    redraw_all();
  } catch(e) {}
}

themeBus.subscribers[uniqueID] = onThemeUpdate;

if (themeBus && themeBus.theme && (themeBus.theme.bg_color || themeBus.theme.border_color)) {
  onThemeUpdate(themeBus.theme);
} else {
  loadThemeFromDict();
}

// =============================================================
// 16. PERSISTENCE (SAVE) & LIFECYCLE DESTRUCTION
// =============================================================
function save() {
  embedmessage("set_count", count);
  embedmessage("set_direction", direction);
  embedmessage("set_group_mode", group_mode);
  embedmessage("set_all_modes", global_mode);
  embedmessage("set_flash_time", flash_time);
  embedmessage("set_modes", button_modes.slice(0, count).join(" "));
  embedmessage("set_labels", labels_raw);

  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_font_style", font_style);
  embedmessage("set_font_name", font_name);
  embedmessage("set_text_size", text_size);

  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);

  embedmessage("set_allow_popup", allow_popup);
  embedmessage("set_show_settings_attrs", show_settings_attrs);
  embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);

  embedmessage("set_mask_performance", mask_performance);
  embedmessage("set_mask_labels", mask_labels);
  embedmessage("set_mask_geometry", mask_geometry);
  embedmessage("set_mask_colors", mask_colors);
  embedmessage("set_mask_popup_colors", mask_popup_colors);

  embedmessage("set_text_color_mode", text_color_mode);
  embedmessage("set_btn_color_off", btn_color_off[0], btn_color_off[1], btn_color_off[2], btn_color_off[3]);
  embedmessage("set_btn_color_on", btn_color_on[0], btn_color_on[1], btn_color_on[2], btn_color_on[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  var flatStates = [];
  for (var s = 0; s < count; s++) {
    var m = button_modes[s] !== undefined ? button_modes[s] : global_mode;
    flatStates.push((m === 1) ? (states[s] || 0) : 0);
  }
  embedmessage.apply(this, ["set"].concat(flatStates));
}

function notifydeleted() {
  if (render_task) {
    try { render_task.cancel(); } catch (e) {}
  }
  if (scrollTask) {
    try { scrollTask.cancel(); } catch (e) {}
  }
  for (var i = 0; i < flash_tasks.length; i++) {
    if (flash_tasks[i]) {
      try { flash_tasks[i].cancel(); } catch (e) {}
    }
  }

  try {
    if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) {
      delete themeBus.subscribers[uniqueID];
    }
  } catch (e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}

  try { if (popupWindow) popupWindow.free(); } catch (e) {}
  try { if (colorWindow) colorWindow.free(); } catch (e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch (e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}

  popupWindow = null;
  colorWindow = null;
  outMatrix = null;
  colorMatrix = null;
}

// Initial Sync
sync_arrays();

// Attach Jitter Listeners
windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
colorListener  = new JitterListener(colorWindow.name, colorWindowListenerCallback);