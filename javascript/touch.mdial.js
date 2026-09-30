// ============================================================================
// touch.mdial.js - Max 9 v8ui / jsui
// Multi-Dial Strip / Platter Array with Built-in MC Gain Curves,
// Dual-Domain Outlets, Dedicated Unpack List Outlet, Audio Meters,
// Per-Dial Multipliers, Full Per-Dial Typography & Physics, and Popup Inspector.
//
// Outlets (modeled after Max [function]):
//   Outlet 0 (Far Left):   Full scaled list for [unpack 0. 0. 0.]
//   Outlet 1 (Mid-Left):   MC Line messages for [mc.line~ 20]
//   Outlet 2 (Center):     Event message [name/tag value] for [route]
//   Outlet 3 (Mid-Right):  Active dial index (1..count, 0 on release)
//   Outlet 4 (Far Right):  Active channel count integer (for @chans)
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 5;

setinletassist(0, "Inlet: float / list / [tag value] / meter list / messages");
setoutletassist(0, "Outlet 0: Scaled values list for [unpack]");
setoutletassist(1, "Outlet 1: MC Line messages for [mc.line~]");
setoutletassist(2, "Outlet 2: Event message [name/tag value] for [route]");
setoutletassist(3, "Outlet 3: Active dial index (1..count, 0 on release)");
setoutletassist(4, "Outlet 4: Active channel count integer (for @chans)");

var uniqueID = Math.floor(Math.random() * 1000000);
var is_initializing = true; // Guard to prevent false dirtying on patch load

// =============================================================
// 1. STATE & ARRAY TOPOLOGY (UP TO 8 DIALS)
// =============================================================

// Strip-Wide Topology (Global)
var count         = 4;       // 1 to 8 dials
var max_dials     = 8;       // Hardware limit
var direction     = 0;       // 0 = Horizontal strip, 1 = Vertical strip
var dial_spacing  = 0.0;     // Pixel gap between dials
var alignment     = 0;       // 0 = Strip, 1 = Offset Up, 2 = Offset Down
var offset_amount = 0.5;     // 0.0 to 1.0 (zigzag shift)

var current_w = 210;
var current_h = 70;

// DSP Gain Curve Engine for mc.line~
var gain_exponent  = 1.6;
var use_gain_curve = 1;      // 1 = Output pow(val * mult, 1.6), 0 = Linear scaled * mult
var ramp_time      = 20;     // Default 20ms smoothing ramp for mc.line~

// Multichannel Liquid Audio Meter Levels (0.0 to 1.0)
var meter_levels = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

// Dial Normalized Values
var vals        = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
var target_vals = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];

// --- TAB 1: PERFORMANCE ARRAYS (Per-Dial) ---
var interaction_modes = [0, 0, 0, 0, 0, 0, 0, 0];       // 0 = Touch, 1 = Mouse
var mouse_modes       = [1, 1, 1, 1, 1, 1, 1, 1];       // 0 = Vertical, 1 = Radial
var min_vals          = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
var max_vals          = [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0];
var step_amounts      = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
var decimal_digits    = [1, 1, 1, 1, 1, 1, 1, 1];       // 0 to 8 decimal precision
var integer_digits    = [1, 1, 1, 1, 1, 1, 1, 1];       // 1 to 12 integer padding count
var multipliers       = [0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]; // Scale for DSP gain

// --- TAB 2: GEOMETRY ARRAYS (Per-Dial) ---
var dial_sizes    = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; // 0.0 to 1.0 (relative radius)
var dial_styles   = [0, 0, 0, 0, 0, 0, 0, 0];                 // 0 = Ribbon, 1 = Rail
var ribbon_fills  = [1, 1, 1, 1, 1, 1, 1, 1];                 // 0 = Single Line, 1 = Arc Fill
var rotary_modes  = [0, 0, 0, 0, 0, 0, 0, 0];                 // 0 = 270, 1 = 360 Top, 2 = 360 Bottom, 3 = Continuous

// --- TAB 3: SETTINGS ARRAYS (Per-Dial Physics & Typography) ---
var slider_speeds   = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];  // 0.1 to 5.0
var step_speeds_ms  = [20, 20, 20, 20, 20, 20, 20, 20];          // 1 to 500 ms
var curve_exponents = [0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35]; // 0.0 to 2.0
var unit_modes      = [1, 1, 0, 0, 0, 0, 0, 0];                  // 0 = None, 1 = %, 2 = dB, 3 = ms, 4 = Hz
var text_sizes      = [9, 9, 9, 9, 9, 9, 9, 9];                  // 6 to 48 pt
var font_styles     = [0, 0, 0, 0, 0, 0, 0, 0];                  // 0 = Reg, 1 = Bold, 2 = Italic, 3 = Bold Italic
var label_modes     = [0, 0, 0, 0, 0, 0, 0, 0];                  // 0 = Full, 1 = No Vowels, 2 = Caps, 3 = First, 4 = None
var case_modes      = [0, 0, 0, 0, 0, 0, 0, 0];                  // 0 = First Cap, 1 = All Cap, 2 = All Small

// --- TAB 4: STYLES (Strip-Wide Geometry) ---
var borders          = 0;     // 0 = OFF, 1 = ON
var show_background  = 0;     // 0 = OFF, 1 = ON
var border_radius    = 6.0;   // Corner radius
var border_thickness = 1.2;   // Stroke thickness
var border_extension = 6.0;   // Corner bracket extension length
var track_breadth    = 3.5;   // Arc rail width
var needle_thickness = 1.8;   // Needle line stroke
var handle_size      = 4.5;   // Knob orb radius

// --- TAB 5: COLORS (Component RGBA Palettes) ---
var bg_color        = [0.12, 0.12, 0.14, 1.0];
var border_color    = [0.42, 0.42, 0.48, 1.0];
var track_color     = [0.22, 0.22, 0.26, 1.0];
var handle_color    = [1.00, 1.00, 1.00, 1.0];
var text_color      = [0.92, 0.94, 0.98, 1.0];
var mode_color      = [0.85, 0.85, 0.90, 1.0];
var popup_dot_color = [1.0, 0.0, 0.0, 1.0];
var pop_bgcolor     = [0.10, 0.10, 0.12, 1.0];

// Popup Attrui UI Colors
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

// Label Dictionaries
var alignment_names   = ["Strip", "Offset Up", "Offset Down"];
var mode_options       = ["Touch", "Mouse"];
var mouse_mode_names   = ["Vertical", "Radial"];
var style_names       = ["Ribbon", "Rail"];
var ribbon_fill_names = ["Single Line", "Arc Fill"];
var rotary_mode_names = ["270", "360 Top", "360 Bottom", "360 Continuous"];
var unit_mode_names   = ["None", "%", "dB", "ms", "Hz"];
var font_style_names  = ["Regular", "Bold", "Italic", "Bold Italic"];
var label_mode_names  = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
var case_mode_names   = ["First Cap", "All Cap", "All Small"];
var mask_tab_names    = ["1. Performance", "2. Geometry", "3. Settings", "4. Styles", "5. Colors"];

// Label Tokens
var labels_raw = "D1 D2 D3 D4 D5 D6 D7 D8";
var parsed_labels = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"];
var font_name = "Arial";

// Inspector Window & Interaction State
var show_settings_attrs = 1;
var active_mask_tab     = 0;
var active_edit_dial    = -1; // -1 = [ALL], 0..count-1 = Individual Dial

var showSettings        = 0;
var allow_popup         = 1;
var min_popup_dial_size = 88.0;
var popup_window_width  = 280;
var popup_mini_w        = 140;
var popup_mini_h        = 200;
var start_resize_w      = 140;
var start_resize_h      = 200;
var is_resizing_window  = 0;

var is_transmitting     = false;
var active_dial_pressed = -1;
var is_dragging         = 0;
var is_scrolling_drag   = 0;
var click_time          = 0;
var last_step_time      = 0;
var hold_gate_passed    = 0;
var backgroundTask      = null;

var last_x         = 0;
var last_y         = 0;
var start_click_x  = 0;
var start_click_y  = 0;
var last_angle     = 0.0;

// Sub-Window Handles & Matrix Buffers
var popupWindow  = null;
var colorWindow  = null;
var tickerWindow = null;

var outMatrix    = null;
var colorMatrix  = null;
var tickerMatrix = null;

var windowListener = null;
var colorListener  = null;
var tickerListener = null;

var active_pop_target      = -1;
var active_pop_dial        = -1;
var active_color_target    = "handle_color";
var active_ticker_target   = "min_val";
var active_ticker_column   = -1;
var is_mouse_down_anywhere = 0;

var picker_drag_zone = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

// Bound Ticker (4 Whole Digits, 3 Decimal Digits)
var whole_digits            = 4;
var ticker_decimal_digits   = 3;
var continuous_digit_floats = [];
var slider_width_px         = 24;
var slider_gap_px           = 5;

var lastMouseX = 0;
var lastMouseY = 0;

var scroll_valBoxX = 0;
var scroll_valBoxW = 100;
var scrollTask = new Task(function () {
  if (active_pop_target === -1 || active_pop_target === 50) return;
  var targetPct = clamp((lastMouseX - scroll_valBoxX) / scroll_valBoxW, 0, 1);
  apply_slider_target(active_pop_target, targetPct);
}, this);
scrollTask.interval = 15;

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 60 };

// =============================================================
// 2. DIRTY STATE & LIFECYCLE MANAGEMENT
// =============================================================
function mark_dirty() {
  if (is_initializing) return; // Never dirty the patch during load or script compile
  if (this.patcher) {
    try {
      this.patcher.dirty = 1;
      var p = this.patcher;
      while (p.parentpatcher) {
        p = p.parentpatcher;
        p.dirty = 1;
      }
    } catch (e) {}
  }
}

function redraw_all() {
  mgraphics.redraw();
  if (typeof notifyclients === "function") notifyclients();
  if (showSettings && popupWindow && popupWindow.visible) draw_popup_to_window();
}

// =============================================================
// 3. CORE MATH, AUDIO GAIN & FORMATTING UTILITIES
// =============================================================
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function getScaledValue(idx) {
  var span = max_vals[idx] - min_vals[idx];
  return min_vals[idx] + vals[idx] * span;
}

function getAllScaledValues() {
  var list = [];
  for (var i = 0; i < count; i++) list.push(getScaledValue(i));
  return list;
}

// DSP Domain Gain Calculation with Phase-Preserving Power Curve
function getGainValue(idx) {
  var mult = (multipliers[idx] !== undefined) ? multipliers[idx] : 1.0;
  var scaled = getScaledValue(idx) * mult;
  var sign = scaled < 0 ? -1.0 : 1.0;
  if (use_gain_curve) {
    return sign * Math.pow(Math.abs(scaled), gain_exponent);
  } else {
    return scaled;
  }
}

function getAllGainValues() {
  var list = [];
  for (var i = 0; i < count; i++) list.push(getGainValue(i));
  return list;
}

function isBipolar(idx) { return (min_vals[idx] < 0.0 && max_vals[idx] > 0.0); }

function get_dial_tag(idx) {
  if (idx < 0 || idx >= count) return idx + 1;
  var rawToken = parsed_labels[idx];
  if (!rawToken || rawToken === "<empty>") return idx + 1;
  var num = Number(rawToken);
  return (!isNaN(num) && rawToken !== "") ? num : rawToken;
}

// Formatted String Display honoring Per-Dial Decimals & Integer Padding
function get_formatted_value(idx) {
  var valNum = getScaledValue(idx);
  var dPrec = (decimal_digits[idx] !== undefined) ? decimal_digits[idx] : 1;
  var iCount = (integer_digits[idx] !== undefined) ? integer_digits[idx] : 1;

  var decCount = Math.max(0, Math.min(8, parseInt(dPrec, 10) || 0));
  var intCount = Math.max(1, Math.min(12, parseInt(iCount, 10) || 1));

  var sign = valNum < 0 ? "-" : "";
  var absVal = Math.abs(valNum);
  var fixedStr = absVal.toFixed(decCount);
  var parts = fixedStr.split(".");
  var intStr = parts[0];

  while (intStr.length < intCount) {
    intStr = "0" + intStr;
  }

  return (decCount > 0 && parts[1] !== undefined) ? (sign + intStr + "." + parts[1]) : (sign + intStr);
}

// Color Utility Converters
function rgbToHsv(r, g, b) {
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var d = max - min, h = 0, s = (max === 0 ? 0 : d / max), v = max;
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
  if (Array.isArray(args)) list = args;
  else if (typeof args === "object" && typeof args.length === "number") {
    for (var i = 0; i < args.length; i++) list.push(args[i]);
  } else list = [args];

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

// Bpatcher-Proof Canvas Dimensions (Direct Box Bounds)
function get_dimensions() {
  if (this.box && this.box.rect) {
    var r = this.box.rect;
    current_w = Math.max(1, r[2] - r[0]);
    current_h = Math.max(1, r[3] - r[1]);
  } else {
    var sz = mgraphics.size;
    if (sz && sz[0] > 0 && sz[1] > 0) {
      current_w = sz[0]; 
      current_h = sz[1];
    }
  }
  return { w: current_w, h: current_h };
}

function onresize(w, h) {
  if (w > 0 && h > 0) {
    current_w = w; current_h = h;
  }
  mgraphics.redraw();
}
onresize.local = 1;

function stop_scrolling() {
  if (scrollTask) {
    try { scrollTask.cancel(); } catch(e) {}
  }
}// =============================================================
// 4. ARRAY MANAGEMENT & TYPOGRAPHY HELPERS (PER-DIAL)
// =============================================================
function parse_tokens(str) {
  if (!str || typeof str !== "string") return [];
  var s = str.trim(), tokens = [];
  var re = /"([^"]+)"|'([^']+)'|([^\s"',]+)/g, match;
  while ((match = re.exec(s)) !== null) {
    if (match[1] !== undefined) tokens.push(match[1]);
    else if (match[2] !== undefined) tokens.push(match[2]);
    else if (match[3] !== undefined) tokens.push(match[3]);
  }
  return tokens;
}

function sync_arrays() {
  var rawTokens = parse_tokens(labels_raw);
  parsed_labels = [];
  for (var j = 0; j < count; j++) {
    parsed_labels.push(j < rawTokens.length ? rawTokens[j] : ("D" + (j + 1)));
  }
  if (active_edit_dial >= count) active_edit_dial = count - 1;
}

function apply_case(str, c_mode) {
  if (!str || typeof str !== "string") return "";
  if (c_mode === 1) return str.toUpperCase();
  if (c_mode === 2) return str.toLowerCase();
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\w/g, function (match) {
    return match.toUpperCase();
  });
}

function get_font_weight_idx(idx) {
  var s = font_styles[idx] !== undefined ? font_styles[idx] : 0;
  return (s === 1 || s === 3) ? "bold" : "normal";
}

function get_font_slant_idx(idx) {
  var s = font_styles[idx] !== undefined ? font_styles[idx] : 0;
  return (s === 2 || s === 3) ? "italic" : "normal";
}

function get_display_label_idx(rawTxt, idx, is_preview) {
  if (!rawTxt || typeof rawTxt !== "string") return "";
  var lMode = label_modes[idx] !== undefined ? label_modes[idx] : 0;
  var cMode = case_modes[idx] !== undefined ? case_modes[idx] : 0;

  if (lMode === 4) return "";
  if (is_preview) return apply_case(rawTxt, cMode);

  if (lMode === 2) {
    var caps = rawTxt.replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    if (caps.length > 0) return caps;
    var words = rawTxt.trim().split(/\s+/);
    var fb = "";
    for (var i = 0; i < words.length; i++) {
      if (words[i].length > 0) fb += words[i].charAt(0).toUpperCase();
    }
    return fb.length > 0 ? fb : rawTxt.charAt(0).toUpperCase();
  }
  if (lMode === 3) {
    var words3 = rawTxt.trim().split(/\s+/);
    var initials = "";
    for (var k = 0; k < words3.length; k++) {
      if (words3[k].length > 0) initials += words3[k].charAt(0).toUpperCase();
    }
    return initials.length > 0 ? initials : rawTxt.charAt(0).toUpperCase();
  }
  if (lMode === 1) {
    var cleanFull = apply_case(rawTxt, cMode);
    var words1 = cleanFull.split(/\s+/);
    var resWords = [];
    for (var j = 0; j < words1.length; j++) {
      var w = words1[j];
      if (w.length <= 1) { resWords.push(w); continue; }
      var firstChar = w.charAt(0);
      var rest = w.slice(1).replace(/[aeiouAEIOU]/g, "");
      resWords.push(firstChar + rest);
    }
    return resWords.join(" ").trim();
  }
  return apply_case(rawTxt, cMode);
}

// =============================================================
// 5. ROTARY ANGULAR GEOMETRY & VALUE MAPPING
// =============================================================
function get_dial_angles(r_mode) {
  if (r_mode === 0) {
    var spanRad = 270.0 * (Math.PI / 180.0);
    var gapRad  = 90.0 * (Math.PI / 180.0);
    var start   = (Math.PI * 0.5) + (gapRad * 0.5);
    return { start: start, span: spanRad, end: start + spanRad, is360: false, zeroAngle: Math.PI * 1.5, stopAngle: start };
  }
  if (r_mode === 1) {
    return { start: -Math.PI * 0.5, span: Math.PI * 2.0, end: Math.PI * 1.5, is360: true, zeroAngle: -Math.PI * 0.5, stopAngle: -Math.PI * 0.5 };
  }
  if (r_mode === 2) {
    return { start: Math.PI * 0.5, span: Math.PI * 2.0, end: Math.PI * 2.5, is360: true, zeroAngle: Math.PI * 0.5, stopAngle: Math.PI * 0.5 };
  }
  return { start: -Math.PI * 0.5, span: Math.PI * 2.0, end: Math.PI * 1.5, is360: true, zeroAngle: -Math.PI * 0.5, stopAngle: null };
}

function point_to_normalized_dial_val(px, py, cx, cy, r_mode) {
  var dx = px - cx, dy = py - cy;
  var clickAngle = Math.atan2(dy, dx);
  var ang = get_dial_angles(r_mode);

  var relA = clickAngle - ang.start;
  while (relA < 0) relA += Math.PI * 2.0;
  while (relA >= Math.PI * 2.0) relA -= Math.PI * 2.0;

  if (ang.is360) return clamp(relA / (Math.PI * 2.0), 0.0, 1.0);
  if (relA <= ang.span) return clamp(relA / ang.span, 0.0, 1.0);
  var distToStart = Math.PI * 2.0 - relA;
  var distToEnd = relA - ang.span;
  return (distToStart < distToEnd) ? 0.0 : 1.0;
}

// =============================================================
// 6. TOUCH STEPPING & ROTARY EASING SCHEDULER (PER-DIAL)
// =============================================================
function execute_step_on_dial(idx, targetNormVal) {
  var rMode = rotary_modes[idx] || 0;
  var isContinuous = (rMode === 3);
  var span = Math.abs(max_vals[idx] - min_vals[idx]);
  var stepSize = isNaN(step_amounts[idx]) ? 0.05 : step_amounts[idx];
  var normStep = span > 0 ? (stepSize / span) : 0.05;

  var dist = targetNormVal - vals[idx];
  if (isContinuous) {
    if (dist > 0.5) dist -= 1.0;
    else if (dist < -0.5) dist += 1.0;
  }

  var absDist = Math.abs(dist);
  if (absDist <= normStep * 0.5) {
    vals[idx] = targetNormVal;
  } else if (dist > 0) {
    vals[idx] += normStep;
  } else {
    vals[idx] -= normStep;
  }

  if (isContinuous) {
    vals[idx] = ((vals[idx] % 1.0) + 1.0) % 1.0;
  } else {
    vals[idx] = clamp(vals[idx], 0.0, 1.0);
  }

  target_vals[idx] = vals[idx];
  redraw_all();
  output_dial_event(idx);
}

function execute_easing_on_dial(idx, targetNormVal) {
  var rMode = rotary_modes[idx] || 0;
  var isContinuous = (rMode === 3);
  var dist = targetNormVal - vals[idx];

  if (isContinuous) {
    if (dist > 0.5) dist -= 1.0;
    else if (dist < -0.5) dist += 1.0;
  }

  var absDist = Math.abs(dist);
  if (absDist < 0.002) return;

  var normDist = Math.min(1.0, absDist);
  var exponent = isNaN(curve_exponents[idx]) ? 0.35 : curve_exponents[idx];
  var curveEase = Math.pow(normDist, exponent);
  var baseScale = isNaN(slider_speeds[idx]) ? 1.0 : slider_speeds[idx];
  var calculatedIncrement = 0.001 + curveEase * baseScale * 0.02;

  if (dist < 0) calculatedIncrement = -calculatedIncrement;

  var nextVal = vals[idx] + calculatedIncrement;
  if (isContinuous) {
    nextVal = ((nextVal % 1.0) + 1.0) % 1.0;
  } else {
    nextVal = clamp(nextVal, 0.0, 1.0);
  }

  if (vals[idx] !== nextVal) {
    vals[idx] = nextVal;
    target_vals[idx] = vals[idx];
    redraw_all();
    output_dial_event(idx);
  }
}

function start_touch_scheduler(is_popup_preview, dial_idx, cx, cy) {
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
  var dialHoldTimer = Math.max(1, isNaN(step_speeds_ms[dial_idx]) ? 20 : step_speeds_ms[dial_idx]);

  backgroundTask = new Task(function () {
    if (is_popup_preview) {
      if (active_pop_target !== 50 || is_mouse_down_anywhere === 0) return;
    } else {
      if (is_dragging !== 1) return;
    }
    if (interaction_modes[dial_idx] === 1) return; // Mouse mode does not step

    if (is_scrolling_drag === 1) {
      execute_easing_on_dial(dial_idx, target_vals[dial_idx]);
    } else {
      var clickTargetNorm = point_to_normalized_dial_val(start_click_x, start_click_y, cx, cy, rotary_modes[dial_idx] || 0);
      var now = new Date().getTime();
      if (hold_gate_passed === 0) {
        if (now - click_time >= 350) {
          hold_gate_passed = 1;
          last_step_time = now;
          execute_step_on_dial(dial_idx, clickTargetNorm);
        }
      } else {
        if (now - last_step_time >= dialHoldTimer) {
          last_step_time = now;
          execute_step_on_dial(dial_idx, clickTargetNorm);
        }
      }
    }
  }, this);
  backgroundTask.interval = 15;
  backgroundTask.repeat();
}

// =============================================================
// 7. CORNER BORDERS & PHYSICAL ARRAY GEOMETRY
// =============================================================
function drawCorners(ctx, x, y, w, h, r, ew, eh, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  // Top-Left
  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  else ctx.move_to(x, y);
  ctx.line_to(x + r + ew, y);
  ctx.move_to(x, y + r);
  ctx.line_to(x, y + r + eh);
  ctx.stroke();

  // Top-Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + eh);
  ctx.move_to(x + w - r - ew, y);
  ctx.line_to(x + w - r, y);
  ctx.stroke();

  // Bottom-Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
  else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - ew, y + h);
  ctx.move_to(x + w, y + h - r);
  ctx.line_to(x + w, y + h - r - eh);
  ctx.stroke();

  // Bottom-Left
  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
  else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - eh);
  ctx.move_to(x + r + ew, y + h);
  ctx.line_to(x + r, y + h);
  ctx.stroke();
}

// 3-Way Layout Calculation (Strip, Offset Up, Offset Down)
function get_dial_geometry(w, h, inset, dir, is_preview) {
  var d = (dir !== undefined) ? dir : direction;
  var totalDials = Math.max(1, count);
  var S = Math.max(0, dial_spacing);

  var rawRadii = [];
  for (var i = 0; i < totalDials; i++) {
    var sz = dial_sizes[i] !== undefined ? dial_sizes[i] : 0.5;
    rawRadii.push(18.0 + clamp(sz, 0.0, 1.0) * 42.0);
  }

  var rawCoords = [];
  if (d === 0) {
    // HORIZONTAL STRIP
    for (var j = 0; j < totalDials; j++) {
      var R_curr = rawRadii[j];
      var cy = inset + R_curr + 4.0;

      if (alignment !== 0 && totalDials > 1) {
        var R_ref = (j > 0) ? rawRadii[j - 1] : R_curr;
        var fixedShiftY = (R_ref + R_curr + 4.0) * clamp(offset_amount, 0.0, 1.0);

        if (alignment === 1) {
          if (j % 2 === 0) cy += fixedShiftY;
        } else if (alignment === 2) {
          if (j % 2 !== 0) cy += fixedShiftY;
        }
      }

      var cx;
      if (j === 0) {
        cx = inset + R_curr + 4.0;
      } else {
        var maxRequiredX = 0;
        for (var k = 0; k < j; k++) {
          var R_prev = rawRadii[k];
          var cy_prev = rawCoords[k].cy;
          var cx_prev = rawCoords[k].cx;
          var touchDist = R_prev + R_curr + S;
          var dy = Math.abs(cy - cy_prev);
          var reqX = (dy >= touchDist) ? (cx_prev + S) : (cx_prev + Math.sqrt(Math.max(0, touchDist * touchDist - dy * dy)));
          if (reqX > maxRequiredX) maxRequiredX = reqX;
        }
        cx = maxRequiredX;
      }
      rawCoords.push({ cx: cx, cy: cy, r: R_curr });
    }
  } else {
    // VERTICAL STRIP
    for (var m = 0; m < totalDials; m++) {
      var R_curr2 = rawRadii[m];
      var cx2 = inset + R_curr2 + 4.0;

      if (alignment !== 0 && totalDials > 1) {
        var R_ref2 = (m > 0) ? rawRadii[m - 1] : R_curr2;
        var fixedShiftX = (R_ref2 + R_curr2 + 4.0) * clamp(offset_amount, 0.0, 1.0);

        if (alignment === 1) {
          if (m % 2 === 0) cx2 += fixedShiftX;
        } else if (alignment === 2) {
          if (m % 2 !== 0) cx2 += fixedShiftX;
        }
      }

      var cy2;
      if (m === 0) {
        cy2 = inset + R_curr2 + 4.0;
      } else {
        var maxRequiredY = 0;
        for (var k2 = 0; k2 < m; k2++) {
          var R_prev2 = rawRadii[k2];
          var cx_prev2 = rawCoords[k2].cx;
          var cy_prev2 = rawCoords[k2].cy;
          var touchDist2 = R_prev2 + R_curr2 + S;
          var dx = Math.abs(cx2 - cx_prev2);
          var reqY = (dx >= touchDist2) ? (cy_prev2 + S) : (cy_prev2 + Math.sqrt(Math.max(0, touchDist2 * touchDist2 - dx * dx)));
          if (reqY > maxRequiredY) maxRequiredY = reqY;
        }
        cy2 = maxRequiredY;
      }
      rawCoords.push({ cx: cx2, cy: cy2, r: R_curr2 });
    }
  }

  if (!is_preview) return rawCoords;

  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (var p = 0; p < rawCoords.length; p++) {
    var c = rawCoords[p];
    if (c.cx - c.r < minX) minX = c.cx - c.r;
    if (c.cx + c.r > maxX) maxX = c.cx + c.r;
    if (c.cy - c.r < minY) minY = c.cy - c.r;
    if (c.cy + c.r > maxY) maxY = c.cy + c.r;
  }

  var clusterW = Math.max(1, maxX - minX);
  var clusterH = Math.max(1, maxY - minY);
  var availPW = Math.max(10, w - inset * 2 - 12);
  var availPH = Math.max(10, h - inset * 2 - 12);
  var zoomScale = Math.min(availPW / clusterW, availPH / clusterH);

  var scaledCoords = [];
  var pOffX = inset + (availPW - clusterW * zoomScale) * 0.5 - minX * zoomScale + 6.0;
  var pOffY = inset + (availPH - clusterH * zoomScale) * 0.5 - minY * zoomScale + 6.0;

  for (var q = 0; q < rawCoords.length; q++) {
    var orig = rawCoords[q];
    scaledCoords.push({
      cx: orig.cx * zoomScale + pOffX,
      cy: orig.cy * zoomScale + pOffY,
      r: Math.max(4.0, orig.r * zoomScale)
    });
  }
  return scaledCoords;
}// =============================================================
// 8. DIAL FACE & CHASSIS RENDERING (PER-DIAL TYPOGRAPHY & METERS)
// =============================================================
function draw_single_dial_face(ctx, geom, idx, is_preview) {
  var cx = geom.cx;
  var cy = geom.cy;
  var outerRadius = geom.r;

  var rawLabel = (idx < parsed_labels.length) ? parsed_labels[idx] : ("D" + (idx + 1));
  var dispLbl  = get_display_label_idx(rawLabel, idx, is_preview);
  var hasLabel = (dispLbl.length > 0 && label_modes[idx] !== 4);
  var valStr   = get_formatted_value(idx);

  var uMode = unit_modes[idx] || 0;
  var unitStr = (uMode === 1) ? "%" : (uMode === 2) ? "dB" : (uMode === 3) ? "ms" : (uMode === 4) ? "Hz" : "";

  var tBreadth = Math.max(1.0, track_breadth * (outerRadius / 25.0));
  var nThick   = Math.max(0.75, needle_thickness * (outerRadius / 25.0));
  var kSize    = Math.max(1.5, handle_size * (outerRadius / 25.0));
  var trackRadius = Math.max(3.0, outerRadius - tBreadth * 0.5 - 1.5);

  var dFontSize = text_sizes[idx] !== undefined ? text_sizes[idx] : 9;
  var scaleFont = is_preview ? Math.max(6, Math.round(dFontSize * (outerRadius / 42.0))) : Math.max(6, dFontSize);

  ctx.select_font_face(font_name, get_font_slant_idx(idx), get_font_weight_idx(idx));
  ctx.set_font_size(scaleFont);
  var unitFontSize = Math.max(5, Math.round(scaleFont * 0.7));

  var fe = ctx.font_extents();
  var fontAscent = (fe && (fe["0"] || fe.ascent)) || scaleFont;
  var fontHeight = fontAscent + ((fe && (fe["1"] || fe.descent)) || (scaleFont * 0.25));

  var valTm = ctx.text_measure(valStr);
  var valW = valTm ? valTm[0] : (scaleFont * 1.6);
  var unitW = 0;
  if (unitStr.length > 0) {
    ctx.set_font_size(unitFontSize);
    var uTm = ctx.text_measure(unitStr);
    unitW = uTm ? (uTm[0] + 1.0) : 5.0;
    ctx.set_font_size(scaleFont);
  }
  var totalValW = valW + unitW;

  var lblW = 0;
  if (hasLabel) {
    var lTm = ctx.text_measure(dispLbl);
    lblW = lTm ? lTm[0] : (scaleFont * 1.5);
  }

  var rMode = rotary_modes[idx] || 0;
  var ang = get_dial_angles(rMode);
  var pVal = clamp(vals[idx], 0.0, 1.0);
  var bipolarMode = isBipolar(idx);

  ctx.set_line_cap("butt");
  ctx.set_line_join("miter");

  // =========================================================
  // PER-DIAL LIQUID AUDIO METER GLOW
  // =========================================================
  var dialMeterLvl = (idx < meter_levels.length) ? clamp(meter_levels[idx], 0.0, 1.0) : 0.0;
  if (dialMeterLvl > 0.005) {
    var fillR = Math.max(2.0, trackRadius - tBreadth * 0.5);

    var meterPat = ctx.pattern_create_linear(0, cy + fillR, 0, cy - fillR);
    meterPat.add_color_stop_rgba(0.00, 0.15, 0.85, 0.35, 0.50); // Green
    meterPat.add_color_stop_rgba(0.65, 0.95, 0.80, 0.20, 0.50); // Amber
    meterPat.add_color_stop_rgba(0.90, 1.00, 0.22, 0.22, 0.52); // Red
    ctx.set_source(meterPat);

    if (dialMeterLvl >= 0.99) {
      ctx.new_path();
      ctx.arc(cx, cy, fillR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      var hFill = dialMeterLvl * 2.0 * fillR;
      var d = fillR - hFill;
      var dx = Math.sqrt(Math.max(0, fillR * fillR - d * d));
      var a1 = Math.atan2(d, dx);
      var a2 = Math.atan2(d, -dx);

      ctx.new_path();
      ctx.arc(cx, cy, fillR, a1, a2);
      ctx.close_path();
      ctx.fill();
    }
  }

  // Track Rail
  ctx.set_source_rgba(track_color);
  ctx.set_line_width(tBreadth);
  ctx.new_path();
  ctx.arc(cx, cy, trackRadius, ang.start, ang.end);
  ctx.stroke();

  // Active Value Fill
  var curAngle = ang.start + pVal * ang.span;
  var dStyle = dial_styles[idx] || 0;
  var rFill = ribbon_fills[idx] !== undefined ? ribbon_fills[idx] : 1;

  if (dStyle === 0) {
    if (rFill === 1) {
      if (bipolarMode) {
        var zeroNorm = clamp((0.0 - min_vals[idx]) / (max_vals[idx] - min_vals[idx]), 0.0, 1.0);
        var zeroAngle = ang.start + zeroNorm * ang.span;
        var aStart = Math.min(zeroAngle, curAngle);
        var aEnd   = Math.max(zeroAngle, curAngle);

        if (Math.abs(curAngle - zeroAngle) > 0.005) {
          ctx.set_source_rgba(handle_color);
          ctx.set_line_width(tBreadth);
          ctx.new_path();
          ctx.arc(cx, cy, trackRadius, aStart, aEnd);
          ctx.stroke();
        }
      } else {
        if (pVal > 0.001) {
          ctx.set_source_rgba(handle_color);
          ctx.set_line_width(tBreadth);
          ctx.new_path();
          ctx.arc(cx, cy, trackRadius, ang.start, curAngle);
          ctx.stroke();
        }
      }
    } else {
      var lineInward = Math.max(4.0, tBreadth * 0.5 + 3.0);
      var lineOutward = (tBreadth * 0.5 + 2.0);
      var rIn = Math.max(2.0, trackRadius - lineInward);
      var rOut = Math.min(outerRadius - 0.5, trackRadius + lineOutward);

      ctx.set_source_rgba(handle_color);
      ctx.set_line_width(nThick);
      ctx.new_path();
      ctx.move_to(cx + rIn * Math.cos(curAngle), cy + rIn * Math.sin(curAngle));
      ctx.line_to(cx + rOut * Math.cos(curAngle), cy + rOut * Math.sin(curAngle));
      ctx.stroke();
    }
  } else {
    var knobR = Math.max(2.0, kSize);
    var kX = cx + trackRadius * Math.cos(curAngle);
    var kY = cy + trackRadius * Math.sin(curAngle);
    var needleHalfLen = knobR + 2.5;

    ctx.set_source_rgba(handle_color);
    ctx.set_line_width(nThick);
    ctx.new_path();
    ctx.move_to(kX - needleHalfLen * Math.cos(curAngle), kY - needleHalfLen * Math.sin(curAngle));
    ctx.line_to(kX + needleHalfLen * Math.cos(curAngle), kY + needleHalfLen * Math.sin(curAngle));
    ctx.stroke();

    ctx.set_source_rgba(0.0, 0.0, 0.0, 0.65);
    ctx.new_path();
    ctx.arc(kX + 0.5, kY + 0.5, knobR + 1.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.set_source_rgba(handle_color);
    ctx.new_path();
    ctx.arc(kX, kY, knobR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Typography
  if (hasLabel) {
    var lblY = cy - fontHeight * 0.15;
    ctx.set_source_rgba(mode_color);
    ctx.move_to(Math.round(cx - lblW * 0.5), Math.round(lblY));
    ctx.show_text(dispLbl);

    var valY = cy + fontHeight * 0.85;
    var startValX = cx - totalValW * 0.5;
    ctx.set_source_rgba(text_color);
    ctx.move_to(Math.round(startValX), Math.round(valY));
    ctx.show_text(valStr);

    if (unitStr.length > 0) {
      ctx.set_font_size(unitFontSize);
      ctx.set_source_rgba(mode_color);
      ctx.move_to(Math.round(startValX + valW + 1.0), Math.round(valY - fontAscent * 0.22));
      ctx.show_text(unitStr);
      ctx.set_font_size(scaleFont);
    }
  } else {
    var singleY = cy + fontAscent * 0.35;
    var startValX2 = cx - totalValW * 0.5;
    ctx.set_source_rgba(text_color);
    ctx.move_to(Math.round(startValX2), Math.round(singleY));
    ctx.show_text(valStr);

    if (unitStr.length > 0) {
      ctx.set_font_size(unitFontSize);
      ctx.set_source_rgba(mode_color);
      ctx.move_to(Math.round(startValX2 + valW + 1.0), Math.round(singleY - fontAscent * 0.22));
      ctx.show_text(unitStr);
      ctx.set_font_size(scaleFont);
    }
  }
}

function draw_mdial_strip(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 6.0 : border_radius;
  var r = Math.max(0, Math.min(radVal, rw * 0.5, rh * 0.5));
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  if (show_background === 1 && bg_color && bg_color[3] > 0.001) {
    ctx.set_source_rgba(bg_color);
    ctx.new_path();
    if (r > 0) {
      ctx.move_to(inset + r, inset);
      ctx.line_to(inset + rw - r, inset);
      ctx.arc(inset + rw - r, inset + r, r, -Math.PI / 2, 0);
      ctx.line_to(inset + rw, inset + rh - r);
      ctx.arc(inset + rw - r, inset + rh - r, r, 0, Math.PI / 2);
      ctx.line_to(inset + r, inset + rh);
      ctx.arc(inset + r, inset + rh - r, r, Math.PI / 2, Math.PI);
      ctx.line_to(inset, inset + r);
      ctx.arc(inset + r, inset + r, r, Math.PI, -Math.PI / 2);
      ctx.close_path();
    } else {
      ctx.rectangle(inset, inset, rw, rh);
    }
    ctx.fill();
  }

  if (borders === 1 && b > 0 && border_color && border_color[3] > 0.001) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  var geomList = get_dial_geometry(w, h, inset, direction, is_preview);
  var numDials = Math.min(count, geomList.length);

  for (var i = 0; i < numDials; i++) {
    draw_single_dial_face(ctx, geomList[i], i, is_preview);
  }

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
  draw_mdial_strip(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 9. DUAL-DOMAIN OUTLET DISPATCH ENGINE (MODELED AFTER [function])
// =============================================================
// Outlet 0: Full scaled list -> for [unpack 0. 0.]
// Outlet 1: MC line message -> for [mc.line~ 20]
// Outlet 2: Event message -> [name/tag value] for [route]
// Outlet 3: Active dial index (1..count, 0 on release)
// Outlet 4: Channel count integer (for @chans)
function output_dial_event(idx) {
  if (is_transmitting || idx < 0 || idx >= count) return;
  is_transmitting = true;
  try {
    outlet(4, count);
    outlet(3, idx + 1);
    outlet(2, [get_dial_tag(idx), getScaledValue(idx)]);
    
    // Outlet 1: Targets ONLY active dial channel in mc.line~
    outlet(1, ["target", idx + 1]);
    outlet(1, [getGainValue(idx), ramp_time]);

    // Outlet 0: Full list of all dialed values directly for [unpack]
    outlet(0, getAllScaledValues());
  } finally {
    is_transmitting = false;
  }
}

function output_all_values() {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    outlet(4, count);
    outlet(3, 0);
    for (var i = 0; i < count; i++) {
      outlet(2, [get_dial_tag(i), getScaledValue(i)]);
      
      // Outlet 1: Target each channel in mc.line~
      outlet(1, ["target", i + 1]);
      outlet(1, [getGainValue(i), ramp_time]);
    }
    // Outlet 0: Full list for [unpack]
    outlet(0, getAllScaledValues());
  } finally {
    is_transmitting = false;
  }
}

function output_channel_count() {
  outlet(4, count);
}

// =============================================================
// 10. CANVAS INTERACTION ENGINE (BPATCHER-PROOF)
// =============================================================
function get_hit_dial(x, y, w, h, dir, is_preview) {
  var b = border_thickness * 0.5;
  var geomList = get_dial_geometry(w, h, b, dir, is_preview);

  var bestIdx = -1;
  var bestDist = Infinity;

  for (var i = 0; i < count && i < geomList.length; i++) {
    var g = geomList[i];
    var dx = x - g.cx;
    var dy = y - g.cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= g.r + 6.0 && dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function accumulate_rotary_delta(mx, my, cx, cy, idx) {
  var dx = mx - cx, dy = my - cy;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

  var currentAngle = Math.atan2(dy, dx);
  var deltaA = currentAngle - last_angle;

  if (deltaA > Math.PI) deltaA -= Math.PI * 2.0;
  else if (deltaA < -Math.PI) deltaA += Math.PI * 2.0;

  var rMode = rotary_modes[idx] || 0;
  var ang = get_dial_angles(rMode);
  var deltaVal = (deltaA / ang.span) * slider_speeds[idx];

  if (rMode === 3) {
    target_vals[idx] = ((target_vals[idx] + deltaVal) % 1.0 + 1.0) % 1.0;
  } else {
    target_vals[idx] = clamp(target_vals[idx] + deltaVal, 0.0, 1.0);
  }

  last_angle = currentAngle;

  if (interaction_modes[idx] === 1) { // Mouse Jump
    vals[idx] = target_vals[idx];
    redraw_all();
    output_dial_event(idx);
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  var w = dims.w, h = dims.h;
  var is_right_click = (ctrl === 1);

  if (allow_popup === 1) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var dotX = w - dotMargin, dotY = dotMargin;
    var hitR = Math.max(4.0, Math.min(8.0, Math.min(w, h) * 0.20));
    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= hitR || is_right_click) {
      popup();
      return;
    }
  }

  if (button === 0) { onmouseup(); return; }

  var hit = get_hit_dial(x, y, w, h, direction, false);
  if (hit === -1) return;

  active_dial_pressed = hit;
  is_dragging = 1;
  is_scrolling_drag = 0;
  last_x = x;
  last_y = y;
  start_click_x = x;
  start_click_y = y;
  hold_gate_passed = 0;
  click_time = new Date().getTime();
  last_step_time = click_time;

  var geomList = get_dial_geometry(w, h, border_thickness * 0.5, direction, false);
  var g = geomList[hit];
  last_angle = Math.atan2(y - g.cy, x - g.cx);

  if (interaction_modes[hit] === 0) { // Touch
    var initialTarget = point_to_normalized_dial_val(x, y, g.cx, g.cy, rotary_modes[hit] || 0);
    execute_step_on_dial(hit, initialTarget);
    target_vals[hit] = vals[hit];
    start_touch_scheduler(false, hit, g.cx, g.cy);
  } else { // Mouse
    if (mouse_modes[hit] === 1) {
      target_vals[hit] = point_to_normalized_dial_val(x, y, g.cx, g.cy, rotary_modes[hit] || 0);
      vals[hit] = target_vals[hit];
      redraw_all();
      output_dial_event(hit);
    }
  }
}

function ondrag(x, y, button) {
  if (button === 0) { onmouseup(); return; }
  if (active_dial_pressed === -1) return;

  var idx = active_dial_pressed;
  var dims = get_dimensions();
  var geomList = get_dial_geometry(dims.w, dims.h, border_thickness * 0.5, direction, false);
  var g = geomList[idx];

  if (interaction_modes[idx] === 0) { // Touch Drag
    var distMoved = Math.sqrt((x - start_click_x) * (x - start_click_x) + (y - start_click_y) * (y - start_click_y));
    if (distMoved > 4 && is_scrolling_drag === 0) {
      is_scrolling_drag = 1;
      target_vals[idx] = vals[idx];
    }
    if (is_scrolling_drag === 1) {
      if (mouse_modes[idx] === 1) {
        accumulate_rotary_delta(x, y, g.cx, g.cy, idx);
      } else {
        var dy = (last_y - y);
        var deltaV = (dy / (g.r * 2.5)) * slider_speeds[idx];
        var rMode = rotary_modes[idx] || 0;
        if (rMode === 3) target_vals[idx] = ((target_vals[idx] + deltaV) % 1.0 + 1.0) % 1.0;
        else target_vals[idx] = clamp(target_vals[idx] + deltaV, 0.0, 1.0);
      }
    }
    last_x = x;
    last_y = y;
    return;
  }

  // Mouse Mode Drag
  if (mouse_modes[idx] === 1) {
    accumulate_rotary_delta(x, y, g.cx, g.cy, idx);
  } else {
    var dy2 = (last_y - y);
    var deltaV2 = (dy2 / (g.r * 2.5)) * slider_speeds[idx];
    var rMode2 = rotary_modes[idx] || 0;
    if (rMode2 === 3) vals[idx] = ((vals[idx] + deltaV2) % 1.0 + 1.0) % 1.0;
    else vals[idx] = clamp(vals[idx] + deltaV2, 0.0, 1.0);
    target_vals[idx] = vals[idx];
    last_y = y;
    redraw_all();
    output_dial_event(idx);
  }
}

function onmouseup() {
  if (active_dial_pressed !== -1) {
    outlet(3, 0); // Release index
  }
  active_dial_pressed = -1;
  is_dragging = 0;
  is_scrolling_drag = 0;
  hold_gate_passed = 0;
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
}

function onidleout() { onmouseup(); }
function onidle() { if (active_dial_pressed !== -1 || is_dragging) onmouseup(); }

function onmousewheel(x, y, deltaX, deltaY) {
  var dims = get_dimensions();
  var hit = get_hit_dial(x, y, dims.w, dims.h, direction, false);
  if (hit === -1 && active_dial_pressed !== -1) hit = active_dial_pressed;
  if (hit !== -1) {
    var delta = (deltaY !== 0 ? -deltaY : 0) * 0.005 * slider_speeds[hit];
    var rMode = rotary_modes[hit] || 0;
    if (rMode === 3) vals[hit] = ((vals[hit] + delta) % 1.0 + 1.0) % 1.0;
    else vals[hit] = clamp(vals[hit] + delta, 0.0, 1.0);
    target_vals[hit] = vals[hit];
    redraw_all();
    output_dial_event(hit);
  }
}// =============================================================
// 11. POPUP CAROUSEL INSPECTOR (5 TABS, 8 ROWS PER TAB)
// =============================================================
function ensurePopupWindows() {
  if (!popupWindow) {
    popupWindow = new JitterObject("jit.window", "mdial_set_" + uniqueID);
    popupWindow.floating = 1; 
    popupWindow.visible = 0; 
    popupWindow.border = 1; 
    popupWindow.grow = 0;
    popupWindow.mousewheel = 1;
    popupWindow.title = "Touch Multi-Dial Inspector";
    windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
  }
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", "mdial_col_" + uniqueID);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0;
    colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];
    colorMatrix = new JitterMatrix(4, "char", 200, 240);
    colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
  if (!tickerWindow) {
    tickerWindow = new JitterObject("jit.window", "mdial_num_" + uniqueID);
    tickerWindow.floating = 1; tickerWindow.visible = 0; tickerWindow.border = 1; tickerWindow.grow = 0;
    tickerWindow.title = "Bound Ticker"; tickerWindow.size = [240, 200];
    tickerMatrix = new JitterMatrix(4, "char", 240, 200);
    tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);
  }
}

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

function get_popup_min_size() {
  var minDialD = Math.max(60.0, min_popup_dial_size);
  var S = Math.max(0.0, dial_spacing);
  var totalD = Math.max(1, count);
  var off = (alignment !== 0) ? clamp(offset_amount, 0.0, 1.0) : 0.0;

  var neededW, neededH;

  if (direction === 0) {
    if (alignment === 0) {
      neededW = totalD * minDialD + (totalD - 1) * S;
      neededH = minDialD;
    } else {
      var shiftY = minDialD * off;
      var stepX = (shiftY >= minDialD + S) ? S : Math.sqrt(Math.max(10, Math.pow(minDialD + S, 2) - Math.pow(shiftY, 2)));
      neededW = minDialD + (totalD - 1) * stepX;
      neededH = minDialD + shiftY;
    }
  } else {
    if (alignment === 0) {
      neededW = minDialD;
      neededH = totalD * minDialD + (totalD - 1) * S;
    } else {
      var shiftX = minDialD * off;
      var stepY = (shiftX >= minDialD + S) ? S : Math.sqrt(Math.max(10, Math.pow(minDialD + S, 2) - Math.pow(shiftX, 2)));
      neededW = minDialD + shiftX;
      neededH = minDialD + (totalD - 1) * stepY;
    }
  }

  var minW = Math.round(neededW + 36.0);
  var minH = Math.round(neededH + 54.0);

  return { w: minW, h: minH };
}

function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];
  var d = active_edit_dial;
  var dPrefix = (d === -1) ? "[ALL] " : ("[D" + (d + 1) + "] ");
  var dSafe = (d >= 0) ? d : 0;

  if (active_mask_tab === 0) {
    // --- TAB 1: PERFORMANCE (All Per-Dial) ---
    var curMode = (d >= 0) ? interaction_modes[d] : interaction_modes[0];
    var curAxis = (d >= 0) ? mouse_modes[d] : mouse_modes[0];
    var curMin  = (d >= 0) ? min_vals[d] : min_vals[0];
    var curMax  = (d >= 0) ? max_vals[d] : max_vals[0];
    var curStep = (d >= 0) ? step_amounts[d] : step_amounts[0];
    var curDec  = (d >= 0) ? decimal_digits[d] : decimal_digits[0];
    var curInt  = (d >= 0) ? integer_digits[d] : integer_digits[0];
    var curMult = (d >= 0) ? multipliers[d] : multipliers[0];

    list.push({ name: dPrefix + "Mode", val: mode_options[curMode], is_toggle: true, target_id: 125 });
    list.push({ name: dPrefix + "Drag Axis", val: mouse_mode_names[curAxis], is_toggle: true, target_id: 108 });
    list.push({ name: dPrefix + "Min Val", val: curMin, is_ticker: true, key: "min_val", target_id: 104 });
    list.push({ name: dPrefix + "Max Val", val: curMax, is_ticker: true, key: "max_val", target_id: 105 });
    list.push({ name: dPrefix + "Step Size", val: curStep.toFixed(2), is_ticker: true, key: "step_amount", target_id: 106 });
    list.push({ name: dPrefix + "Dec Digits", val: curDec, pct: curDec / 8.0, is_slider: true, target_id: 120 });
    list.push({ name: dPrefix + "Int Digits", val: curInt, pct: (curInt - 1) / 11.0, is_slider: true, target_id: 121 });
    list.push({ name: dPrefix + "Multiplier", val: curMult, is_ticker: true, key: "multiplier", target_id: 122 });

  } else if (active_mask_tab === 1) {
    // --- TAB 2: GEOMETRY (4 Strip-Wide, 4 Per-Dial) ---
    var curSize  = (d >= 0) ? dial_sizes[d] : dial_sizes[0];
    var curStyle = (d >= 0) ? dial_styles[d] : dial_styles[0];
    var curFill  = (d >= 0) ? (ribbon_fills[d] !== undefined ? ribbon_fills[d] : 1) : ribbon_fills[0];
    var curRot   = (d >= 0) ? rotary_modes[d] : rotary_modes[0];

    list.push({ name: "Dial Count", val: count, pct: (count - 1) / 7.0, is_slider: true, target_id: 101 });
    list.push({ name: "Orientation", val: direction === 1 ? "Vertical" : "Horizontal", is_toggle: true, target_id: 102 });
    list.push({ name: "Alignment", val: alignment_names[alignment], is_toggle: true, target_id: 112 });
    list.push({ name: "Spacing", val: Math.round(dial_spacing), pct: dial_spacing / 200.0, is_slider: true, target_id: 103 });

    list.push({ name: dPrefix + "Dial Size", val: Math.round(curSize * 100) + "%", pct: curSize, is_slider: true, target_id: 309 });
    list.push({ name: dPrefix + "Style", val: style_names[curStyle || 0], is_toggle: true, target_id: 110 });
    list.push({ name: dPrefix + "Ribbon Fill", val: ribbon_fill_names[curFill], is_toggle: true, target_id: 111 });
    list.push({ name: dPrefix + "Rotary Mode", val: rotary_mode_names[curRot || 0], is_toggle: true, target_id: 109 });

  } else if (active_mask_tab === 2) {
    // --- TAB 3: SETTINGS (All Per-Dial Physics & Typography) ---
    var curSpd   = (d >= 0) ? slider_speeds[d] : slider_speeds[0];
    var curHold  = (d >= 0) ? step_speeds_ms[d] : step_speeds_ms[0];
    var curCurv  = (d >= 0) ? curve_exponents[d] : curve_exponents[0];
    var curUnit  = (d >= 0) ? unit_modes[d] : unit_modes[0];
    var curFSize = (d >= 0) ? text_sizes[d] : text_sizes[0];
    var curFStyl = (d >= 0) ? font_styles[d] : font_styles[0];
    var curLStyl = (d >= 0) ? label_modes[d] : label_modes[0];
    var curCStyl = (d >= 0) ? case_modes[d] : case_modes[0];

    list.push({ name: dPrefix + "Drag Speed", val: curSpd.toFixed(2), pct: (curSpd - 0.1) / 1.9, is_slider: true, target_id: 126 });
    list.push({ name: dPrefix + "Hold Timer", val: curHold.toFixed(0) + "ms", pct: (curHold - 5) / 95.0, is_slider: true, target_id: 127 });
    list.push({ name: dPrefix + "Curve Exp", val: curCurv.toFixed(2), pct: curCurv / 1.0, is_slider: true, target_id: 128 });
    list.push({ name: dPrefix + "Unit Suffix", val: unit_mode_names[curUnit || 0], is_toggle: true, target_id: 107 });
    list.push({ name: dPrefix + "Font Size", val: Math.round(curFSize), pct: (curFSize - 6) / 24.0, is_slider: true, target_id: 204 });
    list.push({ name: dPrefix + "Font Style", val: font_style_names[curFStyl || 0], is_toggle: true, target_id: 203 });
    list.push({ name: dPrefix + "Label Style", val: label_mode_names[curLStyl || 0], is_toggle: true, target_id: 201 });
    list.push({ name: dPrefix + "Case Style", val: case_mode_names[curCStyl || 0], is_toggle: true, target_id: 202 });

  } else if (active_mask_tab === 3) {
    // --- TAB 4: STYLES (Strip-Wide Geometry / No Prefix) ---
    list.push({ name: "Borders", val: borders ? "ON" : "OFF", is_toggle: true, target_id: 301 });
    list.push({ name: "Background", val: show_background ? "ON" : "OFF", is_toggle: true, target_id: 302 });
    list.push({ name: "Radius", val: Math.round(border_radius), pct: border_radius / 25.0, is_slider: true, target_id: 303 });
    list.push({ name: "Thickness", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 304 });
    list.push({ name: "Extension", val: Math.round(border_extension), pct: border_extension / 50.0, is_slider: true, target_id: 305 });
    list.push({ name: "Track Breadth", val: track_breadth.toFixed(1), pct: (track_breadth - 1.0) / 14.0, is_slider: true, target_id: 306 });
    list.push({ name: "Handle Size", val: handle_size.toFixed(1), pct: (handle_size - 1.0) / 19.0, is_slider: true, target_id: 307 });
    list.push({ name: "Line Size", val: needle_thickness.toFixed(1), pct: (needle_thickness - 0.5) / 9.5, is_slider: true, target_id: 308 });

  } else if (active_mask_tab === 4) {
    // --- TAB 5: COLORS (Strip-Wide Palettes / No Prefix) ---
    list.push({ name: "Face / BG Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Track Rail", val: track_color, is_color: true, key: "track_color" });
    list.push({ name: "Needle / Fill", val: handle_color, is_color: true, key: "handle_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Mode Color", val: mode_color, is_color: true, key: "mode_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
  }

  return list;
}

function get_popup_dimensions_map() {
  if (!show_settings_attrs) {
    var minDims = get_popup_min_size();
    return {
      w: Math.max(popup_mini_w, minDims.w),
      h: Math.max(popup_mini_h, minDims.h)
    };
  }
  var prevH = (direction === 1 ? Math.min(110, count * 28 + 10) : 60);
  var fixedH = 28 + prevH + 8 + 26 + 28 + 8 + (8 * 28) + 16;
  return { w: popup_window_width, h: fixedH };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    ensurePopupWindows();
    var dims = get_popup_dimensions_map();
    if (!show_settings_attrs) {
      popup_mini_w = dims.w;
      popup_mini_h = dims.h;
    }
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Touch Multi-Dial Inspector";
    outMatrix = recycleMatrix(outMatrix, dims.w, dims.h);
    popupWindow.visible = 1;
    popupWindow.front();
    draw_popup_to_window();
  } else {
    if (popupWindow) popupWindow.visible = 0;
  }
}

function draw_popup_to_window() {
  if (!showSettings || allow_popup !== 1 || !popupWindow) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_popup_to_window_deferred() {
  if (!showSettings || allow_popup !== 1 || !popupWindow) return;
  var dims = get_popup_dimensions_map();
  var w = dims.w, h = dims.h;

  popupWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  // Red Close Dot & Label
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Toggle Hide/Show Button Pill
  var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
  pCtx.set_source_rgba(attr_bg_color);
  pCtx.rectangle_rounded(tglX, tglY, tglW, tglH, 3, 3);
  pCtx.fill();

  pCtx.set_source_rgba(attr_border_color);
  pCtx.set_line_width(1.0);
  pCtx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, 3, 3);
  pCtx.stroke();

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = pCtx.text_measure(tglLabel);
  pCtx.move_to(tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // PREVIEW CHASSIS
  var prevX = 12, prevY = 28;
  var prevW, prevH;
  if (has_rows) {
    if (direction === 1) {
      prevW = Math.min(130, w - 24);
      prevX = (w - prevW) * 0.5;
      prevH = Math.min(110, count * 28 + 10);
    } else {
      prevW = w - 24;
      prevH = 60;
    }
  } else {
    prevW = w - 24;
    prevH = h - prevY - 14;
  }
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_mdial_strip(pCtx, prevW, prevH, true);
  pCtx.restore();

  if (has_rows) {
    var divY = prevY + prevH + 8;
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    // Selection Strip ([ALL] + D1..Dn)
    var selY = divY + 6, selH = 20, selW = w - 24, selX = 12;
    var allBtnW = 36;
    var remainW = selW - allBtnW - 4;
    var btnCellW = (remainW - (count - 1) * 3) / count;

    var selectColor = attr_slider_color;
    var selectTextColor = [0.10, 0.10, 0.12, 1.0];

    var isAll = (active_edit_dial === -1);
    pCtx.set_source_rgba(isAll ? selectColor : attr_bg_color);
    pCtx.rectangle_rounded(selX, selY, allBtnW, selH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(isAll ? selectColor : attr_border_color);
    pCtx.set_line_width(isAll ? 1.0 : 0.75);
    pCtx.rectangle_rounded(selX + 0.5, selY + 0.5, allBtnW - 1, selH - 1, 3, 3);
    pCtx.stroke();

    pCtx.select_font_face("Arial", "normal", "bold");
    pCtx.set_font_size(9);
    pCtx.set_source_rgba(isAll ? selectTextColor : attr_text_color);
    var allTm = pCtx.text_measure("ALL");
    pCtx.move_to(selX + (allBtnW - (allTm ? allTm[0] : 18)) * 0.5, selY + 13.5);
    pCtx.show_text("ALL");

    var dStartX = selX + allBtnW + 4;
    for (var k = 0; k < count; k++) {
      var bX = dStartX + k * (btnCellW + 3);
      var isFocused = (k === active_edit_dial);

      pCtx.set_source_rgba(isFocused ? selectColor : attr_bg_color);
      pCtx.rectangle_rounded(bX, selY, btnCellW, selH, 3, 3);
      pCtx.fill();

      pCtx.set_source_rgba(isFocused ? selectColor : attr_border_color);
      pCtx.set_line_width(isFocused ? 1.0 : 0.75);
      pCtx.rectangle_rounded(bX + 0.5, selY + 0.5, btnCellW - 1, selH - 1, 3, 3);
      pCtx.stroke();

      pCtx.select_font_face("Arial", "normal", isFocused ? "bold" : "normal");
      pCtx.set_font_size(9);
      pCtx.set_source_rgba(isFocused ? selectTextColor : attr_text_color);
      var bTxt = "D" + (k + 1);
      var bTm = pCtx.text_measure(bTxt);
      pCtx.move_to(bX + (btnCellW - (bTm ? bTm[0] : 14)) * 0.5, selY + 13.5);
      pCtx.show_text(bTxt);
    }

    // Carousel Navigation Bar
    var navY = selY + selH + 6, navH = 22, navW = w - 24, navX = 12;

    pCtx.set_source_rgba(0.08, 0.08, 0.10, 0.85);
    pCtx.rectangle_rounded(navX, navY, navW, navH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(attr_border_color);
    pCtx.set_line_width(1.0);
    pCtx.rectangle_rounded(navX + 0.5, navY + 0.5, navW - 1, navH - 1, 3, 3);
    pCtx.stroke();

    var btnW = 24;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(navX + 1, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.select_font_face("Arial", "normal", "bold");
    pCtx.set_font_size(10);
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(navX + 9, navY + 15);
    pCtx.show_text("<");

    var rBtnX = navX + navW - btnW - 1;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(rBtnX, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(rBtnX + 9, navY + 15);
    pCtx.show_text(">");

    var tabTitle = mask_tab_names[active_mask_tab] || "Category";
    var tabTm = pCtx.text_measure(tabTitle);
    var tabTW = tabTm ? tabTm[0] : 60;
    pCtx.set_source_rgba(mode_color);
    pCtx.move_to(navX + (navW - tabTW) * 0.5, navY + 15);
    pCtx.show_text(tabTitle);

    // Attribute Rows
    var rowsStartY = navY + navH + 8;
    var rowW = w - 24, rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], rY = rowsStartY + i * 28;

      pCtx.set_source_rgba(attr_bg_color);
      pCtx.rectangle(rowX, rY, rowW, 26);
      pCtx.fill();

      // Left: Label
      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      // Center Divider
      pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      // Right: Control
      var vY = rY + 4, vH = 18;

      if (r.is_color) {
        pCtx.set_source_rgba(r.val);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();
      } else if (r.is_ticker) {
        pCtx.set_source_rgba(attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], 0.35);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        pCtx.move_to(valBoxX + 6, rY + 17);

        // Define dSafe before referencing it
        var dSafe = (active_edit_dial >= 0) ? active_edit_dial : 0;
        var curDPrec = decimal_digits[dSafe !== undefined ? dSafe : 0] || 1;
        var dispTxt = (r.key === "multiplier") ? String(r.val) : parseFloat(r.val).toFixed(curDPrec);
        pCtx.show_text(dispTxt);
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

  var theImage = new Image(pCtx);
  theImage.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

// =============================================================
// 12. SUB-WINDOW: COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "track_color") return track_color;
  if (name === "handle_color") return handle_color;
  if (name === "text_color") return text_color;
  if (name === "mode_color") return mode_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  return null;
}

function get_color_target_label(name) {
  if (name === "bg_color") return "Face / BG Color";
  if (name === "border_color") return "Border Color";
  if (name === "track_color") return "Track Rail";
  if (name === "handle_color") return "Needle / Fill";
  if (name === "text_color") return "Text Color";
  if (name === "mode_color") return "Mode Color";
  if (name === "popup_dot_color") return "Popup Dot";
  if (name === "pop_bgcolor") return "Popup BG";
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
  mark_dirty();
  redraw_all();
}

function draw_color_picker_popup() {
  ensurePopupWindows();
  var winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(0.11, 0.11, 0.13, 1.0);
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
  if (event.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
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
// 13. SUB-WINDOW: BOUND TICKER (4 WHOLE DIGITS, 3 DECIMALS)
// =============================================================
function get_ticker_digit_array(current_val) {
  var total = whole_digits + ticker_decimal_digits;
  var fixed_str = Math.abs(current_val).toFixed(ticker_decimal_digits);
  var clean_str = fixed_str.replace(".", "");
  while (clean_str.length < total) clean_str = "0" + clean_str;
  var digits = [];
  for (var i = 0; i < total; i++) digits.push(parseInt(clean_str.charAt(i), 10));
  return { arr: digits, sign: current_val < 0 ? -1 : 1 };
}

function rebuild_ticker_value(digits_obj) {
  var raw_int = 0;
  var total = whole_digits + ticker_decimal_digits;
  for (var i = 0; i < total; i++) raw_int = raw_int * 10 + (digits_obj.arr[i] || 0);
  return (raw_int / Math.pow(10, ticker_decimal_digits)) * digits_obj.sign;
}

function draw_ticker_matrix_popup() {
  ensurePopupWindows();
  var winW = 240, winH = 200;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  // Close red dot
  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  ctx.arc(15, 15, 7.5, 0, Math.PI * 2);
  ctx.fill();

  var dSafe = (active_edit_dial >= 0) ? active_edit_dial : 0;
  var current_val = min_vals[dSafe];
  if (active_ticker_target === "max_val") current_val = max_vals[dSafe];
  if (active_ticker_target === "step_amount") current_val = step_amounts[dSafe];
  if (active_ticker_target === "multiplier") current_val = multipliers[dSafe];

  var total_cols = whole_digits + ticker_decimal_digits;
  var ticker_data = get_ticker_digit_array(current_val);

  // Sign indicator (+ / -) cleanly separated from the red dot at x: 35
  ctx.set_source_rgba(attr_text_color);
  ctx.set_font_size(14);
  ctx.move_to(35, 22);
  ctx.show_text(ticker_data.sign < 0 ? "-" : "+");

  var startX = 14;

  for (var i = 0; i < total_cols; i++) {
    var xOffset = startX + i * (slider_width_px + slider_gap_px);
    if (i >= whole_digits) xOffset += 8; // Spacer for decimal dot

    ctx.set_source_rgba(0, 0, 0, 0.25);
    ctx.rectangle(xOffset, 35, slider_width_px, 125);
    ctx.fill();

    var continuousVal = continuous_digit_floats[i] !== undefined ? continuous_digit_floats[i] : (ticker_data.arr[i] || 0);
    var fillHeight = clamp((continuousVal / 9.0) * 125, 0, 125);

    if (i === active_ticker_column) ctx.set_source_rgba(handle_color);
    else ctx.set_source_rgba(handle_color[0] * 0.7, handle_color[1] * 0.7, handle_color[2] * 0.7, 0.6);

    ctx.rectangle(xOffset, 160 - fillHeight, slider_width_px, fillHeight);
    ctx.fill();

    ctx.set_source_rgba(attr_text_color);
    ctx.set_font_size(11);
    ctx.move_to(xOffset + slider_width_px / 2 - 4, 185);
    ctx.show_text(String(ticker_data.arr[i] || 0));

    // Decimal point drawn between 4th and 5th columns
    if (i === whole_digits - 1) {
      ctx.set_source_rgba(attr_text_color);
      ctx.arc(xOffset + slider_width_px + 4, 155, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function update_ticker_value_and_redraw() {
  mark_dirty();
  var constrained_digit = Math.round(continuous_digit_floats[active_ticker_column]);
  var dSafe = (active_edit_dial >= 0) ? active_edit_dial : 0;
  var current_val = min_vals[dSafe];
  if (active_ticker_target === "max_val") current_val = max_vals[dSafe];
  if (active_ticker_target === "step_amount") current_val = step_amounts[dSafe];
  if (active_ticker_target === "multiplier") current_val = multipliers[dSafe];

  var inner_data = get_ticker_digit_array(current_val);
  inner_data.arr[active_ticker_column] = constrained_digit;
  var rebuilt = rebuild_ticker_value(inner_data);

  if (active_edit_dial === -1) {
    for (var k = 0; k < count; k++) {
      if (active_ticker_target === "min_val") min_vals[k] = rebuilt;
      else if (active_ticker_target === "max_val") max_vals[k] = rebuilt;
      else if (active_ticker_target === "step_amount") step_amounts[k] = Math.max(0.0001, rebuilt);
      else if (active_ticker_target === "multiplier") multipliers[k] = rebuilt; // Allows negative & zero
    }
    output_all_values();
  } else {
    var d = active_edit_dial;
    if (active_ticker_target === "min_val") min_vals[d] = rebuilt;
    else if (active_ticker_target === "max_val") max_vals[d] = rebuilt;
    else if (active_ticker_target === "step_amount") step_amounts[d] = Math.max(0.0001, rebuilt);
    else if (active_ticker_target === "multiplier") multipliers[d] = rebuilt; // Allows negative & zero
    output_dial_event(d);
  }

  draw_ticker_matrix_popup();
  redraw_all();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { active_ticker_column = -1; return; }
    if (mbut) {
      // Red dot close
      if (mx >= 4 && mx <= 26 && my >= 4 && my <= 26) {
        tickerWindow.visible = 0; active_ticker_column = -1; redraw_all(); return;
      }

      var dSafe = (active_edit_dial >= 0) ? active_edit_dial : 0;
      var current_val = min_vals[dSafe];
      if (active_ticker_target === "max_val") current_val = max_vals[dSafe];
      if (active_ticker_target === "step_amount") current_val = step_amounts[dSafe];
      if (active_ticker_target === "multiplier") current_val = multipliers[dSafe];
      var ticker_data = get_ticker_digit_array(current_val);

      // Sign toggle hit (+ / -)
      if (mx >= 35 && mx <= 55 && my >= 5 && my <= 25 && active_ticker_column === -1) {
        ticker_data.sign = ticker_data.sign * -1;
        var updated = rebuild_ticker_value(ticker_data);
        if (active_edit_dial === -1) {
          for (var k = 0; k < count; k++) {
            if (active_ticker_target === "min_val") min_vals[k] = updated;
            else if (active_ticker_target === "max_val") max_vals[k] = updated;
            else if (active_ticker_target === "step_amount") step_amounts[k] = Math.max(0.0001, updated);
            else if (active_ticker_target === "multiplier") multipliers[k] = updated; // Allows negative & zero
          }
        } else {
          var d = active_edit_dial;
          if (active_ticker_target === "min_val") min_vals[d] = updated;
          else if (active_ticker_target === "max_val") max_vals[d] = updated;
          else if (active_ticker_target === "step_amount") step_amounts[d] = Math.max(0.0001, updated);
          else if (active_ticker_target === "multiplier") multipliers[d] = updated; // Allows negative & zero
        }
        mark_dirty();
        draw_ticker_matrix_popup(); 
        redraw_all(); 
        active_ticker_column = 99; 
        return;
      }

      // Column sliders
      if (active_ticker_column === -1 || active_ticker_column === 99) {
        var total_cols = whole_digits + ticker_decimal_digits;
        var startX = 14;

        for (var i = 0; i < total_cols; i++) {
          var xOffset = startX + i * (slider_width_px + slider_gap_px);
          if (i >= whole_digits) xOffset += 8;

          if (mx >= xOffset && mx <= xOffset + slider_width_px && my >= 35 && my <= 160) {
            active_ticker_column = i;
            var target_val_col = clamp((160 - my) / 125, 0, 1) * 9.0;
            continuous_digit_floats[i] = target_val_col;
            update_ticker_value_and_redraw();
            break;
          }
        }
      }
    }
  }
}// =============================================================
// 14. POPUP INTERACTION DISPATCHER & LISTENER
// =============================================================
function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) {
    ensurePopupWindows();
    update_popup_dimensions();
  } else {
    if (popupWindow) popupWindow.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
    if (tickerWindow) tickerWindow.visible = 0;
  }
  mgraphics.redraw();
}

function apply_slider_target(target_id, targetPct) {
  mark_dirty(); 
  // Tab 2: Geometry
  if (target_id === 101) set_count(Math.round(1 + targetPct * 7));
  else if (target_id === 103) set_dial_spacing(Math.round(targetPct * 200.0));
  else if (target_id === 309) {
    var roundedSize = Math.round(targetPct * 100.0) / 100.0;
    set_dial_size(roundedSize);
  }
  // Tab 1: Digits
  else if (target_id === 120) set_decimal_digits(Math.round(targetPct * 8));
  else if (target_id === 121) set_integer_digits(Math.round(1 + targetPct * 11));
  // Tab 3: Physics & Typography
  else if (target_id === 126) set_slider_speed(0.1 + targetPct * 1.9);
  else if (target_id === 127) set_step_speed_ms(Math.round(5 + targetPct * 95));
  else if (target_id === 128) set_curve_exponent(targetPct * 1.0);
  else if (target_id === 204) set_text_size(Math.round(6 + targetPct * 24));
  // Tab 4: Styles
  else if (target_id === 301) set_borders(targetPct > 0.5 ? 1 : 0);
  else if (target_id === 302) set_show_background(targetPct > 0.5 ? 1 : 0);
  else if (target_id === 303) set_border_radius(Math.round(targetPct * 25.0));
  else if (target_id === 304) set_border_thickness(Math.round(targetPct * 100.0) / 10.0);
  else if (target_id === 305) set_border_extension(Math.round(targetPct * 50.0));
  else if (target_id === 306) set_track_breadth(Math.round((1.0 + targetPct * 14.0) * 10.0) / 10.0);
  else if (target_id === 307) set_handle_size(Math.round((1.0 + targetPct * 19.0) * 10.0) / 10.0);
  else if (target_id === 308) set_needle_thickness(Math.round((0.5 + targetPct * 9.5) * 10.0) / 10.0);
  redraw_all();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { 
    showSettings = 0; 
    is_resizing_window = 0; 
    active_pop_target = -1;
    active_pop_dial = -1;
    return; 
  }

  var dims = get_popup_dimensions_map();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;
  var pr = cached_preview_rect;

  // 1. Mouse Wheel
  if (event.eventname === "mousewheel") {
    var rawArgs = arrayfromargs(event.args);
    var mx = rawArgs[0], my = rawArgs[1], dY = rawArgs[3];

    if (rawArgs.length >= 4) {
      if (Math.abs(rawArgs[0]) <= 30 && Math.abs(rawArgs[1]) <= 30 && (rawArgs[2] > 20 || rawArgs[3] > 20)) {
        dY = rawArgs[1]; mx = rawArgs[2]; my = rawArgs[3];
      }
    }

    if (dY !== undefined && dY !== 0) {
      var localX = mx - pr.x;
      var localY = my - pr.y;
      var hitScroll = get_hit_dial(localX, localY, pr.w, pr.h, direction, true);

      if (hitScroll === -1 && active_pop_dial !== -1) hitScroll = active_pop_dial;
      if (hitScroll === -1 && active_edit_dial >= 0 && active_edit_dial < count) hitScroll = active_edit_dial;

      if (hitScroll !== -1) {
        var scrollDelta = (-dY * 0.005) * slider_speeds[hitScroll];
        var rMode = rotary_modes[hitScroll] || 0;

        if (rMode === 3) vals[hitScroll] = ((vals[hitScroll] + scrollDelta) % 1.0 + 1.0) % 1.0;
        else vals[hitScroll] = clamp(vals[hitScroll] + scrollDelta, 0.0, 1.0);

        target_vals[hitScroll] = vals[hitScroll];
        output_dial_event(hitScroll);
        redraw_all();
      }
    }
    return;
  }

  // 2. Mouse Click & Drag
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = (mbut === 1 && is_mouse_down_anywhere === 0);
    is_mouse_down_anywhere = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    var divY = pr.y + pr.h + 8;
    var selY = divY + 6, selH = 20, selW = w - 24, selX = 12;
    var allBtnW = 36;
    var remainW = selW - allBtnW - 4;
    var btnCellW = (remainW - (count - 1) * 3) / count;

    var navY = selY + selH + 6, navH = 22, navW = w - 24, navX = 12;
    var btnW = 24, rBtnX = navX + navW - btnW - 1;

    var rowsStartY = navY + navH + 8;
    var rowW = w - 24, rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    // Mouse up
    if (mbut === 0) {
      is_resizing_window = 0;
      if (active_pop_target === 50) {
        outlet(3, 0);
        active_pop_dial = -1;
        is_dragging = 0;
        is_scrolling_drag = 0;
        hold_gate_passed = 0;
        if (backgroundTask) {
          backgroundTask.cancel();
          backgroundTask = null;
        }
      }
      active_pop_target = -1;
      stop_scrolling();
      return;
    }

    // Active Slider Dragging
    if (active_pop_target !== -1 && active_pop_target !== 50) {
      var dragPct = clamp((mx - valBoxX) / valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_to_window();
      return;
    }

    // Dragging Preview Dial
    if (active_pop_target === 50 && active_pop_dial !== -1) {
      var dIdx = active_pop_dial;
      var geomListP = get_dial_geometry(pr.w, pr.h, border_thickness * 0.5, direction, true);

      if (dIdx < geomListP.length) {
        var gp = geomListP[dIdx];
        var dialCX = pr.x + gp.cx;
        var dialCY = pr.y + gp.cy;

        if (interaction_modes[dIdx] === 0) {
          var distMoved = Math.sqrt((mx - start_click_x) * (mx - start_click_x) + (my - start_click_y) * (my - start_click_y));
          if (distMoved > 4 && is_scrolling_drag === 0) {
            is_scrolling_drag = 1;
            target_vals[dIdx] = vals[dIdx];
          }
          if (is_scrolling_drag === 1) {
            if (mouse_modes[dIdx] === 1) {
              accumulate_rotary_delta(mx, my, dialCX, dialCY, dIdx);
            } else {
              var dy = (last_y - my);
              var deltaV = (dy / (gp.r * 2.5)) * slider_speeds[dIdx];
              var rMode = rotary_modes[dIdx] || 0;
              if (rMode === 3) target_vals[dIdx] = ((target_vals[dIdx] + deltaV) % 1.0 + 1.0) % 1.0;
              else target_vals[dIdx] = clamp(target_vals[dIdx] + deltaV, 0.0, 1.0);
            }
          }
          last_x = mx;
          last_y = my;
          return;
        }

        if (mouse_modes[dIdx] === 1) {
          accumulate_rotary_delta(mx, my, dialCX, dialCY, dIdx);
        } else {
          var dy2 = (last_y - my);
          var deltaV2 = (dy2 / (gp.r * 2.5)) * slider_speeds[dIdx];
          var rMode2 = rotary_modes[dIdx] || 0;
          if (rMode2 === 3) vals[dIdx] = ((vals[dIdx] + deltaV2) % 1.0 + 1.0) % 1.0;
          else vals[dIdx] = clamp(vals[dIdx] + deltaV2, 0.0, 1.0);
          target_vals[dIdx] = vals[dIdx];
          last_y = my;
          redraw_all();
          output_dial_event(dIdx);
        }
      }
      return;
    }

    // Mini Window Drag Resize
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      var minDims = get_popup_min_size();

      popup_mini_w = Math.max(minDims.w, Math.min(start_resize_w + deltaW, 3840));
      popup_mini_h = Math.max(minDims.h, Math.min(start_resize_h + deltaH, 2160));

      update_popup_dimensions();
      return;
    }

    // Corner Grab Handle Hit
    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx; start_click_y = my;
      start_resize_w = w;  start_resize_h = h;
      return;
    }

    // Close Button
    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      update_popup_dimensions();
      return;
    }

    // Toggle Hide/Show Pill
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // Dial Click in Preview
    if (mbut && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      var localX = mx - pr.x;
      var localY = my - pr.y;
      var hitDial = get_hit_dial(localX, localY, pr.w, pr.h, direction, true);

      if (hitDial !== -1) {
        active_pop_target = 50;
        active_pop_dial = hitDial;
        start_click_x = mx;
        start_click_y = my;
        last_x = mx;
        last_y = my;
        hold_gate_passed = 0;
        is_scrolling_drag = 0;
        click_time = new Date().getTime();
        last_step_time = click_time;

        var geomP2 = get_dial_geometry(pr.w, pr.h, border_thickness * 0.5, direction, true);
        var gHit = geomP2[hitDial];
        var hitCX = pr.x + gHit.cx;
        var hitCY = pr.y + gHit.cy;
        last_angle = Math.atan2(my - hitCY, mx - hitCX);

        if (interaction_modes[hitDial] === 0) {
          var targetNorm = point_to_normalized_dial_val(mx, my, hitCX, hitCY, rotary_modes[hitDial] || 0);
          execute_step_on_dial(hitDial, targetNorm);
          target_vals[hitDial] = vals[hitDial];
          start_touch_scheduler(true, hitDial, hitCX, hitCY);
        } else {
          target_vals[hitDial] = point_to_normalized_dial_val(mx, my, hitCX, hitCY, rotary_modes[hitDial] || 0);
          vals[hitDial] = target_vals[hitDial];
          redraw_all();
          output_dial_event(hitDial);
        }
        return;
      }
    }

    if (!has_rows) return;

    // Focused Dial Selector Strip ([ALL] + D1..D8)
    if (is_pop_tap && my >= selY && my <= selY + selH && mx >= selX && mx <= selX + selW) {
      if (mx <= selX + allBtnW) {
        active_edit_dial = -1;
      } else {
        var dStartX2 = selX + allBtnW + 4;
        var clickedD = Math.floor((mx - dStartX2) / (btnCellW + 3));
        if (clickedD >= 0 && clickedD < count) {
          active_edit_dial = clickedD;
        }
      }
      draw_popup_to_window();
      return;
    }

    // Carousel Navigation Bar Hit
    if (is_pop_tap && my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
      if (mx <= navX + btnW + 4) {
        active_mask_tab = (active_mask_tab - 1 + 5) % 5;
      } else if (mx >= rBtnX - 4) {
        active_mask_tab = (active_mask_tab + 1) % 5;
      } else {
        active_mask_tab = (active_mask_tab + 1) % 5;
      }
      update_popup_dimensions();
      return;
    }

    // Attribute Rows Click & Drag
    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + (rows.length * 28)) {
      var rIdx = Math.floor((my - rowsStartY) / 28);
      if (rIdx >= 0 && rIdx < rows.length) {
        var r = rows[rIdx];
        var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);
        var d = active_edit_dial;

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          scroll_valBoxX = valBoxX;
          scroll_valBoxW = valBoxW;
          apply_slider_target(r.target_id, pct);
          stop_scrolling();
          if (scrollTask) scrollTask.repeat();
        } else if (is_pop_tap) {
          mark_dirty();
          // Tab 2 Toggles
          if (r.target_id === 102) set_direction(direction ? 0 : 1);
          else if (r.target_id === 112) set_alignment((alignment + 1) % 3);
          else if (r.target_id === 110) {
            var nextS = dial_styles[d >= 0 ? d : 0] ? 0 : 1;
            if (d === -1) for (var ds = 0; ds < max_dials; ds++) dial_styles[ds] = nextS;
            else dial_styles[d] = nextS;
          } else if (r.target_id === 111) {
            var nextF = ribbon_fills[d >= 0 ? d : 0] ? 0 : 1;
            if (d === -1) for (var rf = 0; rf < max_dials; rf++) ribbon_fills[rf] = nextF;
            else ribbon_fills[d] = nextF;
          } else if (r.target_id === 109) {
            var nextR = ((rotary_modes[d >= 0 ? d : 0] || 0) + 1) % 4;
            if (d === -1) for (var rm = 0; rm < max_dials; rm++) rotary_modes[rm] = nextR;
            else rotary_modes[d] = nextR;
          } 
          // Tab 1 Toggles
          else if (r.target_id === 125) {
            var nextMode = interaction_modes[d >= 0 ? d : 0] ? 0 : 1;
            if (d === -1) for (var im = 0; im < max_dials; im++) interaction_modes[im] = nextMode;
            else interaction_modes[d] = nextMode;
          } else if (r.target_id === 108) {
            var nextM = mouse_modes[d >= 0 ? d : 0] ? 0 : 1;
            if (d === -1) for (var ma = 0; ma < max_dials; ma++) mouse_modes[ma] = nextM;
            else mouse_modes[d] = nextM;
          }
          // Tab 3 Toggles
          else if (r.target_id === 107) {
            var nextU = ((unit_modes[d >= 0 ? d : 0] || 0) + 1) % 5;
            if (d === -1) for (var u = 0; u < max_dials; u++) unit_modes[u] = nextU;
            else unit_modes[d] = nextU;
          } else if (r.target_id === 203) {
            var nextFS = ((font_styles[d >= 0 ? d : 0] || 0) + 1) % 4;
            if (d === -1) for (var fs = 0; fs < max_dials; fs++) font_styles[fs] = nextFS;
            else font_styles[d] = nextFS;
          } else if (r.target_id === 201) {
            var nextLM = ((label_modes[d >= 0 ? d : 0] || 0) + 1) % 5;
            if (d === -1) for (var lm = 0; lm < max_dials; lm++) label_modes[lm] = nextLM;
            else label_modes[d] = nextLM;
          } else if (r.target_id === 202) {
            var nextCM = ((case_modes[d >= 0 ? d : 0] || 0) + 1) % 3;
            if (d === -1) for (var cm = 0; cm < max_dials; cm++) case_modes[cm] = nextCM;
            else case_modes[d] = nextCM;
          }
          // Tab 4 Toggles
          else if (r.target_id === 301) set_borders(borders ? 0 : 1);
          else if (r.target_id === 302) set_show_background(show_background ? 0 : 1);
          // Ticker Sub-Window
          else if (r.is_ticker) {
            ensurePopupWindows();
            active_ticker_target = r.key;
            colorWindow.visible = 0;
            if (popupWindow && popupWindow.pos) {
              tickerWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + rIdx * 28 + 14];
            }
            continuous_digit_floats = [];
            tickerWindow.visible = 1;
            tickerWindow.front();
            draw_ticker_matrix_popup();
          } 
          // Color Picker Sub-Window
          else if (r.is_color) {
            ensurePopupWindows();
            active_color_target = r.key;
            tickerWindow.visible = 0;
            initPickerFromTarget();
            if (popupWindow && popupWindow.pos) {
              colorWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + rIdx * 28 + 14];
            }
            colorWindow.visible = 1;
            colorWindow.front();
            draw_color_picker_popup();
          }
          redraw_all();
        }
        draw_popup_to_window();
      }
    }
  }
}

// =============================================================
// 15. SETTERS, GETTERS & INDEXED PERSISTENCE LOADERS
// =============================================================

// --- TAB 1: PERFORMANCE ---
function set_mode(v) {
  var val = (typeof v === "string") ? ((v.toLowerCase().indexOf("mouse") !== -1 || v === "1") ? 1 : 0) : (parseInt(v, 10) ? 1 : 0);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) interaction_modes[i] = val;
  } else {
    interaction_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_mode() { return interaction_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) interaction_modes[idx] = parseInt(v, 10) ? 1 : 0; }

function set_mouse_mode(v) {
  var val = (typeof v === "string") ? (v.toLowerCase().indexOf("rad") !== -1 ? 1 : 0) : (parseInt(v, 10) ? 1 : 0);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) mouse_modes[i] = val;
  } else {
    mouse_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_mouse_mode() { return mouse_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_mouse_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) mouse_modes[idx] = parseInt(v, 10) ? 1 : 0; }

function set_min_val(v) {
  var val = Number(v);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) min_vals[i] = val;
  } else {
    min_vals[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_min_val() { return min_vals[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_min_val_idx(idx, v) { if (idx >= 0 && idx < max_dials) min_vals[idx] = Number(v); }

function set_max_val(v) {
  var val = Number(v);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) max_vals[i] = val;
  } else {
    max_vals[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_max_val() { return max_vals[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_max_val_idx(idx, v) { if (idx >= 0 && idx < max_dials) max_vals[idx] = Number(v); }

function set_step_amount(v) {
  var val = Math.max(0.0001, Number(v));
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) step_amounts[i] = val;
  } else {
    step_amounts[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_step_amount() { return step_amounts[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_step_amount_idx(idx, v) { if (idx >= 0 && idx < max_dials) step_amounts[idx] = Math.max(0.0001, Number(v)); }

function set_decimal_digits(v) {
  var p = clamp(parseInt(v, 10) || 0, 0, 8);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) decimal_digits[i] = p;
  } else {
    decimal_digits[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_decimal_digits() { return decimal_digits[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_dec_digits_idx(idx, v) { if (idx >= 0 && idx < max_dials) decimal_digits[idx] = clamp(parseInt(v, 10) || 0, 0, 8); }

function set_integer_digits(v) {
  var p = clamp(parseInt(v, 10) || 1, 1, 12);
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) integer_digits[i] = p;
  } else {
    integer_digits[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_integer_digits() { return integer_digits[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_int_digits_idx(idx, v) { if (idx >= 0 && idx < max_dials) integer_digits[idx] = clamp(parseInt(v, 10) || 1, 1, 12); }

function set_multiplier(v) {
  var p = Number(v);
  if (isNaN(p)) return;
  if (active_edit_dial === -1) {
    for (var i = 0; i < max_dials; i++) multipliers[i] = p;
  } else {
    multipliers[active_edit_dial] = p;
  }
  mark_dirty();
  output_all_values();
  redraw_all();
}
function get_multiplier() { return multipliers[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_multiplier_idx(idx, v) { if (idx >= 0 && idx < max_dials) multipliers[idx] = Number(v); }

// --- TAB 2: GEOMETRY ---
function set_count(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    count = clamp(p, 1, max_dials);
    sync_arrays();
    var minDims = get_popup_min_size();
    popup_mini_w = Math.max(popup_mini_w, minDims.w);
    popup_mini_h = Math.max(popup_mini_h, minDims.h);
    update_popup_dimensions();
    output_channel_count();
    mark_dirty();
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
  var minDims = get_popup_min_size();
  popup_mini_w = minDims.w;
  popup_mini_h = minDims.h;
  update_popup_dimensions();
  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_direction() { return direction; }

function set_alignment(v) {
  if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s.indexOf("up") !== -1) alignment = 1;
    else if (s.indexOf("down") !== -1 || s.indexOf("offset") !== -1) alignment = 2;
    else alignment = 0;
  } else {
    var p = parseInt(v, 10);
    alignment = !isNaN(p) ? clamp(p, 0, 2) : 0;
  }
  var minDims = get_popup_min_size();
  popup_mini_w = Math.max(popup_mini_w, minDims.w);
  popup_mini_h = Math.max(popup_mini_h, minDims.h);
  update_popup_dimensions();
  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_alignment() { return alignment; }

function set_offset_amount(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) offset_amount = clamp(p, 0.0, 1.0);
  mark_dirty();
  redraw_all();
}
function get_offset_amount() { return offset_amount; }

function set_dial_spacing(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) dial_spacing = clamp(p, 0.0, 200.0);
  var minDims = get_popup_min_size();
  popup_mini_w = Math.max(popup_mini_w, minDims.w);
  popup_mini_h = Math.max(popup_mini_h, minDims.h);
  update_popup_dimensions();
  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_dial_spacing() { return dial_spacing; }

function set_dial_size() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length > 1) {
    // If a list of sizes is provided (e.g. on load: 0.2 0.8 0.2)
    for (var i = 0; i < count && i < args.length; i++) {
      var v = parseFloat(args[i]);
      if (!isNaN(v)) {
        if (v > 1.0) v = v / 100.0;
        dial_sizes[i] = clamp(v, 0.0, 1.0);
      }
    }
  } else {
    // Single number (from slider drag or manual entry)
    var p = parseFloat(args[0]);
    if (isNaN(p)) return;
    if (p > 1.0) p = p / 100.0;
    var clamped = clamp(p, 0.0, 1.0);

    if (active_edit_dial === -1) {
      for (var k = 0; k < max_dials; k++) dial_sizes[k] = clamped;
    } else {
      dial_sizes[active_edit_dial] = clamped;
    }
  }

  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}

function get_dial_size() {
  // Returns all dial sizes as a list to be saved: [0.2, 0.8, 0.2, ...]
  return dial_sizes.slice(0, count);
}
function set_dial_size_idx(idx, v) { if (idx >= 0 && idx < max_dials) dial_sizes[idx] = clamp(Number(v), 0.0, 1.0); }

function set_dial_style(v) {
  var val = (typeof v === "string") ? (v.toLowerCase().indexOf("rail") !== -1 ? 1 : 0) : (parseInt(v, 10) ? 1 : 0);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) dial_styles[k] = val;
  } else {
    dial_styles[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_dial_style() { return dial_styles[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_style_idx(idx, v) { if (idx >= 0 && idx < max_dials) dial_styles[idx] = parseInt(v, 10) ? 1 : 0; }

function set_ribbon_fill(v) {
  var val = (typeof v === "string") ? (v.toLowerCase().indexOf("arc") !== -1 ? 1 : 0) : (parseInt(v, 10) ? 1 : 0);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) ribbon_fills[k] = val;
  } else {
    ribbon_fills[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_ribbon_fill() { return ribbon_fills[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_ribbon_fill_idx(idx, v) { if (idx >= 0 && idx < max_dials) ribbon_fills[idx] = parseInt(v, 10) ? 1 : 0; }

function set_rotary_mode(v) {
  var val = clamp(parseInt(v, 10) || 0, 0, 3);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) rotary_modes[k] = val;
  } else {
    rotary_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_rotary_mode() { return rotary_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_rotary_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) rotary_modes[idx] = clamp(parseInt(v, 10) || 0, 0, 3); }

// --- TAB 3: SETTINGS ---
function set_slider_speed(v) {
  var p = clamp(parseFloat(v) || 1.0, 0.1, 5.0);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) slider_speeds[k] = p;
  } else {
    slider_speeds[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_slider_speed() { return slider_speeds[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_slider_speed_idx(idx, v) { if (idx >= 0 && idx < max_dials) slider_speeds[idx] = clamp(Number(v), 0.1, 5.0); }

function set_step_speed_ms(v) {
  var p = clamp(parseInt(v, 10) || 20, 1, 500);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) step_speeds_ms[k] = p;
  } else {
    step_speeds_ms[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_step_speed_ms() { return step_speeds_ms[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_step_speed_ms_idx(idx, v) { if (idx >= 0 && idx < max_dials) step_speeds_ms[idx] = clamp(parseInt(v, 10) || 20, 1, 500); }

function set_curve_exponent(v) {
  var p = clamp(parseFloat(v) || 0.35, 0.0, 2.0);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) curve_exponents[k] = p;
  } else {
    curve_exponents[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_curve_exponent() { return curve_exponents[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_curve_exponent_idx(idx, v) { if (idx >= 0 && idx < max_dials) curve_exponents[idx] = clamp(Number(v), 0.0, 2.0); }

function set_unit_mode(v) {
  var val = clamp(parseInt(v, 10) || 0, 0, 4);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) unit_modes[k] = val;
  } else {
    unit_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_unit_mode() { return unit_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_unit_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) unit_modes[idx] = clamp(parseInt(v, 10) || 0, 0, 4); }

function set_text_size(v) {
  var p = clamp(parseInt(v, 10) || 9, 6, 48);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) text_sizes[k] = p;
  } else {
    text_sizes[active_edit_dial] = p;
  }
  mark_dirty();
  redraw_all();
}
function get_text_size() { return text_sizes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_text_size_idx(idx, v) { if (idx >= 0 && idx < max_dials) text_sizes[idx] = clamp(parseInt(v, 10) || 9, 6, 48); }

function set_font_style(v) {
  var val = clamp(parseInt(v, 10) || 0, 0, 3);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) font_styles[k] = val;
  } else {
    font_styles[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_font_style() { return font_styles[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_font_style_idx(idx, v) { if (idx >= 0 && idx < max_dials) font_styles[idx] = clamp(parseInt(v, 10) || 0, 0, 3); }

function set_label_mode(v) {
  var val = clamp(parseInt(v, 10) || 0, 0, 4);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) label_modes[k] = val;
  } else {
    label_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_label_mode() { return label_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_label_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) label_modes[idx] = clamp(parseInt(v, 10) || 0, 0, 4); }

function set_case_mode(v) {
  var val = clamp(parseInt(v, 10) || 0, 0, 2);
  if (active_edit_dial === -1) {
    for (var k = 0; k < max_dials; k++) case_modes[k] = val;
  } else {
    case_modes[active_edit_dial] = val;
  }
  mark_dirty();
  redraw_all();
}
function get_case_mode() { return case_modes[(active_edit_dial >= 0) ? active_edit_dial : 0]; }
function set_case_mode_idx(idx, v) { if (idx >= 0 && idx < max_dials) case_modes[idx] = clamp(parseInt(v, 10) || 0, 0, 2); }

function set_labels() {
  var args = arrayfromargs(arguments);
  labels_raw = args.join(" ");
  sync_arrays();
  mark_dirty();
  redraw_all();
  if (typeof notifyclients === "function") notifyclients();
}
function get_labels() { return labels_raw; }

function set_font_name(v) {
  if (v !== undefined && v !== null) font_name = String(v);
  mark_dirty();
  redraw_all();
}
function get_font_name() { return font_name; }

// --- TAB 4: STYLES ---
function set_borders(v) { borders = parseInt(v, 10) ? 1 : 0; mark_dirty(); redraw_all(); }
function get_borders() { return borders; }

function set_show_background(v) { show_background = parseInt(v, 10) ? 1 : 0; mark_dirty(); redraw_all(); }
function get_show_background() { return show_background; }

function set_border_radius(v) { var p = parseFloat(v); if (!isNaN(p)) border_radius = Math.max(0.0, p); mark_dirty(); redraw_all(); }
function get_border_radius() { return border_radius; }

function set_border_thickness(v) { var p = parseFloat(v); if (!isNaN(p)) border_thickness = Math.max(0.0, p); mark_dirty(); redraw_all(); }
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) { var p = parseFloat(v); if (!isNaN(p)) border_extension = Math.max(0.0, p); mark_dirty(); redraw_all(); }
function get_border_extension() { return border_extension; }

function set_track_breadth(v) { var p = parseFloat(v); if (!isNaN(p)) track_breadth = Math.max(0.5, p); mark_dirty(); redraw_all(); }
function get_track_breadth() { return track_breadth; }

function set_handle_size(v) { var p = parseFloat(v); if (!isNaN(p)) handle_size = Math.max(1.0, p); mark_dirty(); redraw_all(); }
function get_handle_size() { return handle_size; }

function set_needle_thickness(v) { var p = parseFloat(v); if (!isNaN(p)) needle_thickness = Math.max(0.5, p); mark_dirty(); redraw_all(); }
function get_needle_thickness() { return needle_thickness; }

// --- TAB 5: COLORS ---
// --- TAB 5: COLORS & POPUP THEME SETTERS ---
function set_bg_color() { bg_color = rgba_values(arguments, bg_color); mark_dirty(); redraw_all(); }
function get_bg_color() { return bg_color; }

function set_border_color() { border_color = rgba_values(arguments, border_color); mark_dirty(); redraw_all(); }
function get_border_color() { return border_color; }

function set_track_color() { track_color = rgba_values(arguments, track_color); mark_dirty(); redraw_all(); }
function get_track_color() { return track_color; }

function set_handle_color() { handle_color = rgba_values(arguments, handle_color); mark_dirty(); redraw_all(); }
function get_handle_color() { return handle_color; }

function set_text_color() { text_color = rgba_values(arguments, text_color); mark_dirty(); redraw_all(); }
function get_text_color() { return text_color; }

function set_mode_color() { mode_color = rgba_values(arguments, mode_color); mark_dirty(); redraw_all(); }
function get_mode_color() { return mode_color; }

function set_popup_dot_color() { popup_dot_color = rgba_values(arguments, popup_dot_color); mark_dirty(); redraw_all(); }
function get_popup_dot_color() { return popup_dot_color; }

function set_pop_bgcolor() { pop_bgcolor = rgba_values(arguments, pop_bgcolor); mark_dirty(); redraw_all(); }
function get_pop_bgcolor() { return pop_bgcolor; }

// Master Popup UI element color setters
function set_attr_bg() { attr_bg_color = rgba_values(arguments, attr_bg_color); mark_dirty(); redraw_all(); }
function get_attr_bg() { return attr_bg_color; }

function set_attr_border() { attr_border_color = rgba_values(arguments, attr_border_color); mark_dirty(); redraw_all(); }
function get_attr_border() { return attr_border_color; }

function set_attr_slider() { attr_slider_color = rgba_values(arguments, attr_slider_color); mark_dirty(); redraw_all(); }
function get_attr_slider() { return attr_slider_color; }

function set_attr_text() { attr_text_color = rgba_values(arguments, attr_text_color); mark_dirty(); redraw_all(); }
function get_attr_text() { return attr_text_color; }

function set_popup_bg() { set_pop_bgcolor.apply(this, arguments); }
// Core DSP Engine Attributes
function set_gain_exponent(v) { var p = parseFloat(v); if (!isNaN(p)) gain_exponent = Math.max(0.1, p); mark_dirty(); output_all_values(); }
function get_gain_exponent() { return gain_exponent; }

function set_use_gain_curve(v) { use_gain_curve = parseInt(v, 10) ? 1 : 0; mark_dirty(); output_all_values(); }
function get_use_gain_curve() { return use_gain_curve; }

function set_dial_val_idx(idx, v) { if (idx >= 0 && idx < max_dials) { vals[idx] = clamp(Number(v), 0.0, 1.0); target_vals[idx] = vals[idx]; } }

// =============================================================
// 16. PRESET & PATTR STATE SERIALIZATION
// =============================================================
function get_state() {
  return {
    val: vals.slice(0, count),
    min_val: min_vals.slice(0, count),
    max_val: max_vals.slice(0, count),
    step_amount: step_amounts.slice(0, count),
    multiplier: multipliers.slice(0, count),
    dial_size: dial_sizes.slice(0, count)
  };
}

function set_state(d) {
  if (Array.isArray(d)) {
    for (var i = 0; i < count && i < d.length; i++) {
      vals[i] = clamp(Number(d[i]), 0.0, 1.0);
      target_vals[i] = vals[i];
    }
  } else if (typeof d === "object" && d !== null) {
    if (Array.isArray(d.min_val)) for (var m = 0; m < count && m < d.min_val.length; m++) min_vals[m] = Number(d.min_val[m]);
    if (Array.isArray(d.max_val)) for (var x = 0; x < count && x < d.max_val.length; x++) max_vals[x] = Number(d.max_val[x]);
    if (Array.isArray(d.step_amount)) for (var s = 0; s < count && s < d.step_amount.length; s++) step_amounts[s] = Math.max(0.0001, Number(d.step_amount[s]));
    if (Array.isArray(d.multiplier)) for (var mu = 0; mu < count && mu < d.multiplier.length; mu++) multipliers[mu] = Number(d.multiplier[mu]);
    if (Array.isArray(d.dial_size)) for (var ds = 0; ds < count && ds < d.dial_size.length; ds++) dial_sizes[ds] = clamp(Number(d.dial_size[ds]), 0.0, 1.0);
    if (Array.isArray(d.val)) {
      for (var v = 0; v < count && v < d.val.length; v++) {
        vals[v] = clamp(Number(d.val[v]), 0.0, 1.0);
        target_vals[v] = vals[v];
      }
    }
  }
  output_all_values();
  redraw_all();
}

function morph_state(a, b, frac) {
  var rawA = (typeof a === "object" && a !== null) ? a : { val: a };
  var rawB = (typeof b === "object" && b !== null) ? b : { val: b };

  var aVals = Array.isArray(rawA.val) ? rawA.val : [Number(rawA.val || 0)];
  var bVals = Array.isArray(rawB.val) ? rawB.val : [Number(rawB.val || 0)];

  var aMin = Array.isArray(rawA.min_val) ? rawA.min_val : min_vals;
  var bMin = Array.isArray(rawB.min_val) ? rawB.min_val : min_vals;

  var aMax = Array.isArray(rawA.max_val) ? rawA.max_val : max_vals;
  var bMax = Array.isArray(rawB.max_val) ? rawB.max_val : max_vals;

  var aStep = Array.isArray(rawA.step_amount) ? rawA.step_amount : step_amounts;
  var bStep = Array.isArray(rawB.step_amount) ? rawB.step_amount : step_amounts;

  var aMult = Array.isArray(rawA.multiplier) ? rawA.multiplier : multipliers;
  var bMult = Array.isArray(rawB.multiplier) ? rawB.multiplier : multipliers;

  var aSize = Array.isArray(rawA.dial_size) ? rawA.dial_size : dial_sizes;
  var bSize = Array.isArray(rawB.dial_size) ? rawB.dial_size : dial_sizes;

  for (var i = 0; i < count; i++) {
    var v0 = i < aVals.length ? Number(aVals[i]) : vals[i];
    var v1 = i < bVals.length ? Number(bVals[i]) : vals[i];
    vals[i] = clamp(v0 + (v1 - v0) * frac, 0.0, 1.0);
    target_vals[i] = vals[i];

    var mn0 = i < aMin.length ? Number(aMin[i]) : min_vals[i];
    var mn1 = i < bMin.length ? Number(bMin[i]) : min_vals[i];
    min_vals[i] = mn0 + (mn1 - mn0) * frac;

    var mx0 = i < aMax.length ? Number(aMax[i]) : max_vals[i];
    var mx1 = i < bMax.length ? Number(bMax[i]) : max_vals[i];
    max_vals[i] = mx0 + (mx1 - mx0) * frac;

    var st0 = i < aStep.length ? Number(aStep[i]) : step_amounts[i];
    var st1 = i < bStep.length ? Number(bStep[i]) : step_amounts[i];
    step_amounts[i] = Math.max(0.0001, st0 + (st1 - st0) * frac);

    var mu0 = i < aMult.length ? Number(aMult[i]) : multipliers[i];
    var mu1 = i < bMult.length ? Number(bMult[i]) : multipliers[i];
    multipliers[i] = mu0 + (mu1 - mu0) * frac;

    var sz0 = i < aSize.length ? Number(aSize[i]) : dial_sizes[i];
    var sz1 = i < bSize.length ? Number(bSize[i]) : dial_sizes[i];
    dial_sizes[i] = clamp(sz0 + (sz1 - sz0) * frac, 0.0, 1.0);
  }

  output_all_values();
  redraw_all();
}

function getvalueof() { return getAllScaledValues(); }

function setvalueof() {
  if (is_transmitting) return;
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  for (var i = 0; i < count && i < args.length; i++) {
    var span = max_vals[i] - min_vals[i];
    var scaled = span !== 0 ? (Number(args[i]) - min_vals[i]) / span : 0.0;
    vals[i] = clamp(scaled, 0.0, 1.0);
    target_vals[i] = vals[i];
  }
  redraw_all();
  output_all_values();
}

// =============================================================
// 17. INLET MESSAGE PARSER
// =============================================================
function msg_int(v) { msg_float(v); }

function msg_float(v) {
  var parsed = parseFloat(v);
  if (isNaN(parsed)) return;
  var span = max_vals[0] - min_vals[0];
  vals[0] = clamp(span !== 0 ? (parsed - min_vals[0]) / span : 0.0, 0.0, 1.0);
  target_vals[0] = vals[0];
  redraw_all();
  output_dial_event(0);
}

function list() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;

  if (args.length === 2 && typeof args[0] === "number" && args[0] >= 1 && args[0] <= count) {
    var dIdx = Math.floor(args[0]) - 1;
    var span = max_vals[dIdx] - min_vals[dIdx];
    vals[dIdx] = clamp(span !== 0 ? (Number(args[1]) - min_vals[dIdx]) / span : 0.0, 0.0, 1.0);
    target_vals[dIdx] = vals[dIdx];
    redraw_all();
    output_dial_event(dIdx);
    return;
  }

  for (var i = 0; i < count && i < args.length; i++) {
    var span2 = max_vals[i] - min_vals[i];
    vals[i] = clamp(span2 !== 0 ? (Number(args[i]) - min_vals[i]) / span2 : 0.0, 0.0, 1.0);
    target_vals[i] = vals[i];
  }
  redraw_all();
  output_all_values();
}

function meter() {
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  for (var i = 0; i < max_dials; i++) {
    meter_levels[i] = (i < args.length) ? clamp(Number(args[i]), 0.0, 1.0) : 0.0;
  }
  mgraphics.redraw();
}

function bang() {
  output_channel_count();
  output_all_values();
}

function loadbang() {
  output_channel_count();
  if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
  else loadThemeFromDict();

  // Clear initialization guard after Max load sequence finishes
  new Task(function() {
    is_initializing = false;
  }, this).schedule(100);
}

function anything() {
  var args = arrayfromargs(arguments);
  var msg = messagename.toLowerCase();

  for (var b = 0; b < count; b++) {
    var bTag = String(get_dial_tag(b)).toLowerCase();
    if (msg === bTag && args.length > 0) {
      var valIn = Number(args[0]);
      var span = max_vals[b] - min_vals[b];
      vals[b] = clamp(span !== 0 ? (valIn - min_vals[b]) / span : 0.0, 0.0, 1.0);
      target_vals[b] = vals[b];
      redraw_all();
      output_dial_event(b);
      return;
    }
  }

  if (msg === "update" || msg === "theme_update" || msg === "refresh" || msg === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }

  var name = msg.replace(/^set_?/, "");
  if (name === "size" || name === "dial_radius" || name === "dial_scale") name = "dial_size";
  if (name === "spacing") name = "dial_spacing";
  if (name === "orientation") name = "direction";
  if (name === "align" || name === "layout") name = "alignment";
  if (name === "num_dials" || name === "dials") name = "count";
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "corners" || name === "border") name = "borders";
  if (name === "bg" || name === "background") name = "show_background";

  if (name === "decimals" || name === "decimaldigits" || name === "precision") name = "decimal_digits";
  if (name === "integers" || name === "integerdigits") name = "integer_digits";
  if (name === "mult" || name === "gain_mult" || name === "multiplier") name = "multiplier";
  if (name === "touch" || name === "mode") name = "mode";
  if (name === "linesize" || name === "line_size") name = "needle_thickness";
  if (name === "gain_curve") name = "use_gain_curve";

  // Popup Theme Aliases
  if (name === "popup_bg" || name === "pop_bg") name = "pop_bgcolor";
  if (name === "attr_bg_color") name = "attr_bg";
  if (name === "attr_border_color") name = "attr_border";
  if (name === "attr_slider_color") name = "attr_slider";
  if (name === "attr_text_color") name = "attr_text";
  if (name === "popup_dot") name = "popup_dot_color";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 18. MAX DECLAREATTRIBUTE DEFINITIONS (ALL EMBED: 1)
// =============================================================

// Tab 1: Performance
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Mouse"], label: "Interaction Mode", setter: "set_mode", getter: "get_mode", category: "Performance", embed: 1 });
declareattribute("decimal_digits", { type: "int", label: "Decimal Digits", setter: "set_decimal_digits", getter: "get_decimal_digits", category: "Performance", min: 0, max: 8, embed: 1 });
declareattribute("integer_digits", { type: "int", label: "Integer Digits", setter: "set_integer_digits", getter: "get_integer_digits", category: "Performance", min: 1, max: 12, embed: 1 });
declareattribute("multiplier", { type: "float", label: "Gain Multiplier", setter: "set_multiplier", getter: "get_multiplier", category: "Performance", embed: 1 });
declareattribute("gain_exponent", { type: "float", label: "mc.line~ Gain Exponent", setter: "set_gain_exponent", getter: "get_gain_exponent", category: "Performance", embed: 1 });
declareattribute("use_gain_curve", { type: "int", style: "onoff", label: "Output Gain Curve for mc.line~", setter: "set_use_gain_curve", getter: "get_use_gain_curve", category: "Performance", embed: 1 });

// Tab 2: Geometry
declareattribute("count", { type: "int", label: "Dial Count", setter: "set_count", getter: "get_count", category: "Geometry", min: 1, max: 8, embed: 1 });
declareattribute("direction", { type: "int", style: "enumindex", enumvals: ["Horizontal", "Vertical"], label: "Strip Orientation", setter: "set_direction", getter: "get_direction", category: "Geometry", embed: 1 });
declareattribute("alignment", { type: "int", style: "enumindex", enumvals: ["Strip", "Offset Up", "Offset Down"], label: "Alignment Mode", setter: "set_alignment", getter: "get_alignment", category: "Geometry", embed: 1 });
declareattribute("dial_spacing", { type: "float", label: "Dial Spacing", setter: "set_dial_spacing", getter: "get_dial_spacing", category: "Geometry", min: 0.0, max: 200.0, embed: 1 });
declareattribute("dial_size", { type: "float", label: "Dial Size Ratio", setter: "set_dial_size", getter: "get_dial_size", category: "Geometry", min: 0.0, max: 1.0, embed: 1 });
declareattribute("dial_style", { type: "int", style: "enumindex", enumvals: ["Ribbon", "Rail"], label: "Dial Style", setter: "set_dial_style", getter: "get_dial_style", category: "Geometry", embed: 1 });
declareattribute("ribbon_fill", { type: "int", style: "enumindex", enumvals: ["Single Line", "Arc Fill"], label: "Ribbon Fill", setter: "set_ribbon_fill", getter: "get_ribbon_fill", category: "Geometry", embed: 1 });
declareattribute("rotary_mode", { type: "int", style: "enumindex", enumvals: ["270", "360 Top", "360 Bottom", "360 Continuous"], label: "Rotary Mode", setter: "set_rotary_mode", getter: "get_rotary_mode", category: "Geometry", embed: 1 });

// Tab 3: Settings
declareattribute("labels", { type: "symbol", label: "Dial Labels (space separated)", setter: "set_labels", getter: "get_labels", category: "Settings", embed: 1 });
declareattribute("slider_speed", { type: "float", label: "Drag Speed", setter: "set_slider_speed", getter: "get_slider_speed", category: "Settings", min: 0.1, max: 5.0, embed: 1 });
declareattribute("step_speed_ms", { type: "int", label: "Hold Timer (ms)", setter: "set_step_speed_ms", getter: "get_step_speed_ms", category: "Settings", min: 1, max: 500, embed: 1 });
declareattribute("curve_exponent", { type: "float", label: "Rotary Curve Exp", setter: "set_curve_exponent", getter: "get_curve_exponent", category: "Settings", min: 0.0, max: 2.0, embed: 1 });
declareattribute("unit_mode", { type: "int", style: "enumindex", enumvals: ["None", "%", "dB", "ms", "Hz"], label: "Unit Suffix", setter: "set_unit_mode", getter: "get_unit_mode", category: "Settings", embed: 1 });
declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Settings", embed: 1 });
declareattribute("text_size", { type: "int", label: "Font Size", setter: "set_text_size", getter: "get_text_size", category: "Settings", min: 6, max: 48, embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Settings", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Settings", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Settings", embed: 1 });

// Tab 4: Styles
declareattribute("borders", { type: "int", style: "onoff", label: "Show Outer Borders", setter: "set_borders", getter: "get_borders", category: "Styles", embed: 1 });
declareattribute("show_background", { type: "int", style: "onoff", label: "Show Background", setter: "set_show_background", getter: "get_show_background", category: "Styles", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Styles", min: 0.0, max: 50.0, embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Styles", min: 0.0, max: 20.0, embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Styles", min: 0.0, max: 100.0, embed: 1 });
declareattribute("track_breadth", { type: "float", label: "Track Breadth", setter: "set_track_breadth", getter: "get_track_breadth", category: "Styles", min: 0.5, max: 25.0, embed: 1 });
declareattribute("handle_size", { type: "float", label: "Handle Size (Orb)", setter: "set_handle_size", getter: "get_handle_size", category: "Styles", min: 1.0, max: 30.0, embed: 1 });
declareattribute("needle_thickness", { type: "float", label: "Line Size (Needle)", setter: "set_needle_thickness", getter: "get_needle_thickness", category: "Styles", min: 0.5, max: 15.0, embed: 1 });

// Tab 5: Colors
declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Face / BG Color", setter: "set_bg_color", getter: "get_bg_color", category: "Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Colors", embed: 1 });
declareattribute("track_color", { type: "rgba", style: "rgba", label: "Track Rail Color", setter: "set_track_color", getter: "get_track_color", category: "Colors", embed: 1 });
declareattribute("handle_color", { type: "rgba", style: "rgba", label: "Needle / Fill Color", setter: "set_handle_color", getter: "get_handle_color", category: "Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Colors", embed: 1 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode Color", setter: "set_mode_color", getter: "get_mode_color", category: "Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Colors", embed: 1 });
declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Colors", embed: 1 });

// =============================================================
// 19. PATCHER PERSISTENCE (save Function Integration)
// =============================================================
function save() {
  // Global Topology & Spacing
  embedmessage("set_count", count);
  embedmessage("set_direction", direction);
  embedmessage("set_alignment", alignment);
  embedmessage("set_dial_spacing", dial_spacing);

  // Per-Dial State Arrays explicitly by Index (Tabs 1, 2, and 3)
  for (var i = 0; i < count; i++) {
    // Tab 1: Performance
    embedmessage("set_dial_val_idx", i, vals[i]);
    embedmessage("set_mode_idx", i, interaction_modes[i]);
    embedmessage("set_mouse_mode_idx", i, mouse_modes[i]);
    embedmessage("set_min_val_idx", i, min_vals[i]);
    embedmessage("set_max_val_idx", i, max_vals[i]);
    embedmessage("set_step_amount_idx", i, step_amounts[i]);
    embedmessage("set_dec_digits_idx", i, decimal_digits[i]);
    embedmessage("set_int_digits_idx", i, integer_digits[i]);
    embedmessage("set_multiplier_idx", i, multipliers[i]);

    // Tab 2: Geometry
    embedmessage("set_dial_size_idx", i, dial_sizes[i]);
    embedmessage("set_style_idx", i, dial_styles[i]);
    embedmessage("set_ribbon_fill_idx", i, ribbon_fills[i]);
    embedmessage("set_rotary_mode_idx", i, rotary_modes[i]);

    // Tab 3: Settings
    embedmessage("set_slider_speed_idx", i, slider_speeds[i]);
    embedmessage("set_step_speed_ms_idx", i, step_speeds_ms[i]);
    embedmessage("set_curve_exponent_idx", i, curve_exponents[i]);
    embedmessage("set_unit_mode_idx", i, unit_modes[i]);
    embedmessage("set_text_size_idx", i, text_sizes[i]);
    embedmessage("set_font_style_idx", i, font_styles[i]);
    embedmessage("set_label_mode_idx", i, label_modes[i]);
    embedmessage("set_case_mode_idx", i, case_modes[i]);
  }

  // Tab 4: Styles (Strip-Wide Geometry)
  embedmessage("set_borders", borders);
  embedmessage("set_show_background", show_background);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_track_breadth", track_breadth);
  embedmessage("set_handle_size", handle_size);
  embedmessage("set_needle_thickness", needle_thickness);

  // Tab 5: Colors (Strip-Wide Palettes)
  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_track_color", track_color[0], track_color[1], track_color[2], track_color[3]);
  embedmessage("set_handle_color", handle_color[0], handle_color[1], handle_color[2], handle_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);
  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);

  // Labels & Core DSP
  embedmessage("set_labels", labels_raw);
  embedmessage("set_font_name", font_name);
  embedmessage("set_gain_exponent", gain_exponent);
  embedmessage("set_use_gain_curve", use_gain_curve);
}

// =============================================================
// 20. WIRELESS THEME BUS SUBSCRIBER
// =============================================================
// =============================================================
// 20. WIRELESS THEME BUS SUBSCRIBER
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
}

// Utility to resolve color whether master uses "attr_bg", "attr_bg_color", etc.
function resolve_color(source, keys) {
  if (!source) return null;
  var isDict = (typeof source.contains === "function" && typeof source.get === "function");
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (isDict) {
      if (source.contains(k)) {
        var val = source.get(k);
        if (val !== undefined && val !== null) return val;
      }
    } else {
      if (source[k] !== undefined && source[k] !== null) return source[k];
    }
  }
  return null;
}

function loadThemeFromDict() {
  var initDict = new Dict("touch_theme_store");
  if (!initDict) return;
  try {
    var col;
    if ((col = resolve_color(initDict, ["bg_color", "bg"]))) bg_color = rgba_values(col, bg_color);
    if ((col = resolve_color(initDict, ["border_color", "border"]))) border_color = rgba_values(col, border_color);
    if (initDict.contains("border_radius")) border_radius = Math.max(0.0, Number(initDict.get("border_radius")));
    if (initDict.contains("border_thickness")) border_thickness = Math.max(0.0, Number(initDict.get("border_thickness")));
    if (initDict.contains("border_extension")) border_extension = Math.max(0.0, Number(initDict.get("border_extension")));

    if ((col = resolve_color(initDict, ["text_color", "text"]))) text_color = rgba_values(col, text_color);
    if ((col = resolve_color(initDict, ["mode_color", "mode"]))) mode_color = rgba_values(col, mode_color);

    if ((col = resolve_color(initDict, ["slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) handle_color = rgba_values(col, handle_color);
    if ((col = resolve_color(initDict, ["slider_rail_color", "track_color", "rail_color"]))) track_color = rgba_values(col, track_color);

    // Master Popup Keys (Checking all variants)
    if ((col = resolve_color(initDict, ["popup_bg", "pop_bgcolor", "pop_bg", "popup_bg_color"]))) pop_bgcolor = rgba_values(col, pop_bgcolor);
    if ((col = resolve_color(initDict, ["popup_dot", "popup_dot_color", "pop_dot"]))) popup_dot_color = rgba_values(col, popup_dot_color);

    if ((col = resolve_color(initDict, ["attr_bg", "attr_bg_color", "attrbg"]))) attr_bg_color = rgba_values(col, attr_bg_color);
    if ((col = resolve_color(initDict, ["attr_border", "attr_border_color", "attrborder"]))) attr_border_color = rgba_values(col, attr_border_color);
    if ((col = resolve_color(initDict, ["attr_slider", "attr_slider_color", "attrslider"]))) attr_slider_color = rgba_values(col, attr_slider_color);
    if ((col = resolve_color(initDict, ["attr_text", "attr_text_color", "attrtext"]))) attr_text_color = rgba_values(col, attr_text_color);

    redraw_all();
  } catch(e) {}
}

function onThemeUpdate(theme) {
  if (!theme) return;
  try {
    var col;
    if ((col = resolve_color(theme, ["bg_color", "bg"]))) bg_color = rgba_values(col, bg_color);
    if ((col = resolve_color(theme, ["border_color", "border"]))) border_color = rgba_values(col, border_color);
    if (theme.border_radius !== undefined) border_radius = Math.max(0.0, Number(theme.border_radius));
    if (theme.border_thickness !== undefined) border_thickness = Math.max(0.0, Number(theme.border_thickness));
    if (theme.border_extension !== undefined) border_extension = Math.max(0.0, Number(theme.border_extension));

    if ((col = resolve_color(theme, ["text_color", "text"]))) text_color = rgba_values(col, text_color);
    if ((col = resolve_color(theme, ["mode_color", "mode"]))) mode_color = rgba_values(col, mode_color);

    if ((col = resolve_color(theme, ["slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) handle_color = rgba_values(col, handle_color);
    if ((col = resolve_color(theme, ["slider_rail_color", "track_color", "rail_color"]))) track_color = rgba_values(col, track_color);

    // Master Popup Keys (Checking all variants)
    if ((col = resolve_color(theme, ["popup_bg", "pop_bgcolor", "pop_bg", "popup_bg_color"]))) pop_bgcolor = rgba_values(col, pop_bgcolor);
    if ((col = resolve_color(theme, ["popup_dot", "popup_dot_color", "pop_dot"]))) popup_dot_color = rgba_values(col, popup_dot_color);

    if ((col = resolve_color(theme, ["attr_bg", "attr_bg_color", "attrbg"]))) attr_bg_color = rgba_values(col, attr_bg_color);
    if ((col = resolve_color(theme, ["attr_border", "attr_border_color", "attrborder"]))) attr_border_color = rgba_values(col, attr_border_color);
    if ((col = resolve_color(theme, ["attr_slider", "attr_slider_color", "attrslider"]))) attr_slider_color = rgba_values(col, attr_slider_color);
    if ((col = resolve_color(theme, ["attr_text", "attr_text_color", "attrtext"]))) attr_text_color = rgba_values(col, attr_text_color);

    redraw_all();
  } catch(e) {}
}

themeBus.subscribers[uniqueID] = onThemeUpdate;
if (themeBus && themeBus.theme) {
  onThemeUpdate(themeBus.theme);
} else {
  loadThemeFromDict();
}


// =============================================================
// 21. LIFECYCLE DESTRUCTION
// =============================================================
function notifydeleted() {
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (scrollTask) { try { scrollTask.cancel(); } catch(e) {} }
  if (backgroundTask) { try { backgroundTask.cancel(); } catch(e) {} }
  try { if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) delete themeBus.subscribers[uniqueID]; } catch(e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch(e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}
  try { if (tickerListener) tickerListener.subjectname = ""; } catch(e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch(e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch(e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; } catch(e) {}

  try { if (popupWindow) popupWindow.free(); } catch(e) {}
  try { if (colorWindow) colorWindow.free(); } catch(e) {}
  try { if (tickerWindow) tickerWindow.free(); } catch(e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch(e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}
  try { if (tickerMatrix) tickerMatrix.freepeer(); } catch(e) {}

  popupWindow = null;
  colorWindow = null;
  tickerWindow = null;
  outMatrix = null;
  colorMatrix = null;
  tickerMatrix = null;
}

// Initial Sync & Channel Count Dispatch
sync_arrays();
output_channel_count();