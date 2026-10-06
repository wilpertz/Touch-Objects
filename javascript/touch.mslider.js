// ============================================================================
// touch.mslider.js - Max 9 v8ui / jsui
// Multi-Slider Touch Array with Non-Destructive Shape Scaling, Responsive Vertical
// Dials, Borderless Floating Label Badge, Compact C~ Button & Touch Steppers.
// Includes Status Target Switcher (Raw Sliders vs. Parametric Curve Dials + Mode).
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 5;

setinletassist(0, "Inlet: list / float / [index value] / min / max / messages");
setoutletassist(0, "Outlet 0: Full scaled list for [unpack]");
setoutletassist(1, "Outlet 1: MC Line messages for [mc.line~]");
setoutletassist(2, "Outlet 2: Event message [tag/index value] for [route]");
setoutletassist(3, "Outlet 3: Active slider index (1..count, 0 on release)");
setoutletassist(4, "Outlet 4: Active channel count integer (for @chans)");

var uniqueID = Math.floor(Math.random() * 1000000);
var is_initializing = true;

// =============================================================
// 1. TOPOLOGY & SLIDER STATE
// =============================================================
var count         = 16;      // 1 to 64 sliders
var max_sliders   = 64;      
var direction     = 0;       // 0 = Horizontal strip (vertical bars), 1 = Vertical strip (horizontal bars)
var slider_gap    = 2.0;     
var cap_height    = 3.0;     

// Arbitrary Scaling Range (e.g., -100 to +100, 0 to 1000)
var min_val       = 0.0;
var max_val       = 1.0;

// ONLY 2 MODES: 0 = Touch (Tap Step / Hold Step / Drag Glide), 1 = Mouse (Direct Draw / Jump)
var mode          = 0; 
var mode_names    = ["Touch", "Mouse"];

// Status & Preset Target: 0 = Sliders (raw array), 1 = Curve Dials (5 Dials + Curve Mode)
var preset_target       = 0;
var preset_target_names = ["Sliders", "Curve Dials"];

// Touch Physics & Easing
var step_amount    = 0.05;
var step_speed_ms  = 20;
var slider_speed   = 1.0;    
var curve_exponent = 0.35;   

var current_w = 260;
var current_h = 110;

// DSP Gain Curve Engine for mc.line~
var gain_exponent  = 1.6;
var use_gain_curve = 0;      
var ramp_time      = 20;     

// Values & Multipliers (0.0 to 1.0 normalized)
var vals        = [];
var target_vals = [];
var multipliers = [];

function init_arrays() {
  vals = [];
  target_vals = [];
  multipliers = [];
  for (var i = 0; i < max_sliders; i++) {
    var defaultVal = (i < count) ? Math.min(1.0, Math.pow((i + 1) / count, 1.8) * 0.9 + 0.05) : 0.0;
    vals.push(defaultVal);
    target_vals.push(defaultVal);
    multipliers.push(1.0);
  }
}
init_arrays();

// Typography, Labels & Header Banner State
var show_text        = 1;
var show_curve_ui    = 1;
var labels_raw       = "kink";
var parsed_labels    = [];
var is_single_label  = true;
var single_label_tag = "kink";

var font_name        = "Arial";
var text_size        = 9;
var font_style       = 0;
var label_mode       = 0;
var case_mode        = 0;

var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];
var font_slants      = ["normal", "normal", "italic", "italic"];
var font_weights     = ["normal", "bold", "normal", "bold"];
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
var case_mode_names  = ["First Cap", "All Cap", "All Small"];
var mask_tab_names   = ["1. Sliders", "2. Geometry", "3. Labels", "4. Colors", "5. Popup Colors"];

// Styles & Borders
var borders          = 1;
var show_background  = 1;
var border_radius    = 6.0;
var border_thickness = 1.2;
var border_extension = 6.0;

// Component Colors
var bg_color        = [0.08, 0.08, 0.09, 1.0];
var border_color    = [0.95, 0.98, 0.25, 1.0];
var bar_color       = [0.48, 0.50, 0.15, 0.85]; 
var cap_color       = [0.95, 0.65, 0.45, 1.0];  
var floor_color     = [0.15, 0.15, 0.18, 0.60]; 
var text_color      = [0.92, 0.94, 0.98, 1.0];  
var mode_color      = [0.85, 0.85, 0.90, 0.85]; 
var popup_dot_color = [1.00, 0.20, 0.20, 1.0];

// Popup Attrui Colors
var pop_bgcolor       = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

// =============================================================
// 2. CURVE AUTOMATION POD (NON-DESTRUCTIVE SCALE MATH)
// =============================================================
var showCurveWindow    = 0;
var curveWindow        = null;
var curveMatrix        = null;
var curveListener      = null;
var active_curve_dial  = -1;
var last_curve_mouse_y = 0;

var gen_mode          = 0; // 0 = Inflection, 1 = Anchor, 2 = Bell Puck, 3 = LFO Wave
var gen_mode_names    = ["Inflection", "Anchor & Sag", "Bell Puck", "LFO Wave"];

// The 5 Pod Dials (0.0 to 1.0)
var gen_all      = 0.5;   // Dial 0: ALL Master Scale / Level
var gen_center   = 0.5;   // Dial 1: Center / Position
var gen_height   = 0.5;   // Dial 2: 0.5 = Flat, >0.5 Curves UP, <0.5 Curves DOWN
var gen_shape    = 0.5;   // Dial 3: Curvature / Tension / Sag / Cycles
var gen_width    = 0.5;   // Dial 4: Spread / Width / Slope

var curve_dial_names  = ["ALL", "CENTER", "HEIGHT", "SHAPE", "WIDTH"];

// Modular function to calculate a curve shape from arbitrary parameters
function calculate_curve_shape(mode_idx, all_val, center_val, height_val, shape_val, width_val) {
  var N = Math.max(2, count);
  var curveAmt = (height_val - 0.5) * 2.0; // -1.0 to +1.0
  var out = [];

  for (var i = 0; i < count; i++) {
    var x = i / (N - 1);
    var shapeVal = 1.0;

    if (mode_idx === 0) {
      // 1. Inflection / Bell / Valley Shaper
      var c = clamp(center_val, 0.0, 1.0);
      var w = lerp(0.08, 1.0, width_val);
      var dist = clamp(Math.abs(x - c) / w, 0.0, 1.0);
      var p = lerp(0.35, 3.5, shape_val);
      var bell = Math.pow(1.0 - dist, p);

      if (curveAmt >= 0) {
        shapeVal = (1.0 - curveAmt) + (curveAmt * bell);
      } else {
        shapeVal = 1.0 - (Math.abs(curveAmt) * bell);
      }
    } else if (mode_idx === 1) {
      // 2. Anchor & Sag (Elastic Slope)
      var startY = lerp(0.0, 1.0, center_val);
      var endY   = lerp(0.0, 1.0, width_val);
      var baseY  = lerp(startY, endY, x);
      var sag    = curveAmt * Math.sin(Math.PI * x) * 0.5;
      shapeVal   = clamp(baseY + sag, 0.0, 1.0);
    } else if (mode_idx === 2) {
      // 3. Bell Puck / Gaussian
      var mu = center_val;
      var sigma = lerp(0.06, 0.60, width_val);
      var gBell = Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      if (curveAmt >= 0) {
        shapeVal = (1.0 - curveAmt) + (curveAmt * gBell);
      } else {
        shapeVal = 1.0 - (Math.abs(curveAmt) * gBell);
      }
    } else if (mode_idx === 3) {
      // 4. Continuous LFO Shaper
      var cycles = lerp(0.5, 4.0, shape_val);
      var phase  = center_val * Math.PI * 2.0;
      var rawSine = Math.sin(x * Math.PI * 2.0 * cycles + phase);
      shapeVal = clamp(0.5 + (rawSine * 0.5 * curveAmt), 0.0, 1.0);
    }

    out.push(clamp(shapeVal * all_val, 0.0, 1.0));
  }
  return out;
}
// Throttle engine: limits mc.line~ / outlet message bursts to 60fps (16ms) during drags
var curve_output_pending = false;
var curve_output_task = new Task(function() {
  curve_output_pending = false;
  output_all_values();
}, this);

function schedule_curve_output() {
  if (!curve_output_pending) {
    curve_output_pending = true;
    curve_output_task.schedule(16);
  }
}

// Master curve generation
function generate_curve() {
  var cVals = calculate_curve_shape(gen_mode, gen_all, gen_center, gen_height, gen_shape, gen_width);
  for (var i = 0; i < count; i++) {
    vals[i] = cVals[i];
    target_vals[i] = vals[i];
  }
  // If user is actively dragging in the pod, throttle output to prevent audio dropouts
  if (active_curve_dial !== -1) {
    schedule_curve_output();
  } else {
    output_all_values();
  }
  redraw_all();
}

// Touch & Drag Tracking
var isMouseDown        = false;
var last_drag_idx      = -1;
var last_drag_val      = 0.0;
var is_transmitting    = false;
var active_touch_idx   = -1;
var is_scrolling_drag  = 0;
var start_click_x      = 0;
var start_click_y      = 0;
var click_time         = 0;
var last_step_time     = 0;
var hold_gate_passed   = 0;
var backgroundTask     = null;
var current_target_norm = 0.0;

// Main Inspector State
var showSettings        = 0;
var allow_popup         = 1;
var show_settings_attrs = 1;
var active_mask_tab     = 0;

var popup_window_width  = 300;
var popup_mini_w        = 240;
var popup_mini_h        = 140;
var start_resize_w      = 240;
var start_resize_h      = 140;
var is_resizing_window  = 0;

var stepper_repeat_task = null;
var stepper_target_id   = -1;
var stepper_dir         = 0;

// Sub-Windows & Matrix Buffers
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
var active_color_target    = "bar_color";
var active_ticker_target   = "min_val";
var active_ticker_column   = -1;
var is_mouse_down_anywhere = 0;
var picker_drag_zone       = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

// Bound Ticker Digits
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
  if (active_pop_target === -1) return;
  var targetPct = clamp((lastMouseX - scroll_valBoxX) / scroll_valBoxW, 0, 1);
  apply_slider_target(active_pop_target, targetPct);
}, this);
scrollTask.interval = 15;

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 70 };

// =============================================================
// 3. MATH, LABELS & SCALING
// =============================================================
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function lerp(a, b, t)    { return a + (b - a) * t; }

function mark_dirty() {
  if (is_initializing) return;
  if (this.patcher) {
    try {
      this.patcher.dirty = 1;
      var p = this.patcher;
      while (p.parentpatcher) { p = p.parentpatcher; p.dirty = 1; }
    } catch (e) {}
  }
}

function redraw_all() {
  mgraphics.redraw();
  if (showSettings && popupWindow && popupWindow.visible) draw_popup_to_window();
}

function getScaledValue(idx) {
  var span = max_val - min_val;
  return min_val + (vals[idx] || 0.0) * span;
}

function getAllScaledValues() {
  var list = [];
  for (var i = 0; i < count; i++) list.push(getScaledValue(i));
  return list;
}

function getGainValue(idx) {
  var mult = (multipliers[idx] !== undefined) ? multipliers[idx] : 1.0;
  var scaled = getScaledValue(idx) * mult;
  var sign = scaled < 0 ? -1.0 : 1.0;
  return use_gain_curve ? sign * Math.pow(Math.abs(scaled), gain_exponent) : scaled;
}

function get_dimensions() {
  var sz = mgraphics.size;
  if (sz && sz[0] > 0 && sz[1] > 0) {
    current_w = sz[0];
    current_h = sz[1];
    return { w: current_w, h: current_h };
  }

  // Only query patcher/box attributes if cached dimensions are uninitialized
  if (current_w <= 10 || current_h <= 10) {
    if (this.patcher && this.patcher.getattr && this.patcher.getattr("presentation") === 1) {
      if (this.box) {
        var pr = this.box.getattr("presentation_rect");
        if (pr && pr.length >= 4 && pr[2] > 0 && pr[3] > 0) {
          current_w = pr[2];
          current_h = pr[3];
          return { w: current_w, h: current_h };
        }
      }
    }
    if (this.box && this.box.rect) {
      var r = this.box.rect;
      current_w = Math.max(1, r[2] - r[0]);
      current_h = Math.max(1, r[3] - r[1]);
    }
  }

  return { w: current_w, h: current_h };
}

function onresize(w, h) {
  if (w > 0 && h > 0) { current_w = w; current_h = h; }
  mgraphics.redraw();
}
onresize.local = 1;

function sync_labels() {
  var raw = String(labels_raw || "").trim();
  var tokens = [];
  if (raw.indexOf(",") !== -1) {
    tokens = raw.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
  } else {
    tokens = raw.split(/\s+/).filter(Boolean);
  }

  parsed_labels = [];
  if (tokens.length === 1 && tokens[0].length > 0) {
    is_single_label = true;
    single_label_tag = tokens[0];
    for (var i = 0; i < max_sliders; i++) parsed_labels.push(tokens[0]);
  } else {
    is_single_label = false;
    for (var j = 0; j < max_sliders; j++) {
      parsed_labels.push(j < tokens.length ? tokens[j] : String(j + 1));
    }
  }
}
sync_labels();

function apply_case(str, c_mode) {
  if (!str || typeof str !== "string") return "";
  if (c_mode === 1) return str.toUpperCase();
  if (c_mode === 2) return str.toLowerCase();
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\w/g, function (match) {
    return match.toUpperCase();
  });
}

function get_display_label(rawTxt) {
  if (!rawTxt || typeof rawTxt !== "string") return "";
  if (label_mode === 4) return "";
  if (label_mode === 2) {
    var caps = rawTxt.replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    if (caps.length > 0) return caps;
  }
  if (label_mode === 3) return rawTxt.charAt(0).toUpperCase();
  if (label_mode === 1) return rawTxt.replace(/[aeiouAEIOU]/g, "").trim();
  return apply_case(rawTxt, case_mode);
}

function get_slider_tag(idx) {
  if (idx < 0 || idx >= count) return idx + 1;
  return parsed_labels[idx] || (idx + 1);
}

// =============================================================
// 4. OUTLET DISPATCH ENGINE (5 OUTLETS)
// =============================================================
function output_slider_event(idx) {
  if (is_transmitting || idx < 0 || idx >= count) return;
  is_transmitting = true;
  try {
    outlet(4, count);
    outlet(3, idx + 1);
    outlet(2, [get_slider_tag(idx), getScaledValue(idx)]);

    outlet(1, ["target", idx + 1]);
    outlet(1, [getGainValue(idx), ramp_time]);

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
      outlet(2, [get_slider_tag(i), getScaledValue(i)]);
      outlet(1, ["target", i + 1]);
      outlet(1, [getGainValue(i), ramp_time]);
    }
    outlet(0, getAllScaledValues());
  } finally {
    is_transmitting = false;
  }
}

function output_channel_count() {
  outlet(4, count);
}

// =============================================================
// 5. TOUCH STEPPING & PROXIMITY EASING GLIDE ENGINE
// =============================================================
function execute_step_on_slider(idx, targetNorm) {
  var span = Math.abs(max_val - min_val);
  var normStep = span > 0 ? (step_amount / span) : 0.05;
  var dist = targetNorm - vals[idx];

  if (Math.abs(dist) <= normStep * 0.5) {
    vals[idx] = targetNorm;
  } else if (dist > 0) {
    vals[idx] += normStep;
  } else {
    vals[idx] -= normStep;
  }
  vals[idx] = clamp(vals[idx], 0.0, 1.0);
  target_vals[idx] = vals[idx];
  output_slider_event(idx);
  redraw_all();
}

function execute_easing_on_slider(idx, targetNorm) {
  var dist = targetNorm - vals[idx];
  var absDist = Math.abs(dist);
  if (absDist < 0.002) return;

  var normDist = Math.min(1.0, absDist);
  var exp = isNaN(curve_exponent) ? 0.35 : curve_exponent;
  var curveEase = Math.pow(normDist, exp);
  var baseScale = isNaN(slider_speed) ? 1.0 : slider_speed;
  var increment = 0.001 + curveEase * baseScale * 0.035;

  if (dist < 0) increment = -increment;

  vals[idx] = clamp(vals[idx] + increment, 0.0, 1.0);
  target_vals[idx] = vals[idx];
  output_slider_event(idx);
  redraw_all();
}

function start_touch_scheduler(idx) {
  if (backgroundTask) {
    backgroundTask.cancel();
    backgroundTask = null;
  }
  backgroundTask = new Task(function() {
    if (!isMouseDown || active_touch_idx === -1) return;

    if (is_scrolling_drag === 1) {
      execute_easing_on_slider(active_touch_idx, current_target_norm);
    } else {
      var now = new Date().getTime();
      if (hold_gate_passed === 0) {
        if (now - click_time >= 350) {
          hold_gate_passed = 1;
          last_step_time = now;
          execute_step_on_slider(active_touch_idx, current_target_norm);
        }
      } else {
        if (now - last_step_time >= step_speed_ms) {
          last_step_time = now;
          execute_step_on_slider(active_touch_idx, current_target_norm);
        }
      }
    }
  }, this);
  backgroundTask.interval = 15;
  backgroundTask.repeat();
}

function get_slider_bounds(w, h) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var rad = (borders === 1 && border_radius > 0) ? border_radius : 0.0;
  
  var marginX = Math.max(b + 2.0, rad * 0.75 + 1.0);
  var marginY = Math.max(b + 2.0, rad * 0.40 + 1.0);

  var availW = Math.max(1, w - marginX * 2);
  var availH = Math.max(1, h - marginY * 2);

  return { x: marginX, y: marginY, w: availW, h: availH };
}

function set_bar_from_coords(x, y, interpolate, totalW, totalH) {
  var sb = get_slider_bounds(totalW, totalH);
  var idx, rawNorm;

  if (direction === 0) {
    var colW = sb.w / count;
    idx = clamp(Math.floor((x - sb.x) / colW), 0, count - 1);
    rawNorm = clamp(1.0 - ((y - sb.y) / sb.h), 0.0, 1.0);
  } else {
    var rowH = sb.h / count;
    idx = clamp(Math.floor((y - sb.y) / rowH), 0, count - 1);
    rawNorm = clamp((x - sb.x) / sb.w, 0.0, 1.0);
  }

  current_target_norm = rawNorm;
  active_touch_idx = idx;

  if (mode === 0) {
    if (!interpolate) {
      click_time = new Date().getTime();
      last_step_time = click_time;
      hold_gate_passed = 0;
      is_scrolling_drag = 0;
      execute_step_on_slider(idx, rawNorm);
      start_touch_scheduler(idx);
      return;
    } else {
      is_scrolling_drag = 1;
      execute_easing_on_slider(idx, rawNorm);
      return;
    }
  }

  // Mouse Mode: Direct fast drawing
  if (interpolate && last_drag_idx !== -1 && last_drag_idx !== idx) {
    var step = idx > last_drag_idx ? 1 : -1;
    var dist = Math.abs(idx - last_drag_idx);
    for (var i = 1; i <= dist; i++) {
      var curI = last_drag_idx + i * step;
      var t = i / dist;
      vals[curI] = lerp(last_drag_val, rawNorm, t);
      target_vals[curI] = vals[curI];
    }
  } else {
    vals[idx] = rawNorm;
    target_vals[idx] = rawNorm;
  }

  last_drag_idx = idx;
  last_drag_val = rawNorm;

  output_slider_event(idx);
  redraw_all();
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  var w = dims.w, h = dims.h;

  // Top-Right Red Dot: Settings Inspector
  if (allow_popup === 1) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var dotX = w - dotMargin, dotY = dotMargin;
    var dist = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (dist <= 9.0 || ctrl === 1) {
      popup();
      return;
    }
  }

  isMouseDown = true;
  last_drag_idx = -1;
  start_click_x = x;
  start_click_y = y;
  set_bar_from_coords(x, y, false, w, h);
}

function ondrag(x, y, button) {
  if (button === 0) { onmouseup(); return; }
  var dims = get_dimensions();
  set_bar_from_coords(x, y, true, dims.w, dims.h);
}

function onmouseup() {
  if (active_dial_pressed !== -1) {
    outlet(3, 0); // Release index
    if (typeof notifyclients === "function") notifyclients(); // Clean pattr update
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
function onidle()    { if (isMouseDown) onmouseup(); }

// =============================================================
// 6. VECTOR DRAW ENGINE (BORDERLESS BADGE & CLEAN ARCS)
// =============================================================
function draw_common_path(ctx, x, y, w, h, r) {
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2.0);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  } else {
    ctx.rectangle(x, y, w, h);
  }
  ctx.close_path();
}

function drawCorners(ctx, x, y, w, h, r, ew, eh, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  // 1. Top-Left
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  } else {
    ctx.move_to(x, y + eh);
    ctx.line_to(x, y);
  }
  ctx.line_to(x + r + ew, y);
  ctx.move_to(x, y + r);
  ctx.line_to(x, y + r + eh);
  ctx.stroke();

  // 2. Top-Right
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2.0);
  } else {
    ctx.move_to(x + w - ew, y);
    ctx.line_to(x + w, y);
  }
  ctx.line_to(x + w, y + r + eh);
  ctx.move_to(x + w - r - ew, y);
  ctx.line_to(x + w - r, y);
  ctx.stroke();

  // 3. Bottom-Right
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
  } else {
    ctx.move_to(x + w, y + h - eh);
    ctx.line_to(x + w, y + h);
  }
  ctx.line_to(x + w - r - ew, y + h);
  ctx.move_to(x + w, y + h - r);
  ctx.line_to(x + w, y + h - r - eh);
  ctx.stroke();

  // 4. Bottom-Left
  ctx.new_path();
  if (r > 0) {
    ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
  } else {
    ctx.move_to(x + ew, y + h);
    ctx.line_to(x, y + h);
  }
  ctx.line_to(x, y + h - r - eh);
  ctx.move_to(x + r + ew, y + h);
  ctx.line_to(x + r, y + h);
  ctx.stroke();
}

function draw_mslider_strip(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 6.0 : border_radius;
  var r = Math.min(radVal, rw * 0.5, rh * 0.5);
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  // 1. Chassis Background
  if (show_background === 1) {
    ctx.set_source_rgba(bg_color);
    draw_common_path(ctx, inset, inset, rw, rh, r);
    ctx.fill();
  }

  // 2. Corner Brackets
  if (borders === 1 && b > 0) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  // 3. FULL-HEIGHT INSET SLIDERS
  var sb = get_slider_bounds(w, h);
  var capH = clamp(cap_height, 1.5, 6.0);

  ctx.select_font_face(font_name, font_slants[font_style], font_weights[font_style]);

  if (direction === 0) {
    // HORIZONTAL STRIP (VERTICAL BARS)
    var colW   = sb.w / count;
    var barGap = clamp(slider_gap, 0.5, colW * 0.4);
    var barW   = Math.max(1.0, colW - barGap);

    var maxFontByW = Math.max(6, Math.floor(barW * 0.55));
    var baselineTarget = is_preview ? Math.round(text_size * (sb.h / 90.0)) : text_size;
    var fontVal = clamp(baselineTarget, 6, maxFontByW);
    ctx.set_font_size(fontVal);

    for (var i = 0; i < count; i++) {
      var val = clamp(vals[i] || 0.0, 0.0, 1.0);
      var barH = val * sb.h;
      var barX = sb.x + i * colW + (barGap * 0.5);
      var barY = (sb.y + sb.h) - barH;

      ctx.set_source_rgba(bar_color[0], bar_color[1], bar_color[2], (bar_color[3] || 1.0) * 0.15);
      ctx.rectangle(barX, sb.y, barW, sb.h);
      ctx.fill();

      if (barH > 0.5) {
        ctx.set_source_rgba(bar_color);
        ctx.rectangle(barX, barY + capH, barW, Math.max(0, barH - capH));
        ctx.fill();

        ctx.set_source_rgba(cap_color);
        ctx.rectangle(barX, barY, barW, Math.min(barH, capH));
        ctx.fill();
      } else {
        ctx.set_source_rgba(floor_color);
        ctx.rectangle(barX, sb.y + sb.h - 1.5, barW, 1.5);
        ctx.fill();
      }

      if (show_text === 1 && label_mode !== 4 && barW >= 9 && (!is_single_label || is_preview)) {
        var rawLbl = parsed_labels[i] || String(i + 1);
        var dLbl   = get_display_label(rawLbl);
        var valStr = getScaledValue(i).toFixed(1);
        var pfxStr = dLbl.length > 0 ? (dLbl + " ") : "";

        var pfxW = pfxStr.length > 0 ? ctx.text_measure(pfxStr)[0] : 0;
        var vW   = ctx.text_measure(valStr)[0];
        var totW = pfxW + vW;

        var barFont = fontVal;
        if (totW > (sb.h - 14) && totW > 0) {
          barFont = Math.max(6, Math.floor(fontVal * ((sb.h - 14) / totW)));
          ctx.set_font_size(barFont);
          pfxW = pfxStr.length > 0 ? ctx.text_measure(pfxStr)[0] : 0;
        }

        ctx.save();
        ctx.translate(barX + barW * 0.5, sb.y + sb.h - 6);
        ctx.rotate(-Math.PI * 0.5);

        if (pfxStr.length > 0) {
          ctx.set_source_rgba(mode_color);
          ctx.move_to(0, barFont * 0.33);
          ctx.show_text(pfxStr);
        }
        ctx.set_source_rgba(text_color);
        ctx.move_to(pfxW, barFont * 0.33);
        ctx.show_text(valStr);
        ctx.restore();

        ctx.set_font_size(fontVal);
      }
    }
  } else {
    // VERTICAL STRIP (HORIZONTAL BARS)
    var rowH    = sb.h / count;
    var barGapH = clamp(slider_gap, 0.5, rowH * 0.4);
    var actualH = Math.max(1.0, rowH - barGapH);

    var maxFontByH = Math.max(6, Math.floor(actualH * 0.55));
    var baselineTargetH = is_preview ? Math.round(text_size * (sb.w / 200.0)) : text_size;
    var fontValH = clamp(baselineTargetH, 6, maxFontByH);
    ctx.set_font_size(fontValH);

    for (var j = 0; j < count; j++) {
      var valH = clamp(vals[j] || 0.0, 0.0, 1.0);
      var barLen = valH * sb.w;
      var bX = sb.x;
      var bY = sb.y + j * rowH + (barGapH * 0.5);

      ctx.set_source_rgba(bar_color[0], bar_color[1], bar_color[2], (bar_color[3] || 1.0) * 0.15);
      ctx.rectangle(sb.x, bY, sb.w, actualH);
      ctx.fill();

      if (barLen > 0.5) {
        ctx.set_source_rgba(bar_color);
        ctx.rectangle(bX, bY, Math.max(0, barLen - capH), actualH);
        ctx.fill();

        ctx.set_source_rgba(cap_color);
        ctx.rectangle(bX + Math.max(0, barLen - capH), bY, Math.min(barLen, capH), actualH);
        ctx.fill();
      } else {
        ctx.set_source_rgba(floor_color);
        ctx.rectangle(bX, bY, 1.5, actualH);
        ctx.fill();
      }

      if (show_text === 1 && label_mode !== 4 && actualH >= 9 && (!is_single_label || is_preview)) {
        var rawLbl2 = parsed_labels[j] || String(j + 1);
        var dLbl2   = get_display_label(rawLbl2);
        var valStr2 = getScaledValue(j).toFixed(1);
        var pfxStr2 = dLbl2.length > 0 ? (dLbl2 + " ") : "";
        var pfxW2   = pfxStr2.length > 0 ? ctx.text_measure(pfxStr2)[0] : 0;
        var startTxtX = bX + 6;
        var startTxtY = bY + actualH * 0.5 + fontValH * 0.35;

        if (pfxStr2.length > 0) {
          ctx.set_source_rgba(mode_color);
          ctx.move_to(startTxtX, startTxtY);
          ctx.show_text(pfxStr2);
        }
        ctx.set_source_rgba(text_color);
        ctx.move_to(startTxtX + pfxW2, startTxtY);
        ctx.show_text(valStr2);
      }
    }
  }

  // 4. FLOATING OVERLAYS
  if (!is_preview) {
    if (show_text === 1 && label_mode !== 4 && is_single_label && single_label_tag.length > 0) {
      ctx.select_font_face(font_name, "normal", "bold");
      ctx.set_font_size(8.5);
      var tagStr = apply_case(single_label_tag, case_mode);
      var tagTm  = ctx.text_measure(tagStr);
      var tagW   = (tagTm ? tagTm[0] : 20) + 8;
      var tagX   = (w - tagW) * 0.5;
      var tagY   = b + 3;

      ctx.set_source_rgba(mode_color[0], mode_color[1], mode_color[2], 0.20);
      ctx.rectangle_rounded(tagX, tagY, tagW, 13, 2.5, 2.5);
      ctx.fill();

      ctx.set_source_rgba(mode_color);
      ctx.move_to(tagX + 4, tagY + 9.5);
      ctx.show_text(tagStr);
    }
  }

  // 5. Red Popup Launcher Dot
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
  draw_mslider_strip(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 7. SUB-WINDOW 1: CURVE AUTOMATION POD
// =============================================================
function getCurveWindow() {
  if (!curveWindow) {
    curveWindow = new JitterObject("jit.window", "msl_crv_" + uniqueID);
    curveWindow.floating = 1; curveWindow.visible = 0; curveWindow.border = 1; curveWindow.grow = 0;
    curveWindow.title = "Curve Automation Pod";
    curveWindow.size = [360, 160];
    curveListener = new JitterListener(curveWindow.name, curveWindowListenerCallback);
  }
  return curveWindow;
}

function toggle_curve_window(v) {
  if (v === undefined) showCurveWindow = !showCurveWindow;
  else showCurveWindow = parseInt(v, 10) ? 1 : 0;

  var win = getCurveWindow();
  if (showCurveWindow) {
    win.size = [360, 160];
    if (this.box && this.box.rect) {
      win.pos = [this.box.rect[0], this.box.rect[1] - 170];
    }
    win.visible = 1; win.front();
    draw_curve_window();
  } else {
    win.visible = 0;
  }
  redraw_all();
}

function draw_curve_window() {
  if (!showCurveWindow || !curveWindow) return;
  var winW = 360, winH = 160;
  curveMatrix = recycleMatrix(curveMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  // Red Close Dot
  ctx.set_source_rgba(0.85, 0.22, 0.22, 1.0);
  ctx.arc(14, 14, 5.0, 0, Math.PI * 2);
  ctx.fill();

  // Header Mode Selector Stepper
  var mBoxX = 70, mBoxY = 6, mBoxW = 220, mBoxH = 20;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(mBoxX, mBoxY, mBoxW, mBoxH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(0.75);
  ctx.rectangle_rounded(mBoxX, mBoxY, mBoxW, mBoxH, 3, 3);
  ctx.stroke();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9.5);
  ctx.set_source_rgba(attr_text_color);
  ctx.move_to(mBoxX + 8, mBoxY + 14); ctx.show_text("◀");
  ctx.move_to(mBoxX + mBoxW - 14, mBoxY + 14); ctx.show_text("▶");

  ctx.set_source_rgba(border_color);
  var mStr = (gen_mode + 1) + ". " + gen_mode_names[gen_mode];
  var mTm = ctx.text_measure(mStr);
  ctx.move_to(mBoxX + (mBoxW - mTm[0]) * 0.5, mBoxY + 14);
  ctx.show_text(mStr);

  // 5 Responsive Dials: [ ALL ] [ CENTER ] [ HEIGHT ] [ SHAPE ] [ WIDTH ]
  var dialVals = [gen_all, gen_center, gen_height, gen_shape, gen_width];
  var dW = winW / 5;
  var dialY = 78;
  var dialR = 24;

  for (var d = 0; d < 5; d++) {
    var dialX = d * dW + dW * 0.5;
    var dVal = dialVals[d];

    // Background Arc
    ctx.set_source_rgba(0.18, 0.19, 0.22, 0.9);
    ctx.set_line_width(3.5);
    ctx.new_path();
    ctx.arc(dialX, dialY, dialR, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Value Arc
    if (dVal > 0.001) {
      var curA = Math.PI * 0.75 + dVal * (Math.PI * 1.5);
      ctx.set_source_rgba(d === 0 ? border_color : cap_color);
      ctx.set_line_width(3.5);
      ctx.new_path();
      ctx.arc(dialX, dialY, dialR, Math.PI * 0.75, curA);
      ctx.stroke();
    }

    // Dial Label
    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(d === 0 ? border_color : mode_color);
    var dLbl = curve_dial_names[d];
    var lTm = ctx.text_measure(dLbl);
    ctx.move_to(dialX - lTm[0] * 0.5, dialY + dialR + 15);
    ctx.show_text(dLbl);

    // Center Readout
    ctx.set_font_size(8.5);
    ctx.set_source_rgba(text_color);
    var vStr = dVal.toFixed(2);
    var vTm = ctx.text_measure(vStr);
    ctx.move_to(dialX - vTm[0] * 0.5, dialY + 3.0);
    ctx.show_text(vStr);
  }

  var img = new Image(ctx);
  img.tonamedmatrix(curveMatrix.name);
  curveWindow.jit_matrix(curveMatrix.name);
}

function curveWindowListenerCallback(event) {
  if (event.eventname === "close") { showCurveWindow = 0; redraw_all(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    
    if (mbut === 0) {
      if (active_curve_dial !== -1) {
        output_all_values(); // Flush final values to audio thread on release
      }
      active_curve_dial = -1;
      last_curve_mouse_y = 0;
      return;
    }

    // Red Close Dot
    if (mx < 24 && my < 24) { toggle_curve_window(0); return; }

    // Mode Stepper Hit
    var mBoxX = 70, mBoxY = 6, mBoxW = 220, mBoxH = 20;
    if (active_curve_dial === -1 && mx >= mBoxX && mx <= mBoxX + mBoxW && my >= mBoxY && my <= mBoxY + mBoxH) {
      if (mx <= mBoxX + 30) gen_mode = (gen_mode - 1 + 4) % 4;
      else if (mx >= mBoxX + mBoxW - 30) gen_mode = (gen_mode + 1) % 4;
      else gen_mode = (gen_mode + 1) % 4;
      generate_curve();
      
      return;
    }

    // Dial Hits
    var dW = 360 / 5;
    if (active_curve_dial === -1 && my >= 45 && my <= 125) {
      active_curve_dial = clamp(Math.floor(mx / dW), 0, 4);
      last_curve_mouse_y = my;
      return;
    }

    // Responsive Vertical Drag Tracking
    if (active_curve_dial !== -1 && mbut === 1) {
      var dy = (last_curve_mouse_y - my);
      last_curve_mouse_y = my;
      var delta = dy / 120.0;

      if (active_curve_dial === 0) {
        gen_all = clamp(gen_all + delta, 0.0, 1.0);
      } else if (active_curve_dial === 1) {
        gen_center = clamp(gen_center + delta, 0.0, 1.0);
      } else if (active_curve_dial === 2) {
        gen_height = clamp(gen_height + delta, 0.0, 1.0);
      } else if (active_curve_dial === 3) {
        gen_shape = clamp(gen_shape + delta, 0.0, 1.0);
      } else if (active_curve_dial === 4) {
        gen_width = clamp(gen_width + delta, 0.0, 1.0);
      }

      generate_curve();
      draw_curve_window();
    }
  }
}

// =============================================================
// 8. SUB-WINDOW 2: MAIN INSPECTOR & THEMES
// =============================================================
function ensurePopupWindows() {
  if (!popupWindow) {
    popupWindow = new JitterObject("jit.window", "msl_set_" + uniqueID);
    popupWindow.floating = 1; popupWindow.visible = 0; popupWindow.border = 1; popupWindow.grow = 0;
    popupWindow.title = "Touch Multi-Slider Inspector";
    windowListener = new JitterListener(popupWindow.name, windowListenerCallback);
  }
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", "msl_col_" + uniqueID);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0;
    colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];
    colorMatrix = new JitterMatrix(4, "char", 200, 240);
    colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
  if (!tickerWindow) {
    tickerWindow = new JitterObject("jit.window", "msl_num_" + uniqueID);
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

function step_stepper_value(target_id, dir) {
  mark_dirty();
  if (target_id === 101) set_count(count + dir);
  else if (target_id === 303) set_text_size(text_size + dir);
  draw_popup_to_window();
}

function stop_stepper_repeat() {
  stepper_target_id = -1;
  stepper_dir = 0;
  if (stepper_repeat_task) {
    try { stepper_repeat_task.cancel(); } catch(e) {}
    stepper_repeat_task = null;
  }
}

function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  if (active_mask_tab === 0) {
    // TAB 1: SLIDERS & PERFORMANCE (With Preset Target Switcher!)
    list.push({ name: "Status Target", val: preset_target_names[preset_target], is_toggle: true, target_id: 110 });
    list.push({ name: "Curve Pod", val: showCurveWindow ? "CLOSE" : "OPEN", is_toggle: true, target_id: 306 });
    list.push({ name: "Slider Count", val: count, is_stepper: true, target_id: 101 });
    list.push({ name: "Mode", val: mode_names[mode], is_toggle: true, target_id: 104 });
    list.push({ name: "Min Range", val: min_val, is_ticker: true, key: "min_val", target_id: 102 });
    list.push({ name: "Max Range", val: max_val, is_ticker: true, key: "max_val", target_id: 103 });
    list.push({ name: "Step Size", val: step_amount.toFixed(2), is_ticker: true, key: "step_amount", target_id: 107 });
    list.push({ name: "Drag Speed", val: slider_speed.toFixed(2), pct: (slider_speed - 0.1) / 1.9, is_slider: true, target_id: 108 });
    list.push({ name: "Curve Exp", val: curve_exponent.toFixed(2), pct: curve_exponent / 1.0, is_slider: true, target_id: 109 });
  } else if (active_mask_tab === 1) {
    // TAB 2: GEOMETRY
    list.push({ name: "Orientation", val: direction === 1 ? "Vertical" : "Horizontal", is_toggle: true, target_id: 206 });
    list.push({ name: "Slider Gap", val: slider_gap.toFixed(1), pct: slider_gap / 10.0, is_slider: true, target_id: 201 });
    list.push({ name: "Cap Height", val: cap_height.toFixed(1), pct: (cap_height - 1.0) / 7.0, is_slider: true, target_id: 202 });
    list.push({ name: "Border Radius", val: Math.round(border_radius), pct: border_radius / 25.0, is_slider: true, target_id: 203 });
    list.push({ name: "Border Thickness", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 204 });
    list.push({ name: "Corner Extension", val: Math.round(border_extension), pct: border_extension / 50.0, is_slider: true, target_id: 205 });
  } else if (active_mask_tab === 2) {
    // TAB 3: LABELS & CHASSIS
    list.push({ name: "Show Text", val: show_text ? "ON" : "OFF", is_toggle: true, target_id: 305 });
    list.push({ name: "Font Size", val: text_size, is_stepper: true, target_id: 303 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 304 });
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 301 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 302 });
    list.push({ name: "Outer Borders", val: borders ? "ON" : "OFF", is_toggle: true, target_id: 401 });
    list.push({ name: "Show Background", val: show_background ? "ON" : "OFF", is_toggle: true, target_id: 402 });
  } else if (active_mask_tab === 3) {
    // TAB 4: COMPONENT COLORS
    list.push({ name: "Bar Body Color", val: bar_color, is_color: true, key: "bar_color" });
    list.push({ name: "Cap Accent Color", val: cap_color, is_color: true, key: "cap_color" });
    list.push({ name: "Label Color", val: mode_color, is_color: true, key: "mode_color" });
    list.push({ name: "Value Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Chassis Background", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Popup Dot Color", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
  } else if (active_mask_tab === 4) {
    // TAB 5: POPUP ATTRUI COLORS
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_popup_dimensions() {
  if (!show_settings_attrs) return { w: popup_mini_w, h: popup_mini_h };
  var rows = get_visible_rows_map();
  var fixedH = 28 + 70 + 8 + 22 + 8 + (rows.length * 28) + 16;
  return { w: popup_window_width, h: fixedH };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    ensurePopupWindows();
    var dims = get_popup_dimensions();
    popupWindow.size = [dims.w, dims.h];
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
  if (render_pending === 0) { render_pending = 1; render_task.schedule(16); }
}

function draw_popup_to_window_deferred() {
  if (!showSettings || allow_popup !== 1 || !popupWindow) return;
  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;

  popupWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  // Red Close Dot
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
  pCtx.move_to(tglX + (tglW - tglTm[0]) * 0.5, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // Top Live Preview Chassis
  var prevX = 12, prevY = 28, prevW = w - 24, prevH = has_rows ? 70 : (h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_mslider_strip(pCtx, prevW, prevH, true);
  pCtx.restore();

  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    pCtx.move_to(w - 14, h - 4); pCtx.line_to(w - 4, h - 14);
    pCtx.move_to(w - 9, h - 4);  pCtx.line_to(w - 4, h - 9);
    pCtx.stroke();
  }

  if (has_rows) {
    var divY = prevY + prevH + 8;
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    // Carousel Tab Bar
    var navY = divY + 6, navH = 22, navW = w - 24, navX = 12;
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
    pCtx.move_to(navX + 9, navY + 15); pCtx.show_text("<");

    var rBtnX = navX + navW - btnW - 1;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(rBtnX, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(rBtnX + 9, navY + 15); pCtx.show_text(">");

    var tabTitle = mask_tab_names[active_mask_tab] || "Category";
    var tabTm = pCtx.text_measure(tabTitle);
    pCtx.set_source_rgba(border_color);
    pCtx.move_to(navX + (navW - tabTm[0]) * 0.5, navY + 15);
    pCtx.show_text(tabTitle);

    var rowsStartY = navY + navH + 8;
    var rowW = w - 24, rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], rY = rowsStartY + i * 28;
      pCtx.set_source_rgba(attr_bg_color); pCtx.rectangle(rowX, rY, rowW, 26); pCtx.fill();
      pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17); pCtx.show_text(r.name);

      pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      var vY = rY + 4, vH = 18;

      if (r.is_color) {
        pCtx.set_source_rgba(r.val);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.fill();
        pCtx.set_source_rgba(attr_border_color); pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.stroke();
      } else if (r.is_stepper) {
        var arrowW = 20;
        var valW = valBoxW - arrowW * 2;

        pCtx.set_source_rgba(0.18, 0.19, 0.22, 1.0);
        pCtx.rectangle_rounded(valBoxX, vY, arrowW, vH, 2, 2); pCtx.fill();
        pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(8);
        pCtx.move_to(valBoxX + 6, rY + 16.5); pCtx.show_text("◀");

        pCtx.set_source_rgba(0.08, 0.08, 0.10, 0.95);
        pCtx.rectangle(valBoxX + arrowW, vY, valW, vH); pCtx.fill();
        pCtx.set_source_rgba(border_color);
        pCtx.select_font_face("Arial", "normal", "bold"); pCtx.set_font_size(10);
        var stTm = pCtx.text_measure(String(r.val));
        pCtx.move_to(valBoxX + arrowW + (valW - stTm[0]) * 0.5, rY + 17);
        pCtx.show_text(String(r.val));
        pCtx.select_font_face("Arial", "normal", "normal");

        pCtx.set_source_rgba(0.18, 0.19, 0.22, 1.0);
        pCtx.rectangle_rounded(valBoxX + valBoxW - arrowW, vY, arrowW, vH, 2, 2); pCtx.fill();
        pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(8);
        pCtx.move_to(valBoxX + valBoxW - arrowW + 7, rY + 16.5); pCtx.show_text("▶");

        pCtx.set_source_rgba(attr_border_color); pCtx.set_line_width(0.75);
        pCtx.rectangle_rounded(valBoxX, vY, valBoxW, vH, 2, 2); pCtx.stroke();
      } else if (r.is_ticker) {
        pCtx.set_source_rgba(attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], 0.35);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.fill();
        pCtx.set_source_rgba(attr_border_color); pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.stroke();
        pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(10);
        pCtx.move_to(valBoxX + 6, rY + 17);
        pCtx.show_text(String(r.val));
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.fill();
        var fillW = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
        pCtx.set_source_rgba(attr_slider_color);
        pCtx.rectangle(valBoxX, vY, fillW, vH); pCtx.fill();
        pCtx.set_source_rgba(attr_border_color); pCtx.set_line_width(1.0);
        pCtx.rectangle(valBoxX, vY, fillW, vH); pCtx.stroke();
        pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(10);
        pCtx.move_to(valBoxX + 6, rY + 17);
        pCtx.show_text(String(r.val));
      } else {
        pCtx.set_source_rgba(0.14, 0.14, 0.17, 0.70);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.fill();
        pCtx.set_source_rgba(attr_border_color); pCtx.set_line_width(0.75);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH); pCtx.stroke();
        pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(10);
        var vTm = pCtx.text_measure(String(r.val));
        pCtx.move_to(valBoxX + Math.max(6, (valBoxW - vTm[0]) * 0.5), rY + 17);
        pCtx.show_text(String(r.val));
      }
    }
  }

  var theImage = new Image(pCtx);
  theImage.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

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
  if (target_id === 108) set_slider_speed(0.1 + targetPct * 1.9);
  else if (target_id === 109) set_curve_exponent(targetPct * 1.0);
  else if (target_id === 201) set_slider_gap(targetPct * 10.0);
  else if (target_id === 202) set_cap_height(1.0 + targetPct * 7.0);
  else if (target_id === 203) set_border_radius(targetPct * 25.0);
  else if (target_id === 204) set_border_thickness(targetPct * 10.0);
  else if (target_id === 205) set_border_extension(targetPct * 50.0);
  redraw_all();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; stop_stepper_repeat(); return; }
  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;
  var pr = cached_preview_rect;

  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = (mbut === 1 && is_mouse_down_anywhere === 0);
    is_mouse_down_anywhere = mbut;

    if (mbut) { lastMouseX = mx; lastMouseY = my; }

    var divY = pr.y + pr.h + 8;
    var navY = divY + 6, navH = 22, navW = w - 24, navX = 12;
    var btnW = 24, rBtnX = navX + navW - btnW - 1;

    var rowsStartY = navY + navH + 8;
    var rowW = w - 24, rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    if (mbut === 0) {
      is_resizing_window = 0;
      active_pop_target = -1;
      stop_stepper_repeat();
      if (scrollTask) { try { scrollTask.cancel(); } catch(e) {} }
      return;
    }

    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(160, Math.min(start_resize_w + deltaW, 1920));
      popup_mini_h = Math.max(80, Math.min(start_resize_h + deltaH, 1080));
      update_popup_dimensions();
      return;
    }

    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx; start_click_y = my;
      start_resize_w = w;  start_resize_h = h;
      return;
    }

    if (active_pop_target !== -1 && active_pop_target !== 50) {
      var dragPct = clamp((mx - valBoxX) / valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_to_window();
      return;
    }

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0; update_popup_dimensions(); return;
    }

    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    if (mbut && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      set_bar_from_coords(mx - pr.x, my - pr.y, true, pr.w, pr.h);
      return;
    }

    if (!has_rows) return;

    if (is_pop_tap && my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
      if (mx <= navX + btnW + 4) active_mask_tab = (active_mask_tab - 1 + 5) % 5;
      else if (mx >= rBtnX - 4) active_mask_tab = (active_mask_tab + 1) % 5;
      else active_mask_tab = (active_mask_tab + 1) % 5;
      update_popup_dimensions();
      return;
    }

    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + (rows.length * 28)) {
      var rIdx = Math.floor((my - rowsStartY) / 28);
      if (rIdx >= 0 && rIdx < rows.length) {
        var r = rows[rIdx];
        var pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

        if (r.is_stepper) {
          var arrowW = 20;
          if (is_pop_tap) {
            if (mx >= valBoxX && mx <= valBoxX + arrowW) {
              step_stepper_value(r.target_id, -1);
              stepper_target_id = r.target_id;
              stepper_dir = -1;
            } else if (mx >= valBoxX + valBoxW - arrowW && mx <= valBoxX + valBoxW) {
              step_stepper_value(r.target_id, 1);
              stepper_target_id = r.target_id;
              stepper_dir = 1;
            }

            if (stepper_dir !== 0 && !stepper_repeat_task) {
              stepper_repeat_task = new Task(function() {
                if (stepper_target_id !== -1 && is_mouse_down_anywhere) {
                  step_stepper_value(stepper_target_id, stepper_dir);
                  if (stepper_repeat_task) stepper_repeat_task.schedule(60);
                } else {
                  stop_stepper_repeat();
                }
              }, this);
              stepper_repeat_task.schedule(350);
            }
          }
          return;
        }

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          scroll_valBoxX = valBoxX; scroll_valBoxW = valBoxW;
          apply_slider_target(r.target_id, pct);
          if (scrollTask) scrollTask.repeat();
        } else if (is_pop_tap) {
          mark_dirty();
          if (r.target_id === 110) set_preset_target(preset_target ? 0 : 1);
          else if (r.target_id === 306) { toggle_curve_window(); draw_popup_to_window(); return; }
          else if (r.target_id === 104) set_mode(mode ? 0 : 1);
          else if (r.target_id === 206) set_direction(direction ? 0 : 1);
          else if (r.target_id === 301) set_label_mode((label_mode + 1) % 5);
          else if (r.target_id === 302) set_case_mode((case_mode + 1) % 3);
          else if (r.target_id === 304) set_font_style((font_style + 1) % 4);
          else if (r.target_id === 305) set_show_text(show_text ? 0 : 1);
          else if (r.target_id === 306) set_show_curve_ui(show_curve_ui ? 0 : 1);
          else if (r.target_id === 401) set_borders(borders ? 0 : 1);
          else if (r.target_id === 402) set_show_background(show_background ? 0 : 1);
          else if (r.is_ticker) {
            ensurePopupWindows();
            active_ticker_target = r.key;
            colorWindow.visible = 0;
            if (popupWindow && popupWindow.pos) {
              tickerWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + rIdx * 28 + 14];
            }
            tickerWindow.visible = 1; tickerWindow.front();
            draw_ticker_matrix_popup();
          } else if (r.is_color) {
            ensurePopupWindows();
            active_color_target = r.key;
            tickerWindow.visible = 0;
            initPickerFromTarget();
            if (popupWindow && popupWindow.pos) {
              colorWindow.pos = [popupWindow.pos[0] + valBoxX, popupWindow.pos[1] + rowsStartY + rIdx * 28 + 14];
            }
            colorWindow.visible = 1; colorWindow.front();
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
// 9. SUB-WINDOWS (COLOR PICKER & BOUND TICKER)
// =============================================================
function get_color_target(name) {
  if (name === "bar_color") return bar_color;
  if (name === "cap_color") return cap_color;
  if (name === "mode_color") return mode_color;
  if (name === "text_color") return text_color;
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

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
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = v; b = p; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
  }
  return [r, g, b];
}

function initPickerFromTarget() {
  var arr = get_color_target(active_color_target) || [1, 1, 1, 1];
  var hsv = rgbToHsv(arr[0], arr[1], arr[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2]; cur_a = (arr[3] !== undefined ? arr[3] : 1.0);
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
  ctx.set_source_rgba(0.11, 0.11, 0.13, 1.0); ctx.rectangle(0, 0, winW, winH); ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0); ctx.arc(14, 14, 6.0, 0, Math.PI * 2); ctx.fill();
  ctx.select_font_face("Arial", "normal", "bold"); ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0); ctx.move_to(28, 17);
  ctx.show_text(active_color_target);

  var hueX = 10, hueY = 28, hueW = 180, hueH = 16;
  var huePat = ctx.pattern_create_linear(hueX, 0, hueX + hueW, 0);
  huePat.add_color_stop_rgba(0.00, 1, 0, 0, 1); huePat.add_color_stop_rgba(0.17, 1, 1, 0, 1);
  huePat.add_color_stop_rgba(0.33, 0, 1, 0, 1); huePat.add_color_stop_rgba(0.50, 0, 1, 1, 1);
  huePat.add_color_stop_rgba(0.67, 0, 0, 1, 1); huePat.add_color_stop_rgba(0.83, 1, 0, 1, 1);
  huePat.add_color_stop_rgba(1.00, 1, 0, 0, 1);
  ctx.set_source(huePat); ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3); ctx.fill();

  var svX = 10, svY = 50, svW = 180, svH = 115;
  var pureRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureRGB[0], pureRGB[1], pureRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1, 1, 1, 1); satPat.add_color_stop_rgba(1.0, 1, 1, 1, 0);
  ctx.set_source(satPat); ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0, 0, 0, 0); valPat.add_color_stop_rgba(1.0, 0, 0, 0, 1);
  ctx.set_source(valPat); ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var opX = 10, opY = 172, opW = 180, opH = 16;
  var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  var opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
  opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(opPat); ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3); ctx.fill();

  var swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3); ctx.fill();

  var img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  colorWindow.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
  if (event.eventname === "close") { colorWindow.visible = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args), mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { picker_drag_zone = 0; return; }
    if (mbut) {
      if (mx < 24 && my < 24) { colorWindow.visible = 0; redraw_all(); return; }
      if (picker_drag_zone === 0) {
        if (mx >= 10 && mx <= 190 && my >= 24 && my <= 46) picker_drag_zone = 1;
        else if (mx >= 10 && mx <= 190 && my >= 48 && my <= 168) picker_drag_zone = 2;
        else if (mx >= 10 && mx <= 190 && my >= 170 && my <= 190) picker_drag_zone = 3;
      }
      if (picker_drag_zone === 1) cur_h = clamp((mx - 10) / 180, 0.0, 1.0);
      else if (picker_drag_zone === 2) { cur_s = clamp((mx - 10) / 180, 0.0, 1.0); cur_v = clamp(1.0 - (my - 50) / 115, 0.0, 1.0); }
      else if (picker_drag_zone === 3) cur_a = clamp((mx - 10) / 180, 0.0, 1.0);

      applyPickerToTarget();
      draw_color_picker_popup();
    }
  }
}

// Bound Ticker
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
  ctx.set_source_rgba(pop_bgcolor); ctx.rectangle(0, 0, winW, winH); ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0); ctx.arc(15, 15, 7.5, 0, Math.PI * 2); ctx.fill();

  var current_val = min_val;
  if (active_ticker_target === "max_val") current_val = max_val;
  if (active_ticker_target === "step_amount") current_val = step_amount;

  var ticker_data = get_ticker_digit_array(current_val);
  ctx.set_source_rgba(attr_text_color); ctx.set_font_size(14); ctx.move_to(35, 22);
  ctx.show_text(ticker_data.sign < 0 ? "-" : "+");

  var startX = 14;
  for (var i = 0; i < whole_digits + ticker_decimal_digits; i++) {
    var xOffset = startX + i * (slider_width_px + slider_gap_px);
    if (i >= whole_digits) xOffset += 8;

    ctx.set_source_rgba(0, 0, 0, 0.25);
    ctx.rectangle(xOffset, 35, slider_width_px, 125); ctx.fill();

    var dVal = continuous_digit_floats[i] !== undefined ? continuous_digit_floats[i] : (ticker_data.arr[i] || 0);
    var fillH = clamp((dVal / 9.0) * 125, 0, 125);
    ctx.set_source_rgba(i === active_ticker_column ? cap_color : bar_color);
    ctx.rectangle(xOffset, 160 - fillH, slider_width_px, fillH); ctx.fill();

    ctx.set_source_rgba(attr_text_color); ctx.set_font_size(11);
    ctx.move_to(xOffset + slider_width_px * 0.5 - 4, 185);
    ctx.show_text(String(ticker_data.arr[i] || 0));

    if (i === whole_digits - 1) {
      ctx.set_source_rgba(attr_text_color);
      ctx.arc(xOffset + slider_width_px + 4, 155, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  var img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function update_ticker_value() {
  mark_dirty();
  var digit = Math.round(continuous_digit_floats[active_ticker_column]);
  var current_val = min_val;
  if (active_ticker_target === "max_val") current_val = max_val;
  if (active_ticker_target === "step_amount") current_val = step_amount;

  var data = get_ticker_digit_array(current_val);
  data.arr[active_ticker_column] = digit;
  var rebuilt = rebuild_ticker_value(data);

  if (active_ticker_target === "min_val") min_val = rebuilt;
  else if (active_ticker_target === "max_val") max_val = rebuilt;
  else if (active_ticker_target === "step_amount") step_amount = Math.max(0.0001, rebuilt);

  draw_ticker_matrix_popup();
  redraw_all();
  output_all_values();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args), mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { active_ticker_column = -1; return; }
    if (mbut) {
      if (mx >= 4 && mx <= 26 && my >= 4 && my <= 26) { tickerWindow.visible = 0; return; }
      var startX = 14;
      for (var i = 0; i < whole_digits + ticker_decimal_digits; i++) {
        var xOffset = startX + i * (slider_width_px + slider_gap_px);
        if (i >= whole_digits) xOffset += 8;
        if (mx >= xOffset && mx <= xOffset + slider_width_px && my >= 35 && my <= 160) {
          active_ticker_column = i;
          continuous_digit_floats[i] = clamp((160 - my) / 125, 0, 1) * 9.0;
          update_ticker_value();
          break;
        }
      }
    }
  }
}

// =============================================================
// 10. PRESET & STATUS / PATTR SERIALIZATION
// =============================================================
function getvalueof() { 
  if (preset_target === 1) {
    return [gen_all, gen_center, gen_height, gen_shape, gen_width, gen_mode];
  }
  return getAllScaledValues(); 
}

function setvalueof() {
  if (is_transmitting) return;
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  if (preset_target === 1 && args.length >= 5) {
    gen_all    = clamp(Number(args[0]), 0.0, 1.0);
    gen_center = clamp(Number(args[1]), 0.0, 1.0);
    gen_height = clamp(Number(args[2]), 0.0, 1.0);
    gen_shape  = clamp(Number(args[3]), 0.0, 1.0);
    gen_width  = clamp(Number(args[4]), 0.0, 1.0);
    if (args.length >= 6) gen_mode = clamp(parseInt(args[5], 10), 0, 3);
    generate_curve();
    return;
  }

  var span = max_val - min_val;
  if (span === 0) span = 1.0;

  if (args.length === 1 && typeof args[0] === "number") {
    var norm = (args[0] - min_val) / span;
    vals.fill(clamp(norm, 0.0, 1.0));
  } else {
    for (var i = 0; i < count && i < args.length; i++) {
      var norm2 = (Number(args[i]) - min_val) / span;
      vals[i] = clamp(norm2, 0.0, 1.0);
    }
  }
  redraw_all();
  output_all_values();
}

function get_state() {
  if (preset_target === 1) {
    // Curve Dials + Curve Mode
    return {
      type: "dials",
      curve_mode: gen_mode,
      all: gen_all,
      center: gen_center,
      height: gen_height,
      shape: gen_shape,
      width: gen_width,
      val: vals.slice(0, count)
    };
  } else {
    // Raw Sliders
    return {
      type: "sliders",
      val: vals.slice(0, count),
      min_val: min_val,
      max_val: max_val,
      count: count
    };
  }
}

function set_state(d) {
  if (typeof d === "object" && d !== null) {
    if (d.type === "dials" || (d.curve_mode !== undefined && d.all !== undefined) || preset_target === 1) {
      if (d.curve_mode !== undefined) gen_mode = clamp(parseInt(d.curve_mode, 10), 0, 3);
      if (d.all !== undefined) gen_all = clamp(Number(d.all), 0.0, 1.0);
      if (d.center !== undefined) gen_center = clamp(Number(d.center), 0.0, 1.0);
      if (d.height !== undefined) gen_height = clamp(Number(d.height), 0.0, 1.0);
      if (d.shape !== undefined) gen_shape = clamp(Number(d.shape), 0.0, 1.0);
      if (d.width !== undefined) gen_width = clamp(Number(d.width), 0.0, 1.0);
      generate_curve();
      return;
    }
    if (d.min_val !== undefined) min_val = Number(d.min_val);
    if (d.max_val !== undefined) max_val = Number(d.max_val);
    if (Array.isArray(d.val)) {
      for (var v = 0; v < count && v < d.val.length; v++) vals[v] = clamp(Number(d.val[v]), 0.0, 1.0);
    }
  } else if (Array.isArray(d)) {
    for (var i = 0; i < count && i < d.length; i++) vals[i] = clamp(Number(d[i]), 0.0, 1.0);
  }
  redraw_all();
  output_all_values();
}

function morph_state(a, b, frac) {
  var rawA = (typeof a === "object" && a !== null) ? a : { val: a };
  var rawB = (typeof b === "object" && b !== null) ? b : { val: b };

  var isDialsA = rawA.type === "dials" || (rawA.curve_mode !== undefined && rawA.all !== undefined);
  var isDialsB = rawB.type === "dials" || (rawB.curve_mode !== undefined && rawB.all !== undefined);

  if (preset_target === 1 || isDialsA || isDialsB) {
    var modeA = rawA.curve_mode !== undefined ? rawA.curve_mode : gen_mode;
    var modeB = rawB.curve_mode !== undefined ? rawB.curve_mode : gen_mode;

    var allA = rawA.all !== undefined ? Number(rawA.all) : gen_all;
    var allB = rawB.all !== undefined ? Number(rawB.all) : gen_all;

    var centerA = rawA.center !== undefined ? Number(rawA.center) : gen_center;
    var centerB = rawB.center !== undefined ? Number(rawB.center) : gen_center;

    var heightA = rawA.height !== undefined ? Number(rawA.height) : gen_height;
    var heightB = rawB.height !== undefined ? Number(rawB.height) : gen_height;

    var shapeA = rawA.shape !== undefined ? Number(rawA.shape) : gen_shape;
    var shapeB = rawB.shape !== undefined ? Number(rawB.shape) : gen_shape;

    var widthA = rawA.width !== undefined ? Number(rawA.width) : gen_width;
    var widthB = rawB.width !== undefined ? Number(rawB.width) : gen_width;

    gen_all = clamp(lerp(allA, allB, frac), 0.0, 1.0);
    gen_center = clamp(lerp(centerA, centerB, frac), 0.0, 1.0);
    gen_height = clamp(lerp(heightA, heightB, frac), 0.0, 1.0);
    gen_shape = clamp(lerp(shapeA, shapeB, frac), 0.0, 1.0);
    gen_width = clamp(lerp(widthA, widthB, frac), 0.0, 1.0);
    gen_mode = frac >= 0.5 ? modeB : modeA;

    // Dual-Formula Curve Morph: Crossfades seamlessly between shapes
    if (modeA === modeB) {
      var cVals = calculate_curve_shape(modeA, gen_all, gen_center, gen_height, gen_shape, gen_width);
      for (var i = 0; i < count; i++) {
        vals[i] = cVals[i];
        target_vals[i] = cVals[i];
      }
    } else {
      var cValsA = calculate_curve_shape(modeA, gen_all, gen_center, gen_height, gen_shape, gen_width);
      var cValsB = calculate_curve_shape(modeB, gen_all, gen_center, gen_height, gen_shape, gen_width);
      for (var j = 0; j < count; j++) {
        vals[j] = clamp(lerp(cValsA[j], cValsB[j], frac), 0.0, 1.0);
        target_vals[j] = vals[j];
      }
    }
    output_all_values();
    redraw_all();
    return;
  }

  // Point-to-Point Raw Sliders Morph
  var aVals = Array.isArray(rawA.val) ? rawA.val : [Number(rawA.val || 0)];
  var bVals = Array.isArray(rawB.val) ? rawB.val : [Number(rawB.val || 0)];

  for (var k = 0; k < count; k++) {
    var v0 = k < aVals.length ? Number(aVals[k]) : vals[k];
    var v1 = k < bVals.length ? Number(bVals[k]) : vals[k];
    vals[k] = clamp(v0 + (v1 - v0) * frac, 0.0, 1.0);
    target_vals[k] = vals[k];
  }
  redraw_all();
  output_all_values();
}

// =============================================================
// 11. INLET PARSER, ATTRIBUTES & THEME BUS
// =============================================================
function msg_int(v)   { setvalueof(v); }
function msg_float(v) { setvalueof(v); }
function list()       { setvalueof(arrayfromargs(arguments)); }
function bang()       { output_channel_count(); output_all_values(); }

function set_preset_target(v) {
  if (typeof v === "string") {
    preset_target = (v.toLowerCase().indexOf("dial") !== -1 || v.toLowerCase().indexOf("curve") !== -1 || v === "1") ? 1 : 0;
  } else {
    preset_target = parseInt(v, 10) ? 1 : 0;
  }
  mark_dirty();
  redraw_all();
}
function get_preset_target() { return preset_target; }

function set_count(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p)) {
    count = clamp(p, 1, max_sliders);
    sync_labels();
    output_channel_count();
    mark_dirty();
    redraw_all();
  }
}
function get_count() { return count; }

function set_direction(v) {
  if (typeof v === "string") {
    direction = (v.toLowerCase().indexOf("vert") !== -1 || v === "1") ? 1 : 0;
  } else {
    direction = parseInt(v, 10) ? 1 : 0;
  }
  mark_dirty();
  redraw_all();
}
function get_direction() { return direction; }

function set_mode(v) {
  if (typeof v === "string") {
    mode = (v.toLowerCase().indexOf("mouse") !== -1 || v === "1") ? 1 : 0;
  } else {
    mode = parseInt(v, 10) ? 1 : 0;
  }
  mark_dirty();
  redraw_all();
}
function get_mode() { return mode; }

function set_show_text(v) { show_text = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_text() { return show_text; }

function set_show_curve_ui(v) { show_curve_ui = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_curve_ui() { return show_curve_ui; }

function set_labels() {
  var args = arrayfromargs(arguments);
  labels_raw = args.join(" ");
  sync_labels();
  mark_dirty();
  redraw_all();
}
function get_labels() { return labels_raw; }

function set_slider_gap(v) { var p = parseFloat(v); if (!isNaN(p)) slider_gap = Math.max(0.0, p); redraw_all(); }
function get_slider_gap() { return slider_gap; }

function set_cap_height(v) { var p = parseFloat(v); if (!isNaN(p)) cap_height = Math.max(1.0, p); redraw_all(); }
function get_cap_height() { return cap_height; }

function set_min_val(v) { var p = parseFloat(v); if (!isNaN(p)) min_val = p; redraw_all(); output_all_values(); }
function get_min_val() { return min_val; }

function set_max_val(v) { var p = parseFloat(v); if (!isNaN(p)) max_val = p; redraw_all(); output_all_values(); }
function get_max_val() { return max_val; }

function set_step_amount(v) { var p = parseFloat(v); if (!isNaN(p)) step_amount = Math.max(0.0001, p); redraw_all(); }
function get_step_amount() { return step_amount; }

function set_slider_speed(v) { var p = parseFloat(v); if (!isNaN(p)) slider_speed = clamp(p, 0.1, 2.0); redraw_all(); }
function get_slider_speed() { return slider_speed; }

function set_curve_exponent(v) { var p = parseFloat(v); if (!isNaN(p)) curve_exponent = clamp(p, 0.0, 2.0); redraw_all(); }
function get_curve_exponent() { return curve_exponent; }

function set_borders(v) { borders = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_borders() { return borders; }

function set_show_background(v) { show_background = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_background() { return show_background; }

function set_border_radius(v) { var p = parseFloat(v); if (!isNaN(p)) border_radius = Math.max(0.0, p); redraw_all(); }
function get_border_radius() { return border_radius; }

function set_border_thickness(v) { var p = parseFloat(v); if (!isNaN(p)) border_thickness = Math.max(0.0, p); redraw_all(); }
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) { var p = parseFloat(v); if (!isNaN(p)) border_extension = Math.max(0.0, p); redraw_all(); }
function get_border_extension() { return border_extension; }

function set_text_size(v) { var p = parseInt(v, 10); if (!isNaN(p)) text_size = clamp(p, 6, 36); redraw_all(); }
function get_text_size() { return text_size; }

function set_font_style(v) { var p = parseInt(v, 10); if (!isNaN(p)) font_style = clamp(p, 0, 3); redraw_all(); }
function get_font_style() { return font_style; }

function set_label_mode(v) { var p = parseInt(v, 10); if (!isNaN(p)) label_mode = clamp(p, 0, 4); redraw_all(); }
function get_label_mode() { return label_mode; }

function set_case_mode(v) { var p = parseInt(v, 10); if (!isNaN(p)) case_mode = clamp(p, 0, 2); redraw_all(); }
function get_case_mode() { return case_mode; }

function rgba_values(args, fallback) {
  var list = arrayfromargs(args);
  while (list.length === 1 && Array.isArray(list[0])) list = list[0];
  if (list.length < 3) return fallback;
  return [Number(list[0]), Number(list[1]), Number(list[2]), list.length > 3 ? Number(list[3]) : 1.0];
}

function set_bg_color()          { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color()          { return bg_color; }
function set_border_color()      { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color()      { return border_color; }
function set_bar_color()         { bar_color = rgba_values(arguments, bar_color); redraw_all(); }
function get_bar_color()         { return bar_color; }
function set_cap_color()         { cap_color = rgba_values(arguments, cap_color); redraw_all(); }
function get_cap_color()         { return cap_color; }
function set_mode_color()        { mode_color = rgba_values(arguments, mode_color); redraw_all(); }
function get_mode_color()        { return mode_color; }
function set_text_color()        { text_color = rgba_values(arguments, text_color); redraw_all(); }
function get_text_color()        { return text_color; }
function set_popup_dot_color()   { popup_dot_color = rgba_values(arguments, popup_dot_color); redraw_all(); }
function get_popup_dot_color()   { return popup_dot_color; }

function set_pop_bgcolor()       { pop_bgcolor = rgba_values(arguments, pop_bgcolor); redraw_all(); }
function get_pop_bgcolor()       { return pop_bgcolor; }
function set_attr_bg_color()     { attr_bg_color = rgba_values(arguments, attr_bg_color); redraw_all(); }
function get_attr_bg_color()     { return attr_bg_color; }
function set_attr_border_color() { attr_border_color = rgba_values(arguments, attr_border_color); redraw_all(); }
function get_attr_border_color() { return attr_border_color; }
function set_attr_slider_color() { attr_slider_color = rgba_values(arguments, attr_slider_color); redraw_all(); }
function get_attr_slider_color() { return attr_slider_color; }
function set_attr_text_color()   { attr_text_color = rgba_values(arguments, attr_text_color); redraw_all(); }
function get_attr_text_color()   { return attr_text_color; }

function anything() {
  var args = arrayfromargs(arguments);
  var msg = messagename.toLowerCase();
  var name = msg.replace(/^set_?/, "");

  if (name === "preset_target" || name === "target" || name === "state_mode") {
    if (args.length > 0) set_preset_target(args[0]);
    return;
  }

  if (name === "curve" || name === "auto") { toggle_curve_window(); return; }
  if (name === "center") { if (args.length > 0) { gen_center = clamp(Number(args[0]), 0, 1); generate_curve(); } return; }
  if (name === "height") { if (args.length > 0) { gen_height = clamp(Number(args[0]), 0, 1); generate_curve(); } return; }
  if (name === "shape")  { if (args.length > 0) { gen_shape  = clamp(Number(args[0]), 0, 1); generate_curve(); } return; }
  if (name === "width")  { if (args.length > 0) { gen_width  = clamp(Number(args[0]), 0, 1); generate_curve(); } return; }
  if (name === "level")  { if (args.length > 0) { gen_all    = clamp(Number(args[0]), 0, 1); generate_curve(); } return; }

  // Accepts numbers 0..3 or names: inflection, anchor, bell, lfo
  if (name === "curve_mode" || name === "gen_mode") {
    if (args.length > 0) {
      var cmVal = args[0];
      if (typeof cmVal === "string") {
        var s = cmVal.toLowerCase();
        if (s.indexOf("inflect") !== -1) gen_mode = 0;
        else if (s.indexOf("anchor") !== -1 || s.indexOf("sag") !== -1) gen_mode = 1;
        else if (s.indexOf("bell") !== -1 || s.indexOf("puck") !== -1) gen_mode = 2;
        else if (s.indexOf("lfo") !== -1 || s.indexOf("wave") !== -1 || s.indexOf("sine") !== -1) gen_mode = 3;
        else gen_mode = clamp(parseInt(cmVal, 10) || 0, 0, 3);
      } else {
        gen_mode = clamp(parseInt(cmVal, 10), 0, 3);
      }
      generate_curve();
    }
    return;
  }

  if (name === "slider_count" || name === "channels" || name === "channel_count") name = "count";
  if (name === "label") name = "labels";
  if (name === "text") name = "show_text";
  if (name === "spacing") name = "slider_gap";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

declareattribute("preset_target", { type: "int", style: "enumindex", enumvals: ["Sliders", "Curve Dials"], label: "Status Target Mode", setter: "set_preset_target", getter: "get_preset_target", category: "Behavior", embed: 1 });
declareattribute("count", { type: "int", label: "Slider Count", setter: "set_count", getter: "get_count", category: "Topology", min: 1, max: 64, embed: 1 });
declareattribute("direction", { type: "int", style: "enumindex", enumvals: ["Horizontal", "Vertical"], label: "Strip Orientation", setter: "set_direction", getter: "get_direction", category: "Geometry", embed: 1 });
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Mouse"], label: "Interaction Mode", setter: "set_mode", getter: "get_mode", category: "Behavior", embed: 1 });
declareattribute("show_curve_ui", { type: "int", style: "onoff", label: "Show Curve Button", setter: "set_show_curve_ui", getter: "get_show_curve_ui", category: "Labels", embed: 1 });
declareattribute("show_text", { type: "int", style: "onoff", label: "Show Text on Sliders", setter: "set_show_text", getter: "get_show_text", category: "Labels", embed: 1 });
declareattribute("labels", { type: "symbol", label: "Slider Labels", setter: "set_labels", getter: "get_labels", category: "Labels", embed: 1 });

declareattribute("slider_gap", { type: "float", label: "Slider Gap", setter: "set_slider_gap", getter: "get_slider_gap", category: "Geometry", min: 0.0, max: 20.0, embed: 1 });
declareattribute("cap_height", { type: "float", label: "Cap Height", setter: "set_cap_height", getter: "get_cap_height", category: "Geometry", min: 1.0, max: 10.0, embed: 1 });
declareattribute("min_val", { type: "float", label: "Min Range", setter: "set_min_val", getter: "get_min_val", category: "Range & Scaling", embed: 1 });
declareattribute("max_val", { type: "float", label: "Max Range", setter: "set_max_val", getter: "get_max_val", category: "Range & Scaling", embed: 1 });
declareattribute("step_amount", { type: "float", label: "Touch Step Size", setter: "set_step_amount", getter: "get_step_amount", category: "Behavior", embed: 1 });
declareattribute("slider_speed", { type: "float", label: "Drag Speed", setter: "set_slider_speed", getter: "get_slider_speed", category: "Behavior", min: 0.1, max: 2.0, embed: 1 });
declareattribute("curve_exponent", { type: "float", label: "Curve Exponent", setter: "set_curve_exponent", getter: "get_curve_exponent", category: "Behavior", min: 0.0, max: 1.0, embed: 1 });

declareattribute("borders", { type: "int", style: "onoff", label: "Outer Borders", setter: "set_borders", getter: "get_borders", category: "Styles", embed: 1 });
declareattribute("show_background", { type: "int", style: "onoff", label: "Show Background", setter: "set_show_background", getter: "get_show_background", category: "Styles", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Styles", min: 0.0, max: 25.0, embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Styles", min: 0.0, max: 10.0, embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Styles", min: 0.0, max: 50.0, embed: 1 });

declareattribute("bar_color", { type: "rgba", style: "rgba", label: "Bar Body Color", setter: "set_bar_color", getter: "get_bar_color", category: "Colors", embed: 1 });
declareattribute("cap_color", { type: "rgba", style: "rgba", label: "Cap Accent Color", setter: "set_cap_color", getter: "get_cap_color", category: "Colors", embed: 1 });
declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Label Text Color", setter: "set_mode_color", getter: "get_mode_color", category: "Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Value Text Color", setter: "set_text_color", getter: "get_text_color", category: "Colors", embed: 1 });
declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

// Theme Bus Listener with Full Palette Resolution
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers) themeBus.subscribers = {};

function resolve_theme_col(theme, keys) {
  if (!theme) return null;
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (theme[k] !== undefined && theme[k] !== null) return theme[k];
  }
  return null;
}

themeBus.subscribers[uniqueID] = function(theme) {
  if (!theme) return;
  var col;

  if ((col = resolve_theme_col(theme, ["body_color", "bg_color", "bg"]))) {
    bg_color = rgba_values(col, bg_color);
  }
  if ((col = resolve_theme_col(theme, ["border_color", "border"]))) {
    border_color = rgba_values(col, border_color);
  }
  if ((col = resolve_theme_col(theme, ["highlight_col", "highlight_color", "bar_color"]))) {
    bar_color = rgba_values(col, bar_color);
  }
  if ((col = resolve_theme_col(theme, ["slider_handle_color", "handle_color", "knob_line", "knob_color", "accent_color"]))) {
    cap_color = rgba_values(col, cap_color);
  }
  if ((col = resolve_theme_col(theme, ["mode_color", "mode"]))) {
    mode_color = rgba_values(col, mode_color);
  }
  if ((col = resolve_theme_col(theme, ["decimal_col", "decimal_color", "text_color", "text"]))) {
    text_color = rgba_values(col, text_color);
  }
  if ((col = resolve_theme_col(theme, ["popup_dot_color", "popup_dot", "dot_color"]))) {
    popup_dot_color = rgba_values(col, popup_dot_color);
  }

  if (theme.border_radius !== undefined) border_radius = Number(theme.border_radius);
  else if (theme.border_rad !== undefined) border_radius = Number(theme.border_rad);

  if (theme.border_thickness !== undefined) border_thickness = Number(theme.border_thickness);
  else if (theme.border_thk !== undefined) border_thickness = Number(theme.border_thk);

  if (theme.border_extension !== undefined) border_extension = Number(theme.border_extension);
  else if (theme.border_ext !== undefined) border_extension = Number(theme.border_ext);

  if ((col = resolve_theme_col(theme, ["pop_bgcolor", "popup_bg"]))) pop_bgcolor = rgba_values(col, pop_bgcolor);
  if ((col = resolve_theme_col(theme, ["attr_bg_color", "attr_bg"]))) attr_bg_color = rgba_values(col, attr_bg_color);
  if ((col = resolve_theme_col(theme, ["attr_border_color", "attr_border"]))) attr_border_color = rgba_values(col, attr_border_color);
  if ((col = resolve_theme_col(theme, ["attr_slider_color", "attr_slider"]))) attr_slider_color = rgba_values(col, attr_slider_color);
  if ((col = resolve_theme_col(theme, ["attr_text_color", "attr_text"]))) attr_text_color = rgba_values(col, attr_text_color);

  redraw_all();
};

if (themeBus.theme) themeBus.subscribers[uniqueID](themeBus.theme);

// Patcher Save & Session Persistence
function save() {
  embedmessage("set_preset_target", preset_target);
  embedmessage("set_count", count);
  embedmessage("set_direction", direction);
  embedmessage("set_mode", mode);
  embedmessage("set_show_curve_ui", show_curve_ui);
  embedmessage("set_show_text", show_text);
  embedmessage("set_labels", labels_raw);
  embedmessage("set_slider_gap", slider_gap);
  embedmessage("set_cap_height", cap_height);
  embedmessage("set_min_val", min_val);
  embedmessage("set_max_val", max_val);
  embedmessage("set_step_amount", step_amount);
  embedmessage("set_slider_speed", slider_speed);
  embedmessage("set_curve_exponent", curve_exponent);

  embedmessage("set_borders", borders);
  embedmessage("set_show_background", show_background);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_text_size", text_size);
  embedmessage("set_font_style", font_style);
  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);

  embedmessage("set_bar_color", bar_color[0], bar_color[1], bar_color[2], bar_color[3]);
  embedmessage("set_cap_color", cap_color[0], cap_color[1], cap_color[2], cap_color[3]);
  embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  embedmessage("setvalueof", getAllScaledValues());
}

function notifydeleted() {
  stop_stepper_repeat();
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (scrollTask)  { try { scrollTask.cancel(); } catch(e) {} }
  if (backgroundTask) { try { backgroundTask.cancel(); } catch(e) {} }
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];

  try { if (windowListener) windowListener.subjectname = ""; } catch(e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}
  try { if (tickerListener) tickerListener.subjectname = ""; } catch(e) {}
  try { if (curveListener) curveListener.subjectname = ""; } catch(e) {}

  try { if (popupWindow) popupWindow.visible = 0; popupWindow.free(); } catch(e) {}
  try { if (colorWindow) colorWindow.visible = 0; colorWindow.free(); } catch(e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; tickerWindow.free(); } catch(e) {}
  try { if (curveWindow) curveWindow.visible = 0; curveWindow.free(); } catch(e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch(e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}
  try { if (tickerMatrix) tickerMatrix.freepeer(); } catch(e) {}
  try { if (curveMatrix) curveMatrix.freepeer(); } catch(e) {}
}

output_channel_count();
new Task(function() { is_initializing = false; }, this).schedule(100);