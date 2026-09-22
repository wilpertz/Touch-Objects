/* ==========================================================================
   JSUI SUITE: VERTICAL TOUCH SLIDER COMPONENT
   File: touch.vslider.js
   Architecture: Max 9 v8ui / jsui + Jitter Popup Inspector Ecosystem
   Features: Dual-Chassis (Ribbon/Rail), Proximity Easing & Step in Main & Popup,
             Vertical Elastic Resizing (280px Standardized Width), Vector Rotated Typography,
             Theme Master Wireless Sync & Native Floating Spectrum Color Picker,
             Two-Pass Mode Color Decoupling & 50/50 Attrui Inspector (Dialog-Free).
   ========================================================================== */

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 1;

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. STATE & BEHAVIOR
// =============================================================
var val = 0.0;
var current_w = 35;
var current_h = 150;
var last_x = 0;
var last_y = 0;
var start_click_y = 0;
var is_dragging = 0;
var is_scrolling_drag = 0;
var click_time = 0;
var last_step_time = 0;
var hold_gate_passed = 0;
var backgroundTask = null;
var scrollTask = null;
var lastMouseX = 0;
var lastMouseY = 0;

var slider_style = 0; // 0 = Ribbon, 1 = Rail
var click_jump = 0;   // 0 = Touch (incremental), 1 = Mouse/Click (direct jump)
var mode_options = ["Touch", "Click"];

var min_val = 0.0;
var max_val = 1.0;
var step_amount = 0.1;
var step_speed_ms = 5;
var curve_exponent = 0.35;
var slider_speed = 1.0;
var allow_popup = 1;
var is_transmitting = false;

// =============================================================
// 2. TYPOGRAPHY & LABELS (TWO-PASS MODE COLOR DECOUPLING)
// =============================================================
var label_text = "value";
var label_mode = 0; // 0 = Full, 1 = No Vowels, 2 = Caps Only, 3 = First Letter, 4 = No Text
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];

var case_mode = 0; // 0 = First Cap, 1 = All Cap, 2 = All Small
var case_mode_names = ["First Cap", "All Cap", "All Small"];

var font_name = "Arial";
var text_size = 12;
var font_style = 0; // 0 = Regular, 1 = Bold, 2 = Italic, 3 = Bold Italic
var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];

var track_x_offset = 0;
var text_x_offset = 0;
var text_y_offset = 0;

// =============================================================
// 3. GEOMETRY & STYLING
// =============================================================
var border_radius = 1.0;
var border_thickness = 1.2;
var border_extension = 6.0;

var needle_thickness = 2.0;
var track_breadth = 2.5;
var slider_breadth = 90; // Needle crossbar width percentage (50-100)

// Component Colors
var bg_color = [0.0, 0.0, 0.0, 1.0];
var border_color = [1.0, 1.0, 0.0, 1.0];
var track_color = [1.0, 0.0, 0.0, 1.0];
var handle_color = [1.0, 0.22, 0.25, 1.0]; // Needle / Orb knob color (Highlight)
var text_color = [0.92, 0.94, 0.98, 1.0];
var mode_color = [0.85, 0.85, 0.90, 1.0]; // Dedicated Prefix/Label Color
var popup_dot_color = [1.0, 0.0, 0.0, 1.0];

// Popup Attrui UI Colors
var pop_bgcolor = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color = [0.88, 0.88, 0.88, 1.0];

// Standard 5-Tier Popup Visibility Masks & Vertical Elastic Sizing
var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var showSettings = 0;
var popup_window_width = 280; // Standardized baseline width matching suite
var popup_window_height = 540;
var popTextSize = 10;

// =============================================================
// 4. JITTER POPUP WINDOWS & RECYCLING
// =============================================================
var popupWindow = new JitterObject("jit.window", "vsl_set_" + uniqueID);
popupWindow.floating = 1;
popupWindow.visible = 0;
popupWindow.border = 1;
popupWindow.grow = 0;
popupWindow.title = "Vertical Slider Inspector";

var colorWindow = new JitterObject("jit.window", "vsl_col_" + uniqueID);
colorWindow.floating = 1;
colorWindow.visible = 0;
colorWindow.border = 1;
colorWindow.grow = 0;
colorWindow.title = "Color Picker";
colorWindow.size = [200, 240];

var tickerWindow = new JitterObject("jit.window", "vsl_num_" + uniqueID);
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
var active_color_target = "border_color";
var active_ticker_target = "min_val";
var active_ticker_column = -1;
var is_mouse_down_anywhere = 0;

var picker_drag_zone = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

var whole_digits = 4;
var decimal_digits = 2;
var continuous_digit_floats = [];

var slider_width_px = 32;
var slider_gap_px = 6;

var is_dragging_ticker = 0;
var is_scrolling_drag_ticker = 0;
var start_click_y_ticker = 0;
var click_time_ticker = 0;
var last_step_time_ticker = 0;
var hold_gate_passed_ticker = 0;

var start_resize_h = 540;
var is_resizing_window = 0;

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 35, y: 35, w: 140, h: 180 };

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

// =============================================================
// 5. HSV <-> RGB UTILITIES
// =============================================================
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

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

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

// Loop-Safe Unified Output Dispatcher
function output_scaled_value() {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    outlet(0, getScaledValue());
  } finally {
    is_transmitting = false;
  }
}

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

// =============================================================
// 6. TYPOGRAPHY & LABELLING
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

function getTrackBounds(w, h) {
  if (slider_style === 1) {
    var orbR = Math.max(3.5, Math.min(8.5, w * 0.28));
    var trackY = orbR + 4;
    var trackHeight = Math.max(2.0, h - 2 * trackY);
    return { y: trackY, h: trackHeight, r: orbR };
  } else {
    var r = Math.min(border_radius, Math.min(w, h) * 0.5);
    if (r < 0) r = 0;
    var trackHeight = Math.max(2.0, h - 2 * r);
    return { y: r, h: trackHeight, r: r };
  }
}

// =============================================================
// 7. RENDERING (VERTICAL ORIENTATION + TWO-PASS LABELS)
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

function draw_slider_chassis(ctx, w, h, is_preview) {
  var bounds = getTrackBounds(w, h);
  var prop = val;
  if (isNaN(prop) || !isFinite(prop)) prop = 0.0;

  if (slider_style === 1) {
    var wireW = Math.max(1.0, track_breadth);
    var trackX = w * 0.5 + w * (track_x_offset * 0.01);
    var trackBoxX = trackX - wireW * 0.5;

    ctx.set_source_rgba(track_color);
    ctx.rectangle_rounded(trackBoxX, bounds.y, wireW, bounds.h, wireW * 0.5, wireW * 0.5);
    ctx.fill();

    var orbX = trackX;
    var orbY = bounds.y + bounds.h * (1.0 - prop);
    var orbR = bounds.r;

    ctx.set_source_rgba(0.0, 0.0, 0.0, 0.65);
    ctx.ellipse(orbX - orbR - 0.5, orbY - orbR + 0.6, (orbR + 0.5) * 2, (orbR + 0.5) * 2);
    ctx.fill();

    ctx.set_source_rgba(handle_color);
    ctx.ellipse(orbX - orbR, orbY - orbR, orbR * 2, orbR * 2);
    ctx.fill();

    ctx.set_source_rgba(0.0, 0.0, 0.0, 0.45);
    ctx.set_line_width(0.75);
    ctx.ellipse(orbX - orbR, orbY - orbR, orbR * 2, orbR * 2);
    ctx.stroke();
  } else {
    var b = isNaN(border_thickness) ? 1.2 : border_thickness;
    var inset = b * 0.5;
    var rw = Math.max(1, w - b);
    var rh = Math.max(1, h - b);
    var radVal = isNaN(border_radius) ? 1.0 : border_radius;
    var r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
    var extVal = isNaN(border_extension) ? 6.0 : border_extension;
    var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
    var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

    ctx.set_source_rgba(bg_color);
    draw_common_path(ctx, inset, inset, rw, rh, r);
    ctx.fill();

    var trackX2 = w * 0.5 + w * (track_x_offset * 0.01);
    ctx.set_source_rgba(track_color);
    ctx.set_line_width(track_breadth);
    ctx.move_to(trackX2, bounds.y);
    ctx.line_to(trackX2, bounds.y + bounds.h);
    ctx.stroke();

    var crossbarW = Math.min(w, w * (slider_breadth * 0.01));
    if (crossbarW < 2.0) crossbarW = 2.0;
    var crossbarX = w * 0.5 - crossbarW * 0.5;
    var crossbarY = bounds.y + bounds.h * (1.0 - prop) - needle_thickness * 0.5;
    crossbarY = clamp(crossbarY, 0.0, h - needle_thickness);

    ctx.set_source_rgba(handle_color);
    ctx.rectangle(crossbarX, crossbarY, crossbarW, needle_thickness);
    ctx.fill();

    if (b > 0) {
      draw_corners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
    }
  }

  // TWO-PASS ROTATED TEXT RENDERING: Label (mode_color) + Value (text_color)
  ctx.select_font_face(font_name, get_font_slant(), get_font_weight());
  ctx.set_font_size(text_size);

  var rawLabel = label_text;
  var dispLbl = get_display_label(rawLabel, is_preview);
  var pfxStr = dispLbl.length > 0 ? (dispLbl + " ") : "";
  var valStr = getScaledValue().toFixed(2);

  var pfxTm = pfxStr.length > 0 ? ctx.text_measure(pfxStr) : [0, 0];
  var valTm = ctx.text_measure(valStr);
  var pfxW = pfxTm ? pfxTm[0] : 0;
  var valW = valTm ? valTm[0] : text_size * 2.0;
  var totalTextW = pfxW + valW;

  if (is_preview) {
    var targetTextX = w * 0.5 - totalTextW * 0.5;
    targetTextX = clamp(targetTextX, 4, Math.max(4, w - totalTextW - 4));
    if (pfxStr.length > 0) {
      ctx.set_source_rgba(mode_color);
      ctx.move_to(targetTextX, 20);
      ctx.show_text(pfxStr);
    }
    ctx.set_source_rgba(text_color);
    ctx.move_to(targetTextX + pfxW, 20);
    ctx.show_text(valStr);
  } else {
    var centerX = w * 0.5 + w * (text_x_offset * 0.01);
    var centerY = h * 0.5 + h * (text_y_offset * 0.01);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI * 0.5);

    var startX = -totalTextW * 0.5;
    var baseline = text_size * 0.35;

    if (pfxStr.length > 0) {
      ctx.set_source_rgba(mode_color);
      ctx.move_to(startX, baseline);
      ctx.show_text(pfxStr);
    }
    ctx.set_source_rgba(text_color);
    ctx.move_to(startX + pfxW, baseline);
    ctx.show_text(valStr);

    ctx.restore();
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
  draw_slider_chassis(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 8. RUNTIME STEPPING & EASING ENGINE (VERTICAL)
// =============================================================
function set(v) {
  var parsed = parseFloat(v);
  if (!isNaN(parsed)) {
    var span = max_val - min_val;
    var scaled = span > 0 ? (parsed - min_val) / span : 0.0;
    val = clamp(scaled, 0.0, 1.0);
    redraw_all();
  }
}

function set_val(v) { set(v); }
function msg_int(v) { msg_float(v); }
function bang() { output_scaled_value(); }

function msg_float(v) {
  if (is_transmitting) return;
  var parsed = parseFloat(v);
  if (!isNaN(parsed)) {
    var span = max_val - min_val;
    var scaled = span > 0 ? (parsed - min_val) / span : 0.0;
    var nextVal = clamp(scaled, 0.0, 1.0);
    if (val !== nextVal) {
      val = nextVal;
      redraw_all();
      output_scaled_value();
    }
  }
}

function execute_step_on_track(target_pixel_y, track_start_y, track_usable_height) {
  if (click_jump === 1) {
    var nextVal = clamp(1.0 - (target_pixel_y - track_start_y) / track_usable_height, 0.0, 1.0);
    if (val !== nextVal) {
      val = nextVal;
      redraw_all();
      output_scaled_value();
    }
    return;
  }

  var crossbarY = track_start_y + (1.0 - val) * track_usable_height;
  var currentRealVal = getScaledValue();
  var updatedRealVal = currentRealVal;
  var stepSize = isNaN(step_amount) ? 0.1 : step_amount;
  var span = max_val - min_val;
  var targetVal = (1.0 - (target_pixel_y - track_start_y) / track_usable_height) * span + min_val;

  if (Math.abs(currentRealVal - targetVal) <= stepSize * 0.5) {
    updatedRealVal = targetVal;
  } else if (target_pixel_y < crossbarY) {
    updatedRealVal += stepSize;
    if (updatedRealVal > targetVal) updatedRealVal = targetVal;
  } else {
    updatedRealVal -= stepSize;
    if (updatedRealVal < targetVal) updatedRealVal = targetVal;
  }
  updatedRealVal = clamp(updatedRealVal, min_val, max_val);
  var nextVal2 = span > 0 ? (updatedRealVal - min_val) / span : 0.0;
  if (val !== nextVal2) {
    val = nextVal2;
    redraw_all();
    output_scaled_value();
  }
}

function execute_easing_on_track(current_mouse_y, track_start_y, track_usable_height) {
  var crossbarY = track_start_y + (1.0 - val) * track_usable_height;
  var pixelDistance = current_mouse_y - crossbarY;
  var absDistance = Math.abs(pixelDistance);
  if (absDistance < 0.5) return;

  var normalizedDist = Math.min(1.0, absDistance / track_usable_height);
  var exponent = isNaN(curve_exponent) ? 0.35 : curve_exponent;
  var curveEase = Math.pow(normalizedDist, exponent);
  var baseScale = isNaN(slider_speed) ? 0.5 : slider_speed;
  var calculatedIncrement = 0.0005 + curveEase * baseScale * 0.01;
  if (pixelDistance > 0) {
    calculatedIncrement = -calculatedIncrement;
  }
  var nextVal = clamp(val + calculatedIncrement, 0.0, 1.0);
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

    var trackY, trackH;
    if (is_popup_preview) {
      var pr = cached_preview_rect;
      var b = getTrackBounds(pr.w, pr.h);
      trackY = pr.y + b.y;
      trackH = b.h;
    } else {
      var dims = get_dimensions();
      var b2 = getTrackBounds(dims.w, dims.h);
      trackY = b2.y;
      trackH = b2.h;
    }

    var currentTargetY = is_scrolling_drag === 1 ? (is_popup_preview ? lastMouseY : last_y) : start_click_y;

    if (is_scrolling_drag === 1) {
      execute_easing_on_track(currentTargetY, trackY, trackH);
    } else {
      var now = new Date().getTime();
      if (hold_gate_passed === 0) {
        if (now - click_time >= 350) {
          hold_gate_passed = 1;
          last_step_time = now;
          execute_step_on_track(currentTargetY, trackY, trackH);
        }
      } else {
        if (now - last_step_time >= holdTimerSetting) {
          last_step_time = now;
          execute_step_on_track(currentTargetY, trackY, trackH);
        }
      }
    }
  }, this);
  backgroundTask.interval = 15;
  backgroundTask.repeat();
}

// =============================================================
// 9. MAIN CANVAS MOUSE INTERACTION
// =============================================================
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

  is_dragging = 1;
  is_scrolling_drag = 0;
  last_x = x;
  last_y = y;
  start_click_y = y;
  hold_gate_passed = 0;
  click_time = new Date().getTime();
  last_step_time = click_time;

  var bounds = getTrackBounds(w, h);
  execute_step_on_track(y, bounds.y, bounds.h);

  if (click_jump !== 1) {
    start_touch_scheduler(false);
  }
}

function ondrag(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  if (allow_popup === 1 && x >= dims.w - 12 && y <= 12) return;
  if (button === 0) {
    onmouseup();
    return;
  }
  last_x = x;
  last_y = y;
  var bounds = getTrackBounds(dims.w, dims.h);

  if (click_jump === 1) {
    var targetVal = 1.0 - (y - bounds.y) / bounds.h;
    var nextVal = clamp(targetVal, 0.0, 1.0);
    if (val !== nextVal) {
      val = nextVal;
      redraw_all();
      output_scaled_value();
    }
    return;
  }
  var dragThreshold = Math.abs(y - start_click_y);
  if (dragThreshold > 4) {
    is_scrolling_drag = 1;
  }
}

function onmouseup(x, y, button, cmd, shift, capslock, option, ctrl) {
  is_dragging = 0;
  is_scrolling_drag = 0;
  hold_gate_passed = 0;
  active_pop_target = -1;
  is_resizing_window = 0;
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
}

function onidleout(x, y, button, cmd, shift, capslock, option, ctrl) {
  onmouseup();
}

function onidle(x, y, button, cmd, shift, capslock, option, ctrl) {
  if (is_dragging) {
    onmouseup();
  }
}

// =============================================================
// 10. POPUP WINDOW / 50/50 ATTRUI DATA MAPPER (NO DIALOGS)
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  // Tier 1: Performance
  if (mask_performance === 1) {
    list.push({ name: "Style", val: slider_style === 1 ? "Rail" : "Ribbon", is_toggle: true, target_id: 101 });
    list.push({ name: "Mode", val: click_jump === 1 ? "Mouse" : "Touch", is_toggle: true, target_id: 102 });
    list.push({ name: "Min Val", val: min_val, is_ticker: true, key: "min_val", target_id: 106 });
    list.push({ name: "Max Val", val: max_val, is_ticker: true, key: "max_val", target_id: 107 });
    list.push({ name: "Step Size", val: step_amount.toFixed(2), is_ticker: true, key: "step_amount", target_id: 108 });
    list.push({ name: "Hold Timer", val: step_speed_ms.toFixed(0) + "ms", pct: (step_speed_ms - 5) / 95.0, is_slider: true, target_id: 109 });
    list.push({ name: "Drag Speed", val: slider_speed.toFixed(2), pct: (slider_speed - 0.1) / 1.9, is_slider: true, target_id: 110 });
  }

  // Tier 2: Labels
  if (mask_labels === 1) {
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 103 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 104 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 209 });
  }

  // Tier 3: Geometry
  if (mask_geometry === 1) {
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 201 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 202 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 203 });
    list.push({ name: "Track Breadth", val: track_breadth.toFixed(1), pct: track_breadth / 20.0, is_slider: true, target_id: 204 });
    list.push({ name: "Slider Breadth", val: slider_breadth.toFixed(1), pct: (slider_breadth - 50.0) / 50.0, is_slider: true, target_id: 205 });
    list.push({ name: "Curve Exp", val: curve_exponent.toFixed(2), pct: curve_exponent / 1.0, is_slider: true, target_id: 206 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 6) / 36.0, is_slider: true, target_id: 208 });
  }

  // Tier 4: Colors
  if (mask_colors === 1) {
    list.push({ name: "Mode Color", val: mode_color, is_color: true, key: "mode_color" });
    list.push({ name: "BG Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Track Color", val: track_color, is_color: true, key: "track_color" });
    list.push({ name: "Needle / Knob", val: handle_color, is_color: true, key: "handle_color" });
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

// =============================================================
// VERTICAL ELASTIC RESIZING (STANDARDIZED BASELINE 280 PX)
// =============================================================
function get_popup_dimensions_map() {
  var rows = get_visible_rows_map().length;
  var rows_total_h = rows * 28;
  var locked_w = 280; // Baseline matching hslider, button, numticker
  var min_h = rows > 0 ? (rows_total_h + 180) : 180;
  var calc_h = Math.max(min_h, popup_window_height);

  return { w: locked_w, h: calc_h, rows_h: rows_total_h };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_popup_dimensions_map();
    popupWindow.size = [dims.w, dims.h];
    popupWindow.title = "Vertical Slider Inspector";
    outMatrix = recycleMatrix(outMatrix, dims.w, dims.h);

    popupWindow.visible = 1;
    popupWindow.front();
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
  outMatrix.setall(0);

  var pCtx = new MGraphics(dims.w, dims.h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, dims.w, dims.h);
  pCtx.fill();

  var row_map = get_visible_rows_map();
  var has_rows = row_map.length > 0;

  // Header: Red Close Button
  var closeX = 14, closeY = 14;
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(closeX, closeY, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Header: Toggle Hide/Show Button Pill
  var tglW = 44, tglH = 16;
  var tglX = dims.w - tglW - 12, tglY = 6;
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

  // TOP-MOUNTED VERTICAL SLIDER PREVIEW (Elastic Height)
  var padX = 12;
  var previewW = Math.max(45, Math.min(85, dims.w - padX * 2));
  var previewX = (dims.w - previewW) * 0.5;
  var previewY = 32;
  var previewH = has_rows ? Math.max(80, dims.h - dims.rows_h - previewY - 24) : (dims.h - previewY - 18);

  cached_preview_rect = { x: previewX, y: previewY, w: previewW, h: previewH };

  pCtx.save();
  pCtx.translate(previewX, previewY);
  draw_slider_chassis(pCtx, previewW, previewH, true);
  pCtx.restore();

  // 50/50 ATTRIBUTE ROWS STACKED VERTICALLY
  if (has_rows) {
    var divY = previewY + previewH + 8;
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(dims.w - 10, divY); pCtx.stroke();

    var rowsStartY = divY + 8;
    var rowW = dims.w - 24;
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

      // Left 50%: Name (128 px width allows long labels to breathe)
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

  // Vertical Elastic Bottom Resize Grip
  pCtx.new_path();
  pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
  pCtx.set_line_width(1.2);
  pCtx.move_to(dims.w * 0.5 - 14, dims.h - 6);
  pCtx.line_to(dims.w * 0.5 + 14, dims.h - 6);
  pCtx.move_to(dims.w * 0.5 - 8, dims.h - 3);
  pCtx.line_to(dims.w * 0.5 + 8, dims.h - 3);
  pCtx.stroke();

  var theImage = new Image(pCtx);
  theImage.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

// =============================================================
// 11. SUB-WINDOW: COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "track_color" || name === "slider_rail_color") return track_color;
  if (name === "handle_color" || name === "highlight_color" || name === "slider_handle_color") return handle_color;
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
  if (name === "track_color" || name === "slider_rail_color") return "Track Color";
  if (name === "handle_color" || name === "highlight_color" || name === "slider_handle_color") return "Needle / Knob";
  if (name === "text_color") return "Text Color";
  if (name === "mode_color") return "Mode / Label Color";
  if (name === "popup_dot_color") return "Popup Dot Color";
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
// 12. SUB-WINDOW: BOUND TICKER
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

  var current_val = min_val;
  if (active_ticker_target === "max_val") current_val = max_val;
  if (active_ticker_target === "step_amount") current_val = step_amount;

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
      active_ticker_column = -1; is_dragging_ticker = 0; is_scrolling_drag_ticker = 0; stop_scrolling(); return;
    }
    if (mbut) {
      lastMouseY = my;
      if (mx >= 4 && mx <= 26 && my >= 4 && my <= 26) {
        tickerWindow.visible = 0; active_ticker_column = -1; is_dragging_ticker = 0; is_scrolling_drag_ticker = 0;
        stop_scrolling(); redraw_all(); return;
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
        var total_cols = whole_digits + decimal_digits;
        for (var i = 0; i < total_cols; i++) {
          var xOffset = 30 + i * (slider_width_px + slider_gap_px);
          if (i >= whole_digits) xOffset += 10;
          if (mx >= xOffset && mx <= xOffset + slider_width_px && my >= 35 && my <= 160) {
            active_ticker_column = i; is_dragging_ticker = 1; is_scrolling_drag_ticker = 0;
            start_click_y_ticker = my; hold_gate_passed_ticker = 0;
            click_time_ticker = new Date().getTime(); last_step_time_ticker = click_time_ticker;

            stop_scrolling();
            continuous_digit_floats[i] = ticker_data.arr[i] || 0;

            if (click_jump === 1) {
              var target_val = clamp((160 - my) / 125, 0, 1) * 9.0;
              continuous_digit_floats[active_ticker_column] = target_val;
              update_ticker_value_and_redraw();
            } else {
              execute_discrete_step_ticker(my);
            }

            scrollTask = new Task(function () {
              if (active_ticker_column === -1) return;
              if (click_jump === 1) {
                var target_val = clamp((160 - lastMouseY) / 125, 0, 1) * 9.0;
                continuous_digit_floats[active_ticker_column] = target_val;
                update_ticker_value_and_redraw();
                return;
              }
              var now = new Date().getTime();
              if (hold_gate_passed_ticker === 0) {
                if (now - click_time_ticker >= 350) {
                  hold_gate_passed_ticker = 1; last_step_time_ticker = now;
                  execute_discrete_step_ticker(lastMouseY);
                }
              } else {
                var holdTimerSetting = Math.max(1, isNaN(step_speed_ms) ? 20 : step_speed_ms);
                if (now - last_step_time_ticker >= holdTimerSetting) {
                  last_step_time_ticker = now;
                  execute_discrete_step_ticker(lastMouseY);
                }
              }
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
// 13. POPUP WINDOW LISTENER & PREVIEW INTERACTION (VERTICAL ELASTIC)
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
  if (target_id === 109) set_step_speed_ms(Math.round(5 + targetPct * 95));
  else if (target_id === 110) set_slider_speed(0.1 + targetPct * 1.9);
  else if (target_id === 201) set_border_radius(targetPct * 25.0);
  else if (target_id === 202) set_border_thickness(targetPct * 10.0);
  else if (target_id === 203) set_border_extension(targetPct * 50.0);
  else if (target_id === 204) set_track_breadth(0.5 + targetPct * 19.5);
  else if (target_id === 205) set_slider_breadth(50 + targetPct * 50.0);
  else if (target_id === 206) set_curve_exponent(targetPct * 1.0);
  else if (target_id === 208) set_text_size(Math.round(6 + targetPct * 36));
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
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    var rowsStartY = pr.y + pr.h + 16;
    var rowW = dims.w - 24;
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
      stop_scrolling();
      return;
    }

    if (active_pop_target !== -1 && active_pop_target !== 50) {
      var dragPct = clamp((mx - valBoxX) / valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_to_window();
      return;
    }

    if (is_resizing_window) {
      var deltaH = my - start_click_y;
      var min_h = has_rows ? (dims.rows_h + 180) : 180;
      popup_window_height = Math.max(min_h, Math.min(start_resize_h + deltaH, 1400));
      update_popup_dimensions();
      return;
    }

    if (my >= dims.h - 14) {
      is_resizing_window = 1;
      start_click_y = my;
      start_resize_h = dims.h;
      return;
    }

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
      stop_scrolling();
      mgraphics.redraw();
      return;
    }

    var tglW = 44, tglH = 16, tglX = dims.w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    if (active_pop_target === 50) {
      lastMouseY = my;
      var bounds = getTrackBounds(pr.w, pr.h);
      var trackY = pr.y + bounds.y;
      var trackH = bounds.h;

      if (click_jump === 1) {
        var nextVal = clamp(1.0 - (my - trackY) / trackH, 0.0, 1.0);
        if (val !== nextVal) {
          val = nextVal; redraw_all(); output_scaled_value();
        }
      } else {
        if (Math.abs(my - start_click_y) > 4) is_scrolling_drag = 1;
      }
      return;
    }

    if (mbut && my >= pr.y && my <= pr.y + pr.h && mx >= pr.x && mx <= pr.x + pr.w) {
      active_pop_target = 50;
      is_dragging = 1; is_scrolling_drag = 0;
      start_click_y = my; lastMouseY = my;
      hold_gate_passed = 0;
      click_time = new Date().getTime(); last_step_time = click_time;

      var bounds2 = getTrackBounds(pr.w, pr.h);
      var trackY2 = pr.y + bounds2.y;
      var trackH2 = bounds2.h;

      execute_step_on_track(my, trackY2, trackH2);
      if (click_jump !== 1) start_touch_scheduler(true);
      return;
    }

    if (!has_rows) return;

    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + dims.rows_h) {
      var clickRow = Math.floor((my - rowsStartY) / 28);

      if (clickRow >= 0 && clickRow < rows.length) {
        var r = rows[clickRow];
        var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          apply_slider_target(r.target_id, pct);
        } else if (is_pop_tap) {
          if (r.is_toggle) {
            if (r.target_id === 101) set_slider_style(slider_style ? 0 : 1);
            else if (r.target_id === 102) set_mode(click_jump ? 0 : 1);
            else if (r.target_id === 103) set_label_mode((label_mode + 1) % 5);
            else if (r.target_id === 104) set_case_mode((case_mode + 1) % 3);
            else if (r.target_id === 209) set_font_style((font_style + 1) % 4);
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
// 14. SAFE ATTRIBUTE GETTERS & SETTERS
// =============================================================
function set_slider_style(v) {
  if (typeof v === "string") slider_style = (v.toLowerCase() === "rail" || v === "1") ? 1 : 0;
  else slider_style = parseInt(v, 10) ? 1 : 0;
  redraw_all();
}
function get_slider_style() { return slider_style; }

function set_mode(v) {
  if (typeof v === "string") {
    var s = v.toLowerCase();
    click_jump = (s === "mouse" || s === "click" || s === "1" || s === "true" || s === "on") ? 1 : 0;
  } else {
    click_jump = parseInt(v, 10) ? 1 : 0;
  }
  setinletassist(0, "Slider Control (" + mode_options[click_jump] + ")");
  setoutletassist(0, "Slider Value (" + mode_options[click_jump] + ")");
  redraw_all();
}
function get_mode() { return click_jump; }
function set_click_jump(v) { set_mode(v); }
function get_click_jump() { return get_mode(); }

function set_label_text(v) {
  if (v !== undefined && v !== null) label_text = String(v);
  redraw_all();
}
function get_label_text() { return label_text; }

function set_min_val(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) min_val = p;
  redraw_all();
}
function get_min_val() { return min_val; }

function set_max_val(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) max_val = p;
  redraw_all();
}
function get_max_val() { return max_val; }

function set_step_amount(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) step_amount = Math.max(0.0001, p);
  redraw_all();
}
function get_step_amount() { return step_amount; }

function set_step_speed_ms(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) step_speed_ms = clamp(p, 1, 500);
  redraw_all();
}
function get_step_speed_ms() { return step_speed_ms; }

function set_slider_speed(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) slider_speed = clamp(p, 0.1, 2.0);
  redraw_all();
}
function get_slider_speed() { return slider_speed; }

function set_curve_exponent(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) curve_exponent = clamp(p, 0.0, 2.0);
  redraw_all();
}
function get_curve_exponent() { return curve_exponent; }

function set_label_mode(v) {
  if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s.indexOf("none") !== -1 || s.indexOf("no text") !== -1 || s === "off" || s === "hide") label_mode = 4;
    else if (s.indexOf("vowel") !== -1) label_mode = 1;
    else if (s.indexOf("cap") !== -1) label_mode = 2;
    else if (s.indexOf("first") !== -1 || s.indexOf("initial") !== -1) label_mode = 3;
    else label_mode = 0;
  } else {
    var p = parseInt(v, 10);
    if (!isNaN(p)) label_mode = clamp(p, 0, 4);
  }
  redraw_all();
}
function get_label_mode() { return label_mode; }

function set_case_mode(v) {
  if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s.indexOf("all cap") !== -1 || s.indexOf("upper") !== -1) case_mode = 1;
    else if (s.indexOf("small") !== -1 || s.indexOf("lower") !== -1) case_mode = 2;
    else case_mode = 0;
  } else {
    var p = parseInt(v, 10);
    if (!isNaN(p)) case_mode = clamp(p, 0, 2);
  }
  redraw_all();
}
function get_case_mode() { return case_mode; }

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
function set_font_size(v) { set_text_size(v); }
function get_font_size() { return get_text_size(); }

function set_font_style(v) {
  if (typeof v === "string") {
    var s = v.toLowerCase();
    if (s === "bold") font_style = 1;
    else if (s === "italic") font_style = 2;
    else if (s === "bold italic" || s === "bolditalic") font_style = 3;
    else font_style = 0;
  } else {
    var p = parseInt(v, 10);
    if (!isNaN(p)) font_style = clamp(p, 0, 3);
  }
  redraw_all();
}
function get_font_style() { return font_style; }

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

function set_track_breadth(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) track_breadth = Math.max(0.5, p);
  redraw_all();
}
function get_track_breadth() { return track_breadth; }

function set_slider_breadth(v) {
  var p = parseFloat(v);
  if (!isNaN(p)) slider_breadth = clamp(p, 50, 100);
  redraw_all();
}
function get_slider_breadth() { return slider_breadth; }

function set_allow_popup(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) allow_popup = p ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  redraw_all();
}
function get_allow_popup() { return allow_popup; }

function set_popup_window_width(v) {
  popup_window_width = 280;
  update_popup_dimensions();
}
function get_popup_window_width() { return 280; }

function set_popup_window_height(v) {
  var p = Number(v);
  if (!isNaN(p)) popup_window_height = Math.max(180, p);
  update_popup_dimensions();
}
function get_popup_window_height() { return popup_window_height; }

function set_bg_color() { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color() { return bg_color; }

function set_border_color() { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color() { return border_color; }

function set_track_color() { track_color = rgba_values(arguments, track_color); redraw_all(); }
function get_track_color() { return track_color; }

function set_handle_color() { handle_color = rgba_values(arguments, handle_color); redraw_all(); }
function get_handle_color() { return handle_color; }
function set_highlight_color() { handle_color = rgba_values(arguments, handle_color); redraw_all(); }
function get_highlight_color() { return handle_color; }

function set_text_color() { text_color = rgba_values(arguments, text_color); redraw_all(); }
function get_text_color() { return text_color; }

function set_mode_color() { mode_color = rgba_values(arguments, mode_color); redraw_all(); }
function get_mode_color() { return mode_color; }

function set_popup_dot_color() { popup_dot_color = rgba_values(arguments, popup_dot_color); redraw_all(); }
function get_popup_dot_color() { return popup_dot_color; }
function set_dot_color() { set_popup_dot_color.apply(this, arguments); }
function get_dot_color() { return popup_dot_color; }

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

function set_show_settings_attrs(v) {
  show_settings_attrs = parseInt(v, 10) ? 1 : 0;
  update_popup_dimensions();
}
function get_show_settings_attrs() { return show_settings_attrs; }

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

  // Parameter aliases from master
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "slider_rail_color") name = "track_color";
  if (name === "slider_handle_color" || name === "accent_color") name = "handle_color";
  if (name === "slider_rail_breadth") name = "track_breadth";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

// =============================================================
// 15. MAX DECLAREATTRIBUTE DEFINITIONS
// =============================================================
declareattribute("slider_style", { type: "int", style: "enumindex", enumvals: ["Ribbon", "Rail"], label: "Style", setter: "set_slider_style", getter: "get_slider_style", category: "Behavior", embed: 1 });
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Mouse"], label: "Mode", setter: "set_mode", getter: "get_mode", category: "Behavior", embed: 1 });
declareattribute("min_val", { type: "float", label: "Min Val", setter: "set_min_val", getter: "get_min_val", category: "Behavior", embed: 1 });
declareattribute("max_val", { type: "float", label: "Max Val", setter: "set_max_val", getter: "get_max_val", category: "Behavior", embed: 1 });
declareattribute("step_amount", { type: "float", label: "Step Size", setter: "set_step_amount", getter: "get_step_amount", category: "Behavior", embed: 1 });
declareattribute("step_speed_ms", { type: "int", label: "Hold Timer (ms)", setter: "set_step_speed_ms", getter: "get_step_speed_ms", category: "Behavior", embed: 1 });
declareattribute("slider_speed", { type: "float", label: "Slider Drag Speed", setter: "set_slider_speed", getter: "get_slider_speed", category: "Behavior", embed: 1 });
declareattribute("curve_exponent", { type: "float", label: "Curve Exponent", setter: "set_curve_exponent", getter: "get_curve_exponent", category: "Behavior", embed: 1 });

declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Labels", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Labels", embed: 1 });
declareattribute("label_text", { type: "symbol", label: "Label Text", setter: "set_label_text", getter: "get_label_text", category: "Labels", embed: 1 });

declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 1 });
declareattribute("track_breadth", { type: "float", label: "Track Breadth", setter: "set_track_breadth", getter: "get_track_breadth", category: "Geometry", embed: 1 });
declareattribute("slider_breadth", { type: "float", label: "Slider Breadth", setter: "set_slider_breadth", getter: "get_slider_breadth", category: "Geometry", embed: 1 });

declareattribute("font_name", { type: "symbol", style: "font", label: "Font Face", setter: "set_font_name", getter: "get_font_name", category: "Typography", embed: 1 });
declareattribute("font_size", { type: "int", label: "Font Size", setter: "set_font_size", getter: "get_font_size", category: "Typography", embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Typography", embed: 1 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Popup", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup", embed: 1 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup Masks", embed: 1 });

declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", setter: "set_mask_performance", getter: "get_mask_performance", category: "Popup Masks", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", setter: "set_mask_labels", getter: "get_mask_labels", category: "Popup Masks", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", setter: "set_mask_geometry", getter: "get_mask_geometry", category: "Popup Masks", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Colors", setter: "set_mask_colors", getter: "get_mask_colors", category: "Popup Masks", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", setter: "set_mask_popup_colors", getter: "get_mask_popup_colors", category: "Popup Masks", embed: 1 });

declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Slider Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Slider Colors", embed: 1 });
declareattribute("track_color", { type: "rgba", style: "rgba", label: "Track Color", setter: "set_track_color", getter: "get_track_color", category: "Slider Colors", embed: 1 });
declareattribute("handle_color", { type: "rgba", style: "rgba", label: "Needle / Knob Color", setter: "set_handle_color", getter: "get_handle_color", category: "Slider Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Slider Colors", embed: 1 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode / Label Color", setter: "set_mode_color", getter: "get_mode_color", category: "Slider Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Slider Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

// =============================================================
// 16. WIRELESS THEME BUS SUBSCRIBER
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
    if (rColVal) set_track_color(rColVal);

    if (initDict.contains("slider_rail_breadth")) set_track_breadth(initDict.get("slider_rail_breadth"));
    if (initDict.contains("popup_dot_color")) set_popup_dot_color(initDict.get("popup_dot_color"));
    if (initDict.contains("pop_bgcolor")) set_pop_bgcolor(initDict.get("pop_bgcolor"));

    // Full 5-color popup theme loading from persistent dictionary
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
    if (railColor) set_track_color(railColor);

    var railBreadth = theme.slider_rail_breadth !== undefined ? theme.slider_rail_breadth : theme.track_breadth;
    if (railBreadth !== undefined) set_track_breadth(railBreadth);

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
// 17. STATE PERSISTENCE (SAVE) & CLEANUP
// =============================================================
function save() {
  embedmessage("set_slider_style", slider_style);
  embedmessage("set_mode", click_jump);
  embedmessage("set_min_val", min_val);
  embedmessage("set_max_val", max_val);
  embedmessage("set_step_amount", step_amount);
  embedmessage("set_step_speed_ms", step_speed_ms);
  embedmessage("set_slider_speed", slider_speed);
  embedmessage("set_curve_exponent", curve_exponent);

  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_label_text", label_text);

  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_track_breadth", track_breadth);
  embedmessage("set_slider_breadth", slider_breadth);

  embedmessage("set_font_name", font_name);
  embedmessage("set_font_size", text_size);
  embedmessage("set_font_style", font_style);
  embedmessage("set_allow_popup", allow_popup);
  embedmessage("set_show_settings_attrs", show_settings_attrs);

  embedmessage("set_popup_window_height", popup_window_height);

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

  embedmessage("set_mask_performance", mask_performance);
  embedmessage("set_mask_labels", mask_labels);
  embedmessage("set_mask_geometry", mask_geometry);
  embedmessage("set_mask_colors", mask_colors);
  embedmessage("set_mask_popup_colors", mask_popup_colors);

  embedmessage("msg_float", getScaledValue());
}

function notifydeleted() {
  if (render_task) {
    try { render_task.cancel(); } catch (e) {}
  }
  if (scrollTask) {
    try { scrollTask.cancel(); } catch (e) {}
  }
  if (backgroundTask) {
    try { backgroundTask.cancel(); } catch (e) {}
  }

  try {
    if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) {
      delete themeBus.subscribers[uniqueID];
    }
  } catch(e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}
  try { if (tickerListener) tickerListener.subjectname = ""; } catch (e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; } catch (e) {}

  // Explicitly free C++ Jitter window peers
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