// ============================================================================
// touch.status.js - Max 9 v8ui / jsui
// 2D Spatial Morph Grid (Cols/Rows) + Auto-States Management
// Interaction: UP-Click=Recall | Long-Hold=Save | Double-Tap=Popup | Drag=Morph
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "Inlet 0: int / float / [Cols/Rows] / text / messages");
setoutletassist(0, "Outlet 0: Commands to [pattrstorage] (recall, store, read, write, name)");
setoutletassist(1, "Outlet 1: Selected status info (set <name>)");
setoutletassist(2, "Outlet 2: Storage messages (name, read, write)");

const uniqueID = Math.floor(Math.random() * 1000000);

if (this.box && !this.box.varname) {
  this.box.varname = `touch_status_${uniqueID}`;
}

let is_transmitting = false;

// =============================================================
// INTERNAL GPS & AUTO-STORAGE SYSTEM
// =============================================================
function get_states_dir() {
  try {
    const f = new File("states_anchor.txt");
    if (f.isopen) {
      let d = f.foldername;
      f.close();
      if (d.charAt(d.length - 1) !== "/") d += "/";
      return d;
    }
  } catch(e) {}
  try {
    const f2 = new File("touch_theme_presets.json");
    if (f2.isopen) {
      let d2 = f2.foldername;
      f2.close();
      if (d2.charAt(d2.length - 1) !== "/") d2 += "/";
      return d2;
    }
  } catch(e) {}
  return "";
}

function get_states_filepath() {
  const dir = get_states_dir();
  const safeName = module_name ? module_name.replace(/\s+/g, "_") : `module_${uniqueID}`;
  return dir ? `${dir}${safeName}.json` : `${safeName}.json`;
}

function sync_storage_identity() {
  const fullpath = get_states_filepath();
  outlet(0, ["name", module_name]);
  outlet(0, ["read", fullpath]);
  outlet(2, ["name", module_name]);
  outlet(2, ["read", fullpath]);
}

function trigger_auto_write() {
  const fullpath = get_states_filepath();
  outlet(0, ["write", fullpath]);
  outlet(2, ["write", fullpath]);
}

// =============================================================
// 1. STATE & GRID TOPOLOGY (Cols / Rows)
// =============================================================
let module_name = `module_${uniqueID}`;
let active_slot = 0;
let last_stored_slot = -1; // Stays illuminated until next gesture
let morph_val   = 1.0;
let morph_x     = 1.0;
let morph_y     = 1.0;
let is_morphing = 0;

let grid_cols = 4;
let grid_rows = 1;
let morph_weights = [];

let slots = [
  { name: "S1" },
  { name: "S2" },
  { name: "Lead 80s" },
  { name: "Lead 80s" }
];

let name_bank = [
  "Init Status", "Clean Tone", "Warm Crunch", "Lead 80s",
  "Heavy Drive", "Solo Boost", "Ambient Pad", "Perc 3/8",
  "Drum 2/4", "Mute / Cut", "Sub Bass", "FX Riser"
];

// Gesture Lifecycle State
let allow_hold_save       = 1;
let hold_threshold        = 500; // ms for Long Press to Save
let double_tap_threshold  = 320; // ms window for Double-Tap to Popup
let last_tap_time         = 0;
let last_tap_slot         = -1;

let isMouseDown           = 0;
let pendingSlot           = -1;
let clickStartX           = 0;
let clickStartY           = 0;
let isDragging            = 0;
let has_dragged           = 0;
let has_saved_on_hold     = 0;
let suppress_release_recall = 0;
let holdTask              = null;

let allow_popup           = 1;

let label_mode       = 0;
const label_mode_names = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
let case_mode        = 0;
const case_mode_names  = ["First Cap", "All Cap", "All Small"];

let font_name        = "Arial";
let text_size        = 11;
let font_style       = 0;
const font_style_names = ["Regular", "Bold", "Italic", "Bold Italic"];
const font_slants      = ["normal", "normal", "italic", "italic"];
const font_weights     = ["normal", "bold", "normal", "bold"];

let border_radius    = 4.0;
let border_thickness = 1.2;
let border_extension = 6.0;

// Theme Colors (Connected to touch.master.js)
let bg_color          = [0.12, 0.12, 0.14, 0.95];
let border_color      = [0.45, 0.45, 0.50, 1.0];
let text_color        = [0.92, 0.94, 0.98, 1.0];
let highlight_color   = [0.85, 0.52, 0.20, 1.0];
let popup_dot_color   = [1.00, 0.00, 0.00, 1.0];
let accent_bar_color  = [1.00, 1.00, 1.00, 1.0]; // Synced to Knob / Line color in touch.master

let pop_bgcolor       = [0.10, 0.10, 0.12, 0.98];
let attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
let attr_border_color = [0.28, 0.28, 0.32, 1.0];
let attr_slider_color = [0.35, 0.38, 0.42, 1.0];
let attr_text_color   = [0.88, 0.88, 0.88, 1.0];

let show_settings_attrs = 1;
let mask_performance   = 1;
let mask_labels        = 1;
let mask_geometry      = 1;
let mask_colors        = 1;
let mask_popup_colors  = 1;

let showSettings       = 0;
let popup_window_width = 280;
let popup_mini_w       = 320;
let popup_mini_h       = 110;
let start_resize_w     = 320;
let start_resize_h     = 110;
let is_resizing_window = 0;

// =============================================================
// 2. LAZY-LOADED JITTER POPUP WINDOWS
// =============================================================
let settingsWindow = null;
let colorWindow    = null;
let paletteWindow  = null;
let tickerWindow   = null;

let settingsListener = null;
let colorListener    = null;
let paletteListener  = null;
let tickerListener   = null;

let outMatrix     = null;
let colorMatrix   = null;
let paletteMatrix = null;
let tickerMatrix  = null;

let palette_pos_set  = false;
let settings_pos_set = false;
let color_pos_set    = false;

function getSettingsWindow() {
  if (!settingsWindow) {
    settingsWindow = new JitterObject("jit.window", `status_set_${uniqueID}`);
    settingsWindow.floating = 1; settingsWindow.visible = 0; settingsWindow.border = 1;
    settingsWindow.grow = 0; settingsWindow.title = "Status Settings Inspector";
    settingsListener = new JitterListener(settingsWindow.name, settingsWindowListenerCallback);
  }
  return settingsWindow;
}

function getColorWindow() {
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", `status_col_${uniqueID}`);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1;
    colorWindow.grow = 0; colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];
    colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
  return colorWindow;
}

function getPaletteWindow() {
  if (!paletteWindow) {
    paletteWindow = new JitterObject("jit.window", `status_pal_${uniqueID}`);
    paletteWindow.floating = 1; paletteWindow.visible = 0; paletteWindow.border = 1;
    paletteWindow.grow = 0; paletteWindow.title = "Status Palette"; paletteWindow.size = [330, 380];
    paletteListener = new JitterListener(paletteWindow.name, paletteWindowListenerCallback);
  }
  return paletteWindow;
}

function getTickerWindow() {
  if (!tickerWindow) {
    tickerWindow = new JitterObject("jit.window", `status_grd_${uniqueID}`);
    tickerWindow.floating = 1; tickerWindow.visible = 0; tickerWindow.border = 1;
    tickerWindow.grow = 0; tickerWindow.title = "Grid Ticker"; tickerWindow.size = [200, 210];
    tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);
  }
  return tickerWindow;
}

let active_pop_target    = -1;
let active_color_target  = "bg_color";
let active_ticker_column = -1;
let is_mouse_down_any    = 0;
let picker_drag_zone     = 0;
let cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

let scrollTask    = null;
let lastMouseX    = 0;
let lastMouseY    = 0;
let start_click_x = 0;
let start_click_y = 0;

let target_edit_slot = 0;

let popHoldTask          = null;
let isPopMouseDown       = 0;
let popPendingSlot       = -1;
let popClickStartX       = 0;
let popClickStartY       = 0;
let isPopDragging        = 0;
let pop_has_dragged      = 0;
let pop_has_saved_on_hold = 0;
let pop_suppress_recall  = 0;
let pop_last_tap_time    = 0;
let pop_last_tap_slot    = -1;

let render_pending = 0;
const render_task = new Task(() => {
  render_pending = 0;
  draw_settings_deferred();
}, this);

let cached_preview_rect = { x: 12, y: 28, w: 256, h: 60 };

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  const d = mat.dim;
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

  let args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  if (args.length >= 2 && grid_cols > 1 && grid_rows > 1) {
    const px = parseFloat(args[0]);
    const py = parseFloat(args[1]);
    if (!isNaN(px) && !isNaN(py)) {
      morph_x = clamp(px, 1.0, grid_cols);
      morph_y = clamp(py, 1.0, grid_rows);
      apply_normalized_xy((morph_x - 1.0) / Math.max(1, grid_cols - 1), (morph_y - 1.0) / Math.max(1, grid_rows - 1));
    }
  } else {
    const f = parseFloat(args[0]);
    if (isNaN(f)) return;
    if (f % 1 !== 0) msg_float(f);
    else recall_slot(Math.round(f) - 1);
  }
}

// =============================================================
// 3. THEME BUS & COLOR UTILITIES
// =============================================================
const themeBus = new Global("touch_theme_bus");
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

    // Accent Bar links directly to touch.master Knob / Line color
    if (theme.slider_handle_color) {
      accent_bar_color = theme.slider_handle_color.slice(0);
    } else if (theme.handle_color) {
      accent_bar_color = theme.handle_color.slice(0);
    }

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
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = (max === 0 ? 0 : d / max), v = max;
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
  let r, g, b, i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = v; b = p; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
  }
  return [r, g, b];
}

function rgba_values(args, fallback) {
  if (args === undefined || args === null) return fallback;
  let list = [];
  if (Array.isArray(args)) list = args;
  else if (typeof args === "object" && typeof args.length === "number") {
    for (let i = 0; i < args.length; i++) list.push(args[i]);
  } else list = [args];

  while (list.length === 1 && (Array.isArray(list[0]) || (typeof list[0] === "object" && list[0] !== null && typeof list[0].length === "number"))) {
    const inner = list[0];
    list = [];
    for (let j = 0; j < inner.length; j++) list.push(inner[j]);
  }
  if (list.length < 3) return fallback;
  const r = Number(list[0]), g = Number(list[1]), b = Number(list[2]);
  const a = list.length > 3 ? Number(list[3]) : 1.0;
  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return fallback;
  return [r, g, b, a];
}

function redraw_all() {
  if (typeof mgraphics !== "undefined" && mgraphics && typeof mgraphics.redraw === "function") {
    mgraphics.redraw();
  }
  if (showSettings && settingsWindow && settingsWindow.visible) draw_settings();
  if (tickerWindow && tickerWindow.visible) draw_grid_ticker();
}

function fit_text_to_width(ctx, txt, maxW) {
  if (!txt) return "";
  if (ctx.text_measure(txt)[0] <= maxW) return txt;
  let low = 0, high = txt.length;
  let best = "";
  while (low <= high) {
    const mid = (low + high) >> 1;
    const sub = txt.slice(0, mid);
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
  let total = grid_cols * grid_rows;
  if (total < 1) total = 1;

  while (slots.length < total) {
    const nextIdx = slots.length;
    const defName = (name_bank[nextIdx % name_bank.length]) || (`Status ${nextIdx + 1}`);
    slots.push({ name: defName });
  }
  while (slots.length > total) {
    slots.pop();
  }
  if (active_slot >= slots.length) active_slot = Math.max(0, slots.length - 1);

  morph_weights = new Array(slots.length).fill(0.0);
}

function set_grid() {
  let args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) args = args[0];
  if (args.length === 0) return;

  const str = args.join(" ").trim();
  let parsedC = NaN, parsedR = NaN;

  if (str.indexOf("/") !== -1) {
    const parts = str.split("/");
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
function get_grid() { return `${grid_cols}/${grid_rows}`; }

// =============================================================
// 5. 2D PURE SPATIAL MORPHING (HORIZ, VERT & DIAG)
// =============================================================
function apply_normalized_xy(normX, normY) {
  // Clear persistent saved highlight once morphing is active
  last_stored_slot = -1;

  const cols = Math.max(1, grid_cols);
  const rows = Math.max(1, grid_rows);

  const u = clamp(normX, 0.0, 1.0) * (cols - 1);
  const v = clamp(normY, 0.0, 1.0) * (rows - 1);

  morph_x = 1.0 + u;
  morph_y = 1.0 + v;

  const c0 = Math.floor(u), c1 = Math.min(cols - 1, c0 + 1), fracU = u - c0;
  const r0 = Math.floor(v), r1 = Math.min(rows - 1, r0 + 1), fracV = v - r0;

  const wTL = (1.0 - fracU) * (1.0 - fracV);
  const wTR = fracU * (1.0 - fracV);
  const wBL = (1.0 - fracU) * fracV;
  const wBR = fracU * fracV;

  const idxTL = r0 * cols + c0;
  const idxTR = r0 * cols + c1;
  const idxBL = r1 * cols + c0;
  const idxBR = r1 * cols + c1;

  const newWeights = new Array(slots.length).fill(0.0);

  if (idxTL < slots.length) newWeights[idxTL] += wTL;
  if (idxTR < slots.length) newWeights[idxTR] += wTR;
  if (idxBL < slots.length) newWeights[idxBL] += wBL;
  if (idxBR < slots.length) newWeights[idxBR] += wBR;

  morph_weights = newWeights;
  is_morphing = 1;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      if (cols === 1 || rows === 1) {
        morph_val = (rows === 1) ? (1.0 + u) : (1.0 + v);
        active_slot = clamp(Math.round(morph_val) - 1, 0, slots.length - 1);
        target_edit_slot = active_slot;
        outlet(0, morph_val);
      } else {
        const sorted = [];
        for (let s = 0; s < slots.length; s++) sorted.push({ idx: s, w: newWeights[s] });
        sorted.sort((a, b) => b.w - a.w);

        const domA = sorted[0];
        const domB = sorted[1] || { idx: domA.idx, w: 0.0 };
        const sumW = domA.w + domB.w;
        const blendRatio = sumW > 0.001 ? (domB.w / sumW) : 0.0;

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
  const cols = Math.max(1, grid_cols);
  const rows = Math.max(1, grid_rows);
  const padX = 4, padY = 4;
  const availW = Math.max(1, totalW - padX * 2);
  const availH = Math.max(1, totalH - padY * 2);
  const cellW = availW / cols;
  const cellH = availH / rows;

  const normX = cols > 1 ? clamp(((localX - padX) - 0.5 * cellW) / Math.max(1, availW - cellW), 0.0, 1.0) : 0.0;
  const normY = rows > 1 ? clamp(((localY - padY) - 0.5 * cellH) / Math.max(1, availH - cellH), 0.0, 1.0) : 0.0;

  apply_normalized_xy(normX, normY);
}

// =============================================================
// 6. SUB-WINDOW: 4-SLIDER GRID TICKER (200 x 210)
// =============================================================
function open_grid_ticker_window(anchorX, anchorY) {
  const win = getTickerWindow();
  const winW = 200, winH = 210;
  win.size = [winW, winH];
  if (anchorX !== undefined && anchorY !== undefined) {
    win.pos = [anchorX, anchorY];
  }
  win.visible = 1;
  win.front();
  draw_grid_ticker();
}

function draw_grid_ticker() {
  if (!tickerWindow || !tickerWindow.visible) return;
  const winW = 200, winH = 210;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);

  const ctx = new MGraphics(winW, winH);
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
  const bannerStr = `Grid: ${grid_cols} Cols  /  ${grid_rows} Rows (${grid_cols * grid_rows} Slots)`;
  const bTm = ctx.text_measure(bannerStr);
  ctx.move_to((winW - (bTm ? bTm[0] : 100)) * 0.5, 44.5);
  ctx.show_text(bannerStr);

  const x_tens = Math.floor(grid_cols / 10) % 10;
  const x_ones = grid_cols % 10;
  const y_tens = Math.floor(grid_rows / 10) % 10;
  const y_ones = grid_rows % 10;
  const digits = [x_tens, x_ones, y_tens, y_ones];

  const trackW = 28, trackH = 100, trackY = 58;
  const slotX = [18, 52, 120, 154];

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(24);
  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
  const slashTm = ctx.text_measure("/");
  ctx.move_to(86 + (28 - slashTm[0]) * 0.5, trackY + trackH * 0.5 + 8);
  ctx.show_text("/");

  for (let i = 0; i < 4; i++) {
    const sx = slotX[i];
    ctx.set_source_rgba(0.08, 0.08, 0.10, 0.9);
    ctx.rectangle_rounded(sx, trackY, trackW, trackH, 3, 3);
    ctx.fill();

    const dVal = digits[i];
    const fillH = clamp((dVal / 9.0) * trackH, 0, trackH);

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
    const dStr = String(dVal);
    const dTm = ctx.text_measure(dStr);
    ctx.move_to(sx + (trackW - dTm[0]) * 0.5, trackY + trackH + 16);
    ctx.show_text(dStr);
  }

  ctx.select_font_face("Arial", "normal", "normal");
  ctx.set_font_size(8);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.5);
  ctx.move_to(26, trackY + trackH + 30); ctx.show_text("COLS (1-99)");
  ctx.move_to(128, trackY + trackH + 30); ctx.show_text("ROWS (1-99)");

  const img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function apply_grid_ticker_column(colIdx, my) {
  const trackH = 100, trackY = 58;
  const d = clamp(Math.round(((trackY + trackH) - my) / trackH * 9.0), 0, 9);

  let x_tens = Math.floor(grid_cols / 10) % 10;
  let x_ones = grid_cols % 10;
  let y_tens = Math.floor(grid_rows / 10) % 10;
  let y_ones = grid_rows % 10;

  if (colIdx === 0) x_tens = d;
  else if (colIdx === 1) x_ones = d;
  else if (colIdx === 2) y_tens = d;
  else if (colIdx === 3) y_ones = d;

  const newC = clamp(x_tens * 10 + x_ones, 1, 99);
  const newR = clamp(y_tens * 10 + y_ones, 1, 99);

  set_grid(newC, newR);
  draw_grid_ticker();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; active_ticker_column = -1; return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) {
      // PREVIEW WINDOW: MOUSE UP / RELEASE
      if (popPendingSlot !== -1 && !pop_has_dragged && !pop_has_saved_on_hold && !pop_suppress_recall) {
        recall_slot(popPendingSlot);
        draw_settings();
      }
      active_pop_target = -1;
      stop_pop_hold_watchdog();
      return;
    }

    if (mbut) {
      if (mx < 24 && my < 24) { tickerWindow.visible = 0; active_ticker_column = -1; return; }

      const trackW = 28, trackH = 100, trackY = 58;
      const slotX = [18, 52, 120, 154];

      if (active_ticker_column === -1) {
        for (let i = 0; i < 4; i++) {
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

// =============================================================
// 7. ABBREVIATION ENGINE
// =============================================================
function apply_case(str, c_mode) {
  if (!str || typeof str !== "string") return "";
  if (c_mode === 1) return str.toUpperCase();
  if (c_mode === 2) return str.toLowerCase();
  return str.toLowerCase().replace(/(?:^|\s|\/|-)\w/g, m => m.toUpperCase());
}

function get_display_label(rawTxt) {
  if (!rawTxt || typeof rawTxt !== "string") return "";
  if (label_mode === 4) return "";

  if (label_mode === 2) {
    const caps = rawTxt.replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    if (caps.length > 0) return caps;
    const words = rawTxt.trim().split(/\s+/);
    let fb = "";
    for (let i = 0; i < words.length; i++) {
      if (words[i].length > 0) fb += words[i].charAt(0).toUpperCase();
    }
    return fb.length > 0 ? fb : rawTxt.charAt(0).toUpperCase();
  }

  if (label_mode === 3) {
    const words3 = rawTxt.trim().split(/\s+/);
    let initials = "";
    for (let k = 0; k < words3.length; k++) {
      if (words3[k].length > 0) initials += words3[k].charAt(0).toUpperCase();
    }
    return initials.length > 0 ? initials : rawTxt.charAt(0).toUpperCase();
  }

  if (label_mode === 1) {
    const cleanFull = apply_case(rawTxt, case_mode);
    const words1 = cleanFull.split(/\s+/);
    const resWords = [];
    for (let j = 0; j < words1.length; j++) {
      const w = words1[j];
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
  const b = isNaN(border_thickness) ? 1.2 : border_thickness;
  const inset = b * 0.5;
  const rw = Math.max(1, w - b);
  const rh = Math.max(1, h - b);
  const radVal = isNaN(border_radius) ? 4.0 : border_radius;
  const r = Math.max(0, Math.min(radVal, rw / 2, rh / 2));
  const extVal = isNaN(border_extension) ? 6.0 : border_extension;
  const ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  const eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  ctx.set_source_rgba(bg_color);
  ctx.rectangle_rounded(inset, inset, rw, rh, r, r);
  ctx.fill();

  if (b > 0) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  const cols = Math.max(1, grid_cols);
  const rows_count = Math.max(1, grid_rows);
  const padX = 4, padY = 4;
  const availW = rw - padX * 2;
  const availH = rh - padY * 2;
  const cellW = availW / cols;
  const cellH = availH / rows_count;

  for (let i = 0; i < slots.length; i++) {
    const c = i % cols;
    const row = Math.floor(i / cols);

    const sX = inset + padX + c * cellW;
    const sY = inset + padY + row * cellH;
    const sW = cellW - 3;
    const sH = cellH - 3;

    let highlightAlpha = 0.0;
    if (is_morphing && morph_weights.length === slots.length) {
      highlightAlpha = morph_weights[i] || 0.0;
    } else if (is_morphing) {
      const fPos = morph_val - 1.0;
      const floorIdx = Math.floor(fPos);
      const ceilIdx = Math.min(slots.length - 1, floorIdx + 1);
      const frac = fPos - floorIdx;
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

    // -------------------------------------------------------------
    // ACCENT BAR: Feedback for recently stored slot
    // Anchored at bottom edge, styled with touch.master Knob/Line
    // -------------------------------------------------------------
    if (i === last_stored_slot) {
      const barH = 2.5;
      const barMargin = 4.0;
      const barY = sY + sH - barH - 1.5;
      const barX = sX + barMargin;
      const barW = Math.max(2, sW - barMargin * 2);

      ctx.set_source_rgba(accent_bar_color);
      ctx.rectangle_rounded(barX, barY, barW, barH, barH * 0.5, barH * 0.5);
      ctx.fill();
    }

    // Slot Number
    ctx.select_font_face(font_name, "normal", "bold");
    ctx.set_font_size(Math.max(7, Math.min(10, sH * 0.28)));
    ctx.set_source_rgba(highlightAlpha > 0.4 ? [1, 1, 1, 0.9] : [0.55, 0.58, 0.64, 0.8]);
    ctx.move_to(sX + 4, sY + Math.max(8, sH * 0.28));
    ctx.show_text(String(i + 1));

    // Slot Label
    let dispTxt = get_display_label(slots[i].name);
    const weightStr = (highlightAlpha > 0.4) ? "bold" : font_weights[font_style];
    ctx.select_font_face(font_name, font_slants[font_style], weightStr);
    const curFontSize = Math.max(8, Math.min(text_size, sH * 0.45));
    ctx.set_font_size(curFontSize);
    ctx.set_source_rgba(text_color);

    dispTxt = fit_text_to_width(ctx, dispTxt, sW - 6);
    const tm = ctx.text_measure(dispTxt);
    const textOffsetY = (i === last_stored_slot) ? -1.5 : 0;
    ctx.move_to(sX + (sW - tm[0]) * 0.5, sY + sH * 0.5 + curFontSize * 0.33 + textOffsetY);
    ctx.show_text(dispTxt);
  }

  if (!is_preview && allow_popup === 1) {
    const dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
    const dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  const sz = mgraphics.size;
  draw_status_strip(mgraphics, sz[0], sz[1], false);
}

// =============================================================
// 9. ATTRUI INSPECTOR WINDOW
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  const list = [];

  if (mask_performance === 1) {
    list.push({ name: "Grid (Cols/Rows)", val: get_grid(), is_ticker: true, target_id: 100 });
    list.push({ name: "Hold to Save", val: allow_hold_save ? "ON" : "OFF", is_toggle: true, target_id: 101 });
    list.push({ name: "Hold Time", val: `${hold_threshold}ms`, pct: (hold_threshold - 200) / 800.0, is_slider: true, target_id: 102 });
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
    list.push({ name: "Accent Bar", val: accent_bar_color, is_color: true, key: "accent_bar_color" });
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
  const rows = get_visible_rows_map();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  const previewH = Math.max(50, grid_rows * 32 + 10);
  const calculated_h = 28 + previewH + 16 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_settings_dimensions() {
  if (showSettings && allow_popup === 1) {
    const win = getSettingsWindow();
    const dims = get_settings_dimensions();
    win.size = [dims.w, dims.h];

    if (!settings_pos_set && this.box && this.box.rect) {
      win.pos = [this.box.rect[0], this.box.rect[1] - dims.h - 10];
      settings_pos_set = true;
    }

    win.visible = 1;
    win.front();
    draw_settings();
  } else {
    if (settingsWindow) settingsWindow.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
    if (tickerWindow) tickerWindow.visible = 0;
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
  const win = getSettingsWindow();
  const dims = get_settings_dimensions();
  const w = dims.w, h = dims.h;
  const rows = get_visible_rows_map();
  const has_rows = rows.length > 0;

  win.size = [w, h];
  outMatrix = recycleMatrix(outMatrix, w, h);

  const pCtx = new MGraphics(w, h);
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

  const tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
  const tglR = Math.max(2, Math.min(6, border_radius * 0.3));

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
  const tglLabel = show_settings_attrs ? "hide" : "show";
  const tglTm = pCtx.text_measure(tglLabel);
  const tglTextX = tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5;
  pCtx.move_to(tglTextX, tglY + 11.5);
  pCtx.show_text(tglLabel);

  const prevX = 12, prevY = 28, prevW = w - 24;
  const prevH = has_rows ? Math.max(50, grid_rows * 32) : Math.max(50, h - prevY - 14);
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
    const divY = prevY + prevH + 8;
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    const sY = divY + 8;
    const rowX = 12, rowW = w - 24;
    const midX = 12 + rowW * 0.5;
    const valBoxX = midX + 4;
    const valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], rY = sY + i * 28;

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

      const vY = rY + 4, vH = 18;

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
        const tTm = pCtx.text_measure(String(r.val));
        pCtx.move_to(valBoxX + (valBoxW - (tTm ? tTm[0] : 20)) * 0.5, rY + 17);
        pCtx.show_text(String(r.val));
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        const fillW2 = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
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
        const vTm = pCtx.text_measure(String(r.val));
        const vStrW = vTm ? vTm[0] : 20;
        pCtx.move_to(valBoxX + Math.max(6, (valBoxW - vStrW) * 0.5), rY + 17);
        pCtx.show_text(String(r.val));
      }
    }
  }

  const img = new Image(pCtx);
  img.tonamedmatrix(outMatrix.name);
  win.jit_matrix(outMatrix.name);
}

function apply_slider_target(target_id, targetPct) {
  if (target_id === 102) set_hold_threshold(Math.round(200 + targetPct * 800));
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
  pop_has_dragged = 0;
  pop_has_saved_on_hold = 0;
  pop_suppress_recall = 0;
  if (popHoldTask) {
    try { popHoldTask.cancel(); } catch(e) {}
    popHoldTask = null;
  }
}

function settingsWindowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; stop_pop_hold_watchdog(); return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
    const is_pop_tap = mbut === 1 && is_mouse_down_any === 0;
    is_mouse_down_any = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    const dims = get_settings_dimensions();
    const w = dims.w, h = dims.h;
    const rows = get_visible_rows_map();
    const has_rows = rows.length > 0;
    const pr = cached_preview_rect;

    // PREVIEW STRIP: MOUSE UP / RELEASE
    if (mbut === 0) {
      if (popPendingSlot !== -1 && !pop_has_dragged && !pop_has_saved_on_hold && !pop_suppress_recall) {
        recall_slot(popPendingSlot);
        draw_settings();
      }
      is_resizing_window = 0;
      active_pop_target = -1;
      stop_pop_hold_watchdog();
      if (scrollTask) { scrollTask.cancel(); scrollTask = null; }
      return;
    }

    if (is_resizing_window && !has_rows) {
      const deltaW = mx - start_click_x;
      const deltaH = my - start_click_y;
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
      if (settingsWindow) settingsWindow.visible = 0;
      if (colorWindow) colorWindow.visible = 0;
      if (tickerWindow) tickerWindow.visible = 0;
      stop_pop_hold_watchdog();
      redraw_all();
      return;
    }

    const tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_settings_dimensions();
      return;
    }

    if (my >= pr.y && my <= pr.y + pr.h && mx >= pr.x && mx <= pr.x + pr.w) {
      const localX = mx - pr.x;
      const localY = my - pr.y;

      if (is_pop_tap) {
        const cols = Math.max(1, grid_cols);
        const rows_count = Math.max(1, grid_rows);
        const padX = 4, padY = 4;
        const cellW = (pr.w - padX * 2) / cols;
        const cellH = (pr.h - padY * 2) / rows_count;

        const colHit = Math.floor((localX - padX) / cellW);
        const rowHit = Math.floor((localY - padY) / cellH);

        if (colHit >= 0 && colHit < cols && rowHit >= 0 && rowHit < rows_count) {
          const clickedIdx = rowHit * cols + colHit;
          if (clickedIdx >= 0 && clickedIdx < slots.length) {
            const now = new Date().getTime();

            // DOUBLE-TAP IN PREVIEW: Open Palette
            if (now - pop_last_tap_time < double_tap_threshold && clickedIdx === pop_last_tap_slot) {
              pop_last_tap_time = 0;
              stop_pop_hold_watchdog();
              pop_suppress_recall = 1;
              open_palette_for_slot(clickedIdx);
              return;
            }

            pop_last_tap_time = now;
            pop_last_tap_slot = clickedIdx;

            // Touch Down: Start Hold Timer (NO immediate recall)
            stop_pop_hold_watchdog();
            isPopMouseDown = 1;
            popClickStartX = mx;
            popClickStartY = my;
            popPendingSlot = clickedIdx;
            isPopDragging = 0;
            pop_has_dragged = 0;
            pop_has_saved_on_hold = 0;
            pop_suppress_recall = 0;

            if (allow_hold_save === 1) {
              popHoldTask = new Task(() => {
                if (isPopMouseDown === 1 && popPendingSlot !== -1 && !isPopDragging && !pop_has_dragged) {
                  const target = popPendingSlot;
                  pop_has_saved_on_hold = 1;
                  pop_suppress_recall = 1;
                  save_slot(target); // LONG PRESS == SAVE
                  if (showSettings) draw_settings();
                }
              }, this);
              popHoldTask.schedule(hold_threshold);
            }
          }
        }
      } else if (mbut === 1) {
        if (Math.abs(mx - popClickStartX) > 2 || Math.abs(my - popClickStartY) > 2) {
          if (popHoldTask) { try { popHoldTask.cancel(); } catch(e) {} popHoldTask = null; }
          isPopDragging = 1;
          pop_has_dragged = 1;
          pop_last_tap_time = 0;
        }
        calculate_2d_weights(localX, localY, pr.w, pr.h);
        if (showSettings) draw_settings();
      }
      return;
    }

    if (!has_rows) return;

    const sY = pr.y + pr.h + 16;
    const rowW = w - 24;
    const midX = 12 + rowW * 0.5;
    const valBoxX = midX + 4;
    const valBoxW = rowW * 0.5 - 8;

    const rIdx = Math.floor((my - sY) / 28);
    if (rIdx >= 0 && rIdx < rows.length) {
      const r = rows[rIdx];
      const pctDrag = clamp((mx - valBoxX) / valBoxW, 0, 1);

      if (r.is_slider || r.pct !== undefined) {
        active_pop_target = r.target_id;
        apply_slider_target(r.target_id, pctDrag);

        if (scrollTask) { scrollTask.cancel(); scrollTask = null; }
        scrollTask = new Task(() => {
          if (active_pop_target === -1) return;
          const targetPct = clamp((lastMouseX - valBoxX) / valBoxW, 0, 1);
          apply_slider_target(active_pop_target, targetPct);
        }, this);
        scrollTask.interval = 15;
        scrollTask.repeat();
      } else if (is_pop_tap) {
        if (r.target_id === 100 || r.is_ticker) {
          const tickPosX = settingsWindow.pos ? settingsWindow.pos[0] + valBoxX : 100;
          const tickPosY = settingsWindow.pos ? settingsWindow.pos[1] + sY + rIdx * 28 + 14 : 100;
          open_grid_ticker_window(tickPosX, tickPosY);
        }
        else if (r.target_id === 101) set_allow_hold_save(allow_hold_save ? 0 : 1);
        else if (r.target_id === 201) set_label_mode((label_mode + 1) % 5);
        else if (r.target_id === 202) set_case_mode((case_mode + 1) % 3);
        else if (r.target_id === 203) set_font_style((font_style + 1) % 4);
        else if (r.is_color) {
          active_color_target = r.key;
          initPickerFromTarget();
          const colWin = getColorWindow();
          if (!color_pos_set && settingsWindow && settingsWindow.pos) {
            colWin.pos = [settingsWindow.pos[0] + valBoxX, settingsWindow.pos[1] + sY + rIdx * 28 + 14];
            color_pos_set = true;
          }
          colWin.visible = 1;
          colWin.front();
          draw_color_picker();
        }
      }
      draw_settings();
    }
  }
}

// =============================================================
// 10. COLOR PICKER
// =============================================================
function get_color_target(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "highlight_color") return highlight_color;
  if (name === "text_color") return text_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "accent_bar_color") return accent_bar_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

function initPickerFromTarget() {
  const arr = get_color_target(active_color_target) || [1, 1, 1, 1];
  const hsv = rgbToHsv(arr[0], arr[1], arr[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2];
  cur_a = (arr[3] !== undefined ? arr[3] : 1.0);
}

function applyPickerToTarget() {
  const rgb = hsvToRgb(cur_h, cur_s, cur_v);
  const arr = get_color_target(active_color_target);
  if (arr) {
    arr[0] = rgb[0]; arr[1] = rgb[1]; arr[2] = rgb[2]; arr[3] = cur_a;
  }
  redraw_all();
}

function draw_color_picker() {
  if (!colorWindow || !colorWindow.visible) return;
  const winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);

  const ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(0.11, 0.11, 0.13, 1.0);
  ctx.rectangle(0, 0, winW, winH); ctx.fill();

  ctx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 6.0, 0, Math.PI * 2); ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(0.85, 0.88, 0.92, 1.0);
  ctx.move_to(28, 17);
  ctx.show_text("Color Picker");

  const hueX = 10, hueY = 28, hueW = 180, hueH = 16;
  const huePat = ctx.pattern_create_linear(hueX, 0, hueX + hueW, 0);
  huePat.add_color_stop_rgba(0.00, 1.0, 0.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.17, 1.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.33, 0.0, 1.0, 0.0, 1.0);
  huePat.add_color_stop_rgba(0.50, 0.0, 1.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.67, 0.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(0.83, 1.0, 0.0, 1.0, 1.0);
  huePat.add_color_stop_rgba(1.00, 1.0, 0.0, 0.0, 1.0);
  ctx.set_source(huePat);
  ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3); ctx.fill();

  const hIndX = hueX + cur_h * hueW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0); ctx.set_line_width(1.5);
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

  const svX = 10, svY = 50, svW = 180, svH = 115;
  const pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  const satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1.0, 1.0, 1.0, 1.0);
  satPat.add_color_stop_rgba(1.0, 1.0, 1.0, 1.0, 0.0);
  ctx.set_source(satPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  const valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0.0, 0.0, 0.0, 0.0);
  valPat.add_color_stop_rgba(1.0, 0.0, 0.0, 0.0, 1.0);
  ctx.set_source(valPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3); ctx.fill();

  const svIndX = svX + cur_s * svW;
  const svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2); ctx.stroke();

  const opX = 10, opY = 172, opW = 180, opH = 16;
  ctx.set_source_rgba(0.2, 0.2, 0.22, 1.0);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3); ctx.fill();
  const curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  const opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
  opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(opPat);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3); ctx.fill();

  const opIndX = opX + cur_a * opW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0); ctx.set_line_width(1.5);
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2); ctx.stroke();

  const swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3); ctx.fill();

  const img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  colorWindow.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
  if (event.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
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

// =============================================================
// 11. CLEAN STATUS PALETTE
// =============================================================
function open_palette_for_slot(slotIdx) {
  target_edit_slot = Math.max(0, Math.min(slots.length - 1, slotIdx));
  const win = getPaletteWindow();

  if (!palette_pos_set && this.box && this.box.rect) {
    win.pos = [this.box.rect[0], this.box.rect[3] + 10];
    palette_pos_set = true;
  }

  win.visible = 1;
  win.front();
  draw_palette();
}

function close_palette() {
  if (paletteWindow) paletteWindow.visible = 0;
  redraw_all();
}

function draw_palette() {
  if (!paletteWindow || !paletteWindow.visible) return;
  const w = 330, h = 380;
  paletteMatrix = recycleMatrix(paletteMatrix, w, h);

  const ctx = new MGraphics(w, h);
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, w, h);
  ctx.fill();

  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 16, 5.5, 0, Math.PI * 2);
  ctx.fill();

  const actX = 32, actY = 7, actW = w - actX - 10, actH = 18;
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
  const currentName = slots[target_edit_slot] ? slots[target_edit_slot].name : "";
  let bannerTxt = `Slot ${target_edit_slot + 1}: ${currentName}`;
  bannerTxt = fit_text_to_width(ctx, bannerTxt, actW - 12);
  const actTm = ctx.text_measure(bannerTxt);
  ctx.move_to(actX + (actW - actTm[0]) * 0.5, actY + 12.5);
  ctx.show_text(bannerTxt);

  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
  ctx.set_line_width(1.0);
  ctx.move_to(10, 32); ctx.line_to(w - 10, 32); ctx.stroke();

  ctx.select_font_face(font_name, "normal", "normal");
  ctx.set_font_size(9.5);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.7);
  ctx.move_to(12, 46);
  ctx.show_text(`Tap a name below to stamp Slot ${target_edit_slot + 1}:`);

  const margin = 12, startY = 56, cols = 2, gap = 8;
  const cardW = (w - margin * 2 - gap) / cols;
  const cardH = 36;

  for (let i = 0; i < name_bank.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cX = margin + col * (cardW + gap);
    const cY = startY + row * (cardH + gap);
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
    const tm = ctx.text_measure(name_bank[i]);
    ctx.move_to(cX + (cardW - tm[0]) * 0.5, cY + cardH * 0.5 + 4.0);
    ctx.show_text(name_bank[i]);
  }

  const img = new Image(ctx);
  img.tonamedmatrix(paletteMatrix.name);
  paletteWindow.jit_matrix(paletteMatrix.name);
}

function paletteWindowListenerCallback(event) {
  if (event.eventname === "close") { close_palette(); return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;

    if (mx < 24 && my < 24) { close_palette(); return; }

    const margin = 12, startY = 56, cols = 2, gap = 8;
    const cardW = (330 - margin * 2 - gap) / cols;
    const cardH = 36;

    for (let i = 0; i < name_bank.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cX = margin + col * (cardW + gap);
      const cY = startY + row * (cardH + gap);

      if (mx >= cX && mx <= cX + cardW && my >= cY && my <= cY + cardH) {
        stamp_name_to_slot(target_edit_slot, name_bank[i]);
        draw_palette();
        return;
      }
    }
  }
}

// =============================================================
// 12. RECALL, STORE & MORPH ENGINE
// =============================================================
function recall_slot(idx) {
  if (idx < 0 || idx >= slots.length) return;
  if (idx !== last_stored_slot) {
    last_stored_slot = -1; // Clear persistent saved bar on recalling a different slot
  }

  active_slot = idx;
  target_edit_slot = idx;
  morph_val = active_slot + 1;
  is_morphing = 0;

  const cols = Math.max(1, grid_cols);
  const col = active_slot % cols;
  const row = Math.floor(active_slot / cols);
  morph_x = 1.0 + col;
  morph_y = 1.0 + row;

  morph_weights = new Array(slots.length).fill(0.0);
  morph_weights[active_slot] = 1.0;

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

// =============================================================
// LONG PRESS TO SAVE / COMMIT FUNCTION
// Commits to pattrstorage & lights up bottom Accent Bar
// =============================================================
function save_slot(idx) {
  if (idx === undefined) idx = active_slot;
  idx = parseInt(idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= slots.length) return;

  active_slot = idx;
  target_edit_slot = idx;
  last_stored_slot = idx; // Activates persistent bottom Accent Bar!
  morph_val = active_slot + 1;
  is_morphing = 0;

  morph_weights = new Array(slots.length).fill(0.0);
  morph_weights[active_slot] = 1.0;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, ["store", active_slot + 1]);
      outlet(1, ["set", slots[active_slot].name]);
      trigger_auto_write(); // Auto-save JSON states to disk
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}
function store_slot(idx) { save_slot(idx); }
function two_finger_save(idx) { save_slot(idx); }

function msg_float(v) {
  if (isDragging || isPopDragging) return;

  let f = parseFloat(v);
  if (isNaN(f)) return;
  const totalSlots = slots.length;
  if (totalSlots < 1) return;

  last_stored_slot = -1; // Clear persistence on morphing
  f = Math.max(1.0, Math.min(totalSlots, f));
  morph_val = f;
  is_morphing = 1;

  const fPos = morph_val - 1.0;
  const floorIdx = Math.floor(fPos);
  const ceilIdx = Math.min(slots.length - 1, floorIdx + 1);
  const frac = fPos - floorIdx;

  const newWeights = new Array(slots.length).fill(0.0);
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
  last_stored_slot = slotIdx; // Highlight recently saved slot
  morph_val = slotIdx + 1;
  is_morphing = 0;

  morph_weights = new Array(slots.length).fill(0.0);
  morph_weights[active_slot] = 1.0;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, ["store", active_slot + 1]);
      outlet(1, ["set", chosenName]);
      trigger_auto_write(); // Auto-save to JSON states!
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  if (paletteWindow && paletteWindow.visible) draw_palette();
  broadcast_to_master();
}

// =============================================================
// 13. MOUSE & TOUCH GESTURE LIFECYCLE (CANVAS)
// =============================================================
function stop_hold_watchdog() {
  isMouseDown = 0;
  pendingSlot = -1;
  isDragging = 0;
  has_dragged = 0;
  has_saved_on_hold = 0;
  suppress_release_recall = 0;
  if (holdTask) {
    try { holdTask.cancel(); } catch(e) {}
    holdTask = null;
  }
}

// TOUCH DOWN: Starts Hold Timer & Double-Tap detection
// DOES NOT RECALL (Edit buffer stays 100% safe!)
function onclick(x, y, button, cmd, shift, capslock, option, ctrl, pointerevent) {
  const sz = mgraphics.size;
  const w = sz[0], h = sz[1];

  // Check Settings Dot (Top-Right)
  if (allow_popup === 1) {
    const dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    const dotX = w - dotMargin, dotY = dotMargin;
    const distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= 8.0) {
      showSettings = showSettings ? 0 : 1;
      update_settings_dimensions();
      return;
    }
  }

  const cols = Math.max(1, grid_cols);
  const rows_count = Math.max(1, grid_rows);
  const padX = 4, padY = 4;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows_count;

  const colHit = Math.floor((x - padX) / cellW);
  const rowHit = Math.floor((y - padY) / cellH);

  if (colHit < 0 || colHit >= cols || rowHit < 0 || rowHit >= rows_count) return;
  const clickedSlot = rowHit * cols + colHit;
  if (clickedSlot < 0 || clickedSlot >= slots.length) return;

  const now = new Date().getTime();

  // -----------------------------------------------------------
  // GESTURE 1: DOUBLE-TAP TO OPEN PALETTE
  // -----------------------------------------------------------
  if (now - last_tap_time < double_tap_threshold && clickedSlot === last_tap_slot) {
    last_tap_time = 0;
    stop_hold_watchdog();
    suppress_release_recall = 1;
    open_palette_for_slot(clickedSlot);
    return;
  }

  last_tap_time = now;
  last_tap_slot = clickedSlot;

  // -----------------------------------------------------------
  // GESTURE 2: TOUCH DOWN (Wait for Release or Hold)
  // -----------------------------------------------------------
  stop_hold_watchdog();
  isMouseDown = 1;
  isDragging = 0;
  has_dragged = 0;
  has_saved_on_hold = 0;
  suppress_release_recall = 0;
  clickStartX = x;
  clickStartY = y;
  pendingSlot = clickedSlot;

  // -----------------------------------------------------------
  // GESTURE 3: LONG HOLD TO SAVE (Commits live tweak!)
  // -----------------------------------------------------------
  if (allow_hold_save === 1) {
    holdTask = new Task(() => {
      if (isMouseDown === 1 && pendingSlot !== -1 && !isDragging && !has_dragged) {
        const target = pendingSlot;
        has_saved_on_hold = 1;
        suppress_release_recall = 1; // DO NOT recall on release!
        save_slot(target); // LONG HOLD == SAVE & LIGHT ACCENT BAR!
      }
    }, this);
    holdTask.schedule(hold_threshold);
  }
}

// DRAG: Spatial Morphing (or Mouse Up Detection)
function ondrag(x, y, button) {
  // -----------------------------------------------------------
  // TOUCH UP / RELEASE (UP-CLICK): Fires Preset Recall!
  // -----------------------------------------------------------
  if (button === 0) {
    if (pendingSlot !== -1 && !has_dragged && !has_saved_on_hold && !suppress_release_recall) {
      recall_slot(pendingSlot); // UP-CLICK CHANGES SLOT!
    }
    stop_hold_watchdog();
    return;
  }

  // Active finger movement: Engages 2D morphing
  if (Math.abs(x - clickStartX) > 2 || Math.abs(y - clickStartY) > 2) {
    if (holdTask) { try { holdTask.cancel(); } catch(e) {} holdTask = null; }
    isDragging = 1;
    has_dragged = 1;
    last_tap_time = 0;     // Movement invalidates double-tap
    last_stored_slot = -1; // Active morphing clears saved highlight
  }

  const sz = mgraphics.size;
  calculate_2d_weights(x, y, sz[0], sz[1]);
}

function onidle() { if (isMouseDown) stop_hold_watchdog(); }
function onidleout() { stop_hold_watchdog(); }

// =============================================================
// 14. INLET DISPATCHER & NAMING METHODS
// =============================================================
function msg_int(v) { recall_slot(parseInt(v, 10) - 1); }

// Method 1: rename_pallet_slot <name...> <slot>
// Updates the entry in the palette catalog (name_bank). Does NOT store to pattr.
function rename_pallet_slot() {
  const args = arrayfromargs(arguments);
  if (args.length < 2) return;

  let slot_num = NaN;
  let name_tokens = [];

  const lastToken = args[args.length - 1];
  const firstToken = args[0];

  const lastAsNum = parseInt(lastToken, 10);
  const firstAsNum = parseInt(firstToken, 10);

  if (!isNaN(lastAsNum) && lastAsNum >= 1) {
    slot_num = lastAsNum;
    name_tokens = args.slice(0, args.length - 1);
  } else if (!isNaN(firstAsNum) && firstAsNum >= 1) {
    slot_num = firstAsNum;
    name_tokens = args.slice(1);
  } else {
    return;
  }

  const idx = slot_num - 1;
  const newName = name_tokens.join(" ").trim();
  if (!newName) return;

  while (name_bank.length <= idx) {
    name_bank.push(`Status ${name_bank.length + 1}`);
  }
  name_bank[idx] = newName;

  if (paletteWindow && paletteWindow.visible) draw_palette();
  if (typeof notifyclients === "function") notifyclients();
}
function rename_palette_slot() { rename_pallet_slot.apply(this, arguments); }
function rename() { rename_pallet_slot.apply(this, arguments); }

// Method 2: rename_slot <name...> <slot> OR <slot> <name...>
// Decoupled: Purely renames slot without requiring an extra 'save' flag argument!
function rename_slot() {
  const args = arrayfromargs(arguments);
  if (args.length < 2) return;

  let slot_num = NaN;
  let name_tokens = [];

  const lastToken = args[args.length - 1];
  const firstToken = args[0];

  const lastAsNum = parseInt(lastToken, 10);
  const firstAsNum = parseInt(firstToken, 10);

  if (!isNaN(lastAsNum) && lastAsNum >= 1) {
    slot_num = lastAsNum;
    name_tokens = args.slice(0, args.length - 1);
  } else if (!isNaN(firstAsNum) && firstAsNum >= 1) {
    slot_num = firstAsNum;
    name_tokens = args.slice(1);
  } else {
    return;
  }

  const idx = slot_num - 1;
  const newName = name_tokens.join(" ").trim();
  if (!newName) return;

  if (idx >= 0 && idx < slots.length) {
    slots[idx].name = newName;

    if (idx === active_slot) {
      outlet(1, ["set", newName]);
    }

    redraw_all();
    if (paletteWindow && paletteWindow.visible) draw_palette();
    broadcast_to_master();
    if (typeof notifyclients === "function") notifyclients();
  }
}
function rename_slot_save() { rename_slot.apply(this, arguments); } // Backward compatibility alias

function text() {
  const args = arrayfromargs(arguments);
  const str = args.join(" ").trim();
  if (!str) return;

  if (paletteWindow && paletteWindow.visible && target_edit_slot !== -1) {
    stamp_name_to_slot(target_edit_slot, str);
  } else {
    if (slots[active_slot]) {
      slots[active_slot].name = str;
      last_stored_slot = active_slot;
      if (!is_transmitting) {
        is_transmitting = true;
        try {
          outlet(0, ["store", active_slot + 1]);
          trigger_auto_write();
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
  const args = arrayfromargs(arguments);
  if (args.length === 0) return;
  name_bank = [];
  for (let i = 0; i < args.length; i++) name_bank.push(String(args[i]));
  if (paletteWindow && paletteWindow.visible) draw_palette();
}

function add_name() {
  const args = arrayfromargs(arguments);
  name_bank.push(args.join(" ").trim());
  if (paletteWindow && paletteWindow.visible) draw_palette();
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

const statusBus = new Global("touch_status_bus");
if (!statusBus.clients) statusBus.clients = {};
if (!statusBus.subscribers) statusBus.subscribers = {};
if (!statusBus.ping_listeners) statusBus.ping_listeners = {};

statusBus.ping_listeners[uniqueID] = function() {
  broadcast_to_master();
};

function broadcast_to_master() {
  const exportedNames = slots.map(s => s.name);

  statusBus.clients[module_name] = {
    id: uniqueID,
    name: module_name,
    num_slots: slots.length,
    cols: grid_cols,
    rows: grid_rows,
    active_slot: active_slot,
    last_stored_slot: last_stored_slot,
    morph_val: morph_val,
    morph_x: morph_x,
    morph_y: morph_y,
    slot_names: exportedNames,
    recall: idx => { recall_slot(idx); },
    morph: val => { msg_float(val); },
    store: idx => { save_slot(idx); }
  };

  if (statusBus.subscribers) {
    for (const subKey in statusBus.subscribers) {
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
  const args = arrayfromargs(arguments);
  const str = args.join(" ").trim();
  if (!str) return;

  const items = [];
  if (str.indexOf(",") !== -1) {
    const parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const t = parts[i].trim();
      if (t.length > 0) items.push(t);
    }
  } else {
    const re = /"([^"]+)"|'([^']+)'|([^\s",]+)/g;
    let match;
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
  const oldName = module_name;
  module_name = String(v).trim().replace(/\s+/g, "_");
  if (statusBus && statusBus.clients && oldName !== module_name) {
    delete statusBus.clients[oldName];
  }
  broadcast_to_master();
  sync_storage_identity();
}
function get_name() { return module_name; }

function get_slot_names() {
  return slots.map(s => s.name).join(", ");
}

function set_slot_names() {
  const args = arrayfromargs(arguments);
  const str = args.join(" ").trim();
  if (!str) return;

  const items = [];
  if (str.indexOf(",") !== -1) {
    const parts = str.split(",");
    for (let i = 0; i < parts.length; i++) {
      const t = parts[i].trim();
      if (t.length > 0) items.push(t);
    }
  } else {
    const re = /"([^"]+)"|'([^']+)'|([^\s",]+)/g;
    let match;
    while ((match = re.exec(str)) !== null) {
      items.push(match[1] || match[2] || match[3]);
    }
  }

  if (items.length > 0) {
    for (let i = 0; i < items.length && i < slots.length; i++) {
      slots[i].name = items[i];
    }
    if (slots[active_slot]) {
      outlet(1, ["set", slots[active_slot].name]);
    }
    redraw_all();
    if (paletteWindow && paletteWindow.visible) draw_palette();
    broadcast_to_master();
    if (typeof notifyclients === "function") notifyclients();
  }
}

function set_allow_hold_save(v) { allow_hold_save = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_allow_hold_save() { return allow_hold_save; }
function set_allow_hold_edit(v) { set_allow_hold_save(v); }
function get_allow_hold_edit() { return get_allow_hold_save(); }

function set_hold_threshold(v) { hold_threshold = Math.max(200, parseInt(v, 10)); }
function get_hold_threshold() { return hold_threshold; }

function set_double_tap_threshold(v) { double_tap_threshold = Math.max(150, parseInt(v, 10)); }
function get_double_tap_threshold() { return double_tap_threshold; }

function set_label_mode(v) { const p = parseInt(v, 10); if (!isNaN(p)) label_mode = Math.max(0, Math.min(4, p)); redraw_all(); }
function get_label_mode() { return label_mode; }
function set_case_mode(v) { const p = parseInt(v, 10); if (!isNaN(p)) case_mode = Math.max(0, Math.min(2, p)); redraw_all(); }
function get_case_mode() { return case_mode; }
function set_font_style(v) { const p = parseInt(v, 10); if (!isNaN(p)) font_style = Math.max(0, Math.min(3, p)); redraw_all(); }
function get_font_style() { return font_style; }
function set_text_size(v) { const p = parseInt(v, 10); if (!isNaN(p)) text_size = Math.max(8, p); redraw_all(); }
function get_text_size() { return text_size; }
function set_border_radius(v) { const p = parseFloat(v); if (!isNaN(p)) border_radius = Math.max(0, p); redraw_all(); }
function get_border_radius() { return border_radius; }
function set_border_thickness(v) { const p = parseFloat(v); if (!isNaN(p)) border_thickness = Math.max(0, p); redraw_all(); }
function get_border_thickness() { return border_thickness; }
function set_border_extension(v) { const p = parseFloat(v); if (!isNaN(p)) border_extension = Math.max(0, p); redraw_all(); }
function get_border_extension() { return border_extension; }
function set_allow_popup(v) {
  allow_popup = parseInt(v, 10) ? 1 : 0;
  if (!allow_popup && showSettings) {
    showSettings = 0;
    if (settingsWindow) settingsWindow.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
    if (tickerWindow) tickerWindow.visible = 0;
  }
  redraw_all();
}
function get_allow_popup() { return allow_popup; }
function set_popup_mini_size(w, h) {
  const pw = parseFloat(w), ph = parseFloat(h);
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
function set_accent_bar_color() { accent_bar_color = rgba_values(arguments, accent_bar_color); redraw_all(); }
function get_accent_bar_color() { return accent_bar_color; }

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
  const args = arrayfromargs(arguments);
  const rawMsg = messagename.trim();

  const slashMatch = rawMsg.match(/^(\d+)\/(\d+)$/);
  if (slashMatch) {
    set_grid(rawMsg);
    return;
  }

  if (rawMsg === "grid" || rawMsg === "layout") {
    set_grid.apply(this, args);
    return;
  }

  if (rawMsg === "save_slot" || rawMsg === "store_slot" || rawMsg === "two_finger_save") {
    save_slot.apply(this, args);
    return;
  }

  if (rawMsg === "rename_slot" || rawMsg === "rename_slot_save") {
    rename_slot.apply(this, args);
    return;
  }

  if (rawMsg === "rename_pallet_slot" || rawMsg === "rename_palette_slot" || rawMsg === "rename") {
    rename_pallet_slot.apply(this, args);
    return;
  }
  if (rawMsg === "slot_names" || rawMsg === "names") {
    set_slot_names.apply(this, args);
    return;
  }

  const name = rawMsg.replace(/^set_?/, "").toLowerCase();

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
  if (name === "knob_line_color" || name === "slider_handle_color") name = "accent_bar_color";

  if (typeof this[`set_${name}`] === "function") {
    this[`set_${name}`].apply(this, args);
  }
  redraw_all();
}

declareattribute("grid", { type: "symbol", label: "Grid Layout (Cols/Rows)", setter: "set_grid", getter: "get_grid", category: "Status Config", embed: 1 });
declareattribute("name_bank", { type: "symbol", label: "Available Name Bank", setter: "set_name_bank_attr", getter: "get_name_bank_attr", category: "Status Config", embed: 1 });
declareattribute("name", { type: "symbol", label: "Module ID / Name", setter: "set_name", getter: "get_name", category: "Status Config", embed: 1 });
declareattribute("allow_hold_save", { type: "int", style: "onoff", label: "Allow Hold to Save", setter: "set_allow_hold_save", getter: "get_allow_hold_save", category: "Performance", embed: 1 });
declareattribute("hold_threshold", { type: "int", label: "Hold Time to Save (ms)", setter: "set_hold_threshold", getter: "get_hold_threshold", category: "Performance", embed: 1 });
declareattribute("double_tap_threshold", { type: "int", label: "Double Tap Window (ms)", setter: "set_double_tap_threshold", getter: "get_double_tap_threshold", category: "Performance", embed: 1 });

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
declareattribute("accent_bar_color", { type: "rgba", style: "rgba", label: "Accent Bar Color", setter: "set_accent_bar_color", getter: "get_accent_bar_color", category: "Status Colors", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", setter: "set_pop_bgcolor", getter: "get_pop_bgcolor", category: "Popup Colors", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", setter: "set_attr_bg_color", getter: "get_attr_bg_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", setter: "set_attr_border_color", getter: "get_attr_border_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", setter: "set_attr_slider_color", getter: "get_attr_slider_color", category: "Popup Colors", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", setter: "set_attr_text_color", getter: "get_attr_text_color", category: "Popup Colors", embed: 1 });

declareattribute("slot_names", { 
  type: "symbol", 
  label: "Slot Names", 
  setter: "set_slot_names", 
  getter: "get_slot_names", 
  category: "Status Config", 
  embed: 1 
});

function save() {
  embedmessage("grid", get_grid());
  embedmessage("set_name_bank_attr", get_name_bank_attr());
  embedmessage("set_name", module_name);
  embedmessage("set_allow_hold_save", allow_hold_save);
  embedmessage("set_hold_threshold", hold_threshold);
  embedmessage("set_double_tap_threshold", double_tap_threshold);
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
  embedmessage("set_accent_bar_color", accent_bar_color[0], accent_bar_color[1], accent_bar_color[2], accent_bar_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);
  embedmessage("set_slot_names", get_slot_names());
  
  const sList = slots.map(s => s.name);
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
    const arr = JSON.parse(decodeURIComponent(str));
    if (Array.isArray(arr) && arr.length > 0) {
      slots = [];
      for (let i = 0; i < arr.length; i++) slots.push({ name: String(arr[i]) });
      redraw_all();
      return;
    }
  } catch(e) {}

  const raw = String(str).split(";");
  slots = [];
  for (let j = 0; j < raw.length; j++) {
    if (raw[j].trim().length > 0) slots.push({ name: raw[j].trim() });
  }
  redraw_all();
}

function notifydeleted() {
  stop_hold_watchdog();
  stop_pop_hold_watchdog();
  if (scrollTask) { try { scrollTask.cancel(); } catch(e) {} }
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (boot_task) { try { boot_task.cancel(); } catch(e) {} }
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];

  if (statusBus && statusBus.clients) delete statusBus.clients[module_name];
  if (statusBus && statusBus.ping_listeners) delete statusBus.ping_listeners[uniqueID];

  if (statusBus && statusBus.subscribers) {
    for (const subKey in statusBus.subscribers) {
      if (typeof statusBus.subscribers[subKey] === "function") {
        try { statusBus.subscribers[subKey](null, -1, 0); } catch(e) {}
      }
    }
  }

  try { if (settingsListener) { settingsListener.subjectname = ""; settingsListener = null; } } catch(e) {}
  try { if (colorListener) { colorListener.subjectname = ""; colorListener = null; } } catch(e) {}
  try { if (paletteListener) { paletteListener.subjectname = ""; paletteListener = null; } } catch(e) {}
  try { if (tickerListener) { tickerListener.subjectname = ""; tickerListener = null; } } catch(e) {}

  try { if (settingsWindow) { settingsWindow.visible = 0; settingsWindow.free(); settingsWindow = null; } } catch(e) {}
  try { if (colorWindow) { colorWindow.visible = 0; colorWindow.free(); colorWindow = null; } } catch(e) {}
  try { if (paletteWindow) { paletteWindow.visible = 0; paletteWindow.free(); paletteWindow = null; } } catch(e) {}
  try { if (tickerWindow) { tickerWindow.visible = 0; tickerWindow.free(); tickerWindow = null; } } catch(e) {}

  try { if (outMatrix) { outMatrix.freepeer(); outMatrix = null; } } catch(e) {}
  try { if (colorMatrix) { colorMatrix.freepeer(); colorMatrix = null; } } catch(e) {}
  try { if (paletteMatrix) { paletteMatrix.freepeer(); paletteMatrix = null; } } catch(e) {}
  try { if (tickerMatrix) { tickerMatrix.freepeer(); tickerMatrix = null; } } catch(e) {}

  try { messnamed("touch_status_bus", "refresh"); } catch(e) {}
}

sync_grid_slots();
broadcast_to_master();
redraw_all();

// Scheduled Auto-Sync on Boot (allows pattrstorage to wake up first)
const boot_task = new Task(() => {
  sync_storage_identity();
}, this);
boot_task.schedule(60);