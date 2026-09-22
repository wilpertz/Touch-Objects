// ============================================================================
// touch.pfunction.js - Max 9 v8ui / jsui
// Multi-Breakpoint Envelope & Curve Generator with Oscilloscope Reticle,
// L-Frame & Graticule Y-Axis Engine, Dual-Mode XY Elastic Resizing,
// Domain Rescale / Clamp Engine, Standard 5-Tier 50/50 Attrui Inspector,
// and Wireless Theme Bus.
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "bang outputs envelope; messages (mode, point, list, clear, dump, popup, etc.)");
setoutletassist(0, "line~ / curve~ envelope stream (on bang)");
setoutletassist(1, "bang on handle move / edit release");
setoutletassist(2, "raw points list (pairs in line mode, triplets in curve mode)");

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. DOMAIN & ENVELOPE STATE
// =============================================================
var x_min = 0.0;
var x_max = 1000.0;
var y_min = 0.0;
var y_max = 1.0;
var slider_count = 4;
var latch_first_point = 1; // 1 = point 0 locked to x_min, 0 = free
var latch_last_point = 1;  // 1 = last point locked to x_max, 0 = free
var curve_mode = 1;        // 1 = curve~ mode, 0 = line~ mode
var display_value = 1;     // 1 = always show text, 0 = peek on drag only
var raw_output_mode = 0;   // 0 = On Bang / Release, 1 = Continuous stream on drag

// 0 = Clamp (preserve absolute ms, crop overflow), 1 = Rescale (preserve relative ratios)
var rescale_mode = 1;
var rescale_mode_names = ["Clamp", "Rescale"];

var current_w = 300;
var current_h = 100;

var points = [
  { x: 0.0,    y: 0.0, curve: 0.0 },
  { x: 100.0,  y: 0.9, curve: 0.0 },
  { x: 350.0,  y: 0.3, curve: 0.0 },
  { x: 1000.0, y: 0.0, curve: 0.0 }
];

// =============================================================
// 2. TYPOGRAPHY & LABELS (TWO-PASS DECOUPLING)
// =============================================================
var label_text = "env";
var label_mode = 0; // 0 = Full, 1 = No Vowels, 2 = Caps Only, 3 = First Letter, 4 = No Text
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];

var case_mode = 0; // 0 = First Cap, 1 = All Cap, 2 = All Small
var case_mode_names = ["First Cap", "All Cap", "All Small"];

var font_name = "Arial";
var text_size = 10;
var font_style = 0; // 0 = Regular, 1 = Bold, 2 = Italic, 3 = Bold Italic
var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];

// =============================================================
// 3. GEOMETRY & AXIS STYLING
// =============================================================
var border_radius = 8.0;
var border_thickness = 1.2;
var border_extension = 6.0;
var line_size = 1.5;
var handle_size = 7.0;
var track_margin = 14;

// Axis graticule mode: 0 = Off, 1 = X Base, 2 = L-Frame (X+Y), 3 = L-Frame + Ticks
var axis_style = 3;
var axis_style_names = ["Off", "X Base", "L-Frame", "L-Frame + Ticks"];

// Component Colors
var bg_color = [0.12, 0.12, 0.14, 1.0];
var border_color = [0.45, 0.45, 0.50, 1.0];
var range_color = [0.85, 0.82, 0.22, 1.0];
var handle_color = [1.00, 0.22, 0.25, 1.0];
var text_color = [0.95, 0.95, 0.95, 1.0];
var mode_color = [0.85, 0.85, 0.90, 1.0];
var popup_dot_color = [1.0, 0.0, 0.0, 1.0];

// Popup Attrui UI Colors (Full 5-Color Theme Suite)
var pop_bgcolor = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color = [0.88, 0.88, 0.88, 1.0];

// Standard 5-Tier Popup Visibility Masks & Dual-Mode Sizing
var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var allow_popup = 1;
var showSettings = 0;
var popup_window_width = 280; // Standard locked width when Attrui rows are visible
var popup_mini_w       = 420; // Elastic width for mini preview mode
var popup_mini_h       = 180; // Elastic height for mini preview mode
var start_resize_w     = 420;
var start_resize_h     = 180;
var is_resizing_window = 0;

// =============================================================
// 4. INTERACTION & JITTER SUB-WINDOWS
// =============================================================
var dragging = false;
var active_index = -1;
var is_curving_segment = -1;
var curve_drag_start_x = 0;
var curve_drag_start_y = 0;
var curve_drag_initial_val = 0.0;
var segment_dragged = false;
var pending_click_insert = false;
var last_tap_time = 0;
var last_tap_handle = -1;

// Popup preview interaction state
var popup_dragging = false;
var popup_active_index = -1;
var popup_is_curving_segment = -1;
var popup_curve_drag_start_x = 0;
var popup_curve_drag_start_y = 0;
var popup_curve_drag_initial_val = 0.0;
var popup_segment_dragged = false;
var popup_pending_click_insert = false;
var popup_last_tap_time = 0;
var popup_last_tap_handle = -1;

var is_mouse_down_anywhere = 0;
var active_pop_target = -1;
var active_color_target = "bg_color";
var active_ticker_target = "x_max";
var active_ticker_column = -1;

var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;
var picker_drag_zone = 0;

var whole_digits = 4;
var decimal_digits = 2;
var continuous_digit_floats = [];
var slider_width_px = 32;
var slider_gap_px = 6;

var scrollTask = null;
var lastMouseX = 0;
var lastMouseY = 0;
var start_click_x = 0;
var start_click_y = 0;

var popupWindow = new JitterObject("jit.window", "pfunc_set_" + uniqueID);
popupWindow.floating = 1;
popupWindow.visible = 0;
popupWindow.border = 1;
popupWindow.grow = 0;
popupWindow.title = "Touch Function Inspector";

var colorWindow = new JitterObject("jit.window", "pfunc_col_" + uniqueID);
colorWindow.floating = 1;
colorWindow.visible = 0;
colorWindow.border = 1;
colorWindow.grow = 0;
colorWindow.title = "Color Picker";
colorWindow.size = [200, 240];

var tickerWindow = new JitterObject("jit.window", "pfunc_num_" + uniqueID);
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

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 85 };

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

// =============================================================
// 5. MATH & HSV UTILITIES
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
    case 3: r = p; g = q; b = v; break;
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

function formatNum(num, precision) {
  return Number(num).toFixed(precision);
}

function get_font_weight() {
  return (font_style === 1 || font_style === 3) ? "bold" : "normal";
}

function get_font_slant() {
  return (font_style === 2 || font_style === 3) ? "italic" : "normal";
}

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
// 6. TYPOGRAPHY & LABELS
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

// =============================================================
// 7. ENVELOPE MATHEMATICS & RESCALING
// =============================================================
function enforce_anchors() {
  if (points.length === 0) return;
  if (latch_first_point) {
    points[0].x = x_min;
  } else {
    points[0].x = clamp(points[0].x, x_min, x_max);
  }

  if (latch_last_point && points.length > 1) {
    points[points.length - 1].x = x_max;
  } else if (points.length > 1) {
    points[points.length - 1].x = clamp(points[points.length - 1].x, x_min, x_max);
  }
}

function sort_points() {
  points.sort(function (a, b) {
    return a.x - b.x;
  });
  enforce_anchors();
  slider_count = points.length;
}

function rescale_points_x(new_min, new_max) {
  if (new_max <= new_min) return;
  var old_span = x_max - x_min;
  var new_span = new_max - new_min;
  if (old_span <= 0) old_span = 1.0;

  for (var i = 0; i < points.length; i++) {
    var normX = (points[i].x - x_min) / old_span;
    points[i].x = new_min + normX * new_span;
  }
  x_min = new_min;
  x_max = new_max;
  sort_points();
  redraw_all();
}

function rescale_points_y(new_min, new_max) {
  if (new_max <= new_min) return;
  var old_span = y_max - y_min;
  var new_span = new_max - new_min;
  if (old_span <= 0) old_span = 1.0;

  for (var i = 0; i < points.length; i++) {
    var normY = (points[i].y - y_min) / old_span;
    points[i].y = new_min + normY * new_span;
  }
  y_min = new_min;
  y_max = new_max;
  redraw_all();
}

function evalCurve(t, c) {
  if (Math.abs(c) < 0.005) return t;
  var k = c * 8.0;
  return (1.0 - Math.exp(k * t)) / (1.0 - Math.exp(k));
}

function valueToPixel(pt, w, h, margin) {
  var m = margin !== undefined ? margin : track_margin;
  var usableW = Math.max(10, w - m * 2);
  var usableH = Math.max(10, h - m * 2);
  var normX = x_max === x_min ? 0.0 : (pt.x - x_min) / (x_max - x_min);
  var normY = y_max === y_min ? 0.0 : (pt.y - y_min) / (y_max - y_min);

  return {
    x: m + normX * usableW,
    y: h - m - normY * usableH
  };
}

function pixelToValue(pixelX, pixelY, w, h, margin) {
  var m = margin !== undefined ? margin : track_margin;
  var usableW = Math.max(10, w - m * 2);
  var usableH = Math.max(10, h - m * 2);
  var normX = clamp((pixelX - m) / usableW, 0.0, 1.0);
  var normY = clamp((h - m - pixelY) / usableH, 0.0, 1.0);

  return {
    x: x_min + normX * (x_max - x_min),
    y: y_min + normY * (y_max - y_min)
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  var projX = x1 + t * dx;
  var projY = y1 + t * dy;
  var ndx = px - projX;
  var ndy = py - projY;
  return Math.sqrt(ndx * ndx + ndy * ndy);
}

function findNearestSegment(px, py, w, h, margin) {
  if (points.length < 2) return -1;
  var bestDist = Infinity;
  var bestSeg = -1;

  for (var i = 1; i < points.length; i++) {
    var p0 = valueToPixel(points[i - 1], w, h, margin);
    var p1 = valueToPixel(points[i], w, h, margin);
    var d = distToSegment(px, py, p0.x, p0.y, p1.x, p1.y);
    if (d < bestDist) {
      bestDist = d;
      bestSeg = i;
    }
  }
  return (bestDist < 18.0) ? bestSeg : -1;
}

function get_clamped_handle_x(idx, targetX) {
  if (idx === 0) {
    if (latch_first_point) return x_min;
    var maxX0 = (points.length > 1) ? (points[1].x - 0.1) : x_max;
    return clamp(targetX, x_min, maxX0);
  }
  if (latch_last_point && idx === points.length - 1) return x_max;

  var minX = (idx > 0) ? (points[idx - 1].x + 0.1) : x_min;
  var maxX = (idx < points.length - 1) ? (points[idx + 1].x - 0.1) : x_max;
  return clamp(targetX, minX, maxX);
}

// =============================================================
// 8. OSCILLOSCOPE RETICLE & UNCLUTTERED AXIS ENGINE
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

  // Top Left
  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  else ctx.move_to(x, y);
  ctx.line_to(x + r + extW, y);
  ctx.move_to(x, y + r);
  ctx.line_to(x, y + r + extH);
  ctx.stroke();

  // Top Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + extH);
  ctx.move_to(x + w - r - extW, y);
  ctx.line_to(x + w - r, y);
  ctx.stroke();

  // Bottom Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - extW, y + h);
  ctx.move_to(x + w, y + h - r);
  ctx.line_to(x + w, y + h - r - extH);
  ctx.stroke();

  // Bottom Left
  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - extH);
  ctx.move_to(x + r + extW, y + h);
  ctx.line_to(x + r, y + h);
  ctx.stroke();
}

function draw_envelope_graph(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 8.0 : border_radius;
  var r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  // 1. Body fill
  ctx.set_source_rgba(bg_color);
  draw_common_path(ctx, inset, inset, rw, rh, r);
  ctx.fill();

  // 2. Corner Arc Brackets
  if (b > 0) {
    draw_corners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  var margin = is_preview ? Math.max(10, Math.min(18, Math.min(w, h) * 0.12)) : track_margin;
  var lSize = isNaN(line_size) ? 1.5 : line_size;
  var hSize = isNaN(handle_size) ? 7.0 : handle_size;

  // 3. Precision Graticule Framing (Clean X baseline, Y-Axis Rail, and Ticks)
  if (axis_style > 0) {
    var axisAlpha = 0.18;
    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], axisAlpha);
    ctx.set_line_width(1.0);

    var zeroPt = valueToPixel({ x: x_min, y: y_min }, w, h, margin);
    var maxPt = valueToPixel({ x: x_max, y: y_max }, w, h, margin);

    // Horizontal X Baseline
    ctx.move_to(margin, zeroPt.y);
    ctx.line_to(w - margin, zeroPt.y);
    ctx.stroke();

    // Vertical Y Rail (L-Frame)
    if (axis_style >= 2) {
      ctx.move_to(zeroPt.x, maxPt.y);
      ctx.line_to(zeroPt.x, zeroPt.y);
      ctx.stroke();

      // Precision Edge Graduation Notches (No numbers, clean oscilloscope graticule)
      if (axis_style === 3) {
        var tickLen = 3.5;
        // Ceiling tick (1.0 / y_max)
        ctx.move_to(zeroPt.x, maxPt.y);
        ctx.line_to(zeroPt.x + tickLen, maxPt.y);
        // Midpoint tick (0.5)
        var midValY = (y_min + y_max) * 0.5;
        var midPt = valueToPixel({ x: x_min, y: midValY }, w, h, margin);
        ctx.move_to(zeroPt.x, midPt.y);
        ctx.line_to(zeroPt.x + tickLen, midPt.y);
        // Baseline tick (0.0 / y_min)
        ctx.move_to(zeroPt.x, zeroPt.y);
        ctx.line_to(zeroPt.x + tickLen, zeroPt.y);
        ctx.stroke();
      }
    }
  }

  // 4. Connecting segments
  if (points.length > 1) {
    ctx.set_source_rgba(range_color);
    ctx.set_line_width(lSize);

    var firstP = valueToPixel(points[0], w, h, margin);
    ctx.move_to(firstP.x, firstP.y);

    for (var i = 1; i < points.length; i++) {
      var pt0 = points[i - 1];
      var pt1 = points[i];
      var c = (curve_mode === 1) ? (pt1.curve || 0.0) : 0.0;

      if (Math.abs(c) < 0.005) {
        var pEnd = valueToPixel(pt1, w, h, margin);
        ctx.line_to(pEnd.x, pEnd.y);
      } else {
        var steps = 32;
        var pStart = valueToPixel(pt0, w, h, margin);
        var pEndSeg = valueToPixel(pt1, w, h, margin);
        var spanY = pt1.y - pt0.y;

        for (var s = 1; s <= steps; s++) {
          var t = s / steps;
          var easeT = evalCurve(t, c);
          var subX = pStart.x + t * (pEndSeg.x - pStart.x);
          var subValY = pt0.y + easeT * spanY;
          var subPixel = valueToPixel({ x: pt0.x, y: subValY }, w, h, margin);
          ctx.line_to(subX, subPixel.y);
        }
      }
    }
    ctx.stroke();
  }

  // 5. Handles & Two-Pass Typography
  ctx.select_font_face(font_name, get_font_slant(), get_font_weight());
  ctx.set_font_size(is_preview ? Math.max(8, Math.min(12, h * 0.07)) : text_size);

  var rawLabel = label_text;
  var dispLbl = get_display_label(rawLabel, is_preview);
  var pfxStr = dispLbl.length > 0 ? (dispLbl + " ") : "";

  for (var j = 0; j < points.length; j++) {
    var pPos = valueToPixel(points[j], w, h, margin);

    // Node handle shadow & core
    ctx.set_source_rgba(0.0, 0.0, 0.0, 0.45);
    ctx.ellipse(pPos.x - (hSize + 1.5) * 0.5, pPos.y - (hSize + 1.5) * 0.5 + 0.5, hSize + 1.5, hSize + 1.5);
    ctx.fill();

    ctx.set_source_rgba(handle_color);
    ctx.ellipse(pPos.x - hSize * 0.5, pPos.y - hSize * 0.5, hSize, hSize);
    ctx.fill();

    var showThisLabel = (display_value === 1) ||
      (!is_preview && dragging && j === active_index) ||
      (is_preview && popup_dragging && j === popup_active_index);

    if (showThisLabel) {
      var valStr = formatNum(points[j].x, 0) + "," + formatNum(points[j].y, 2);
      var pfxTm = pfxStr.length > 0 ? ctx.text_measure(pfxStr) : [0, 0];
      var valTm = ctx.text_measure(valStr);
      var pfxW = pfxTm ? pfxTm[0] : 0;
      var valW = valTm ? valTm[0] : 30;
      var totalW = pfxW + valW;

      var textX = pPos.x + hSize * 0.6;
      if (textX + totalW > w - 4) {
        textX = pPos.x - hSize * 0.6 - totalW;
      }
      var textY = pPos.y - hSize * 0.4;

      if (pfxStr.length > 0) {
        ctx.set_source_rgba(mode_color);
        ctx.move_to(textX, textY);
        ctx.show_text(pfxStr);
      }
      ctx.set_source_rgba(text_color);
      ctx.move_to(textX + pfxW, textY);
      ctx.show_text(valStr);
    }
  }

  // 6. Curving Indicator Diamond
  var activeCurvingSeg = is_preview ? popup_is_curving_segment : is_curving_segment;
  if (curve_mode === 1 && activeCurvingSeg > 0 && activeCurvingSeg < points.length) {
    var seg = activeCurvingSeg;
    var segP0 = valueToPixel(points[seg - 1], w, h, margin);
    var segP1 = valueToPixel(points[seg], w, h, margin);
    var cFactor = points[seg].curve || 0.0;

    var midX = segP0.x + 0.5 * (segP1.x - segP0.x);
    var midValY = points[seg - 1].y + evalCurve(0.5, cFactor) * (points[seg].y - points[seg - 1].y);
    var midPixel = valueToPixel({ x: points[seg - 1].x, y: midValY }, w, h, margin);
    var mx = midX;
    var my = midPixel.y;

    ctx.new_path();
    ctx.move_to(mx, my - 7);
    ctx.line_to(mx + 6, my);
    ctx.line_to(mx, my + 7);
    ctx.line_to(mx - 6, my);
    ctx.close_path();
    ctx.set_source_rgba(0.10, 0.10, 0.14, 0.92);
    ctx.fill();

    ctx.set_source_rgba(mode_color);
    ctx.set_line_width(1.0);
    ctx.stroke();

    ctx.set_source_rgba(handle_color);
    ctx.new_path();
    ctx.move_to(mx, my - 4.5); ctx.line_to(mx - 2, my - 1.5); ctx.line_to(mx + 2, my - 1.5); ctx.close_path(); ctx.fill();
    ctx.new_path();
    ctx.move_to(mx, my + 4.5); ctx.line_to(mx - 2, my + 1.5); ctx.line_to(mx + 2, my + 1.5); ctx.close_path(); ctx.fill();

    ctx.set_font_size(8);
    ctx.set_source_rgba(text_color);
    ctx.move_to(mx + 9, my + 3);
    ctx.show_text("c " + (cFactor >= 0 ? "+" : "") + formatNum(cFactor, 2));
  }

  // 7. Red Popup Launcher Dot
  if (!is_preview && allow_popup === 1) {
    var dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
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

function paint() {
  var dims = get_dimensions();
  draw_envelope_graph(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 9. OUTPUT ENGINE
// =============================================================
function output_raw_points() {
  var rawList = [];
  if (curve_mode === 1) {
    for (var k = 0; k < points.length; k++) {
      rawList.push(points[k].x);
      rawList.push(points[k].y);
      rawList.push(points[k].curve || 0.0);
    }
  } else {
    for (var k = 0; k < points.length; k++) {
      rawList.push(points[k].x);
      rawList.push(points[k].y);
    }
  }
  outlet(2, rawList);
}

function output_line_envelope() {
  sort_points();
  if (points.length === 0) return;

  var outList = [];

  if (points.length === 1) {
    outList.push(Number(points[0].x));
    outList.push(Number(points[0].y));
  } else if (curve_mode === 1) {
    outList.push(Number(points[0].y));
    outList.push(0.0);
    outList.push(0.0);
    for (var i = 1; i < points.length; i++) {
      var deltaX = Math.max(0.0, points[i].x - points[i - 1].x);
      outList.push(Number(points[i].y));
      outList.push(Number(deltaX));
      outList.push(Number(points[i].curve || 0.0));
    }
  } else {
    if (!latch_first_point && points[0].x > x_min) {
      outList.push(Number(points[0].y));
      outList.push(Number(points[0].x - x_min));
    } else {
      outList.push(Number(points[0].y));
      outList.push(0.0);
    }
    for (var j = 1; j < points.length; j++) {
      var dX = Math.max(0.0, points[j].x - points[j - 1].x);
      outList.push(Number(points[j].y));
      outList.push(Number(dX));
    }
  }

  outlet(0, outList);
  output_raw_points();
}

function bang() { output_line_envelope(); }
function dump() { output_line_envelope(); }

function mode(v) { set_curve_mode(v); }
function msg_int(v) { set_curve_mode(v); }
function msg_float(v) { set_curve_mode(v); }

function point() {
  var args = arrayfromargs(arguments);
  if (args.length < 3) return;
  var idxNum = Math.floor(Number(args[0]));
  var px = clamp(Number(args[1]), x_min, x_max);
  var py = clamp(Number(args[2]), y_min, y_max);
  var pc = args.length > 3 ? clamp(Number(args[3]), -0.99, 0.99) : 0.0;

  if (idxNum >= 0 && idxNum < points.length) {
    points[idxNum].x = px;
    points[idxNum].y = py;
    points[idxNum].curve = pc;
  } else {
    points.push({ x: px, y: py, curve: pc });
  }
  sort_points();
  redraw_all();
  if (raw_output_mode === 1) output_raw_points();
}

function setcurve(idxNum, c) {
  var i = Math.floor(Number(idxNum));
  if (i > 0 && i < points.length) {
    points[i].curve = clamp(Number(c), -0.99, 0.99);
    redraw_all();
    if (raw_output_mode === 1) output_raw_points();
  }
}

function clear() {
  points = [
    { x: x_min, y: y_min, curve: 0.0 },
    { x: x_max, y: y_min, curve: 0.0 }
  ];
  sort_points();
  redraw_all();
  if (raw_output_mode === 1) output_raw_points();
}

// =============================================================
// ROBUST LIST INGEST & PATTR VALUE HOOKS FOR PFUNCTION
// =============================================================
function list() {
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length < 2) return;

  points = [];
  var step = (curve_mode === 1) ? 3 : 2;
  for (var i = 0; i < args.length; i += step) {
    if (i + 1 < args.length) {
      points.push({
        x: clamp(Number(args[i]), x_min, x_max),
        y: clamp(Number(args[i + 1]), y_min, y_max),
        curve: (step === 3 && i + 2 < args.length) ? clamp(Number(args[i + 2] || 0.0), -0.99, 0.99) : 0.0
      });
    }
  }
  sort_points();
  redraw_all();
  if (raw_output_mode === 1) output_raw_points();
}

// =============================================================
// UNCAPPED DYNAMIC PATTR HOOKS (SUPPORTS 100 TO 1000+ POINTS)
// =============================================================
function getvalueof() {
  sort_points();
  var data = [];
  // Exports all points dynamically with zero artificial limits
  for (var i = 0; i < points.length; i++) {
    data.push(points[i].x);
    data.push(points[i].y);
    if (curve_mode === 1) {
      data.push(points[i].curve || 0.0);
    }
  }
  return data;
}

function setvalueof() {
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length < 2) return;

  var step = (curve_mode === 1) ? 3 : 2;
  var raw = [];

  for (var i = 0; i < args.length; i += step) {
    if (i + 1 < args.length) {
      raw.push({
        x: clamp(Number(args[i]), x_min, x_max),
        y: clamp(Number(args[i + 1]), y_min, y_max),
        curve: (step === 3 && i + 2 < args.length) ? clamp(Number(args[i + 2] || 0.0), -0.99, 0.99) : 0.0
      });
    }
  }

  if (raw.length === 0) return;

  // Enforce boundary anchors on whatever point count arrives
  if (latch_first_point) raw[0].x = x_min;
  if (latch_last_point && raw.length > 1) raw[raw.length - 1].x = x_max;

  points = raw;
  sort_points();
  redraw_all();
  outlet(1, "bang");
  if (raw_output_mode === 1) output_raw_points();
}

// =============================================================
// 10. MAIN CANVAS MOUSE INTERACTION (8 PARAMETERS)
// =============================================================
function handle_mouse_up() {
  if (is_curving_segment !== -1) {
    var seg = is_curving_segment;
    is_curving_segment = -1;

    if (!segment_dragged && pending_click_insert) {
      var dims = get_dimensions();
      var clickVal = pixelToValue(curve_drag_start_x, curve_drag_start_y, dims.w, dims.h);
      var pLeft = points[seg - 1];
      var pRight = points[seg];
      var t = (clickVal.x - pLeft.x) / (pRight.x - pLeft.x);
      t = clamp(t, 0.0, 1.0);

      var cFactor = (curve_mode === 1) ? (pRight.curve || 0.0) : 0.0;
      var curveY = pLeft.y + evalCurve(t, cFactor) * (pRight.y - pLeft.y);

      points.splice(seg, 0, {
        x: clamp(clickVal.x, x_min, x_max),
        y: clamp(curveY, y_min, y_max),
        curve: 0.0
      });
      sort_points();
    }

    pending_click_insert = false;
    segment_dragged = false;
    redraw_all();
    outlet(1, "bang");
    if (raw_output_mode === 1) output_raw_points();
    return;
  }

  if (dragging || active_index !== -1) {
    dragging = false;
    active_index = -1;
    sort_points();
    redraw_all();
    outlet(1, "bang");
    if (raw_output_mode === 1) output_raw_points();
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  var w = dims.w;
  var h = dims.h;
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

  active_index = -1;
  is_curving_segment = -1;
  segment_dragged = false;
  pending_click_insert = false;

  var closestDist = Infinity;
  var hitRadius = Math.max(12, handle_size * 2.0);

  // Check existing handle click
  for (var i = 0; i < points.length; i++) {
    var pPos = valueToPixel(points[i], w, h);
    var dx = x - pPos.x;
    var dy = y - pPos.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < hitRadius && dist < closestDist) {
      closestDist = dist;
      active_index = i;
    }
  }

  if (active_index !== -1) {
    var now = new Date().getTime();
    var isDoubleTap = (last_tap_handle === active_index && (now - last_tap_time < 350));
    var isDeleteGesture = (option === 1 || shift === 1 || isDoubleTap);

    var canDelete = (points.length > 1);
    var isEndpointProtected = false;
    if (active_index === 0 && latch_first_point) isEndpointProtected = true;
    if (active_index === points.length - 1 && latch_last_point && points.length > 1) isEndpointProtected = true;

    if (isDeleteGesture && canDelete && !isEndpointProtected) {
      points.splice(active_index, 1);
      last_tap_handle = -1;
      last_tap_time = 0;
      active_index = -1;
      dragging = false;
      sort_points();
      redraw_all();
      outlet(1, "bang");
      if (raw_output_mode === 1) output_raw_points();
      return;
    }

    last_tap_handle = active_index;
    last_tap_time = now;
    dragging = true;

    var valPt = pixelToValue(x, y, w, h);
    points[active_index].x = get_clamped_handle_x(active_index, valPt.x);
    points[active_index].y = clamp(valPt.y, y_min, y_max);
    redraw_all();
    if (raw_output_mode === 1) output_raw_points();
    return;
  }

  // Check segment click
  var seg = findNearestSegment(x, y, w, h);
  if (seg !== -1) {
    if (curve_mode === 1 || option === 1) {
      is_curving_segment = seg;
      curve_drag_start_x = x;
      curve_drag_start_y = y;
      curve_drag_initial_val = points[seg].curve || 0.0;
      segment_dragged = false;
      pending_click_insert = (option !== 1);
      redraw_all();
      return;
    }

    var clickVal = pixelToValue(x, y, w, h);
    var pLeft = points[seg - 1];
    var pRight = points[seg];
    var t = (clickVal.x - pLeft.x) / (pRight.x - pLeft.x);
    t = clamp(t, 0.0, 1.0);
    var linearY = pLeft.y + t * (pRight.y - pLeft.y);

    points.splice(seg, 0, {
      x: clamp(clickVal.x, x_min, x_max),
      y: clamp(linearY, y_min, y_max),
      curve: 0.0
    });

    active_index = seg;
    dragging = true;
    sort_points();
    redraw_all();
    outlet(1, "bang");
    if (raw_output_mode === 1) output_raw_points();
    return;
  }

  // Clicked on empty space: Add point
  var emptyClickVal = pixelToValue(x, y, w, h);
  var newPt = {
    x: clamp(emptyClickVal.x, x_min, x_max),
    y: clamp(emptyClickVal.y, y_min, y_max),
    curve: 0.0
  };
  points.push(newPt);
  sort_points();

  for (var k = 0; k < points.length; k++) {
    if (points[k] === newPt) {
      active_index = k;
      break;
    }
  }

  dragging = true;
  redraw_all();
  outlet(1, "bang");
  if (raw_output_mode === 1) output_raw_points();
}

function ondrag(x, y, button, cmd, shift, capslock, option, ctrl) {
  if (button === 0) {
    handle_mouse_up();
    return;
  }

  var dims = get_dimensions();
  var w = dims.w;
  var h = dims.h;

  if (is_curving_segment !== -1) {
    var dy = curve_drag_start_y - y;
    if (Math.abs(dy) > 2 || Math.abs(x - curve_drag_start_x) > 2) {
      segment_dragged = true;
    }
    var deltaC = (dy / (h * 0.4)) * 1.5;
    points[is_curving_segment].curve = clamp(curve_drag_initial_val + deltaC, -0.99, 0.99);
    redraw_all();
    if (raw_output_mode === 1) output_raw_points();
    return;
  }

  if (dragging && active_index !== -1) {
    var valPt = pixelToValue(x, y, w, h);
    points[active_index].x = get_clamped_handle_x(active_index, valPt.x);
    points[active_index].y = clamp(valPt.y, y_min, y_max);
    redraw_all();

    if (raw_output_mode === 1) {
      output_raw_points();
    }
  }
}

function onmouseup(x, y, button, cmd, shift, capslock, option, ctrl) {
  handle_mouse_up();
}

function onidleout(x, y, button, cmd, shift, capslock, option, ctrl) {
  if (dragging || is_curving_segment !== -1) handle_mouse_up();
}

function onidle(x, y, button, cmd, shift, capslock, option, ctrl) {
  if (dragging || is_curving_segment !== -1) handle_mouse_up();
}

// =============================================================
// 11. 5-TIER POPUP WINDOW & DUAL-MODE SIZING MAPPER
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  // Tier 1: Performance
  if (mask_performance === 1) {
    list.push({ name: "Scale Mode", val: rescale_mode_names[rescale_mode], is_toggle: true, target_id: 109 });
    list.push({ name: "Curve Mode", val: curve_mode === 1 ? "Curve~" : "Line~", is_toggle: true, target_id: 101 });
    list.push({ name: "Latch First", val: latch_first_point ? "ON" : "OFF", is_toggle: true, target_id: 102 });
    list.push({ name: "Latch Last", val: latch_last_point ? "ON" : "OFF", is_toggle: true, target_id: 103 });
    list.push({ name: "Raw Out Mode", val: raw_output_mode ? "Continuous" : "On Bang", is_toggle: true, target_id: 104 });
    list.push({ name: "X Min", val: x_min, is_ticker: true, key: "x_min", target_id: 105 });
    list.push({ name: "X Max", val: x_max, is_ticker: true, key: "x_max", target_id: 106 });
    list.push({ name: "Y Min", val: y_min, is_ticker: true, key: "y_min", target_id: 107 });
    list.push({ name: "Y Max", val: y_max, is_ticker: true, key: "y_max", target_id: 108 });
  }

  // Tier 2: Labels
  if (mask_labels === 1) {
    list.push({ name: "Display Text", val: display_value ? "Always" : "Peek", is_toggle: true, target_id: 201 });
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 203 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 204 });
  }

  // Tier 3: Geometry & Axes
  if (mask_geometry === 1) {
    list.push({ name: "Axis Graticule", val: axis_style_names[axis_style], is_toggle: true, target_id: 308 });
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 301 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 302 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 303 });
    list.push({ name: "Line Size", val: line_size.toFixed(1), pct: (line_size - 0.5) / 9.5, is_slider: true, target_id: 304 });
    list.push({ name: "Handle Size", val: handle_size.toFixed(1), pct: (handle_size - 3.0) / 17.0, is_slider: true, target_id: 305 });
    list.push({ name: "Margin", val: track_margin, pct: (track_margin - 4) / 36.0, is_slider: true, target_id: 306 });
    list.push({ name: "Text Size", val: text_size, pct: (text_size - 6) / 36.0, is_slider: true, target_id: 307 });
  }

  // Tier 4: Envelope Colors
  if (mask_colors === 1) {
    list.push({ name: "Mode Color", val: mode_color, is_color: true, key: "mode_color" });
    list.push({ name: "BG Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Line Color", val: range_color, is_color: true, key: "range_color" });
    list.push({ name: "Handle Color", val: handle_color, is_color: true, key: "handle_color" });
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

function get_popup_dimensions_map() {
  var rows = get_visible_rows_map();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  var calculated_h = 28 + 85 + 12 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_popup_dimensions_map();
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Touch Function Inspector";
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

  // PREVIEW CHASSIS
  var prevX = 12, prevY = 28, prevW = Math.max(40, w - 24);
  var prevH = has_rows ? 85 : Math.max(50, h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_envelope_graph(pCtx, prevW, prevH, true);
  pCtx.restore();

  // XY Corner Drag Grip Mark (Mini mode only)
  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    pCtx.move_to(w - 14, h - 4); pCtx.line_to(w - 4, h - 14);
    pCtx.move_to(w - 9, h - 4);  pCtx.line_to(w - 4, h - 9);
    pCtx.move_to(w - 4, h - 4);  pCtx.line_to(w - 4, h - 4);
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

      // Left 50%: Name
      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      // Center Divider Notch
      pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      // Right 50%: Value / Slider / Swatch / Ticker
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
        pCtx.show_text(parseFloat(r.val).toFixed(2));
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
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
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
// 12. SUB-WINDOW: MODERN HSV COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "range_color" || name === "line_color") return range_color;
  if (name === "handle_color" || name === "highlight_color") return handle_color;
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
  if (name === "bg_color") return "BG Color";
  if (name === "border_color") return "Border Color";
  if (name === "range_color") return "Line Color";
  if (name === "handle_color") return "Handle Color";
  if (name === "text_color") return "Text Color";
  if (name === "mode_color") return "Mode Color";
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
  colorMatrix = recycleMatrix(colorMatrix, winW, winH); // <-- Reuses buffer

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
// 13. SUB-WINDOW: NUMBER BOUND TICKER
// =============================================================
function get_ticker_digit_array(current_val) {
  var fixed_str = Math.abs(current_val).toFixed(decimal_digits);
  var clean_str = fixed_str.replace(".", "");
  var total = whole_digits + decimal_digits;
  while (clean_str.length < total) clean_str = "0" + clean_str;
  var digits = [];
  for (var i = 0; i < total; i++) digits.push(parseInt(clean_str.charAt(i), 10));
  return { arr: digits, sign: current_val < 0 ? -1 : 1 };
}

function rebuild_ticker_value(digits_obj) {
  var raw_int = 0;
  var total = whole_digits + decimal_digits;
  for (var i = 0; i < total; i++) raw_int = raw_int * 10 + (digits_obj.arr[i] || 0);
  return (raw_int / Math.pow(10, decimal_digits)) * digits_obj.sign;
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

  var current_val = x_min;
  if (active_ticker_target === "x_max") current_val = x_max;
  if (active_ticker_target === "y_min") current_val = y_min;
  if (active_ticker_target === "y_max") current_val = y_max;

  var ticker_data = get_ticker_digit_array(current_val);

  ctx.set_source_rgba(attr_text_color);
  ctx.set_font_size(14);
  ctx.move_to(35, 22);
  ctx.show_text(ticker_data.sign < 0 ? "-" : "+");

  var total_cols = whole_digits + decimal_digits;
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
  var current_val = x_min;
  if (active_ticker_target === "x_max") current_val = x_max;
  if (active_ticker_target === "y_min") current_val = y_min;
  if (active_ticker_target === "y_max") current_val = y_max;

  var inner_data = get_ticker_digit_array(current_val);
  inner_data.arr[active_ticker_column] = constrained_digit;
  var rebuilt = rebuild_ticker_value(inner_data);

  if (active_ticker_target === "x_min") set_x_min(rebuilt);
  else if (active_ticker_target === "x_max") set_x_max(rebuilt);
  else if (active_ticker_target === "y_min") set_y_min(rebuilt);
  else if (active_ticker_target === "y_max") set_y_max(rebuilt);

  draw_ticker_matrix_popup();
  redraw_all();
}

function execute_discrete_step_ticker(target_y) {
  var curr_val = continuous_digit_floats[active_ticker_column];
  var target_val = clamp((160 - target_y) / 125, 0, 1) * 9.0;
  var stepSize = 1.0;
  var updated_val = curr_val;

  if (Math.abs(curr_val - target_val) <= stepSize * 0.5) {
    updated_val = target_val;
  } else if (target_val > curr_val) {
    updated_val += stepSize;
    if (updated_val > target_val) updated_val = target_val;
  } else {
    updated_val -= stepSize;
    if (updated_val < target_val) updated_val = target_val;
  }
  continuous_digit_floats[active_ticker_column] = clamp(updated_val, 0, 9.0);
  update_ticker_value_and_redraw();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) {
      active_ticker_column = -1; stop_scrolling(); return;
    }
    if (mbut) {
      lastMouseY = my;
      if (mx >= 4 && mx <= 26 && my >= 4 && my <= 26) {
        tickerWindow.visible = 0; active_ticker_column = -1; stop_scrolling(); redraw_all(); return;
      }

      var current_val = x_min;
      if (active_ticker_target === "x_max") current_val = x_max;
      if (active_ticker_target === "y_min") current_val = y_min;
      if (active_ticker_target === "y_max") current_val = y_max;
      var ticker_data = get_ticker_digit_array(current_val);

      if (mx >= 35 && mx <= 55 && my >= 5 && my <= 25 && active_ticker_column === -1) {
        ticker_data.sign = ticker_data.sign * -1;
        var updated = rebuild_ticker_value(ticker_data);
        if (active_ticker_target === "x_min") set_x_min(updated);
        else if (active_ticker_target === "x_max") set_x_max(updated);
        else if (active_ticker_target === "y_min") set_y_min(updated);
        else if (active_ticker_target === "y_max") set_y_max(updated);
        draw_ticker_matrix_popup(); redraw_all(); active_ticker_column = 99; return;
      }

      if (active_ticker_column === -1 || active_ticker_column === 99) {
        var total_cols = whole_digits + decimal_digits;
        for (var i = 0; i < total_cols; i++) {
          var xOffset = 30 + i * (slider_width_px + slider_gap_px);
          if (i >= whole_digits) xOffset += 10;
          if (mx >= xOffset && mx <= xOffset + slider_width_px && my >= 35 && my <= 160) {
            active_ticker_column = i;
            stop_scrolling();
            continuous_digit_floats[i] = ticker_data.arr[i] || 0;
            execute_discrete_step_ticker(my);

            scrollTask = new Task(function () {
              if (active_ticker_column === -1) return;
              var target_val = clamp((160 - lastMouseY) / 125, 0, 1) * 9.0;
              continuous_digit_floats[active_ticker_column] = target_val;
              update_ticker_value_and_redraw();
            }, this);
            scrollTask.interval = 15;
            scrollTask.repeat();
            break;
          }
        }
      }
    }
  }
}

// =============================================================
// 14. POPUP WINDOW LISTENER (SLIDER FIX & RESIZE ENGINE)
// =============================================================
function apply_slider_target(target_id, targetPct) {
  if (target_id === 301) set_border_radius(targetPct * 25.0);
  else if (target_id === 302) set_border_thickness(targetPct * 10.0);
  else if (target_id === 303) set_border_extension(targetPct * 50.0);
  else if (target_id === 304) set_line_size(0.5 + targetPct * 9.5);
  else if (target_id === 305) set_handle_size(3.0 + targetPct * 17.0);
  else if (target_id === 306) set_track_margin(Math.round(4 + targetPct * 36));
  else if (target_id === 307) set_text_size(Math.round(6 + targetPct * 36));
  redraw_all();
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) update_popup_dimensions();
  else {
    popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  mgraphics.redraw();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var cmd = args[3] || 0, shift = args[4] || 0, capslock = args[5] || 0, option = args[6] || 0, ctrl = args[7] || 0;
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
    var pMargin = Math.max(10, Math.min(18, Math.min(pr.w, pr.h) * 0.12));

    if (mbut === 0) {
      is_resizing_window = 0;
      if (active_pop_target === 50) {
        if (popup_is_curving_segment !== -1) {
          var seg = popup_is_curving_segment;
          popup_is_curving_segment = -1;

          if (!popup_segment_dragged && popup_pending_click_insert) {
            var clickVal = pixelToValue(popup_curve_drag_start_x, popup_curve_drag_start_y, pr.w, pr.h, pMargin);
            var pLeft = points[seg - 1];
            var pRight = points[seg];
            var t = (clickVal.x - pLeft.x) / (pRight.x - pLeft.x);
            t = clamp(t, 0.0, 1.0);

            var cFactor = (curve_mode === 1) ? (pRight.curve || 0.0) : 0.0;
            var curveY = pLeft.y + evalCurve(t, cFactor) * (pRight.y - pLeft.y);

            points.splice(seg, 0, {
              x: clamp(clickVal.x, x_min, x_max),
              y: clamp(curveY, y_min, y_max),
              curve: 0.0
            });
            sort_points();
          }
          popup_pending_click_insert = false;
          popup_segment_dragged = false;
          redraw_all();
          outlet(1, "bang");
          if (raw_output_mode === 1) output_raw_points();
        } else if (popup_dragging || popup_active_index !== -1) {
          popup_dragging = false;
          popup_active_index = -1;
          sort_points();
          redraw_all();
          outlet(1, "bang");
          if (raw_output_mode === 1) output_raw_points();
        }
      }
      active_pop_target = -1;
      stop_scrolling();
      return;
    }

    // Free XY Resizing (Mini mode only)
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(180, Math.min(start_resize_w + deltaW, 1920));
      popup_mini_h = Math.max(80, Math.min(start_resize_h + deltaH, 1200));
      update_popup_dimensions();
      return;
    }

    // Corner Grab Handle Hit Detection (Mini mode only)
    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx;
      start_click_y = my;
      start_resize_w = w;
      start_resize_h = h;
      return;
    }

    // Red Close Button Hit
    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
      stop_scrolling();
      mgraphics.redraw();
      return;
    }

    // Top-Right Toggle Pill Button Hit
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // Preview Graph Dragging
    if (active_pop_target === 50) {
      var local_x = mx - pr.x;
      var local_y = my - pr.y;

      if (popup_is_curving_segment !== -1) {
        var dy = popup_curve_drag_start_y - local_y;
        if (Math.abs(dy) > 2 || Math.abs(local_x - popup_curve_drag_start_x) > 2) {
          popup_segment_dragged = true;
        }
        var deltaC = (dy / (pr.h * 0.4)) * 1.5;
        points[popup_is_curving_segment].curve = clamp(popup_curve_drag_initial_val + deltaC, -0.99, 0.99);
        redraw_all();
        if (raw_output_mode === 1) output_raw_points();
        return;
      }

      if (popup_dragging && popup_active_index !== -1) {
        var valPt = pixelToValue(local_x, local_y, pr.w, pr.h, pMargin);
        points[popup_active_index].x = get_clamped_handle_x(popup_active_index, valPt.x);
        points[popup_active_index].y = clamp(valPt.y, y_min, y_max);
        redraw_all();
        if (raw_output_mode === 1) output_raw_points();
        return;
      }
    }

    // Preview Graph Click Hit
    var prevMaxY = pr.y + pr.h;
    if (mbut && my >= pr.y && my <= prevMaxY && active_pop_target === -1) {
      if (mx >= pr.x && mx <= pr.x + pr.w) {
        active_pop_target = 50;
        var local_x = mx - pr.x;
        var local_y = my - pr.y;

        popup_active_index = -1;
        popup_is_curving_segment = -1;
        popup_segment_dragged = false;
        popup_pending_click_insert = false;

        var closestDist = Infinity;
        var hitRadius = Math.max(12, handle_size * 1.8);

        for (var i = 0; i < points.length; i++) {
          var pPos = valueToPixel(points[i], pr.w, pr.h, pMargin);
          var dx = local_x - pPos.x;
          var dy = local_y - pPos.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < hitRadius && dist < closestDist) {
            closestDist = dist;
            popup_active_index = i;
          }
        }

        if (popup_active_index !== -1) {
          var now = new Date().getTime();
          var isDoubleTap = (popup_last_tap_handle === popup_active_index && (now - popup_last_tap_time < 350));
          var isDeleteGesture = (ctrl === 1 || option === 1 || shift === 1 || isDoubleTap);

          var canDelete = (points.length > 1);
          var isEndpointProtected = false;
          if (popup_active_index === 0 && latch_first_point) isEndpointProtected = true;
          if (popup_active_index === points.length - 1 && latch_last_point && points.length > 1) isEndpointProtected = true;

          if (isDeleteGesture && canDelete && !isEndpointProtected) {
            points.splice(popup_active_index, 1);
            popup_last_tap_handle = -1;
            popup_last_tap_time = 0;
            popup_active_index = -1;
            popup_dragging = false;
            sort_points();
            redraw_all();
            outlet(1, "bang");
            if (raw_output_mode === 1) output_raw_points();
            return;
          }

          popup_last_tap_handle = popup_active_index;
          popup_last_tap_time = now;
          popup_dragging = true;

          var valPt2 = pixelToValue(local_x, local_y, pr.w, pr.h, pMargin);
          points[popup_active_index].x = get_clamped_handle_x(popup_active_index, valPt2.x);
          points[popup_active_index].y = clamp(valPt2.y, y_min, y_max);
          redraw_all();
          if (raw_output_mode === 1) output_raw_points();
          return;
        }

        var seg = findNearestSegment(local_x, local_y, pr.w, pr.h, pMargin);
        if (seg !== -1) {
          if (curve_mode === 1 || option === 1) {
            popup_is_curving_segment = seg;
            popup_curve_drag_start_x = local_x;
            popup_curve_drag_start_y = local_y;
            popup_curve_drag_initial_val = points[seg].curve || 0.0;
            popup_segment_dragged = false;
            popup_pending_click_insert = (option !== 1);
            redraw_all();
            return;
          }

          var clickVal = pixelToValue(local_x, local_y, pr.w, pr.h, pMargin);
          var pLeft = points[seg - 1];
          var pRight = points[seg];
          var t = (clickVal.x - pLeft.x) / (pRight.x - pLeft.x);
          t = clamp(t, 0.0, 1.0);
          var linearY = pLeft.y + t * (pRight.y - pLeft.y);

          points.splice(seg, 0, {
            x: clamp(clickVal.x, x_min, x_max),
            y: clamp(linearY, y_min, y_max),
            curve: 0.0
          });

          popup_active_index = seg;
          popup_dragging = true;
          sort_points();
          redraw_all();
          outlet(1, "bang");
          if (raw_output_mode === 1) output_raw_points();
          return;
        }

        var emptyClickVal = pixelToValue(local_x, local_y, pr.w, pr.h, pMargin);
        var newPreviewPt = {
          x: clamp(emptyClickVal.x, x_min, x_max),
          y: clamp(emptyClickVal.y, y_min, y_max),
          curve: 0.0
        };
        points.push(newPreviewPt);
        sort_points();

        for (var m = 0; m < points.length; m++) {
          if (points[m] === newPreviewPt) {
            popup_active_index = m;
            break;
          }
        }

        popup_dragging = true;
        redraw_all();
        outlet(1, "bang");
        if (raw_output_mode === 1) output_raw_points();
        return;
      }
    }

    if (!has_rows) return;

    // 50/50 Attrui Rows Click & Drag
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
        if (r.is_toggle) {
          if (r.target_id === 109) set_rescale_mode(rescale_mode ? 0 : 1);
          else if (r.target_id === 101) set_curve_mode(curve_mode ? 0 : 1);
          else if (r.target_id === 102) set_latch_first_point(latch_first_point ? 0 : 1);
          else if (r.target_id === 103) set_latch_last_point(latch_last_point ? 0 : 1);
          else if (r.target_id === 104) set_raw_output_mode(raw_output_mode ? 0 : 1);
          else if (r.target_id === 201) set_display_value(display_value ? 0 : 1);
          else if (r.target_id === 202) set_label_mode((label_mode + 1) % 5);
          else if (r.target_id === 203) set_case_mode((case_mode + 1) % 3);
          else if (r.target_id === 204) set_font_style((font_style + 1) % 4);
          else if (r.target_id === 308) set_axis_style((axis_style + 1) % 4);
        } else if (r.is_ticker) {
          active_ticker_target = r.key;
          colorWindow.visible = 0;
          if (popupWindow && popupWindow.pos) {
            tickerWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + sY + rIdx * 28 + 14];
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
// 15. SAFE GETTERS & SETTERS
// =============================================================
function set_rescale_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    rescale_mode = (p > 0) ? 1 : 0;
  } else if (typeof v === "string") {
    rescale_mode = (v.toLowerCase().indexOf("rescale") !== -1 || v === "1") ? 1 : 0;
  }
  redraw_all();
}
function get_rescale_mode() { return rescale_mode; }

function set_curve_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) curve_mode = (p > 0) ? 1 : 0;
  redraw_all();
}
function get_curve_mode() { return curve_mode; }

function set_latch_first_point(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) latch_first_point = p ? 1 : 0;
  enforce_anchors();
  redraw_all();
}
function get_latch_first_point() { return latch_first_point; }

function set_latch_last_point(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) latch_last_point = p ? 1 : 0;
  enforce_anchors();
  redraw_all();
}
function get_latch_last_point() { return latch_last_point; }

function set_raw_output_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) raw_output_mode = p ? 1 : 0;
  redraw_all();
}
function get_raw_output_mode() { return raw_output_mode; }

function set_display_value(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) display_value = (p > 0) ? 1 : 0;
  redraw_all();
}
function get_display_value() { return display_value; }

function set_label_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) label_mode = clamp(p, 0, 4);
  redraw_all();
}
function get_label_mode() { return label_mode; }

function set_case_mode(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) case_mode = clamp(p, 0, 2);
  redraw_all();
}
function get_case_mode() { return case_mode; }

function set_font_style(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) font_style = clamp(p, 0, 3);
  redraw_all();
}
function get_font_style() { return font_style; }

function set_font_name(v) {
  if (v !== undefined && v !== null) font_name = String(v);
  redraw_all();
}
function get_font_name() { return font_name; }

function set_text_size(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) text_size = Math.max(6, p);
  redraw_all();
}
function get_text_size() { return text_size; }

function set_axis_style(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) axis_style = clamp(p, 0, 3);
  redraw_all();
}
function get_axis_style() { return axis_style; }

function set_x_min(v) {
  var p = Number(v);
  if (!isNaN(p)) {
    if (rescale_mode === 1) {
      rescale_points_x(p, x_max);
    } else {
      x_min = p;
      clamp_points();
    }
  }
}
function get_x_min() { return x_min; }

function set_x_max(v) {
  var p = Number(v);
  if (!isNaN(p)) {
    if (rescale_mode === 1) {
      rescale_points_x(x_min, p);
    } else {
      x_max = p;
      clamp_points();
    }
  }
}
function get_x_max() { return x_max; }

function set_y_min(v) {
  var p = Number(v);
  if (!isNaN(p)) {
    if (rescale_mode === 1) {
      rescale_points_y(p, y_max);
    } else {
      y_min = p;
      clamp_points();
    }
  }
}
function get_y_min() { return y_min; }

function set_y_max(v) {
  var p = Number(v);
  if (!isNaN(p)) {
    if (rescale_mode === 1) {
      rescale_points_y(y_min, p);
    } else {
      y_max = p;
      clamp_points();
    }
  }
}
function get_y_max() { return y_max; }

function clamp_points() {
  for (var i = 0; i < points.length; i++) {
    points[i].x = clamp(points[i].x, x_min, x_max);
    points[i].y = clamp(points[i].y, y_min, y_max);
  }
  sort_points();
  redraw_all();
}

function set_border_radius(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) border_radius = Math.max(0, p);
  redraw_all();
}
function get_border_radius() { return border_radius; }

function set_border_thickness(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) border_thickness = Math.max(0, p);
  redraw_all();
}
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) border_extension = Math.max(0, p);
  redraw_all();
}
function get_border_extension() { return border_extension; }

function set_line_size(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) line_size = Math.max(0.5, p);
  redraw_all();
}
function get_line_size() { return line_size; }

function set_handle_size(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) handle_size = Math.max(3.0, p);
  redraw_all();
}
function get_handle_size() { return handle_size; }

function set_track_margin(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) track_margin = Math.max(4, p);
  redraw_all();
}
function get_track_margin() { return track_margin; }

function set_allow_popup(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) allow_popup = p ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  redraw_all();
}
function get_allow_popup() { return allow_popup; }

function set_show_settings_attrs(v) {
  show_settings_attrs = parseInt(v, 10) ? 1 : 0;
  update_popup_dimensions();
}
function get_show_settings_attrs() { return show_settings_attrs; }

function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(180, Math.min(pw, 1920));
  if (!isNaN(ph)) popup_mini_h = Math.max(80, Math.min(ph, 1200));
  update_popup_dimensions();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function set_bg_color() { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color() { return bg_color; }

function set_border_color() { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color() { return border_color; }

function set_range_color() { range_color = rgba_values(arguments, range_color); redraw_all(); }
function get_range_color() { return range_color; }

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

function set_mask_performance(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) mask_performance = p ? 1 : 0;
  update_popup_dimensions();
}
function get_mask_performance() { return mask_performance; }

function set_mask_labels(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) mask_labels = p ? 1 : 0;
  update_popup_dimensions();
}
function get_mask_labels() { return mask_labels; }

function set_mask_geometry(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) mask_geometry = p ? 1 : 0;
  update_popup_dimensions();
}
function get_mask_geometry() { return mask_geometry; }

function set_mask_colors(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) mask_colors = p ? 1 : 0;
  update_popup_dimensions();
}
function get_mask_colors() { return mask_colors; }

function set_mask_popup_colors(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) mask_popup_colors = p ? 1 : 0;
  update_popup_dimensions();
}
function get_mask_popup_colors() { return mask_popup_colors; }

function anything() {
  var args = arrayfromargs(arguments);
  var name = messagename.replace(/^set_?/, "").toLowerCase();

  if (name === "update" || name === "theme_update" || name === "refresh" || name === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }

  if (name === "rescale" || name === "clamp" || name === "domain_mode" || name === "scale_mode") name = "rescale_mode";
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";
  if (name === "highlight_color") name = "handle_color";
  if (name === "slider_handle_color") name = "handle_color";
  if (name === "slider_rail_color") name = "range_color";
  if (name === "axes" || name === "axis") name = "axis_style";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 16. MAX DECLAREATTRIBUTE CONFIGURATIONS
// =============================================================
declareattribute("rescale_mode", { type: "int", style: "enumindex", enumvals: ["Clamp", "Rescale"], label: "Domain Scale Mode", setter: "set_rescale_mode", getter: "get_rescale_mode", category: "Envelope Behavior", embed: 1 });
declareattribute("curve_mode", { type: "int", style: "onoff", label: "Curve Mode (curve~)", setter: "set_curve_mode", getter: "get_curve_mode", category: "Envelope Behavior", embed: 1 });
declareattribute("latch_first_point", { type: "int", style: "onoff", label: "Latch First Point", setter: "set_latch_first_point", getter: "get_latch_first_point", category: "Envelope Behavior", embed: 1 });
declareattribute("latch_last_point", { type: "int", style: "onoff", label: "Latch Last Point", setter: "set_latch_last_point", getter: "get_latch_last_point", category: "Envelope Behavior", embed: 1 });
declareattribute("raw_output_mode", { type: "int", style: "enumindex", enumvals: ["On Bang", "Continuous"], label: "Raw Out Mode", setter: "set_raw_output_mode", getter: "get_raw_output_mode", category: "Envelope Behavior", embed: 1 });
declareattribute("x_min", { type: "float", label: "X Min", setter: "set_x_min", getter: "get_x_min", category: "Envelope Behavior", embed: 1 });
declareattribute("x_max", { type: "float", label: "X Max", setter: "set_x_max", getter: "get_x_max", category: "Envelope Behavior", embed: 1 });
declareattribute("y_min", { type: "float", label: "Y Min", setter: "set_y_min", getter: "get_y_min", category: "Envelope Behavior", embed: 1 });
declareattribute("y_max", { type: "float", label: "Y Max", setter: "set_y_max", getter: "get_y_max", category: "Envelope Behavior", embed: 1 });

declareattribute("display_value", { type: "int", style: "onoff", label: "Show Value Labels", setter: "set_display_value", getter: "get_display_value", category: "Labels & Typography", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Labels & Typography", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Labels & Typography", embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Labels & Typography", embed: 1 });
declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Labels & Typography", embed: 1 });
declareattribute("text_size", { type: "int", label: "Font Size", setter: "set_text_size", getter: "get_text_size", category: "Labels & Typography", embed: 1 });

declareattribute("axis_style", { type: "int", style: "enumindex", enumvals: ["Off", "X Base", "L-Frame", "L-Frame + Ticks"], label: "Axis Graticule", setter: "set_axis_style", getter: "get_axis_style", category: "Geometry", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 1 });
declareattribute("line_size", { type: "float", label: "Line Size", setter: "set_line_size", getter: "get_line_size", category: "Geometry", embed: 1 });
declareattribute("handle_size", { type: "float", label: "Handle Size", setter: "set_handle_size", getter: "get_handle_size", category: "Geometry", embed: 1 });
declareattribute("track_margin", { type: "int", label: "Track Margin", setter: "set_track_margin", getter: "get_track_margin", category: "Geometry", embed: 1 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Popup", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup Masks", embed: 1 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup Masks", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", setter: "set_mask_performance", getter: "get_mask_performance", category: "Popup Masks", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", setter: "set_mask_labels", getter: "get_mask_labels", category: "Popup Masks", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", setter: "set_mask_geometry", getter: "get_mask_geometry", category: "Popup Masks", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Colors", setter: "set_mask_colors", getter: "get_mask_colors", category: "Popup Masks", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", setter: "set_mask_popup_colors", getter: "get_mask_popup_colors", category: "Popup Masks", embed: 1 });

declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Envelope Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Envelope Colors", embed: 1 });
declareattribute("range_color", { type: "rgba", style: "rgba", label: "Line Color", setter: "set_range_color", getter: "get_range_color", category: "Envelope Colors", embed: 1 });
declareattribute("handle_color", { type: "rgba", style: "rgba", label: "Handle Color", setter: "set_handle_color", getter: "get_handle_color", category: "Envelope Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Envelope Colors", embed: 1 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode Prefix Color", setter: "set_mode_color", getter: "get_mode_color", category: "Envelope Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Envelope Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

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
    if (initDict.contains("border_radius")) set_border_radius(initDict.get("border_radius"));
    if (initDict.contains("border_thickness")) set_border_thickness(initDict.get("border_thickness"));
    if (initDict.contains("border_extension")) set_border_extension(initDict.get("border_extension"));

    if (initDict.contains("bg_color")) set_bg_color(initDict.get("bg_color"));
    if (initDict.contains("border_color")) set_border_color(initDict.get("border_color"));
    if (initDict.contains("text_color")) set_text_color(initDict.get("text_color"));
    if (initDict.contains("mode_color")) set_mode_color(initDict.get("mode_color"));

    var kVal = initDict.contains("slider_handle_color") ? initDict.get("slider_handle_color") : (initDict.contains("highlight_color") ? initDict.get("highlight_color") : null);
    if (kVal) set_handle_color(kVal);

    var rColVal = initDict.contains("slider_rail_color") ? initDict.get("slider_rail_color") : (initDict.contains("track_color") ? initDict.get("track_color") : null);
    if (rColVal) set_range_color(rColVal);

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
    else if (theme.corner_radius !== undefined) set_border_radius(theme.corner_radius);

    if (theme.border_thickness !== undefined) set_border_thickness(theme.border_thickness);
    else if (theme.bordersize !== undefined) set_border_thickness(theme.bordersize);

    if (theme.border_extension !== undefined) set_border_extension(theme.border_extension);

    if (theme.bg_color) set_bg_color(theme.bg_color);
    if (theme.border_color) set_border_color(theme.border_color);
    if (theme.text_color) set_text_color(theme.text_color);
    else if (theme.font_color) set_text_color(theme.font_color);

    if (theme.mode_color) set_mode_color(theme.mode_color);

    var knobColor = theme.slider_handle_color || theme.handle_color || theme.highlight_color || theme.accent_color;
    if (knobColor) set_handle_color(knobColor);

    var railColor = theme.slider_rail_color || theme.track_color;
    if (railColor) set_range_color(railColor);

    if (theme.popup_dot_color) set_popup_dot_color(theme.popup_dot_color);
    else if (theme.dot_color) set_popup_dot_color(theme.dot_color);

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
// 18. PERSISTENCE (SAVE) & LIFECYCLE DESTRUCTION
// =============================================================
function save() {
  embedmessage("set_rescale_mode", rescale_mode);
  embedmessage("set_curve_mode", curve_mode);
  embedmessage("set_latch_first_point", latch_first_point);
  embedmessage("set_latch_last_point", latch_last_point);
  embedmessage("set_raw_output_mode", raw_output_mode);
  embedmessage("set_x_min", x_min);
  embedmessage("set_x_max", x_max);
  embedmessage("set_y_min", y_min);
  embedmessage("set_y_max", y_max);

  embedmessage("set_display_value", display_value);
  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_font_style", font_style);
  embedmessage("set_font_name", font_name);
  embedmessage("set_text_size", text_size);

  embedmessage("set_axis_style", axis_style);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_line_size", line_size);
  embedmessage("set_handle_size", handle_size);
  embedmessage("set_track_margin", track_margin);

  embedmessage("set_allow_popup", allow_popup);
  embedmessage("set_show_settings_attrs", show_settings_attrs);
  embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);

  embedmessage("set_mask_performance", mask_performance);
  embedmessage("set_mask_labels", mask_labels);
  embedmessage("set_mask_geometry", mask_geometry);
  embedmessage("set_mask_colors", mask_colors);
  embedmessage("set_mask_popup_colors", mask_popup_colors);

  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_range_color", range_color[0], range_color[1], range_color[2], range_color[3]);
  embedmessage("set_handle_color", handle_color[0], handle_color[1], handle_color[2], handle_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  var flat = [];
  for (var i = 0; i < points.length; i++) {
    flat.push(points[i].x);
    flat.push(points[i].y);
    if (curve_mode === 1) {
      flat.push(points[i].curve || 0.0);
    }
  }
  embedmessage.apply(this, ["list"].concat(flat));
}

function notifydeleted() {
  if (render_task) {
    try { render_task.cancel(); } catch (e) {}
  }
  if (scrollTask) {
    try { scrollTask.cancel(); } catch (e) {}
  }

  try {
    if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) {
      delete themeBus.subscribers[uniqueID];
    }
  } catch (e) {}

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

// Attach Jitter Listeners
windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);