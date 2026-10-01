// ============================================================================
// touch.status.js - Max 9 v8ui / jsui
// Local Preset Engine + Downward Scanner + Hierarchical Dictionary Inspector +
// Multi-Curve Array Glider + Interactive 3-Tab Carousel Inspector
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 3;
setinletassist(0, "Inlet 0: int / float / [Cols/Rows] / text / messages");
setoutletassist(0, "Outlet 0: Active slot (int) / Morph value (float)");
setoutletassist(1, "Outlet 1: Selected status info (set <name>)");
setoutletassist(2, "Outlet 2: Storage notifications (stored, recalled, saved)");

const uniqueID = Math.floor(Math.random() * 1000000);

let is_transmitting = false;

// =============================================================
// 1. LOCAL DOWNWARD CRAWLER (CRASH SAFE)
// =============================================================
let module_name = "";
let stateDict = null;
let discoveredControls = {};

function is_active_module() {
  return module_name && module_name !== "unnamed" && module_name.trim().length > 0;
}

function get_module_dict() {
  if (!is_active_module()) return null;
  const dName = `touch_states_${module_name}`;
  if (!stateDict || stateDict.name !== dName) {
    stateDict = new Dict(dName);
  }
  return stateDict;
}

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
  if (!is_active_module()) return "";
  const dir = get_states_dir();
  const safeName = module_name.replace(/\s+/g, "_");
  return dir ? `${dir}${safeName}.json` : `${safeName}.json`;
}

function scan_local_controls() {
  discoveredControls = {};
  if (!this.patcher || !is_active_module()) return;

  function traverse(p, pathPrefix) {
    if (!p) return;
    let o = p.firstobject;
    while (o) {
      const sub = o.subpatcher();
      if (sub) {
        const containerName = (o.varname && o.varname !== "v8ui") ? o.varname : "";
        const nextPrefix = containerName ? (pathPrefix ? `${pathPrefix}::${containerName}` : containerName) : pathPrefix;
        traverse(sub, nextPrefix);
      } else {
        if (o !== this.box && o.varname) {
          const mclass = String(o.maxclass).toLowerCase();
          const vname = String(o.varname);

          if (!vname || vname === "v8ui" || vname.startsWith("v8ui_") || vname.startsWith("p_panel")) {
            // Skip
          } else if (mclass === "jsui" || mclass === "v8ui") {
            const fullKey = pathPrefix ? `${pathPrefix}::${o.varname}` : o.varname;
            discoveredControls[fullKey] = o;
          }
        }
      }
      o = o.nextobject;
    }
  }

  traverse(this.patcher, "");
}

function get_control_live_val(o) {
  if (!o) return "---";
  try {
    if (o.js && typeof o.js.get_state === "function") {
      const st = o.js.get_state();
      if (typeof st === "object" && st !== null) {
        if (st.val !== undefined && st.val !== null) {
          let s = typeof st.val === "number" ? st.val.toFixed(2) : String(st.val);
          if (st.mouse_mode !== undefined) {
            s += (st.mouse_mode === 0 ? " [V]" : " [R]");
          }
          return s;
        }
        return JSON.stringify(st);
      }
      return (st !== null && st !== undefined) ? String(st) : "---";
    }
    if (typeof o.getvalueof === "function") {
      const v = o.getvalueof();
      if (v === null || v === undefined) return "---";
      if (typeof v === "number") return v.toFixed(2);
      if (Array.isArray(v)) {
        if (v.length > 3) {
          return `[${v.length} ch] ` + v.slice(0, 2).map(n => typeof n === "number" ? n.toFixed(1) : n).join(" ") + "…";
        }
        return v.map(n => typeof n === "number" ? n.toFixed(2) : n).join(" ");
      }
      return String(v);
    }
  } catch(e) {}
  return "---";
}

function load_states_from_disk() {
  if (!is_active_module()) return;
  const d = get_module_dict();
  const fullpath = get_states_filepath();
  let fileLoaded = false;

  try {
    const checkFile = new File(fullpath);
    if (checkFile.isopen) {
      checkFile.close();
      d.import_json(fullpath);
      fileLoaded = true;
    }
  } catch(e) {}

  sync_slot_names_from_dict();

  if (!fileLoaded) {
    scan_local_controls();
    save_slot(0);
  }
}

function write_states_to_disk() {
  if (!is_active_module()) return;
  const d = get_module_dict();
  const fullpath = get_states_filepath();
  try {
    d.export_json(fullpath);
    outlet(2, ["saved", fullpath]);
  } catch(e) {}
}

function sync_slot_names_from_dict() {
  const d = get_module_dict();
  if (!d) return;
  for (let i = 0; i < slots.length; i++) {
    const key = `slot_${i}`;
    if (d.contains(key)) {
      try {
        const raw = d.get(key);
        const parsed = (typeof raw === "string") ? JSON.parse(raw) : raw;
        if (parsed && parsed.name) {
          slots[i].name = parsed.name;
        }
      } catch(e) {}
    }
  }
  redraw_all();
}

function clear_names() {
  function wipe(p) {
    if (!p) return;
    let o = p.firstobject;
    while (o) {
      if (o.subpatcher()) wipe(o.subpatcher());
      if (o.varname && (o.varname.startsWith("rdial_") || o.varname.startsWith("v8ui_") || o.varname === "v8ui")) {
        o.varname = "";
      }
      o = o.nextobject;
    }
  }
  wipe(this.patcher);
  scan_local_controls();
  post("\nCleaned all auto-generated scripting names from patch.\n");
  draw_clients_window();
}

// =============================================================
// 2. STATE & GRID TOPOLOGY (Cols / Rows)
// =============================================================
let active_slot = 0;
let last_stored_slot = -1;
let morph_val   = 1.0;
let morph_x     = 1.0;
let morph_y     = 1.0;
let is_morphing = 0;

let grid_cols = 4;
let grid_rows = 1;
let morph_weights = [];

let slots = [
  { name: "Init Status" },
  { name: "Clean Tone" },
  { name: "Lead 80s" },
  { name: "Solo Boost" }
];

let name_bank = [
  "Init Status", "Clean Tone", "Warm Crunch", "Lead 80s",
  "Heavy Drive", "Solo Boost", "Ambient Pad", "Perc 3/8",
  "Drum 2/4", "Mute / Cut", "Sub Bass", "FX Riser"
];

let allow_hold_save       = 1;
let hold_threshold        = 500;
let double_tap_threshold  = 320;
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
let borders          = 1;

let bg_color          = [0.12, 0.12, 0.14, 0.95];
let border_color      = [0.45, 0.45, 0.50, 1.0];
let text_color        = [0.92, 0.94, 0.98, 1.0];
let highlight_color   = [0.85, 0.52, 0.20, 1.0];
let popup_dot_color   = [1.00, 0.00, 0.00, 1.0];
let accent_bar_color  = [1.00, 1.00, 1.00, 1.0];

let pop_bgcolor       = [0.10, 0.10, 0.12, 0.98];
let attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
let attr_border_color = [0.28, 0.28, 0.32, 1.0];
let attr_slider_color = [0.35, 0.38, 0.42, 1.0];
let attr_text_color   = [0.88, 0.88, 0.88, 1.0];

// 3-Tab Carousel Inspector State
let show_settings_attrs = 1;
let active_mask_tab = 0;
const mask_tab_names = ["1. Performance", "2. Geometry / Labels", "3. Colors"];

let showSettings       = 0;
let popup_window_width = 280;
let popup_window_fixed_h = 456;
let popup_mini_w       = 320;
let popup_mini_h       = 110;

// Subwindows
let settingsWindow = null;
let paletteWindow  = null;
let tickerWindow   = null;
let clientsWindow  = null;
let colorWindow    = null;

let settingsListener = null;
let paletteListener  = null;
let tickerListener   = null;
let clientsListener  = null;
let colorListener    = null;

let outMatrix     = null;
let paletteMatrix = null;
let tickerMatrix  = null;
let clientsMatrix = null;
let colorMatrix   = null;

let active_ticker_column = -1;
let target_edit_slot = 0;
let showClientsWindow = 0;
let active_color_target = "bg_color";
let active_pop_target = -1;
let is_mouse_down_anywhere = 0;
let picker_drag_zone = 0;
let cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

let lastMouseX = 0;
let lastMouseY = 0;

// Scanned Clients Inspector Controls & Tree State
let client_view_mode = 0; // 0 = Hierarchical Dictionary Tree, 1 = Flat List
let client_sort_mode = 0; // 0 = Natural Alphanumeric (A-Z), 1 = Raw Patch Order
let clients_collapsed_paths = {}; // Tracks folded branches
let clients_cached_rows = []; // Linear visual rows currently rendered

let clientsScrollOffset = 0;
let isClientsDragging   = 0;
let clientsDragStartY   = 0;
let clientsDragStartOff = 0;
let highlightedControlKey = "";

let scroll_valBoxX = 0;
let scroll_valBoxW = 100;
let scrollTask = new Task(function () {
  if (active_pop_target === -1) return;
  const targetPct = clamp((lastMouseX - scroll_valBoxX) / scroll_valBoxW, 0, 1);
  apply_slider_target(active_pop_target, targetPct);
}, this);
scrollTask.interval = 15;

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

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function lerp(a, b, t) { return a + (b - a) * t; }

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
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
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
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

function stop_scrolling() {
  if (scrollTask) {
    try { scrollTask.cancel(); } catch(e) {}
  }
}

// =============================================================
// 3. THEME BUS
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

function redraw_all() {
  if (typeof mgraphics !== "undefined" && mgraphics && typeof mgraphics.redraw === "function") {
    mgraphics.redraw();
  }
  if (showSettings && settingsWindow && settingsWindow.visible) draw_settings();
  if (showClientsWindow && clientsWindow && clientsWindow.visible) draw_clients_window();
}

function fit_text_to_width(ctx, txt, maxW) {
  if (!txt) return "";
  if (ctx.text_measure(txt)[0] <= maxW) return txt;
  let low = 0, high = txt.length, best = "";
  while (low <= high) {
    const mid = (low + high) >> 1;
    const sub = txt.slice(0, mid);
    if (ctx.text_measure(sub)[0] <= maxW) {
      best = sub; low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}

// =============================================================
// 4. GRID SETUP & MORPHING ENGINE (SMOOTH GLIDE + 50% SNAP)
// =============================================================
function sync_grid_slots() {
  let total = grid_cols * grid_rows;
  if (total < 1) total = 1;

  while (slots.length < total) {
    const nextIdx = slots.length;
    const defName = (name_bank[nextIdx % name_bank.length]) || (`Status ${nextIdx + 1}`);
    slots.push({ name: defName });
  }
  while (slots.length > total) slots.pop();
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
    parsedC = parseInt(parts[0], 10); parsedR = parseInt(parts[1], 10);
  } else if (args.length >= 2) {
    parsedC = parseInt(args[0], 10); parsedR = parseInt(args[1], 10);
  } else {
    parsedC = parseInt(args[0], 10);
  }

  if (!isNaN(parsedC) && parsedC >= 1) grid_cols = clamp(parsedC, 1, 99);
  if (!isNaN(parsedR) && parsedR >= 1) grid_rows = clamp(parsedR, 1, 99);

  sync_grid_slots();
  sync_slot_names_from_dict();
  redraw_all();
  broadcast_to_master();
}
function get_grid() { return `${grid_cols}/${grid_rows}`; }

function dispatch_morph_to_controls(slotA_idx, slotB_idx, blendRatio) {
  if (!is_active_module()) return;
  const d = get_module_dict();
  if (!d) return;

  let dataA = null, dataB = null;
  try {
    const rawA = d.get(`slot_${slotA_idx}`);
    if (rawA) dataA = (typeof rawA === "string") ? JSON.parse(rawA) : rawA;
    const rawB = d.get(`slot_${slotB_idx}`);
    if (rawB) dataB = (typeof rawB === "string") ? JSON.parse(rawB) : rawB;
  } catch(e) {}

  const ctrlA = (dataA && dataA.controls) ? dataA.controls : {};
  const ctrlB = (dataB && dataB.controls) ? dataB.controls : {};

  for (const k in discoveredControls) {
    const o = discoveredControls[k];
    if (!o) continue;

    const valA = ctrlA[k];
    const valB = ctrlB[k] !== undefined ? ctrlB[k] : valA;
    if (valA === undefined) continue;

    try {
      if (o.js && typeof o.js.morph_state === "function") {
        o.js.morph_state(valA, valB, blendRatio);
        continue;
      }

      const rawA = (typeof valA === "object" && valA !== null && valA.val !== undefined) ? valA.val : valA;
      const rawB = (typeof valB === "object" && valB !== null && valB.val !== undefined) ? valB.val : valB;

      if (typeof rawA === "number" && typeof rawB === "number") {
        const blended = lerp(rawA, rawB, blendRatio);
        if (typeof o.setvalueof === "function") o.setvalueof(blended);
        else o.message("float", blended);
      } else if (Array.isArray(rawA) && Array.isArray(rawB)) {
        const isButtonA = rawA.length > 0 && rawA.every(n => Number(n) === 0 || Number(n) === 1);
        const isButtonB = rawB.length > 0 && rawB.every(n => Number(n) === 0 || Number(n) === 1);

        if (isButtonA && isButtonB) {
          const snapTarget = (blendRatio >= 0.5) ? rawB : rawA;
          if (typeof o.setvalueof === "function") o.setvalueof(snapTarget);
          else o.message("list", snapTarget);
        } else {
          const maxLen = Math.max(rawA.length, rawB.length);
          const blendedArr = [];
          for (let i = 0; i < maxLen; i++) {
            const nA = i < rawA.length ? Number(rawA[i]) : Number(rawA[rawA.length - 1]);
            const nB = i < rawB.length ? Number(rawB[i]) : Number(rawB[rawB.length - 1]);
            blendedArr.push(lerp(nA, nB, blendRatio));
          }
          if (typeof o.setvalueof === "function") o.setvalueof(blendedArr);
          else o.message("list", blendedArr);
        }
      } else {
        const snapTarget = (blendRatio >= 0.5) ? rawB : rawA;
        if (typeof o.setvalueof === "function") o.setvalueof(snapTarget);
        else o.message(snapTarget);
      }
    } catch(e) {}
  }
}

function apply_normalized_xy(normX, normY) {
  if (!is_active_module()) return;
  last_stored_slot = -1;

  const cols = Math.max(1, grid_cols);
  const rows = Math.max(1, grid_rows);

  const u = clamp(normX, 0.0, 1.0) * (cols - 1);
  const v = clamp(normY, 0.0, 1.0) * (rows - 1);

  morph_x = 1.0 + u; morph_y = 1.0 + v;

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

        const fPos = morph_val - 1.0;
        const sA = Math.floor(fPos);
        const sB = Math.min(slots.length - 1, sA + 1);
        const frac = fPos - sA;

        dispatch_morph_to_controls(sA, sB, frac);
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

        dispatch_morph_to_controls(domA.idx, domB.idx, blendRatio);
        outlet(0, domA.idx + 1);
      }
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function calculate_2d_weights(localX, localY, totalW, totalH, is_preview) {
  const cols = Math.max(1, grid_cols);
  const rows = Math.max(1, grid_rows);
  const padX = 4, padY = 4;
  const stripW = is_preview ? 0 : 14;
  const b = isNaN(border_thickness) ? 1.2 : border_thickness;
  const inset = b * 0.5;

  const slotStartX = is_preview ? (inset + padX) : (inset + padX + stripW + padX);
  const availW = Math.max(1, (totalW - b - padX) - slotStartX);
  const availH = Math.max(1, totalH - b - padY * 2);
  const cellW = availW / cols;
  const cellH = availH / rows;

  const normX = cols > 1 ? clamp(((localX - slotStartX) - 0.5 * cellW) / Math.max(1, availW - cellW), 0.0, 1.0) : 0.0;
  const normY = rows > 1 ? clamp(((localY - (inset + padY)) - 0.5 * cellH) / Math.max(1, availH - cellH), 0.0, 1.0) : 0.0;

  apply_normalized_xy(normX, normY);
}

// =============================================================
// 5. VECTOR DRAW ENGINE
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

  if (b > 0 && borders === 1) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  if (!is_active_module()) {
    ctx.select_font_face(font_name, "normal", "bold");
    ctx.set_font_size(10);
    ctx.set_source_rgba(1.0, 0.4, 0.4, 0.85);
    const dormMsg = "[DORMANT: ASSIGN NAME]";
    const dTm = ctx.text_measure(dormMsg);
    ctx.move_to((w - dTm[0]) * 0.5, h * 0.5 + 3.5);
    ctx.show_text(dormMsg);
    return;
  }

  const padX = 4, padY = 4;
  const cols = Math.max(1, grid_cols);
  const rows_count = Math.max(1, grid_rows);
  const stripW = is_preview ? 0 : 14;

  const slotStartX = is_preview ? (inset + padX) : (inset + padX + stripW + padX);
  const availW = (rw - padX) - slotStartX;
  const availH = rh - padY * 2;
  const cellW = availW / cols;
  const cellH = availH / rows_count;

  if (!is_preview) {
    const stripX = inset + padX;
    const stripY = inset + padY;
    const stripH = (grid_rows > 1) ? ((cellH * grid_rows) - 3) : (cellH - 3);
    const stripR = Math.max(2, Math.min(4, border_radius * 0.5));

    ctx.set_source_rgba(accent_bar_color);
    ctx.rectangle_rounded(stripX, stripY, stripW, stripH, stripR, stripR);
    ctx.fill();

    ctx.set_source_rgba(0.08, 0.08, 0.10, 0.65);
    const midSX = stripX + stripW * 0.5;
    const midSY = stripY + stripH * 0.5;
    ctx.arc(midSX, midSY - 6, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.arc(midSX, midSY, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.arc(midSX, midSY + 6, 1.2, 0, Math.PI * 2); ctx.fill();
  }

  for (let i = 0; i < slots.length; i++) {
    const c = i % cols, row = Math.floor(i / cols);
    const sX = slotStartX + c * cellW;
    const sY = inset + padY + row * cellH;
    const sW = cellW - 3;
    const sH = cellH - 3;

    let highlightAlpha = 0.0;
    if (is_morphing && morph_weights.length === slots.length) {
      highlightAlpha = morph_weights[i] || 0.0;
    } else {
      if (i === active_slot) highlightAlpha = 1.0;
    }

    ctx.set_source_rgba(bg_color);
    ctx.rectangle_rounded(sX, sY, sW, sH, 3, 3);
    ctx.fill();

    if (highlightAlpha > 0.01) {
      ctx.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], highlight_color[3] * highlightAlpha);
      ctx.rectangle_rounded(sX, sY, sW, sH, 3, 3);
      ctx.fill();
    }

    if (i === last_stored_slot) {
      const barH = 2.5, barMargin = 4.0;
      const barY = sY + sH - barH - 1.5;
      const barX = sX + barMargin;
      const barW = Math.max(2, sW - barMargin * 2);
      ctx.set_source_rgba(accent_bar_color);
      ctx.rectangle_rounded(barX, barY, barW, barH, barH * 0.5, barH * 0.5);
      ctx.fill();
    }

    ctx.select_font_face(font_name, "normal", "bold");
    ctx.set_font_size(Math.max(7, Math.min(10, sH * 0.28)));
    ctx.set_source_rgba(highlightAlpha > 0.4 ? [1, 1, 1, 0.9] : [0.55, 0.58, 0.64, 0.8]);
    ctx.move_to(sX + 4, sY + Math.max(8, sH * 0.28));
    ctx.show_text(String(i + 1));

    let dispTxt = slots[i] ? slots[i].name : "";
    ctx.select_font_face(font_name, font_slants[font_style], (highlightAlpha > 0.4) ? "bold" : font_weights[font_style]);
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
// 6. RECALL & STORE (SAFE MEMORY SNAPSHOT)
// =============================================================
function recall_slot(idx) {
  if (!is_active_module() || idx < 0 || idx >= slots.length) return;
  if (idx !== last_stored_slot) last_stored_slot = -1;

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

  const d = get_module_dict();
  const slotKey = `slot_${idx}`;
  let slotData = null;
  if (d && d.contains(slotKey)) {
    try {
      const raw = d.get(slotKey);
      slotData = (typeof raw === "string") ? JSON.parse(raw) : raw;
    } catch(e) {}
  }

  if (slotData && slotData.controls) {
    scan_local_controls();
    for (const k in slotData.controls) {
      const o = discoveredControls[k];
      if (!o) continue;
      const cData = slotData.controls[k];

      try {
        if (o.js && typeof o.js.set_state === "function") {
          o.js.set_state(cData);
        } else if (typeof o.setvalueof === "function") {
          o.setvalueof(typeof cData === "object" && cData !== null ? cData.val : cData);
        } else {
          const directVal = (typeof cData === "object" && cData !== null) ? cData.val : cData;
          if (directVal !== undefined) o.message("float", directVal);
        }
      } catch(e) {}
    }
  }

  if (slotData && slotData.name) {
    slots[active_slot].name = slotData.name;
  }

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, active_slot + 1);
      outlet(1, ["set", slots[active_slot].name]);
      outlet(2, ["recalled", active_slot + 1, slots[active_slot].name]);
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function save_slot(idx) {
  if (!is_active_module()) return;
  if (idx === undefined) idx = active_slot;
  idx = parseInt(idx, 10);
  if (isNaN(idx) || idx < 0 || idx >= slots.length) return;

  active_slot = idx;
  target_edit_slot = idx;
  last_stored_slot = idx;
  morph_val = active_slot + 1;
  is_morphing = 0;

  morph_weights = new Array(slots.length).fill(0.0);
  morph_weights[active_slot] = 1.0;

  scan_local_controls();
  const snapshotControls = {};

  for (const k in discoveredControls) {
    const o = discoveredControls[k];
    if (!o) continue;

    try {
      if (o.js && typeof o.js.get_state === "function") {
        snapshotControls[k] = o.js.get_state();
      } else if (typeof o.getvalueof === "function") {
        const v = o.getvalueof();
        if (typeof v === "number" || typeof v === "string" || Array.isArray(v)) {
          snapshotControls[k] = { val: v };
        }
      }
    } catch(e) {}
  }

  const d = get_module_dict();
  if (d) {
    const slotKey = `slot_${idx}`;
    const slotPayload = {
      name: slots[idx].name,
      controls: snapshotControls
    };
    d.set(slotKey, JSON.stringify(slotPayload));
    write_states_to_disk();
  }

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, active_slot + 1);
      outlet(1, ["set", slots[active_slot].name]);
      outlet(2, ["stored", active_slot + 1, slots[active_slot].name]);
    } finally {
      is_transmitting = false;
    }
  }

  redraw_all();
  broadcast_to_master();
}

function store_slot(idx) { save_slot(idx); }

function msg_float(v) {
  if (isDragging || !is_active_module()) return;
  let f = parseFloat(v);
  if (isNaN(f)) return;
  const totalSlots = slots.length;
  if (totalSlots < 1) return;

  last_stored_slot = -1;
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

  dispatch_morph_to_controls(floorIdx, ceilIdx, frac);

  if (!is_transmitting) {
    is_transmitting = true;
    try { outlet(0, f); } finally { is_transmitting = false; }
  }

  redraw_all();
  broadcast_to_master();
}

function stamp_name_to_slot(slotIdx, chosenName) {
  if (slotIdx < 0 || slotIdx >= slots.length) return;
  slots[slotIdx].name = chosenName;
  save_slot(slotIdx);
  if (paletteWindow && paletteWindow.visible) draw_palette();
}

// =============================================================
// 7. GESTURES & ONCLICK
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

function onclick(x, y, button, cmd, shift, capslock, option, ctrl, pointerevent) {
  const sz = mgraphics.size;
  const w = sz[0], h = sz[1];
  const b = isNaN(border_thickness) ? 1.2 : border_thickness;
  const inset = b * 0.5;
  const padX = 4, padY = 4;
  const stripW = 14;
  const stripX = inset + padX;
  const stripY = inset + padY;

  const cols = Math.max(1, grid_cols);
  const rows_count = Math.max(1, grid_rows);
  const cellH = (h - b - padY * 2) / rows_count;
  const stripH = (grid_rows > 1) ? ((cellH * grid_rows) - 3) : (cellH - 3);

  // Strip hit -> Toggle Scanned Controls
  if (x >= stripX - 3 && x <= stripX + stripW + 3 && y >= stripY && y <= stripY + stripH) {
    toggle_clients_window();
    return;
  }

  // Red Dot hit -> Settings
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

  if (!is_active_module()) {
    showSettings = 1;
    update_settings_dimensions();
    return;
  }

  const slotStartX = stripX + stripW + padX;
  const availW = (w - b - padX) - slotStartX;
  const availH = (h - b) - padY * 2;
  const cellW = availW / cols;

  if (x < slotStartX) return;

  const colHit = Math.floor((x - slotStartX) / cellW);
  const rowHit = Math.floor((y - (inset + padY)) / cellH);

  if (colHit < 0 || colHit >= cols || rowHit < 0 || rowHit >= rows_count) return;
  const clickedSlot = rowHit * cols + colHit;
  if (clickedSlot < 0 || clickedSlot >= slots.length) return;

  const now = new Date().getTime();

  if (now - last_tap_time < double_tap_threshold && clickedSlot === last_tap_slot) {
    last_tap_time = 0;
    stop_hold_watchdog();
    suppress_release_recall = 1;
    open_palette_for_slot(clickedSlot);
    return;
  }

  last_tap_time = now;
  last_tap_slot = clickedSlot;

  stop_hold_watchdog();
  isMouseDown = 1;
  isDragging = 0;
  has_dragged = 0;
  has_saved_on_hold = 0;
  suppress_release_recall = 0;
  clickStartX = x;
  clickStartY = y;
  pendingSlot = clickedSlot;

  if (allow_hold_save === 1) {
    holdTask = new Task(() => {
      if (isMouseDown === 1 && pendingSlot !== -1 && !isDragging && !has_dragged) {
        const target = pendingSlot;
        has_saved_on_hold = 1;
        suppress_release_recall = 1;
        save_slot(target);
      }
    }, this);
    holdTask.schedule(hold_threshold);
  }
}

function ondrag(x, y, button) {
  if (button === 0) {
    if (pendingSlot !== -1 && !has_dragged && !has_saved_on_hold && !suppress_release_recall) {
      recall_slot(pendingSlot);
    }
    stop_hold_watchdog();
    return;
  }

  if (Math.abs(x - clickStartX) > 2 || Math.abs(y - clickStartY) > 2) {
    if (holdTask) { try { holdTask.cancel(); } catch(e) {} holdTask = null; }
    isDragging = 1;
    has_dragged = 1;
    last_tap_time = 0;
    last_stored_slot = -1;
  }

  const sz = mgraphics.size;
  calculate_2d_weights(x, y, sz[0], sz[1], false);
}

function onidle() { if (isMouseDown) stop_hold_watchdog(); }
function onidleout() { stop_hold_watchdog(); }

// =============================================================
// 8. MASTER BUS INTERFACE
// =============================================================
const statusBus = new Global("touch_status_bus");
if (!statusBus.clients) statusBus.clients = {};
if (!statusBus.subscribers) statusBus.subscribers = {};
if (!statusBus.ping_listeners) statusBus.ping_listeners = {};

statusBus.ping_listeners[uniqueID] = function() {
  broadcast_to_master();
};

function broadcast_to_master() {
  if (!is_active_module()) return;
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
        try { statusBus.subscribers[subKey](module_name, active_slot, morph_val); } catch(e) {}
      }
    }
  }

  try { messnamed("touch_status_bus", "refresh"); } catch(e) {}
}

// =============================================================
// 9. CLIENT OBJECTS INSPECTOR (DICTIONARY TREE + FLAT)
// =============================================================
const WIN_W = 480;
const WIN_H = 520;
const HEADER_H = 46;

function getClientsWindow() {
  if (!clientsWindow) {
    clientsWindow = new JitterObject("jit.window", `status_cli_${uniqueID}`);
    clientsWindow.floating = 1;
    clientsWindow.visible = 0;
    clientsWindow.border = 1;
    clientsWindow.grow = 0;
    clientsWindow.title = `Scanned Controls: ${module_name || "UNNAMED"}`;
    clientsWindow.size = [WIN_W, WIN_H];
    clientsListener = new JitterListener(clientsWindow.name, clientsWindowListenerCallback);
  }
  return clientsWindow;
}

function toggle_clients_window(v) {
  if (v === undefined) showClientsWindow = !showClientsWindow;
  else showClientsWindow = parseInt(v, 10) ? 1 : 0;

  const win = getClientsWindow();
  if (showClientsWindow) {
    scan_local_controls();
    clientsScrollOffset = 0;
    win.size = [WIN_W, WIN_H];
    win.title = `Scanned Controls: ${module_name || "UNNAMED"}`;
    if (this.box && this.box.rect) {
      win.pos = [this.box.rect[0], this.box.rect[3] + 10];
    }
    win.visible = 1;
    win.front();
    draw_clients_window();
  } else {
    win.visible = 0;
  }
}

// Natural alphanumeric sorting comparison helper
function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

// Builds the linear visual rows based on View Mode (Dictionary Tree vs Flat)
function build_clients_render_rows() {
  let keys = Object.keys(discoveredControls);

  if (client_sort_mode === 0) {
    keys.sort(naturalCompare);
  }

  if (client_view_mode === 1) {
    // FLAT VIEW MODE
    return keys.map(k => ({
      type: "leaf",
      depth: 0,
      label: k,
      fullKey: k
    }));
  }

  // HIERARCHICAL DICTIONARY TREE MODE
  const root = { children: {} };

  for (let i = 0; i < keys.length; i++) {
    const fullKey = keys[i];
    const parts = fullKey.split("::");
    let curr = root;

    for (let p = 0; p < parts.length; p++) {
      const part = parts[p];
      const isLast = (p === parts.length - 1);
      const nodePath = parts.slice(0, p + 1).join("::");

      if (!curr.children[part]) {
        curr.children[part] = {
          name: part,
          children: {},
          isLeaf: isLast,
          path: nodePath,
          fullKey: isLast ? fullKey : ""
        };
      }
      curr = curr.children[part];
    }
  }

  const rows = [];

  function walk(node, depth) {
    let childNames = Object.keys(node.children);
    if (client_sort_mode === 0) {
      childNames.sort(naturalCompare);
    }

    for (let i = 0; i < childNames.length; i++) {
      const child = node.children[childNames[i]];
      const hasChildren = Object.keys(child.children).length > 0;

      if (hasChildren) {
        // Container branch (renders as "name:")
        const isCollapsed = !!clients_collapsed_paths[child.path];
        rows.push({
          type: "branch",
          depth: depth,
          label: `${child.name}:`,
          path: child.path,
          collapsed: isCollapsed
        });

        if (!isCollapsed) {
          walk(child, depth + 1);
        }
      } else {
        // Leaf control
        rows.push({
          type: "leaf",
          depth: depth,
          label: child.name,
          fullKey: child.fullKey
        });
      }
    }
  }

  walk(root, 0);
  return rows;
}

function toggle_all_tree_collapse() {
  const hasAnyCollapsed = Object.keys(clients_collapsed_paths).some(k => clients_collapsed_paths[k]);
  if (hasAnyCollapsed) {
    clients_collapsed_paths = {}; // Expand all
  } else {
    // Collapse all branches
    const keys = Object.keys(discoveredControls);
    for (let i = 0; i < keys.length; i++) {
      const parts = keys[i].split("::");
      for (let p = 1; p < parts.length; p++) {
        const branchPath = parts.slice(0, p).join("::");
        clients_collapsed_paths[branchPath] = true;
      }
    }
  }
  draw_clients_window();
}

function draw_clients_window() {
  if (!showClientsWindow || !clientsWindow) return;
  const win = getClientsWindow();
  win.size = [WIN_W, WIN_H];

  clientsMatrix = recycleMatrix(clientsMatrix, WIN_W, WIN_H);
  const ctx = new MGraphics(WIN_W, WIN_H);

  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, WIN_W, WIN_H);
  ctx.fill();

  clients_cached_rows = build_clients_render_rows();
  const rows = clients_cached_rows;

  const rowH = 28, gap = 3;
  const topListY = HEADER_H + 6;
  const viewH = WIN_H - topListY - 8;
  const totalContentH = rows.length * (rowH + gap);
  const maxScroll = Math.max(0, totalContentH - viewH);

  clientsScrollOffset = clamp(clientsScrollOffset, 0, maxScroll);
  const startY = topListY - clientsScrollOffset;
  const margin = 12, rowW = WIN_W - margin * 2 - 14;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rY = startY + i * (rowH + gap);
    if (rY + rowH < 0 || rY > WIN_H) continue;

    const indentX = margin + (r.depth * 18);
    const itemW = rowW - (r.depth * 18);

    if (r.type === "branch") {
      // Branch row (dictionary outline category)
      ctx.set_source_rgba(0.08, 0.09, 0.11, 0.85);
      ctx.rectangle_rounded(indentX, rY, itemW, rowH, 3, 3);
      ctx.fill();

      ctx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.6);
      ctx.set_line_width(0.6);
      ctx.rectangle_rounded(indentX, rY, itemW, rowH, 3, 3);
      ctx.stroke();

      // Branch expand/collapse indicator (▼ / ►)
      ctx.select_font_face("Arial", "normal", "bold");
      ctx.set_font_size(9);
      ctx.set_source_rgba(highlight_color);
      ctx.move_to(indentX + 8, rY + rowH * 0.5 + 3.5);
      ctx.show_text(r.collapsed ? "►" : "▼");

      // Dictionary category name with colon
      ctx.set_font_size(11);
      ctx.set_source_rgba(0.92, 0.94, 0.98, 1.0);
      const bText = fit_text_to_width(ctx, r.label, itemW - 32);
      ctx.move_to(indentX + 22, rY + rowH * 0.5 + 4.0);
      ctx.show_text(bText);
    } else {
      // Leaf control row
      const isSelected = (r.fullKey === highlightedControlKey);
      const o = discoveredControls[r.fullKey];
      const liveVal = get_control_live_val(o);

      ctx.set_source_rgba(isSelected ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.25] : attr_bg_color);
      ctx.rectangle_rounded(indentX, rY, itemW, rowH, 3, 3);
      ctx.fill();

      ctx.set_source_rgba(isSelected ? highlight_color : attr_border_color);
      ctx.set_line_width(isSelected ? 1.0 : 0.6);
      ctx.rectangle_rounded(indentX, rY, itemW, rowH, 3, 3);
      ctx.stroke();

      // Small control dot
      ctx.set_source_rgba(accent_bar_color);
      ctx.arc(indentX + 10, rY + rowH * 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.select_font_face("Arial", "normal", isSelected ? "bold" : "normal");
      ctx.set_font_size(10.5);
      ctx.set_source_rgba(isSelected ? [1, 1, 1, 1] : [0.88, 0.90, 0.94, 1.0]);

      const vBoxW = 120, vBoxH = 20;
      const vBoxX = indentX + itemW - vBoxW - 5;
      const vBoxY = rY + (rowH - vBoxH) * 0.5;

      const leafText = fit_text_to_width(ctx, r.label, itemW - vBoxW - 24);
      ctx.move_to(indentX + 18, rY + rowH * 0.5 + 4.0);
      ctx.show_text(leafText);

      // Live value box
      ctx.set_source_rgba(0.06, 0.07, 0.09, 0.95);
      ctx.rectangle_rounded(vBoxX, vBoxY, vBoxW, vBoxH, 3, 3);
      ctx.fill();

      ctx.set_source_rgba(attr_border_color);
      ctx.set_line_width(0.6);
      ctx.rectangle_rounded(vBoxX, vBoxY, vBoxW, vBoxH, 3, 3);
      ctx.stroke();

      ctx.select_font_face("Arial", "normal", "bold");
      ctx.set_font_size(10);
      ctx.set_source_rgba(liveVal === "---" ? [0.5, 0.5, 0.5, 0.8] : highlight_color);
      const vTm = ctx.text_measure(String(liveVal));
      ctx.move_to(vBoxX + Math.max(4, (vBoxW - vTm[0]) * 0.5), vBoxY + 14.0);
      ctx.show_text(String(liveVal));
    }
  }

  // Scrollbar
  if (maxScroll > 0) {
    const sbTrackX = WIN_W - 12, sbTrackY = topListY, sbTrackH = viewH;
    ctx.set_source_rgba(0.06, 0.06, 0.08, 0.6);
    ctx.rectangle_rounded(sbTrackX, sbTrackY, 6, sbTrackH, 3, 3);
    ctx.fill();

    const thumbH = Math.max(28, (viewH / totalContentH) * sbTrackH);
    const thumbY = sbTrackY + (clientsScrollOffset / maxScroll) * (sbTrackH - thumbH);
    ctx.set_source_rgba(accent_bar_color);
    ctx.rectangle_rounded(sbTrackX, thumbY, 6, thumbH, 3, 3);
    ctx.fill();
  }

  // -------------------------------------------------------------
  // TOP HEADER BAR & CONTROLS / MODE SWITCHERS
  // -------------------------------------------------------------
  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, WIN_W, HEADER_H);
  ctx.fill();

  // Close red dot
  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 16, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Title with total scanned count
  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(10.5);
  ctx.set_source_rgba(0.92, 0.94, 0.98, 1.0);
  ctx.move_to(26, 20);
  ctx.show_text(`SCANNED (${Object.keys(discoveredControls).length})`);

  const btnY = 8, btnH = 22;

  // 1. View Mode Switcher Pill (TREE / FLAT)
  const vBtnX = 168, vBtnW = 54;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(vBtnX, btnY, vBtnW, btnH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(client_view_mode === 0 ? highlight_color : attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(vBtnX, btnY, vBtnW, btnH, 3, 3);
  ctx.stroke();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(client_view_mode === 0 ? highlight_color : attr_text_color);
  const vLbl = client_view_mode === 0 ? "TREE" : "FLAT";
  const vTm = ctx.text_measure(vLbl);
  ctx.move_to(vBtnX + (vBtnW - vTm[0]) * 0.5, btnY + 15.0);
  ctx.show_text(vLbl);

  // 2. Sort Mode Switcher Pill (A-Z / RAW)
  const sBtnX = 228, sBtnW = 46;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(sBtnX, btnY, sBtnW, btnH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(client_sort_mode === 0 ? highlight_color : attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(sBtnX, btnY, sBtnW, btnH, 3, 3);
  ctx.stroke();

  ctx.set_source_rgba(client_sort_mode === 0 ? highlight_color : attr_text_color);
  const sLbl = client_sort_mode === 0 ? "A–Z" : "RAW";
  const sTm = ctx.text_measure(sLbl);
  ctx.move_to(sBtnX + (sBtnW - sTm[0]) * 0.5, btnY + 15.0);
  ctx.show_text(sLbl);

  // 3. Tree Expand/Collapse All Pill
  const fBtnX = 280, fBtnW = 34;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(fBtnX, btnY, fBtnW, btnH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(fBtnX, btnY, fBtnW, btnH, 3, 3);
  ctx.stroke();

  ctx.set_source_rgba(attr_text_color);
  const fTm = ctx.text_measure("±");
  ctx.move_to(fBtnX + (fBtnW - fTm[0]) * 0.5, btnY + 15.0);
  ctx.show_text("±");

  // 4. RESCAN Button
  const rBtnX = 320, rBtnW = 66;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(rBtnX, btnY, rBtnW, btnH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(accent_bar_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(rBtnX, btnY, rBtnW, btnH, 3, 3);
  ctx.stroke();

  ctx.set_source_rgba(accent_bar_color);
  const rTm = ctx.text_measure("RESCAN");
  ctx.move_to(rBtnX + (rBtnW - rTm[0]) * 0.5, btnY + 15.0);
  ctx.show_text("RESCAN");

  // 5. Scroll Step Arrows (▲ / ▼)
  const upX = 392, dwnX = 418, stepW = 22;
  ctx.set_source_rgba(attr_bg_color);
  ctx.rectangle_rounded(upX, btnY, stepW, btnH, 3, 3);
  ctx.rectangle_rounded(dwnX, btnY, stepW, btnH, 3, 3);
  ctx.fill();
  ctx.set_source_rgba(attr_border_color);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(upX, btnY, stepW, btnH, 3, 3);
  ctx.rectangle_rounded(dwnX, btnY, stepW, btnH, 3, 3);
  ctx.stroke();

  ctx.set_source_rgba(text_color);
  ctx.set_font_size(9.5);
  ctx.move_to(upX + 7, btnY + 15.0); ctx.show_text("▲");
  ctx.move_to(dwnX + 7, btnY + 15.0); ctx.show_text("▼");

  // Bottom dividing line
  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
  ctx.set_line_width(1.0);
  ctx.move_to(8, HEADER_H); ctx.line_to(WIN_W - 8, HEADER_H); ctx.stroke();

  const img = new Image(ctx);
  img.tonamedmatrix(clientsMatrix.name);
  win.jit_matrix(clientsMatrix.name);
}

function clientsWindowListenerCallback(event) {
  if (event.eventname === "close") { showClientsWindow = 0; return; }
  const a = arrayfromargs(event.args);
  const mx = a[0], my = a[1], mbut = a[2];

  const rows = clients_cached_rows;
  const rowH = 28, gap = 3, topListY = HEADER_H + 6;
  const viewH = WIN_H - topListY - 8;
  const totalContentH = rows.length * (rowH + gap);
  const maxScroll = Math.max(0, totalContentH - viewH);

  if (event.eventname === "mouse") {
    if (mbut === 0) { isClientsDragging = 0; return; }

    if (mbut === 1 && !isClientsDragging) {
      // HEADER BAR HITS
      if (my <= HEADER_H) {
        if (mx < 24 && my < 24) { showClientsWindow = 0; toggle_clients_window(0); return; }

        // Mode Switcher: Tree vs Flat
        if (mx >= 168 && mx <= 222 && my >= 8 && my <= 30) {
          client_view_mode = (client_view_mode === 0) ? 1 : 0;
          clientsScrollOffset = 0;
          draw_clients_window();
          return;
        }

        // Sort Switcher: A-Z vs Raw
        if (mx >= 228 && mx <= 274 && my >= 8 && my <= 30) {
          client_sort_mode = (client_sort_mode === 0) ? 1 : 0;
          clientsScrollOffset = 0;
          draw_clients_window();
          return;
        }

        // Expand / Collapse All
        if (mx >= 280 && mx <= 314 && my >= 8 && my <= 30) {
          toggle_all_tree_collapse();
          return;
        }

        // RESCAN
        if (mx >= 320 && mx <= 386 && my >= 8 && my <= 30) {
          scan_local_controls();
          clientsScrollOffset = 0;
          draw_clients_window();
          return;
        }

        // Up arrow
        if (mx >= 392 && mx <= 414 && my >= 8 && my <= 30) {
          clientsScrollOffset = clamp(clientsScrollOffset - (rowH + gap) * 3, 0, maxScroll);
          draw_clients_window();
          return;
        }

        // Down arrow
        if (mx >= 418 && mx <= 440 && my >= 8 && my <= 30) {
          clientsScrollOffset = clamp(clientsScrollOffset + (rowH + gap) * 3, 0, maxScroll);
          draw_clients_window();
          return;
        }

        return;
      }

      // Scrollbar track click
      if (mx >= WIN_W - 18 && maxScroll > 0) {
        const thumbPct = clamp((my - topListY) / viewH, 0.0, 1.0);
        clientsScrollOffset = thumbPct * maxScroll;
        draw_clients_window();
        return;
      }

      // LIST ITEMS CLICK
      if (my >= topListY) {
        const clickedIdx = Math.floor((my - (topListY - clientsScrollOffset)) / (rowH + gap));
        if (clickedIdx >= 0 && clickedIdx < rows.length) {
          const r = rows[clickedIdx];
          if (r.type === "branch") {
            // Fold / Unfold Dictionary Branch
            clients_collapsed_paths[r.path] = !clients_collapsed_paths[r.path];
            draw_clients_window();
            return;
          } else {
            // Select Leaf Control
            highlightedControlKey = r.fullKey;
            const o = discoveredControls[highlightedControlKey];
            post(`[Selected] ${highlightedControlKey} -> Live Value: ${get_control_live_val(o)}\n`);
            draw_clients_window();
          }
        }
      }

      isClientsDragging = 1;
      clientsDragStartY = my;
      clientsDragStartOff = clientsScrollOffset;
    }

    if (mbut === 1 && isClientsDragging && maxScroll > 0) {
      const deltaY = my - clientsDragStartY;
      clientsScrollOffset = clamp(clientsDragStartOff - deltaY, 0, maxScroll);
      draw_clients_window();
    }
  }

  if (event.eventname === "mousewheel" && maxScroll > 0) {
    const delta = event.args[1] || 0;
    clientsScrollOffset = clamp(clientsScrollOffset - delta * 15, 0, maxScroll);
    draw_clients_window();
  }
}

// =============================================================
// 10. SUB-WINDOWS (TICKER, PALETTE, COLOR PICKER, SETTINGS)
// =============================================================
function getTickerWindow() {
  if (!tickerWindow) {
    tickerWindow = new JitterObject("jit.window", `status_grd_${uniqueID}`);
    tickerWindow.floating = 1; tickerWindow.visible = 0; tickerWindow.border = 1;
    tickerWindow.grow = 0; tickerWindow.title = "Grid Ticker"; tickerWindow.size = [200, 210];
    tickerListener = new JitterListener(tickerWindow.name, tickerWindowListenerCallback);
  }
  return tickerWindow;
}

function open_grid_ticker_window(anchorX, anchorY) {
  const win = getTickerWindow();
  win.size = [200, 210];
  if (anchorX !== undefined && anchorY !== undefined) win.pos = [anchorX, anchorY];
  win.visible = 1; win.front();
  draw_grid_ticker();
}

function draw_grid_ticker() {
  if (!tickerWindow || !tickerWindow.visible) return;
  const winW = 200, winH = 210;
  tickerMatrix = recycleMatrix(tickerMatrix, winW, winH);

  const ctx = new MGraphics(winW, winH);
  ctx.set_source_rgba(pop_bgcolor); ctx.rectangle(0, 0, winW, winH); ctx.fill();
  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0); ctx.arc(14, 14, 5.5, 0, Math.PI * 2); ctx.fill();

  const x_tens = Math.floor(grid_cols / 10) % 10, x_ones = grid_cols % 10;
  const y_tens = Math.floor(grid_rows / 10) % 10, y_ones = grid_rows % 10;
  const digits = [x_tens, x_ones, y_tens, y_ones];
  const trackW = 28, trackH = 100, trackY = 58;
  const slotX = [18, 52, 120, 154];

  for (let i = 0; i < 4; i++) {
    const sx = slotX[i];
    ctx.set_source_rgba(0.08, 0.08, 0.10, 0.9);
    ctx.rectangle_rounded(sx, trackY, trackW, trackH, 3, 3); ctx.fill();

    const dVal = digits[i];
    const fillH = clamp((dVal / 9.0) * trackH, 0, trackH);
    ctx.set_source_rgba(i === active_ticker_column ? highlight_color : attr_slider_color);
    ctx.rectangle_rounded(sx, trackY + trackH - fillH, trackW, fillH, 2, 2); ctx.fill();

    ctx.select_font_face("Arial", "normal", "bold"); ctx.set_font_size(11);
    ctx.set_source_rgba(attr_text_color);
    ctx.move_to(sx + (trackW - ctx.text_measure(String(dVal))[0]) * 0.5, trackY + trackH + 16);
    ctx.show_text(String(dVal));
  }

  const img = new Image(ctx);
  img.tonamedmatrix(tickerMatrix.name);
  tickerWindow.jit_matrix(tickerMatrix.name);
}

function apply_grid_ticker_column(colIdx, my) {
  const trackH = 100, trackY = 58;
  const d = clamp(Math.round(((trackY + trackH) - my) / trackH * 9.0), 0, 9);
  let x_tens = Math.floor(grid_cols / 10) % 10, x_ones = grid_cols % 10;
  let y_tens = Math.floor(grid_rows / 10) % 10, y_ones = grid_rows % 10;

  if (colIdx === 0) x_tens = d;
  else if (colIdx === 1) x_ones = d;
  else if (colIdx === 2) y_tens = d;
  else if (colIdx === 3) y_ones = d;

  set_grid(clamp(x_tens * 10 + x_ones, 1, 99), clamp(y_tens * 10 + y_ones, 1, 99));
  draw_grid_ticker();
}

function tickerWindowListenerCallback(event) {
  if (event.eventname === "close") { tickerWindow.visible = 0; active_ticker_column = -1; return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { active_ticker_column = -1; return; }
    if (mbut) {
      if (mx < 24 && my < 24) { tickerWindow.visible = 0; return; }
      const slotX = [18, 52, 120, 154];
      if (active_ticker_column === -1) {
        for (let i = 0; i < 4; i++) {
          if (mx >= slotX[i] && mx <= slotX[i] + 28 && my >= 58 && my <= 158) {
            active_ticker_column = i; break;
          }
        }
      }
      if (active_ticker_column !== -1) apply_grid_ticker_column(active_ticker_column, my);
    }
  }
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

function open_palette_for_slot(slotIdx) {
  target_edit_slot = Math.max(0, Math.min(slots.length - 1, slotIdx));
  const win = getPaletteWindow();
  win.visible = 1; win.front();
  draw_palette();
}

function close_palette() { if (paletteWindow) paletteWindow.visible = 0; redraw_all(); }

function draw_palette() {
  if (!paletteWindow || !paletteWindow.visible) return;
  const w = 330, h = 380;
  paletteMatrix = recycleMatrix(paletteMatrix, w, h);
  const ctx = new MGraphics(w, h);
  ctx.set_source_rgba(pop_bgcolor); ctx.rectangle(0, 0, w, h); ctx.fill();
  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0); ctx.arc(14, 16, 5.5, 0, Math.PI * 2); ctx.fill();

  const margin = 12, startY = 56, cols = 2, gap = 8;
  const cardW = (w - margin * 2 - gap) / cols, cardH = 36;

  for (let i = 0; i < name_bank.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const cX = margin + col * (cardW + gap), cY = startY + row * (cardH + gap);
    if (cY + cardH > h - 10) break;

    ctx.set_source_rgba(attr_bg_color);
    ctx.rectangle_rounded(cX, cY, cardW, cardH, 4, 4); ctx.fill();
    ctx.select_font_face(font_name, font_slants[font_style], font_weights[font_style]);
    ctx.set_font_size(11); ctx.set_source_rgba(attr_text_color);
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
    const args = arrayfromargs(event.args), mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;
    if (mx < 24 && my < 24) { close_palette(); return; }

    const margin = 12, startY = 56, cols = 2, gap = 8;
    const cardW = (330 - margin * 2 - gap) / cols, cardH = 36;

    for (let i = 0; i < name_bank.length; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const cX = margin + col * (cardW + gap), cY = startY + row * (cardH + gap);
      if (mx >= cX && mx <= cX + cardW && my >= cY && my <= cY + cardH) {
        stamp_name_to_slot(target_edit_slot, name_bank[i]);
        draw_palette();
        return;
      }
    }
  }
}

// -------------------------------------------------------------
// HSV Color Picker Sub-Window
// -------------------------------------------------------------
function getColorTarget(name) {
  if (name === "bg_color") return bg_color;
  if (name === "border_color") return border_color;
  if (name === "text_color") return text_color;
  if (name === "highlight_color") return highlight_color;
  if (name === "accent_bar_color") return accent_bar_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

function getColorTargetLabel(name) {
  if (name === "bg_color") return "Body Color";
  if (name === "border_color") return "Border Color";
  if (name === "text_color") return "Text Color";
  if (name === "highlight_color") return "Highlight Color";
  if (name === "accent_bar_color") return "Accent Bar";
  if (name === "popup_dot_color") return "Popup Dot";
  if (name === "pop_bgcolor") return "Popup BG";
  if (name === "attr_bg_color") return "Attr BG";
  if (name === "attr_border_color") return "Attr Border";
  if (name === "attr_slider_color") return "Attr Slider";
  if (name === "attr_text_color") return "Attr Text";
  return "Color Picker";
}

function getColorWindow() {
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", `status_col_${uniqueID}`);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1;
    colorWindow.grow = 0; colorWindow.title = "Color Picker"; colorWindow.size = [200, 240];
    colorMatrix = new JitterMatrix(4, "char", 200, 240);
    colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
  return colorWindow;
}

function initPickerFromTarget() {
  const arr = getColorTarget(active_color_target) || [1, 1, 1, 1];
  const hsv = rgbToHsv(arr[0], arr[1], arr[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2];
  cur_a = (arr[3] !== undefined ? arr[3] : 1.0);
}

function applyPickerToTarget() {
  const rgb = hsvToRgb(cur_h, cur_s, cur_v);
  const arr = getColorTarget(active_color_target);
  if (arr) {
    arr[0] = rgb[0]; arr[1] = rgb[1]; arr[2] = rgb[2]; arr[3] = cur_a;
  }
  redraw_all();
}

function draw_color_picker_popup() {
  const win = getColorWindow();
  const winW = 200, winH = 240;
  colorMatrix = recycleMatrix(colorMatrix, winW, winH);

  const ctx = new MGraphics(winW, winH);
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
  ctx.show_text(getColorTargetLabel(active_color_target));

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
  ctx.rectangle_rounded(hueX, hueY, hueW, hueH, 3, 3);
  ctx.fill();

  const hIndX = hueX + cur_h * hueW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(hIndX, hueY + hueH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  const svX = 10, svY = 50, svW = 180, svH = 115;
  const pureHueRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(pureHueRGB[0], pureHueRGB[1], pureHueRGB[2], 1.0);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  const satPat = ctx.pattern_create_linear(svX, 0, svX + svW, 0);
  satPat.add_color_stop_rgba(0.0, 1.0, 1.0, 1.0, 1.0);
  satPat.add_color_stop_rgba(1.0, 1.0, 1.0, 1.0, 0.0);
  ctx.set_source(satPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  const valPat = ctx.pattern_create_linear(0, svY, 0, svY + svH);
  valPat.add_color_stop_rgba(0.0, 0.0, 0.0, 0.0, 0.0);
  valPat.add_color_stop_rgba(1.0, 0.0, 0.0, 0.0, 1.0);
  ctx.set_source(valPat);
  ctx.rectangle_rounded(svX, svY, svW, svH, 3, 3);
  ctx.fill();

  const svIndX = svX + cur_s * svW;
  const svIndY = svY + (1.0 - cur_v) * svH;
  ctx.set_source_rgba(cur_v > 0.4 ? [0, 0, 0, 0.9] : [1, 1, 1, 0.9]);
  ctx.set_line_width(1.2);
  ctx.arc(svIndX, svIndY, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  const opX = 10, opY = 172, opW = 180, opH = 16;
  ctx.set_source_rgba(0.2, 0.2, 0.22, 1.0);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();
  const curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  const opPat = ctx.pattern_create_linear(opX, 0, opX + opW, 0);
  opPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  opPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(opPat);
  ctx.rectangle_rounded(opX, opY, opW, opH, 3, 3);
  ctx.fill();

  const opIndX = opX + cur_a * opW;
  ctx.set_source_rgba(1.0, 1.0, 1.0, 1.0);
  ctx.set_line_width(1.5);
  ctx.arc(opIndX, opY + opH * 0.5, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  const swX = 10, swY = 196, swW = 180, swH = 34;
  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(swX, swY, swW, swH, 3, 3);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(cur_v > 0.5 ? [0, 0, 0, 0.8] : [1, 1, 1, 0.9]);
  ctx.move_to(swX + 8, swY + 21);
  ctx.show_text(`Opacity: ${Math.round(cur_a * 100)}%`);

  const img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  win.jit_matrix(colorMatrix.name);
}

function colorWindowListenerCallback(event) {
  if (event.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
  if (event.eventname === "mouse") {
    const args = arrayfromargs(event.args);
    const mx = args[0], my = args[1], mbut = args[2];
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

// -------------------------------------------------------------
// 3-Tab Carousel Settings Inspector Window
// -------------------------------------------------------------
function getSettingsWindow() {
  if (!settingsWindow) {
    settingsWindow = new JitterObject("jit.window", `status_set_${uniqueID}`);
    settingsWindow.floating = 1; settingsWindow.visible = 0; settingsWindow.border = 1;
    settingsWindow.grow = 0; settingsWindow.title = "Touch Status Inspector";
    settingsListener = new JitterListener(settingsWindow.name, settingsWindowListenerCallback);
  }
  return settingsWindow;
}

function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  const list = [];

  if (active_mask_tab === 0) {
    list.push({ name: "Module Name / ID", val: module_name || "UNNAMED", is_name: true });
    list.push({ name: "Grid (Cols/Rows)", val: get_grid(), is_ticker: true, target_id: 100 });
    list.push({ name: "Hold to Save", val: allow_hold_save ? "ON" : "OFF", is_toggle: true, target_id: 101 });
    list.push({ name: "Hold Time", val: `${hold_threshold}ms`, pct: (hold_threshold - 200) / 800.0, is_slider: true, target_id: 102 });
    list.push({ name: "Double Tap Time", val: `${double_tap_threshold}ms`, pct: (double_tap_threshold - 150) / 450.0, is_slider: true, target_id: 103 });
  } else if (active_mask_tab === 1) {
    list.push({ name: "Outer Borders", val: borders ? "ON" : "OFF", is_toggle: true, target_id: 201 });
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 301 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 302 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 303 });
    list.push({ name: "Text Size", val: text_size, pct: (text_size - 8) / 16.0, is_slider: true, target_id: 304 });
    list.push({ name: "Font Style", val: font_style_names[font_style], is_toggle: true, target_id: 204 });
    list.push({ name: "Label Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 202 });
    list.push({ name: "Case Style", val: case_mode_names[case_mode], is_toggle: true, target_id: 203 });
  } else if (active_mask_tab === 2) {
    list.push({ name: "Body Color", val: bg_color, is_color: true, key: "bg_color" });
    list.push({ name: "Highlight Color", val: highlight_color, is_color: true, key: "highlight_color" });
    list.push({ name: "Border Color", val: border_color, is_color: true, key: "border_color" });
    list.push({ name: "Text Color", val: text_color, is_color: true, key: "text_color" });
    list.push({ name: "Accent Bar", val: accent_bar_color, is_color: true, key: "accent_bar_color" });
    list.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, key: "popup_dot_color" });
    list.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, key: "pop_bgcolor" });
    list.push({ name: "Attr BG", val: attr_bg_color, is_color: true, key: "attr_bg_color" });
    list.push({ name: "Attr Border", val: attr_border_color, is_color: true, key: "attr_border_color" });
    list.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, key: "attr_slider_color" });
    list.push({ name: "Attr Text", val: attr_text_color, is_color: true, key: "attr_text_color" });
  }

  return list;
}

function get_settings_dimensions() {
  if (!show_settings_attrs) return { w: popup_mini_w, h: popup_mini_h };
  return { w: popup_window_width, h: popup_window_fixed_h };
}

function update_settings_dimensions() {
  if (showSettings && allow_popup === 1) {
    const win = getSettingsWindow();
    const dims = get_settings_dimensions();
    win.size = [dims.w, dims.h];
    win.visible = 1; win.front();
    draw_settings();
  } else {
    if (settingsWindow) settingsWindow.visible = 0;
  }
}

function draw_settings() {
  if (!showSettings || allow_popup !== 1) return;
  if (render_pending === 0) { render_pending = 1; render_task.schedule(16); }
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
  pCtx.set_source_rgba(pop_bgcolor); pCtx.rectangle(0, 0, w, h); pCtx.fill();

  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0); pCtx.arc(14, 14, 5.5, 0, Math.PI * 2); pCtx.fill();
  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
  pCtx.move_to(24, 17);
  pCtx.show_text("close");

  const tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
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
  const tglLabel = show_settings_attrs ? "hide" : "show";
  const tglTm = pCtx.text_measure(tglLabel);
  pCtx.move_to(tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5, tglY + 11.5);
  pCtx.show_text(tglLabel);

  const prevX = 12, prevY = 28, prevW = w - 24;
  const prevH = has_rows ? Math.max(50, Math.min(80, grid_rows * 32)) : Math.max(50, h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_status_strip(pCtx, prevW, prevH, true);
  pCtx.restore();

  if (has_rows) {
    const divY = prevY + prevH + 8;
    pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
    pCtx.set_line_width(1.0);
    pCtx.move_to(10, divY); pCtx.line_to(w - 10, divY); pCtx.stroke();

    const navY = divY + 6, navH = 22, navW = w - 24, navX = 12;

    pCtx.set_source_rgba(0.08, 0.08, 0.10, 0.85);
    pCtx.rectangle_rounded(navX, navY, navW, navH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(attr_border_color);
    pCtx.set_line_width(1.0);
    pCtx.rectangle_rounded(navX + 0.5, navY + 0.5, navW - 1, navH - 1, 3, 3);
    pCtx.stroke();

    const btnW = 24;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(navX + 1, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.select_font_face("Arial", "normal", "bold");
    pCtx.set_font_size(10);
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(navX + 9, navY + 15);
    pCtx.show_text("<");

    const rBtnX = navX + navW - btnW - 1;
    pCtx.set_source_rgba(attr_bg_color);
    pCtx.rectangle_rounded(rBtnX, navY + 1, btnW, navH - 2, 2, 2);
    pCtx.fill();
    pCtx.set_source_rgba(attr_text_color);
    pCtx.move_to(rBtnX + 9, navY + 15);
    pCtx.show_text(">");

    const tabTitle = mask_tab_names[active_mask_tab] || "Category";
    const tabTm = pCtx.text_measure(tabTitle);
    const tabTW = tabTm ? tabTm[0] : 60;
    pCtx.set_source_rgba(highlight_color);
    pCtx.move_to(navX + (navW - tabTW) * 0.5, navY + 15);
    pCtx.show_text(tabTitle);

    const rowsStartY = navY + navH + 8;
    const rowW = w - 24, rowX = 12;
    const midX = 12 + rowW * 0.5;
    const valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    pCtx.select_font_face("Arial", "normal", "normal");

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i], rY = rowsStartY + i * 28;
      pCtx.set_source_rgba(attr_bg_color); pCtx.rectangle(rowX, rY, rowW, 26); pCtx.fill();
      pCtx.set_source_rgba(attr_text_color); pCtx.set_font_size(10);
      pCtx.move_to(rowX + 6, rY + 17); pCtx.show_text(r.name);

      pCtx.set_source_rgba(attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.35);
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
        pCtx.move_to(valBoxX + 6, rY + 17);
        pCtx.show_text(String(r.val));
      } else if (r.is_slider || r.pct !== undefined) {
        pCtx.set_source_rgba(0.12, 0.12, 0.14, 0.85);
        pCtx.rectangle(valBoxX, vY, valBoxW, vH);
        pCtx.fill();

        const fillW = Math.max(0, Math.min(valBoxW, r.pct * valBoxW));
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
  else if (target_id === 103) set_double_tap_threshold(Math.round(150 + targetPct * 450));
  else if (target_id === 301) set_border_radius(targetPct * 25.0);
  else if (target_id === 302) set_border_thickness(targetPct * 10.0);
  else if (target_id === 303) set_border_extension(targetPct * 50.0);
  else if (target_id === 304) set_text_size(Math.round(8 + targetPct * 16));
  redraw_all();
}

function settingsWindowListenerCallback(event) {
  if (event.eventname === "close") { showSettings = 0; return; }
  if (event.eventname === "mouse") {
    const a = arrayfromargs(event.args);
    const mx = a[0], my = a[1], mbut = a[2];
    const is_pop_tap = mbut === 1 && is_mouse_down_anywhere === 0;
    is_mouse_down_anywhere = mbut;

    if (mbut) {
      lastMouseX = mx;
      lastMouseY = my;
    }

    const dims = get_settings_dimensions();
    const w = dims.w, h = dims.h;
    const rows = get_visible_rows_map();
    const has_rows = rows.length > 0;
    const pr = cached_preview_rect;

    const prevH = has_rows ? Math.max(50, Math.min(80, grid_rows * 32)) : Math.max(50, h - 28 - 14);
    const divY = pr.y + prevH + 8;
    const navY = divY + 6, navH = 22, navW = w - 24, navX = 12;
    const btnW = 24, rBtnX = navX + navW - btnW - 1;

    const rowsStartY = navY + navH + 8;
    const rowW = w - 24, rowX = 12;
    const midX = 12 + rowW * 0.5;
    const valBoxX = midX + 4, valBoxW = rowW * 0.5 - 8;

    if (mbut === 0) {
      active_pop_target = -1;
      stop_scrolling();
      return;
    }

    if (active_pop_target !== -1 && active_pop_target !== 50) {
      const dragPct = clamp((mx - valBoxX) / valBoxW, 0, 1);
      apply_slider_target(active_pop_target, dragPct);
      draw_settings();
      return;
    }

    if (active_pop_target === 50) {
      const localX = mx - pr.x;
      const localY = my - pr.y;
      calculate_2d_weights(localX, localY, pr.w, pr.h, true);
      return;
    }

    if (mbut && mx < 35 && my < 26) {
      showSettings = 0;
      update_settings_dimensions();
      return;
    }

    const tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_settings_dimensions();
      return;
    }

    const prevMaxY = pr.y + prevH;
    if (mbut && my >= pr.y && my <= prevMaxY && mx >= pr.x && mx <= pr.x + pr.w && active_pop_target === -1) {
      active_pop_target = 50;
      const localX = mx - pr.x;
      const localY = my - pr.y;

      const b = isNaN(border_thickness) ? 1.2 : border_thickness;
      const inset = b * 0.5;
      const padX = 4, padY = 4;
      const cols = Math.max(1, grid_cols);
      const rows_count = Math.max(1, grid_rows);

      const slotStartX = inset + padX;
      const availW = (pr.w - b - padX) - slotStartX;
      const availH = (prevH - b) - padY * 2;
      const cellW = availW / cols;
      const cellH = availH / rows_count;

      if (localX >= slotStartX) {
        const colHit = Math.floor((localX - slotStartX) / cellW);
        const rowHit = Math.floor((localY - (inset + padY)) / cellH);
        if (colHit >= 0 && colHit < cols && rowHit >= 0 && rowHit < rows_count) {
          const clickedSlot = rowHit * cols + colHit;
          if (clickedSlot >= 0 && clickedSlot < slots.length && is_pop_tap) {
            recall_slot(clickedSlot);
          }
        }
      }
      return;
    }

    if (!has_rows) return;

    if (is_pop_tap && my >= navY && my <= navY + navH && mx >= navX && mx <= navX + navW) {
      if (mx <= navX + btnW + 4) {
        active_mask_tab = (active_mask_tab - 1 + 3) % 3;
      } else if (mx >= rBtnX - 4) {
        active_mask_tab = (active_mask_tab + 1) % 3;
      } else {
        active_mask_tab = (active_mask_tab + 1) % 3;
      }
      draw_settings();
      return;
    }

    if (mx >= rowX && mx <= rowX + rowW && my >= rowsStartY && my <= rowsStartY + (rows.length * 28)) {
      const rIdx = Math.floor((my - rowsStartY) / 28);
      if (rIdx >= 0 && rIdx < rows.length) {
        const r = rows[rIdx];
        const pct = clamp((mx - valBoxX) / valBoxW, 0, 1);

        if (r.is_slider || r.pct !== undefined) {
          active_pop_target = r.target_id;
          scroll_valBoxX = valBoxX;
          scroll_valBoxW = valBoxW;
          apply_slider_target(r.target_id, pct);

          stop_scrolling();
          if (scrollTask) scrollTask.repeat();
        } else if (is_pop_tap) {
          if (r.target_id === 100) {
            open_grid_ticker_window();
          } else if (r.target_id === 101) {
            set_allow_hold_save(allow_hold_save ? 0 : 1);
          } else if (r.target_id === 201) {
            set_borders(borders ? 0 : 1);
          } else if (r.target_id === 202) {
            set_label_mode((label_mode + 1) % 5);
          } else if (r.target_id === 203) {
            set_case_mode((case_mode + 1) % 3);
          } else if (r.target_id === 204) {
            set_font_style((font_style + 1) % 4);
          } else if (r.is_color) {
            const win = getColorWindow();
            active_color_target = r.key;
            initPickerFromTarget();
            if (settingsWindow && settingsWindow.pos) {
              win.pos = [settingsWindow.pos[0] + valBoxX, settingsWindow.pos[1] + rowsStartY + rIdx * 28 + 14];
            }
            win.visible = 1;
            win.front();
            draw_color_picker_popup();
          }
        }
        draw_settings();
      }
    }
  }
}

// =============================================================
// 11. INLETS, MESSAGES & PERSISTENCE
// =============================================================
function msg_int(v) { recall_slot(parseInt(v, 10) - 1); }

function set_name(v) {
  const oldName = module_name;
  module_name = String(v).trim().replace(/\s+/g, "_");
  if (oldName !== module_name && statusBus && statusBus.clients) {
    delete statusBus.clients[oldName];
  }
  load_states_from_disk();
  broadcast_to_master();
  redraw_all();
}
function get_name() { return module_name; }

function set_active_mask_tab(v) {
  const p = parseInt(v, 10);
  if (!isNaN(p)) {
    active_mask_tab = clamp(p, 0, 2);
    draw_settings();
  }
}
function get_active_mask_tab() { return active_mask_tab; }

function set_borders(v) { borders = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_borders() { return borders; }

function get_slot_names() {
  return slots.map(s => s.name).join(", ");
}

function set_slot_names() {
  const args = arrayfromargs(arguments);
  if (args.length === 0 || (args.length === 1 && String(args[0]).trim() === "")) {
    const nameList = get_slot_names();
    outlet(1, ["set", nameList]);
    return nameList;
  }

  const str = args.join(" ").trim();
  let items = [];
  if (str.indexOf(",") !== -1) {
    items = str.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    items = args.map(s => String(s).trim()).filter(Boolean);
  }

  for (let i = 0; i < items.length && i < slots.length; i++) {
    slots[i].name = items[i];
  }

  outlet(1, ["set", get_slot_names()]);
  redraw_all();
  broadcast_to_master();
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
}

function set_name_bank_attr() {
  const args = arrayfromargs(arguments);
  const str = args.join(" ").trim();
  if (str) name_bank = str.split(",").map(s => s.trim()).filter(Boolean);
}
function get_name_bank_attr() { return name_bank.join(", "); }

function set_allow_hold_save(v) { allow_hold_save = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_allow_hold_save() { return allow_hold_save; }
function set_hold_threshold(v) { hold_threshold = Math.max(200, parseInt(v, 10)); }
function get_hold_threshold() { return hold_threshold; }
function set_double_tap_threshold(v) { double_tap_threshold = Math.max(150, parseInt(v, 10)); }
function get_double_tap_threshold() { return double_tap_threshold; }
function set_label_mode(v) { label_mode = clamp(parseInt(v, 10) || 0, 0, 4); redraw_all(); }
function get_label_mode() { return label_mode; }
function set_case_mode(v) { case_mode = clamp(parseInt(v, 10) || 0, 0, 2); redraw_all(); }
function get_case_mode() { return case_mode; }
function set_font_style(v) { font_style = clamp(parseInt(v, 10) || 0, 0, 3); redraw_all(); }
function get_font_style() { return font_style; }
function set_text_size(v) { text_size = Math.max(8, parseInt(v, 10) || 11); redraw_all(); }
function get_text_size() { return text_size; }
function set_border_radius(v) { border_radius = Math.max(0, parseFloat(v) || 0); redraw_all(); }
function get_border_radius() { return border_radius; }
function set_border_thickness(v) { border_thickness = Math.max(0, parseFloat(v) || 0); redraw_all(); }
function get_border_thickness() { return border_thickness; }
function set_border_extension(v) { border_extension = Math.max(0, parseFloat(v) || 0); redraw_all(); }
function get_border_extension() { return border_extension; }
function set_allow_popup(v) { allow_popup = parseInt(v, 10) ? 1 : 0; redraw_all(); }
function get_allow_popup() { return allow_popup; }

function rename_pallet_slot() {
  const args = arrayfromargs(arguments);
  if (args.length < 2) return;

  let slot_num = NaN;
  let name_tokens = [];

  const lastAsNum = parseInt(args[args.length - 1], 10);
  const firstAsNum = parseInt(args[0], 10);

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

function rename_slot() {
  const args = arrayfromargs(arguments);
  if (args.length < 2) return;

  let slot_num = NaN;
  let name_tokens = [];

  const lastAsNum = parseInt(args[args.length - 1], 10);
  const firstAsNum = parseInt(args[0], 10);

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
  if (!newName || idx < 0 || idx >= slots.length) return;

  slots[idx].name = newName;

  if (idx === active_slot) {
    outlet(1, ["set", newName]);
  }

  redraw_all();
  if (paletteWindow && paletteWindow.visible) draw_palette();
  broadcast_to_master();
  if (typeof notifyclients === "function") notifyclients();
}

function get_popup_slots() { return name_bank.join(", "); }

function set_popup_slots() {
  const args = arrayfromargs(arguments);
  if (args.length === 0 || (args.length === 1 && String(args[0]).trim() === "")) {
    outlet(1, ["set", get_popup_slots()]);
    return get_popup_slots();
  }
  const str = args.join(" ").trim();
  if (str) {
    name_bank = str.split(",").map(s => s.trim()).filter(Boolean);
    if (paletteWindow && paletteWindow.visible) draw_palette();
    redraw_all();
  }
}

function anything() {
  const args = arrayfromargs(arguments);
  const rawMsg = messagename.trim();

  if (rawMsg === "rename_pallet_slot" || rawMsg === "rename_palette_slot" || rawMsg === "rename") {
    rename_pallet_slot.apply(this, args);
    return;
  }

  if (rawMsg === "rename_slot" || rawMsg === "rename_slot_save") {
    rename_slot.apply(this, args);
    return;
  }

  if (rawMsg === "clients" || rawMsg === "clientwindow" || rawMsg === "print") {
    toggle_clients_window();
    return;
  }
  if (rawMsg === "scan") { scan_local_controls(); return; }

  if (rawMsg === "clear_names" || rawMsg === "wipe_names") { clear_names(); return; }

  const slashMatch = rawMsg.match(/^(\d+)\/(\d+)$/);
  if (slashMatch) { set_grid(rawMsg); return; }

  if (rawMsg === "grid" || rawMsg === "layout") { set_grid.apply(this, args); return; }
  if (rawMsg === "save_slot" || rawMsg === "store_slot") { save_slot.apply(this, args); return; }
  if (rawMsg === "slot_names" || rawMsg === "get_slot_names" || rawMsg === "names") {
    set_slot_names.apply(this, args);
    return;
  }

  const name = rawMsg.replace(/^set_?/, "").toLowerCase();
  if (typeof this[`set_${name}`] === "function") {
    this[`set_${name}`].apply(this, args);
  }
  redraw_all();
}

function save() {
  embedmessage("set_name", module_name);
  embedmessage("grid", get_grid());
  embedmessage("set_active_mask_tab", active_mask_tab);
  embedmessage("set_name_bank_attr", get_name_bank_attr());
  embedmessage("set_allow_hold_save", allow_hold_save);
  embedmessage("set_hold_threshold", hold_threshold);
  embedmessage("set_double_tap_threshold", double_tap_threshold);
  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_font_style", font_style);
  embedmessage("set_text_size", text_size);
  embedmessage("set_borders", borders);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
  embedmessage("set_slot_names", get_slot_names());

  const sList = slots.map(s => s.name);
  embedmessage("set_slots_saved", encodeURIComponent(JSON.stringify(sList)));
}

function notifydeleted() {
  stop_hold_watchdog();
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];
  if (statusBus && statusBus.clients && module_name) delete statusBus.clients[module_name];
  if (statusBus && statusBus.ping_listeners) delete statusBus.ping_listeners[uniqueID];

  try { if (clientsListener) clientsListener.subjectname = ""; } catch(e) {}
  try { if (clientsWindow) { clientsWindow.visible = 0; clientsWindow.free(); clientsWindow = null; } } catch(e) {}
  try { if (clientsMatrix) { clientsMatrix.freepeer(); clientsMatrix = null; } } catch(e) {}

  try { if (settingsListener) settingsListener.subjectname = ""; } catch(e) {}
  try { if (settingsWindow) { settingsWindow.visible = 0; settingsWindow.free(); settingsWindow = null; } } catch(e) {}
  try { if (outMatrix) { outMatrix.freepeer(); outMatrix = null; } } catch(e) {}

  try { if (paletteListener) paletteListener.subjectname = ""; } catch(e) {}
  try { if (paletteWindow) { paletteWindow.visible = 0; paletteWindow.free(); paletteWindow = null; } } catch(e) {}
  try { if (paletteMatrix) { paletteMatrix.freepeer(); paletteMatrix = null; } } catch(e) {}

  try { if (tickerListener) tickerListener.subjectname = ""; } catch(e) {}
  try { if (tickerWindow) { tickerWindow.visible = 0; tickerWindow.free(); tickerWindow = null; } } catch(e) {}
  try { if (tickerMatrix) { tickerMatrix.freepeer(); tickerMatrix = null; } } catch(e) {}

  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}
  try { if (colorWindow) { colorWindow.visible = 0; colorWindow.free(); colorWindow = null; } } catch(e) {}
  try { if (colorMatrix) { colorMatrix.freepeer(); colorMatrix = null; } } catch(e) {}
}

declareattribute("name", { type: "symbol", label: "Module ID / Name", setter: "set_name", getter: "get_name", category: "Module", embed: 1 });
declareattribute("active_mask_tab", { type: "int", style: "enumindex", enumvals: ["1. Performance", "2. Geometry / Labels", "3. Colors"], label: "Inspector Tab", setter: "set_active_mask_tab", getter: "get_active_mask_tab", category: "Popup", embed: 1 });
declareattribute("grid", { type: "symbol", label: "Grid Layout (Cols/Rows)", setter: "set_grid", getter: "get_grid", category: "Layout", embed: 1 });
declareattribute("borders", { type: "int", style: "onoff", label: "Show Outer Borders", setter: "set_borders", getter: "get_borders", category: "Geometry", embed: 1 });
declareattribute("slot_names", { type: "symbol", label: "Slot Names", setter: "set_slot_names", getter: "get_slot_names", category: "Status Config", embed: 1 });
declareattribute("popup_slots", { type: "symbol", label: "Popup Slots (Palette)", setter: "set_popup_slots", getter: "get_popup_slots", category: "Status Config", embed: 1 });

sync_grid_slots();
redraw_all();