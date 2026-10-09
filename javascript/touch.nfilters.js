// ============================================================================
// touch.nfilters.js - Max 9 v8ui / jsui
// Multi-Band Parametric Filter Engine with 10 Native Filtergraph Topologies,
// Numbered Handles, Non-Colliding Fixed HUD, Single-Touch "Pause-to-Shape",
// mdial-Style Selector Strip, Theme Bus Sync, and touch.status Integration.
//
// Outlets:
//   Outlet 0 (Left):   Cascade coefficient list [a0 a1 a2 b1 b2 ...] for [cascade~]
//   Outlet 1 (Middle): Active filter event [index freq gain Q type]
//   Outlet 2 (Right):  Parameter dump / Active channel count integer
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "Inlet: bang / list / set / messages");
setoutletassist(0, "Outlet 0: Cascade coefficient list for [cascade~]");
setoutletassist(1, "Outlet 1: Active filter event [index freq gain Q type]");
setoutletassist(2, "Outlet 2: Parameter dump / Active channel count");

var uniqueID = Math.floor(Math.random() * 1000000);
var is_initializing = true;

// =============================================================
// 1. FILTER DSP & 10 NATIVE TOPOLOGIES (UP TO 8 BANDS)
// =============================================================
var sample_rate = 44100.0;
var count       = 1; // Always start with ONE filter
var max_bands   = 8; // Capped at 8
var active_node = 0;

// Native Max filtergraph~ Types
var TYPE_DISPLAY  = 0;
var TYPE_LP       = 1;
var TYPE_HP       = 2;
var TYPE_BP       = 3;
var TYPE_NOTCH    = 4;
var TYPE_BELL     = 5;
var TYPE_LS       = 6;
var TYPE_HS       = 7;
var TYPE_RESONANT = 8;
var TYPE_ALLPASS  = 9;

var type_names = [
  "display", "lowpass", "highpass", "bandpass", "bandstop",
  "peaknotch", "lowshelf", "highshelf", "resonant", "allpass"
];

// Persistent 8-Band Slot Pool
var band_pool = [];
function init_band_pool() {
  band_pool = [
    { type: TYPE_BELL, freq: 1000.0, gain: 0.0, q: 1.414, enabled: 1 },
    { type: TYPE_BELL, freq: 250.0,  gain: 2.5, q: 1.414, enabled: 1 },
    { type: TYPE_BELL, freq: 500.0,  gain: 0.0, q: 1.414, enabled: 1 },
    { type: TYPE_BELL, freq: 2000.0, gain: 0.0, q: 1.414, enabled: 1 },
    { type: TYPE_BELL, freq: 4000.0, gain: 0.0, q: 1.414, enabled: 1 },
    { type: TYPE_BELL, freq: 8000.0, gain: 0.0, q: 1.414, enabled: 1 },
    { type: TYPE_HP,   freq: 60.0,   gain: 0.0, q: 0.707, enabled: 1 },
    { type: TYPE_LP,   freq: 14000.0,gain: 0.0, q: 0.707, enabled: 1 }
  ];
}
init_band_pool();

var is_transmitting = false;

// Geometry Constants
var MIN_FREQ = 20.0;
var MAX_FREQ = 20000.0;
var MIN_Q    = 0.1;
var MAX_Q    = 18.0;

var db_range          = 24.0;
var show_q_bands      = 1;
var show_ghost_curves = 1;
var show_hud          = 1;
var allow_popup       = 1;

// Styles & Borders
var borders          = 1;
var border_radius    = 6.0;
var border_thickness = 1.2;
var border_extension = 6.0;
var curve_thickness  = 2.0;
var handle_radius    = 8.5; // Sized for numbering
var grid_alpha       = 0.40;
var hold_time_ms     = 250;

// Palettes & Component Colors
var bg_color          = [0.08, 0.08, 0.10, 0.95];
var grid_color        = [0.25, 0.25, 0.28, 0.40];
var curve_color       = [0.72, 0.78, 0.18, 1.00];
var curve_fill_color  = [0.72, 0.78, 0.18, 0.12];
var ghost_color       = [0.72, 0.78, 0.18, 0.35];
var node_color        = [0.85, 0.90, 0.20, 1.00];
var node_active_color = [1.00, 1.00, 0.40, 1.00];
var q_shade_color     = [0.72, 0.78, 0.18, 0.18];
var hud_accent_color  = [0.95, 0.70, 0.25, 0.85];
var border_color      = [0.35, 0.35, 0.38, 0.80];
var text_color        = [0.88, 0.88, 0.88, 1.00];
var mode_color        = [0.85, 0.85, 0.90, 1.00];
var popup_dot_color   = [1.00, 0.20, 0.20, 1.00];

// Popup Attrui UI Colors
var pop_bgcolor       = [0.10, 0.10, 0.12, 1.0];
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

var current_w = 400;
var current_h = 160;

// Inspector Focused Band Tracker: -1 = [ALL], 0..count-1 = Individual Band
var active_edit_band = -1;

// =============================================================
// GESTURE & SHAPER STATE MACHINE
// =============================================================
var dragging_node    = -1;
var in_design_mode   = false;
var pause_timer      = null;

var click_start_x    = 0;
var click_start_y    = 0;
var node_start_f     = 1000.0;
var node_start_g     = 0.0;
var node_start_q     = 1.0;

var shaper_origin_x  = 0;
var shaper_origin_y  = 0;
var shaper_base_q    = 1.0;

function cancel_pause_timer() {
  if (pause_timer) {
    try { pause_timer.cancel(); } catch (e) {}
    pause_timer = null;
  }
}

function start_stationary_pause_detector() {
  cancel_pause_timer();
  pause_timer = new Task(function () {
    if (dragging_node !== -1) {
      if (!in_design_mode) {
        in_design_mode = true;
        shaper_origin_x = click_start_x;
        shaper_origin_y = click_start_y;
        shaper_base_q   = band_pool[dragging_node].q;
      } else {
        in_design_mode = false;
        node_start_f = band_pool[dragging_node].freq;
        node_start_g = band_pool[dragging_node].gain;
      }
      redraw_all();
    }
  }, this);
  pause_timer.schedule(hold_time_ms);
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

// =============================================================
// 2. BIQUAD DSP ENGINE (10 NATIVE FILTER TYPES WITH GAIN)
// =============================================================
function compute_biquad_coeffs(b) {
  if (!b.enabled || b.type === TYPE_DISPLAY) return [1.0, 0.0, 0.0, 0.0, 0.0];

  var f0 = clamp(b.freq, MIN_FREQ, MAX_FREQ);
  var Q = Math.max(0.01, b.q);
  var A = Math.pow(10.0, b.gain / 40.0);
  var linear_gain = Math.pow(10.0, b.gain / 20.0);
  var w0 = 2.0 * Math.PI * f0 / sample_rate;
  var cosw = Math.cos(w0);
  var sinw = Math.sin(w0);
  var alpha = sinw / (2.0 * Q);

  var b0 = 1.0, b1 = 0.0, b2 = 0.0;
  var a0 = 1.0, a1 = 0.0, a2 = 0.0;

  switch (b.type) {
    case TYPE_LP:
      b0 = (1.0 - cosw) * 0.5 * linear_gain;
      b1 = (1.0 - cosw) * linear_gain;
      b2 = (1.0 - cosw) * 0.5 * linear_gain;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
    case TYPE_HP:
      b0 = (1.0 + cosw) * 0.5 * linear_gain;
      b1 = -(1.0 + cosw) * linear_gain;
      b2 = (1.0 + cosw) * 0.5 * linear_gain;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
    case TYPE_BP:
      b0 = alpha * linear_gain;
      b1 = 0.0;
      b2 = -alpha * linear_gain;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
    case TYPE_NOTCH:
      b0 = 1.0 * linear_gain;
      b1 = -2.0 * cosw * linear_gain;
      b2 = 1.0 * linear_gain;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
    case TYPE_BELL:
      b0 = 1.0 + alpha * A;
      b1 = -2.0 * cosw;
      b2 = 1.0 - alpha * A;
      a0 = 1.0 + alpha / A;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha / A;
      break;
    case TYPE_LS:
      var sqrtA = Math.sqrt(A);
      var a_ls = 2.0 * sqrtA * alpha;
      b0 = A * ((A + 1.0) - (A - 1.0) * cosw + a_ls);
      b1 = 2.0 * A * ((A - 1.0) - (A + 1.0) * cosw);
      b2 = A * ((A + 1.0) - (A - 1.0) * cosw - a_ls);
      a0 = (A + 1.0) + (A - 1.0) * cosw + a_ls;
      a1 = -2.0 * ((A - 1.0) + (A + 1.0) * cosw);
      a2 = (A + 1.0) - (A - 1.0) * cosw - a_ls;
      break;
    case TYPE_HS:
      var sqrtA2 = Math.sqrt(A);
      var a_hs = 2.0 * sqrtA2 * alpha;
      b0 = A * ((A + 1.0) + (A - 1.0) * cosw + a_hs);
      b1 = -2.0 * A * ((A - 1.0) + (A + 1.0) * cosw);
      b2 = A * ((A + 1.0) - (A - 1.0) * cosw - a_hs);
      a0 = (A + 1.0) - (A - 1.0) * cosw + a_hs;
      a1 = 2.0 * ((A - 1.0) + (A + 1.0) * cosw);
      a2 = (A + 1.0) - (A - 1.0) * cosw - a_hs;
      break;
    case TYPE_RESONANT:
      b0 = alpha * A;
      b1 = 0.0;
      b2 = -alpha * A;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
    case TYPE_ALLPASS:
      b0 = 1.0 - alpha;
      b1 = -2.0 * cosw;
      b2 = 1.0 + alpha;
      a0 = 1.0 + alpha;
      a1 = -2.0 * cosw;
      a2 = 1.0 - alpha;
      break;
  }

  var inv_a0 = 1.0 / a0;
  return [b0 * inv_a0, b1 * inv_a0, b2 * inv_a0, a1 * inv_a0, a2 * inv_a0];
}

function evaluate_single_band_db(b, freq) {
  if (b.type === TYPE_ALLPASS) return 0.0;
  var w = 2.0 * Math.PI * freq / sample_rate;
  var cosw = Math.cos(w);
  var sinw = Math.sin(w);
  var cos2w = Math.cos(2.0 * w);
  var sin2w = Math.sin(2.0 * w);

  var c = compute_biquad_coeffs(b);
  var num_r = c[0] + c[1] * cosw + c[2] * cos2w;
  var num_i = -c[1] * sinw - c[2] * sin2w;
  var den_r = 1.0 + c[3] * cosw + c[4] * cos2w;
  var den_i = -c[3] * sinw - c[4] * sin2w;

  var num_mag2 = num_r * num_r + num_i * num_i;
  var den_mag2 = den_r * den_r + den_i * den_i;
  return den_mag2 > 1e-12 ? 10.0 * Math.log10(num_mag2 / den_mag2) : 0.0;
}

function evaluate_db_at_freq(freq) {
  var total_db = 0.0;
  for (var i = 0; i < count; i++) {
    total_db += evaluate_single_band_db(band_pool[i], freq);
  }
  return total_db;
}

// =============================================================
// 3. COORDINATE MAPPING
// =============================================================
function get_graph_bounds(totalW, totalH) {
  var w = totalW || current_w;
  var h = totalH || current_h;
  var b = borders ? (border_thickness * 0.5 + 2.0) : 1.0;
  return { x: b, y: b, w: Math.max(10, w - b * 2), h: Math.max(10, h - b * 2) };
}

function freq_to_x(f, gb) {
  var norm = Math.log10(f / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ);
  return gb.x + clamp(norm, 0.0, 1.0) * gb.w;
}

function x_to_freq(x, gb) {
  var norm = clamp((x - gb.x) / gb.w, 0.0, 1.0);
  return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, norm);
}

function gain_to_y(g, gb) {
  var norm = (g - (-db_range)) / (db_range * 2.0);
  return gb.y + (1.0 - clamp(norm, 0.0, 1.0)) * gb.h;
}

function y_to_gain(y, gb) {
  var norm = 1.0 - clamp((y - gb.y) / gb.h, 0.0, 1.0);
  return -db_range + norm * (db_range * 2.0);
}

function get_node_display_gain(b) {
  if (b.type === TYPE_ALLPASS || b.type === TYPE_DISPLAY) return 0.0;
  return b.gain;
}

// =============================================================
// 4. VECTOR DRAW ENGINE (NUMBERED HANDLES & FIXED HUD)
// =============================================================
function drawCorners(ctx, x, y, w, h, r, ew, eh, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  else ctx.move_to(x, y);
  ctx.line_to(x + r + ew, y);
  ctx.move_to(x, y + r); ctx.line_to(x, y + r + eh);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + eh);
  ctx.move_to(x + w - r - ew, y); ctx.line_to(x + w - r, y);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
  else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - ew, y + h);
  ctx.move_to(x + w, y + h - r); ctx.line_to(x + w, y + h - r - eh);
  ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
  else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - eh);
  ctx.move_to(x + r + ew, y + h); ctx.line_to(x + r, y + h);
  ctx.stroke();
}

function draw_eq_canvas(ctx, w, h, is_preview) {
  var gb = get_graph_bounds(w, h);
  var b = border_thickness;

  // 1. Background Chassis
  ctx.set_source_rgba(bg_color);
  ctx.rectangle(0, 0, w, h);
  ctx.fill();

  // 2. Corner Reticles
  if (borders && b > 0) {
    var r = border_radius;
    var ew = Math.min(border_extension, w * 0.25);
    var eh = Math.min(border_extension, h * 0.25);
    drawCorners(ctx, b * 0.5, b * 0.5, w - b, h - b, r, ew, eh, border_color, b);
  }

  // 3. Grid Lines & Amplitude Scale
  ctx.set_source_rgba(grid_color[0], grid_color[1], grid_color[2], grid_alpha);
  ctx.set_line_width(0.75);

  var db_step = db_range >= 24 ? 6 : 4;
  for (var d = db_range - db_step; d >= -db_range + db_step; d -= db_step) {
    var gy = gain_to_y(d, gb);
    ctx.move_to(gb.x, gy); ctx.line_to(gb.x + gb.w, gy); ctx.stroke();

    ctx.select_font_face("Arial", "normal", "normal");
    ctx.set_font_size(8.5);
    ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.35);
    ctx.move_to(gb.x + gb.w - 22, gy - 2);
    ctx.show_text(String(d));
    ctx.set_source_rgba(grid_color[0], grid_color[1], grid_color[2], grid_alpha);
  }

  var freq_grid = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
  for (var f = 0; f < freq_grid.length; f++) {
    var gx = freq_to_x(freq_grid[f], gb);
    ctx.move_to(gx, gb.y); ctx.line_to(gx, gb.y + gb.h); ctx.stroke();
  }

  // 4. Translucent Q Bandwidth Regions
  if (show_q_bands) {
    for (var qb = 0; qb < count; qb++) {
      var bnd = band_pool[qb];
      if (!bnd.enabled || bnd.type === TYPE_DISPLAY || bnd.type === TYPE_ALLPASS) continue;

      var bw = 1.0 / Math.max(0.01, bnd.q);
      var f_low = bnd.freq * Math.pow(2.0, -bw * 0.5);
      var f_high = bnd.freq * Math.pow(2.0, bw * 0.5);
      var x1 = freq_to_x(f_low, gb);
      var x2 = freq_to_x(f_high, gb);

      var is_active = (qb === active_node);
      var q_alpha = is_active ? (in_design_mode ? 0.35 : 0.22) : 0.08;
      ctx.set_source_rgba(q_shade_color[0], q_shade_color[1], q_shade_color[2], q_alpha);
      ctx.rectangle(x1, gb.y, Math.max(2, x2 - x1), gb.h);
      ctx.fill();
    }
  }

  // 5. Individual Ghost Isolines
  if (show_ghost_curves && count > 1) {
    var gPoints = Math.min(180, Math.max(40, Math.floor(gb.w * 0.35)));
    for (var gi = 0; gi < count; gi++) {
      var gBand = band_pool[gi];
      if (!gBand.enabled || gBand.type === TYPE_DISPLAY || gBand.type === TYPE_ALLPASS) continue;

      var isActGhost = (gi === active_node);
      ctx.set_source_rgba(ghost_color[0], ghost_color[1], ghost_color[2], isActGhost ? 0.65 : 0.25);
      ctx.set_line_width(isActGhost ? 1.2 : 0.85);

      ctx.new_path();
      for (var gp = 0; gp <= gPoints; gp++) {
        var g_cur_x = gb.x + (gp / gPoints) * gb.w;
        var g_cur_f = x_to_freq(g_cur_x, gb);
        var g_cur_db = evaluate_single_band_db(gBand, g_cur_f);
        var g_cur_y = gain_to_y(g_cur_db, gb);
        if (gp === 0) ctx.move_to(g_cur_x, g_cur_y);
        else ctx.line_to(g_cur_x, g_cur_y);
      }
      ctx.stroke();
    }
  }

  // 6. Master Composite EQ Response Curve
  var points = Math.min(260, Math.max(60, Math.floor(gb.w * 0.5)));
  ctx.new_path();
  ctx.move_to(gb.x, gain_to_y(0.0, gb));

  for (var pt = 0; pt <= points; pt++) {
    var cur_x = gb.x + (pt / points) * gb.w;
    var cur_f = x_to_freq(cur_x, gb);
    var cur_db = evaluate_db_at_freq(cur_f);
    var cur_y = gain_to_y(cur_db, gb);
    if (pt === 0) ctx.move_to(cur_x, cur_y);
    else ctx.line_to(cur_x, cur_y);
  }

  ctx.set_source_rgba(curve_color);
  ctx.set_line_width(curve_thickness);
  ctx.stroke_preserve();

  ctx.line_to(gb.x + gb.w, gb.y + gb.h);
  ctx.line_to(gb.x, gb.y + gb.h);
  ctx.close_path();
  ctx.set_source_rgba(curve_fill_color);
  ctx.fill();

  // 7. Dynamic Crosshairs, Bandwidth Box & FIXED HUD HEADER
  if (active_node >= 0 && active_node < count) {
    var actB = band_pool[active_node];
    var actX = freq_to_x(actB.freq, gb);
    var actY = gain_to_y(get_node_display_gain(actB), gb);
    var zeroY = gain_to_y(0.0, gb);

    var actBW = 1.0 / Math.max(0.01, actB.q);
    var actFLow = actB.freq * Math.pow(2.0, -actBW * 0.5);
    var actFHigh = actB.freq * Math.pow(2.0, actBW * 0.5);
    var boxX1 = freq_to_x(actFLow, gb);
    var boxX2 = freq_to_x(actFHigh, gb);

    // Crosshairs
    ctx.set_source_rgba(hud_accent_color[0], hud_accent_color[1], hud_accent_color[2], in_design_mode ? 0.85 : 0.45);
    ctx.set_line_width(0.75);
    ctx.move_to(gb.x, actY); ctx.line_to(gb.x + gb.w, actY); ctx.stroke();
    ctx.move_to(actX, gb.y); ctx.line_to(actX, gb.y + gb.h); ctx.stroke();

    // Bandwidth Bounding Box (Max filtergraph style)
    var boxTop = Math.min(zeroY, actY);
    var boxH = Math.max(Math.abs(actY - zeroY), gb.h * 0.35);
    if (actB.type === TYPE_HP || actB.type === TYPE_LP || actB.type === TYPE_NOTCH) {
      boxTop = gb.y + 4;
      boxH = gb.h - 8;
    }
    ctx.set_source_rgba(hud_accent_color[0], hud_accent_color[1], hud_accent_color[2], in_design_mode ? 0.95 : 0.55);
    ctx.set_line_width(in_design_mode ? 1.5 : 1.0);
    ctx.rectangle(boxX1, boxTop, Math.max(2, boxX2 - boxX1), boxH);
    ctx.stroke();

    // CLEAN RESPONSIVE HUD (Zero Text Collision)
    if (show_hud) {
      ctx.select_font_face("Arial", "normal", "bold");
      
      // Auto-scale font for narrow rack boxes
      var isNarrow = gb.w < 220;
      ctx.set_font_size(isNarrow ? 8.5 : 9.5);
      ctx.set_source_rgba(0.95, 0.95, 0.98, 0.92);

      // 1. Left: Frequency
      var fStr = (actB.freq >= 1000) ? ((actB.freq / 1000).toFixed(1) + "kHz") : (Math.round(actB.freq) + "Hz");
      ctx.move_to(gb.x + 6, gb.y + 13);
      ctx.show_text(fStr);

      // 2. Right: Gain (No redundant topology clutter)
      var gStr = (actB.type === TYPE_ALLPASS || actB.type === TYPE_DISPLAY)
        ? type_names[actB.type]
        : ((actB.gain >= 0 ? "+" : "") + actB.gain.toFixed(1) + "dB");
      var gTm = ctx.text_measure(gStr);
      ctx.move_to(gb.x + gb.w - (gTm ? gTm[0] : 30) - 20, gb.y + 13);
      ctx.show_text(gStr);

      // 3. Center: Q (Only shown if box is wide enough, OR when actively shaping Q)
      if (!isNarrow || in_design_mode) {
        var qStr = actB.q.toFixed(1) + "Q";
        var qTm = ctx.text_measure(qStr);
        ctx.set_source_rgba(in_design_mode ? node_active_color : [0.95, 0.95, 0.98, 0.92]);
        ctx.move_to(gb.x + (gb.w - (qTm ? qTm[0] : 18)) * 0.5, gb.y + 13);
        ctx.show_text(qStr);
      }
    }
  }

  // 8. Numbered Handles & Touch-and-Hold Indicators
  for (var n = 0; n < count; n++) {
    var nb = band_pool[n];
    var nx = freq_to_x(nb.freq, gb);
    var ny = gain_to_y(get_node_display_gain(nb), gb);
    var is_cur = (n === active_node);
    var r = is_cur ? (handle_radius + 1.5) : handle_radius;

    // Glowing Halo in Shaper Mode
    if (is_cur && in_design_mode) {
      ctx.set_source_rgba(node_active_color[0], node_active_color[1], node_active_color[2], 0.35);
      ctx.arc(nx, ny, 22.0, 0, Math.PI * 2);
      ctx.fill();

      // Bandwidth brackets (◀ ◯ ▶)
      ctx.set_source_rgba(node_active_color);
      ctx.set_line_width(1.5);
      ctx.move_to(nx - 16, ny); ctx.line_to(nx - 11, ny - 4);
      ctx.move_to(nx - 16, ny); ctx.line_to(nx - 11, ny + 4);
      ctx.move_to(nx + 16, ny); ctx.line_to(nx + 11, ny - 4);
      ctx.move_to(nx + 16, ny); ctx.line_to(nx + 11, ny + 4);
      ctx.stroke();
    }

    // Outer Handle Circle
    ctx.set_source_rgba(is_cur ? node_active_color : node_color);
    ctx.set_line_width(is_cur ? 2.5 : 1.5);
    ctx.arc(nx, ny, r, 0, Math.PI * 2);
    ctx.stroke_preserve();

    ctx.set_source_rgba(bg_color[0], bg_color[1], bg_color[2], 0.7);
    ctx.fill();

    // Number Drawn Directly Inside Each Handle Circle!
    ctx.select_font_face("Arial", "normal", is_cur ? "bold" : "normal");
    ctx.set_font_size(r >= 8 ? 8.5 : 7.0);
    ctx.set_source_rgba(is_cur ? node_active_color : text_color);
    var numStr = String(n + 1);
    var nTm = ctx.text_measure(numStr);
    ctx.move_to(nx - (nTm ? nTm[0] * 0.5 : 3), ny + (r >= 8 ? 3.0 : 2.5));
    ctx.show_text(numStr);
  }

  // 9. Red Popup Launcher Dot
  if (!is_preview && allow_popup) {
    ctx.set_source_rgba(popup_dot_color);
    ctx.arc(w - 7, 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  var dims = get_dimensions();
  draw_eq_canvas(mgraphics, dims.w, dims.h, false);
}

// =============================================================
// 5. UNIFIED RELATIVE DRAG & PAUSE-TO-SHAPE ENGINE
// =============================================================
function get_dimensions() {
  var sz = mgraphics.size;
  if (sz && sz[0] > 0 && sz[1] > 0) {
    current_w = sz[0]; current_h = sz[1];
    return { w: current_w, h: current_h };
  }
  if (this.box && this.box.rect) {
    var r = this.box.rect;
    current_w = Math.max(1, r[2] - r[0]);
    current_h = Math.max(1, r[3] - r[1]);
  }
  return { w: current_w, h: current_h };
}

function handle_graph_click(mx, my, totalW, totalH, isRightClick) {
  var gb = get_graph_bounds(totalW, totalH);
  var closest_idx = -1;
  var min_dist = 24.0;

  for (var i = 0; i < count; i++) {
    var nx = freq_to_x(band_pool[i].freq, gb);
    var ny = gain_to_y(get_node_display_gain(band_pool[i]), gb);
    var dist = Math.sqrt((mx - nx) * (mx - nx) + (my - ny) * (my - ny));
    if (dist < min_dist) {
      min_dist = dist;
      closest_idx = i;
    }
  }

  if (closest_idx !== -1) {
    active_node = closest_idx;
    dragging_node = closest_idx;
    active_edit_band = closest_idx;
    in_design_mode = false;

    // Right-Click (Ctrl+Click) cycles filter type
    if (isRightClick) {
      band_pool[active_node].type = (band_pool[active_node].type + 1) % 10;
      output_coefficients();
      output_active_node();
      redraw_all();
      return true;
    }

    var active_b = band_pool[active_node];
    click_start_x = mx;
    click_start_y = my;
    node_start_f  = active_b.freq;
    node_start_g  = active_b.gain;
    node_start_q  = active_b.q;

    // Start stationary pause detector for Shaper Mode
    start_stationary_pause_detector();

    output_active_node();
    redraw_all();
    return true;
  }
  return false;
}

function handle_graph_drag(mx, my, totalW, totalH) {
  if (dragging_node === -1 || dragging_node >= count) return;

  var gb = get_graph_bounds(totalW, totalH);
  var b  = band_pool[dragging_node];

  start_stationary_pause_detector();

  if (in_design_mode) {
    // SHAPER MODE: Horizontal scrubbing shapes Q
    var dx = mx - shaper_origin_x;
    b.q = clamp(shaper_base_q * Math.pow(2.0, -dx / 75.0), MIN_Q, MAX_Q);

    // Vertical breakout: deliberate vertical movement exits Shaper Mode
    var dy = Math.abs(my - shaper_origin_y);
    if (dy > 14.0) {
      in_design_mode = false;
      click_start_x = mx;
      click_start_y = my;
      node_start_f = b.freq;
      node_start_g = b.gain;
    }
  } else {
    // NORMAL POSITION DRAGGING: Zero-snap relative tracking
    var cur_norm_x = (mx - gb.x) / gb.w;
    var start_norm_x = (click_start_x - gb.x) / gb.w;
    var start_log = Math.log10(node_start_f / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ);
    var new_log = start_log + (cur_norm_x - start_norm_x);
    b.freq = clamp(MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, new_log), MIN_FREQ, MAX_FREQ);

    if (b.type !== TYPE_ALLPASS && b.type !== TYPE_DISPLAY) {
      var dy_norm = (click_start_y - my) / gb.h;
      b.gain = clamp(node_start_g + dy_norm * (db_range * 2.0), -db_range, db_range);
    }
  }

  output_coefficients();
  output_active_node();
  redraw_all();
}

function handle_graph_up() {
  cancel_pause_timer();
  dragging_node = -1;
  in_design_mode = false;
  redraw_all();
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var dims = get_dimensions();
  if (allow_popup && x >= dims.w - 16 && y <= 16) {
    popup();
    return;
  }
  handle_graph_click(x, y, dims.w, dims.h, ctrl === 1);
}

function ondrag(x, y, button) {
  if (button === 0) { onmouseup(); return; }
  var dims = get_dimensions();
  handle_graph_drag(x, y, dims.w, dims.h);
}

function onmouseup()  { handle_graph_up(); }
function onidleout()  { handle_graph_up(); }

function onmousewheel(rx, ry, delta_x, delta_y) {
  if (active_node >= 0 && active_node < count) {
    var b = band_pool[active_node];
    b.q = clamp(b.q + delta_y * 0.05, MIN_Q, MAX_Q);
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}

// =============================================================
// 6. OUTPUT ENGINE
// =============================================================
function output_coefficients() {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    var cascade_list = [];
    for (var i = 0; i < count; i++) {
      var c = compute_biquad_coeffs(band_pool[i]);
      for (var k = 0; k < 5; k++) cascade_list.push(c[k]);
    }
    outlet(0, cascade_list);
  } finally {
    is_transmitting = false;
  }
}

function output_active_node() {
  if (active_node < 0 || active_node >= count) return;
  var b = band_pool[active_node];
  outlet(1, [active_node + 1, b.freq, b.gain, b.q, type_names[b.type]]);
}

function output_channel_count() {
  outlet(2, count);
}

function bang() {
  output_channel_count();
  output_coefficients();
  output_active_node();
}

function dump() {
  output_channel_count();
  output_coefficients();
  for (var i = 0; i < count; i++) {
    var b = band_pool[i];
    outlet(1, [i + 1, b.freq, b.gain, b.q, type_names[b.type]]);
  }
}

function redraw_all() {
  mgraphics.redraw();
  if (showSettings && popupWindow && popupWindow.visible) draw_popup_inspector();
}

// =============================================================
// 7. POPUP CAROUSEL INSPECTOR (WITH MDIAL SELECTION STRIP)
// =============================================================
var showSettings        = 0;
var show_settings_attrs = 1;
var active_mask_tab     = 0;
var mask_tab_names = ["1. Performance", "2. Geometry / Styling", "3. Colors"];

var popup_window_width  = 300;
var popup_mini_w        = 340;
var popup_mini_h        = 180;
var start_resize_w      = 340;
var start_resize_h      = 180;
var is_resizing_window  = 0;

var popupWindow   = null;
var colorWindow   = null;
var outMatrix     = null;
var colorMatrix   = null;
var windowListener = null;
var colorListener  = null;

var showColorWindow = 0;
var active_color_target = "curve_color";
var cur_h = 0.18, cur_s = 0.8, cur_v = 0.8, cur_a = 1.0;
var picker_drag_zone = 0;

var active_pop_target = -1;
var is_mouse_down_anywhere = 0;
var cached_preview_rect = { x: 12, y: 28, w: 316, h: 100 };

var scroll_valBoxX = 0;
var scroll_valBoxW = 100;
var scrollTask = new Task(function () {
  if (active_pop_target === -1) return;
  var targetPct = clamp((lastMouseX - scroll_valBoxX) / scroll_valBoxW, 0, 1);
  apply_slider_target(active_pop_target, targetPct);
}, this);
scrollTask.interval = 15;

function stop_scrolling() {
  if (scrollTask) {
    try { scrollTask.cancel(); } catch(e) {}
  }
}

function ensurePopupWindows() {
  if (!popupWindow) {
    popupWindow = new JitterObject("jit.window", "nfilt_set_" + uniqueID);
    popupWindow.floating = 1; popupWindow.visible = 0; popupWindow.border = 1; popupWindow.grow = 0;
    popupWindow.title = "N-Filters Inspector"; popupWindow.size = [popup_mini_w, popup_mini_h];
    outMatrix = new JitterMatrix(4, "char", popup_mini_w, popup_mini_h);
    windowListener = new JitterListener(popupWindow.name, popupWindowCallback);
  }
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", "nfilt_col_" + uniqueID);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0;
    colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];
    colorMatrix = new JitterMatrix(4, "char", 200, 240);
    colorListener = new JitterListener(colorWindow.name, colorWindowCallback);
  }
}

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

function get_popup_dimensions() {
  if (!show_settings_attrs) return { w: popup_mini_w, h: popup_mini_h };
  var rows = get_tab_rows();
  var prevH = 75;
  var stripH = (count > 1) ? 26 : 0;
  var fixedH = 28 + prevH + 8 + stripH + 22 + 8 + (rows.length * 28) + 16;
  return { w: popup_window_width, h: fixedH };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup) {
    ensurePopupWindows();
    var dims = get_popup_dimensions();
    popupWindow.size = [dims.w, dims.h];
    outMatrix = recycleMatrix(outMatrix, dims.w, dims.h);
    popupWindow.visible = 1;
    popupWindow.front();
    draw_popup_inspector();
  } else {
    if (popupWindow) popupWindow.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
  }
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;
  update_popup_dimensions();
  redraw_all();
}

function draw_popup_inspector() {
  if (!popupWindow || !showSettings) return;
  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;

  outMatrix = recycleMatrix(outMatrix, w, h);
  var ctx = new MGraphics(w, h);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, w, h);
  ctx.fill();

  // Close Red Dot
  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "normal");
  ctx.set_font_size(9);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  ctx.move_to(24, 17); ctx.show_text("close");

  // Toggle Hide/Show Pill
  var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(tglX, tglY, tglW, tglH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(1.0);
  ctx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, 3, 3);
  ctx.stroke();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = ctx.text_measure(tglLabel);
  ctx.move_to(tglX + (tglW - tglTm[0]) * 0.5, tglY + 11.5);
  ctx.show_text(tglLabel);

  // Live Mini EQ Preview
  var prevX = 12, prevY = 28;
  var prevW = w - 24;
  var prevH = show_settings_attrs ? 75 : (h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  ctx.save();
  ctx.translate(prevX, prevY);
  draw_eq_canvas(ctx, prevW, prevH, true);
  ctx.restore();

  // Corner Grabber in Compact Finger Mode
  if (!show_settings_attrs) {
    ctx.new_path();
    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    ctx.set_line_width(1.2);
    ctx.move_to(w - 14, h - 4); ctx.line_to(w - 4, h - 14);
    ctx.move_to(w - 9, h - 4);  ctx.line_to(w - 4, h - 9);
    ctx.stroke();
    var imgCompact = new Image(ctx);
    imgCompact.tonamedmatrix(outMatrix.name);
    popupWindow.jit_matrix(outMatrix.name);
    return;
  }

  var divY = prevY + prevH + 8;
  ctx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
  ctx.set_line_width(1.0);
  ctx.move_to(10, divY); ctx.line_to(w - 10, divY); ctx.stroke();

  // MDIAL-STYLE FILTER SELECTOR STRIP ([ALL] + F1..Fn)
  var nextY = divY;
  if (count > 1) {
    var selY = divY + 6, selH = 20, selW = w - 24, selX = 12;
    var allBtnW = 36;
    var remainW = selW - allBtnW - 4;
    var btnCellW = (remainW - (count - 1) * 3) / count;

    var selectColor = attr_slider_color;
    var selectTextColor = [0.10, 0.10, 0.12, 1.0];

    // [ALL] Button
    var isAll = (active_edit_band === -1);
    ctx.set_source_rgba(isAll ? selectColor : attr_bg_color);
    ctx.rectangle_rounded(selX, selY, allBtnW, selH, 3, 3);
    ctx.fill();

    ctx.set_source_rgba(isAll ? selectColor : attr_border_color);
    ctx.set_line_width(isAll ? 1.0 : 0.75);
    ctx.rectangle_rounded(selX + 0.5, selY + 0.5, allBtnW - 1, selH - 1, 3, 3);
    ctx.stroke();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(9);
    ctx.set_source_rgba(isAll ? selectTextColor : attr_text_color);
    var allTm = ctx.text_measure("ALL");
    ctx.move_to(selX + (allBtnW - allTm[0]) * 0.5, selY + 13.5);
    ctx.show_text("ALL");

    // [F1..Fn] Buttons
    var fStartX = selX + allBtnW + 4;
    for (var k = 0; k < count; k++) {
      var bX = fStartX + k * (btnCellW + 3);
      var isFocused = (k === active_edit_band);

      ctx.set_source_rgba(isFocused ? selectColor : attr_bg_color);
      ctx.rectangle_rounded(bX, selY, btnCellW, selH, 3, 3);
      ctx.fill();

      ctx.set_source_rgba(isFocused ? selectColor : attr_border_color);
      ctx.set_line_width(isFocused ? 1.0 : 0.75);
      ctx.rectangle_rounded(bX + 0.5, selY + 0.5, btnCellW - 1, selH - 1, 3, 3);
      ctx.stroke();

      ctx.select_font_face("Arial", "normal", isFocused ? "bold" : "normal");
      ctx.set_font_size(9);
      ctx.set_source_rgba(isFocused ? selectTextColor : attr_text_color);
      var bTxt = "F" + (k + 1);
      var bTm = ctx.text_measure(bTxt);
      ctx.move_to(bX + (btnCellW - bTm[0]) * 0.5, selY + 13.5);
      ctx.show_text(bTxt);
    }
    nextY = selY + selH;
  }

  // 4-Tab Carousel Navigation Bar
  var navY = nextY + 6, navH = 22, navW = w - 24, navX = 12;
  ctx.set_source_rgba(0.08, 0.08, 0.10, 0.85);
  ctx.rectangle_rounded(navX, navY, navW, navH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(1.0);
  ctx.rectangle_rounded(navX + 0.5, navY + 0.5, navW - 1, navH - 1, 3, 3);
  ctx.stroke();

  var btnW = 24;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(navX + 1, navY + 1, btnW, navH - 2, 2, 2);
  ctx.fill();
  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(10);
  ctx.set_source_rgba(attr_text_color);
  ctx.move_to(navX + 9, navY + 15); ctx.show_text("<");

  var rBtnX = navX + navW - btnW - 1;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(rBtnX, navY + 1, btnW, navH - 2, 2, 2);
  ctx.fill();
  ctx.set_source_rgba(attr_text_color);
  ctx.move_to(rBtnX + 9, navY + 15); ctx.show_text(">");

  var tabTitle = mask_tab_names[active_mask_tab];
  var tabTm = ctx.text_measure(tabTitle);
  ctx.set_source_rgba(curve_color);
  ctx.move_to(navX + (navW - tabTm[0]) * 0.5, navY + 15);
  ctx.show_text(tabTitle);

  // Tab Rows
  var rowsStartY = navY + navH + 8;
  var rowW = w - 24, rowX = 12;
  var midX = rowX + rowW * 0.5;
  var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;
  var rows = get_tab_rows();

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], rY = rowsStartY + i * 28;

    ctx.set_source_rgba(attr_bg_color);
    ctx.rectangle(rowX, rY, rowW, 26);
    ctx.fill();

    ctx.select_font_face("Arial", "normal", "normal");
    ctx.set_font_size(10);
    ctx.set_source_rgba(attr_text_color);
    ctx.move_to(rowX + 6, rY + 17);
    ctx.show_text(r.name);

    ctx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    ctx.set_line_width(1.0);
    ctx.move_to(midX, rY + 3); ctx.line_to(midX, rY + 23); ctx.stroke();

    var vY = rY + 4, vH = 18;

    if (r.is_stepper) {
      var arrowW = 20, valW = valBoxW - arrowW * 2;
      ctx.set_source_rgba(0.18, 0.19, 0.22, 1.0);
      ctx.rectangle_rounded(valBoxX, vY, arrowW, vH, 2, 2);
      ctx.rectangle_rounded(valBoxX + valBoxW - arrowW, vY, arrowW, vH, 2, 2);
      ctx.fill();

      ctx.set_source_rgba(attr_text_color); ctx.set_font_size(8);
      ctx.move_to(valBoxX + 6, rY + 16.5); ctx.show_text("◀");
      ctx.move_to(valBoxX + valBoxW - arrowW + 7, rY + 16.5); ctx.show_text("▶");

      ctx.set_source_rgba(0.08, 0.08, 0.10, 0.95);
      ctx.rectangle(valBoxX + arrowW, vY, valW, vH);
      ctx.fill();

      ctx.set_source_rgba(curve_color);
      ctx.select_font_face("Arial", "normal", "bold"); ctx.set_font_size(10);
      var stTm = ctx.text_measure(String(r.val));
      ctx.move_to(valBoxX + arrowW + (valW - stTm[0]) * 0.5, rY + 17);
      ctx.show_text(String(r.val));
    } else if (r.is_color) {
      ctx.set_source_rgba(r.val);
      ctx.rectangle_rounded(valBoxX, vY, valBoxW, vH, 2, 2);
      ctx.fill();
      ctx.set_source_rgba(attr_border_color);
      ctx.set_line_width(1.0);
      ctx.rectangle_rounded(valBoxX, vY, valBoxW, vH, 2, 2);
      ctx.stroke();
    } else if (r.is_slider || r.pct !== undefined) {
      ctx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
      ctx.rectangle(valBoxX, vY, valBoxW, vH);
      ctx.fill();

      var fillW = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
      ctx.set_source_rgba(attr_slider_color);
      ctx.rectangle(valBoxX, vY, fillW, vH);
      ctx.fill();

      ctx.set_source_rgba(attr_border_color);
      ctx.set_line_width(1.0);
      ctx.rectangle(valBoxX, vY, fillW, vH);
      ctx.stroke();

      ctx.set_source_rgba(attr_text_color);
      ctx.set_font_size(10);
      ctx.move_to(valBoxX + 6, rY + 17);
      ctx.show_text(String(r.val));
    } else {
      ctx.set_source_rgba(0.18, 0.18, 0.22, 0.85);
      ctx.rectangle_rounded(valBoxX, vY, valBoxW, vH, 2, 2);
      ctx.fill();
      ctx.set_source_rgba(attr_text_color);
      ctx.move_to(valBoxX + 8, rY + 17);
      ctx.show_text(String(r.val));
    }
  }

  var img = new Image(ctx);
  img.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

// 4 Consolidated Tabs
function get_tab_rows() {
  if (active_mask_tab === 0) {
    // TAB 1: PERFORMANCE
    var rows = [
      { name: "Filter Count", val: count, is_stepper: true, id: 101 }
    ];

    var d = active_edit_band;
    var curTypeIdx = (d === -1) ? band_pool[active_node].type : band_pool[d].type;
    var typeLabel = curTypeIdx + ": " + type_names[curTypeIdx];
    var pfx = (d === -1) ? (count > 1 ? "[ALL] " : "") : ("[F" + (d + 1) + "] ");

    rows.push({ 
      name: pfx + "Topology", 
      val: typeLabel, 
      is_stepper: true, 
      target_id: 106 
    });

    rows.push({ name: "Hold Delay", val: hold_time_ms + " ms", pct: (hold_time_ms - 100) / 400.0, is_slider: true, id: 102 });
    rows.push({ name: "dB Scale Range", val: "+/- " + db_range + " dB", is_toggle: true, id: 103 });
    rows.push({ name: "Show Q Shading", val: show_q_bands ? "ON" : "OFF", is_toggle: true, id: 104 });
    rows.push({ name: "Ghost Curves", val: show_ghost_curves ? "ON" : "OFF", is_toggle: true, id: 105 });
    return rows;

  } else if (active_mask_tab === 1) {
    // TAB 2: GEOMETRY & STYLES (MERGED!)
    return [
      { name: "Curve Thickness", val: curve_thickness.toFixed(1), pct: (curve_thickness - 0.5) / 5.5, is_slider: true, id: 201 },
      { name: "Node Radius", val: handle_radius.toFixed(1), pct: (handle_radius - 2.0) / 10.0, is_slider: true, id: 202 },
      { name: "Grid Brightness", val: Math.round(grid_alpha * 100) + "%", pct: grid_alpha, is_slider: true, id: 203 },
      { name: "Outer Borders", val: borders ? "ON" : "OFF", is_toggle: true, id: 301 },
      { name: "Corner Radius", val: Math.round(border_radius), pct: border_radius / 25.0, is_slider: true, id: 302 },
      { name: "Border Thickness", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, id: 303 },
      { name: "Corner Extension", val: Math.round(border_extension), pct: border_extension / 50.0, is_slider: true, id: 304 }
    ];

  } else {
    // TAB 3: COLORS
    return [
      { name: "Master Curve", val: curve_color, is_color: true, key: "curve_color" },
      { name: "Ghost Curves", val: ghost_color, is_color: true, key: "ghost_color" },
      { name: "Node Handle", val: node_color, is_color: true, key: "node_color" },
      { name: "Active Handle", val: node_active_color, is_color: true, key: "node_active_color" },
      { name: "Q Shading Fill", val: q_shade_color, is_color: true, key: "q_shade_color" },
      { name: "Chassis Background", val: bg_color, is_color: true, key: "bg_color" },
      { name: "Grid Lines", val: grid_color, is_color: true, key: "grid_color" }
    ];
  }
}

function apply_slider_target(target_id, targetPct) {
  if (target_id === 102) set_hold_time_ms(Math.round(100 + targetPct * 400));
  else if (target_id === 201) set_curve_thickness(0.5 + targetPct * 5.5);
  else if (target_id === 202) set_handle_radius(2.0 + targetPct * 10.0);
  else if (target_id === 203) set_grid_alpha(targetPct);
  else if (target_id === 302) set_border_radius(targetPct * 25.0);
  else if (target_id === 303) set_border_thickness(targetPct * 10.0);
  else if (target_id === 304) set_border_extension(targetPct * 50.0);
  redraw_all();
}
// =============================================================
// STEPPER AUTO-REPEAT ENGINE
// =============================================================
var stepper_repeat_task = null;
var stepper_target_id   = -1;
var stepper_dir         = 0;

function step_filter_type(dir) {
  if (active_edit_band === -1) {
    // [ALL] mode: shift all active bands together
    var curT = band_pool[active_node].type;
    var nextT = (curT + dir + 10) % 10;
    for (var bi = 0; bi < count; bi++) {
      band_pool[bi].type = nextT;
    }
  } else {
    // Specific band mode [F1..Fn]
    var curT = band_pool[active_edit_band].type;
    band_pool[active_edit_band].type = (curT + dir + 10) % 10;
  }
  output_coefficients();
  output_active_node();
  redraw_all();
}

function step_stepper_value(target_id, dir) {
  if (target_id === 101) {
    step_filter_count(dir);
  } else if (target_id === 106) {
    step_filter_type(dir);
  }
  draw_popup_inspector();
}

function stop_stepper_repeat() {
  stepper_target_id = -1;
  stepper_dir = 0;
  if (stepper_repeat_task) {
    try { stepper_repeat_task.cancel(); } catch (e) {}
    stepper_repeat_task = null;
  }
}

// Spawns new filter at 1 kHz / 0 dB and auto-focuses it
function step_filter_count(dir) {
  var next_count = clamp(count + dir, 1, max_bands);
  if (next_count !== count) {
    if (next_count > count) {
      // Spawn newly added slot at musical center (1 kHz / 0 dB / Bell)
      var newSlot = next_count - 1;
      band_pool[newSlot] = {
        type: TYPE_BELL,
        freq: 1000.0,
        gain: 0.0,
        q: 1.414,
        enabled: 1
      };
      active_node = newSlot;
      active_edit_band = newSlot;
    } else {
      if (active_node >= next_count) active_node = next_count - 1;
      if (active_edit_band >= next_count) active_edit_band = next_count - 1;
    }
    count = next_count;
    output_channel_count();
    output_coefficients();
    output_active_node();
    update_popup_dimensions();
    redraw_all();
  }
}

function popupWindowCallback(event) {
  if (event.eventname === "close") { 
    showSettings = 0; 
    is_resizing_window = 0; 
    stop_stepper_repeat();
    return; 
  }

  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;
  var pr = cached_preview_rect;

  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = (mbut === 1 && is_mouse_down_anywhere === 0);
    is_mouse_down_anywhere = mbut;

    if (mbut) { 
      lastMouseX = mx; 
      lastMouseY = my; 
    }

    // --- MOUSE UP (RELEASE) ---
    if (mbut === 0) {
      is_resizing_window = 0;
      active_pop_target = -1;
      stop_scrolling();
      stop_stepper_repeat(); // Cancel auto-repeat on release
      handle_graph_up();
      return;
    }

    // --- SLIDER DRAGGING ---
    if (active_pop_target !== -1) {
      var dragPct = clamp((mx - scroll_valBoxX) / scroll_valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_inspector();
      return;
    }

    // --- COMPACT WINDOW RESIZE DRAG ---
    if (is_resizing_window && !show_settings_attrs) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(220, Math.min(start_resize_w + deltaW, 3840));
      popup_mini_h = Math.max(120, Math.min(start_resize_h + deltaH, 2160));
      update_popup_dimensions();
      return;
    }

    // Bottom-Right Corner Grabber
    if (!show_settings_attrs && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx; start_click_y = my;
      start_resize_w = w;  start_resize_h = h;
      return;
    }

    // Red Close Dot
    if (mbut && mx < 35 && my < 26) {
      showSettings = 0; 
      stop_stepper_repeat();
      update_popup_dimensions(); 
      return;
    }

    // Toggle [show] / [hide] Header Button Pill
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      stop_stepper_repeat();
      update_popup_dimensions();
      return;
    }

    // Live Interaction on Floating Preview Canvas
    if (mbut && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      if (is_pop_tap) {
        handle_graph_click(mx - pr.x, my - pr.y, pr.w, pr.h, false);
      } else {
        handle_graph_drag(mx - pr.x, my - pr.y, pr.w, pr.h);
      }
      draw_popup_inspector();
      return;
    }

    if (!show_settings_attrs) return;

    var divY = pr.y + pr.h + 8;
    var nextY = divY;

    // Filter Selection Strip Hit ([ALL] + F1..Fn)
    if (count > 1) {
      var selY = divY + 6, selH = 20, selW = w - 24, selX = 12;
      var allBtnW = 36;
      var remainW = selW - allBtnW - 4;
      var btnCellW = (remainW - (count - 1) * 3) / count;

      if (is_pop_tap && my >= selY && my <= selY + selH && mx >= selX && mx <= selX + selW) {
        if (mx <= selX + allBtnW) {
          active_edit_band = -1; // [ALL]
        } else {
          var fStartX = selX + allBtnW + 4;
          var clickedF = Math.floor((mx - fStartX) / (btnCellW + 3));
          if (clickedF >= 0 && clickedF < count) {
            active_edit_band = clickedF;
            active_node = clickedF;
          }
        }
        draw_popup_inspector();
        return;
      }
      nextY = selY + selH;
    }

    // Carousel Tab Navigation (< and >)
    var navY = nextY + 6, navH = 22, navW = w - 24, navX = 12;
    var btnW = 24, rBtnX = navX + navW - btnW - 1;

    if (is_pop_tap && my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
      if (mx <= navX + btnW + 4) active_mask_tab = (active_mask_tab - 1 + 3) % 3;
      else if (mx >= rBtnX - 4) active_mask_tab = (active_mask_tab + 1) % 3;
      else active_mask_tab = (active_mask_tab + 1) % 3;
      update_popup_dimensions();
      return;
    }

    // --- ATTRIBUTE ROWS CLICK & DRAG DISPATCHER ---
    var rowsStartY = navY + navH + 8;
    if (mx >= 12 && mx <= w - 12 && my >= rowsStartY) {
      var rIdx = Math.floor((my - rowsStartY) / 28);
      var rows = get_tab_rows();
      if (rIdx >= 0 && rIdx < rows.length) {
        var item = rows[rIdx];
        var valX = 12 + (w - 24) * 0.5 + 4;
        var valW = (w - 24) * 0.5 - 8;
        var targetID = item.target_id || item.id;

        // 1. INLINE STEPPERS (Filter Count, Topology) WITH CLICK-AND-HOLD AUTO-REPEAT
        if (item.is_stepper && mx >= valX) {
          var arrowW = 20;
          if (is_pop_tap) {
            if (mx <= valX + arrowW) {
              step_stepper_value(targetID, -1);
              stepper_target_id = targetID;
              stepper_dir = -1;
            } else if (mx >= valX + valW - arrowW && mx <= valX + valW) {
              step_stepper_value(targetID, 1);
              stepper_target_id = targetID;
              stepper_dir = 1;
            }

            // Start auto-repeat if arrow held down
            if (stepper_dir !== 0 && !stepper_repeat_task) {
              stepper_repeat_task = new Task(function () {
                if (stepper_target_id !== -1 && is_mouse_down_anywhere) {
                  step_stepper_value(stepper_target_id, stepper_dir);
                  if (stepper_repeat_task) stepper_repeat_task.schedule(80); // Fast continuous repeat
                } else {
                  stop_stepper_repeat();
                }
              }, this);
              stepper_repeat_task.schedule(350); // Initial hold delay before repeating
            }
          }
          return;
        }

        // 2. SLIDERS (Hold Delay, Thickness, Radius, Alpha, Borders, etc.)
        if (item.is_slider || item.pct !== undefined) {
          active_pop_target = targetID;
          scroll_valBoxX = valX;
          scroll_valBoxW = valW;
          var pct = clamp((mx - valX) / valW, 0, 1);
          apply_slider_target(targetID, pct);
          if (scrollTask) scrollTask.repeat();
          return;
        }

        // 3. COLOR TILES (HSV Color Picker)
        if (item.is_color && mx >= valX) {
          active_color_target = item.key;
          showColorWindow = 1;
          colorWindow.visible = 1;
          colorWindow.front();
          draw_color_picker();
          return;
        }

        // 4. TOGGLE BUTTONS
        if (is_pop_tap) {
          if (targetID === 103) {
            db_range = db_range === 24 ? 30 : (db_range === 30 ? 12 : 24);
            redraw_all();
          } else if (targetID === 104) {
            show_q_bands = !show_q_bands;
            redraw_all();
          } else if (targetID === 105) {
            show_ghost_curves = !show_ghost_curves;
            redraw_all();
          } else if (targetID === 301) {
            borders = !borders;
            redraw_all();
          }
        }
      }
    }
  }
}

// =============================================================
// 8. HSV COLOR PICKER (WITH OPACITY SLIDER BAR)
// =============================================================
function draw_color_picker() {
  if (!colorWindow || !showColorWindow) return;
  var winW = 200, winH = 240;
  colorMatrix.dim = [winW, winH];
  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(text_color);
  ctx.move_to(28, 17); ctx.show_text("Color Picker");

  // 1. Hue Bar
  var hPat = ctx.pattern_create_linear(10, 0, 190, 0);
  hPat.add_color_stop_rgba(0.00, 1, 0, 0, 1); hPat.add_color_stop_rgba(0.17, 1, 1, 0, 1);
  hPat.add_color_stop_rgba(0.33, 0, 1, 0, 1); hPat.add_color_stop_rgba(0.50, 0, 1, 1, 1);
  hPat.add_color_stop_rgba(0.67, 0, 0, 1, 1); hPat.add_color_stop_rgba(0.83, 1, 0, 1, 1);
  hPat.add_color_stop_rgba(1.00, 1, 0, 0, 1);
  ctx.set_source(hPat);
  ctx.rectangle_rounded(10, 28, 180, 16, 3, 3);
  ctx.fill();

  var hIndX = 10 + cur_h * 180;
  ctx.set_source_rgba(1, 1, 1, 1);
  ctx.set_line_width(1.5);
  ctx.arc(hIndX, 28 + 8, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // 2. SV Box
  var rgbPure = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(rgbPure[0], rgbPure[1], rgbPure[2], 1.0);
  ctx.rectangle_rounded(10, 50, 180, 115, 3, 3);
  ctx.fill();

  var sPat = ctx.pattern_create_linear(10, 0, 190, 0);
  sPat.add_color_stop_rgba(0.0, 1, 1, 1, 1); sPat.add_color_stop_rgba(1.0, 1, 1, 1, 0);
  ctx.set_source(sPat);
  ctx.rectangle_rounded(10, 50, 180, 115, 3, 3);
  ctx.fill();

  var vPat = ctx.pattern_create_linear(0, 50, 0, 165);
  vPat.add_color_stop_rgba(0.0, 0, 0, 0, 0); vPat.add_color_stop_rgba(1.0, 0, 0, 0, 1);
  ctx.set_source(vPat);
  ctx.rectangle_rounded(10, 50, 180, 115, 3, 3);
  ctx.fill();

  var svIndX = 10 + cur_s * 180;
  var svIndY = 50 + (1.0 - cur_v) * 115;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Opacity Slider Bar
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

  // 4. Color Swatch & Opacity Readout
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

function colorWindowCallback(event) {
  if (event.eventname === "close") { showColorWindow = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { picker_drag_zone = 0; return; }

    if (mbut) {
      if (mx < 24 && my < 24) { showColorWindow = 0; colorWindow.visible = 0; return; }
      if (picker_drag_zone === 0) {
        if (my >= 28 && my <= 46) picker_drag_zone = 1;
        else if (my >= 50 && my <= 165) picker_drag_zone = 2;
        else if (my >= 170 && my <= 190) picker_drag_zone = 3;
      }

      if (picker_drag_zone === 1) cur_h = clamp((mx - 10) / 180, 0.0, 1.0);
      else if (picker_drag_zone === 2) {
        cur_s = clamp((mx - 10) / 180, 0.0, 1.0);
        cur_v = clamp(1.0 - (my - 50) / 115, 0.0, 1.0);
      } else if (picker_drag_zone === 3) {
        cur_a = clamp((mx - 10) / 180, 0.0, 1.0);
      }

      var rgb = hsvToRgb(cur_h, cur_s, cur_v);
      if (active_color_target === "curve_color") curve_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "ghost_color") ghost_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "node_color") node_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "node_active_color") node_active_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "q_shade_color") q_shade_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "bg_color") bg_color = [rgb[0], rgb[1], rgb[2], cur_a];
      else if (active_color_target === "grid_color") grid_color = [rgb[0], rgb[1], rgb[2], cur_a];

      redraw_all();
      draw_color_picker();
    }
  }
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

// =============================================================
// 9. MASTER THEME BUS SYNC
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
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
  return [r, g, b, a];
}

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
    if ((col = resolve_color(initDict, ["highlight_color", "accent_color", "bar_color"]))) curve_color = rgba_values(col, curve_color);

    // Master Popup Theme Keys
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
    if ((col = resolve_color(theme, ["highlight_color", "accent_color", "bar_color"]))) curve_color = rgba_values(col, curve_color);

    // Master Popup Theme Keys
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
if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
else loadThemeFromDict();

// =============================================================
// 10. ATTRIBUTES, PERSISTENCE & TOUCH.STATUS PRESET HOOKS
// =============================================================
function set_curve_thickness(v) { curve_thickness = Math.max(0.5, parseFloat(v) || 2.0); redraw_all(); }
function get_curve_thickness() { return curve_thickness; }

function set_handle_radius(v)   { handle_radius = Math.max(2.0, parseFloat(v) || 8.5); redraw_all(); }
function get_handle_radius() { return handle_radius; }

function set_grid_alpha(v)      { grid_alpha = clamp(parseFloat(v) || 0.40, 0.0, 1.0); redraw_all(); }
function get_grid_alpha() { return grid_alpha; }

function set_hold_time_ms(v)    { hold_time_ms = clamp(parseInt(v, 10) || 250, 100, 600); }
function get_hold_time_ms() { return hold_time_ms; }

function set_borders(v) { borders = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_borders() { return borders; }

function set_border_radius(v)    { border_radius = Math.max(0.0, parseFloat(v) || 0.0); redraw_all(); }
function get_border_radius() { return border_radius; }

function set_border_thickness(v) { border_thickness = Math.max(0.0, parseFloat(v) || 0.0); redraw_all(); }
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) { border_extension = Math.max(0.0, parseFloat(v) || 0.0); redraw_all(); }
function get_border_extension() { return border_extension; }

function set_count(v) { step_filter_count((parseInt(v, 10) || 1) - count); }
function get_count() { return count; }

function set_db_range(v) { var p = parseFloat(v); if (!isNaN(p)) db_range = clamp(p, 6.0, 48.0); redraw_all(); }
function get_db_range() { return db_range; }

function set_show_q_bands(v) { show_q_bands = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_q_bands() { return show_q_bands; }

function set_show_ghost_curves(v) { show_ghost_curves = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_ghost_curves() { return show_ghost_curves; }

function set_show_hud(v) { show_hud = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_show_hud() { return show_hud; }

function set_bg_color() { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color() { return bg_color; }

function set_curve_color() { curve_color = rgba_values(arguments, curve_color); redraw_all(); }
function get_curve_color() { return curve_color; }

function set_ghost_color() { ghost_color = rgba_values(arguments, ghost_color); redraw_all(); }
function get_ghost_color() { return ghost_color; }

function set_node_color() { node_color = rgba_values(arguments, node_color); redraw_all(); }
function get_node_color() { return node_color; }

function set_node_active_color() { node_active_color = rgba_values(arguments, node_active_color); redraw_all(); }
function get_node_active_color() { return node_active_color; }

function set_q_shade_color() { q_shade_color = rgba_values(arguments, q_shade_color); redraw_all(); }
function get_q_shade_color() { return q_shade_color; }

function set_border_color() { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color() { return border_color; }

function set_grid_color() { grid_color = rgba_values(arguments, grid_color); redraw_all(); }
function get_grid_color() { return grid_color; }

function set_pop_bgcolor() { pop_bgcolor = rgba_values(arguments, pop_bgcolor); redraw_all(); }
function get_pop_bgcolor() { return pop_bgcolor; }
// --- ATTRUI EXPOSURES FOR ACTIVE FILTER ---
function set_topology(v) {
  var t = parseInt(v, 10);
  if (!isNaN(t) && t >= 0 && t <= 9) {
    if (active_edit_band === -1) {
      for (var bi = 0; bi < count; bi++) band_pool[bi].type = t;
    } else {
      band_pool[active_edit_band].type = t;
    }
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}
function get_topology() {
  var idx = (active_edit_band === -1) ? active_node : active_edit_band;
  return band_pool[idx].type;
}

function set_frequency(v) {
  var f = parseFloat(v);
  if (!isNaN(f)) {
    var idx = (active_edit_band === -1) ? active_node : active_edit_band;
    band_pool[idx].freq = clamp(f, MIN_FREQ, MAX_FREQ);
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}
function get_frequency() {
  var idx = (active_edit_band === -1) ? active_node : active_edit_band;
  return band_pool[idx].freq;
}

function set_gain(v) {
  var g = parseFloat(v);
  if (!isNaN(g)) {
    var idx = (active_edit_band === -1) ? active_node : active_edit_band;
    band_pool[idx].gain = clamp(g, -db_range, db_range);
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}
function get_gain() {
  var idx = (active_edit_band === -1) ? active_node : active_edit_band;
  return band_pool[idx].gain;
}

function set_q(v) {
  var qVal = parseFloat(v);
  if (!isNaN(qVal)) {
    var idx = (active_edit_band === -1) ? active_node : active_edit_band;
    band_pool[idx].q = clamp(qVal, MIN_Q, MAX_Q);
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}
function get_q() {
  var idx = (active_edit_band === -1) ? active_node : active_edit_band;
  return band_pool[idx].q;
}

function set_band_state(idx, f, g, q, t, e) {
  if (idx >= 0 && idx < max_bands) {
    band_pool[idx] = {
      freq: parseFloat(f),
      gain: parseFloat(g),
      q: parseFloat(q),
      type: parseInt(t, 10),
      enabled: parseInt(e, 10) ? 1 : 0
    };
  }
}

// =============================================================
// TOUCH.STATUS / STATUSMINI PRESET SERIALIZATION HOOKS
// =============================================================
function get_state() {
  var bList = [];
  for (var i = 0; i < count; i++) {
    var b = band_pool[i];
    bList.push({
      freq: b.freq,
      gain: b.gain,
      q: b.q,
      type: b.type,
      enabled: b.enabled
    });
  }
  return {
    count: count,
    db_range: db_range,
    bands: bList
  };
}

function set_state(d) {
  if (typeof d === "object" && d !== null) {
    if (d.db_range !== undefined) db_range = clamp(parseFloat(d.db_range), 6.0, 48.0);
    if (d.count !== undefined) count = clamp(parseInt(d.count, 10), 1, max_bands);

    if (Array.isArray(d.bands)) {
      for (var i = 0; i < d.bands.length && i < max_bands; i++) {
        var bd = d.bands[i];
        band_pool[i] = {
          freq: parseFloat(bd.freq),
          gain: parseFloat(bd.gain),
          q: parseFloat(bd.q),
          type: parseInt(bd.type, 10),
          enabled: bd.enabled !== undefined ? (parseInt(bd.enabled, 10) ? 1 : 0) : 1
        };
      }
    }
    output_channel_count();
    output_coefficients();
    output_active_node();
    update_popup_dimensions();
    redraw_all();
  }
}

function morph_state(a, b, frac) {
  var stateA = (typeof a === "object" && a !== null) ? a : {};
  var stateB = (typeof b === "object" && b !== null) ? b : {};

  var bandsA = Array.isArray(stateA.bands) ? stateA.bands : [];
  var bandsB = Array.isArray(stateB.bands) ? stateB.bands : [];

  var targetCount = (frac >= 0.5) ? (stateB.count || count) : (stateA.count || count);
  count = clamp(parseInt(targetCount, 10), 1, max_bands);

  for (var i = 0; i < count; i++) {
    var ba = bandsA[i] || band_pool[i];
    var bb = bandsB[i] || band_pool[i];

    // Logarithmic crossfade for Frequency
    var logA = Math.log10(ba.freq / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ);
    var logB = Math.log10(bb.freq / MIN_FREQ) / Math.log10(MAX_FREQ / MIN_FREQ);
    var logMorph = logA + (logB - logA) * frac;
    band_pool[i].freq = clamp(MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, logMorph), MIN_FREQ, MAX_FREQ);

    // Linear morph for Gain and Q
    band_pool[i].gain = ba.gain + (bb.gain - ba.gain) * frac;
    band_pool[i].q    = ba.q + (bb.q - ba.q) * frac;

    // Discrete switch for Topology at 50%
    band_pool[i].type = (frac >= 0.5) ? bb.type : ba.type;
  }

  output_channel_count();
  output_coefficients();
  output_active_node();
  redraw_all();
}

// Pattr Support
function getvalueof() {
  var out = [];
  for (var i = 0; i < count; i++) {
    out.push(band_pool[i].freq, band_pool[i].gain, band_pool[i].q, band_pool[i].type);
  }
  return out;
}

function setvalueof() {
  var args = arrayfromargs(arguments);
  if (args.length >= 4) {
    var num = Math.min(max_bands, Math.floor(args.length / 4));
    count = num;
    for (var i = 0; i < num; i++) {
      band_pool[i].freq = parseFloat(args[i * 4]);
      band_pool[i].gain = parseFloat(args[i * 4 + 1]);
      band_pool[i].q    = parseFloat(args[i * 4 + 2]);
      band_pool[i].type = parseInt(args[i * 4 + 3], 10);
      band_pool[i].enabled = 1;
    }
    output_channel_count();
    output_coefficients();
    output_active_node();
    redraw_all();
  }
}

// Patcher Save & Session Persistence
function save() {
  embedmessage("set_count", count);
  embedmessage("set_db_range", db_range);
  embedmessage("set_hold_time_ms", hold_time_ms);
  embedmessage("set_show_q_bands", show_q_bands);
  embedmessage("set_show_ghost_curves", show_ghost_curves);
  embedmessage("set_show_hud", show_hud);

  embedmessage("set_borders", borders);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_curve_thickness", curve_thickness);
  embedmessage("set_handle_radius", handle_radius);
  embedmessage("set_grid_alpha", grid_alpha);

  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_curve_color", curve_color[0], curve_color[1], curve_color[2], curve_color[3]);
  embedmessage("set_ghost_color", ghost_color[0], ghost_color[1], ghost_color[2], ghost_color[3]);
  embedmessage("set_node_color", node_color[0], node_color[1], node_color[2], node_color[3]);
  embedmessage("set_node_active_color", node_active_color[0], node_active_color[1], node_active_color[2], node_active_color[3]);
  embedmessage("set_q_shade_color", q_shade_color[0], q_shade_color[1], q_shade_color[2], q_shade_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);

  // Persist all 8 slots in the band pool
  for (var s = 0; s < max_bands; s++) {
    var b = band_pool[s];
    embedmessage("set_band_state", s, b.freq, b.gain, b.q, b.type, b.enabled);
  }
}


// =============================================================
// 11. MAX DECLAREATTRIBUTE DEFINITIONS (ALL EMBED: 1)
// =============================================================
declareattribute("count", { type: "int", label: "Filter Bands", setter: "set_count", getter: "get_count", category: "Performance", min: 1, max: 8, embed: 1 });
declareattribute("db_range", { type: "float", label: "+/- dB Display Scale", setter: "set_db_range", getter: "get_db_range", category: "Performance", min: 6.0, max: 48.0, embed: 1 });
declareattribute("hold_time_ms", { type: "int", label: "Hold Delay (ms)", setter: "set_hold_time_ms", getter: "get_hold_time_ms", category: "Performance", min: 100, max: 600, embed: 1 });
declareattribute("show_q_bands", { type: "int", style: "onoff", label: "Show Q Bandwidth Halos", setter: "set_show_q_bands", getter: "get_show_q_bands", category: "Performance", embed: 1 });
declareattribute("show_ghost_curves", { type: "int", style: "onoff", label: "Show Ghost Isolines", setter: "set_show_ghost_curves", getter: "get_show_ghost_curves", category: "Performance", embed: 1 });
declareattribute("show_hud", { type: "int", style: "onoff", label: "Show Heads-Up Display", setter: "set_show_hud", getter: "get_show_hud", category: "Performance", embed: 1 });

declareattribute("curve_thickness", { type: "float", label: "Curve Line Thickness", setter: "set_curve_thickness", getter: "get_curve_thickness", category: "Geometry", min: 0.5, max: 6.0, embed: 1 });
declareattribute("handle_radius", { type: "float", label: "Node Handle Radius", setter: "set_handle_radius", getter: "get_handle_radius", category: "Geometry", min: 2.0, max: 12.0, embed: 1 });
declareattribute("grid_alpha", { type: "float", label: "Grid Line Alpha", setter: "set_grid_alpha", getter: "get_grid_alpha", category: "Geometry", min: 0.0, max: 1.0, embed: 1 });

declareattribute("borders", { type: "int", style: "onoff", label: "Show Outer Borders", setter: "set_borders", getter: "get_borders", category: "Styles", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Styles", min: 0.0, max: 25.0, embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Styles", min: 0.0, max: 10.0, embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Styles", min: 0.0, max: 50.0, embed: 1 });

declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Colors", embed: 1 });
declareattribute("curve_color", { type: "rgba", style: "rgba", label: "Master Curve Color", setter: "set_curve_color", getter: "get_curve_color", category: "Colors", embed: 1 });
declareattribute("ghost_color", { type: "rgba", style: "rgba", label: "Ghost Curve Color", setter: "set_ghost_color", getter: "get_ghost_color", category: "Colors", embed: 1 });
declareattribute("node_color", { type: "rgba", style: "rgba", label: "Node Handle Color", setter: "set_node_color", getter: "get_node_color", category: "Colors", embed: 1 });
declareattribute("node_active_color", { type: "rgba", style: "rgba", label: "Active Handle Color", setter: "set_node_active_color", getter: "get_node_active_color", category: "Colors", embed: 1 });
declareattribute("q_shade_color", { type: "rgba", style: "rgba", label: "Q Bandwidth Fill", setter: "set_q_shade_color", getter: "get_q_shade_color", category: "Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Colors", embed: 1 });
declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
// --- POPULATES NATIVE DROPDOWN IN ATTRUI ---
declareattribute("topology", {
  type: "int",
  style: "enumindex",
  enumvals: [
    "display", "lowpass", "highpass", "bandpass", "bandstop",
    "peaknotch", "lowshelf", "highshelf", "resonant", "allpass"
  ],
  label: "Active Filter Topology",
  setter: "set_topology",
  getter: "get_topology",
  category: "Performance",
  embed: 1
});

declareattribute("frequency", {
  type: "float",
  label: "Active Frequency (Hz)",
  setter: "set_frequency",
  getter: "get_frequency",
  category: "Performance",
  min: 20.0,
  max: 20000.0,
  embed: 1
});

declareattribute("gain", {
  type: "float",
  label: "Active Gain (dB)",
  setter: "set_gain",
  getter: "get_gain",
  category: "Performance",
  min: -48.0,
  max: 48.0,
  embed: 1
});

declareattribute("q", {
  type: "float",
  label: "Active Bandwidth (Q)",
  setter: "set_q",
  getter: "get_q",
  category: "Performance",
  min: 0.1,
  max: 18.0,
  embed: 1
});
// =============================================================
// 12. LIFECYCLE DESTRUCTION & LOAD SEQUENCE
// =============================================================
function loadbang() {
  loadThemeFromDict();
  if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
  output_channel_count();
  output_coefficients();
  output_active_node();
  redraw_all();
  new Task(function() { is_initializing = false; }, this).schedule(100);
}

function notifydeleted() {
  cancel_pause_timer();
  stop_scrolling();
  try {
    if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) {
      delete themeBus.subscribers[uniqueID];
    }
    if (popupWindow) popupWindow.free();
    if (colorWindow) colorWindow.free();
    if (outMatrix) outMatrix.freepeer();
    if (colorMatrix) colorMatrix.freepeer();
  } catch (e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}

  popupWindow = null;
  colorWindow = null;
  outMatrix = null;
  colorMatrix = null;
}