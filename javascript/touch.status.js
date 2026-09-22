// ============================================================================
// touch.status.js - Max 9 v8ui / jsui
// 2D Spatial Morph Grid (Cols/Rows) + Auto-States Management
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "Inlet 0: int / float / [Cols/Rows] / text / rename / messages");
setoutletassist(0, "Outlet 0: Commands to [pattrstorage] (recall, store, read, write, name)");
setoutletassist(1, "Outlet 1: Selected status info (set <name>)");
setoutletassist(2, "Outlet 2: Storage messages (name, read, write)");

var uniqueID = Math.floor(Math.random() * 1000000);

if (this.box && !this.box.varname) {
  this.box.varname = "touch_status_" + uniqueID;
}

var is_transmitting = false;

// =============================================================
// INTERNAL GPS & AUTO-STORAGE SYSTEM
// =============================================================
function get_states_dir() {
  try {
    var f = new File("states_anchor.txt");
    if (f.isopen) {
      var d = f.foldername;
      f.close();
      if (d.charAt(d.length - 1) !== "/") d += "/";
      return d;
    }
  } catch(e) {}
  try {
    var f2 = new File("touch_theme_presets.json");
    if (f2.isopen) {
      var d2 = f2.foldername;
      f2.close();
      if (d2.charAt(d2.length - 1) !== "/") d2 += "/";
      
      return d2;
    }
  } catch(e) {}
  return "";
}

function get_states_filepath() {
  var dir = get_states_dir();
  var safeName = module_name ? module_name.replace(/\s+/g, "_") : ("module_" + uniqueID);
  return dir ? (dir + safeName + ".json") : (safeName + ".json");
}

function sync_storage_identity() {
  var fullpath = get_states_filepath();
  // Send name and read to pattrstorage
  outlet(0, ["name", module_name]);
  outlet(0, ["read", fullpath]);
  outlet(2, ["name", module_name]);
  outlet(2, ["read", fullpath]);
}

function trigger_auto_write() {
  var fullpath = get_states_filepath();
  outlet(0, ["write", fullpath]);
  outlet(2, ["write", fullpath]);
}

// =============================================================
// 1. STATE & GRID TOPOLOGY (Cols / Rows)
// =============================================================
var module_name = "module_" + uniqueID;
var active_slot = 0;
var morph_val   = 1.0;
var morph_x     = 1.0;
var morph_y     = 1.0;
var is_morphing = 0;

var grid_cols = 3;
var grid_rows = 1;
var morph_weights = [];

var slots = [
  { name: "Init Status" },
  { name: "Clean Tone" },
  { name: "Lead 80s" }
];

var name_bank = [
  "Init Status", "Clean Tone", "Warm Crunch", "Lead 80s",
  "Heavy Drive", "Solo Boost", "Ambient Pad", "Perc 3/8",
  "Drum 2/4", "Mute / Cut", "Sub Bass", "FX Riser"
];

var allow_hold_edit = 1;
var allow_popup     = 1;
var hold_threshold  = 450;

var label_mode       = 0;
var label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
var case_mode        = 0;
var case_mode_names  = ["First Cap", "All Cap", "All Small"];

var font_name        = "Arial";
var text_size        = 11;
var font_style       = 0;
var font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];
var font_slants      = ["normal", "normal", "italic", "italic"];
var font_weights     = ["normal", "bold", "normal", "bold"];

var border_radius    = 4.0;
var border_thickness = 1.2;
var border_extension = 6.0;

// Theme Colors
var bg_color          = [0.12, 0.12, 0.14, 0.95];
var border_color      = [0.45, 0.45, 0.50, 1.0];
var text_color        = [0.92, 0.94, 0.98, 1.0];
var highlight_color   = [1.00, 0.22, 0.25, 1.0];
var popup_dot_color   = [1.00, 0.00, 0.00, 1.0];

var pop_bgcolor       = [0.10, 0.10, 0.12, 0.98];
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var showSettings       = 0;
var popup_window_width = 280;
var popup_mini_w       = 320;
var popup_mini_h       = 110;
var start_resize_w     = 320;
var start_resize_h     = 110;
var is_resizing_window = 0;

// =============================================================
// 2. JITTER POPUP WINDOWS
// =============================================================
var settingsWindow = new JitterObject("jit.window", "status_set_" + uniqueID);
settingsWindow.floating = 1; settingsWindow.visible = 0; settingsWindow.border = 1;
settingsWindow.grow = 0; settingsWindow.title = "Status Settings Inspector";

var colorWindow = new JitterObject("jit.window", "status_col_" + uniqueID);
colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1;
colorWindow.grow = 0; colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];

var paletteWindow = new JitterObject("jit.window", "status_pal_" + uniqueID);
paletteWindow.floating = 1; paletteWindow.visible = 0; paletteWindow.border = 1;
paletteWindow.grow = 0; paletteWindow.title = "Status Palette"; paletteWindow.size = [330, 380];

var tickerWindow = new JitterObject("jit.window", "status_grd_" + uniqueID);
tickerWindow.floating = 1; tickerWindow.visible = 0; tickerWindow.border = 1;
tickerWindow.grow = 0; tickerWindow.title = "Grid Ticker"; tickerWindow.size = [200, 210];

var palette_pos_set  = false;
var settings_pos_set = false;
var color_pos_set    = false;

var outMatrix     = null;
var colorMatrix   = new JitterMatrix(4, "char", 200, 240);
var paletteMatrix = new JitterMatrix(4, "char", 330, 380);
var tickerMatrix  = new JitterMatrix(4, "char", 200, 210);

var settingsListener = null;
var colorListener    = null;
var paletteListener  = null;
var tickerListener   = null;

var active_pop_target    = -1;
var active_color_target  = "bg_color";
var active_ticker_column = -1;
var is_mouse_down_any    = 0;
var picker_drag_zone     = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

var scrollTask    = null;
var lastMouseX    = 0;
var lastMouseY    = 0;
var start_click_x = 0;
var start_click_y = 0;

var target_edit_slot = 0;

var holdTask       = null;
var isMouseDown    = 0;
var pendingSlot    = -1;
var clickStartX    = 0;
var clickStartY    = 0;
var isDragging     = 0;

var popHoldTask    = null;
var isPopMouseDown = 0;
var popPendingSlot = -1;
var popClickStartX = 0;
var popClickStartY = 0;
var isPopDragging  = 0;

var render_pending = 0;
var render_task = new Task(function() {
  render_pending = 0;
  draw_settings_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 60 };

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
  if (grid_cols > 1 && grid_rows > 1) {
    return [morph_x, morph_y];
  }
  return is_morphing ? morph_val : (active_slot + 1);
}

function setvalueof() {
  if (isDragging || isPopDragging || is_transmitting) return;

  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  if (args.length >= 2 && grid_cols > 1 && grid_rows > 1) {
    var px = parseFloat(args[0]);
    var py = parseFloat(args[1]);
    if (!isNaN(px) && !isNaN(py)) {
      morph_x = clamp(px, 1.0, grid_cols);
      morph_y = clamp(py, 1.0, grid_rows);
      apply_normalized_xy((morph_x - 1.0) / Math.max(1, grid_cols - 1), (morph_y - 1.0) / Math.max(1, grid_rows - 1));
    }
  } else {
    var f = parseFloat(args[0]);
    if (isNaN(f)) return;
    if (f % 1 !== 0) msg_float(f);
    else recall_slot(Math.round(f) - 1);
  }
}

// =============================================================
// 3. THEME BUS & COLOR UTILITIES
// =============================================================
var themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers) themeBus.subscribers = {};

function onThemeUpdate(theme) {
  if (!theme) return;
  try {
    if (theme.bg_color) bg_color = theme.bg_color.slice(0);
    if (theme.border_color) border_color = theme.border_color.slice(0);
    if (theme.text_color) text_color = theme.text_color.slice(0);
    if (theme.highlight_color) highlight_color = theme.highlight_color.slice(0);
    if (theme.border_radius !== undefined) border_radius = Number(theme.border_radius);
    if (theme.border_thickness !== undefined) border_thickness = Number(theme.border_thickness);
    if (theme.border_extension !== undefined) border_extension = Number(theme.border_extension);

    if (theme.pop_bgcolor) pop_bgcolor = theme.pop_bgcolor.slice(0);
    if (theme.attr_bg_color) attr_bg_color = theme.attr_bg_color.slice(0);
    if (theme.attr_border_color) attr_border_color = theme.attr_border_color.slice(0);
    if (theme.attr_slider_color) attr_slider_color = theme.attr_slider_color.slice(0);
    if (theme.attr_text_color) attr_text_color = theme.attr_text_color.slice(0);
    redraw_all();
  } catch(e) {}
}
themeBus.subscribers[uniqueID] = onThemeUpdate;
if (themeBus.theme) onThemeUpdate(themeBus.theme);

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

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
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = v; b = p; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
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

function redraw_all() {
  if (typeof mgraphics !== "undefined" && mgraphics && typeof mgraphics.redraw === "function") {
    mgraphics.redraw();
  }
  if (showSettings) draw_settings();
  if (tickerWindow && tickerWindow.visible) draw_grid_ticker();
}

function fit_text_to_width(ctx, txt, maxW) {
  if (!txt) return "";
  if (ctx.text_measure(txt)[0] <= maxW) return txt;
  var low = 0, high = txt.length;
  var best = "";
  while (low <= high) {
    var mid = (low + high) >> 1;
    var sub = txt.slice(0, mid);
    if (ctx.text_measure(sub)[0] <= maxW) {
      best = sub;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}

// =============================================================
// 4. ROBUST GRID SETUP & SYNCHRONIZATION
// =============================================================
function sync_grid_slots() {
  var total = grid_cols * grid_rows;
  if (total < 1) total = 1;

  while (slots.length < total) {
    var nextIdx = slots.length;
    var defName = (name_bank[nextIdx % name_bank.length]) || ("Status " + (nextIdx + 1));
    slots.push({ name: defName });
  }
  while (slots.length > total) {
    slots.pop();
  }
  if (active_slot >= slots.length) active_slot = Math.max(0, slots.length - 1);

  morph_weights = [];
  for (var i = 0; i < slots.length; i++) morph_weights.push(0.0);
}

function set_grid() {
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  var str = args.join(" ").trim();
  var parsedC = NaN;
  var parsedR = NaN;

  if (str.indexOf("/") !== -1) {
    var parts = str.split("/");
    parsedC = parseInt(parts[0], 10);
    parsedR = parseInt(parts[1], 10);
  } else if (args.length >= 2) {
    parsedC = parseInt(args[0], 10);
    parsedR = parseInt(args[1], 10);
  } else {
    parsedC = parseInt(args[0], 10);
  }

  if (!isNaN(parsedC) && parsedC >= 1) grid_cols = clamp(parsedC, 1, 99);
  if (!isNaN(parsedR) && parsedR >= 1) grid_rows = clamp(parsedR, 1, 99);

  sync_grid_slots();
  redraw_all();
  broadcast_to_master();

  if (typeof notifyclients === "function") notifyclients();
}
function get_grid() { return grid_cols + "/" + grid_rows; }

// =============================================================
// 5. 2D PURE SPATIAL MORPHING (HORIZ, VERT & DIAG)
// =============================================================
function apply_normalized_xy(normX, normY) {
  var cols = Math.max(1, grid_cols);
  var rows = Math.max(1, grid_rows);

  var u = clamp(normX, 0.0, 1.0) * (cols - 1);
  var v = clamp(normY, 0.0, 1.0) * (rows - 1);

  morph_x = 1.0 + u;
  morph_y = 1.0 + v;

  var c0 = Math.floor(u), c1 = Math.min(cols - 1, c0 + 1), fracU = u - c0;
  var r0 = Math.floor(v), r1 = Math.min(rows - 1, r0 + 1), fracV = v - r0;

  var wTL = (1.0 - fracU) * (1.0 - fracV);
  var wTR = fracU * (1.0 - fracV);
  var wBL = (1.0 - fracU) * fracV;
  var wBR = fracU * fracV;

  var idxTL = r0 * cols + c0;
  var idxTR = r0 * cols + c1;
  var idxBL = r1 * cols + c0;
  var idxBR = r1 * cols + c1;

  var newWeights = [];
  for (var i = 0; i < slots.length; i++) newWeights[i] = 0.0;

  if (idxTL < slots.length) newWeights[idxTL] += wTL;
  if (idxTR < slots.length) newWeights[idxTR] += wTR;
  if (idxBL < slots.length) newWeights[idxBL] += wBL;
  if (idxBR < slots.length) newWeights[idxBR] += wBR;

  morph_weights = newWeights;

  is_morphing = 1;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      // 1D Row or Column Layout (Smooth linear morph without edge jumps!)
      if (cols === 1 || rows === 1) {
        morph_val = (rows === 1) ? (1.0 + u) : (1.0 + v);
        active_slot = clamp(Math.round(morph_val) - 1, 0, slots.length - 1);
        target_edit_slot = active_slot;
        outlet(0, morph_val);
      } else {
        // 2D Grid Matrix (Cols > 1 AND Rows > 1)
        var sorted = [];
        for (var s = 0; s < slots.length; s++) sorted.push({ idx: s, w: newWeights[s] });
        sorted.sort(function(a, b) { return b.w - a.w; });

        var domA = sorted[0];
        var domB = sorted[1] || { idx: domA.idx, w: 0.0 };
        var sumW = domA.w + domB.w;
        var blendRatio = sumW > 0.001 ? (domB.w / sumW) : 0.0;

        active_slot = domA.idx;
        target_edit_slot = active_slot;

        if (domB.w > 0.01 && domA.idx !== domB.idx) {
          outlet(0, ["recall", domA.idx + 1, domB.idx + 1, blendRatio]);
        } else {
          outlet(0, domA.idx + 1);
        }
      }
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function calculate_2d_weights(localX, localY, totalW, totalH) {
  var cols = Math.max(1, grid_cols);
  var rows = Math.max(1, grid_rows);
  var padX = 4, padY = 4;
  var availW = Math.max(1, totalW - padX * 2);
  var availH = Math.max(1, totalH - padY * 2);
  var cellW = availW / cols;
  var cellH = availH / rows;

  var normX = cols > 1 ? clamp(((localX - padX) - 0.5 * cellW) / Math.max(1, availW - cellW), 0.0, 1.0) : 0.0;
  var normY = rows > 1 ? clamp(((localY - padY) - 0.5 * cellH) / Math.max(1, availH - cellH), 0.0, 1.0) : 0.0;

  apply_normalized_xy(normX, normY);
}

// =============================================================
// 6. SUB-WINDOW: 4-SLIDER GRID TICKER (200 x 210)
// =============================================================
function open_grid_ticker_window(anchorX, anchorY) {
  var winW = 200, winH = 210;
  tickerWindow.size = [winW, winH];
  if (anchorX !== undefined && anchorY !== undefined) {
    tickerWindow.pos = [anchorX, anchorY];
  }
  tickerWindow.visible = 1;
  tickerWindow.front();
  draw_grid_ticker();
}

function draw_grid_ticker() {
  if (!tickerWindow.visible) return;
  var winW = 200, winH = 210;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);

  var ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, winW, winH);
  ctx.fill();

  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
  ctx.move_to(28, 17);
  ctx.show_text("Grid Matrix Picker");

  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.3);
  ctx.set_line_width(0.8);
  ctx.move_to(8, 26); ctx.line_to(winW - 8, 26); ctx.stroke();

  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(10, 32, winW - 20, 18, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(10, 32, winW - 20, 18, 3, 3);
  ctx.stroke();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9.5);
  ctx.set_source_rgba(highlight_color);
  var bannerStr = "Grid: " + grid_cols + " Cols  /  " + grid_rows + " Rows (" + (grid_cols * grid_rows) + " Slots)";
  var bTm = ctx.text_measure(bannerStr);
  ctx.move_to((winW - (bTm ? bTm[0] : 100)) * 0.5, 44.5);
  ctx.show_text(bannerStr);

  var x_tens = Math.floor(grid_cols / 10) % 10;
  var x_ones = grid_cols % 10;
  var y_tens = Math.floor(grid_rows / 10) % 10;
  var y_ones = grid_rows % 10;
  var digits = [x_tens, x_ones, y_tens, y_ones];

  var trackW = 28, trackH = 100, trackY = 58;
  var slotX = [18, 52, 120, 154];

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(24);
  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
  var slashTm = ctx.text_measure("/");
  ctx.move_to(86 + (28 - slashTm[0]) * 0.5, trackY + trackH * 0.5 + 8);
  ctx.show_text("/");

  for (var i = 0; i < 4; i++) {
    var sx = slotX[i];

    ctx.set_source_rgba(0.08, 0.08, 0.10, 0.9);
    ctx.rectangle_rounded(sx, trackY, trackW, trackH, 3, 3);
    ctx.fill();

    var dVal = digits[i];
    var fillH = clamp((dVal / 9.0) * trackH, 0, trackH);

    ctx.set_source_rgba(i === active_ticker_column ? highlight_color : attr_slider_color);
    ctx.rectangle_rounded(sx, trackY + trackH - fillH, trackW, fillH, 2, 2);
    ctx.fill();

    ctx.set_source_rgba(attr_border_color);
    ctx.set_line_width(0.8);
    ctx.rectangle_rounded(sx, trackY, trackW, trackH, 3, 3);
    ctx.stroke();

    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(11);
    ctx.set_source_rgba(attr_text_color);
    var dStr = String(dVal);
    var dTm = ctx.text_measure(dStr);
    ctx.move_to(sx + (trackW - dTm[0]) * 0.5, trackY + trackH + 16);
    ctx.show_text(dStr);
  }

  ctx.select_font_face("Arial", "normal", "normal");
  ctx.set_font_size(8);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.5);
  ctx.move_to(26, trackY + trackH + 30); ctx.show_text("COLS (1-99)");
  ctx.move_to(128, trackY + trackH + 30); ctx.show_text("ROWS (1-99)");

  var img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function apply_grid_ticker_column(colIdx, my) {
  var trackH = 100, trackY = 58;
  var d = clamp(Math.round(((trackY + trackH) - my) / trackH * 9.0), 0, 9);

  var x_tens = Math.floor(grid_cols / 10) % 10;
  var x_ones = grid_cols % 10;
  var y_tens = Math.floor(grid_rows / 10) % 10;
  var y_ones = grid_rows % 10;

  if (colIdx === 0) x_tens = d;
  else if (colIdx === 1) x_ones = d;
  else if (colIdx === 2) y_tens = d;
  else if (colIdx === 3) y_ones = d;

  var newC = clamp(x_tens * 10 + x_ones, 1, 99);
  var newR = clamp(y_tens * 10 + y_ones, 1, 99);

  set_grid(newC, newR);
  draw_grid_ticker();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; active_ticker_column = -1; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { active_ticker_column = -1; return; }

    if (mbut) {
      if (mx < 24 && my < 24) { tickerWindow.visible = 0; active_ticker_column = -1; return; }

      var trackW = 28, trackH = 100, trackY = 58;
      var slotX = [18, 52, 120, 154];

      if (active_ticker_column === -1) {
        for (var i = 0; i < 4; i++) {
          if (mx >= slotX[i] && mx <= slotX[i] + trackW && my >= trackY && my <= trackY + trackH) {
            active_ticker_column = i;
            break;
          }
        }
      }

      if (active_ticker_column !== -1) {
        apply_grid_ticker_column(active_ticker_column, my);
      }
    }
  }
}
tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);

// =============================================================
// 7. ABBREVIATION ENGINE
// =============================================================
function apply_case(str, c_mode) {
  if (!str || typeof str !== "string") return "";
  if (c_mode === 1) return str.toUpperCase();
  if (c_mode === 2) return str.toLowerCase();
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\w/g, function(m) { return m.toUpperCase(); });
}

function get_display_label(rawTxt) {
  if (!rawTxt || typeof rawTxt !== "string") return "";
  if (label_mode === 4) return "";

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
      resWords.push(w.charAt(0) + w.slice(1).replace(/[aeiouAEIOU]/g, ""));
    }
    return resWords.join(" ").trim();
  }

  return apply_case(rawTxt, case_mode);
}

// =============================================================
// 8. VECTOR DRAW ENGINE
// =============================================================
function drawCorners(ctx, x, y, w, h, r, ew, eh, col, thick) {
  ctx.set_source_rgba(col);
  ctx.set_line_width(thick);

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); else ctx.move_to(x, y);
  ctx.line_to(x + r + ew, y); ctx.move_to(x, y + r); ctx.line_to(x, y + r + eh); ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0); else ctx.move_to(x + w, y);
  ctx.line_to(x + w, y + r + eh); ctx.move_to(x + w - r - ew, y); ctx.line_to(x + w - r, y); ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); else ctx.move_to(x + w, y + h);
  ctx.line_to(x + w - r - ew, y + h); ctx.move_to(x + w, y + h - r); ctx.line_to(x + w, y + h - r - eh); ctx.stroke();

  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI); else ctx.move_to(x, y + h);
  ctx.line_to(x, y + h - r - eh); ctx.move_to(x + r + ew, y + h); ctx.line_to(x + r, y + h); ctx.stroke();
}

function draw_status_strip(ctx, w, h, is_preview) {
  var b = isNaN(border_thickness) ? 1.2 : border_thickness;
  var inset = b * 0.5;
  var rw = Math.max(1, w - b);
  var rh = Math.max(1, h - b);
  var radVal = isNaN(border_radius) ? 4.0 : border_radius;
  var r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
  var extVal = isNaN(border_extension) ? 6.0 : border_extension;
  var ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  var eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  ctx.set_source_rgba(bg_color);
  ctx.rectangle_rounded(inset, inset, rw, rh, r, r);
  ctx.fill();

  if (b > 0) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  var cols = Math.max(1, grid_cols);
  var rows_count = Math.max(1, grid_rows);
  var padX = 4, padY = 4;
  var availW = rw - padX * 2;
  var availH = rh - padY * 2;
  var cellW = availW / cols;
  var cellH = availH / rows_count;

  for (var i = 0; i < slots.length; i++) {
    var c = i % cols;
    var row = Math.floor(i / cols);

    var sX = inset + padX + c * cellW;
    var sY = inset + padY + row * cellH;
    var sW = cellW - 3;
    var sH = cellH - 3;

    var highlightAlpha = 0.0;
    if (is_morphing && morph_weights.length === slots.length) {
      highlightAlpha = morph_weights[i] || 0.0;
    } else if (is_morphing) {
      var fPos = morph_val - 1.0;
      var floorIdx = Math.floor(fPos);
      var ceilIdx = Math.min(slots.length - 1, floorIdx + 1);
      var frac = fPos - floorIdx;
      if (i === floorIdx) highlightAlpha = 1.0 - frac;
      else if (i === ceilIdx) highlightAlpha = frac;
    } else {
      if (i === active_slot) highlightAlpha = 1.0;
    }

    ctx.set_source_rgba(0.16, 0.17, 0.20, 0.65);
    ctx.rectangle_rounded(sX, sY, sW, sH, 3, 3);
    ctx.fill();

    if (highlightAlpha > 0.01) {
      ctx.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], highlight_color[3] * highlightAlpha);
      ctx.rectangle_rounded(sX, sY, sW, sH, 3, 3);
      ctx.fill();
    }

    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.3);
    ctx.set_line_width(0.75);
    ctx.rectangle_rounded(sX, sY, sW, sH, 3, 3);
    ctx.stroke();

    ctx.select_font_face(font_name, "normal", "bold");
    ctx.set_font_size(Math.max(7, Math.min(10, sH * 0.28)));
    ctx.set_source_rgba(highlightAlpha > 0.4 ? [1, 1, 1, 0.9] : [0.55, 0.58, 0.64, 0.8]);
    ctx.move_to(sX + 4, sY + Math.max(8, sH * 0.28));
    ctx.show_text(String(i + 1));

    var dispTxt = get_display_label(slots[i].name);
    var weightStr = (highlightAlpha > 0.4) ? "bold" : font_weights[font_style];
    ctx.select_font_face(font_name, font_slants[font_style], weightStr);
    var curFontSize = Math.max(8, Math.min(text_size, sH * 0.45));
    ctx.set_font_size(curFontSize);
    ctx.set_source_rgba(text_color);

    dispTxt = fit_text_to_width(ctx, dispTxt, sW - 6);
    var tm = ctx.text_measure(dispTxt);
    ctx.move_to(sX + (sW - tm[0]) * 0.5, sY + sH * 0.5 + curFontSize * 0.33);
    ctx.show_text(dispTxt);
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
  var sz = mgraphics.size;
  draw_status_strip(mgraphics, sz[0], sz[1], false);
}

// =============================================================
// 9. ATTRUI INSPECTOR WINDOW
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  if (mask_performance === 1) {
    list.push({ name: "Grid (Cols/Rows)", val: get_grid(), is_ticker: true, target_id: 100 });
    list.push({ name: "Hold to Edit", val: allow_hold_edit ? "ON" : "OFF", is_toggle: true, target_id: 101 });
    list.push({ name: "Hold Time", val: hold_threshold + "ms", pct: (hold_threshold - 150) / 850.0, is_slider: true, target_id: 102 });
  }

  if (mask_labels === 1) {
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 201 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 203 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 8) / 16.0, is_slider: true, target_id: 204 });
  }

  if (mask_geometry === 1) {
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 301 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 302 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 303 });
  }

  if (mask_colors === 1) {
    list.push({ name: "BG Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Highlight", val: highlight_color, is_color: true, key: "highlight_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
  }

  if (mask_popup_colors === 1) {
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_settings_dimensions() {
  var rows = get_visible_rows_map();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  var previewH = Math.max(50, grid_rows * 32 + 10);
  var calculated_h = 28 + previewH + 16 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_settings_dimensions() {
  if (showSettings && allow_popup === 1) {
    var dims = get_settings_dimensions();
    settingsWindow.size = [dims.w, dims.h];

    if (!settings_pos_set && this.box && this.box.rect) {
      settingsWindow.pos = [this.box.rect[0], this.box.rect[1] - dims.h - 10];
      settings_pos_set = true;
    }

    settingsWindow.visible = 1;
    settingsWindow.front();
    draw_settings();
  } else {
    settingsWindow.visible = 0;
    colorWindow.visible = 0;
    tickerWindow.visible = 0;
  }
}

function draw_settings() {
  if (!showSettings || allow_popup !== 1) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_settings_deferred() {
  if (!showSettings || allow_popup !== 1) return;
  var dims = get_settings_dimensions();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  settingsWindow.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
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

  var prevX = 12, prevY = 28, prevW = w - 24;
  var prevH = has_rows ? Math.max(50, grid_rows * 32) : Math.max(50, h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_status_strip(pCtx, prevW, prevH, true);
  pCtx.restore();

  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    pCtx.move_to(w - 12, h - 4); pCtx.line_to(w - 4, h - 12);
    pCtx.move_to(w - 8, h - 4);  pCtx.line_to(w - 4, h - 8);
    pCtx.stroke();
  }

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
        var tTm = pCtx.text_measure(String(r.val));
        pCtx.move_to(valBoxX + (valBoxW - (tTm ? tTm[0] : 20)) * 0.5, rY + 17);
        pCtx.show_text(String(r.val));
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        var fillW2 = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
        pCtx.set_source_rgba(attr_slider_color);
        pCtx.rectangle(valBoxX, vY, fillW2, vH);
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
  settingsWindow.jit_matrix(outMatrix.name);
}

function apply_slider_target(target_id, targetPct) {
  if (target_id === 102) set_hold_threshold(Math.round(150 + targetPct * 850));
  else if (target_id === 204) set_text_size(Math.round(8 + targetPct * 16));
  else if (target_id === 301) set_border_radius(targetPct * 25.0);
  else if (target_id === 302) set_border_thickness(targetPct * 10.0);
  else if (target_id === 303) set_border_extension(targetPct * 50.0);
  redraw_all();
}

function stop_pop_hold_watchdog() {
  isPopMouseDown = 0;
  popPendingSlot = -1;
  isPopDragging = 0;
  if (popHoldTask) {
    try { popHoldTask.cancel(); } catch(e) {}
    popHoldTask = null;
  }
}

function settingsWindowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; stop_pop_hold_watchdog(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = mbut === 1 && is_mouse_down_any === 0;
    is_mouse_down_any = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    var dims = get_settings_dimensions();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    if (mbut === 0) {
      is_resizing_window = 0;
      active_pop_target = -1;
      stop_pop_hold_watchdog();
      if (scrollTask) { scrollTask.cancel(); scrollTask = null; }
      return;
    }

    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(260, Math.min(start_resize_w + deltaW, 900));
      popup_mini_h = Math.max(90, Math.min(start_resize_h + deltaH, 500));
      update_settings_dimensions();
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

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      settingsWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
      stop_pop_hold_watchdog();
      redraw_all();
      return;
    }

    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_settings_dimensions();
      return;
    }

    if (my >= pr.y && my <= pr.y + pr.h && mx >= pr.x && mx <= pr.x + pr.w) {
      var localX = mx - pr.x;
      var localY = my - pr.y;

      if (is_pop_tap) {
        var cols = Math.max(1, grid_cols);
        var rows_count = Math.max(1, grid_rows);
        var padX = 4, padY = 4;
        var cellW = (pr.w - padX * 2) / cols;
        var cellH = (pr.h - padY * 2) / rows_count;

        var colHit = Math.floor((localX - padX) / cellW);
        var rowHit = Math.floor((localY - padY) / cellH);

        if (colHit >= 0 && colHit < cols && rowHit >= 0 && rowHit < rows_count) {
          var clickedIdx = rowHit * cols + colHit;
          if (clickedIdx >= 0 && clickedIdx < slots.length) {
            recall_slot(clickedIdx);
            if (showSettings) draw_settings();

            if (allow_hold_edit === 1) {
              stop_pop_hold_watchdog();
              isPopMouseDown = 1;
              popClickStartX = mx;
              popClickStartY = my;
              isPopDragging = 0;
              popPendingSlot = clickedIdx;

              popHoldTask = new Task(function() {
                if (isPopMouseDown === 1 && popPendingSlot !== -1 && !isPopDragging) {
                  var target = popPendingSlot;
                  stop_pop_hold_watchdog();
                  open_palette_for_slot(target);
                }
              }, this);
              popHoldTask.schedule(hold_threshold);
            }
          }
        }
      } else if (mbut === 1) {
        if (Math.abs(mx - popClickStartX) > 1 || Math.abs(my - popClickStartY) > 1) {
          stop_pop_hold_watchdog();
          isPopDragging = 1;
        }
        calculate_2d_weights(localX, localY, pr.w, pr.h);
        if (showSettings) draw_settings();
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
      var pctDrag = clamp((mx - valBoxX) / valBoxW, 0, 1);

      if (r.is_slider || r.pct !== undefined) {
        active_pop_target = r.target_id;
        apply_slider_target(r.target_id, pctDrag);

        if (scrollTask) { scrollTask.cancel(); scrollTask = null; }
        scrollTask = new Task(function() {
          if (active_pop_target === -1) return;
          var targetPct = clamp((lastMouseX - valBoxX) / valBoxW, 0, 1);
          apply_slider_target(active_pop_target, targetPct);
        }, this);
        scrollTask.interval = 15;
        scrollTask.repeat();
      } else if (is_pop_tap) {
        if (r.target_id === 100 || r.is_ticker) {
          var tickPosX = settingsWindow.pos ? settingsWindow.pos[0] + valBoxX : 100;
          var tickPosY = settingsWindow.pos ? settingsWindow.pos[1] + sY + rIdx * 28 + 14 : 100;
          open_grid_ticker_window(tickPosX, tickPosY);
        }
        else if (r.target_id === 101) set_allow_hold_edit(allow_hold_edit ? 0 : 1);
        else if (r.target_id === 201) set_label_mode((label_mode + 1) % 5);
        else if (r.target_id === 202) set_case_mode((case_mode + 1) % 3);
        else if (r.target_id === 203) set_font_style((font_style + 1) % 4);
        else if (r.is_color) {
          active_color_target = r.key;
          initPickerFromTarget();
          if (!color_pos_set && settingsWindow && settingsWindow.pos) {
            colorWindow.pos = [settingsWindow.pos[0] + valBoxX, settingsWindow.pos[1] + sY + rIdx * 28 + 14];
            color_pos_set = true;
          }
          colorWindow.visible = 1;
          colorWindow.front();
          draw_color_picker();
        }
      }
      draw_settings();
    }
  }
}
settingsListener = new JitterListener(settingsWindow.name, settingsWindowListenerCallback);

// =============================================================
// 10. COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "highlight_color") return highlight_color;
  if (name === "text_color") return text_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
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

function draw_color_picker() {
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
  ctx.move_to(28, 17);
  ctx.show_text("Color Picker");

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
  ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3); ctx.fill();

  var hIndX = hueX + cur_h * hueW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0); ctx.set_line_width(1.5);
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

  var svX = 10, svY = 50, svW = 180, svH = 115;
  var pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1.0, 1.0, 1.0, 1.0);
  satPat.add_color_stop_rgba(1.0, 1.0, 1.0, 1.0, 0.0);
  ctx.set_source(satPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0.0, 0.0, 0.0, 0.0);
  valPat.add_color_stop_rgba(1.0, 0.0, 0.0, 0.0, 1.0);
  ctx.set_source(valPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  var svIndX = svX + cur_s * svW;
  var svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
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
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0); ctx.set_line_width(1.5);
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

  var swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3); ctx.fill();

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
      if (mx < 24 && my < 24) { colorWindow.visible = 0; picker_drag_zone = 0; redraw_all(); return; }
      if (picker_drag_zone === 0) {
        if (mx >= 10 && mx <= 190 && my >= 24 && my <= 46) picker_drag_zone = 1;
        else if (mx >= 10 && mx <= 190 && my >= 48 && my <= 168) picker_drag_zone = 2;
        else if (mx >= 10 && mx <= 190 && my >= 170 && my <= 190) picker_drag_zone = 3;
      }
      if (picker_drag_zone === 1) cur_h = clamp((mx - 10) / 180, 0.0, 1.0);
      else if (picker_drag_zone === 2) {
        cur_s = clamp((mx - 10) / 180, 0.0, 1.0);
        cur_v = clamp(1.0 - (my - 50) / 115, 0.0, 1.0);
      } else if (picker_drag_zone === 3) cur_a = clamp((mx - 10) / 180, 0.0, 1.0);

      applyPickerToTarget();
      draw_color_picker();
    }
  }
}
colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);

// =============================================================
// 11. CLEAN STATUS PALETTE
// =============================================================
function open_palette_for_slot(slotIdx) {
  target_edit_slot = Math.max(0, Math.min(slots.length - 1, slotIdx));

  if (!palette_pos_set && this.box && this.box.rect) {
    paletteWindow.pos = [this.box.rect[0], this.box.rect[3] + 10];
    palette_pos_set = true;
  }

  paletteWindow.visible = 1;
  paletteWindow.front();
  draw_palette();
}

function close_palette() {
  paletteWindow.visible = 0;
  redraw_all();
}

function draw_palette() {
  if (!paletteWindow.visible) return;
  var w = 330, h = 380;
  paletteMatrix = recycleMatrix(paletteMatrix, w, h);

  var ctx = new MGraphics(w, h);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, w, h);
  ctx.fill();

  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 16, 5.5, 0, Math.PI * 2);
  ctx.fill();

  var actX = 32, actY = 7, actW = w - actX - 10, actH = 18;
  ctx.set_source_rgba(0.22, 0.23, 0.26, 0.95);
  ctx.rectangle_rounded(actX, actY, actW, actH, 3, 3);
  ctx.fill();

  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(actX, actY, actW, actH, 3, 3);
  ctx.stroke();

  ctx.select_font_face(font_name, "normal", "bold");
  ctx.set_font_size(9.5);
  ctx.set_source_rgba(1, 1, 1, 1);
  var currentName = slots[target_edit_slot] ? slots[target_edit_slot].name : "";
  var bannerTxt = "Slot " + (target_edit_slot + 1) + ": " + currentName;
  bannerTxt = fit_text_to_width(ctx, bannerTxt, actW - 12);
  var actTm = ctx.text_measure(bannerTxt);
  ctx.move_to(actX + (actW - actTm[0]) * 0.5, actY + 12.5);
  ctx.show_text(bannerTxt);

  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
  ctx.set_line_width(1.0);
  ctx.move_to(10, 32); ctx.line_to(w - 10, 32); ctx.stroke();

  ctx.select_font_face(font_name, "normal", "normal");
  ctx.set_font_size(9.5);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.7);
  ctx.move_to(12, 46);
  ctx.show_text("Tap a name below to stamp Slot " + (target_edit_slot + 1) + ":");

  var margin = 12, startY = 56, cols = 2, gap = 8;
  var cardW = (w - margin * 2 - gap) / cols;
  var cardH = 36;

  for (var i = 0; i < name_bank.length; i++) {
    var col = i % cols;
    var row = Math.floor(i / cols);
    var cX = margin + col * (cardW + gap);
    var cY = startY + row * (cardH + gap);
    if (cY + cardH > h - 10) break;

    ctx.set_source_rgba(attr_bg_color);
    ctx.rectangle_rounded(cX, cY, cardW, cardH, 4, 4);
    ctx.fill();

    ctx.set_source_rgba(attr_border_color);
    ctx.set_line_width(0.8);
    ctx.rectangle_rounded(cX, cY, cardW, cardH, 4, 4);
    ctx.stroke();

    ctx.select_font_face(font_name, font_slants[font_style], font_weights[font_style]);
    ctx.set_font_size(11);
    ctx.set_source_rgba(attr_text_color);
    var tm = ctx.text_measure(name_bank[i]);
    ctx.move_to(cX + (cardW - tm[0]) * 0.5, cY + cardH * 0.5 + 4.0);
    ctx.show_text(name_bank[i]);
  }

  var img = new Image(ctx);
  img.tonamedmatrix(paletteMatrix.name);
  paletteWindow.jit_matrix(paletteMatrix.name);
}

function paletteWindowListenerCallback(event) {
  if (event.eventname === "close") { close_palette(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;

    if (mx < 24 && my < 24) { close_palette(); return; }

    var margin = 12, startY = 56, cols = 2, gap = 8;
    var cardW = (330 - margin * 2 - gap) / cols;
    var cardH = 36;

    for (var i = 0; i < name_bank.length; i++) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cX = margin + col * (cardW + gap);
      var cY = startY + row * (cardH + gap);

      if (mx >= cX && mx <= cX + cardW && my >= cY && my <= cY + cardH) {
        stamp_name_to_slot(target_edit_slot, name_bank[i]);
        draw_palette();
        return;
      }
    }
  }
}
paletteListener = new JitterListener(paletteWindow.name, paletteWindowListenerCallback);

// =============================================================
// 12. RECALL, STORE & MORPH ENGINE
// =============================================================
function recall_slot(idx) {
  if (idx < 0 || idx >= slots.length) return;
  active_slot = idx;
  target_edit_slot = idx;
  morph_val = active_slot + 1;
  is_morphing = 0;

  var cols = Math.max(1, grid_cols);
  var col = active_slot % cols;
  var row = Math.floor(active_slot / cols);
  morph_x = 1.0 + col;
  morph_y = 1.0 + row;

  morph_weights = [];
  for (var i = 0; i < slots.length; i++) morph_weights[i] = (i === active_slot ? 1.0 : 0.0);

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, active_slot + 1);
      outlet(1, ["set", slots[active_slot].name]);
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function msg_float(v) {
  if (isDragging || isPopDragging) return;

  var f = parseFloat(v);
  if (isNaN(f)) return;
  var totalSlots = slots.length;
  if (totalSlots < 1) return;

  f = Math.max(1.0, Math.min(totalSlots, f));
  morph_val = f;
  is_morphing = 1;

  var fPos = morph_val - 1.0;
  var floorIdx = Math.floor(fPos);
  var ceilIdx = Math.min(slots.length - 1, floorIdx + 1);
  var frac = fPos - floorIdx;

  var newWeights = [];
  for (var i = 0; i < slots.length; i++) newWeights[i] = 0.0;
  if (floorIdx < slots.length) newWeights[floorIdx] = 1.0 - frac;
  if (ceilIdx < slots.length) newWeights[ceilIdx] += frac;
  morph_weights = newWeights;

  active_slot = Math.round(f) - 1;
  target_edit_slot = active_slot;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, f);
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function stamp_name_to_slot(slotIdx, chosenName) {
  if (slotIdx < 0 || slotIdx >= slots.length) return;
  slots[slotIdx].name = chosenName;
  active_slot = slotIdx;
  target_edit_slot = slotIdx;
  morph_val = slotIdx + 1;
  is_morphing = 0;

  morph_weights = [];
  for (var i = 0; i < slots.length; i++) morph_weights[i] = (i === active_slot ? 1.0 : 0.0);

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, ["store", active_slot + 1]);
      outlet(1, ["set", chosenName]);
      trigger_auto_write(); // Auto-save to states!
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  if (paletteWindow.visible) draw_palette();
  broadcast_to_master();
}

// =============================================================
// 13. MOUSE & 2D DRAG MORPH (CANVAS)
// =============================================================
function stop_hold_watchdog() {
  isMouseDown = 0;
  pendingSlot = -1;
  isDragging = 0;
  if (holdTask) {
    try { holdTask.cancel(); } catch(e) {}
    holdTask = null;
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var sz = mgraphics.size;
  var w = sz[0], h = sz[1];

  if (allow_popup === 1) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var dotX = w - dotMargin, dotY = dotMargin;
    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= 8.0 || ctrl === 1) {
      showSettings = showSettings ? 0 : 1;
      update_settings_dimensions();
      return;
    }
  }

  var cols = Math.max(1, grid_cols);
  var rows_count = Math.max(1, grid_rows);
  var padX = 4, padY = 4;
  var cellW = (w - padX * 2) / cols;
  var cellH = (h - padY * 2) / rows_count;

  var colHit = Math.floor((x - padX) / cellW);
  var rowHit = Math.floor((y - padY) / cellH);

  if (colHit < 0 || colHit >= cols || rowHit < 0 || rowHit >= rows_count) return;
  var clickedSlot = rowHit * cols + colHit;
  if (clickedSlot < 0 || clickedSlot >= slots.length) return;

  recall_slot(clickedSlot);

  if (allow_hold_edit !== 1) return;

  stop_hold_watchdog();
  isMouseDown = 1;
  isDragging = 0;
  clickStartX = x;
  clickStartY = y;
  pendingSlot = clickedSlot;

  holdTask = new Task(function() {
    if (isMouseDown === 1 && pendingSlot !== -1 && !isDragging) {
      var target = pendingSlot;
      stop_hold_watchdog();
      open_palette_for_slot(target);
    }
  }, this);
  holdTask.schedule(hold_threshold);
}

function ondrag(x, y, button) {
  if (button === 0) {
    stop_hold_watchdog();
    isDragging = 0;
    return;
  }

  if (Math.abs(x - clickStartX) > 1 || Math.abs(y - clickStartY) > 1) {
    stop_hold_watchdog();
    isDragging = 1;
  }

  var sz = mgraphics.size;
  calculate_2d_weights(x, y, sz[0], sz[1]);
}

function onidle() { if (isMouseDown) stop_hold_watchdog(); }
function onidleout() { stop_hold_watchdog(); }

// =============================================================
// 14. INLET DISPATCHER
// =============================================================
function msg_int(v) { recall_slot(parseInt(v, 10) - 1); }

function rename() {
  var args = arrayfromargs(arguments);
  if (args.length < 2) return;
  var num = parseInt(args[0], 10);
  if (isNaN(num) || num < 1) return;
  var idx = num - 1;
  var newName = args.slice(1).join(" ").trim();
  if (!newName) return;

  while (name_bank.length <= idx) {
    name_bank.push("Status " + (name_bank.length + 1));
  }
  name_bank[idx] = newName;

  if (paletteWindow && paletteWindow.visible) draw_palette();
  if (typeof notifyclients === "function") notifyclients();
}

function rename_slot() {
  var args = arrayfromargs(arguments);
  if (args.length < 2) return;
  var num = parseInt(args[0], 10);
  if (isNaN(num) || num < 1) return;
  var idx = num - 1;
  var newName = args.slice(1).join(" ").trim();
  if (idx >= 0 && idx < slots.length && newName) {
    slots[idx].name = newName;
    if (!is_transmitting) {
      is_transmitting = true;
      try {
        outlet(0, ["store", idx + 1]);
        trigger_auto_write(); // Auto-save to states!
      } finally {
        is_transmitting = false;
      }
    }
    redraw_all();
    broadcast_to_master();
  }
}

function text() {
  var args = arrayfromargs(arguments);
  var str = args.join(" ").trim();
  if (!str) return;

  if (paletteWindow.visible && target_edit_slot !== -1) {
    stamp_name_to_slot(target_edit_slot, str);
  } else {
    if (slots[active_slot]) {
      slots[active_slot].name = str;
      if (!is_transmitting) {
        is_transmitting = true;
        try {
          outlet(0, ["store", active_slot + 1]);
          trigger_auto_write(); // Auto-save to states!
        } finally {
          is_transmitting = false;
        }
      }
      redraw_all();
      broadcast_to_master();
    }
  }
}

function names() {
  var args = arrayfromargs(arguments);
  if (args.length === 0) return;
  name_bank = [];
  for (var i = 0; i < args.length; i++) name_bank.push(String(args[i]));
  if (paletteWindow.visible) draw_palette();
}

function add_name() {
  var args = arrayfromargs(arguments);
  name_bank.push(args.join(" ").trim());
  if (paletteWindow.visible) draw_palette();
}

function popup(v) {
  if (v === undefined) showSettings = !showSettings;
  else showSettings = (Number(v) > 0) ? 1 : 0;
  update_settings_dimensions();
}

function palette(v) {
  if (v === undefined || Number(v) > 0) open_palette_for_slot(active_slot);
  else close_palette();
}

var statusBus = new Global("touch_status_bus");
if (!statusBus.clients) statusBus.clients = {};
if (!statusBus.subscribers) statusBus.subscribers = {};
if (!statusBus.ping_listeners) statusBus.ping_listeners = {};

statusBus.ping_listeners[uniqueID] = function() {
  broadcast_to_master();
};

function broadcast_to_master() {
  var exportedNames = [];
  for (var i = 0; i < slots.length; i++) exportedNames.push(slots[i].name);

  statusBus.clients[module_name] = {
    id: uniqueID,
    name: module_name,
    num_slots: slots.length,
    cols: grid_cols,
    rows: grid_rows,
    active_slot: active_slot,
    morph_val: morph_val,
    morph_x: morph_x,
    morph_y: morph_y,
    slot_names: exportedNames,
    recall: function(idx) { recall_slot(idx); },
    morph: function(val) { msg_float(val); }
  };

  if (statusBus.subscribers) {
    for (var subKey in statusBus.subscribers) {
      if (typeof statusBus.subscribers[subKey] === "function") {
        try {
          statusBus.subscribers[subKey](module_name, active_slot, morph_val);
        } catch(e) {}
      }
    }
  }

  try { messnamed("touch_status_bus", "refresh"); } catch(e) {}
}

// =============================================================
// 15. ATTRIBUTES, GETTERS & SETTERS
// =============================================================
function set_name_bank_attr() {
  var args = arrayfromargs(arguments);
  var str = args.join(" ").trim();
  if (!str) return;

  var items = [];
  if (str.indexOf(",") !== -1) {
    var parts = str.split(",");
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].trim();
      if (t.length > 0) items.push(t);
    }
  } else {
    var re = /"([^"]+)"|'([^']+)'|([^\s",]+)/g;
    var match;
    while ((match = re.exec(str)) !== null) {
      items.push(match[1] || match[2] || match[3]);
    }
  }

  if (items.length > 0) {
    name_bank = items;
    if (paletteWindow && paletteWindow.visible) draw_palette();
  }
}
function get_name_bank_attr() { return name_bank.join(", "); }

function set_name(v) {
  var oldName = module_name;
  module_name = String(v).trim().replace(/\s+/g, "_");
  if (statusBus && statusBus.clients && oldName !== module_name) {
    delete statusBus.clients[oldName];
  }
  broadcast_to_master();
  sync_storage_identity(); // Syncs pattrstorage name + reads new json file!
}
function get_name() { return module_name; }

function set_allow_hold_edit(v) { allow_hold_edit = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_allow_hold_edit() { return allow_hold_edit; }
function set_hold_threshold(v) { hold_threshold = Math.max(150, parseInt(v, 10)); }
function get_hold_threshold() { return hold_threshold; }
function set_label_mode(v) { var p = parseInt(v, 10); if (!isNaN(p)) label_mode = Math.max(0, Math.min(4, p)); redraw_all(); }
function get_label_mode() { return label_mode; }
function set_case_mode(v) { var p = parseInt(v, 10); if (!isNaN(p)) case_mode = Math.max(0, Math.min(2, p)); redraw_all(); }
function get_case_mode() { return case_mode; }
function set_font_style(v) { var p = parseInt(v, 10); if (!isNaN(p)) font_style = Math.max(0, Math.min(3, p)); redraw_all(); }
function get_font_style() { return font_style; }
function set_text_size(v) { var p = parseInt(v, 10); if (!isNaN(p)) text_size = Math.max(8, p); redraw_all(); }
function get_text_size() { return text_size; }
function set_border_radius(v) { var p = parseFloat(v); if (!isNaN(p)) border_radius = Math.max(0, p); redraw_all(); }
function get_border_radius() { return border_radius; }
function set_border_thickness(v) { var p = parseFloat(v); if (!isNaN(p)) border_thickness = Math.max(0, p); redraw_all(); }
function get_border_thickness() { return border_thickness; }
function set_border_extension(v) { var p = parseFloat(v); if (!isNaN(p)) border_extension = Math.max(0, p); redraw_all(); }
function get_border_extension() { return border_extension; }
function set_allow_popup(v) {
  allow_popup = parseInt(v, 10) ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0; settingsWindow.visible = 0; colorWindow.visible = 0; tickerWindow.visible = 0;
  }
  redraw_all();
}
function get_allow_popup() { return allow_popup; }
function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(260, Math.min(pw, 900));
  if (!isNaN(ph)) popup_mini_h = Math.max(90, Math.min(ph, 500));
  update_settings_dimensions();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function set_bg_color() { bg_color = rgba_values(arguments, bg_color); redraw_all(); }
function get_bg_color() { return bg_color; }
function set_border_color() { border_color = rgba_values(arguments, border_color); redraw_all(); }
function get_border_color() { return border_color; }
function set_highlight_color() { highlight_color = rgba_values(arguments, highlight_color); redraw_all(); }
function get_highlight_color() { return highlight_color; }
function set_text_color() { text_color = rgba_values(arguments, text_color); redraw_all(); }
function get_text_color() { return text_color; }
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
function set_show_settings_attrs(v) { show_settings_attrs = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_show_settings_attrs() { return show_settings_attrs; }
function set_mask_performance(v) { mask_performance = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_mask_performance() { return mask_performance; }
function set_mask_labels(v) { mask_labels = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_mask_labels() { return mask_labels; }
function set_mask_geometry(v) { mask_geometry = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_mask_geometry() { return mask_geometry; }
function set_mask_colors(v) { mask_colors = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_mask_colors() { return mask_colors; }
function set_mask_popup_colors(v) { mask_popup_colors = parseInt(v, 10) ? 1 : 0; update_settings_dimensions(); }
function get_mask_popup_colors() { return mask_popup_colors; }

function anything() {
  var args = arrayfromargs(arguments);
  var rawMsg = messagename.trim();

  var slashMatch = rawMsg.match(/^(\d+)\/(\d+)$/);
  if (slashMatch) {
    set_grid(rawMsg);
    return;
  }

  if (rawMsg === "grid" || rawMsg === "layout") {
    set_grid.apply(this, args);
    return;
  }

  var name = rawMsg.replace(/^set_?/, "").toLowerCase();

  if (name === "update" || name === "theme_update" || name === "refresh" || name === "refresh_theme") {
    if (themeBus && themeBus.theme) onThemeUpdate(themeBus.theme);
    redraw_all();
    return;
  }
  if (name === "ping" || name === "rebroadcast") {
    broadcast_to_master();
    return;
  }
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (name === "font_color") name = "text_color";
  if (name === "dot_color") name = "popup_dot_color";

  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
  redraw_all();
}

declareattribute("grid", { type: "symbol", label: "Grid Layout (Cols/Rows)", setter: "set_grid", getter: "get_grid", category: "Status Config", embed: 1 });
declareattribute("name_bank", { type: "symbol", label: "Available Name Bank", setter: "set_name_bank_attr", getter: "get_name_bank_attr", category: "Status Config", embed: 1 });
declareattribute("name", { type: "symbol", label: "Module ID / Name", setter: "set_name", getter: "get_name", category: "Status Config", embed: 1 });
declareattribute("allow_hold_edit", { type: "int", style: "onoff", label: "Allow Hold to Edit", setter: "set_allow_hold_edit", getter: "get_allow_hold_edit", category: "Performance", embed: 1 });
declareattribute("hold_threshold", { type: "int", label: "Hold Time (ms)", setter: "set_hold_threshold", getter: "get_hold_threshold", category: "Performance", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Strip Label Style", setter: "set_label_mode", getter: "get_label_mode", category: "Typography", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Strip Case Style", setter: "set_case_mode", getter: "get_case_mode", category: "Typography", embed: 1 });
declareattribute("font_style", { type: "int", style: "enumindex", enumvals: ["Regular", "Bold", "Italic", "Bold Italic"], label: "Font Style", setter: "set_font_style", getter: "get_font_style", category: "Typography", embed: 1 });
declareattribute("text_size", { type: "int", label: "Font Size", setter: "set_text_size", getter: "get_text_size", category: "Typography", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Geometry", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Geometry", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Geometry", embed: 1 });

declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Settings Dot", setter: "set_allow_popup", getter: "get_allow_popup", category: "Popup Masks", embed: 1 });
declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", setter: "set_show_settings_attrs", getter: "get_show_settings_attrs", category: "Popup Masks", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", setter: "set_mask_performance", getter: "get_mask_performance", category: "Popup Masks", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", setter: "set_mask_labels", getter: "get_mask_labels", category: "Popup Masks", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", setter: "set_mask_geometry", getter: "get_mask_geometry", category: "Popup Masks", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Colors", setter: "set_mask_colors", getter: "get_mask_colors", category: "Popup Masks", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", setter: "set_mask_popup_colors", getter: "get_mask_popup_colors", category: "Popup Masks", embed: 1 });

declareattribute("bg_color", { type: "rgba", style: "rgba", label: "Background Color", setter: "set_bg_color", getter: "get_bg_color", category: "Status Colors", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", setter: "set_border_color", getter: "get_border_color", category: "Status Colors", embed: 1 });
declareattribute("highlight_color", { type: "rgba", style: "rgba", label: "Highlight Color", setter: "set_highlight_color", getter: "get_highlight_color", category: "Status Colors", embed: 1 });
declareattribute("text_color", { type: "rgba", style: "rgba", label: "Text Color", setter: "set_text_color", getter: "get_text_color", category: "Status Colors", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", setter: "set_popup_dot_color", getter: "get_popup_dot_color", category: "Status Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

function save() {
  embedmessage("grid", get_grid());
  embedmessage("set_name_bank_attr", get_name_bank_attr());
  embedmessage("set_name", module_name);
  embedmessage("set_allow_hold_edit", allow_hold_edit);
  embedmessage("set_hold_threshold", hold_threshold);
  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_font_style", font_style);
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

  embedmessage("set_bg_color", bg_color[0], bg_color[1], bg_color[2], bg_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_highlight_color", highlight_color[0], highlight_color[1], highlight_color[2], highlight_color[3]);
  embedmessage("set_text_color", text_color[0], text_color[1], text_color[2], text_color[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  var sList = [];
  for (var i = 0; i < slots.length; i++) sList.push(slots[i].name);
  embedmessage("set_slots_saved", encodeURIComponent(JSON.stringify(sList)));

  if (grid_cols > 1 && grid_rows > 1) {
    embedmessage("setvalueof", morph_x, morph_y);
  } else {
    embedmessage("msg_float", morph_val);
  }
}

function set_slots_saved(str) {
  if (!str) return;
  try {
    var arr = JSON.parse(decodeURIComponent(str));
    if (Array.isArray(arr) && arr.length > 0) {
      slots = [];
      for (var i = 0; i < arr.length; i++) slots.push({ name: String(arr[i]) });
      redraw_all();
      return;
    }
  } catch(e) {}

  var raw = String(str).split(";");
  slots = [];
  for (var j = 0; j < raw.length; j++) {
    if (raw[j].trim().length > 0) slots.push({ name: raw[j].trim() });
  }
  redraw_all();
}

function notifydeleted() {
  stop_hold_watchdog();
  stop_pop_hold_watchdog();
  if (scrollTask) { try { scrollTask.cancel(); } catch(e) {} }
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];

  if (statusBus && statusBus.clients) delete statusBus.clients[module_name];
  if (statusBus && statusBus.ping_listeners) delete statusBus.ping_listeners[uniqueID];

  if (statusBus && statusBus.subscribers) {
    for (var subKey in statusBus.subscribers) {
      if (typeof statusBus.subscribers[subKey] === "function") {
        try { statusBus.subscribers[subKey](null, -1, 0); } catch(e) {}
      }
    }
  }

  try { if (settingsListener) settingsListener.subjectname = ""; } catch(e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}
  try { if (paletteListener) paletteListener.subjectname = ""; } catch(e) {}
  try { if (tickerListener) tickerListener.subjectname = ""; } catch(e) {}

  try { if (settingsWindow) settingsWindow.visible = 0; } catch(e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch(e) {}
  try { if (paletteWindow) paletteWindow.visible = 0; } catch(e) {}
  try { if (tickerWindow) tickerWindow.visible = 0; } catch(e) {}

  try { if (settingsWindow) settingsWindow.free(); } catch(e) {}
  try { if (colorWindow) colorWindow.free(); } catch(e) {}
  try { if (paletteWindow) paletteWindow.free(); } catch(e) {}
  try { if (tickerWindow) tickerWindow.free(); } catch(e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch(e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}
  try { if (paletteMatrix) paletteMatrix.freepeer(); } catch(e) {}
  try { if (tickerMatrix) tickerMatrix.freepeer(); } catch(e) {}

  try { messnamed("touch_status_bus", "refresh"); } catch(e) {}
}

sync_grid_slots();
broadcast_to_master();
redraw_all();

// Scheduled Auto-Sync on Boot (allows pattrstorage to wake up first)
var boot_task = new Task(function() {
  sync_storage_identity();
}, this);
boot_task.schedule(60);