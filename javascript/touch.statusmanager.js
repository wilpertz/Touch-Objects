// ============================================================================
// touch.statusmanager.js - Max 9 v8ui / jsui
// Master Controller + Fully Interactive Tablet Inspector + Set Bank + Palette
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 2;
setinletassist(0, "Inlet 0: int / float (morph) / palette <int|float> / set <int|name> / page <int> / resync / messages");
setoutletassist(0, "Outlet 0: Active module / Set / Palette name");
setoutletassist(1, "Outlet 1: Status index / morph float / Palette index");

var uniqueID = Math.floor(Math.random() * 1000000);

// =============================================================
// 1. DATA STRUCTURE (SET BANK & PALETTES)
// =============================================================
var active_module_idx  = 0;
var active_set_idx     = 0;
var active_palette_idx = -1;

var sets_per_page      = 5;
var current_bank_page  = 0;

function make_default_palettes() {
  return [
    { name: "Palette 1", map: {}, summary: "Empty" },
    { name: "Palette 2", map: {}, summary: "Empty" },
    { name: "Palette 3", map: {}, summary: "Empty" },
    { name: "Palette 4", map: {}, summary: "Empty" }
  ];
}

var set_bank = [
  { name: "New Opera",      palettes: make_default_palettes() },
  { name: "Soundscape 3",   palettes: make_default_palettes() },
  { name: "Live Modular A", palettes: make_default_palettes() },
  { name: "Free Ambient",   palettes: make_default_palettes() },
  { name: "Percussion Rig", palettes: make_default_palettes() },
  { name: "Drone Vault",    palettes: make_default_palettes() },
  { name: "Poly Synth 1",   palettes: make_default_palettes() },
  { name: "Noise Textures", palettes: make_default_palettes() },
  { name: "Bass Lab",       palettes: make_default_palettes() },
  { name: "Interlude B",    palettes: make_default_palettes() }
];

// Touch & Hold Watchdogs
var is_dragging          = 0;
var isModMouseDown       = 0;
var modMousePressTime    = 0;
var modClickX            = 0;
var modHoldTask          = null;
var isModHoldTriggered   = 0;
var hold_threshold       = 350;

// Theme Colors
var bg_color          = [0.12, 0.12, 0.14, 0.95];
var border_color      = [0.45, 0.45, 0.50, 1.0];
var text_color        = [0.92, 0.94, 0.98, 1.0];
var highlight_color   = [1.00, 0.22, 0.25, 1.0];
var popup_dot_color   = [1.00, 0.20, 0.20, 1.0];

var pop_bgcolor       = [0.10, 0.10, 0.12, 0.98];
var attr_bg_color     = [0.14, 0.14, 0.16, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.35, 0.38, 0.42, 1.0];
var attr_text_color   = [0.88, 0.88, 0.88, 1.0];

var border_radius     = 4.0;
var border_thickness  = 1.2;
var border_extension  = 6.0;
var font_name         = "Arial";
var text_size         = 11;

var allow_popup         = 1;
var show_settings_attrs = 0; // Default clean mini mode!
var mask_performance   = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var popup_window_width = 300;
var popup_mini_w       = 340;
var popup_mini_h       = 230; // Room for all 3 rows to breathe!
var start_resize_w     = 340;
var start_resize_h     = 230;
var is_resizing_window = 0;

var start_click_x = 0;
var start_click_y = 0;
var lastMouseX    = 0;
var lastMouseY    = 0;
var active_pop_target = -1;
var scrollTask    = null;

var is_pop_dragging   = 0;

var render_pending = 0;
var render_task = new Task(function() {
  render_pending = 0;
  draw_settings_deferred();
}, this);

var cached_preview_rect = { x: 12, y: 28, w: 256, h: 120 };

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

// =============================================================
// 2. WINDOW SYSTEM (SETTINGS, COLOR, BANK, PALETTE, PICKER)
// =============================================================
var showSettingsWindow = 0;
var settingsWindow     = null;
var settingsMatrix     = null;
var settingsListener   = null;

var showColorWindow    = 0;
var colorWindow        = null;
var colorMatrix        = null;
var colorListener      = null;

var showBankWindow     = 0;
var bankWindow         = null;
var bankMatrix         = null;
var bankListener       = null;

var showPaletteWindow  = 0;
var paletteWindow      = null;
var paletteMatrix      = null;
var paletteListener    = null;

var showPickerWindow   = 0;
var pickerWindow       = null;
var pickerMatrix       = null;
var pickerListener     = null;

var active_color_target = "bg_color";
var picker_drag_zone    = 0;
var cur_h = 0.0, cur_s = 1.0, cur_v = 1.0, cur_a = 1.0;

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

function get_settings_window() {
  if (!settingsWindow) {
    settingsWindow = new JitterObject("jit.window", "m_set_" + uniqueID);
    settingsWindow.floating = 1; settingsWindow.visible = 0; settingsWindow.border = 1;
    settingsWindow.grow = 0; settingsWindow.title = "Master Status Inspector";
    settingsListener = new JitterListener(settingsWindow.name, settingsWindowListenerCallback);
  }
  return settingsWindow;
}

function get_color_window() {
  if (!colorWindow) {
    colorWindow = new JitterObject("jit.window", "m_col_" + uniqueID);
    colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1;
    colorWindow.grow = 0; colorWindow.title = "Color Picker";
    colorWindow.size = [200, 240];
    colorMatrix = new JitterMatrix(4, "char", 200, 240);
    colorListener = new JitterListener(colorWindow.name, colorWindowListenerCallback);
  }
  return colorWindow;
}

function get_bank_window() {
  if (!bankWindow) {
    bankWindow = new JitterObject("jit.window", "m_bnk_" + uniqueID);
    bankWindow.floating = 1; bankWindow.visible = 0; bankWindow.border = 1;
    bankWindow.grow = 0; bankWindow.title = "Set Bank";
    bankListener = new JitterListener(bankWindow.name, bankWindowListenerCallback);
  }
  return bankWindow;
}

function get_palette_window() {
  if (!paletteWindow) {
    paletteWindow = new JitterObject("jit.window", "m_pal_" + uniqueID);
    paletteWindow.floating = 1; paletteWindow.visible = 0; paletteWindow.border = 1;
    paletteWindow.grow = 0; paletteWindow.title = "Palette";
    paletteWindow.size = [220, 260];
    paletteListener = new JitterListener(paletteWindow.name, paletteWindowListenerCallback);
  }
  return paletteWindow;
}

function get_picker_window() {
  if (!pickerWindow) {
    pickerWindow = new JitterObject("jit.window", "m_pck_" + uniqueID);
    pickerWindow.floating = 1; pickerWindow.visible = 0; pickerWindow.border = 1;
    pickerWindow.grow = 0; pickerWindow.title = "Select Module";
    pickerWindow.size = [200, 220];
    pickerListener = new JitterListener(pickerWindow.name, pickerWindowListenerCallback);
  }
  return pickerWindow;
}

// =============================================================
// 3. COLOR CONVERSION & THEME BUS
// =============================================================
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

// =============================================================
// 4. LIVE RIG SCANNER & CLIENT DISPATCHER (RESYNC)
// =============================================================
var statusBus = new Global("touch_status_bus");
if (!statusBus.clients) statusBus.clients = {};
if (!statusBus.subscribers) statusBus.subscribers = {};
if (!statusBus.ping_listeners) statusBus.ping_listeners = {};

function get_client_keys() {
  if (!statusBus.clients) return [];
  return Object.keys(statusBus.clients);
}

function get_active_client() {
  var keys = get_client_keys();
  if (keys.length === 0) return null;
  active_module_idx = Math.max(0, Math.min(keys.length - 1, active_module_idx));
  return statusBus.clients[keys[active_module_idx]];
}

function call_client_recall(modName, slotIdx) {
  if (!statusBus || !statusBus.clients) return;
  var client = statusBus.clients[modName];
  if (!client) return;
  if (typeof client.recall === "function") {
    try {
      client.recall(slotIdx);
    } catch(e) {
      resync_rig();
    }
  }
}

function call_client_morph(modName, val) {
  if (!statusBus || !statusBus.clients) return;
  var client = statusBus.clients[modName];
  if (!client) return;
  if (typeof client.morph === "function") {
    try {
      client.morph(val);
    } catch(e) {
      resync_rig();
    }
  } else if (typeof client.recall === "function") {
    try {
      client.recall(Math.round(val) - 1);
    } catch(e) {
      resync_rig();
    }
  }
}

statusBus.subscribers[uniqueID] = function(senderMod, slotIdx, morphVal) {
  var keys = get_client_keys();
  if (senderMod) {
    var foundIdx = keys.indexOf(senderMod);
    if (foundIdx !== -1) active_module_idx = foundIdx;

    try { outlet(0, senderMod); } catch(e) {}
    if (morphVal !== undefined && morphVal % 1 !== 0) {
      try { outlet(1, morphVal); } catch(e) {}
    } else if (slotIdx !== undefined && slotIdx >= 0) {
      try { outlet(1, slotIdx + 1); } catch(e) {}
    }
  } else {
    if (active_module_idx >= keys.length) {
      active_module_idx = Math.max(0, keys.length - 1);
    }
  }
  redraw_all();
};

function resync_rig() {
  statusBus.clients = {};

  if (statusBus.ping_listeners) {
    for (var id in statusBus.ping_listeners) {
      if (typeof statusBus.ping_listeners[id] === "function") {
        try {
          statusBus.ping_listeners[id]();
        } catch(e) {
          delete statusBus.ping_listeners[id];
        }
      }
    }
  }

  active_module_idx = 0;
  var keys = get_client_keys();
  if (keys.length > 0) {
    var client = get_active_client();
    try { outlet(0, keys[active_module_idx]); } catch(e) {}
    if (client && client.active_slot !== undefined) {
      try { outlet(1, client.active_slot + 1); } catch(e) {}
    }
  }
  redraw_all();
}

function step_module(dir) {
  var keys = get_client_keys();
  if (keys.length <= 1) return;
  active_module_idx = (active_module_idx + dir + keys.length) % keys.length;
  select_module_idx(active_module_idx);
}

function select_module_idx(idx) {
  var keys = get_client_keys();
  if (idx < 0 || idx >= keys.length) return;
  active_module_idx = idx;

  var client = get_active_client();
  try { outlet(0, keys[active_module_idx]); } catch(e) {}
  if (client && client.active_slot !== undefined) {
    try { outlet(1, client.active_slot + 1); } catch(e) {}
  }
  redraw_all();
}

function redraw_all() {
  mgraphics.redraw();
  if (showSettingsWindow) draw_settings();
  if (showBankWindow) draw_bank_window();
  if (showPaletteWindow) draw_palette_window();
  if (showPickerWindow) draw_picker_window();
}

// =============================================================
// 5. SET BANK & SET PALETTE LOGIC
// =============================================================
function get_total_pages() {
  return Math.max(1, Math.ceil(set_bank.length / Math.max(1, sets_per_page)));
}

function step_page(dir) {
  var total = get_total_pages();
  current_bank_page = (current_bank_page + dir + total) % total;
  if (showBankWindow) draw_bank_window();
}

function select_set(idx) {
  if (idx < 0 || idx >= set_bank.length) return;
  active_set_idx = idx;
  active_palette_idx = -1;
  try { outlet(0, set_bank[active_set_idx].name); } catch(e) {}

  open_palette_window_for_set();
  redraw_all();
}

function recall_palette(palIdx) {
  var curSet = set_bank[active_set_idx];
  if (!curSet || palIdx < 0 || palIdx >= curSet.palettes.length) return;

  active_palette_idx = palIdx;
  var pal = curSet.palettes[active_palette_idx];

  if (pal.map && statusBus.clients) {
    for (var modName in pal.map) {
      call_client_recall(modName, pal.map[modName]);
    }
  }
  try { outlet(0, pal.name); } catch(e) {}
  try { outlet(1, active_palette_idx + 1); } catch(e) {}
  redraw_all();
}

function morph_palette(fVal) {
  var curSet = set_bank[active_set_idx];
  if (!curSet || !curSet.palettes) return;
  var pals = curSet.palettes;
  var numP = pals.length;
  if (numP < 1) return;

  var fClamped = clamp(fVal, 1.0, numP);
  var fPos = fClamped - 1.0;
  var p0 = Math.floor(fPos);
  var p1 = Math.min(numP - 1, p0 + 1);
  var frac = fPos - p0;

  var map0 = pals[p0].map || {};
  var map1 = pals[p1].map || {};

  var keys = get_client_keys();
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (map0[k] !== undefined && map1[k] !== undefined) {
      var s0 = map0[k] + 1;
      var s1 = map1[k] + 1;
      var blended = s0 + (s1 - s0) * frac;
      call_client_morph(k, blended);
    } else if (map0[k] !== undefined && frac < 0.5) {
      call_client_recall(k, map0[k]);
    } else if (map1[k] !== undefined && frac >= 0.5) {
      call_client_recall(k, map1[k]);
    }
  }

  active_palette_idx = (frac > 0.5) ? p1 : p0;
  try { outlet(0, pals[active_palette_idx].name); } catch(e) {}
  try { outlet(1, fClamped); } catch(e) {}
  redraw_all();
}

function capture_rig_to_palette(palIdx) {
  var curSet = set_bank[active_set_idx];
  if (!curSet || palIdx < 0 || palIdx >= curSet.palettes.length) return;

  var keys = get_client_keys();
  var capturedMap = {};
  var summaryList = [];

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var c = statusBus.clients[k];
    if (c && c.active_slot !== undefined) {
      capturedMap[k] = c.active_slot;
      summaryList.push(k + ":" + (c.active_slot + 1));
    }
  }

  curSet.palettes[palIdx].map = capturedMap;
  curSet.palettes[palIdx].summary = summaryList.length > 0 ? summaryList.join("  \u2022  ") : "Empty";
  active_palette_idx = palIdx;

  try { outlet(0, "Captured " + curSet.palettes[palIdx].name); } catch(e) {}
  try { outlet(1, active_palette_idx + 1); } catch(e) {}
  redraw_all();
}

// =============================================================
// 6. VECTOR DRAW ENGINE
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

function draw_manager_strip(ctx, w, h, is_preview) {
  var inset = border_thickness * 0.5;
  var rw = Math.max(1, w - border_thickness);
  var rh = Math.max(1, h - border_thickness);
  var r = Math.min(border_radius, rw * 0.5, rh * 0.5);
  var ew = Math.min(border_extension, (rw - 2 * r) * 0.5);
  var eh = Math.min(border_extension, (rh - 2 * r) * 0.5);

  ctx.set_source_rgba(bg_color);
  ctx.rectangle_rounded(inset, inset, rw, rh, r, r);
  ctx.fill();

  if (border_thickness > 0) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, border_thickness);
  }

  var keys = get_client_keys();
  var padX = 4, padY = 4;

  // ROW 1: [ SET BANK ]  |  [ RESYNC ]
  var row1H = is_preview ? 24 : 20;
  var row1Y = inset + padY;
  var dotReserve = (!is_preview && allow_popup) ? 14 : 0;
  var availRow1W = rw - padX * 2 - dotReserve;
  var topBtnW = Math.max(10, (availRow1W - 4) * 0.5);
  var bankBtnX = inset + padX;
  var resyncX = bankBtnX + topBtnW + 4;

  // [ SET BANK ]
  ctx.set_source_rgba(showBankWindow ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.35] : [0.18, 0.20, 0.24, 0.85]);
  ctx.rectangle_rounded(bankBtnX, row1Y, topBtnW, row1H, 3, 3);
  ctx.fill();

  ctx.set_source_rgba(showBankWindow ? highlight_color : border_color);
  ctx.set_line_width(0.75);
  ctx.rectangle_rounded(bankBtnX, row1Y, topBtnW, row1H, 3, 3);
  ctx.stroke();

  ctx.select_font_face(font_name, "normal", "bold");
  ctx.set_font_size(is_preview ? 10.5 : 9);
  ctx.set_source_rgba(showBankWindow ? [1, 1, 1, 1] : text_color);
  var bankTm = ctx.text_measure("SET BANK");
  ctx.move_to(bankBtnX + (topBtnW - bankTm[0]) * 0.5, row1Y + row1H * 0.5 + 3.5);
  ctx.show_text("SET BANK");

  // [ RESYNC ]
  ctx.set_source_rgba(0.20, 0.21, 0.24, 0.8);
  ctx.rectangle_rounded(resyncX, row1Y, topBtnW, row1H, 3, 3);
  ctx.fill();

  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.4);
  ctx.set_line_width(0.75);
  ctx.rectangle_rounded(resyncX, row1Y, topBtnW, row1H, 3, 3);
  ctx.stroke();

  ctx.select_font_face(font_name, "normal", "bold");
  ctx.set_font_size(is_preview ? 10.5 : 9);
  ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.7);
  var resyncTm = ctx.text_measure("RESYNC");
  ctx.move_to(resyncX + (topBtnW - resyncTm[0]) * 0.5, row1Y + row1H * 0.5 + 3.5);
  ctx.show_text("RESYNC");

  // ROW 2: MODULE SELECTOR CAPSULE
  var row2H = is_preview ? 26 : 22;
  var row2Y = row1Y + row1H + 4;
  var modW = rw - padX * 2;
  var modX = inset + padX;

  ctx.set_source_rgba(showPickerWindow ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.25] : [0.16, 0.18, 0.22, 0.95]);
  ctx.rectangle_rounded(modX, row2Y, modW, row2H, 3, 3);
  ctx.fill();

  ctx.set_source_rgba(showPickerWindow ? highlight_color : [border_color[0], border_color[1], border_color[2], 0.45]);
  ctx.set_line_width(0.8);
  ctx.rectangle_rounded(modX, row2Y, modW, row2H, 3, 3);
  ctx.stroke();

  if (keys.length > 0) {
    var curModName = keys[active_module_idx] || "Module";

    ctx.select_font_face(font_name, "normal", "bold");
    ctx.set_font_size(is_preview ? 12 : 11);
    ctx.set_source_rgba(highlight_color);
    ctx.move_to(modX + 10, row2Y + row2H * 0.5 + 4.5); ctx.show_text("‹");
    ctx.move_to(modX + modW - 16, row2Y + row2H * 0.5 + 4.5); ctx.show_text("›");

    ctx.set_source_rgba(text_color);
    var dispMod = curModName;
    while (dispMod.length > 0 && ctx.text_measure(dispMod)[0] > (modW - 40)) {
      dispMod = dispMod.slice(0, -1);
    }
    var mTm = ctx.text_measure(dispMod);
    ctx.move_to(modX + (modW - mTm[0]) * 0.5, row2Y + row2H * 0.5 + 4.0);
    ctx.show_text(dispMod);
  } else {
    ctx.select_font_face(font_name, "normal", "normal");
    ctx.set_font_size(is_preview ? 10 : 9);
    ctx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.45);
    ctx.move_to(modX + 8, row2Y + row2H * 0.5 + 3.5);
    ctx.show_text("No Modules (Click RESYNC)");
  }

  // Divider Line
  var divY = row2Y + row2H + 4;
  ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.35);
  ctx.set_line_width(1.0);
  ctx.move_to(inset + 8, divY); ctx.line_to(inset + rw - 8, divY);
  ctx.stroke();

  // BOTTOM TIER: 2D GRID / MATRIX SLOTS
  var client = get_active_client();
  if (client && client.num_slots) {
    var numSlots = client.num_slots;
    var cols = Math.max(1, client.cols || 1);
    var rows_count = Math.max(1, client.rows || 1);
    if (cols * rows_count < numSlots) rows_count = Math.ceil(numSlots / cols);

    var startY = divY + 4;
    var availW = rw - padX * 2;
    var availH = (rh - padY) - startY;
    var cellW = availW / cols;
    var cellH = Math.max(18, availH / rows_count);

    var fPos = (client.morph_val || 1.0) - 1.0;
    var floorIdx = Math.floor(fPos);
    var ceilIdx = Math.min(numSlots - 1, floorIdx + 1);
    var frac = fPos - floorIdx;
    var isMorph = (frac > 0.01 && frac < 0.99);

    for (var s = 0; s < numSlots; s++) {
      var c = s % cols;
      var row = Math.floor(s / cols);

      var sX = inset + padX + c * cellW;
      var sY = startY + row * cellH;
      var sW = cellW - 3;
      var sH = cellH - 3;
      var isSelected = (s === client.active_slot);

      var highlightAlpha = 0.0;
      if (isMorph) {
        if (s === floorIdx) highlightAlpha = 1.0 - frac;
        else if (s === ceilIdx) highlightAlpha = frac;
      } else {
        if (isSelected) highlightAlpha = 1.0;
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

      // Slot Number
      ctx.select_font_face(font_name, "normal", "bold");
      var numSize = Math.max(7, Math.min(10, sH * 0.28));
      ctx.set_font_size(numSize);
      ctx.set_source_rgba(highlightAlpha > 0.4 ? [1, 1, 1, 0.9] : [0.55, 0.58, 0.64, 0.8]);
      ctx.move_to(sX + 4, sY + numSize + 3);
      ctx.show_text(String(s + 1));

      // Slot Name
      var sName = (client.slot_names && client.slot_names[s]) ? client.slot_names[s] : "";
      var curFontSize = Math.max(8, Math.min(is_preview ? 13 : text_size, sH * 0.42));
      ctx.select_font_face(font_name, "normal", highlightAlpha > 0.4 ? "bold" : "normal");
      ctx.set_font_size(curFontSize);
      ctx.set_source_rgba(text_color);

      while (sName.length > 0 && ctx.text_measure(sName)[0] > (sW - 8)) {
        sName = sName.slice(0, -1);
      }
      var tm = ctx.text_measure(sName);
      ctx.move_to(sX + (sW - tm[0]) * 0.5, sY + sH * 0.5 + curFontSize * 0.33);
      ctx.show_text(sName);
    }
  }

  // SIGNATURE RED LAUNCHER DOT
  if (!is_preview && allow_popup === 1) {
    var dotR = Math.max(2.0, Math.min(3.2, Math.min(w, h) * 0.08));
    var dotMargin = Math.max(4.0, Math.min(7.0, Math.min(w, h) * 0.12));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(w - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  var sz = mgraphics.size;
  draw_manager_strip(mgraphics, sz[0], sz[1], false);
}

// =============================================================
// 7. WINDOW 1: SET BANK BROWSER (PAGED)
// =============================================================
function toggle_bank_window(v) {
  if (v === undefined) showBankWindow = !showBankWindow;
  else showBankWindow = parseInt(v, 10) ? 1 : 0;

  if (showBankWindow) {
    var win = get_bank_window();
    var winW = 210;
    var perPage = Math.max(2, Math.min(sets_per_page, 20));
    var winH = 58 + perPage * 30 + 10;
    win.size = [winW, winH];

    if (this.box && this.box.rect) {
      var r = this.box.rect;
      win.pos = [r[2] + 8, r[1]];
    }
    win.visible = 1;
    win.front();
    draw_bank_window();
  } else {
    if (bankWindow) bankWindow.visible = 0;
  }
  mgraphics.redraw();
}

function draw_bank_window() {
  if (!showBankWindow || !bankWindow) return;
  var winW = 210;
  var perPage = Math.max(2, Math.min(sets_per_page, 20));
  var winH = 58 + perPage * 30 + 10;
  bankWindow.size = [winW, winH];

  bankMatrix = recycleMatrix(bankMatrix, winW, winH);
  var pCtx = new MGraphics(winW, winH);

  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, winW, winH);
  pCtx.fill();

  pCtx.set_source_rgba(0.85, 0.22, 0.22, 1.0);
  pCtx.arc(12, 13, 4.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Helvetica Neue", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color);
  pCtx.move_to(24, 16.5);
  pCtx.show_text("SET BANK (" + set_bank.length + " Sets)");

  pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.25);
  pCtx.set_line_width(0.6);
  pCtx.move_to(8, 25); pCtx.line_to(winW - 8, 25);
  pCtx.stroke();

  var totalPages = get_total_pages();
  var pageBarX = 8, pageBarY = 30, pageBarW = winW - 16, pageBarH = 20;

  pCtx.set_source_rgba(attr_bg_color);
  pCtx.rectangle_rounded(pageBarX, pageBarY, pageBarW, pageBarH, 3, 3);
  pCtx.fill();

  pCtx.set_source_rgba(attr_border_color);
  pCtx.set_line_width(0.6);
  pCtx.rectangle_rounded(pageBarX, pageBarY, pageBarW, pageBarH, 3, 3);
  pCtx.stroke();

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(11);
  pCtx.set_source_rgba(highlight_color);
  pCtx.move_to(pageBarX + 8, pageBarY + pageBarH * 0.5 + 4); pCtx.show_text("‹");
  pCtx.move_to(pageBarX + pageBarW - 14, pageBarY + pageBarH * 0.5 + 4); pCtx.show_text("›");

  pCtx.select_font_face("Helvetica Neue", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(1, 1, 1, 0.9);
  var pageStr = "Page " + (current_bank_page + 1) + " of " + totalPages;
  var pgTm = pCtx.text_measure(pageStr);
  pCtx.move_to(pageBarX + (pageBarW - pgTm[0]) * 0.5, pageBarY + pageBarH * 0.5 + 3.0);
  pCtx.show_text(pageStr);

  var startIdx = current_bank_page * perPage;
  var cardX = 8, cardW = winW - 16, cardH = 26;
  var startY = 56, gapY = 4;

  for (var i = 0; i < perPage; i++) {
    var sIdx = startIdx + i;
    if (sIdx >= set_bank.length) break;

    var cY = startY + i * (cardH + gapY);
    var isCurrent = (sIdx === active_set_idx);

    pCtx.set_source_rgba(isCurrent ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.22] : attr_bg_color);
    pCtx.rectangle_rounded(cardX, cY, cardW, cardH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(isCurrent ? highlight_color : [attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.6]);
    pCtx.set_line_width(isCurrent ? 1.0 : 0.6);
    pCtx.rectangle_rounded(cardX, cY, cardW, cardH, 3, 3);
    pCtx.stroke();

    pCtx.select_font_face("Helvetica Neue", "normal", isCurrent ? "bold" : "normal");
    pCtx.set_font_size(9.5);
    pCtx.set_source_rgba(isCurrent ? highlight_color : text_color);

    var setName = (sIdx + 1) + ". " + set_bank[sIdx].name;
    while (setName.length > 0 && pCtx.text_measure(setName)[0] > (cardW - 40)) {
      setName = setName.slice(0, -1);
    }
    pCtx.move_to(cardX + 8, cY + cardH * 0.5 + 3.5);
    pCtx.show_text(setName);

    pCtx.select_font_face("Arial", "normal", "bold");
    pCtx.set_font_size(10);
    pCtx.set_source_rgba(isCurrent ? highlight_color : [text_color[0], text_color[1], text_color[2], 0.35]);
    pCtx.move_to(cardX + cardW - 14, cY + cardH * 0.5 + 3.5);
    pCtx.show_text("›");
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(bankMatrix.name);
  bankWindow.jit_matrix(bankMatrix.name);
}

function bankWindowListenerCallback(event) {
  if (event.eventname === "close") { showBankWindow = 0; mgraphics.redraw(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;

    if (mx < 22 && my < 22) {
      showBankWindow = 0;
      if (bankWindow) bankWindow.visible = 0;
      mgraphics.redraw();
      return;
    }

    var winW = 210;
    var perPage = Math.max(2, Math.min(sets_per_page, 20));

    var pageBarX = 8, pageBarY = 30, pageBarW = winW - 16, pageBarH = 20;
    if (mx >= pageBarX && mx <= pageBarX + pageBarW && my >= pageBarY && my <= pageBarY + pageBarH) {
      var mid = pageBarX + pageBarW * 0.5;
      step_page(mx > mid ? 1 : -1);
      return;
    }

    var startIdx = current_bank_page * perPage;
    var cardX = 8, cardW = winW - 16, cardH = 26;
    var startY = 56, gapY = 4;

    for (var i = 0; i < perPage; i++) {
      var sIdx = startIdx + i;
      if (sIdx >= set_bank.length) break;

      var cY = startY + i * (cardH + gapY);
      if (mx >= cardX && mx <= cardX + cardW && my >= cY && my <= cY + cardH) {
        select_set(sIdx);
        return;
      }
    }
  }
}

// =============================================================
// 8. WINDOW 2: PALETTE DECK (TITLED "PALETTE")
// =============================================================
function open_palette_window_for_set() {
  var win = get_palette_window();
  var winW = 220, winH = 260;
  win.size = [winW, winH];

  if (bankWindow && bankWindow.visible && bankWindow.pos) {
    win.pos = [bankWindow.pos[0] + 220, bankWindow.pos[1]];
  } else if (this.box && this.box.rect) {
    win.pos = [this.box.rect[2] + 8, this.box.rect[1]];
  }

  showPaletteWindow = 1;
  win.visible = 1;
  win.front();
  draw_palette_window();
}

function close_palette_window() {
  showPaletteWindow = 0;
  if (paletteWindow) paletteWindow.visible = 0;
  mgraphics.redraw();
}

function draw_palette_window() {
  if (!showPaletteWindow || !paletteWindow) return;
  var winW = 220, winH = 260;
  paletteWindow.size = [winW, winH];

  paletteMatrix = recycleMatrix(paletteMatrix, winW, winH);
  var pCtx = new MGraphics(winW, winH);

  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, winW, winH);
  pCtx.fill();

  pCtx.set_source_rgba(0.85, 0.22, 0.22, 1.0);
  pCtx.arc(12, 13, 4.5, 0, Math.PI * 2);
  pCtx.fill();

  var curSet = set_bank[active_set_idx];
  var titleStr = (curSet ? curSet.name : "SET") + " PALETTES";

  pCtx.select_font_face("Helvetica Neue", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(highlight_color);
  while (titleStr.length > 0 && pCtx.text_measure(titleStr)[0] > (winW - 36)) {
    titleStr = titleStr.slice(0, -1);
  }
  pCtx.move_to(24, 16.5);
  pCtx.show_text(titleStr);

  pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.25);
  pCtx.set_line_width(0.6);
  pCtx.move_to(8, 25); pCtx.line_to(winW - 8, 25);
  pCtx.stroke();

  var cardX = 8, cardW = winW - 16, cardH = 48;
  var startY = 32, gapY = 6;
  var pals = curSet ? curSet.palettes : [];

  for (var p = 0; p < pals.length; p++) {
    var cY = startY + p * (cardH + gapY);
    var isPalActive = (p === active_palette_idx);

    pCtx.set_source_rgba(isPalActive ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.22] : attr_bg_color);
    pCtx.rectangle_rounded(cardX, cY, cardW, cardH, 4, 4);
    pCtx.fill();

    pCtx.set_source_rgba(isPalActive ? highlight_color : [attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.7]);
    pCtx.set_line_width(isPalActive ? 1.0 : 0.6);
    pCtx.rectangle_rounded(cardX, cY, cardW, cardH, 4, 4);
    pCtx.stroke();

    pCtx.select_font_face("Helvetica Neue", "normal", "bold");
    pCtx.set_font_size(10);
    pCtx.set_source_rgba(isPalActive ? highlight_color : text_color);
    pCtx.move_to(cardX + 8, cY + 16);
    pCtx.show_text((p + 1) + ". " + pals[p].name);

    var saveW = 40, saveH = 16;
    var saveX = cardX + cardW - saveW - 6;
    var saveY = cY + 5;

    pCtx.set_source_rgba(0.24, 0.18, 0.18, 0.9);
    pCtx.rectangle_rounded(saveX, saveY, saveW, saveH, 3, 3);
    pCtx.fill();

    pCtx.set_source_rgba(0.65, 0.35, 0.35, 0.7);
    pCtx.set_line_width(0.5);
    pCtx.rectangle_rounded(saveX, saveY, saveW, saveH, 3, 3);
    pCtx.stroke();

    pCtx.select_font_face("Helvetica Neue", "normal", "bold");
    pCtx.set_font_size(8);
    pCtx.set_source_rgba(1.0, 0.75, 0.75, 1.0);
    var svTm = pCtx.text_measure("Save");
    pCtx.move_to(saveX + (saveW - svTm[0]) * 0.5, saveY + saveH * 0.5 + 2.8);
    pCtx.show_text("Save");

    pCtx.select_font_face("Helvetica Neue", "normal", "normal");
    pCtx.set_font_size(8);
    pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], isPalActive ? 0.85 : 0.5);

    var sumText = pals[p].summary || "Empty";
    while (sumText.length > 0 && pCtx.text_measure(sumText)[0] > (cardW - 16)) {
      sumText = sumText.slice(0, -1);
    }
    if (sumText !== pals[p].summary && sumText.length > 3) {
      sumText = sumText.slice(0, -2) + "...";
    }
    pCtx.move_to(cardX + 8, cY + 36);
    pCtx.show_text(sumText);
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(paletteMatrix.name);
  paletteWindow.jit_matrix(paletteMatrix.name);
}

function paletteWindowListenerCallback(event) {
  if (event.eventname === "close") { close_palette_window(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;

    if (mx < 22 && my < 22) {
      close_palette_window();
      return;
    }

    var curSet = set_bank[active_set_idx];
    if (!curSet) return;

    var cardX = 8, cardW = 220 - 16, cardH = 48;
    var startY = 32, gapY = 6;

    for (var p = 0; p < curSet.palettes.length; p++) {
      var cY = startY + p * (cardH + gapY);

      if (mx >= cardX && mx <= cardX + cardW && my >= cY && my <= cY + cardH) {
        var saveW = 40, saveH = 16;
        var saveX = cardX + cardW - saveW - 6;
        var saveY = cY + 5;

        if (mx >= saveX && mx <= saveX + saveW && my >= saveY && my <= saveY + saveH) {
          capture_rig_to_palette(p);
          return;
        }

        recall_palette(p);
        return;
      }
    }
  }
}

// =============================================================
// 9. WINDOW 3: RED DOT 50/50 ATTRUI PARAMETER INSPECTOR
// =============================================================
function get_visible_rows_map() {
  if (!show_settings_attrs) return [];
  var list = [];

  if (mask_performance === 1) {
    list.push({ name: "Sets Per Page", val: sets_per_page, pct: (sets_per_page - 2) / 18.0, is_slider: true, target_id: 101 });
    list.push({ name: "Hold Time", val: hold_threshold + "ms", pct: (hold_threshold - 150) / 850.0, is_slider: true, target_id: 102 });
    list.push({ name: "Font Size", val: text_size, pct: (text_size - 8) / 16.0, is_slider: true, target_id: 103 });
  }

  if (mask_geometry === 1) {
    list.push({ name: "Border Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 201 });
    list.push({ name: "Border Size", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 202 });
    list.push({ name: "Extension", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 203 });
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
  var previewH = 130;
  var calculated_h = 28 + previewH + 16 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function toggle_settings_window(v) {
  if (v === undefined) showSettingsWindow = !showSettingsWindow;
  else showSettingsWindow = parseInt(v, 10) ? 1 : 0;

  var win = get_settings_window();
  if (showSettingsWindow) {
    var dims = get_settings_dimensions();
    win.size = [dims.w, dims.h];

    if (this.box && this.box.rect) {
      var r = this.box.rect;
      win.pos = [r[0], r[1] - dims.h - 10];
    }
    win.visible = 1;
    win.front();
    draw_settings();
  } else {
    win.visible = 0;
    if (colorWindow) colorWindow.visible = 0;
  }
  mgraphics.redraw();
}

function draw_settings() {
  if (!showSettingsWindow || !settingsWindow) return;
  if (render_pending === 0) {
    render_pending = 1;
    render_task.schedule(16);
  }
}

function draw_settings_deferred() {
  if (!showSettingsWindow || !settingsWindow) return;
  var dims = get_settings_dimensions();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows_map();
  var has_rows = rows.length > 0;

  settingsWindow.size = [w, h];
  settingsMatrix = recycleMatrix(settingsMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  // Close Red Dot
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
  pCtx.set_line_width(0.75);
  pCtx.rectangle_rounded(tglX + 0.5, tglY + 0.5, tglW - 1, tglH - 1, 3, 3);
  pCtx.stroke();

  pCtx.select_font_face("Arial", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(attr_text_color);
  var tglLabel = show_settings_attrs ? "hide" : "show";
  var tglTm = pCtx.text_measure(tglLabel);
  pCtx.move_to(tglX + (tglW - (tglTm ? tglTm[0] : 20)) * 0.5, tglY + 11.5);
  pCtx.show_text(tglLabel);

  // Top Live Preview Chassis (Tall and readable!)
  var prevX = 12, prevY = 28, prevW = w - 24;
  var prevH = has_rows ? 130 : Math.max(120, h - prevY - 14);
  cached_preview_rect = { x: prevX, y: prevY, w: prevW, h: prevH };

  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_manager_strip(pCtx, prevW, prevH, true);
  pCtx.restore();

  // Resize Corner Grab Handle
  if (!has_rows) {
    pCtx.new_path();
    pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
    pCtx.set_line_width(1.2);
    pCtx.move_to(w - 12, h - 4); pCtx.line_to(w - 4, h - 12);
    pCtx.move_to(w - 8, h - 4);  pCtx.line_to(w - 4, h - 8);
    pCtx.stroke();
  }

  // 50/50 Attribute Rows
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
      }
    }
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(settingsMatrix.name);
  settingsWindow.jit_matrix(settingsMatrix.name);
}

function apply_slider_target(target_id, targetPct) {
  if (target_id === 101) set_sets_per_page(Math.round(2 + targetPct * 18));
  else if (target_id === 102) hold_threshold = Math.round(150 + targetPct * 850);
  else if (target_id === 103) text_size = Math.round(8 + targetPct * 16);
  else if (target_id === 201) border_radius = targetPct * 25.0;
  else if (target_id === 202) border_thickness = targetPct * 10.0;
  else if (target_id === 203) border_extension = targetPct * 50.0;
  redraw_all();
}

// FULLY INTERACTIVE INSPECTOR PREVIEW (Touch/Click handling)
function handle_preview_interaction(localX, localY, isClick, mbut) {
  var pr = cached_preview_rect;
  var pw = pr.w, ph = pr.h;
  var keys = get_client_keys();
  var padX = 4, padY = 4;
  var inset = border_thickness * 0.5;
  var rw = Math.max(1, pw - border_thickness);

  var row1H = 24;
  var row1Y = inset + padY;
  var availRow1W = rw - padX * 2;
  var topBtnW = (availRow1W - 4) * 0.5;
  var bankBtnX = inset + padX;
  var resyncX = bankBtnX + topBtnW + 4;

  // ROW 1: [ SET BANK ]  |  [ RESYNC ]
  if (isClick && localY >= row1Y && localY <= row1Y + row1H) {
    if (localX >= bankBtnX && localX <= bankBtnX + topBtnW) {
      toggle_bank_window();
      draw_settings();
      return true;
    }
    if (localX >= resyncX && localX <= resyncX + topBtnW) {
      resync_rig();
      draw_settings();
      return true;
    }
  }

  // ROW 2: MODULE SELECTOR CAPSULE
  var row2H = 26;
  var row2Y = row1Y + row1H + 4;
  var modW = rw - padX * 2;
  var modX = inset + padX;

  if (isClick && localY >= row2Y && localY <= row2Y + row2H && localX >= modX && localX <= modX + modW) {
    if (localX <= modX + 32) step_module(-1);
    else if (localX >= modX + modW - 32) step_module(1);
    else open_picker_window();
    draw_settings();
    return true;
  }

  // ROW 3: SLOTS Hit-Testing & Real-Time Morphing
  var divY = row2Y + row2H + 4;
  if (localY > divY) {
    var client = get_active_client();
    if (!client || !client.num_slots) return false;

    var numSlots = client.num_slots;
    var cols = Math.max(1, client.cols || 1);
    var rows_count = Math.max(1, client.rows || 1);
    if (cols * rows_count < numSlots) rows_count = Math.ceil(numSlots / cols);

    var startY = divY + 4;
    var availW = rw - padX * 2;
    var availH = (ph - border_thickness * 0.5 - padY) - startY;
    var cellW = availW / cols;
    var cellH = Math.max(18, availH / rows_count);

    if (isClick) {
      var colHit = Math.floor((localX - (inset + padX)) / cellW);
      var rowHit = Math.floor((localY - startY) / cellH);

      if (colHit >= 0 && colHit < cols && rowHit >= 0 && rowHit < rows_count) {
        var clickedSlot = rowHit * cols + colHit;
        if (clickedSlot >= 0 && clickedSlot < numSlots) {
          call_client_recall(keys[active_module_idx], clickedSlot);
          try {
            outlet(0, keys[active_module_idx]);
            outlet(1, clickedSlot + 1);
          } catch(e) {}
          redraw_all();
          return true;
        }
      }
    } else if (mbut === 1 && numSlots > 1) {
      // Smooth Drag Morphing inside the Inspector!
      var morphVal = 1.0;
      if (cols > 1 && rows_count === 1) {
        var slotCenter1 = (inset + padX) + cellW * 0.5;
        var totalSpanX = Math.max(1, (cols - 1) * cellW);
        var pctX = clamp((localX - slotCenter1) / totalSpanX, 0.0, 1.0);
        morphVal = 1.0 + pctX * (numSlots - 1);
      } else if (cols === 1 && rows_count > 1) {
        var slotCenter1Y = startY + cellH * 0.5;
        var totalSpanY = Math.max(1, (rows_count - 1) * cellH);
        var pctY = clamp((localY - slotCenter1Y) / totalSpanY, 0.0, 1.0);
        morphVal = 1.0 + pctY * (numSlots - 1);
      } else {
        var normX = clamp(((localX - (inset + padX)) - cellW * 0.5) / Math.max(1, availW - cellW), 0.0, 1.0);
        var normY = clamp(((localY - startY) - cellH * 0.5) / Math.max(1, availH - cellH), 0.0, 1.0);
        var u = normX * (cols - 1);
        var v = normY * (rows_count - 1);
        morphVal = clamp(1.0 + v * cols + u, 1.0, numSlots);
      }
      client.morph_val = morphVal;
      call_client_morph(keys[active_module_idx], morphVal);
      try {
        outlet(0, keys[active_module_idx]);
        outlet(1, morphVal);
      } catch(e) {}
      redraw_all();
      return true;
    }
  }
  return false;
}

function settingsWindowListenerCallback(event) {
  if (event.eventname === "close") { showSettingsWindow = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = (mbut === 1 && !is_pop_dragging);

    if (mbut) { lastMouseX = mx; lastMouseY = my; }

    var dims = get_settings_dimensions();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows_map();
    var has_rows = rows.length > 0;
    var pr = cached_preview_rect;

    if (mbut === 0) {
      is_resizing_window = 0;
      is_pop_dragging = 0;
      active_pop_target = -1;
      if (scrollTask) { scrollTask.cancel(); scrollTask = null; }
      return;
    }

    // Mini Mode Resize Dragging
    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(260, start_resize_w + deltaW);
      popup_mini_h = Math.max(150, start_resize_h + deltaH);
      draw_settings();
      return;
    }

    // Resize Corner Handle Hit
    if (!has_rows && mx >= w - 18 && my >= h - 18) {
      is_resizing_window = 1;
      start_click_x = mx;
      start_click_y = my;
      start_resize_w = w;
      start_resize_h = h;
      return;
    }

    // Close Red Dot Hit
    if (mbut && mx < 35 && my < 26) {
      showSettingsWindow = 0;
      settingsWindow.visible = 0;
      if (colorWindow) colorWindow.visible = 0;
      redraw_all();
      return;
    }

    // Toggle Hide/Show Button Hit
    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      draw_settings();
      return;
    }

    // INTERACTIVE PREVIEW HIT & DRAGGING
    if (mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
      var localX = mx - pr.x;
      var localY = my - pr.y;
      var handled = handle_preview_interaction(localX, localY, is_pop_tap, mbut);
      if (handled) {
        is_pop_dragging = 1;
        return;
      }
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
      } else if (is_pop_tap && r.is_color) {
        active_color_target = r.key;
        initPickerFromTarget();
        var cWin = get_color_window();
        if (settingsWindow && settingsWindow.pos) {
          cWin.pos = [settingsWindow.pos[0] + valBoxX, settingsWindow.pos[1] + sY + rIdx * 28 + 14];
        }
        showColorWindow = 1;
        cWin.visible = 1;
        cWin.front();
        draw_color_picker();
      }
      draw_settings();
    }
  }
}

// =============================================================
// 10. WINDOW 4: COLOR PICKER
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
  if (!showColorWindow || !colorWindow) return;
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
  if (event.eventname === "close") { showColorWindow = 0; picker_drag_zone = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut === 0) { picker_drag_zone = 0; return; }

    if (mbut) {
      if (mx < 24 && my < 24) { showColorWindow = 0; colorWindow.visible = 0; picker_drag_zone = 0; redraw_all(); return; }
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
// 11. WINDOW 5: MODULE QUICK-PICKER DRAWER
// =============================================================
function open_picker_window() {
  var keys = get_client_keys();
  if (keys.length === 0) return;

  var win = get_picker_window();
  var winW = 200;
  var winH = Math.min(360, Math.max(100, 34 + keys.length * 28 + 10));
  win.size = [winW, winH];

  if (this.box && this.box.rect) {
    var r = this.box.rect;
    win.pos = [r[0], r[1] + 55];
  }

  showPickerWindow = 1;
  win.visible = 1;
  win.front();
  draw_picker_window();
}

function close_picker_window() {
  showPickerWindow = 0;
  if (pickerWindow) pickerWindow.visible = 0;
  mgraphics.redraw();
}

function draw_picker_window() {
  if (!showPickerWindow || !pickerWindow) return;
  var keys = get_client_keys();
  var winW = 200;
  var winH = Math.min(360, Math.max(100, 34 + keys.length * 28 + 10));
  pickerWindow.size = [winW, winH];

  pickerMatrix = recycleMatrix(pickerMatrix, winW, winH);
  var pCtx = new MGraphics(winW, winH);

  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, winW, winH);
  pCtx.fill();

  pCtx.set_source_rgba(0.85, 0.22, 0.22, 1.0);
  pCtx.arc(12, 12, 4.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Helvetica Neue", "normal", "bold");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(text_color);
  pCtx.move_to(24, 15.5);
  pCtx.show_text("SELECT MODULE (" + keys.length + ")");

  pCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.25);
  pCtx.set_line_width(0.6);
  pCtx.move_to(8, 24); pCtx.line_to(winW - 8, 24);
  pCtx.stroke();

  var itemX = 8, itemW = winW - 16, itemH = 24;
  var startY = 30, gapY = 4;

  for (var i = 0; i < keys.length; i++) {
    var itemY = startY + i * (itemH + gapY);
    if (itemY + itemH > winH) break;

    var isCurrent = (i === active_module_idx);
    var client = statusBus.clients[keys[i]];

    pCtx.set_source_rgba(isCurrent ? [highlight_color[0], highlight_color[1], highlight_color[2], 0.25] : attr_bg_color);
    pCtx.rectangle_rounded(itemX, itemY, itemW, itemH, 4, 4);
    pCtx.fill();

    pCtx.set_source_rgba(isCurrent ? highlight_color : [attr_border_color[0], attr_border_color[1], attr_border_color[2], 0.6]);
    pCtx.set_line_width(isCurrent ? 1.0 : 0.6);
    pCtx.rectangle_rounded(itemX, itemY, itemW, itemH, 4, 4);
    pCtx.stroke();

    if (isCurrent) {
      pCtx.set_source_rgba(highlight_color);
      pCtx.arc(itemX + 10, itemY + itemH * 0.5, 2.5, 0, Math.PI * 2);
      pCtx.fill();
    }

    pCtx.select_font_face("Helvetica Neue", "normal", isCurrent ? "bold" : "normal");
    pCtx.set_font_size(9.5);
    pCtx.set_source_rgba(isCurrent ? highlight_color : text_color);

    var dName = keys[i];
    while (dName.length > 0 && pCtx.text_measure(dName)[0] > (itemW - 55)) {
      dName = dName.slice(0, -1);
    }
    pCtx.move_to(itemX + (isCurrent ? 18 : 10), itemY + itemH * 0.5 + 3.5);
    pCtx.show_text(dName);

    if (client && client.active_slot !== undefined) {
      pCtx.select_font_face("Helvetica Neue", "normal", "bold");
      pCtx.set_font_size(8);
      pCtx.set_source_rgba(text_color[0], text_color[1], text_color[2], 0.5);
      var slotTag = "S" + (client.active_slot + 1);
      var tagTm = pCtx.text_measure(slotTag);
      pCtx.move_to(itemX + itemW - tagTm[0] - 8, itemY + itemH * 0.5 + 3.0);
      pCtx.show_text(slotTag);
    }
  }

  var img = new Image(pCtx);
  img.tonamedmatrix(pickerMatrix.name);
  pickerWindow.jit_matrix(pickerMatrix.name);
}

function pickerWindowListenerCallback(event) {
  if (event.eventname === "close") { close_picker_window(); return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    if (mbut !== 1) return;

    if (mx < 22 && my < 22) { close_picker_window(); return; }

    var keys = get_client_keys();
    var itemX = 8, itemW = 200 - 16, itemH = 24;
    var startY = 30, gapY = 4;

    for (var i = 0; i < keys.length; i++) {
      var itemY = startY + i * (itemH + gapY);
      if (mx >= itemX && mx <= itemX + itemW && my >= itemY && my <= itemY + itemH) {
        select_module_idx(i);
        return;
      }
    }
  }
}

// =============================================================
// 12. MOUSE & DRAG MORPHING (CANVAS)
// =============================================================
function stop_mod_hold_watchdog() {
  isModMouseDown = 0;
  if (modHoldTask) {
    try { modHoldTask.cancel(); } catch(e) {}
    modHoldTask = null;
  }
}

function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {
  var sz = mgraphics.size;
  var w = sz[0], h = sz[1];
  var keys = get_client_keys();

  // 1. Signature Red Dot Hit (or Ctrl-Click anywhere)
  if (allow_popup === 1) {
    var dotMargin = Math.max(4.0, Math.min(7.0, Math.min(w, h) * 0.12));
    var dotX = w - dotMargin, dotY = dotMargin;
    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    if (distToDot <= 9.0 || ctrl === 1) {
      toggle_settings_window();
      return;
    }
  }

  var inset = border_thickness * 0.5;
  var rw = Math.max(1, sz[0] - border_thickness);
  var padX = 4, padY = 4;

  // ROW 1: [ SET BANK ]  |  [ RESYNC ]
  var row1H = 20;
  var row1Y = inset + padY;
  var dotReserve = (allow_popup === 1) ? 14 : 0;
  var availRow1W = rw - padX * 2 - dotReserve;
  var topBtnW = Math.max(10, (availRow1W - 4) * 0.5);
  var bankBtnX = inset + padX;
  var resyncX = bankBtnX + topBtnW + 4;

  if (y >= row1Y && y <= row1Y + row1H) {
    if (x >= bankBtnX && x <= bankBtnX + topBtnW) {
      toggle_bank_window();
      return;
    }
    if (x >= resyncX && x <= resyncX + topBtnW) {
      resync_rig();
      return;
    }
  }

  // ROW 2: MODULE SELECTOR CAPSULE
  var row2H = 22;
  var row2Y = row1Y + row1H + 4;
  var modW = rw - padX * 2;
  var modX = inset + padX;

  if (y >= row2Y && y <= row2Y + row2H && x >= modX && x <= modX + modW) {
    stop_mod_hold_watchdog();
    isModMouseDown = 1;
    isModHoldTriggered = 0;
    modClickX = x;
    modMousePressTime = new Date().getTime();

    modHoldTask = new Task(function() {
      if (isModMouseDown === 1) {
        var elapsed = new Date().getTime() - modMousePressTime;
        if (elapsed >= hold_threshold) {
          isModHoldTriggered = 1;
          stop_mod_hold_watchdog();
          open_picker_window();
        }
      } else {
        stop_mod_hold_watchdog();
      }
    }, this);
    modHoldTask.interval = 25;
    modHoldTask.repeat();
    return;
  }

  // SLOTS Hit-Testing
  var divY = row2Y + row2H + 4;
  if (y > divY) {
    var client = get_active_client();
    if (!client || !client.num_slots) return;

    var numSlots = client.num_slots;
    var cols = Math.max(1, client.cols || 1);
    var rows_count = Math.max(1, client.rows || 1);
    if (cols * rows_count < numSlots) rows_count = Math.ceil(numSlots / cols);

    var startY = divY + 4;
    var availW = rw - padX * 2;
    var availH = (h - border_thickness * 0.5 - padY) - startY;
    var cellW = availW / cols;
    var cellH = availH / rows_count;

    var colHit = Math.floor((x - (inset + padX)) / cellW);
    var rowHit = Math.floor((y - startY) / cellH);

    if (colHit >= 0 && colHit < cols && rowHit >= 0 && rowHit < rows_count) {
      var clickedSlot = rowHit * cols + colHit;
      if (clickedSlot >= 0 && clickedSlot < numSlots) {
        call_client_recall(keys[active_module_idx], clickedSlot);
        try {
          outlet(0, keys[active_module_idx]);
          outlet(1, clickedSlot + 1);
        } catch(e) {}
        redraw_all();
      }
    }
  }
}

function ondrag(x, y, button) {
  if (button === 0) {
    is_dragging = 0;

    if (isModMouseDown === 1) {
      stop_mod_hold_watchdog();
      if (!isModHoldTriggered) {
        var sz = mgraphics.size;
        var inset = border_thickness * 0.5;
        var rw = Math.max(1, sz[0] - border_thickness);
        var modW = rw - 8;
        var modX = inset + 4;
        var mid = modX + modW * 0.5;
        step_module(modClickX > mid ? 1 : -1);
      }
      isModHoldTriggered = 0;
    }
    return;
  }

  var client = get_active_client();
  if (!client || !client.num_slots || client.num_slots <= 1) return;

  var sz = mgraphics.size;
  var padX = 4, padY = 4;
  var inset = border_thickness * 0.5;
  var rw = Math.max(1, sz[0] - border_thickness);
  var row1H = 20, row2H = 22;
  var divY = inset + padY + row1H + 4 + row2H + 4;
  var startY = divY + 4;

  if (!is_dragging && y < startY - 6) return;
  is_dragging = 1;

  var numSlots = client.num_slots;
  var cols = Math.max(1, client.cols || 1);
  var rows_count = Math.max(1, client.rows || 1);
  if (cols * rows_count < numSlots) rows_count = Math.ceil(numSlots / cols);

  var availW = Math.max(1, rw - padX * 2);
  var availH = Math.max(1, (sz[1] - inset - padY) - startY);
  var cellW = availW / cols;
  var cellH = availH / rows_count;

  var morphVal = 1.0;

  if (cols > 1 && rows_count === 1) {
    var slotCenter1 = (inset + padX) + cellW * 0.5;
    var totalSpanX = Math.max(1, (cols - 1) * cellW);
    var pctX = clamp((x - slotCenter1) / totalSpanX, 0.0, 1.0);
    morphVal = 1.0 + pctX * (numSlots - 1);
  }
  else if (cols === 1 && rows_count > 1) {
    var slotCenter1Y = startY + cellH * 0.5;
    var totalSpanY = Math.max(1, (rows_count - 1) * cellH);
    var pctY = clamp((y - slotCenter1Y) / totalSpanY, 0.0, 1.0);
    morphVal = 1.0 + pctY * (numSlots - 1);
  }
  else {
    var normX = clamp(((x - (inset + padX)) - cellW * 0.5) / Math.max(1, availW - cellW), 0.0, 1.0);
    var normY = clamp(((y - startY) - cellH * 0.5) / Math.max(1, availH - cellH), 0.0, 1.0);
    var u = normX * (cols - 1);
    var v = normY * (rows_count - 1);
    morphVal = clamp(1.0 + v * cols + u, 1.0, numSlots);
  }

  client.morph_val = morphVal;

  var keys = get_client_keys();
  call_client_morph(keys[active_module_idx], morphVal);

  try {
    outlet(0, keys[active_module_idx]);
    outlet(1, morphVal);
  } catch(e) {}

  redraw_all();
}

function onidle() { if (isModMouseDown) stop_mod_hold_watchdog(); }
function onidleout() { if (isModMouseDown) stop_mod_hold_watchdog(); }

// =============================================================
// 13. INLET DISPATCHER & CONTROL
// =============================================================
function module() {
  var a = arrayfromargs(arguments);
  if (a.length === 0) return;
  var keys = get_client_keys();

  if (typeof a[0] === "number" || (!isNaN(Number(a[0])) && String(a[0]).trim() !== "")) {
    var idx = parseInt(a[0], 10) - 1;
    select_module_idx(idx);
    return;
  }

  var targetName = String(a[0]).trim();
  var found = keys.indexOf(targetName);
  if (found !== -1) {
    select_module_idx(found);
  }
}

function target() { module.apply(this, arguments); }

function msg_int(v) {
  var keys = get_client_keys();
  if (keys.length === 0) return;
  var sIdx = parseInt(v, 10) - 1;
  call_client_recall(keys[active_module_idx], sIdx);
  outlet(0, keys[active_module_idx]);
  outlet(1, sIdx + 1);
  redraw_all();
}

function msg_float(v) {
  var fVal = parseFloat(v);
  if (isNaN(fVal)) return;

  var keys = get_client_keys();
  if (keys.length > 0) {
    call_client_morph(keys[active_module_idx], fVal);
    outlet(0, keys[active_module_idx]);
    outlet(1, fVal);
  }
  redraw_all();
}

function palette() {
  var a = arrayfromargs(arguments);
  if (a.length === 0) return;
  var num = parseFloat(a[0]);
  if (!isNaN(num)) {
    if (num % 1 !== 0) morph_palette(num);
    else recall_palette(Math.round(num) - 1);
  }
}

function pal() { palette.apply(this, arguments); }

function set() {
  var a = arrayfromargs(arguments);
  if (a.length === 0) return;

  if (!isNaN(Number(a[0]))) {
    var idx = parseInt(a[0], 10) - 1;
    select_set(idx);
  } else {
    var targetName = a.join(" ").trim().toLowerCase();
    for (var i = 0; i < set_bank.length; i++) {
      if (set_bank[i].name.toLowerCase() === targetName) {
        select_set(i);
        break;
      }
    }
  }
}

function page(v) {
  var p = parseInt(v, 10) - 1;
  var total = get_total_pages();
  if (!isNaN(p)) {
    current_bank_page = clamp(p, 0, total - 1);
    if (showBankWindow) draw_bank_window();
  }
}

function set_sets_per_page(v) {
  var p = parseInt(v, 10);
  if (!isNaN(p) && p >= 2 && p <= 20) {
    sets_per_page = p;
    current_bank_page = 0;
    if (showBankWindow) draw_bank_window();
  }
}
function get_sets_per_page() { return sets_per_page; }

declareattribute("sets_per_page", { type: "int", label: "Sets Per Page", setter: "set_sets_per_page", getter: "get_sets_per_page", category: "Set Bank", embed: 1 });

function capture(v)   { capture_rig_to_palette(parseInt(v, 10) - 1); }
function popup(v)     { toggle_settings_window(v); }
function bank(v)      { toggle_bank_window(v); }
function browse()     { open_picker_window(); }
function resync()     { resync_rig(); }
function scan()       { resync_rig(); }
function next()       { step_module(1); }
function prev()       { step_module(-1); }
function next_page()  { step_page(1); }
function prev_page()  { step_page(-1); }

function anything() {
  var args = arrayfromargs(arguments);
  var msg = messagename.toLowerCase().trim();

  if (msg === "pal" || msg === "palette" || msg === "palettes") {
    palette.apply(this, args);
    return;
  }

  if (msg === "set" || msg === "sets") {
    set.apply(this, args);
    return;
  }

  if (msg === "page") {
    if (args.length > 0) page(args[0]);
    return;
  }

  if (msg === "resync" || msg === "scan" || msg === "clear" || msg === "flush") {
    resync_rig();
    return;
  }

  if (msg === "refresh" || msg === "bang") {
    redraw_all();
    return;
  }
}

// =============================================================
// 14. SESSION SERIALIZATION & CLEANUP
// =============================================================
function save() {
  embedmessage("set_active_module_idx", active_module_idx);
  embedmessage("set_active_set_idx", active_set_idx);
  embedmessage("set_active_palette_idx", active_palette_idx);
  embedmessage("set_sets_per_page", sets_per_page);

  var serializedSets = [];
  for (var i = 0; i < set_bank.length; i++) {
    var sb = set_bank[i];
    var palParts = [];
    for (var p = 0; p < sb.palettes.length; p++) {
      var pal = sb.palettes[p];
      var entries = [];
      for (var k in pal.map) entries.push(k + ":" + pal.map[k]);
      palParts.push(pal.name + "=" + entries.join(",") + "=" + (pal.summary || "Empty"));
    }
    serializedSets.push(sb.name + "||" + palParts.join("##"));
  }
  embedmessage("set_bank_saved", encodeURIComponent(serializedSets.join("@@@")));
}

function set_active_module_idx(v) { active_module_idx = parseInt(v, 10); redraw_all(); }
function set_active_set_idx(v) { active_set_idx = parseInt(v, 10); redraw_all(); }
function set_active_palette_idx(v) { active_palette_idx = parseInt(v, 10); redraw_all(); }

function set_bank_saved(str) {
  if (!str) return;
  try {
    var decoded = decodeURIComponent(str);
    var rawSets = decoded.split("@@@");
    for (var i = 0; i < rawSets.length && i < set_bank.length; i++) {
      var setBits = rawSets[i].split("||");
      if (setBits.length >= 2) {
        set_bank[i].name = setBits[0];
        var rawPals = setBits[1].split("##");
        for (var p = 0; p < rawPals.length && p < set_bank[i].palettes.length; p++) {
          var palBits = rawPals[p].split("=");
          if (palBits.length >= 2) {
            set_bank[i].palettes[p].name = palBits[0];
            var mapPairs = palBits[1].split(",");
            var restoredMap = {};
            for (var j = 0; j < mapPairs.length; j++) {
              var kv = mapPairs[j].split(":");
              if (kv.length === 2) restoredMap[kv[0]] = parseInt(kv[1], 10);
            }
            set_bank[i].palettes[p].map = restoredMap;
            if (palBits.length >= 3) set_bank[i].palettes[p].summary = palBits[2];
          }
        }
      }
    }
  } catch(e) {}
  redraw_all();
}

function notifydeleted() {
  stop_mod_hold_watchdog();
  if (scrollTask) { try { scrollTask.cancel(); } catch(e) {} }
  if (render_task) { try { render_task.cancel(); } catch(e) {} }
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];
  if (statusBus && statusBus.subscribers) delete statusBus.subscribers[uniqueID];

  try { if (settingsListener) settingsListener.subjectname = ""; } catch(e) {}
  try { if (settingsWindow) settingsWindow.visible = 0; } catch(e) {}
  try { if (settingsWindow) settingsWindow.free(); } catch(e) {}
  try { if (settingsMatrix) settingsMatrix.freepeer(); } catch(e) {}

  try { if (colorListener) colorListener.subjectname = ""; } catch(e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch(e) {}
  try { if (colorWindow) colorWindow.free(); } catch(e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch(e) {}

  try { if (bankListener) bankListener.subjectname = ""; } catch(e) {}
  try { if (bankWindow) bankWindow.visible = 0; } catch(e) {}
  try { if (bankWindow) bankWindow.free(); } catch(e) {}
  try { if (bankMatrix) bankMatrix.freepeer(); } catch(e) {}

  try { if (paletteListener) paletteListener.subjectname = ""; } catch(e) {}
  try { if (paletteWindow) paletteWindow.visible = 0; } catch(e) {}
  try { if (paletteWindow) paletteWindow.free(); } catch(e) {}
  try { if (paletteMatrix) paletteMatrix.freepeer(); } catch(e) {}

  try { if (pickerListener) pickerListener.subjectname = ""; } catch(e) {}
  try { if (pickerWindow) pickerWindow.visible = 0; } catch(e) {}
  try { if (pickerWindow) pickerWindow.free(); } catch(e) {}
  try { if (pickerMatrix) pickerMatrix.freepeer(); } catch(e) {}
}

resync_rig();