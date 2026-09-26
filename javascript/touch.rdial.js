// ============================================================================
// touch.rdial.js - Max 9 v8ui / jsui
// Modern Rotary Dial with Balanced 3x13 Inspector (13 Performance, 13 Geo/Labels, 13 Colors),
// Outer Corner Borders, Theme Bus Sync, and Precision Ticker Engine.
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 1;

setinletassist(0, "Dial control (float, set, bang, mode, popup, etc.)");
setoutletassist(0, "Scaled dial output value");

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. STATE & ROTARY ENGINES
// =============================================================
var val = 0.0;
var target_val = 0.0;
var current_w = 60;
var current_h = 60;

var last_x = 0;
var last_y = 0;
var start_click_x = 0;
var start_click_y = 0;
var last_angle = 0.0;

var is_dragging = 0;
var is_scrolling_drag = 0;
var click_time = 0;
var last_step_time = 0;
var hold_gate_passed = 0;

var backgroundTask = null;
var lastMouseX = 0;
var lastMouseY = 0;

// Dial Styles: 0 = Ribbon, 1 = Rail
var dial_style = 0; 
var style_names = ["Ribbon", "Rail"];

// Ribbon Mode Fill: 1 = Fills arc, 0 = Single Line indicator
var ribbon_fill = 1;
var ribbon_fill_names = ["Single Line", "Arc Fill"];

// Unified 4-Setting Rotary Mode
var rotary_mode = 0;
var rotary_mode_names = ["270", "360 Top", "360 Bottom", "360 Continuous"];

// Mouse Tracking: 0 = Vertical, 1 = Radial (Follow Around)
var mouse_mode = 1; 
var mouse_mode_names = ["Vertical", "Radial"];

// Interaction Mode: 0 = Touch (Tap-step, Hold-step, Gliding), 1 = Mouse (Direct)
var click_jump = 0;
var mode_options = ["Touch", "Mouse"];

var min_val = 0.0;
var max_val = 1.0;
var step_amount = 0.05;
var step_speed_ms = 20;
var curve_exponent = 0.35;
var slider_speed = 1.0;
var allow_popup = 1;
var is_transmitting = false;

// Numeric Precision Engine
var integer_digits = 1;
var decimal_digits = 2;
var leading_zeros  = 0;

// =============================================================
// 2. TYPOGRAPHY & LABELS
// =============================================================
var label_text = "dial";
var label_mode = 0;
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];

var case_mode = 0;
var case_mode_names = ["First Cap", "All Cap", "All Small"];

var font_name = "Arial";
var text_size = 9;
var font_style = 0;
var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];

var text_y_offset = 0;

// =============================================================
// 3. GEOMETRY, CORNER BORDERS & PALETTES
// =============================================================
var borders = 0;             // 0 = Off, 1 = Outer Edge Corner Borders ON
var show_background = 0;          // 0 = Off (Transparent), 1 = Background Plate ON

var border_radius = 8.0;
var border_thickness = 1.2;
var border_extension = 6.0;

var track_breadth = 4.0;
var needle_thickness = 2.0;
var handle_size = 5.0;
var dial_margin = 4.0;

// Component Colors
var bg_color = [0.12, 0.12, 0.14, 1.0];
var border_color = [0.42, 0.42, 0.48, 1.0];
var track_color = [0.22, 0.22, 0.26, 1.0];
var handle_color = [1.00, 0.22, 0.25, 1.0];
var text_color = [0.92, 0.94, 0.98, 1.0];
var mode_color = [0.85, 0.85, 0.90, 1.0];
var popup_dot_color = [1.0, 0.0, 0.0, 1.0];

// Popup Attrui UI Colors
var pop_bgcolor = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color = [0.88, 0.88, 0.88, 1.0];

// 3 Balanced Categories (13 + 13 + 13)
var show_settings_attrs = 1;
var active_mask_tab = 0; // 0 = Performance, 1 = Geometry / Labels, 2 = Colors
var mask_tab_names = ["1. Performance", "2. Geometry / Labels", "3. Colors"];

var showSettings = 0;
var popup_window_width = 280;
var popup_window_fixed_h = 580; // Sized to fit exactly 13 rows without clipping
var popup_mini_w       = 190;
var popup_mini_h       = 190;
var start_resize_w     = 190;
var start_resize_h     = 190;
var is_resizing_window = 0;

// =============================================================
// 4. JITTER SUB-WINDOWS & RECYCLING
// =============================================================
var popupWindow = new JitterObject("jit.window", "dial_set_" + uniqueID);
popupWindow.floating = 1;
popupWindow.visible = 0;
popupWindow.border = 1;
popupWindow.grow = 0;
popupWindow.title = "Touch Dial Inspector";

var colorWindow = new JitterObject("jit.window", "dial_col_" + uniqueID);
colorWindow.floating = 1;
colorWindow.visible = 0;
colorWindow.border = 1;
colorWindow.grow = 0;
colorWindow.title = "Color Picker";
colorWindow.size = [200, 240];

var tickerWindow = new JitterObject("jit.window", "dial_num_" + uniqueID);
tickerWindow.floating = 1;
tickerWindow.visible = 0;
tickerWindow.border = 1;
tickerWindow.grow = 0;
tickerWindow.title = "Bound Ticker";
tickerWindow.size = [230, 200];

var outMatrix = null;
var colorMatrix = new JitterMatrix(4, "char", 200, 240);
var tickerMatrix = new JitterMatrix(4, "char", 230, 200);

var windowListener = null;
var colorListener = null;
var tickerListener = null;

var active_pop_target = -1;
var active_color_target = "handle_color";
var active_ticker_target = "min_val";
var active_ticker_column = -1;
var is_mouse_down_anywhere = 0;

var picker_drag_zone = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

var whole_digits = 4;
var ticker_decimal_digits = 2;
var continuous_digit_floats = [];

var slider_width_px = 32;
var slider_gap_px = 6;

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 70, y: 30, w: 140, h: 140 };

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

// =============================================================
// PATTR HOOKS
// =============================================================
function getvalueof() {
  return getScaledValue();
}

function setvalueof() {
  if (is_transmitting) return;
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length === 0) return;
  msg_float(args[0]);
}

function output_scaled_value() {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    outlet(0, getScaledValue());
  } finally {
    is_transmitting = false;
  }
}

// =============================================================
// 5. MATH, HSV & NUMERIC FORMATTING UTILITIES
// =============================================================
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function get_formatted_value(v) {
  var valNum = (v !== undefined) ? Number(v) : getScaledValue();
  if (isNaN(valNum)) valNum = 0.0;
  var decCount = Math.max(0, Math.min(8, parseInt(decimal_digits, 10) || 0));
  var intCount = Math.max(1, Math.min(12, parseInt(integer_digits, 10) || 1));

  var sign = valNum < 0 ? "-" : "";
  var absVal = Math.abs(valNum);
  var fixedStr = absVal.toFixed(decCount);
  var parts = fixedStr.split(".");
  var intStr = parts[0];

  if (leading_zeros) {
    while (intStr.length < intCount) {
      intStr = "0" + intStr;
    }
  }

  if (decCount > 0 && parts[1] !== undefined) {
    return sign + intStr + "." + parts[1];
  } else {
    return sign + intStr;
  }
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

function get_dimensions() {
  var sz = mgraphics.size;
  if (sz && sz[0] > 0 && sz[1] > 0) {
    current_w = sz[0];
    current_h = sz[1];
    return { w: current_w, h: current_h };
  }
  if (this.box) {
    var is_pres = (this.patcher && this.patcher.getattr("presentation") == 1);
    if (is_pres) {
      var pr = this.box.getattr("presentation_rect");
      if (pr && pr.length >= 4 && pr[2] > 0 && pr[3] > 0) {
        current_w = pr[2];
        current_h = pr[3];
        return { w: current_w, h: current_h };
      }
    } else {
      var r = this.box.rect;
      if (r && r.length >= 4) {
        current_w = r[2] - r[0];
        current_h = r[3] - r[1];
        return { w: current_w, h: current_h };
      }
    }
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

function mark_dirty() {
  if (this.patcher) {
    try { this.patcher.dirty = 1; } catch (e) {}
  }
}

function redraw_all() {
  mgraphics.redraw();
  if (typeof notifyclients === "function") notifyclients();
  mark_dirty();
  if (showSettings) draw_popup_to_window();
}

function get_font_weight() {
  return (font_style === 1 || font_style === 3) ? "bold" : "normal";
}

function get_font_slant() {
  return (font_style === 2 || font_style === 3) ? "italic" : "normal";
}

function getScaledValue() {
  var calculated = min_val + val * (max_val - min_val);
  return isNaN(calculated) ? min_val : calculated;
}

function isBipolar() {
  return (min_val < 0.0 && max_val > 0.0);
}

// =============================================================
// 6. ROTARY ANGULAR GEOMETRY ENGINE (4 MODES)
// =============================================================
function get_dial_angles() {
  if (rotary_mode === 0) {
    var spanRad = 270.0 * (Math.PI / 180.0);
    var gapRad = 90.0 * (Math.PI / 180.0);
    var start = (Math.PI * 0.5) + (gapRad * 0.5); // 135 deg
    return {
      start: start,
      span: spanRad,
      end: start + spanRad,
      is360: false,
      zeroAngle: -Math.PI * 0.5,
      stopAngle: start
    };
  }

  if (rotary_mode === 1) {
    return {
      start: -Math.PI * 0.5,      // 12:00 Top
      span: Math.PI * 2.0,
      end: Math.PI * 1.5,
      is360: true,
      zeroAngle: -Math.PI * 0.5,
      stopAngle: -Math.PI * 0.5
    };
  }

  if (rotary_mode === 2) {
    return {
      start: Math.PI * 0.5,       // 6:00 Bottom
      span: Math.PI * 2.0,
      end: Math.PI * 2.5,
      is360: true,
      zeroAngle: Math.PI * 0.5,
      stopAngle: Math.PI * 0.5
    };
  }

  return {
    start: -Math.PI * 0.5,
    span: Math.PI * 2.0,
    end: Math.PI * 1.5,
    is360: true,
    zeroAngle: -Math.PI * 0.5,
    stopAngle: null
  };
}

function point_to_normalized_dial_val(px, py, cx, cy) {
  var dx = px - cx;
  var dy = py - cy;
  var clickAngle = Math.atan2(dy, dx);
  var ang = get_dial_angles();

  var relA = clickAngle - ang.start;
  while (relA < 0) relA += Math.PI * 2.0;
  while (relA >= Math.PI * 2.0) relA -= Math.PI * 2.0;

  if (ang.is360) {
    return clamp(relA / (Math.PI * 2.0), 0.0, 1.0);
  }
  if (relA <= ang.span) {
    return clamp(relA / ang.span, 0.0, 1.0);
  }
  var distToStart = Math.PI * 2.0 - relA;
  var distToEnd = relA - ang.span;
  return (distToStart < distToEnd) ? 0.0 : 1.0;
}

// =============================================================
// 7. TYPOGRAPHY & LABELLING
// =============================================================
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
      if (w.length <= 1) { resWords.push(w); continue; }
      var firstChar = w.charAt(0);
      var rest = w.slice(1).replace(/[aeiouAEIOU]/g, "");
      resWords.push(firstChar + rest);
    }
    return resWords.join(" ").trim();
  }
  return apply_case(rawTxt, case_mode);
}

// =============================================================
// 8. RENDERING PIPELINE (OPTIONAL CORNERS & BACKGROUND)
// =============================================================
function draw_dial_face(ctx, w, h, is_preview) {
  var cx = w * 0.5;

  var basePreviewRef = 120.0;
  var scaleRatio = is_preview ? Math.max(1.0, Math.min(Math.min(w, h) / basePreviewRef, 2.2)) : 1.0;

  var curFontSize = is_preview 
    ? Math.max(9, Math.min(20, Math.round(text_size * scaleRatio * 1.15))) 
    : text_size;

  ctx.select_font_face(font_name, get_font_slant(), get_font_weight());
  ctx.set_font_size(curFontSize);

  var fe = ctx.font_extents();
  var fontAscent = fe["0"] || fe.ascent || curFontSize;
  var fontHeight = fontAscent + (fe["1"] || fe.descent || (curFontSize * 0.25));

  var rawLabel = label_text;
  var dispLbl = get_display_label(rawLabel, is_preview);
  var hasLabel = (dispLbl.length > 0 && label_mode !== 4);
  var valStr = get_formatted_value(getScaledValue());

  // 1. OPTIONAL BACKGROUND PLATE
  if (show_background === 1 && bg_color && bg_color[3] > 0.001) {
    var bR = Math.max(0, (parseFloat(border_radius) || 0) * (is_preview ? scaleRatio : 1.0));
    var maxBR = Math.min(w, h) * 0.5;
    if (bR > maxBR) bR = maxBR;

    ctx.set_source_rgba(bg_color);
    ctx.new_path();
    if (bR > 0) {
      ctx.move_to(bR, 0); ctx.line_to(w - bR, 0);
      ctx.arc(w - bR, bR, bR, -Math.PI / 2, 0);
      ctx.line_to(w, h - bR);
      ctx.arc(w - bR, h - bR, bR, 0, Math.PI / 2);
      ctx.line_to(bR, h);
      ctx.arc(bR, h - bR, bR, Math.PI / 2, Math.PI);
      ctx.line_to(0, bR);
      ctx.arc(bR, bR, bR, Math.PI, -Math.PI / 2);
      ctx.close_path();
    } else {
      ctx.rectangle(0, 0, w, h);
    }
    ctx.fill();
  }

  // 2. OPTIONAL OUTER EDGE CORNER BORDERS
  if (borders === 1 && border_thickness > 0 && border_color && border_color[3] > 0.001) {
    var bScale = is_preview ? scaleRatio : 1.0;
    var cR = Math.max(0, (parseFloat(border_radius) || 0) * bScale);
    var maxCR = Math.min(w, h) * 0.5;
    if (cR > maxCR) cR = maxCR;

    var ext = Math.max(0, (parseFloat(border_extension) || 0) * bScale);
    var thick = Math.max(0.5, (parseFloat(border_thickness) || 1.0) * (is_preview ? Math.min(bScale, 1.5) : 1.0));
    var inset = thick * 0.5;
    var rw = w - thick;
    var rh = h - thick;

    ctx.set_line_width(thick);
    ctx.set_source_rgba(border_color);

    // Top-Left Corner
    ctx.new_path();
    ctx.move_to(inset, inset + cR + ext);
    ctx.line_to(inset, inset + cR);
    if (cR > 0) ctx.arc(inset + cR, inset + cR, cR, Math.PI, -Math.PI / 2);
    else ctx.move_to(inset, inset);
    ctx.line_to(inset + cR + ext, inset);
    ctx.stroke();

    // Top-Right Corner
    ctx.new_path();
    ctx.move_to(inset + rw - cR - ext, inset);
    ctx.line_to(inset + rw - cR, inset);
    if (cR > 0) ctx.arc(inset + rw - cR, inset + cR, cR, -Math.PI / 2, 0);
    else ctx.move_to(inset + rw, inset);
    ctx.line_to(inset + rw, inset + cR + ext);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.new_path();
    ctx.move_to(inset + rw, inset + rh - cR - ext);
    ctx.line_to(inset + rw, inset + rh - cR);
    if (cR > 0) ctx.arc(inset + rw - cR, inset + rh - cR, cR, 0, Math.PI / 2);
    else ctx.move_to(inset + rw, inset + rh);
    ctx.line_to(inset + rw - cR - ext, inset + rh);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.new_path();
    ctx.move_to(inset + cR + ext, inset + rh);
    ctx.line_to(inset + cR, inset + rh);
    if (cR > 0) ctx.arc(inset + cR, inset + rh - cR, cR, Math.PI / 2, Math.PI);
    else ctx.move_to(inset, inset + rh);
    ctx.line_to(inset, inset + rh - cR - ext);
    ctx.stroke();
  }

  // Dial Geometry Layout
  var previewLabelPad = (is_preview && hasLabel) ? (fontHeight + 6.0) : 0.0;
  var cy = is_preview ? ((h - previewLabelPad) * 0.5 + 2.0) : (h * 0.5);

  var margin = is_preview ? 8.0 : dial_margin;
  var outerRadius = Math.max(8.0, Math.min(cx - margin, cy - margin));

  var ang = get_dial_angles();
  var pVal = clamp(val, 0.0, 1.0);
  var bipolarMode = isBipolar();

  ctx.set_line_cap("butt");
  ctx.set_line_join("miter");

  // Rotary Track
  var tBreadth = Math.max(1.0, track_breadth * (is_preview ? scaleRatio : 1.0));
  var nThick   = Math.max(0.75, needle_thickness * (is_preview ? scaleRatio : 1.0));
  var kSize    = Math.max(1.5, handle_size * (is_preview ? scaleRatio : 1.0));

  var trackRadius = outerRadius - tBreadth * 0.5 - 2.0;
  if (trackRadius < 4.0) trackRadius = 4.0;

  ctx.set_source_rgba(track_color);
  ctx.set_line_width(tBreadth);
  ctx.new_path();
  ctx.arc(cx, cy, trackRadius, ang.start, ang.end);
  ctx.stroke();

  // Stop Tick
  if (ang.stopAngle !== null && (rotary_mode === 1 || rotary_mode === 2)) {
    var notchA = ang.stopAngle;
    var nIn = trackRadius - tBreadth * 0.5 - 1.5;
    var nOut = trackRadius + tBreadth * 0.5 + 1.5;
    ctx.set_source_rgba(track_color);
    ctx.set_line_width(1.5 * (is_preview ? scaleRatio : 1.0));
    ctx.new_path();
    ctx.move_to(cx + nIn * Math.cos(notchA), cy + nIn * Math.sin(notchA));
    ctx.line_to(cx + nOut * Math.cos(notchA), cy + nOut * Math.sin(notchA));
    ctx.stroke();
  }

  // Active Value Render
  var curAngle = ang.start + pVal * ang.span;

  if (dial_style === 0) {
    // --- Ribbon Style ---
    if (ribbon_fill === 1) {
      if (bipolarMode && rotary_mode === 0) {
        var midAngle = ang.zeroAngle;
        ctx.set_source_rgba(handle_color);
        ctx.set_line_width(tBreadth);
        ctx.new_path();
        if (curAngle >= midAngle) {
          ctx.arc(cx, cy, trackRadius, midAngle, curAngle);
        } else {
          ctx.arc(cx, cy, trackRadius, curAngle, midAngle);
        }
        ctx.stroke();
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
      // Single-Line Mode: Offset indicator reaching inward through track
      var lineInward = Math.max(6.0, tBreadth * 0.5 + 4.0) * (is_preview ? scaleRatio : 1.0);
      var lineOutward = (tBreadth * 0.5 + 3.0) * (is_preview ? scaleRatio : 1.0);
      var rIn = Math.max(2.0, trackRadius - lineInward);
      var rOut = Math.min(outerRadius - 0.5, trackRadius + lineOutward);

      var lx1 = cx + rIn * Math.cos(curAngle);
      var ly1 = cy + rIn * Math.sin(curAngle);
      var lx2 = cx + rOut * Math.cos(curAngle);
      var ly2 = cy + rOut * Math.sin(curAngle);

      ctx.set_source_rgba(handle_color);
      ctx.set_line_width(nThick);
      ctx.new_path();
      ctx.move_to(lx1, ly1);
      ctx.line_to(lx2, ly2);
      ctx.stroke();
    }
  } else {
    // --- Rail Style: Symmetrical Needle Centered Inside Knob ---
    var knobR = Math.max(2.5, kSize);
    var kX = cx + trackRadius * Math.cos(curAngle);
    var kY = cy + trackRadius * Math.sin(curAngle);

    var needleHalfLen = (knobR + 3.5) * (is_preview ? Math.min(scaleRatio, 1.4) : 1.0);
    var nX1 = kX - needleHalfLen * Math.cos(curAngle);
    var nY1 = kY - needleHalfLen * Math.sin(curAngle);
    var nX2 = kX + needleHalfLen * Math.cos(curAngle);
    var nY2 = kY + needleHalfLen * Math.sin(curAngle);

    ctx.set_source_rgba(handle_color);
    ctx.set_line_width(nThick);
    ctx.new_path();
    ctx.move_to(nX1, nY1);
    ctx.line_to(nX2, nY2);
    ctx.stroke();

    ctx.set_source_rgba(0.0, 0.0, 0.0, 0.65);
    ctx.new_path();
    ctx.arc(kX + 0.5, kY + 0.5, knobR + 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.set_source_rgba(handle_color);
    ctx.new_path();
    ctx.arc(kX, kY, knobR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Typography Engine
  var valTm = ctx.text_measure(valStr);
  var valW = valTm ? valTm[0] : (curFontSize * 1.8);

  if (is_preview) {
    var centY = cy + fontAscent * 0.35 + (text_y_offset * 0.1);
    ctx.set_source_rgba(text_color);
    ctx.move_to(cx - valW * 0.5, centY);
    ctx.show_text(valStr);

    if (hasLabel) {
      var lblTm = ctx.text_measure(dispLbl);
      var lblW = lblTm ? lblTm[0] : (curFontSize * 1.5);
      ctx.set_source_rgba(mode_color);
      var belowY = cy + outerRadius + fontAscent + 4.0;
      ctx.move_to(cx - lblW * 0.5, belowY);
      ctx.show_text(dispLbl);
    }
  } else {
    if (hasLabel) {
      var lblTm2 = ctx.text_measure(dispLbl);
      var lblW2 = lblTm2 ? lblTm2[0] : (curFontSize * 1.5);
      var totalBlockH = fontHeight * 1.7;
      var baseY = cy - totalBlockH * 0.5 + fontAscent + (text_y_offset * 0.1);

      ctx.set_source_rgba(mode_color);
      ctx.move_to(cx - lblW2 * 0.5, baseY);
      ctx.show_text(dispLbl);

      ctx.set_source_rgba(text_color);
      ctx.move_to(cx - valW * 0.5, baseY + fontHeight * 0.95);
      ctx.show_text(valStr);
    } else {
      var singleY = cy + fontAscent * 0.35 + (text_y_offset * 0.1);
      ctx.set_source_rgba(text_color);
      ctx.move_to(cx - valW * 0.5, singleY);
      ctx.show_text(valStr);
    }
  }

  // Red Popup Launcher Dot
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
  draw_dial_face(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 9. TOUCH STEPPING & ROTARY EASING SCHEDULER
// =============================================================
function set(v) {
  if (arguments.length > 0) v = arguments[0];
  var parsed = parseFloat(v);
  if (!isNaN(parsed)) {
    var span = max_val - min_val;
    var scaled = span !== 0 ? (parsed - min_val) / span : 0.0;
    val = clamp(scaled, 0.0, 1.0);
    target_val = val;
    redraw_all();
  }
}
function set_val(v) { set(v); }
function msg_int(v) { msg_float(v); }
function bang() { output_scaled_value(); }

function msg_float(v) {
  if (is_transmitting) return;
  if (arguments.length > 0) v = arguments[0];
  var parsed = parseFloat(v);
  if (!isNaN(parsed)) {
    var span = max_val - min_val;
    var scaled = span !== 0 ? (parsed - min_val) / span : 0.0;
    var nextVal = clamp(scaled, 0.0, 1.0);
    if (val !== nextVal) {
      val = nextVal;
      target_val = val;
      redraw_all();
      output_scaled_value();
    }
  }
}

function execute_step_on_dial(targetNormVal) {
  var isContinuous = (rotary_mode === 3);
  var span = Math.abs(max_val - min_val);
  var stepSize = isNaN(step_amount) ? 0.01 : step_amount;
  var normStep = span > 0 ? (stepSize / span) : 0.01;

  var dist = targetNormVal - val;
  if (isContinuous) {
    if (dist > 0.5) dist -= 1.0;
    else if (dist < -0.5) dist += 1.0;
  }

  var absDist = Math.abs(dist);
  if (absDist <= normStep * 0.5) {
    val = targetNormVal;
  } else if (dist > 0) {
    val += normStep;
  } else {
    val -= normStep;
  }

  if (isContinuous) {
    val = ((val % 1.0) + 1.0) % 1.0;
  } else {
    val = clamp(val, 0.0, 1.0);
  }

  redraw_all();
  output_scaled_value();
}

function execute_easing_on_dial(targetNormVal) {
  var isContinuous = (rotary_mode === 3);
  var dist = targetNormVal - val;

  if (isContinuous) {
    if (dist > 0.5) dist -= 1.0;
    else if (dist < -0.5) dist += 1.0;
  }

  var absDist = Math.abs(dist);
  if (absDist < 0.002) return;

  var normDist = Math.min(1.0, absDist);
  var exponent = isNaN(curve_exponent) ? 0.35 : curve_exponent;
  var curveEase = Math.pow(normDist, exponent);
  var baseScale = isNaN(slider_speed) ? 1.0 : slider_speed;
  var calculatedIncrement = 0.001 + curveEase * baseScale * 0.02;

  if (dist < 0) calculatedIncrement = -calculatedIncrement;

  var nextVal = val + calculatedIncrement;
  if (isContinuous) {
    nextVal = ((nextVal % 1.0) + 1.0) % 1.0;
  } else {
    nextVal = clamp(nextVal, 0.0, 1.0);
  }

  if (val !== nextVal) {
    val = nextVal;
    redraw_all();
    output_scaled_value();
  }
}

function start_touch_scheduler(is_popup_preview) {
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
  var holdTimerSetting = Math.max(1, isNaN(step_speed_ms) ? 20 : step_speed_ms);

  backgroundTask = new Task(function () {
    if (is_popup_preview) {
      if (active_pop_target !== 50 || is_mouse_down_anywhere === 0) return;
    } else {
      if (is_dragging !== 1) return;
    }
    if (click_jump === 1) return;

    if (is_scrolling_drag === 1) {
      execute_easing_on_dial(target_val);
    } else {
      var cx, cy;
      if (is_popup_preview) {
        var pr = cached_preview_rect;
        cx = pr.x + pr.w * 0.5;
        cy = pr.y + pr.h * 0.5;
      } else {
        var dims = get_dimensions();
        cx = dims.w * 0.5;
        cy = dims.h * 0.5;
      }
      var clickTargetNorm = point_to_normalized_dial_val(start_click_x, start_click_y, cx, cy);

      var now = new Date().getTime();
      if (hold_gate_passed === 0) {
        if (now - click_time >= 350) {
          hold_gate_passed = 1;
          last_step_time = now;
          execute_step_on_dial(clickTargetNorm);
        }
      } else {
        if (now - last_step_time >= holdTimerSetting) {
          last_step_time = now;
          execute_step_on_dial(clickTargetNorm);
        }
      }
    }
  }, this);
  backgroundTask.interval = 15;
  backgroundTask.repeat();
}

// =============================================================
// 10. ROTARY DELTA ENGINE WITH BUMPER CLAMPING
// =============================================================
function accumulate_rotary_delta(mx, my, cx, cy) {
  var dx = mx - cx;
  var dy = my - cy;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

  var currentAngle = Math.atan2(dy, dx);
  var deltaA = currentAngle - last_angle;

  if (deltaA > Math.PI) deltaA -= Math.PI * 2.0;
  else if (deltaA < -Math.PI) deltaA += Math.PI * 2.0;

  var ang = get_dial_angles();
  var deltaVal = (deltaA / ang.span) * slider_speed;

  if (rotary_mode === 3) {
    target_val = ((target_val + deltaVal) % 1.0 + 1.0) % 1.0;
  } else {
    target_val = clamp(target_val + deltaVal, 0.0, 1.0);
  }

  last_angle = currentAngle;

  if (click_jump === 1) {
    val = target_val;
    redraw_all();
    output_scaled_value();
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

  is_dragging = 1;
  is_scrolling_drag = 0;
  last_x = x;
  last_y = y;
  start_click_x = x;
  start_click_y = y;
  hold_gate_passed = 0;
  click_time = new Date().getTime();
  last_step_time = click_time;

  var cx = w * 0.5, cy = h * 0.5;
  last_angle = Math.atan2(y - cy, x - cx);

  if (click_jump === 0) {
    var initialTarget = point_to_normalized_dial_val(x, y, cx, cy);
    execute_step_on_dial(initialTarget);
    target_val = val;
    start_touch_scheduler(false);
  } else {
    if (mouse_mode === 1) {
      target_val = point_to_normalized_dial_val(x, y, cx, cy);
      val = target_val;
      redraw_all();
      output_scaled_value();
    }
  }
}

function ondrag(x, y, button) {
  if (button === 0) {
    onmouseup();
    return;
  }
  var dims = get_dimensions();
  var cx = dims.w * 0.5;
  var cy = dims.h * 0.5;

  if (click_jump === 0) {
    var distMoved = Math.sqrt((x - start_click_x) * (x - start_click_x) + (y - start_click_y) * (y - start_click_y));
    if (distMoved > 4) {
      if (is_scrolling_drag === 0) {
        is_scrolling_drag = 1;
        target_val = val;
      }
    }
    if (is_scrolling_drag === 1) {
      if (mouse_mode === 1) {
        accumulate_rotary_delta(x, y, cx, cy);
      } else {
        var dy = (last_y - y);
        var deltaV = (dy / (dims.h * 0.75)) * slider_speed;
        if (rotary_mode === 3) {
          target_val = ((target_val + deltaV) % 1.0 + 1.0) % 1.0;
        } else {
          target_val = clamp(target_val + deltaV, 0.0, 1.0);
        }
      }
    }
    last_x = x;
    last_y = y;
    return;
  }

  if (mouse_mode === 1) {
    accumulate_rotary_delta(x, y, cx, cy);
  } else {
    var dy2 = (last_y - y);
    var deltaV2 = (dy2 / (dims.h * 0.75)) * slider_speed;
    if (rotary_mode === 3) {
      val = ((val + deltaV2) % 1.0 + 1.0) % 1.0;
    } else {
      val = clamp(val + deltaV2, 0.0, 1.0);
    }
    target_val = val;
    last_y = y;
    redraw_all();
    output_scaled_value();
  }
}

function onmouseup() {
  is_dragging = 0;
  is_scrolling_drag = 0;
  hold_gate_passed = 0;
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
}

function onidleout() { onmouseup(); }
function onidle() { if (is_dragging) onmouseup(); }

function onmousewheel(x, y, deltaX, deltaY) {
  var delta = (deltaY !== 0 ? -deltaY : 0) * 0.005 * slider_speed;
  if (rotary_mode === 3) {
    val = ((val + delta) % 1.0 + 1.0) % 1.0;
  } else {
    val = clamp(val + delta, 0.0, 1.0);
  }
  target_val = val;
  redraw_all();
  output_scaled_value();
}

// =============================================================
// 11. POPUP INSPECTOR (13 + 13 + 13 EXACT BALANCE)
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  // Tab 0: 1. Performance (13 items)
  if (active_mask_tab === 0) {
    list.push({ name: "Style", val: style_names[dial_style], is_toggle: true, target_id: 101 });
    list.push({ name: "Rotary Mode", val: rotary_mode_names[rotary_mode], is_toggle: true, target_id: 103 });
    list.push({ name: "Mode", val: mode_options[click_jump], is_toggle: true, target_id: 111 });
    list.push({ name: "Drag Axis", val: mouse_mode_names[mouse_mode], is_toggle: true, target_id: 102 });

    list.push({ name: "Min Val", val: min_val, is_ticker: true, key: "min_val", target_id: 106 });
    list.push({ name: "Max Val", val: max_val, is_ticker: true, key: "max_val", target_id: 107 });
    list.push({ name: "Dec Digits", val: decimal_digits, pct: decimal_digits / 8.0, is_slider: true, target_id: 120 });
    list.push({ name: "Int Digits", val: integer_digits, pct: (integer_digits - 1) / 11.0, is_slider: true, target_id: 121 });
    list.push({ name: "Leading 0s", val: leading_zeros ? "ON" : "OFF", is_toggle: true, target_id: 122 });

    list.push({ name: "Step Size", val: step_amount.toFixed(2), is_ticker: true, key: "step_amount", target_id: 108 });
    list.push({ name: "Hold Timer", val: step_speed_ms.toFixed(0) + "ms", pct: (step_speed_ms - 5) / 95.0, is_slider: true, target_id: 112 });
    list.push({ name: "Curve Exp", val: curve_exponent.toFixed(2), pct: curve_exponent / 1.0, is_slider: true, target_id: 113 });
    list.push({ name: "Drag Speed", val: slider_speed.toFixed(2), pct: (slider_speed - 0.1) / 1.9, is_slider: true, target_id: 109 });
  }

  // Tab 1: 2. Geometry / Labels (13 items)
  else if (active_mask_tab === 1) {
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 201 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 203 });

    list.push({ name: "Borders", val: borders ? "ON" : "OFF", is_toggle: true, target_id: 310 });
    list.push({ name: "Background", val: show_background ? "ON" : "OFF", is_toggle: true, target_id: 311 });
    list.push({ name: "Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 312 });
    list.push({ name: "Thickness", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 303 });
    list.push({ name: "Extensions", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 313 });

    list.push({ name: "Track Breadth", val: track_breadth.toFixed(1), pct: track_breadth / 15.0, is_slider: true, target_id: 301 });
    list.push({ name: "Handle Size", val: handle_size.toFixed(1), pct: (handle_size - 1.0) / 19.0, is_slider: true, target_id: 306 });
    list.push({ name: "Needle Size", val: needle_thickness.toFixed(1), pct: (needle_thickness - 0.5) / 9.5, is_slider: true, target_id: 302 });
    list.push({ name: "Dial Margin", val: dial_margin.toFixed(0), pct: dial_margin / 20.0, is_slider: true, target_id: 304 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 6) / 24.0, is_slider: true, target_id: 305 });
  }

  // Tab 2: 3. Colors (13 items - Ribbon Fill on top)
  else if (active_mask_tab === 2) {
    list.push({ name: "Ribbon Fill", val: ribbon_fill_names[ribbon_fill], is_toggle: true, target_id: 114 });
    list.push({ name: "Mode Color", val: mode_color, is_color: true, key: "mode_color" });
    list.push({ name: "BG Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Track Color", val: track_color, is_color: true, key: "track_color" });
    list.push({ name: "Needle / Fill", val: handle_color, is_color: true, key: "handle_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });

    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_popup_dimensions_map() {
  if (!show_settings_attrs) {
    return { w: popup_mini_w, h: popup_mini_h, rows_h: 0, nav_h: 0 };
  }
  return { w: popup_window_width, h: popup_window_fixed_h, rows_h: 13 * 28, nav_h: 24 };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_popup_dimensions_map();
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Touch Dial Inspector";
    outMatrix = recycleMatrix(outMatrix, dims.w, dims.h);
    popupWindow.visible = 1;
    draw_popup_to_window();
  } else {
    popupWindow.visible = 0;
  }
}

function draw_popup_to_window() {
  if (!showSettings || allow_popup !== 1 || !outMatrix) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_popup_to_window_deferred() {
  if (!showSettings || allow_popup !== 1 || !outMatrix) return;
  var dims = get_popup_dimensions_map();
  var w = dims.w, h = dims.h;

  popupWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  var row_map = get_visible_rows_map();
  var has_rows = row_map.length > 0;

  // Header Close Dot & Label
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Toggle Hide/Show Pill
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

  // Top Dial Preview
  var previewSz, previewX, previewY;
  if (has_rows) {
    previewSz = Math.min(120, w - 40);
    previewX = (w - previewSz) * 0.5;
    previewY = 28;
  } else {
    previewSz = Math.min(w - 24, h - 42);
    previewX = (w - previewSz) * 0.5;
    previewY = 28 + (h - 28 - previewSz) * 0.5;
  }
  cached_preview_rect = { x: previewX, y: previewY, w: previewSz, h: previewSz };

  pCtx.save();
  pCtx.translate(previewX, previewY);
  draw_dial_face(pCtx, previewSz, previewSz, true);
  pCtx.restore();

  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    pCtx.move_to(w - 12, h - 4); pCtx.line_to(w - 4, h - 12);
    pCtx.move_to(w - 8, h - 4);  pCtx.line_to(w - 4, h - 8);
    pCtx.stroke();
  }

  if (has_rows) {
    var divY = previewY + previewSz + 10;
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    // -------------------------------------------------------------
    // 3-CATEGORY MASK NAVIGATOR BAR: [ < ]  Title  [ > ]
    // -------------------------------------------------------------
    var navY = divY + 6;
    var navH = 22;
    var navW = w - 24;
    var navX = 12;

    pCtx.set_source_rgba(0.08, 0.08, 0.10, 0.85);
    pCtx.rectangle_rounded(navX, navY, navW, navH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(attr_border_color);
    pCtx.set_line_width(1.0);
    pCtx.rectangle_rounded(navX + 0.5, navY + 0.5, navW - 1, navH - 1, 3, 3);
    pCtx.stroke();

    // Left Button [ < ]
    var btnW = 24;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(navX + 1, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.select_font_face("Arial", "normal", "bold");
    pCtx.set_font_size(10);
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(navX + 9, navY + 15);
    pCtx.show_text("<");

    // Right Button [ > ] (Fixed with explicit white text color)
    var rBtnX = navX + navW - btnW - 1;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(rBtnX, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(rBtnX + 9, navY + 15);
    pCtx.show_text(">");

    // Center Category Title
    var tabTitle = mask_tab_names[active_mask_tab] || "Category";
    var tabTm = pCtx.text_measure(tabTitle);
    var tabTW = tabTm ? tabTm[0] : 60;
    pCtx.set_source_rgba(mode_color);
    pCtx.move_to(navX + (navW - tabTW) * 0.5, navY + 15);
    pCtx.show_text(tabTitle);

    // -------------------------------------------------------------
    // ATTRIBUTE ROWS (Active Category - Exactly 13 Rows)
    // -------------------------------------------------------------
    var rowsStartY = navY + navH + 8;
    var rowW = w - 24;
    var rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (var i = 0; i < row_map.length; i++) {
      var r = row_map[i];
      var rY = rowsStartY + i * 28;

      pCtx.set_source_rgba(attr_bg_color);
      pCtx.rectangle(rowX, rY, rowW, 26);
      pCtx.fill();

      // Left 50%: Name
      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      // Center Divider Notch
      pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
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
        pCtx.show_text(parseFloat(r.val).toFixed(decimal_digits));
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
// 12. COLOR PICKER SUB-WINDOW
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
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

function get_color_target_label(name) {
  if (name === "bg_color") return "Background Color";
  if (name === "border_color") return "Border Color";
  if (name === "track_color") return "Track Rail";
  if (name === "handle_color") return "Needle / Fill";
  if (name === "text_color") return "Text Color";
  if (name === "mode_color") return "Mode / Label Prefix";
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
// 13. BOUND TICKER SUB-WINDOW
// =============================================================
function get_ticker_digit_array(current_val) {
  var fixed_str = Math.abs(current_val).toFixed(ticker_decimal_digits);
  var clean_str = fixed_str.replace(".", "");
  var total = whole_digits + ticker_decimal_digits;
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
  var winW = 230, winH = 200;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  ctx.arc(15, 15, 7.5, 0, Math.PI * 2);
  ctx.fill();

  var current_val = min_val;
  if (active_ticker_target === "max_val") current_val = max_val;
  if (active_ticker_target === "step_amount") current_val = step_amount;

  var ticker_data = get_ticker_digit_array(current_val);

  ctx.set_source_rgba(attr_text_color);
  ctx.set_font_size(14);
  ctx.move_to(35, 22);
  ctx.show_text(ticker_data.sign < 0 ? "-" : "+");

  var total_cols = whole_digits + ticker_decimal_digits;
  for (var i = 0; i < total_cols; i++) {
    var xOffset = 30 + i * (slider_width_px + slider_gap_px);
    if (i >= whole_digits) xOffset += 10;

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

    if (i === whole_digits - 1) {
      ctx.set_source_rgba(attr_text_color);
      ctx.arc(xOffset + slider_width_px + slider_gap_px * 0.5, 155, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function update_ticker_value_and_redraw() {
  var constrained_digit = Math.round(continuous_digit_floats[active_ticker_column]);
  var current_val = min_val;
  if (active_ticker_target === "max_val") current_val = max_val;
  if (active_ticker_target === "step_amount") current_val = step_amount;

  var inner_data = get_ticker_digit_array(current_val);
  inner_data.arr[active_ticker_column] = constrained_digit;
  var rebuilt = rebuild_ticker_value(inner_data);

  if (active_ticker_target === "min_val") set_min_val(rebuilt);
  else if (active_ticker_target === "max_val") set_max_val(rebuilt);
  else if (active_ticker_target === "step_amount") set_step_amount(rebuilt);

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
      if (mx >= 4 && mx <= 26 && my >= 4 && my <= 26) {
        tickerWindow.visible = 0; active_ticker_column = -1; redraw_all(); return;
      }
      var current_val = min_val;
      if (active_ticker_target === "max_val") current_val = max_val;
      if (active_ticker_target === "step_amount") current_val = step_amount;
      var ticker_data = get_ticker_digit_array(current_val);

      if (mx >= 35 && mx <= 55 && my >= 5 && my <= 25 && active_ticker_column === -1) {
        ticker_data.sign = ticker_data.sign * -1;
        var updated = rebuild_ticker_value(ticker_data);
        if (active_ticker_target === "min_val") set_min_val(updated);
        else if (active_ticker_target === "max_val") set_max_val(updated);
        else if (active_ticker_target === "step_amount") set_step_amount(updated);
        draw_ticker_matrix_popup(); redraw_all(); active_ticker_column = 99; return;
      }

      if (active_ticker_column === -1 || active_ticker_column === 99) {
        var total_cols = whole_digits + ticker_decimal_digits;
        for (var i = 0; i < total_cols; i++) {
          var xOffset = 30 + i * (slider_width_px + slider_gap_px);
          if (i >= whole_digits) xOffset += 10;
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
}

// =============================================================
// 14. POPUP WINDOW LISTENER & INTERACTION
// =============================================================
function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) update_popup_dimensions();
  else {
    popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  mgraphics.redraw();
}

function apply_slider_target(target_id, targetPct) {
  if (target_id === 109) set_slider_speed(0.1 + targetPct * 1.9);
  else if (target_id === 112) set_step_speed_ms(Math.round(5 + targetPct * 95));
  else if (target_id === 113) set_curve_exponent(targetPct * 1.0);
  else if (target_id === 120) set_decimal_digits(Math.round(targetPct * 8));
  else if (target_id === 121) set_integer_digits(Math.round(1 + targetPct * 11));
  else if (target_id === 301) set_track_breadth(1.0 + targetPct * 14.0);
  else if (target_id === 302) set_needle_thickness(0.5 + targetPct * 9.5);
  else if (target_id === 303) set_border_thickness(targetPct * 10.0);
  else if (target_id === 304) set_dial_margin(targetPct * 20.0);
  else if (target_id === 305) set_text_size(Math.round(6 + targetPct * 24));
  else if (target_id === 306) set_handle_size(1.0 + targetPct * 19.0);
  else if (target_id === 312) set_border_radius(targetPct * 25.0);
  else if (target_id === 313) set_border_extension(targetPct * 50.0);
  redraw_all();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = mbut === 1 && is_mouse_down_anywhere === 0;
    is_mouse_down_anywhere = mbut;

    var dims = get_popup_dimensions_map();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    var divY = pr.y + pr.h + 10;
    var navY = divY + 6;
    var navH = 22;
    var navW = w - 24;
    var navX = 12;
    var btnW = 24;
    var rBtnX = navX + navW - btnW - 1;

    var rowsStartY = navY + navH + 8;
    var rowW = w - 24;
    var rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    if (mbut === 0) {
      is_resizing_window = 0;
      if (active_pop_target === 50) {
        is_dragging = 0; is_scrolling_drag = 0; hold_gate_passed = 0;
        if (backgroundTask) { backgroundTask.cancel(); backgroundTask = null; }
      }
      active_pop_target = -1;
      return;
    }

    // Live Slider Dragging
    if (active_pop_target !== -1 && active_pop_target !== 50) {
      var dragPct = clamp((mx - valBoxX) / valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_to_window();
      return;
    }

    // Mini Mode 2D Elastic Resizing
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(160, Math.min(start_resize_w + deltaW, 300));
      popup_mini_h = Math.max(160, Math.min(start_resize_h + deltaH, 300));
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

    // Close Button Hit
    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
      mgraphics.redraw();
      return;
    }

    // Toggle Hide/Show Button Hit
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // Top Fitted Preview Rotary Drag
    if (active_pop_target === 50) {
      lastMouseX = mx;
      lastMouseY = my;
      var prevCX = pr.x + pr.w * 0.5;
      var prevCY = pr.y + pr.h * 0.5;

      if (click_jump === 1) {
        accumulate_rotary_delta(mx, my, prevCX, prevCY);
      } else {
        var distMoved = Math.sqrt((mx - start_click_x) * (mx - start_click_x) + (my - start_click_y) * (my - start_click_y));
        if (distMoved > 4) {
          if (is_scrolling_drag === 0) {
            is_scrolling_drag = 1;
            target_val = val;
          }
        }
        if (is_scrolling_drag === 1) {
          accumulate_rotary_delta(mx, my, prevCX, prevCY);
        }
      }
      return;
    }

    // Top Fitted Preview Click Hit
    if (mbut && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      active_pop_target = 50;
      start_click_x = mx;
      start_click_y = my;
      lastMouseX = mx;
      lastMouseY = my;
      hold_gate_passed = 0;
      is_scrolling_drag = 0;
      click_time = new Date().getTime();
      last_step_time = click_time;

      var prevCX2 = pr.x + pr.w * 0.5;
      var prevCY2 = pr.y + pr.h * 0.5;
      last_angle = Math.atan2(my - prevCY2, mx - prevCX2);

      if (click_jump === 0) {
        var targetNorm = point_to_normalized_dial_val(mx, my, prevCX2, prevCY2);
        execute_step_on_dial(targetNorm);
        target_val = val;
        start_touch_scheduler(true);
      } else {
        target_val = point_to_normalized_dial_val(mx, my, prevCX2, prevCY2);
        val = target_val;
        redraw_all();
        output_scaled_value();
      }
      return;
    }

    if (!has_rows) return;

    // -------------------------------------------------------------
    // 3. MASK NAVIGATOR PAGER CLICKS (3 Tabs)
    // -------------------------------------------------------------
    if (is_pop_tap && my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
      if (mx <= navX + btnW + 4) {
        active_mask_tab = (active_mask_tab - 1 + 3) % 3;
      } else if (mx >= rBtnX - 4) {
        active_mask_tab = (active_mask_tab + 1) % 3;
      } else {
        active_mask_tab = (active_mask_tab + 1) % 3;
      }
      draw_popup_to_window();
      return;
    }

    // -------------------------------------------------------------
    // 4. ATTRIBUTE ROWS CLICKS (Active Category - Exactly 13 Rows)
    // -------------------------------------------------------------
    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + (13 * 28)) {
      var clickRow = Math.floor((my - rowsStartY) / 28);
      if (clickRow >= 0 && clickRow < rows.length) {
        var r = rows[clickRow];
        var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          apply_slider_target(r.target_id, pct);
        } else if (is_pop_tap) {
          if (r.is_toggle) {
            if (r.target_id === 101) set_dial_style(dial_style ? 0 : 1);
            else if (r.target_id === 114) set_ribbon_fill(ribbon_fill ? 0 : 1);
            else if (r.target_id === 103) set_rotary_mode((rotary_mode + 1) % 4);
            else if (r.target_id === 111) set_mode(click_jump ? 0 : 1);
            else if (r.target_id === 102) set_mouse_mode((mouse_mode + 1) % 2);
            else if (r.target_id === 122) set_leading_zeros(leading_zeros ? 0 : 1);
            else if (r.target_id === 201) set_label_mode((label_mode + 1) % 5);
            else if (r.target_id === 202) set_case_mode((case_mode + 1) % 3);
            else if (r.target_id === 203) set_font_style((font_style + 1) % 4);
            else if (r.target_id === 310) set_borders(borders ? 0 : 1);
            else if (r.target_id === 311) set_show_background(show_background ? 0 : 1);
          } else if (r.is_ticker) {
            active_ticker_target = r.key;
            colorWindow.visible = 0;
            if (popupWindow && popupWindow.pos) {
              tickerWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + clickRow * 28 + 40];
            }
            continuous_digit_floats = [];
            tickerWindow.visible = 1;
            tickerWindow.front();
            draw_ticker_matrix_popup();
          } else if (r.is_color) {
            active_color_target = r.key;
            tickerWindow.visible = 0;
            initPickerFromTarget();
            if (popupWindow && popupWindow.pos) {
              colorWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + clickRow * 28 + 40];
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
}

// =============================================================
// 15. ATTRIBUTE GETTERS & SETTERS
// =============================================================
function set_active_mask_tab(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    active_mask_tab = clamp(p, 0, 2);
    draw_popup_to_window();
  }
}
function get_active_mask_tab() { return active_mask_tab; }

function set_borders(v) {
  if (arguments.length > 0) v = arguments[0];
  borders = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_borders() { return borders; }

function set_show_background(v) {
  if (arguments.length > 0) v = arguments[0];
  show_background = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_show_background() { return show_background; }
function get_background() { return background; }

function set_border_radius(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) border_radius = Math.max(0.0, p);
  redraw_all();
}
function get_border_radius() { return border_radius; }

function set_border_thickness(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) border_thickness = Math.max(0.0, p);
  redraw_all();
}
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) border_extension = Math.max(0.0, p);
  redraw_all();
}
function get_border_extension() { return border_extension; }

function set_dial_style(v) {
  if (arguments.length > 0) v = arguments[0];
  if (typeof v === "string") dial_style = (v.toLowerCase() === "rail" || v === "1") ? 1 : 0;
  else dial_style = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_dial_style() { return dial_style; }

function set_ribbon_fill(v) {
  if (arguments.length > 0) v = arguments[0];
  if (typeof v === "string") ribbon_fill = (v.toLowerCase() === "arc fill" || v === "1") ? 1 : 0;
  else ribbon_fill = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_ribbon_fill() { return ribbon_fill; }

function set_rotary_mode(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    rotary_mode = clamp(p, 0, 3);
  } else if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s.indexOf("continuous") !== -1) rotary_mode = 3;
    else if (s.indexOf("bottom") !== -1) rotary_mode = 2;
    else if (s.indexOf("top") !== -1) rotary_mode = 1;
    else rotary_mode = 0;
  }
  redraw_all();
}
function get_rotary_mode() { return rotary_mode; }

function set_mode(v) {
  if (arguments.length > 0) v = arguments[0];
  if (typeof v === "string") {
    var s = v.toLowerCase();
    click_jump = (s === "mouse" || s === "click" || s === "1" || s === "true" || s === "on") ? 1 : 0;
  } else {
    click_jump = parseInt(v, 10) ? 1 : 0;
  }
  redraw_all();
}
function get_mode() { return click_jump; }
function set_click_jump(v) { set_mode(v); }
function get_click_jump() { return get_mode(); }

function set_mouse_mode(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    mouse_mode = clamp(p, 0, 1);
  } else if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s.indexOf("rad") !== -1 || s.indexOf("rot") !== -1 || s.indexOf("around") !== -1) {
      mouse_mode = 1;
    } else {
      mouse_mode = 0;
    }
  }
  redraw_all();
}
function get_mouse_mode() { return mouse_mode; }

function set_min_val(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) min_val = p;
  redraw_all();
}
function get_min_val() { return min_val; }

function set_max_val(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) max_val = p;
  redraw_all();
}
function get_max_val() { return max_val; }

function set_step_amount(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) step_amount = Math.max(0.0001, p);
  redraw_all();
}
function get_step_amount() { return step_amount; }

function set_step_speed_ms(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) step_speed_ms = clamp(p, 1, 500);
  redraw_all();
}
function get_step_speed_ms() { return step_speed_ms; }

function set_curve_exponent(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) curve_exponent = clamp(p, 0.0, 2.0);
  redraw_all();
}
function get_curve_exponent() { return curve_exponent; }

function set_slider_speed(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) slider_speed = clamp(p, 0.1, 5.0);
  redraw_all();
}
function get_slider_speed() { return slider_speed; }

function set_decimal_digits(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) decimal_digits = clamp(p, 0, 8);
  redraw_all();
}
function get_decimal_digits() { return decimal_digits; }

function set_integer_digits(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) integer_digits = clamp(p, 1, 12);
  redraw_all();
}
function get_integer_digits() { return integer_digits; }

function set_leading_zeros(v) {
  if (arguments.length > 0) v = arguments[0];
  leading_zeros = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_leading_zeros() { return leading_zeros; }

function set_label_text(v) {
  if (arguments.length > 0) v = arguments[0];
  if (v !== undefined && v !== null) label_text = String(v);
  redraw_all();
}
function get_label_text() { return label_text; }

function set_label_mode(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) label_mode = clamp(p, 0, 4);
  redraw_all();
}
function get_label_mode() { return label_mode; }

function set_case_mode(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) case_mode = clamp(p, 0, 2);
  redraw_all();
}
function get_case_mode() { return case_mode; }

function set_font_name(v) {
  if (arguments.length > 0) v = arguments[0];
  if (v !== undefined && v !== null) font_name = String(v);
  redraw_all();
}
function get_font_name() { return font_name; }

function set_text_size(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) text_size = Math.max(6, p);
  redraw_all();
}
function get_text_size() { return text_size; }
function set_font_size(v) { set_text_size(v); }
function get_font_size() { return get_text_size(); }

function set_font_style(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) font_style = clamp(p, 0, 3);
  redraw_all();
}
function get_font_style() { return font_style; }

function set_track_breadth(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) track_breadth = Math.max(0.5, p);
  redraw_all();
}
function get_track_breadth() { return track_breadth; }

function set_handle_size(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) handle_size = Math.max(1.0, p);
  redraw_all();
}
function get_handle_size() { return handle_size; }

function set_needle_thickness(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) needle_thickness = Math.max(0.5, p);
  redraw_all();
}
function get_needle_thickness() { return needle_thickness; }

function set_dial_margin(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseFloat(v);
  if (!isNaN(p)) dial_margin = Math.max(0.0, p);
  redraw_all();
}
function get_dial_margin() { return dial_margin; }

function set_allow_popup(v) {
  if (arguments.length > 0) v = arguments[0];
  var p = parseInt(v, 10);
  if (!isNaN(p)) allow_popup = p ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  redraw_all();
}
function get_allow_popup() { return allow_popup; }

function set_show_settings_attrs(v) {
  if (arguments.length > 0) v = arguments[0];
  show_settings_attrs = parseInt(v, 10) ? 1 : 0;
  update_popup_dimensions();
}
function get_show_settings_attrs() { return show_settings_attrs; }

function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(160, Math.min(pw, 300));
  if (!isNaN(ph)) popup_mini_h = Math.max(160, Math.min(ph, 300));
  update_popup_dimensions();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function set_bg_color() { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color() { return bg_color; }

function set_border_color() { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color() { return border_color; }

function set_track_color() { track_color = rgba_values(arguments, track_color); redraw_all(); }
function get_track_color() { return track_color; }

function set_handle_color() { handle_color = rgba_values(arguments, handle_color); redraw_all(); }
function get_handle_color() { return handle_color; }

function set_text_color() { text_color = rgba_values(arguments, text_color); redraw_all(); }
function get_text_color() { return text_color; }

function set_mode_color() { mode_color = rgba_values(arguments, mode_color); redraw_all(); }
function get_mode_color() { return mode_color; }

function set_popup_dot_color() { popup_dot_color = rgba_values(arguments, popup_dot_color); redraw_all(); }
function get_popup_dot_color() { return popup_dot_color; }

function set_pop_bgcolor() { pop_bgcolor = rgba_values(arguments, pop_bgcolor); redraw_all(); }
function get_pop_bgcolor() { return pop_bgcolor; }

function set_attr_bg_color() { attr_bg_color = rgba_values(arguments, attr_bg_color); redraw_all(); }
function get_attr_bg_color() { return attr_bg_color; }

function set_attr_border_color() { attr_border_color = rgba_values(arguments, attr_border_color); redraw_all(); }
function get_attr_border_color() { return attr_border_color; }

function set_attr_slider_color() { attr_slider_color = rgba_values(arguments, attr_slider_color); redraw_all(); }
function get_attr_slider_color() { return attr_slider_color; }

function set_attr_text_color() { attr_text_color = rgba_values(arguments, attr_text_color); redraw_all(); }
function get_attr_text_color() { return attr_text_color; }

function anything() {
  var args = arrayfromargs(arguments);
  var name = messagename.replace(/^set_?/, "").toLowerCase();

  if (name === "update" || name === "theme_update" || name === "refresh" || name === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }
  if (name === "rotary" || name === "range_mode") name = "rotary_mode";
  if (name === "style") name = "dial_style";
  if (name === "highlight_color" || name === "accent_color") name = "handle_color";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";
  if (name === "knob_size" || name === "knob_radius") name = "handle_size";
  if (name === "single_line" || name === "fill") name = "ribbon_fill";
  if (name === "rail_breadth" || name === "breadth") name = "track_breadth";
  if (name === "decimals" || name === "decimaldigits" || name === "precision") name = "decimal_digits";
  if (name === "integers" || name === "integerdigits") name = "integer_digits";
  if (name === "leadingzeros" || name === "lead_zeros") name = "leading_zeros";

  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "corners" || name === "border") name = "borders";
  if (name === "bg") name = "background";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 16. DECLAREATTRIBUTE DEFINITIONS (embed: 0 prevents stale C-overwrites)
// =============================================================
declareattribute("style", { type: "int", style: "enumindex", enumvals: ["Ribbon", "Rail"], label: "Dial Style", setter: "set_dial_style", getter: "get_dial_style", category: "Behavior", embed: 0 });
declareattribute("rotary_mode", { type: "int", style: "enumindex", enumvals: ["270", "360 Top", "360 Bottom", "360 Continuous"], label: "Rotary Mode", setter: "set_rotary_mode", getter: "get_rotary_mode", category: "Behavior", embed: 0 });
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Mouse"], label: "Interaction Mode", setter: "set_mode", getter: "get_mode", category: "Behavior", embed: 0 });
declareattribute("mouse_mode", { type: "int", style: "enumindex", enumvals: ["Vertical", "Radial"], label: "Mouse Drag Axis", setter: "set_mouse_mode", getter: "get_mouse_mode", category: "Behavior", embed: 0 });

declareattribute("borders", { type: "int", style: "onoff", label: "Show Borders (Corners)", setter: "set_borders", getter: "get_borders", category: "Geometry", embed: 0 });
declareattribute("show_background", { type: "int", style: "onoff", label: "Show Background", setter: "set_show_background", getter: "get_show_background", category: "Dial Colors", embed: 0 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 0 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 0 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 0 });

declareattribute("min_val", { type: "float", label: "1. Min Val", setter: "set_min_val", getter: "get_min_val", category: "Behavior", embed: 0 });
declareattribute("max_val", { type: "float", label: "2. Max Val", setter: "set_max_val", getter: "get_max_val", category: "Behavior", embed: 0 });

declareattribute("decimal_digits", { type: "int", label: "Decimal Digits", setter: "set_decimal_digits", getter: "get_decimal_digits", category: "Behavior", embed: 0 });
declareattribute("integer_digits", { type: "int", label: "Integer Digits", setter: "set_integer_digits", getter: "get_integer_digits", category: "Behavior", embed: 0 });
declareattribute("leading_zeros", { type: "int", style: "onoff", label: "Leading Zeros", setter: "set_leading_zeros", getter: "get_leading_zeros", category: "Behavior", embed: 0 });

declareattribute("step_amount", { type: "float", label: "Step Size", setter: "set_step_amount", getter: "get_step_amount", category: "Behavior", embed: 0 });
declareattribute("step_speed_ms", { type: "int", label: "Hold Timer (ms)", setter: "set_step_speed_ms", getter: "get_step_speed_ms", category: "Behavior", embed: 0 });
declareattribute("curve_exponent", { type: "float", label: "Curve Exponent", setter: "set_curve_exponent", getter: "get_curve_exponent", category: "Behavior", embed: 0 });
declareattribute("slider_speed", { type: "float", label: "Drag Speed", setter: "set_slider_speed", getter: "get_slider_speed", category: "Behavior", embed: 0 });

declareattribute("ribbon_fill", { type: "int", style: "enumindex", enumvals: ["Single Line", "Arc Fill"], label: "Ribbon Style", setter: "set_ribbon_fill", getter: "get_ribbon_fill", category: "Dial Colors", embed: 0 });

declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Labels", embed: 0 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Labels", embed: 0 });
declareattribute("label_text", { type: "symbol", label: "Label Text", setter: "set_label_text", getter: "get_label_text", category: "Labels", embed: 0 });

declareattribute("track_breadth", { type: "float", label: "Track Breadth", setter: "set_track_breadth", getter: "get_track_breadth", category: "Geometry", embed: 0 });
declareattribute("handle_size", { type: "float", label: "Handle Size (Orb)", setter: "set_handle_size", getter: "get_handle_size", category: "Geometry", embed: 0 });
declareattribute("needle_thickness", { type: "float", label: "Needle Size (Line)", setter: "set_needle_thickness", getter: "get_needle_thickness", category: "Geometry", embed: 0 });
declareattribute("dial_margin", { type: "float", label: "Dial Margin", setter: "set_dial_margin", getter: "get_dial_margin", category: "Geometry", embed: 0 });

declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Typography", embed: 0 });
declareattribute("font_size", { type: "int", label: "Font Size", setter: "set_font_size", getter: "get_font_size", category: "Typography", embed: 0 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Typography", embed: 0 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Popup", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup", embed: 0 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup", embed: 0 });
declareattribute("popup_mini_size", { type: "float", size: 2, label: "Mini Size (W H)", setter: "set_popup_mini_size", getter: "get_popup_mini_size", category: "Popup", embed: 0 });

declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Face / Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Dial Colors", embed: 0 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Dial Colors", embed: 0 });
declareattribute("track_color", { type: "rgba", style: "rgba", label: "Track Rail Color", setter: "set_track_color", getter: "get_track_color", category: "Dial Colors", embed: 0 });
declareattribute("handle_color", { type: "rgba", style: "rgba", label: "Needle / Fill Color", setter: "set_handle_color", getter: "get_handle_color", category: "Dial Colors", embed: 0 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Dial Colors", embed: 0 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode / Label Prefix Color", setter: "set_mode_color", getter: "get_mode_color", category: "Dial Colors", embed: 0 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Dial Colors", embed: 0 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 0 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 0 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 0 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 0 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 0 });

// =============================================================
// 17. WIRELESS THEME BUS SUBSCRIBER
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
}

function loadThemeFromDict() {
  var initDict = new Dict("touch_theme_store");
  if (!initDict) return;
  try {
    if (initDict.contains("bg_color")) set_bg_color(initDict.get("bg_color"));
    if (initDict.contains("border_color")) set_border_color(initDict.get("border_color"));
    if (initDict.contains("border_radius")) set_border_radius(initDict.get("border_radius"));
    if (initDict.contains("border_thickness")) set_border_thickness(initDict.get("border_thickness"));
    if (initDict.contains("border_extension")) set_border_extension(initDict.get("border_extension"));

    if (initDict.contains("text_color")) set_text_color(initDict.get("text_color"));
    if (initDict.contains("mode_color")) set_mode_color(initDict.get("mode_color"));

    var kVal = initDict.contains("slider_handle_color") ? initDict.get("slider_handle_color") : (initDict.contains("highlight_color") ? initDict.get("highlight_color") : null);
    if (kVal) set_handle_color(kVal);

    var rColVal = initDict.contains("slider_rail_color") ? initDict.get("slider_rail_color") : (initDict.contains("track_color") ? initDict.get("track_color") : null);
    if (rColVal) set_track_color(rColVal);

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
    if (theme.bg_color) set_bg_color(theme.bg_color);
    if (theme.border_color) set_border_color(theme.border_color);
    if (theme.border_radius !== undefined) set_border_radius(theme.border_radius);
    if (theme.border_thickness !== undefined) set_border_thickness(theme.border_thickness);
    if (theme.border_extension !== undefined) set_border_extension(theme.border_extension);

    if (theme.text_color) set_text_color(theme.text_color);
    if (theme.mode_color) set_mode_color(theme.mode_color);

    var knobColor = theme.slider_handle_color || theme.handle_color || theme.highlight_color || theme.accent_color;
    if (knobColor) set_handle_color(knobColor);

    var railColor = theme.slider_rail_color || theme.track_color;
    if (railColor) set_track_color(railColor);

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
if (themeBus && themeBus.theme && (themeBus.theme.bg_color || themeBus.theme.border_color || themeBus.theme.handle_color)) {
  onThemeUpdate(themeBus.theme);
} else {
  loadThemeFromDict();
}

// =============================================================
// 18. LIFECYCLE, PERSISTENCE (SAVE) & DESTRUCTION
// =============================================================
function loadbang() {
  if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
  else loadThemeFromDict();
  redraw_all();
}

function save() {
  embedmessage("set_active_mask_tab", active_mask_tab);
  embedmessage("set_borders", borders);
  embedmessage("set_show_background", show_background);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);

  embedmessage("set_dial_style", dial_style);
  embedmessage("set_ribbon_fill", ribbon_fill);
  embedmessage("set_rotary_mode", rotary_mode);
  embedmessage("set_mode", click_jump);
  embedmessage("set_mouse_mode", mouse_mode);
  embedmessage("set_min_val", min_val);
  embedmessage("set_max_val", max_val);

  embedmessage("set_decimal_digits", decimal_digits);
  embedmessage("set_integer_digits", integer_digits);
  embedmessage("set_leading_zeros", leading_zeros);

  embedmessage("set_step_amount", step_amount);
  embedmessage("set_step_speed_ms", step_speed_ms);
  embedmessage("set_curve_exponent", curve_exponent);
  embedmessage("set_slider_speed", slider_speed);

  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_label_text", label_text);

  embedmessage("set_track_breadth", track_breadth);
  embedmessage("set_handle_size", handle_size);
  embedmessage("set_needle_thickness", needle_thickness);
  embedmessage("set_dial_margin", dial_margin);

  embedmessage("set_font_name", font_name);
  embedmessage("set_font_size", text_size);
  embedmessage("set_font_style", font_style);

  embedmessage("set_allow_popup", allow_popup);
  embedmessage("set_show_settings_attrs", show_settings_attrs);
  embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);

  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_track_color", track_color[0], track_color[1], track_color[2], track_color[3]);
  embedmessage("set_handle_color", handle_color[0], handle_color[1], handle_color[2], handle_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  embedmessage("msg_float", getScaledValue());
}

function notifydeleted() {
  if (render_task) { try { render_task.cancel(); } catch (e) {} }
  if (backgroundTask) { try { backgroundTask.cancel(); } catch (e) {} }
  try { if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) delete themeBus.subscribers[uniqueID]; } catch (e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}
  try { if (tickerListener) tickerListener.subjectname = ""; } catch (e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; } catch (e) {}

  try { if (popupWindow) popupWindow.free(); } catch (e) {}
  try { if (colorWindow) colorWindow.free(); } catch (e) {}
  try { if (tickerWindow) tickerWindow.free(); } catch (e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch (e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}
  try { if (tickerMatrix) tickerMatrix.freepeer(); } catch (e) {}

  popupWindow = null;
  colorWindow = null;
  tickerWindow = null;
  outMatrix = null;
  colorMatrix = null;
  tickerMatrix = null;
}

windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);

mgraphics.redraw();