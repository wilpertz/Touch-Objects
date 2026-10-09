// ============================================================================
// touch.surroundviewer.js - Ultra-lightweight Dual Ortho Monitor for Max 9 (v8ui)
// Self-contained spatial monitor with Full-Featured Floating Inspector
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 1;
setinletassist(0, "OSC messages from controllers / trajectories");
setoutletassist(0, "Resolved OSC to spat5.oper / spat5.spat~");

var uniqueID = Math.floor(Math.random() * 1000000);

function clamp(v, mn, mx) {
  return Math.max(mn, Math.min(mx, v));
}

// --- Storage Data ---
var sources  = {};  // { id: { x, y, z, az, el, d } }
var speakers = {};  // { id: { x, y, z, az, el, d } }

// --- View Settings ---
var num_speakers     = 4;
var num_sources      = 20;
var num_rings        = 3;      // Concentric rings (1..6)
var redraw_fps       = 30;     // GUI refresh rate limit
var DEFAULT_SPK_DIST = 2.0;    // Default speaker ring radius (meters)
var DEFAULT_SRC_DIST = 2.0;    // Default source ring radius (meters)

// Zoom state calibrated to metric curve:
var current_zoom = 58.0;
var ring_step_m  = 1.34;

function compute_zoom(val) {
  if (hud_zoom_lock) return;
  current_zoom = Math.max(5.0, parseFloat(val) || 58.0);
  var denom = 0.01755 * current_zoom - 0.2673;
  if (denom <= 0.001) denom = 0.001;
  ring_step_m = 1.0 / denom;
}
compute_zoom(current_zoom);

// --- TAB 1: STRUCTURE STATE ---
var hud_grid_mode       = 1;   // 0 = None, 1 = Circular, 2 = Cartesian
var hud_display_mode    = 1;   // 0 = Single (Top), 1 = Left/Right (Dual), 2 = Top/Bottom
var hud_zoom_lock       = 0;   // 0 = Off, 1 = On
var hud_sources_visible = 1;   // 0 = Off, 1 = On
var hud_sources_edit    = 1;   // 0 = Off, 1 = On
var hud_emphasis_pct    = 100; // 0..100%
var hud_speakers_vis    = 1;   // 0 = Off, 1 = On
var hud_speaker_shape   = 0;   // 0 = Square, 1 = Circle

// --- TAB 2: STYLES STATE ---
var show_borders     = 1;      // 1 = ON by default
var show_background  = 1;      // 1 = ON
var border_radius    = 0.0;    // Corner radius
var border_thickness = 1.2;    // Border stroke
var border_extension = 6.0;    // Corner bracket extension
var speaker_size     = 13.0;   // Speaker badge size
var source_size      = 7.5;    // Source node radius
var show_scale_bar   = 1;      // 0 = Off, 1 = On

// --- TAB 3: COLORS (SYNCHRONIZED WITH THEME BUS) ---
var col_bg          = [0.12, 0.12, 0.14, 1.0];
var border_color    = [0.42, 0.42, 0.48, 1.0];
var col_ring        = [0.22, 0.22, 0.26, 1.0];
var col_axis        = [0.85, 0.85, 0.88, 0.9];
var col_text        = [0.92, 0.94, 0.98, 1.0];
var col_mode        = [0.85, 0.85, 0.90, 1.0];
var col_listener    = [0.55, 0.55, 0.58, 1.0];
var col_spk_bg      = [0.10, 0.10, 0.12, 1.0];
var col_spk_border  = [0.42, 0.42, 0.48, 1.0];
var col_src_bg      = [1.00, 1.00, 1.00, 1.0];
var col_src_border  = [0.10, 0.10, 0.12, 0.9];
var popup_dot_color = [1.00, 0.00, 0.00, 1.0];
var pop_bgcolor     = [0.10, 0.10, 0.12, 1.0];

// Themed Popup Inspector Chrome Colors
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

// Inspector Window & Carousel State
var showSettings        = 0;
var allow_popup         = 1;
var show_settings_attrs = 1;
var active_mask_tab     = 0; // 0 = Structure, 1 = Styles, 2 = Colors
var mask_tab_names      = ["1. Structure", "2. Styles", "3. Colors"];
var popup_window_width  = 280;
var popup_mini_w        = 240;
var popup_mini_h        = 160;
var start_resize_w      = 240;
var start_resize_h      = 160;
var is_resizing_window  = 0;
var is_dragging_window  = 0;

var active_pop_target   = -1;
var active_color_target = "col_src_bg";
var picker_drag_zone    = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

var start_click_x  = 0;
var start_click_y  = 0;
var start_cursor_x = 0;
var start_cursor_y = 0;
var start_win_x    = 0;
var start_win_y    = 0;

// Sub-Window Handles & Matrix Buffers
var popupWindow    = null;
var colorWindow    = null;
var outMatrix      = null;
var colorMatrix    = null;
var windowListener = null;
var colorListener  = null;

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 80 };

// --- Framerate Throttling Task ---
var render_needed = false;
var render_task = new Task(function() {
  if (render_needed) {
    render_needed = false;
    mgraphics.redraw();
    if (showSettings && popupWindow && popupWindow.visible) {
      draw_popup_to_window();
    }
  }
}, this);
render_task.interval = Math.round(1000 / redraw_fps);
render_task.repeat();

function queue_draw() {
  render_needed = true;
}

// ============================================================================
// DOWNSTREAM OSC DISPATCH (OUTLET 0)
// ============================================================================
function emit_source_xyz(id) {
  var s = sources[id];
  if (s) {
    outlet(0, "/source/" + id + "/xyz", [s.x, s.y, s.z]);
  }
}

function emit_speaker_xyz(id) {
  var sp = speakers[id];
  if (sp) {
    outlet(0, "/speaker/" + id + "/xyz", [sp.x, sp.y, sp.z]);
  }
}

// ============================================================================
// COORDINATE MATH HELPERS
// ============================================================================
function ensure_source_exists(id) {
  if (!sources[id]) {
    sources[id] = { x: 0, y: DEFAULT_SRC_DIST, z: 0, az: 0, el: 0, d: DEFAULT_SRC_DIST };
  }
}

function ensure_speaker_exists(id) {
  if (!speakers[id]) {
    speakers[id] = { x: 0, y: DEFAULT_SPK_DIST, z: 0, az: 0, el: 0, d: DEFAULT_SPK_DIST };
  }
}

function recompute_xyz_from_aed(obj) {
  var azRad = (obj.az * Math.PI) / 180.0;
  var elRad = (obj.el * Math.PI) / 180.0;
  var d = obj.d;

  obj.x = +(d * Math.cos(elRad) * Math.sin(azRad)).toFixed(4);
  obj.y = +(d * Math.cos(elRad) * Math.cos(azRad)).toFixed(4);
  obj.z = +(d * Math.sin(elRad)).toFixed(4);
}

function recompute_aed_from_xyz(obj) {
  obj.d = +Math.sqrt(obj.x * obj.x + obj.y * obj.y + obj.z * obj.z).toFixed(4);
  var horiz_d = Math.sqrt(obj.x * obj.x + obj.y * obj.y);
  obj.el = +(Math.atan2(obj.z, horiz_d) * 180.0 / Math.PI).toFixed(2);
  var az = (Math.atan2(obj.x, obj.y) * 180.0 / Math.PI);
  if (az > 180.0) az -= 360.0;
  if (az <= -180.0) az += 360.0;
  obj.az = +az.toFixed(2);
}

function apply_compound_coords(obj, format, args) {
  var a = parseFloat(args[0]) || 0;
  var b = parseFloat(args[1]) || 0;
  var c = parseFloat(args[2]) || 0;

  switch (format) {
    case "xyz":
      obj.x = a; obj.y = b; obj.z = c;
      recompute_aed_from_xyz(obj);
      break;
    case "xy":
      obj.x = a; obj.y = b; obj.z = 0.0;
      recompute_aed_from_xyz(obj);
      break;
    case "xy_":
      obj.x = a; obj.y = b;
      recompute_aed_from_xyz(obj);
      break;
    case "aed":
      obj.az = a; obj.el = b; obj.d = c;
      recompute_xyz_from_aed(obj);
      break;
    case "ade":
      obj.az = a; obj.d = b; obj.el = c;
      recompute_xyz_from_aed(obj);
      break;
    case "ad":
      obj.az = a; obj.d = b; obj.el = 0.0;
      recompute_xyz_from_aed(obj);
      break;
    case "ae":
      obj.az = a; obj.el = b; obj.d = 1.0;
      recompute_xyz_from_aed(obj);
      break;
    case "azimdist":
      obj.az = a; obj.d = b;
      recompute_xyz_from_aed(obj);
      break;
    case "azimelev":
      obj.az = a; obj.el = b;
      recompute_xyz_from_aed(obj);
      break;
  }
}

// ============================================================================
// DEFAULT POSITION GENERATORS
// ============================================================================
function get_speaker_azim(idx, total) {
  if (total === 1) return 0.0;
  if (total === 2) return (idx === 1) ? -30.0 : 30.0;
  if (total === 4) {
    var quad = [-45.0, 45.0, 135.0, -135.0];
    return quad[idx - 1];
  }
  var step = 360.0 / total;
  return -180.0 + (idx - 0.5) * step;
}

function populate_default_speakers(count) {
  num_speakers = count;
  for (var k in speakers) {
    if (parseInt(k, 10) > count) delete speakers[k];
  }
  for (var i = 1; i <= count; i++) {
    if (!speakers[i]) {
      var azim = get_speaker_azim(i, count);
      speakers[i] = { az: azim, el: 0.0, d: DEFAULT_SPK_DIST };
      recompute_xyz_from_aed(speakers[i]);
    }
  }
}

function populate_default_sources(count) {
  num_sources = count;
  for (var s in sources) {
    if (parseInt(s, 10) > count) delete sources[s];
  }
  for (var j = 1; j <= count; j++) {
    if (!sources[j]) {
      var azimSrc = (j === 1) ? 0.0 : ((j - 1) * (360.0 / count));
      if (azimSrc > 180.0) azimSrc -= 360.0;
      sources[j] = { az: azimSrc, el: 0.0, d: DEFAULT_SRC_DIST };
      recompute_xyz_from_aed(sources[j]);
    }
  }
}

populate_default_speakers(num_speakers);
populate_default_sources(num_sources);

// ============================================================================
// OSC PARSER & INPUT / OUTPUT HANDLERS
// ============================================================================
function anything() {
  var msg = messagename.trim();
  var args = arrayfromargs(arguments);

  // --- 0. DISMISS SPAT5 BINARY BUNDLES IMMEDIATELY ---
  if (msg === "FullPacket") {
    return;
  }

  if (msg === "update" || msg === "theme_update" || msg === "refresh" || msg === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    else loadThemeFromDict();
    return;
  }

  // --- 1. COUNTS ---
  if (msg === "/speaker/number" || msg === "/speakers/number" || 
     ((msg === "/speaker" || msg === "/speakers") && args[0] === "number")) {
    var spkCount = (args[0] === "number") ? parseInt(args[1], 10) : parseInt(args[0], 10);
    populate_default_speakers(spkCount || 4);
    outlet(0, "/speaker/number", [num_speakers]);
    queue_draw();
    return;
  }

  if (msg === "/source/number" || msg === "/sources/number" || 
     ((msg === "/source" || msg === "/sources") && args[0] === "number")) {
    var srcCount = (args[0] === "number") ? parseInt(args[1], 10) : parseInt(args[0], 10);
    populate_default_sources(srcCount || 20);
    outlet(0, "/source/number", [num_sources]);
    queue_draw();
    return;
  }

  // --- 2. BULK COORDINATES ---
  if (msg === "/speakers/xyz" || msg === "speakers/xyz") {
    var spkCountBulk = Math.floor(args.length / 3);
    for (var i = 0; i < spkCountBulk; i++) {
      ensure_speaker_exists(i + 1);
      apply_compound_coords(speakers[i + 1], "xyz", [args[i*3], args[i*3+1], args[i*3+2]]);
    }
    outlet(0, "/speakers/xyz", args);
    queue_draw();
    return;
  }

  if (msg === "/sources/xyz" || msg === "sources/xyz") {
    var srcCountBulk = Math.floor(args.length / 3);
    for (var j = 0; j < srcCountBulk; j++) {
      ensure_source_exists(j + 1);
      apply_compound_coords(sources[j + 1], "xyz", [args[j*3], args[j*3+1], args[j*3+2]]);
    }
    outlet(0, "/sources/xyz", args);
    queue_draw();
    return;
  }

  if (msg === "/sources/xy" || msg === "sources/xy") {
    var countXY = Math.floor(args.length / 2);
    for (var k = 0; k < countXY; k++) {
      ensure_source_exists(k + 1);
      apply_compound_coords(sources[k + 1], "xy", [args[k*2], args[k*2+1]]);
      emit_source_xyz(k + 1);
    }
    queue_draw();
    return;
  }

  if (msg === "/sources/az" || msg === "sources/az") {
    for (var m = 0; m < args.length; m++) {
      ensure_source_exists(m + 1);
      sources[m + 1].az = parseFloat(args[m]) || 0;
      recompute_xyz_from_aed(sources[m + 1]);
      emit_source_xyz(m + 1);
    }
    queue_draw();
    return;
  }

  // --- 3. COMPOUND COORDINATES ---
  var compoundMatch = msg.match(/^\/?(source|speaker)\/(\d+)\/(xyz|xy_|xy|aed|ade|azimelev|azimdist|ae|ad)$/);
  if (compoundMatch) {
    var targetType = compoundMatch[1];
    var targetId   = parseInt(compoundMatch[2], 10);
    var coordMode  = compoundMatch[3];

    if (targetType === "source") {
      ensure_source_exists(targetId);
      apply_compound_coords(sources[targetId], coordMode, args);
      emit_source_xyz(targetId);
    } else {
      ensure_speaker_exists(targetId);
      apply_compound_coords(speakers[targetId], coordMode, args);
      emit_speaker_xyz(targetId);
    }
    queue_draw();
    return;
  }

  // --- 4. DISCRETE PARAMETERS ---
  var paramMatch = msg.match(/^\/?(source|speaker)\/(\d+)\/(azim|azimuth|az|elev|elevation|el|dist|distance|x|y|z)$/);
  if (paramMatch && args.length > 0) {
    var entityType = paramMatch[1];
    var entityId   = parseInt(paramMatch[2], 10);
    var param      = paramMatch[3];
    var val        = parseFloat(args[0]) || 0;

    var entity = (entityType === "source") ? (ensure_source_exists(entityId), sources[entityId])
                                           : (ensure_speaker_exists(entityId), speakers[entityId]);

    if (param === "azim" || param === "azimuth" || param === "az") {
      entity.az = val;
      recompute_xyz_from_aed(entity);
    } else if (param === "elev" || param === "elevation" || param === "el") {
      entity.el = val;
      recompute_xyz_from_aed(entity);
    } else if (param === "dist" || param === "distance") {
      entity.d = val;
      recompute_xyz_from_aed(entity);
    } else if (param === "x") {
      entity.x = val;
      recompute_aed_from_xyz(entity);
    } else if (param === "y") {
      entity.y = val;
      recompute_aed_from_xyz(entity);
    } else if (param === "z") {
      entity.z = val;
      recompute_aed_from_xyz(entity);
    }

    if (entityType === "source") emit_source_xyz(entityId);
    else emit_speaker_xyz(entityId);

    queue_draw();
    return;
  }

  // --- 5. SPACE-SEPARATED FALLBACKS ---
  if ((msg === "/source" || msg === "/speaker") && args.length >= 3) {
    var altTarget = msg.replace("/", "");
    var altId     = parseInt(args[0], 10);
    var altMode   = String(args[1]).toLowerCase();
    var altArgs   = args.slice(2);

    if (altTarget === "source") {
      ensure_source_exists(altId);
      apply_compound_coords(sources[altId], altMode, altArgs);
      emit_source_xyz(altId);
    } else {
      ensure_speaker_exists(altId);
      apply_compound_coords(speakers[altId], altMode, altArgs);
      emit_speaker_xyz(altId);
    }
    queue_draw();
    return;
  }

  // --- 6. DISPLAY & ZOOM CONTROLS ---
  if (msg === "/display/zoom" || msg === "zoom") {
    if (args.length > 0) {
      compute_zoom(args[0]);
      queue_draw();
    }
    return;
  }
  if (msg === "popup") {
    popup();
    return;
  }
  if (msg === "clear") {
    sources = {};
    queue_draw();
    return;
  }

  if (msg.indexOf("vumeter") === -1 && msg.indexOf("transparency") === -1 && msg.indexOf("yaw") === -1) {
    post("[surroundviewer unhandled] " + msg + " " + args.join(" ") + "\n");
  }
}

// ============================================================================
// VECTOR RENDERING ENGINE (MAIN CANVAS & LIVE PREVIEW)
// ============================================================================
function draw_monitor_view(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);

  if (Boolean(show_background)) {
    ctx.set_source_rgba(col_bg);
    ctx.rectangle(0, 0, w, h);
    ctx.fill();
  }

  var halfW = w * 0.5;
  var halfH = h * 0.5;

  if (hud_display_mode === 0) {
    // 0: Single Top View
    draw_viewport(ctx, 0, 0, w, h, "xy", w, is_preview);
  } else if (hud_display_mode === 1) {
    // 1: Left / Right Dual Ortho
    draw_viewport(ctx, 0, 0, halfW, h, "xy", halfW, is_preview);
    draw_viewport(ctx, halfW, 0, halfW, h, "xz", halfW, is_preview);

    ctx.set_source_rgba(0.22, 0.22, 0.24, 1.0);
    ctx.set_line_width(1.0);
    ctx.move_to(halfW, 0);
    ctx.line_to(halfW, h);
    ctx.stroke();
  } else {
    // 2: Top / Bottom Dual Ortho
    draw_viewport(ctx, 0, 0, w, halfH, "xy", w, is_preview);
    draw_viewport(ctx, 0, halfH, w, halfH, "xz", w, is_preview);

    ctx.set_source_rgba(0.22, 0.22, 0.24, 1.0);
    ctx.set_line_width(1.0);
    ctx.move_to(0, halfH);
    ctx.line_to(w, halfH);
    ctx.stroke();
  }

  // Outer corner borders
  if (Boolean(show_borders) && b > 0 && border_color && border_color[3] > 0.001) {
    var extVal = isNaN(border_extension) ? 6.0 : border_extension;
    draw_corners(ctx, inset, inset, rw, rh, border_radius, extVal, extVal, border_color, b);
  }

  // Red Dot on Main Canvas (Not inside Preview)
  if (!is_preview && allow_popup === 1) {
    var dotMargin = Math.max(4.0, Math.min(7.0, Math.min(w, h) * 0.05));
    var dotR      = Math.max(2.0, Math.min(3.5, Math.min(w, h) * 0.025));

    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  var sz = mgraphics.size;
  draw_monitor_view(mgraphics, sz[0], sz[1], false);
}

function draw_viewport(ctx, vx, vy, vw, vh, mode, dividerX, is_preview) {
  var cx = vx + vw * 0.5;
  var cy = vy + vh * 0.5;

  var R_outer_px = (vh * 0.57) * (current_zoom / 100.0);
  var R_step_px  = R_outer_px / num_rings;
  var ppm        = R_step_px / ring_step_m;
  var distToDivider = vw * 0.5;

  // 1. Crosshair Axes
  ctx.set_source_rgba(col_axis);
  ctx.set_line_width(is_preview ? 0.8 : 1.2);
  ctx.new_path();
  ctx.move_to(vx, cy);
  ctx.line_to(vx + vw, cy);
  ctx.stroke();

  ctx.new_path();
  ctx.move_to(cx, vy);
  ctx.line_to(cx, vy + vh);
  ctx.stroke();

  // 2. Grid (Circular or Cartesian)
  if (hud_grid_mode === 1) {
    // 2A. Circular Concentric Rings
    ctx.set_source_rgba(col_ring);
    ctx.set_line_width(is_preview ? 0.6 : 0.85);

    for (var i = 1; i <= num_rings; i++) {
      var ringR = R_step_px * i;
      if (ringR <= 0.5) continue;

      ctx.new_path();
      if (ringR <= distToDivider || hud_display_mode === 0 || hud_display_mode === 2) {
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        var ratio = distToDivider / ringR;
        if (ratio > 1.0) ratio = 1.0;
        var theta = Math.acos(ratio);

        if (mode === "xy") {
          ctx.arc(cx, cy, ringR, theta, Math.PI * 2.0 - theta);
          ctx.stroke();
        } else {
          ctx.arc(cx, cy, ringR, -Math.PI + theta, Math.PI - theta);
          ctx.stroke();
        }
      }
    }
  } else if (hud_grid_mode === 2) {
    // 2B. Cartesian Grid Lines
    ctx.set_source_rgba(col_ring);
    ctx.set_line_width(is_preview ? 0.6 : 0.85);

    for (var g = 1; g <= num_rings; g++) {
      var offset = R_step_px * g;
      if (offset <= 0.5) continue;

      // Horizontal lines
      if (cy - offset >= vy) {
        ctx.new_path(); ctx.move_to(vx, cy - offset); ctx.line_to(vx + vw, cy - offset); ctx.stroke();
      }
      if (cy + offset <= vy + vh) {
        ctx.new_path(); ctx.move_to(vx, cy + offset); ctx.line_to(vx + vw, cy + offset); ctx.stroke();
      }

      // Vertical lines
      if (cx - offset >= vx) {
        ctx.new_path(); ctx.move_to(cx - offset, vy); ctx.line_to(cx - offset, vy + vh); ctx.stroke();
      }
      if (cx + offset <= vx + vw) {
        ctx.new_path(); ctx.move_to(cx + offset, vy); ctx.line_to(cx + offset, vy + vh); ctx.stroke();
      }
    }
  }

  // 3. Center Listener Icon
  var lSize = is_preview ? Math.max(3.0, vh * 0.02) : 4.5;
  ctx.set_source_rgba(col_listener);
  ctx.new_path();
  ctx.arc(cx, cy, lSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.set_source_rgba(0.9, 0.9, 0.9, 1.0);
  ctx.set_line_width(0.8);
  ctx.arc(cx, cy, lSize, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Axis Labels
  if (vh >= 70) {
    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(is_preview ? 8 : 9);
    ctx.set_source_rgba(col_text);

    if (mode === "xy") {
      show_center_text(ctx, "+y front", cx, vy + 14);
      show_center_text(ctx, "-y back",  cx, vy + vh - 8);
      show_center_text(ctx, "left",     vx + 14, cy - 7);
      show_center_text(ctx, "-x",       vx + 14, cy + 6);
      show_center_text(ctx, "right",    vx + vw - 14, cy - 7);
      show_center_text(ctx, "+x",       vx + vw - 14, cy + 6);
    } else {
      show_center_text(ctx, "+z top",    cx, vy + 14);
      show_center_text(ctx, "-z bottom", cx, vy + vh - 8);
      show_center_text(ctx, "left",      vx + 14, cy - 7);
      show_center_text(ctx, "-x",        vx + 14, cy + 6);
      show_center_text(ctx, "right",     vx + vw - 14, cy - 7);
      show_center_text(ctx, "+x",        vx + vw - 14, cy + 6);
    }
  }

  // 5. Draw Speakers
  if (Boolean(hud_speakers_vis)) {
    var spkScale = is_preview ? Math.max(10.0, speaker_size * 0.9) : speaker_size;
    for (var spkId in speakers) {
      var spk = speakers[spkId];
      var pX = spk.x;
      var pY = (mode === "xy") ? spk.y : spk.z;

      var scrX = cx + pX * ppm;
      var scrY = cy - pY * ppm;

      draw_speaker_node(ctx, scrX, scrY, String(spkId), spkScale);
    }
  }

  // 6. Draw Sources
  if (Boolean(hud_sources_visible)) {
    var srcScale = is_preview ? Math.max(6.5, source_size * 0.9) : source_size;
    for (var srcId in sources) {
      var src = sources[srcId];
      var sX = src.x;
      var sY = (mode === "xy") ? src.y : src.z;

      var sScrX = cx + sX * ppm;
      var sScrY = cy - sY * ppm;

      draw_source_node(ctx, sScrX, sScrY, String(srcId), srcScale);
    }
  }

  // 7. Distance Scale Legend
  if (Boolean(show_scale_bar) && vh >= 80) {
    var barX2 = vx + vw - 16;
    var barX1 = barX2 - R_step_px;
    var barY  = vy + vh - 14;

    ctx.set_source_rgba(0.70, 0.70, 0.75, 0.85);
    ctx.set_line_width(1.0);
    ctx.new_path();
    ctx.move_to(barX1, barY); ctx.line_to(barX2, barY); ctx.stroke();
    ctx.new_path();
    ctx.move_to(barX1, barY - 3); ctx.line_to(barX1, barY + 3); ctx.stroke();
    ctx.new_path();
    ctx.move_to(barX2, barY - 3); ctx.line_to(barX2, barY + 3); ctx.stroke();

    ctx.new_path();
    ctx.move_to(barX1 + 4, barY - 2.5); ctx.line_to(barX1, barY); ctx.line_to(barX1 + 4, barY + 2.5); ctx.stroke();
    ctx.new_path();
    ctx.move_to(barX2 - 4, barY - 2.5); ctx.line_to(barX2, barY); ctx.line_to(barX2 - 4, barY + 2.5); ctx.stroke();

    ctx.set_font_size(8);
    show_center_text(ctx, ring_step_m.toFixed(2) + " m", (barX1 + barX2) * 0.5, barY - 3);
  }
}

function draw_speaker_node(ctx, x, y, label, size) {
  var half = size * 0.5;
  ctx.set_source_rgba(col_spk_bg);
  ctx.new_path();
  if (hud_speaker_shape === 0) ctx.rectangle(x - half, y - half, size, size);
  else ctx.arc(x, y, half, 0, Math.PI * 2);
  ctx.fill();

  ctx.set_source_rgba(col_spk_border);
  ctx.set_line_width(1.0);
  ctx.new_path();
  if (hud_speaker_shape === 0) ctx.rectangle(x - half, y - half, size, size);
  else ctx.arc(x, y, half, 0, Math.PI * 2);
  ctx.stroke();

  if (size >= 8) {
    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(Math.max(6, Math.min(12, size * 0.72)));
    ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
    var tm = ctx.text_measure(label);
    ctx.move_to(x - tm[0] * 0.5, y + tm[1] * 0.35);
    ctx.show_text(label);
  }
}

function draw_source_node(ctx, x, y, label, radius) {
  // Apply Source Emphasis scaling
  var emphasis = clamp(hud_emphasis_pct / 100.0, 0.05, 1.0);
  var effRadius = Math.max(3.0, radius * (0.35 + 0.65 * emphasis));

  ctx.set_source_rgba([col_src_bg[0], col_src_bg[1], col_src_bg[2], (col_src_bg[3] || 1.0) * (0.2 + 0.8 * emphasis)]);
  ctx.new_path();
  ctx.arc(x, y, effRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.set_source_rgba([col_src_border[0], col_src_border[1], col_src_border[2], (col_src_border[3] || 1.0) * (0.2 + 0.8 * emphasis)]);
  ctx.set_line_width(0.9);
  ctx.new_path();
  ctx.arc(x, y, effRadius, 0, Math.PI * 2);
  ctx.stroke();

  if (effRadius >= 4.0 && emphasis >= 0.25) {
    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(Math.max(6, Math.min(11, effRadius * 1.05)));
    ctx.set_source_rgba(0.05, 0.05, 0.05, 1.0);
    var tm = ctx.text_measure(label);
    ctx.move_to(x - tm[0] * 0.5, y + tm[1] * 0.35);
    ctx.show_text(label);
  }
}

function draw_corners(ctx, x, y, w, h, r, ew, eh, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  var rClamped = Math.max(0, Math.min(r, (w - 2 * ew) * 0.5, (h - 2 * eh) * 0.5));

  if (rClamped > 0.5) {
    ctx.new_path();
    ctx.arc(x + rClamped, y + rClamped, rClamped, Math.PI, Math.PI * 1.5);
    ctx.line_to(x + rClamped + ew, y);
    ctx.move_to(x, y + rClamped);
    ctx.line_to(x, y + rClamped + eh);
    ctx.stroke();

    ctx.new_path();
    ctx.arc(x + w - rClamped, y + rClamped, rClamped, -Math.PI * 0.5, 0);
    ctx.line_to(x + w, y + rClamped + eh);
    ctx.move_to(x + w - rClamped - ew, y);
    ctx.line_to(x + w - rClamped, y);
    ctx.stroke();

    ctx.new_path();
    ctx.arc(x + w - rClamped, y + h - rClamped, rClamped, 0, Math.PI * 0.5);
    ctx.line_to(x + w - rClamped - ew, y + h);
    ctx.move_to(x + w, y + h - rClamped);
    ctx.line_to(x + w, y + h - rClamped - eh);
    ctx.stroke();

    ctx.new_path();
    ctx.arc(x + rClamped, y + h - rClamped, rClamped, Math.PI * 0.5, Math.PI);
    ctx.line_to(x, y + h - rClamped - eh);
    ctx.move_to(x + rClamped + ew, y + h);
    ctx.line_to(x + rClamped, y + h);
    ctx.stroke();
  } else {
    // Square 90-degree Corners (r == 0)
    ctx.new_path();
    ctx.move_to(x + ew, y); ctx.line_to(x, y); ctx.line_to(x, y + eh); ctx.stroke();

    ctx.new_path();
    ctx.move_to(x + w - ew, y); ctx.line_to(x + w, y); ctx.line_to(x + w, y + eh); ctx.stroke();

    ctx.new_path();
    ctx.move_to(x + w, y + h - eh); ctx.line_to(x + w, y + h); ctx.line_to(x + w - ew, y + h); ctx.stroke();

    ctx.new_path();
    ctx.move_to(x, y + h - eh); ctx.line_to(x, y + h); ctx.line_to(x + ew, y + h); ctx.stroke();
  }
}

function show_center_text(ctx, txt, x, y) {
  var tm = ctx.text_measure(txt);
  ctx.move_to(x - tm[0] * 0.5, y);
  ctx.show_text(txt);
}

// ============================================================================
// CANVAS MOUSE INTERACTION (RED DOT & POPUP TRIGGER)
// ============================================================================
function onclick(x, y, but, cmd, shift, capslock, option, ctrl) {
  var sz = mgraphics.size;
  var w = sz[0], h = sz[1];
  var is_right_click = (ctrl === 1);

  if (allow_popup === 1) {
    var dotMargin = Math.max(4.0, Math.min(7.0, Math.min(w, h) * 0.05));
    var dotX = w - dotMargin, dotY = dotMargin;
    var hitR = Math.max(8.0, Math.min(14.0, Math.min(w, h) * 0.08));
    var dist = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));

    if (dist <= hitR || is_right_click) {
      popup();
      return;
    }
  }
}

// ============================================================================
// FLOATING JITTER POPUP INSPECTOR
// ============================================================================
function ensurePopupWindows() {
  if (!popupWindow) {
    popupWindow = new JitterObject("jit.window", "surround_set_" + uniqueID);
    popupWindow.floating   = 1;
    popupWindow.visible    = 0;
    popupWindow.border     = 1;
    popupWindow.grow       = 0;
    popupWindow.mousewheel = 1;
    popupWindow.title      = "Surround Viewer Inspector";
    windowListener         = new JitterListener(popupWindow.name, windowListenerCallback);
  }
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", "surround_col_" + uniqueID);
    colorWindow.floating   = 1;
    colorWindow.visible    = 0;
    colorWindow.border     = 1;
    colorWindow.grow       = 0;
    colorWindow.title      = "Color Picker";
    colorWindow.size       = [200, 240];
    colorMatrix            = new JitterMatrix(4, "char", 200, 240);
    colorListener          = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
}

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

function get_popup_min_size() {
  return { w: 180, h: 120 };
}

function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  if (active_mask_tab === 0) {
    var gridModes = ["None", "Circular", "Cartesian"];
    var dispModes = ["Single", "Left/Right", "Top/Bottom"];

    // Row 1: Display Zoom Slider
    var zoomPct = (current_zoom - 5.0) / 115.0;
    list.push({ name: "Display Zoom", val: current_zoom.toFixed(1) + "%", pct: clamp(zoomPct, 0, 1), is_slider: true, target_id: 100 });

    // Row 2: Zoom Lock Toggle
    list.push({ name: "Zoom Lock", val: hud_zoom_lock ? "ON" : "OFF", is_toggle: true, target_id: 104 });

    // Row 3: Grid Style
    list.push({ name: "Grid Style", val: gridModes[hud_grid_mode], is_toggle: true, target_id: 101 });

    // Row 4: Divisions
    list.push({ name: "Divisions", val: num_rings, pct: (num_rings - 1) / 5.0, is_slider: true, target_id: 102 });

    // Row 5: Display Layout
    list.push({ name: "Display Layout", val: dispModes[hud_display_mode], is_toggle: true, target_id: 103 });

    // Row 6: Sources Visible
    list.push({ name: "Sources Visible", val: hud_sources_visible ? "ON" : "OFF", is_toggle: true, target_id: 105 });

    // Row 7: Source Emphasis
    list.push({ name: "Source Emphasis", val: Math.round(hud_emphasis_pct) + "%", pct: hud_emphasis_pct / 100.0, is_slider: true, target_id: 107 });

    // Row 8: Speakers Visible
    list.push({ name: "Speakers Visible", val: hud_speakers_vis ? "ON" : "OFF", is_toggle: true, target_id: 108 });

    // Row 9: Speaker Shape
    list.push({ name: "Speaker Shape", val: hud_speaker_shape === 0 ? "Square" : "Circle", is_toggle: true, target_id: 109 });

  } else if (active_mask_tab === 1) {
    list.push({ name: "Borders", val: show_borders ? "ON" : "OFF", is_toggle: true, target_id: 201 });
    list.push({ name: "Background", val: show_background ? "ON" : "OFF", is_toggle: true, target_id: 202 });
    list.push({ name: "Corner Radius", val: Math.round(border_radius), pct: border_radius / 30.0, is_slider: true, target_id: 203 });
    list.push({ name: "Border Thick", val: border_thickness.toFixed(1), pct: border_thickness / 8.0, is_slider: true, target_id: 204 });
    list.push({ name: "Border Extension", val: Math.round(border_extension), pct: border_extension / 40.0, is_slider: true, target_id: 205 });
    list.push({ name: "Speaker Size", val: speaker_size.toFixed(1), pct: (speaker_size - 8) / 16.0, is_slider: true, target_id: 206 });
    list.push({ name: "Source Size", val: source_size.toFixed(1), pct: (source_size - 4) / 14.0, is_slider: true, target_id: 207 });
    list.push({ name: "Scale Bar", val: show_scale_bar ? "ON" : "OFF", is_toggle: true, target_id: 208 });

  } else if (active_mask_tab === 2) {
    list.push({ name: "Face / BG Color", val: col_bg, is_color: true, key: "col_bg" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Grid Rings", val: col_ring, is_color: true, key: "col_ring" });
    list.push({ name: "Crosshair Axes", val: col_axis, is_color: true, key: "col_axis" });
    list.push({ name: "Sources Color", val: col_src_bg, is_color: true, key: "col_src_bg" });
    list.push({ name: "Speakers Color", val: col_spk_bg, is_color: true, key: "col_spk_bg" });
    list.push({ name: "Text Color", val: col_text, is_color: true, key: "col_text" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
  }

  return list;
}

function get_popup_dimensions() {
  if (!show_settings_attrs) {
    return { w: Math.max(popup_mini_w, 200), h: Math.max(popup_mini_h, 130) };
  }
  var rows = get_visible_rows_map();
  var rowCount = Math.max(rows.length, 8);
  var fixedH = 28 + 80 + 8 + 22 + 8 + (rowCount * 28) + 16;
  return { w: popup_window_width, h: fixedH };
}

function update_popup_dimensions() {
  if (showSettings && allow_popup === 1) {
    ensurePopupWindows();
    var dims = get_popup_dimensions();
    if (!show_settings_attrs) {
      popup_mini_w = dims.w;
      popup_mini_h = dims.h;
    }
    popupWindow.size = [dims.w, dims.h];
    outMatrix = recycleMatrix(outMatrix, dims.w, dims.h);
    popupWindow.visible = 1;
    popupWindow.front();
    draw_popup_to_window_deferred();
  } else {
    if (popupWindow) popupWindow.visible = 0;
  }
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;

  if (showSettings) {
    ensurePopupWindows();
    loadThemeFromDict();
    update_popup_dimensions();
  } else {
    if (popupWindow) popupWindow.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
  }
}

var pop_render_pending = 0;
var pop_render_task = new Task(function () {
  pop_render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

function draw_popup_to_window() {
  if (!showSettings || allow_popup !== 1 || !popupWindow) return;
  if (pop_render_pending === 0) {
    pop_render_pending = 1;
    pop_render_task.schedule(16);
  }
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

  // Red Close Dot (Top-Left)
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.new_path();
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color[0], attr_text_color[1], attr_text_color[2], 0.6);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  // Toggle Hide/Show Pill (Top-Right)
  var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
  pCtx.set_source_rgba(attr_bg_color);
  pCtx.rectangle_rounded(tglX, tglY, tglW, tglH, 3, 3);
  pCtx.fill();
  pCtx.set_source_rgba(attr_border_color);
  pCtx.set_line_width(1.0);
  pCtx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, 3, 3);
  pCtx.stroke();

  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = pCtx.text_measure(tglLabel);
  pCtx.move_to(tglX + (tglW - tglTm[0]) * 0.5, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // --- LIVE MINI-PREVIEW CHASSIS ---
  var prevX = 12, prevY = 28;
  var prevW = w - 24;
  var prevH = has_rows ? 80 : (h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_monitor_view(pCtx, prevW, prevH, true);
  pCtx.restore();

  if (has_rows) {
    var divY = prevY + prevH + 8;
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    // Themed Carousel Navigation Bar
    var navY = divY + 6, navH = 22, navW = w - 24, navX = 12;
    pCtx.set_source_rgba(attr_bg_color);
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
    pCtx.set_source_rgba(col_mode);
    pCtx.move_to(navX + (navW - tabTm[0]) * 0.5, navY + 15);
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

      // Label
      pCtx.set_source_rgba(attr_text_color);
      pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17);
      pCtx.show_text(r.name);

      // Divider
      pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
      pCtx.set_line_width(1.0);
      pCtx.move_to(midX, rY + 3); pCtx.line_to(midX, rY + 23); pCtx.stroke();

      // Right Control Box
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
        // Slider Well
        pCtx.set_source_rgba(attr_bg_color[0] * 0.7, attr_bg_color[1] * 0.7, attr_bg_color[2] * 0.7, 0.9);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        // Active Slider Fill
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
        // Toggle Button
        pCtx.set_source_rgba(attr_bg_color);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        pCtx.set_source_rgba(attr_border_color);
        pCtx.set_line_width(0.75);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.stroke();

        pCtx.set_source_rgba(attr_text_color);
        pCtx.set_font_size(10);
        var vTm = pCtx.text_measure(String(r.val));
        pCtx.move_to(valBoxX + Math.max(6, (valBoxW - vTm[0]) * 0.5), rY + 17);
        pCtx.show_text(String(r.val));
      }
    }
  } else {
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.75);
    pCtx.set_line_width(1.2);
    pCtx.new_path();
    pCtx.move_to(w - 14, h - 4); pCtx.line_to(w - 4, h - 14); pCtx.stroke();
    pCtx.new_path();
    pCtx.move_to(w - 9,  h - 4); pCtx.line_to(w - 4, h - 9);  pCtx.stroke();
    pCtx.new_path();
    pCtx.move_to(w - 4,  h - 4); pCtx.line_to(w - 4, h - 4);  pCtx.stroke();
  }

  var theImage = new Image(pCtx);
  theImage.tonamedmatrix(outMatrix.name);
  popupWindow.jit_matrix(outMatrix.name);
}

function apply_slider_target(target_id, pct) {
  if (target_id === 100) {
    var newZoom = 5.0 + pct * 115.0;
    current_zoom = Math.round(newZoom * 10.0) / 10.0;
    var denom = 0.01755 * current_zoom - 0.2673;
    if (denom <= 0.001) denom = 0.001;
    ring_step_m = 1.0 / denom;
  }
  else if (target_id === 102) num_rings = Math.round(1 + pct * 5);
  else if (target_id === 107) hud_emphasis_pct = Math.round(pct * 100.0);
  else if (target_id === 203) border_radius = Math.round(pct * 30.0);
  else if (target_id === 204) border_thickness = Math.round(pct * 80.0) / 10.0;
  else if (target_id === 205) border_extension = Math.round(pct * 40.0);
  else if (target_id === 206) speaker_size = 8.0 + pct * 16.0;
  else if (target_id === 207) source_size = 4.0 + pct * 14.0;

  queue_draw();
}

function windowListenerCallback(event) {
  if (event.eventname === "close") {
    showSettings = 0;
    active_pop_target = -1;
    is_dragging_window = 0;
    is_resizing_window = 0;
    return;
  }

  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;
  var pr = cached_preview_rect;

  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];

    var divY = pr.y + pr.h + 8;
    var navY = divY + 6, navH = 22, navW = w - 24, navX = 12;
    var btnW = 24, rBtnX = navX + navW - btnW - 1;

    var rowsStartY = navY + navH + 8;
    var rowW = w - 24, rowX = 12;
    var midX = rowX + rowW * 0.5;
    var valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    if (mbut === 0) {
      active_pop_target = -1;
      is_dragging_window = 0;
      is_resizing_window = 0;
      return;
    }

    // 1. Resizing Mini-Window (Bottom-right corner)
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      var minDims = get_popup_min_size();

      popup_mini_w = Math.max(minDims.w, Math.min(start_resize_w + deltaW, 3840));
      popup_mini_h = Math.max(minDims.h, Math.min(start_resize_h + deltaH, 2160));

      update_popup_dimensions();
      return;
    }

    // 2. Dragging Window Position
    if (is_dragging_window && !has_rows) {
      try {
        var cur = max.getcursor();
        var dx = cur[0] - start_cursor_x;
        var dy = cur[1] - start_cursor_y;
        popupWindow.pos = [start_win_x + dx, start_win_y + dy];
      } catch(e) {}
      return;
    }

    // 3. Active Slider Dragging
    if (active_pop_target !== -1) {
      var dragPct = Math.max(0, Math.min(1, (mx - valBoxX) / valBoxW));
      apply_slider_target(active_pop_target, dragPct);
      draw_popup_to_window();
      return;
    }

    // Close Button Hit
    if (mx < 35 && my < 26) {
      showSettings = 0;
      popupWindow.visible = 0;
      return;
    }

    // Toggle Hide/Show Pill Hit
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions();
      return;
    }

    // When Attributes are Hidden: Initiate Move or Resize
    if (!has_rows) {
      if (mx >= w - 18 && my >= h - 18) {
        is_resizing_window = 1;
        start_click_x = mx; start_click_y = my;
        start_resize_w = w;  start_resize_h = h;
      } else {
        is_dragging_window = 1;
        start_click_x = mx; start_click_y = my;
        if (popupWindow && popupWindow.pos) {
          start_win_x = popupWindow.pos[0];
          start_win_y = popupWindow.pos[1];
        }
        try {
          var c = max.getcursor();
          start_cursor_x = c[0];
          start_cursor_y = c[1];
        } catch(e) {}
      }
      return;
    }

    // Carousel Navigation Bar Hit
    if (my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
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

    // Attribute Rows Interaction
    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + (rows.length * 28)) {
      var rIdx = Math.floor((my - rowsStartY) / 28);
      if (rIdx >= 0 && rIdx < rows.length) {
        var r = rows[rIdx];
        var pct = Math.max(0, Math.min(1, (mx - valBoxX) / valBoxW));

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          apply_slider_target(r.target_id, pct);
        } else {
          if (r.target_id === 101) hud_grid_mode = (hud_grid_mode + 1) % 3;
          else if (r.target_id === 103) hud_display_mode = (hud_display_mode + 1) % 3;
          else if (r.target_id === 104) hud_zoom_lock = hud_zoom_lock ? 0 : 1;
          else if (r.target_id === 105) hud_sources_visible = hud_sources_visible ? 0 : 1;
          else if (r.target_id === 106) hud_sources_edit = hud_sources_edit ? 0 : 1;
          else if (r.target_id === 108) hud_speakers_vis = hud_speakers_vis ? 0 : 1;
          else if (r.target_id === 109) hud_speaker_shape = (hud_speaker_shape + 1) % 2;
          else if (r.target_id === 201) show_borders = show_borders ? 0 : 1;
          else if (r.target_id === 202) show_background = show_background ? 0 : 1;
          else if (r.target_id === 208) show_scale_bar = show_scale_bar ? 0 : 1;
          else if (r.is_color) {
            ensurePopupWindows();
            active_color_target = r.key;
            initPickerFromTarget();
            if (popupWindow && popupWindow.pos) {
              colorWindow.pos = [popupWindow.pos[0] + w + 8, popupWindow.pos[1] + 20];
            }
            colorWindow.visible = 1;
            colorWindow.front();
            draw_color_picker_popup();
          }
          queue_draw();
        }
        draw_popup_to_window();
      }
    }
  }
}

// ============================================================================
// SUB-WINDOW: COLOR PICKER
// ============================================================================
function get_color_target(name) {
  if (name === "col_bg") return col_bg;
  if (name === "border_color") return border_color;
  if (name === "col_ring") return col_ring;
  if (name === "col_axis") return col_axis;
  if (name === "col_src_bg") return col_src_bg;
  if (name === "col_spk_bg") return col_spk_bg;
  if (name === "col_text") return col_text;
  if (name === "popup_dot_color") return popup_dot_color;
  return null;
}

function get_color_target_label(name) {
  if (name === "col_bg") return "Face / BG Color";
  if (name === "border_color") return "Border Color";
  if (name === "col_ring") return "Grid Rings";
  if (name === "col_axis") return "Crosshair Axes";
  if (name === "col_src_bg") return "Sources Color";
  if (name === "col_spk_bg") return "Speakers Color";
  if (name === "col_text") return "Text Color";
  if (name === "popup_dot_color") return "Popup Dot";
  return "Color Picker";
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
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = v; b = t; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [r, g, b];
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
    if (active_color_target === "border_color") {
      col_spk_border = [rgb[0], rgb[1], rgb[2], cur_a];
    }
  }
  queue_draw();
  draw_popup_to_window(); // Live update inspector swatches
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
  ctx.new_path();
  ctx.arc(14, 14, 6.0, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
  ctx.move_to(28, 17);
  ctx.show_text(get_color_target_label(active_color_target));

  // 1. Hue Spectrum Bar
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
  ctx.new_path();
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Saturation / Value Gradient Field
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

  // Reticle Ring
  var svIndX = svX + cur_s * svW;
  var svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.new_path();
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Opacity Slider
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

  // Opacity Indicator Circle
  var opIndX = opX + cur_a * opW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.new_path();
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Preview Swatch
  var swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba([1, 1, 1, 0.9]);
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
        colorWindow.visible = 0; picker_drag_zone = 0; queue_draw(); return;
      }
      if (picker_drag_zone === 0) {
        if (mx >= 10 && mx <= 190 && my >= 24 && my <= 46) picker_drag_zone = 1;
        else if (mx >= 10 && mx <= 190 && my >= 48 && my <= 168) picker_drag_zone = 2;
        else if (mx >= 10 && mx <= 190 && my >= 170 && my <= 190) picker_drag_zone = 3;
      }

      if (picker_drag_zone === 1) cur_h = Math.max(0, Math.min(1, (mx - 10) / 180));
      else if (picker_drag_zone === 2) {
        cur_s = Math.max(0, Math.min(1, (mx - 10) / 180));
        cur_v = Math.max(0, Math.min(1, 1.0 - (my - 50) / 115));
      } else if (picker_drag_zone === 3) {
        cur_a = Math.max(0, Math.min(1, (mx - 10) / 180));
      }
      applyPickerToTarget();
      draw_color_picker_popup();
    }
  }
}

// ============================================================================
// WIRELESS THEME BUS SUBSCRIBER
// ============================================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers || typeof themeBus.subscribers !== "object") {
  themeBus.subscribers = {};
}

function rgba_values(args, fallback) {
  if (args === undefined || args === null) return fallback;
  var list = Array.isArray(args) ? args : [args];
  if (list.length < 3) return fallback;
  return [Number(list[0]), Number(list[1]), Number(list[2]), list[3] !== undefined ? Number(list[3]) : 1.0];
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
    if ((col = resolve_color(initDict, ["bg_color", "bg"]))) col_bg = rgba_values(col, col_bg);
    if ((col = resolve_color(initDict, ["border_color", "border"]))) {
      border_color = rgba_values(col, border_color);
      col_spk_border = rgba_values(col, col_spk_border);
    }
    if (initDict.contains("border_radius")) border_radius = Math.max(0.0, Number(initDict.get("border_radius")));
    if (initDict.contains("border_thickness")) border_thickness = Math.max(0.0, Number(initDict.get("border_thickness")));
    if (initDict.contains("border_extension")) border_extension = Math.max(0.0, Number(initDict.get("border_extension")));

    if ((col = resolve_color(initDict, ["text_color", "text"]))) col_text = rgba_values(col, col_text);
    if ((col = resolve_color(initDict, ["mode_color", "mode"]))) col_mode = rgba_values(col, col_mode);

    if ((col = resolve_color(initDict, ["slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) col_src_bg = rgba_values(col, col_src_bg);
    if ((col = resolve_color(initDict, ["slider_rail_color", "track_color", "rail_color"]))) col_ring = rgba_values(col, col_ring);

    // Popup Window Background & Dot
    if ((col = resolve_color(initDict, ["popup_bg", "pop_bgcolor", "pop_bg", "popup_bg_color", "bg_color", "bg"]))) pop_bgcolor = rgba_values(col, pop_bgcolor);
    if ((col = resolve_color(initDict, ["popup_dot", "popup_dot_color", "pop_dot"]))) popup_dot_color = rgba_values(col, popup_dot_color);

    // Inspector Attrui Controls Sync
    if ((col = resolve_color(initDict, ["attr_bg", "attr_bg_color", "attrbg", "pop_bgcolor", "popup_bg"]))) attr_bg_color = rgba_values(col, attr_bg_color);
    if ((col = resolve_color(initDict, ["attr_border", "attr_border_color", "attrborder", "border_color", "border"]))) attr_border_color = rgba_values(col, attr_border_color);
    if ((col = resolve_color(initDict, ["attr_slider", "attr_slider_color", "attrslider", "slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) attr_slider_color = rgba_values(col, attr_slider_color);
    if ((col = resolve_color(initDict, ["attr_text", "attr_text_color", "attrtext", "text_color", "text"]))) attr_text_color = rgba_values(col, attr_text_color);

    queue_draw();
    if (showSettings && popupWindow && popupWindow.visible) draw_popup_to_window();
  } catch(e) {}
}

function onThemeUpdate(theme) {
  if (!theme) return;
  try {
    var col;
    if ((col = resolve_color(theme, ["bg_color", "bg"]))) col_bg = rgba_values(col, col_bg);
    if ((col = resolve_color(theme, ["border_color", "border"]))) {
      border_color = rgba_values(col, border_color);
      col_spk_border = rgba_values(col, col_spk_border);
    }
    if (theme.border_radius !== undefined) border_radius = Math.max(0.0, Number(theme.border_radius));
    if (theme.border_thickness !== undefined) border_thickness = Math.max(0.0, Number(theme.border_thickness));
    if (theme.border_extension !== undefined) border_extension = Math.max(0.0, Number(theme.border_extension));

    if ((col = resolve_color(theme, ["text_color", "text"]))) col_text = rgba_values(col, col_text);
    if ((col = resolve_color(theme, ["mode_color", "mode"]))) col_mode = rgba_values(col, col_mode);

    if ((col = resolve_color(theme, ["slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) col_src_bg = rgba_values(col, col_src_bg);
    if ((col = resolve_color(theme, ["slider_rail_color", "track_color", "rail_color"]))) col_ring = rgba_values(col, col_ring);

    // Popup Window Background & Dot
    if ((col = resolve_color(theme, ["popup_bg", "pop_bgcolor", "pop_bg", "popup_bg_color", "bg_color", "bg"]))) pop_bgcolor = rgba_values(col, pop_bgcolor);
    if ((col = resolve_color(theme, ["popup_dot", "popup_dot_color", "pop_dot"]))) popup_dot_color = rgba_values(col, popup_dot_color);

    // Inspector Attrui Controls Sync
    if ((col = resolve_color(theme, ["attr_bg", "attr_bg_color", "attrbg", "pop_bgcolor", "popup_bg"]))) attr_bg_color = rgba_values(col, attr_bg_color);
    if ((col = resolve_color(theme, ["attr_border", "attr_border_color", "attrborder", "border_color", "border"]))) attr_border_color = rgba_values(col, attr_border_color);
    if ((col = resolve_color(theme, ["attr_slider", "attr_slider_color", "attrslider", "slider_handle_color", "handle_color", "highlight_color", "accent_color"]))) attr_slider_color = rgba_values(col, attr_slider_color);
    if ((col = resolve_color(theme, ["attr_text", "attr_text_color", "attrtext", "text_color", "text"]))) attr_text_color = rgba_values(col, attr_text_color);

    queue_draw();
    if (showSettings && popupWindow && popupWindow.visible) draw_popup_to_window();
  } catch(e) {}
}

function loadbang() {
  if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
  loadThemeFromDict();
}

// Initial Registration & Immediate Theme Ingestion
themeBus.subscribers[uniqueID] = onThemeUpdate;
if (themeBus && themeBus.theme) {
  onThemeUpdate(themeBus.theme);
} else {
  loadThemeFromDict();
}

// ============================================================================
// LIFECYCLE DESTRUCTION
// ============================================================================
function notifydeleted() {
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (pop_render_task) { try { pop_render_task.cancel(); } catch(e) {} }
  try { if (themeBus && themeBus.subscribers && themeBus.subscribers[uniqueID]) delete themeBus.subscribers[uniqueID]; } catch(e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch(e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch(e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch(e) {}

  try { if (popupWindow) popupWindow.free(); } catch(e) {}
  try { if (colorWindow) colorWindow.free(); } catch(e) {}
  try { if (outMatrix) outMatrix.freepeer(); } catch(e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}

  popupWindow = null;
  colorWindow = null;
  outMatrix = null;
  colorMatrix = null;
  windowListener = null;
  colorListener = null;
}