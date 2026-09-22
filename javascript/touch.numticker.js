// ============================================================================
// touch.numticker.js - Max 9 v8ui / jsui
// High-Precision Touch/Mouse Numeric Controller with Specialized Labelling,
// 50/50 Attrui Inspector, 5-Tier Performance Masks, Full Popup Theme Engine,
// Mode Color Sync, Dynamic Number Spacing (5%-35%), and Chained Tag Layout.
// ============================================================================

autowatch = 1;
inlets = 1;
outlets = 1;

if (typeof mgraphics.init === "function") {
  mgraphics.init();
}
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

var uniqueID = Math.floor(Math.random() * 1000000);

// ============================================================================
// 1. STATE & PARAMETERS
// ============================================================================
var val = 0.0;
var mode = 0;                  // 0 = Mouse, 1 = Touch
var touch_type = 1;            // 0 = Sliders, 1 = Pad
var step_size = 1.0;
var hold_speed = 50.0;
var allow_popup = 1;
var integer_digits = 4;
var decimal_digits = 2;
var leading_zeros = 1;
var speed_control = 1.0;
var is_transmitting = false; //

// Spacing & Layout
var number_spacing = 0.10;     // Digit gap ratio (0.05 to 0.35 -> 5% to 35% of font size)
var tag_gap        = 10.0;     // Space between tag label and numbers

// Typography (Canvas: 6-24pt; Popup Preview: 13pt base)
var font = "Arial";
var text_size = 12;
var font_weight = "normal";
var font_slant = "normal";
var name_tag_text_size = 12;

// Specialized Labelling Engine
var label_mode          = 0;   // 0 = Full, 1 = No Vowels, 2 = Caps Only, 3 = First Letter, 4 = No Text
var label_mode_names    = ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"];
var case_mode           = 0;   // 0 = First Cap, 1 = All Cap, 2 = All Small
var case_mode_names     = ["First Cap", "All Cap", "All Small"];

// Geometry
var border_radius = 8.0;
var border_thickness = 1.2;
var border_extension = 6.0;

// Component Colors
var background_color = [0.12, 0.12, 0.14, 1.0];
var textcolor        = [0.95, 0.96, 0.98, 1.0];
var decimal_color    = [0.93, 0.96, 0.22, 1.0];
var border_color     = [0.42, 0.42, 0.48, 1.0];
var highlight_color  = [1.00, 0.22, 0.25, 1.0];
var mode_color       = [0.85, 0.85, 0.90, 1.0]; // Color Mode from Theme Master
var tag_color        = [0.85, 0.85, 0.90, 1.0];
var popup_dot_color  = [0.85, 0.85, 0.85, 0.70];

// Popup Attrui UI Colors (Full 5-Color Theme Suite)
var pop_bgcolor       = [0.12, 0.12, 0.15, 1.0];
var attr_bg_color     = [0.22, 0.22, 0.22, 1.0];
var attr_border_color = [0.28, 0.28, 0.32, 1.0];
var attr_slider_color = [0.50, 0.50, 0.50, 1.0];
var attr_text_color   = [1.00, 1.00, 1.00, 1.0];

// Tag Configuration
var name_tag_on   = 1;         // Name Tag Visible
var name_tag_text = "Tempo";
var tag_position  = 2;         // 0 = Top, 1 = Bottom, 2 = Left, 3 = Right
var name_tag_x    = 0;
var name_tag_y    = 0;

// Standard 5-Tier Popup Visibility Masks
var show_settings_attrs = 1;
var mask_performance   = 1;
var mask_labels        = 1;
var mask_geometry      = 1;
var mask_colors        = 1;
var mask_popup_colors  = 1;

var popup_window_width = 270;
var popup_mini_w       = 270;
var popup_mini_h       = 95;
var is_resizing_window = 0;
var start_click_x      = 0;
var start_click_y      = 0;
var start_resize_w     = 270;
var start_resize_h     = 95;

// Interaction Tracking
var active_col = -1;
var active_pop_col = -1;
var active_pop_slider = -1;
var last_x = 0;
var last_y = 0;
var lastPopY = 0;
var click_start_x = 0;
var click_start_y = 0;
var pop_click_start_x = 0;
var pop_click_start_y = 0;
var digit_columns = [];
var preview_digit_columns = [];
var cached_nX = 0;
var cached_nW = 150;
var touch_pad_buffer = "";
var touch_mouse_down = 0;
var pop_mouse_down = 0;

var mouse_is_down = 0;
var hold_task = null;
var hold_dir = 1;
var hold_count = 0;

var showSettings = 0;
var showTouch = 0;
var active_pop_target = -1;
var active_color_target = "background_color";

// ============================================================================
// 2. JITTER FLOATING WINDOWS & RECYCLING
// ============================================================================
var popupWindow = new JitterObject("jit.window", "vsl_set_" + uniqueID);
popupWindow.floating = 1; popupWindow.visible = 0; popupWindow.border = 1; popupWindow.grow = 0;
popupWindow.title = "Touch Numticker Settings";
popupWindow.size = [popup_window_width, 420];

var colorWindow = new JitterObject("jit.window", "vsl_col_" + uniqueID);
colorWindow.floating = 1; colorWindow.visible = 0; colorWindow.border = 1; colorWindow.grow = 0;
colorWindow.title = "Color Picker";
colorWindow.size = [200, 240];

var touchWindow = new JitterObject("jit.window", "vsl_touch_" + uniqueID);
touchWindow.floating = 1; touchWindow.visible = 0; touchWindow.border = 1; touchWindow.grow = 0;
touchWindow.title = "Touch Interface";
touchWindow.size = [270, 330];

var outMatrix   = null;
var colorMatrix = null;
var touchMatrix = new JitterMatrix(4, "char", 270, 340);

var render_pending = 0;
var render_task = new Task(function () {
  render_pending = 0;
  draw_popup_to_window_deferred();
}, this);

function recycleMatrix(mat, w, h) {
  if (!mat) return new JitterMatrix(4, "char", w, h);
  var d = mat.dim;
  if (d[0] !== w || d[1] !== h) mat.dim = [w, h];
  return mat;
}

// ============================================================================
// 3. THEME MASTER BUS & PERSISTENT DICT
// ============================================================================
var bus = new Global("touch_theme_bus");
if (!bus.subscribers || typeof bus.subscribers !== "object") {
  bus.subscribers = {};
}

function parseColorArgs(args, fallback) {
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

function loadThemeFromDict() {
  var themeDict = new Dict("touch_theme_store");
  if (!themeDict) return;
  try {
    if (themeDict.contains("bg_color")) background_color = parseColorArgs(themeDict.get("bg_color"), background_color);
    if (themeDict.contains("border_color")) border_color = parseColorArgs(themeDict.get("border_color"), border_color);
    if (themeDict.contains("text_color")) textcolor = parseColorArgs(themeDict.get("text_color"), textcolor);
    if (themeDict.contains("highlight_color")) highlight_color = parseColorArgs(themeDict.get("highlight_color"), highlight_color);
    if (themeDict.contains("mode_color")) {
      mode_color = parseColorArgs(themeDict.get("mode_color"), mode_color);
      tag_color = mode_color;
    }
    if (themeDict.contains("popup_dot_color")) popup_dot_color = parseColorArgs(themeDict.get("popup_dot_color"), popup_dot_color);
    if (themeDict.contains("decimal_color")) decimal_color = parseColorArgs(themeDict.get("decimal_color"), decimal_color);

    if (themeDict.contains("pop_bgcolor")) pop_bgcolor = parseColorArgs(themeDict.get("pop_bgcolor"), pop_bgcolor);
    if (themeDict.contains("attr_bg_color")) attr_bg_color = parseColorArgs(themeDict.get("attr_bg_color"), attr_bg_color);
    if (themeDict.contains("attr_border_color")) attr_border_color = parseColorArgs(themeDict.get("attr_border_color"), attr_border_color);
    if (themeDict.contains("attr_slider_color")) attr_slider_color = parseColorArgs(themeDict.get("attr_slider_color"), attr_slider_color);
    if (themeDict.contains("attr_text_color")) attr_text_color = parseColorArgs(themeDict.get("attr_text_color"), attr_text_color);

    if (themeDict.contains("border_radius")) border_radius = Number(themeDict.get("border_radius"));
    if (themeDict.contains("border_thickness")) border_thickness = Number(themeDict.get("border_thickness"));
    if (themeDict.contains("border_extension")) border_extension = Number(themeDict.get("border_extension"));
  } catch(e) {}
}

function onBusMessage(msg) {
  if (!msg) return;
  try {
    if (msg.bg_color) background_color = parseColorArgs(msg.bg_color, background_color);
    if (msg.border_color) border_color = parseColorArgs(msg.border_color, border_color);
    if (msg.text_color) textcolor = parseColorArgs(msg.text_color, textcolor);
    else if (msg.font_color) textcolor = parseColorArgs(msg.font_color, textcolor);
    if (msg.highlight_color) highlight_color = parseColorArgs(msg.highlight_color, highlight_color);
    else if (msg.accent_color) highlight_color = parseColorArgs(msg.accent_color, highlight_color);
    if (msg.mode_color) {
      mode_color = parseColorArgs(msg.mode_color, mode_color);
      tag_color = mode_color;
    }
    if (msg.popup_dot_color) popup_dot_color = parseColorArgs(msg.popup_dot_color, popup_dot_color);
    else if (msg.dot_color) popup_dot_color = parseColorArgs(msg.dot_color, popup_dot_color);
    if (msg.decimal_color) decimal_color = parseColorArgs(msg.decimal_color, decimal_color);

    if (msg.pop_bgcolor) pop_bgcolor = parseColorArgs(msg.pop_bgcolor, pop_bgcolor);
    if (msg.attr_bg_color) attr_bg_color = parseColorArgs(msg.attr_bg_color, attr_bg_color);
    if (msg.attr_border_color) attr_border_color = parseColorArgs(msg.attr_border_color, attr_border_color);
    if (msg.attr_slider_color) attr_slider_color = parseColorArgs(msg.attr_slider_color, attr_slider_color);
    if (msg.attr_text_color) attr_text_color = parseColorArgs(msg.attr_text_color, attr_text_color);

    if (msg.border_radius !== undefined) border_radius = Number(msg.border_radius);
    else if (msg.corner_radius !== undefined) border_radius = Number(msg.corner_radius);

    if (msg.border_thickness !== undefined) border_thickness = Number(msg.border_thickness);
    else if (msg.bordersize !== undefined) border_thickness = Number(msg.bordersize);

    if (msg.border_extension !== undefined) border_extension = Number(msg.border_extension);

    redraw_all();
  } catch(e) {}
}

bus.subscribers[uniqueID] = onBusMessage;
loadThemeFromDict();

// =============================================================
// 4. SPECIALIZED LABELLING ENGINE
// =============================================================
function cleanQuotes(str) {
  if (!str || typeof str !== "string") return "";
  var s = str.trim();
  s = s.replace(/\\+"/g, '');
  s = s.replace(/^"+|"+$/g, '');
  return s.trim();
}

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
// 5. CORE TICKER UTILITIES & DRAW ENGINE
// =============================================================
function clean_font_name(f) {
  if (!f) return "Arial";
  return f.replace(/\s+Regular$/i, "").trim();
}

function cancel_hold() {
  mouse_is_down = 0;
  if (hold_task) {
    try { hold_task.cancel(); } catch (e) {}
  }
  hold_count = 0;
}

function hold_task_fn() {
  if (mouse_is_down !== 1 || active_col !== -1 || active_pop_col !== -1 || mode === 1) {
    cancel_hold();
    return;
  }
  hold_count++;
  if (hold_count === 1) {
    hold_task.interval = Math.max(10.0, parseFloat(hold_speed) || 50.0);
  }
  val += hold_dir * step_size;
  clampValue();
  outlet(0, val);
  redraw_all();
}

function clampValue() {
  var limit = Math.pow(10, integer_digits) - Math.pow(10, -decimal_digits);
  if (val < -limit) val = -limit;
  if (val > limit) val = limit;
}

function redraw_all() {
  mgraphics.redraw();
  if (typeof notifyclients === "function") {
    notifyclients();
  }
  if (showSettings) draw_popup_to_window();
  if (showTouch) draw_touch_ui();
}

function draw_master_shape(ctx, width, height, r, tW, tagH, is_preview) {
  var nX = 0, nY = 0, nH = height;
  if (name_tag_on === 1 && tW > 0 && !is_preview) {
    var tabX = width * 0.5 - tW * 0.5 + name_tag_x;
    if (tabX < 0) tabX = 0;
    if (tabX + tW > width) tabX = width - tW;
    ctx.new_path();
    if (tag_position === 0) {
      nY = tagH - 4; nH = height - nY;
      ctx.move_to(tabX, nY); ctx.line_to(tabX, 0); ctx.line_to(tabX + tW, 0); ctx.line_to(tabX + tW, nY);
      ctx.line_to(width - r, nY);
      if (r > 0) ctx.arc(width - r, nY + r, r, -Math.PI / 2, 0);
      ctx.line_to(width, height - r);
      if (r > 0) ctx.arc(width - r, height - r, r, 0, Math.PI / 2);
      ctx.line_to(r, height);
      if (r > 0) ctx.arc(r, height - r, r, Math.PI / 2, Math.PI);
      ctx.line_to(0, nY + r);
      if (r > 0) ctx.arc(r, nY + r, r, Math.PI, -Math.PI / 2);
    } else if (tag_position === 1) {
      nH = height - tagH + 4;
      ctx.move_to(r, 0); ctx.line_to(width - r, 0);
      if (r > 0) ctx.arc(width - r, r, r, -Math.PI / 2, 0);
      ctx.line_to(width, nH - r);
      if (r > 0) ctx.arc(width - r, nH - r, r, 0, Math.PI / 2);
      ctx.line_to(tabX + tW, nH); ctx.line_to(tabX + tW, height); ctx.line_to(tabX, height); ctx.line_to(tabX, nH);
      ctx.line_to(r, nH);
      if (r > 0) ctx.arc(r, nH - r, r, Math.PI / 2, Math.PI);
      ctx.line_to(0, r);
      if (r > 0) ctx.arc(r, r, r, Math.PI, -Math.PI / 2);
    } else {
      ctx.rectangle(0, 0, width, height);
    }
    ctx.close_path();
  } else {
    ctx.new_path();
    if (r > 0) {
      ctx.move_to(r, 0); ctx.line_to(width - r, 0);
      ctx.arc(width - r, r, r, -Math.PI / 2, 0);
      ctx.line_to(width, height - r);
      ctx.arc(width - r, height - r, r, 0, Math.PI / 2);
      ctx.line_to(r, height);
      ctx.arc(r, height - r, r, Math.PI / 2, Math.PI);
      ctx.line_to(0, r);
      ctx.arc(r, r, r, Math.PI, -Math.PI / 2);
      ctx.close_path();
    } else {
      ctx.rectangle(0, 0, width, height);
    }
  }
}

function draw_ticker_full(ctx, width, height, is_preview) {
  if (!width || !height || width <= 10 || height <= 10) return;

  var scaleRatio = is_preview ? Math.max(1.0, height / 36.0) : 1.0;

  var r = Math.max(0, (parseFloat(border_radius) || 0) * scaleRatio);
  var maxR = Math.min(width, height) * 0.5;
  if (r > maxR) r = maxR;

  var curFontSize;
  if (is_preview) {
    curFontSize = Math.max(12, Math.min(22, Math.round(13.0 * scaleRatio)));
  } else {
    curFontSize = Math.max(6, parseInt(text_size, 10) || 12);
  }
  var tagSize = is_preview ? curFontSize : Math.max(6, parseInt(name_tag_text_size, 10) || curFontSize);

  ctx.select_font_face(clean_font_name(font), font_slant, font_weight);
  ctx.set_font_size(tagSize);

  var tagStr = get_display_label(name_tag_text || "Tempo", is_preview);
  var tm = ctx.text_measure(tagStr);
  var tagW = (name_tag_on && tagStr.length > 0 && tm && tm[0]) ? tm[0] : 0;
  var scaledTagGap = (tagW > 0) ? Math.max(4, Math.round(tag_gap * scaleRatio)) : 0;
  var tagH = tagSize + Math.round(8 * scaleRatio);
  var tW = tagW > 0 ? (tagW + scaledTagGap + 12) : 0;

  draw_master_shape(ctx, width, height, r, tW, tagH, is_preview);
  ctx.set_source_rgba(background_color || [0.12, 0.12, 0.14, 1.0]);
  ctx.fill();

  var ext = Math.max(0, (parseFloat(border_extension) || 0) * scaleRatio);
  var thick = Math.max(0.5, (parseFloat(border_thickness) || 1.0) * (is_preview ? Math.min(scaleRatio, 1.5) : 1.0));
  var inset = thick * 0.5;
  var rw = width - thick;
  var rh = height - thick;
  var ext = Math.max(0, (parseFloat(border_extension) || 0) * scaleRatio);

  ctx.set_line_width(thick);
  ctx.set_source_rgba(border_color || [0.42, 0.42, 0.48, 1.0]);

  // Top-Left Corner
  ctx.new_path();
  ctx.move_to(inset, inset + r + ext); 
  ctx.line_to(inset, inset + r);
  if (r > 0) ctx.arc(inset + r, inset + r, r, Math.PI, -Math.PI / 2); 
  else ctx.move_to(inset, inset);
  ctx.line_to(inset + r + ext, inset); 
  ctx.stroke();

  // Top-Right Corner
  ctx.new_path();
  ctx.move_to(inset + rw - r - ext, inset); 
  ctx.line_to(inset + rw - r, inset);
  if (r > 0) ctx.arc(inset + rw - r, inset + r, r, -Math.PI / 2, 0); 
  else ctx.move_to(inset + rw, inset);
  ctx.line_to(inset + rw, inset + r + ext); 
  ctx.stroke();

  // Bottom-Right Corner
  ctx.new_path();
  ctx.move_to(inset + rw, inset + rh - r - ext); 
  ctx.line_to(inset + rw, inset + rh - r);
  if (r > 0) ctx.arc(inset + rw - r, inset + rh - r, r, 0, Math.PI / 2); 
  else ctx.move_to(inset + rw, inset + rh);
  ctx.line_to(inset + rw - r - ext, inset + rh); 
  ctx.stroke();

  // Bottom-Left Corner
  ctx.new_path();
  ctx.move_to(inset + r + ext, inset + rh); 
  ctx.line_to(inset + r, inset + rh);
  if (r > 0) ctx.arc(inset + r, inset + rh - r, r, Math.PI / 2, Math.PI); 
  else ctx.move_to(inset, inset + rh);
  ctx.line_to(inset, inset + rh - r - ext); 
  ctx.stroke();

  if (mode === 0) {
    ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.7);
    ctx.set_line_width(2.0);
    var midX = width * 0.5;
    var tickLen = is_preview ? 6.0 : 2.0;
    ctx.move_to(midX, 0); ctx.line_to(midX, tickLen);
    ctx.move_to(midX, height); ctx.line_to(midX, height - tickLen);
    ctx.stroke();
  }

  ctx.set_font_size(curFontSize);
  var fe = ctx.font_extents();
  var ascent = fe && fe[0] ? fe[0] : curFontSize;
  var baselineY = height * 0.5 + ascent * 0.33;

  var curVal = typeof val === "number" && !isNaN(val) ? val : 0.0;
  var decCount = Math.max(0, Math.min(8, parseInt(decimal_digits, 10) || 0));
  var intCount = Math.max(1, Math.min(12, parseInt(integer_digits, 10) || 4));
  var display_str = Math.abs(curVal).toFixed(decCount);
  var parts = display_str.split(".");
  var intStr = parts[0];
  if (leading_zeros) while (intStr.length < intCount) intStr = "0" + intStr;

  var tokens = [];
  if (curVal < 0) tokens.push({ char: "-", col: textcolor, step: 0 });
  for (var i = 0; i < intStr.length; i++) {
    tokens.push({
      char: intStr[i],
      col: textcolor,
      step: Math.pow(10, intStr.length - i - 1),
    });
  }
  if (decCount > 0 && parts[1]) {
    tokens.push({ char: ".", col: textcolor, step: 0 });
    for (var j = 0; j < parts[1].length; j++) {
      tokens.push({
        char: parts[1][j],
        col: decimal_color,
        step: Math.pow(10, -(j + 1)),
      });
    }
  }

  // Configurable 5% - 35% Digit Spacing
  var gap = curFontSize * number_spacing;
  var totalW = 0;
  for (var k = 0; k < tokens.length; k++) {
    totalW += ctx.text_measure(tokens[k].char) ? ctx.text_measure(tokens[k].char)[0] : curFontSize * 0.6;
  }
  totalW += gap * (tokens.length - 1);

  var isLeftTag  = (name_tag_on && tagStr.length > 0 && tag_position === 2);
  var isRightTag = (name_tag_on && tagStr.length > 0 && tag_position === 3);

  var groupW = totalW;
  if (isLeftTag || isRightTag) {
    groupW = totalW + scaledTagGap + tagW;
  }

  // Chained Layout Engine: Tag moves & Numbers follow consistently
  var baseStartX = Math.max(8, (width - groupW) * 0.5);
  var curX = baseStartX;
  var tx = baseStartX;

  if (isLeftTag) {
    tx = baseStartX + name_tag_x;
    curX = tx + tagW + scaledTagGap;
  } else if (isRightTag) {
    curX = baseStartX + name_tag_x;
    tx = curX + totalW + scaledTagGap;
  } else if (tag_position === 0 && !is_preview) {
    tx = (width - tagW) * 0.5 + name_tag_x;
    curX = (width - totalW) * 0.5;
  } else if (tag_position === 1 && !is_preview) {
    tx = (width - tagW) * 0.5 + name_tag_x;
    curX = (width - totalW) * 0.5;
  } else {
    curX = (width - totalW) * 0.5;
  }

  if (!is_preview) {
    cached_nX = curX;
    cached_nW = curX + totalW;
  }

  var tempCols = [];
  for (var t = 0; t < tokens.length; t++) {
    var tmC = ctx.text_measure(tokens[t].char);
    var tw = tmC ? tmC[0] : curFontSize * 0.6;
    ctx.move_to(curX, baselineY);
    ctx.set_source_rgba(tokens[t].col);
    ctx.show_text(tokens[t].char);
    if (tokens[t].step > 0) {
      tempCols.push({ x: curX, w: tw, step: tokens[t].step });
    }
    curX += tw + gap;
  }

  if (!is_preview) digit_columns = tempCols;
  else preview_digit_columns = tempCols;

  var aIdx = is_preview ? active_pop_col : active_col;
  var colArr = is_preview ? preview_digit_columns : digit_columns;
  if (aIdx >= 0 && colArr[aIdx]) {
    ctx.set_source_rgba(highlight_color);
    ctx.rectangle(colArr[aIdx].x, baselineY + Math.round(4 * scaleRatio), colArr[aIdx].w, Math.max(2, Math.round(2 * scaleRatio)));
    ctx.fill();
  }

  if (name_tag_on && tagStr.length > 0) {
    ctx.set_font_size(tagSize);
    ctx.set_source_rgba(mode_color);
    var ty = baselineY;
    if (tag_position === 0 && !is_preview) ty = tagSize + name_tag_y;
    else if (tag_position === 1 && !is_preview) ty = height - 4 + name_tag_y;
    else ty = baselineY + name_tag_y;

    ctx.move_to(tx, ty);
    ctx.show_text(tagStr);
  }

  if (!is_preview && allow_popup) {
    var dotR = Math.max(1.5, Math.min(2.8, Math.min(width, height) * 0.08));
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(width, height) * 0.15));
    ctx.set_source_rgba(popup_dot_color);
    ctx.new_path();
    ctx.arc(width - dotMargin, dotMargin, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paint() {
  try {
    var w = 150, h = 40;
    if (mgraphics.size && mgraphics.size[0] && mgraphics.size[1]) {
      w = mgraphics.size[0];
      h = mgraphics.size[1];
    } else if (this.box && this.box.rect) {
      w = this.box.rect[2] - this.box.rect[0];
      h = this.box.rect[3] - this.box.rect[1];
    }
    draw_ticker_full(mgraphics, w, h, false);
  } catch (e) {
    post("paint error: " + e.message + "\n");
  }
}

// =============================================================
// 6. POPUP SETTINGS (50/50 ATTRUI DIVISION - 5 TIERS)
// =============================================================
function get_hit_col_preview(mx) {
  var offset = 12;
  var localX = mx - offset;
  for (var i = 0; i < preview_digit_columns.length; i++) {
    if (
      localX >= preview_digit_columns[i].x - 4 &&
      localX <= preview_digit_columns[i].x + preview_digit_columns[i].w + 4
    ) {
      return i;
    }
  }
  return -1;
}

function get_visible_rows() {
  if (!show_settings_attrs) return [];
  var rows = [];

  if (mask_performance === 1) {
    rows.push({ name: "Value", val: val.toFixed(decimal_digits), is_touch_trigger: true, target_id: 100 });
    rows.push({ name: "Mode", val: mode === 0 ? "Touch" : "Mouse", is_toggle: true, target_id: 9 });
    rows.push({ name: "Touch UI", val: touch_type === 0 ? "Sliders" : "Pad", is_toggle: true, target_id: 11 });
    rows.push({ name: "Step Size", val: step_size.toFixed(2), pct: Math.min(1.0, step_size / 10.0), is_slider: true, target_id: 10 });
    rows.push({ name: "Hold Speed", val: hold_speed.toFixed(0) + "ms", pct: Math.min(1.0, hold_speed / 200.0), is_slider: true, target_id: 12 });
  }

  if (mask_labels === 1) {
    rows.push({ name: "Tag Visible", val: name_tag_on ? "ON" : "OFF", is_toggle: true, target_id: 5 });
    rows.push({ name: "Tag Position", val: ["Top", "Bottom", "Left", "Right"][tag_position], is_toggle: true, target_id: 6 });
    rows.push({ name: "Tag Gap", val: tag_gap.toFixed(0) + "px", pct: Math.min(1.0, tag_gap / 40.0), is_slider: true, target_id: 17 });
    rows.push({ name: "Prefix Style", val: label_mode_names[label_mode], is_toggle: true, target_id: 13 });
    rows.push({ name: "Prefix Case", val: case_mode_names[case_mode], is_toggle: true, target_id: 14 });
  }

  if (mask_geometry === 1) {
    rows.push({ name: "Num Spacing", val: Math.round(number_spacing * 100) + "%", pct: Math.min(1.0, Math.max(0.0, (number_spacing - 0.05) / 0.30)), is_slider: true, target_id: 16 });
    rows.push({ name: "Font Size", val: text_size, pct: Math.min(1.0, Math.max(0.0, (text_size - 6) / 18)), is_slider: true, target_id: 15 });
    rows.push({ name: "Int Digits", val: integer_digits, pct: (integer_digits - 1) / 11, is_slider: true, target_id: 1 });
    rows.push({ name: "Dec Digits", val: decimal_digits, pct: decimal_digits / 8, is_slider: true, target_id: 2 });
    rows.push({ name: "Leading Zeros", val: leading_zeros ? "ON" : "OFF", is_toggle: true, target_id: 3 });
    rows.push({ name: "Radius", val: border_radius.toFixed(1), pct: border_radius / 25.0, is_slider: true, target_id: 4 });
    rows.push({ name: "Thickness", val: border_thickness.toFixed(1), pct: border_thickness / 10.0, is_slider: true, target_id: 7 });
    rows.push({ name: "Extensions", val: border_extension.toFixed(1), pct: border_extension / 50.0, is_slider: true, target_id: 8 });
  }

  if (mask_colors === 1) {
    rows.push({ name: "Mode Color", val: mode_color, is_color: true, col: mode_color, key: "mode_color" });
    rows.push({ name: "BG Color", val: background_color, is_color: true, col: background_color, key: "background_color" });
    rows.push({ name: "Border Color", val: border_color, is_color: true, col: border_color, key: "border_color" });
    rows.push({ name: "Text Color", val: textcolor, is_color: true, col: textcolor, key: "textcolor" });
    rows.push({ name: "Popup Dot", val: popup_dot_color, is_color: true, col: popup_dot_color, key: "popup_dot_color" });
    rows.push({ name: "Decimal Col", val: decimal_color, is_color: true, col: decimal_color, key: "decimal_color" });
    rows.push({ name: "Highlight", val: highlight_color, is_color: true, col: highlight_color, key: "highlight_color" });
  }

  if (mask_popup_colors === 1) {
    rows.push({ name: "Popup BG", val: pop_bgcolor, is_color: true, col: pop_bgcolor, key: "pop_bgcolor" });
    rows.push({ name: "Attr BG", val: attr_bg_color, is_color: true, col: attr_bg_color, key: "attr_bg_color" });
    rows.push({ name: "Attr Border", val: attr_border_color, is_color: true, col: attr_border_color, key: "attr_border_color" });
    rows.push({ name: "Attr Slider", val: attr_slider_color, is_color: true, col: attr_slider_color, key: "attr_slider_color" });
    rows.push({ name: "Attr Text", val: attr_text_color, is_color: true, col: attr_text_color, key: "attr_text_color" });
  }

  return rows;
}

function get_popup_dimensions() {
  var rows = get_visible_rows();
  if (!show_settings_attrs || rows.length === 0) {
    return { w: popup_mini_w, h: popup_mini_h };
  }
  var calculated_h = 28 + 42 + 12 + rows.length * 28 + 14;
  return { w: popup_window_width, h: calculated_h };
}

function update_popup_dimensions() {
  var dims = get_popup_dimensions();
  popupWindow.size = [dims.w, dims.h];
  popupWindow.title = "Touch Numticker Settings";
  draw_popup_to_window();
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
  var dims = get_popup_dimensions();
  var w = dims.w, h = dims.h;
  var rows = get_visible_rows();
  var has_rows = rows.length > 0;

  outMatrix = recycleMatrix(outMatrix, w, h);

  var pCtx = new MGraphics(w, h);
  pCtx.set_source_rgba(pop_bgcolor);
  pCtx.rectangle(0, 0, w, h);
  pCtx.fill();

  // Close Dot & Label
  pCtx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  pCtx.arc(14, 14, 5.5, 0, Math.PI * 2);
  pCtx.fill();

  pCtx.select_font_face("Arial", "normal", "normal");
  pCtx.set_font_size(9);
  pCtx.set_source_rgba(textcolor[0], textcolor[1], textcolor[2], 0.45);
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

  // FITTED TOP TICKER PREVIEW
  var prevX = 12, prevY = 28, prevW = w - 24;
  var prevH = has_rows ? 42 : (h - prevY - 10);
  pCtx.save();
  pCtx.translate(prevX, prevY);
  draw_ticker_full(pCtx, prevW, prevH, true);
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

    pCtx.select_font_face(clean_font_name(font), font_slant, font_weight);

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

      // Right 50%: Value / Slider / Swatch
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
// 7. MODERN HSV COLOR PICKER
// =============================================================
var picker_drag_zone = 0;
var cur_h = 0.15, cur_s = 0.85, cur_v = 0.85, cur_a = 1.0;

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
  var r, g, b, i = Math.floor(h * 6), f = h * 6 - i;
  var p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break; case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break; case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break; case 5: r = v; g = p; b = q; break;
  }
  return [r, g, b];
}

function openColorPicker(targetKey, anchorX, anchorY) {
  active_color_target = targetKey;
  var col = get_color_target(targetKey);
  if (!col) col = [1, 1, 1, 1];
  var hsv = rgbToHsv(col[0], col[1], col[2]);
  cur_h = hsv[0]; cur_s = hsv[1]; cur_v = hsv[2]; cur_a = (col[3] !== undefined ? col[3] : 1.0);

  var scrW = 1920, scrH = 1080;
  try { if (max && max.screensize) { scrW = max.screensize[0]; scrH = max.screensize[1]; } } catch(e) {}

  var posX = anchorX + 10;
  var posY = anchorY - 30;
  if (posX + 200 > scrW - 20) posX = anchorX - 210;
  if (posY + 240 > scrH - 40) posY = scrH - 240 - 40;
  posX = Math.max(10, posX);
  posY = Math.max(30, posY);

  colorWindow.title = "Color: " + targetKey;
  colorWindow.pos = [Math.round(posX), Math.round(posY)];
  colorWindow.visible = 1;
  colorWindow.front();
  draw_color_picker();
}

function applyPickerColor() {
  var rgb = hsvToRgb(cur_h, cur_s, cur_v);
  var rgba = [rgb[0], rgb[1], rgb[2], cur_a];

  if (active_color_target === "background_color") background_color = rgba;
  else if (active_color_target === "border_color") border_color = rgba;
  else if (active_color_target === "textcolor") textcolor = rgba;
  else if (active_color_target === "highlight_color") highlight_color = rgba;
  else if (active_color_target === "popup_dot_color") popup_dot_color = rgba;
  else if (active_color_target === "decimal_color") decimal_color = rgba;
  else if (active_color_target === "mode_color") { mode_color = rgba; tag_color = rgba; }
  else if (active_color_target === "pop_bgcolor") pop_bgcolor = rgba;
  else if (active_color_target === "attr_bg_color") attr_bg_color = rgba;
  else if (active_color_target === "attr_border_color") attr_border_color = rgba;
  else if (active_color_target === "attr_slider_color") attr_slider_color = rgba;
  else if (active_color_target === "attr_text_color") attr_text_color = rgba;

  redraw_all();
}

function draw_color_picker() {
  var w = 200, h = 240;
  colorMatrix = recycleMatrix(colorMatrix, w, h);
  var ctx = new MGraphics(w, h);

  ctx.set_source_rgba(pop_bgcolor);
  ctx.rectangle(0, 0, w, h);
  ctx.fill();

  ctx.set_source_rgba(0.85, 0.2, 0.2, 1.0);
  ctx.arc(14, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.select_font_face("Arial", "normal", "bold");
  ctx.set_font_size(9);
  ctx.set_source_rgba(textcolor);
  ctx.move_to(26, 17);
  ctx.show_text(active_color_target);

  var hx = 10, hy = 28, hw = 180, hh = 14;
  var hPat = ctx.pattern_create_linear(hx, 0, hx + hw, 0);
  hPat.add_color_stop_rgba(0.0, 1,0,0,1); hPat.add_color_stop_rgba(0.17, 1,1,0,1);
  hPat.add_color_stop_rgba(0.33, 0,1,0,1); hPat.add_color_stop_rgba(0.5, 0,1,1,1);
  hPat.add_color_stop_rgba(0.67, 0,0,1,1); hPat.add_color_stop_rgba(0.83, 1,0,1,1);
  hPat.add_color_stop_rgba(1.0, 1,0,0,1);
  ctx.set_source(hPat);
  ctx.rectangle_rounded(hx, hy, hw, hh, 2, 2);
  ctx.fill();

  ctx.set_source_rgba(1, 1, 1, 1);
  ctx.set_line_width(1.5);
  ctx.arc(hx + cur_h * hw, hy + hh * 0.5, 4, 0, Math.PI * 2);
  ctx.stroke();

  var sx = 10, sy = 48, sw = 180, sh = 115;
  var baseRGB = hsvToRgb(cur_h, 1.0, 1.0);
  ctx.set_source_rgba(baseRGB[0], baseRGB[1], baseRGB[2], 1.0);
  ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
  ctx.fill();

  var sPat = ctx.pattern_create_linear(sx, 0, sx + sw, 0);
  sPat.add_color_stop_rgba(0.0, 1,1,1,1); sPat.add_color_stop_rgba(1.0, 1,1,1,0);
  ctx.set_source(sPat);
  ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
  ctx.fill();

  var vPat = ctx.pattern_create_linear(0, sy, 0, sy + sh);
  vPat.add_color_stop_rgba(0.0, 0,0,0,0); vPat.add_color_stop_rgba(1.0, 0,0,0,1);
  ctx.set_source(vPat);
  ctx.rectangle_rounded(sx, sy, sw, sh, 2, 2);
  ctx.fill();

  ctx.set_source_rgba(cur_v > 0.4 ? [0,0,0,0.9] : [1,1,1,0.9]);
  ctx.arc(sx + cur_s * sw, sy + (1.0 - cur_v) * sh, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  var ax = 10, ay = 170, aw = 180, ah = 14;
  var curRGB = hsvToRgb(cur_h, cur_s, cur_v);
  var aPat = ctx.pattern_create_linear(ax, 0, ax + aw, 0);
  aPat.add_color_stop_rgba(0.0, curRGB[0], curRGB[1], curRGB[2], 0.0);
  aPat.add_color_stop_rgba(1.0, curRGB[0], curRGB[1], curRGB[2], 1.0);
  ctx.set_source(aPat);
  ctx.rectangle_rounded(ax, ay, aw, ah, 2, 2);
  ctx.fill();

  ctx.set_source_rgba(1, 1, 1, 1);
  ctx.arc(ax + cur_a * aw, ay + ah * 0.5, 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.set_source_rgba(curRGB[0], curRGB[1], curRGB[2], cur_a);
  ctx.rectangle_rounded(10, 192, 180, 36, 3, 3);
  ctx.fill();

  var img = new Image(ctx);
  img.tonamedmatrix(colorMatrix.name);
  colorWindow.jit_matrix(colorMatrix.name);
}

// =============================================================
// 8. TOUCH PAD & TOUCH SLIDERS
// =============================================================
function get_digit_array() {
  var abs_val = Math.abs(val);
  var fixed = abs_val.toFixed(decimal_digits);
  var parts = fixed.split(".");
  var intPart = parts[0];
  while (intPart.length < integer_digits) intPart = "0" + intPart;
  var arr = [];
  for (var i = 0; i < intPart.length; i++) arr.push(parseInt(intPart[i], 10));
  var decPart = parts[1] || "";
  for (var j = 0; j < decPart.length; j++) arr.push(parseInt(decPart[j], 10));
  return arr;
}

function set_val_from_digits(arr, sign) {
  var totalInt = 0;
  for (var i = 0; i < arr.length; i++) totalInt = totalInt * 10 + arr[i];
  val = (totalInt / Math.pow(10, decimal_digits)) * sign;
  clampValue();
  outlet(0, val);
  redraw_all();
}

function open_touch_window() {
  if (showSettings) {
    var p = popupWindow.pos;
    touchWindow.pos = [p[0] + popup_window_width + 10, p[1]];
  }
  touch_pad_buffer = "";
  showTouch = 1;
  touchWindow.visible = 1;
  draw_touch_ui();
}

function draw_touch_ui() {
  if (touch_type === 1) draw_touch_pad();
  else draw_touch_sliders();
}

function draw_touch_sliders() {
  var digits = get_digit_array();
  var count = digits.length;
  var winW = Math.max(150, count * 45 + 80);

  if (touchMatrix.dim[0] !== winW || touchMatrix.dim[1] !== 250) {
    touchWindow.size = [winW, 250];
    touchMatrix.dim = [winW, 250];
  }

  var tCtx = new MGraphics(winW, 250);
  tCtx.set_source_rgba(pop_bgcolor);
  tCtx.rectangle(0, 0, winW, 250);
  tCtx.fill();

  tCtx.set_source_rgba(0.8, 0.2, 0.2, 1);
  tCtx.arc(20, 20, 10, 0, Math.PI * 2);
  tCtx.fill();

  tCtx.set_source_rgba(attr_slider_color);
  tCtx.arc(50, 20, 12, 0, Math.PI * 2);
  tCtx.fill();

  tCtx.set_source_rgba(1, 1, 1, 1);
  tCtx.set_font_size(14);
  tCtx.move_to(44, 25);
  tCtx.show_text(val < 0 ? "-" : "+");

  for (var i = 0; i < count; i++) {
    var x = 40 + i * 45;
    tCtx.set_source_rgba(0, 0, 0, 0.5);
    tCtx.rectangle(x, 50, 30, 150);
    tCtx.fill();
    tCtx.set_source_rgba(attr_slider_color);
    var fillH = (digits[i] / 9) * 150;
    tCtx.rectangle(x, 200, 30, -Math.max(0, fillH));
    tCtx.fill();
    tCtx.set_source_rgba(1, 1, 1, 1);
    tCtx.set_font_size(12);
    tCtx.move_to(x + 10, 220);
    tCtx.show_text(String(digits[i]));
  }
  var img = new Image(tCtx);
  img.tonamedmatrix(touchMatrix.name);
  touchWindow.jit_matrix(touchMatrix.name);
}

function draw_touch_pad() {
  var winW = 270, winH = 330;
  if (touchMatrix.dim[0] !== winW || touchMatrix.dim[1] !== winH) {
    touchWindow.size = [winW, winH];
    touchMatrix.dim = [winW, winH];
  }

  var tCtx = new MGraphics(winW, winH);
  tCtx.set_source_rgba(pop_bgcolor);
  tCtx.rectangle(0, 0, winW, winH);
  tCtx.fill();

  tCtx.select_font_face(clean_font_name(font), font_slant, font_weight);

  tCtx.set_source_rgba(0.8, 0.2, 0.2, 1.0);
  tCtx.arc(22, 28, 9, 0, Math.PI * 2);
  tCtx.fill();

  tCtx.set_source_rgba(0.05, 0.05, 0.05, 1.0);
  tCtx.rectangle(40, 10, 218, 38);
  tCtx.fill();
  tCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.6);
  tCtx.set_line_width(1);
  tCtx.rectangle(40, 10, 218, 38);
  tCtx.stroke();

  var disp = touch_pad_buffer || (val < 0 ? "-" : "") + Math.abs(val).toFixed(decimal_digits);
  tCtx.set_source_rgba(0.95, 0.98, 0.5, 1.0);
  tCtx.set_font_size(20);
  var tmDisp = tCtx.text_measure(disp);
  var dW = tmDisp ? tmDisp[0] : 80;
  var textX = 250 - dW;
  if (textX < 46) textX = 46;

  tCtx.move_to(textX, 36);
  tCtx.show_text(disp);

  var colW = 56, rowH = 58, gapX = 7, gapY = 8, startX = 12, startY = 58;
  var grid = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["±", "0", "."],
  ];

  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 3; c++) {
      var kx = startX + c * (colW + gapX);
      var ky = startY + r * (rowH + gapY);
      tCtx.set_source_rgba(attr_bg_color);
      tCtx.rectangle(kx, ky, colW, rowH);
      tCtx.fill();
      tCtx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.3);
      tCtx.set_line_width(1);
      tCtx.rectangle(kx, ky, colW, rowH);
      tCtx.stroke();

      tCtx.set_source_rgba(1, 1, 1, 1);
      tCtx.set_font_size(r === 3 && c === 0 ? 18 : 20);
      var lbl = grid[r][c];
      var tmLbl = tCtx.text_measure(lbl);
      var lw = tmLbl ? tmLbl[0] : 12;
      tCtx.move_to(kx + (colW - lw) * 0.5, ky + rowH * 0.5 + 7);
      tCtx.show_text(lbl);
    }
  }

  var cmdX = startX + 3 * (colW + gapX);

  var backY = startY;
  tCtx.set_source_rgba(0.35, 0.25, 0.25, 1.0);
  tCtx.rectangle(cmdX, backY, colW, rowH);
  tCtx.fill();
  tCtx.set_source_rgba(1, 0.7, 0.7, 1.0);
  tCtx.set_font_size(18);
  var tmB = tCtx.text_measure("⌫");
  var bw = tmB ? tmB[0] : 14;
  tCtx.move_to(cmdX + (colW - bw) * 0.5, backY + rowH * 0.5 + 6);
  tCtx.show_text("⌫");

  var clrY = startY + (rowH + gapY);
  tCtx.set_source_rgba(0.28, 0.28, 0.32, 1.0);
  tCtx.rectangle(cmdX, clrY, colW, rowH);
  tCtx.fill();
  tCtx.set_source_rgba(0.8, 0.8, 0.9, 1.0);
  tCtx.set_font_size(14);
  var tmC = tCtx.text_measure("CLR");
  var cw = tmC ? tmC[0] : 24;
  tCtx.move_to(cmdX + (colW - cw) * 0.5, clrY + rowH * 0.5 + 5);
  tCtx.show_text("CLR");

  var entY = startY + 2 * (rowH + gapY);
  var entH = rowH * 2 + gapY;
  tCtx.set_source_rgba(0.18, 0.52, 0.3, 1.0);
  tCtx.rectangle(cmdX, entY, colW, entH);
  tCtx.fill();
  tCtx.set_source_rgba(1, 1, 1, 1);
  tCtx.set_font_size(15);
  var tmE = tCtx.text_measure("ENT");
  var ew = tmE ? tmE[0] : 24;
  tCtx.move_to(cmdX + (colW - ew) * 0.5, entY + entH * 0.5 + 5);
  tCtx.show_text("ENT");

  var img = new Image(tCtx);
  img.tonamedmatrix(touchMatrix.name);
  touchWindow.jit_matrix(touchMatrix.name);
}

// =============================================================
// 9. EVENT LISTENERS
// =============================================================
function get_color_target(name) {
  if (name === "background_color") return background_color;
  if (name === "border_color") return border_color;
  if (name === "textcolor") return textcolor;
  if (name === "highlight_color") return highlight_color;
  if (name === "popup_dot_color") return popup_dot_color;
  if (name === "decimal_color") return decimal_color;
  if (name === "mode_color") return mode_color;
  if (name === "pop_bgcolor") return pop_bgcolor;
  if (name === "attr_bg_color") return attr_bg_color;
  if (name === "attr_border_color") return attr_border_color;
  if (name === "attr_slider_color") return attr_slider_color;
  if (name === "attr_text_color") return attr_text_color;
  return null;
}

var colorListener = new JitterListener(colorWindow.name, function(e) {
  if (e.eventname === "close") { colorWindow.visible = 0; picker_drag_zone = 0; return; }
  if (e.eventname === "mouse") {
    var a = arrayfromargs(e.args), mx = a[0], my = a[1], but = a[2];
    if (!but) { picker_drag_zone = 0; return; }
    if (mx < 22 && my < 22) { colorWindow.visible = 0; return; }

    if (picker_drag_zone === 0) {
      if (my >= 26 && my <= 44) picker_drag_zone = 1;
      else if (my >= 48 && my <= 165) picker_drag_zone = 2;
      else if (my >= 168 && my <= 186) picker_drag_zone = 3;
    }

    if (picker_drag_zone === 1) cur_h = Math.max(0, Math.min(1, (mx - 10) / 180));
    else if (picker_drag_zone === 2) {
      cur_s = Math.max(0, Math.min(1, (mx - 10) / 180));
      cur_v = Math.max(0, Math.min(1, 1.0 - (my - 48) / 117));
    } else if (picker_drag_zone === 3) cur_a = Math.max(0, Math.min(1, (mx - 10) / 180));

    applyPickerColor();
    draw_color_picker();
  }
});

var touchListener = new JitterListener(touchWindow.name, function(event) {
  if (event.eventname === "close") { showTouch = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_tap = mbut === 1 && touch_mouse_down === 0;
    touch_mouse_down = mbut;

    if (mbut && mx < 35 && my < 45) {
      showTouch = 0; touchWindow.visible = 0; return;
    }
    if (!mbut) return;

    if (touch_type === 0) {
      var distSign = Math.sqrt((mx - 50) * (mx - 50) + (my - 20) * (my - 20));
      if (distSign <= 14) {
        if (is_tap) {
          val = -val; clampValue(); outlet(0, val); redraw_all();
        }
        return;
      }
      var col = Math.floor((mx - 40) / 45);
      var digits = get_digit_array();
      if (col >= 0 && col < digits.length && my >= 45 && my <= 210) {
        var v = Math.round(Math.max(0, Math.min(9, ((200 - my) / 150) * 9)));
        digits[col] = v;
        set_val_from_digits(digits, val < 0 ? -1 : 1);
      }
      return;
    }

    if (!is_tap) return;

    var colW = 56, rowH = 58, gapX = 7, gapY = 8, startX = 12, startY = 58;
    var cmdX = startX + 3 * (colW + gapX);

    if (mx >= cmdX && mx <= cmdX + colW) {
      if (my >= startY && my <= startY + rowH) {
        if (!touch_pad_buffer) {
          touch_pad_buffer = (val < 0 ? "-" : "") + Math.abs(val).toFixed(decimal_digits);
        }
        if (touch_pad_buffer.length > 0) {
          touch_pad_buffer = touch_pad_buffer.slice(0, -1);
          if (touch_pad_buffer === "" || touch_pad_buffer === "-") touch_pad_buffer = "0";
          draw_touch_ui();
        }
        return;
      }
      if (my >= startY + rowH + gapY && my <= startY + 2 * rowH + gapY) {
        touch_pad_buffer = "0"; draw_touch_ui(); return;
      }
      if (my >= startY + 2 * (rowH + gapY) && my <= startY + 4 * rowH + 3 * gapY) {
        if (touch_pad_buffer !== "" && touch_pad_buffer !== "-") {
          var p = parseFloat(touch_pad_buffer);
          if (!isNaN(p)) { val = p; clampValue(); outlet(0, val); }
        }
        touch_pad_buffer = ""; redraw_all(); return;
      }
    }

    var c = Math.floor((mx - startX) / (colW + gapX));
    var r = Math.floor((my - startY) / (rowH + gapY));
    if (c >= 0 && c < 3 && r >= 0 && r < 4) {
      var grid = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["±", "0", "."],
      ];
      var k = grid[r][c];

      if (k === "±") {
        if (!touch_pad_buffer) touch_pad_buffer = (val < 0 ? "" : "-") + Math.abs(val);
        else if (touch_pad_buffer === "0") touch_pad_buffer = "0";
        else if (touch_pad_buffer.charAt(0) === "-") touch_pad_buffer = touch_pad_buffer.slice(1);
        else touch_pad_buffer = "-" + touch_pad_buffer;
        draw_touch_ui();
        return;
      }
      if (k === "." && touch_pad_buffer.indexOf(".") !== -1) return;
      var max_digits = integer_digits + decimal_digits + 1;
      if (touch_pad_buffer.replace(/[-.]/g, "").length >= max_digits) return;
      if (touch_pad_buffer === "0" && k !== ".") touch_pad_buffer = k;
      else touch_pad_buffer += k;
      draw_touch_ui();
    }
  }
});

var windowListener = new JitterListener(popupWindow.name, function(event) {
  if (event.eventname === "close") { showSettings = 0; is_resizing_window = 0; return; }
  if (event.eventname === "mouse") {
    var args = arrayfromargs(event.args);
    var mx = args[0], my = args[1], mbut = args[2];
    var is_pop_tap = mbut === 1 && pop_mouse_down === 0;
    pop_mouse_down = mbut;
    var dims = get_popup_dimensions();
    var w = dims.w, h = dims.h;
    var rows = get_visible_rows();
    var has_rows = rows.length > 0;

    if (mbut === 0) {
      is_resizing_window = 0;
      cancel_hold(); active_pop_target = -1; active_pop_col = -1; active_pop_slider = -1; return;
    }

    if (is_resizing_window && !has_rows) {
      var deltaW = mx - start_click_x;
      var deltaH = my - start_click_y;
      popup_mini_w = Math.max(260, Math.min(start_resize_w + deltaW, 420));
      popup_mini_h = Math.max(85, Math.min(start_resize_h + deltaH, 150));
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

    if (mbut && mx < 35 && my < 26) {
      cancel_hold(); showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0; touchWindow.visible = 0;
      mgraphics.redraw(); return;
    }

    var tglW = 44, tglH = 16, tglX = w - tglW - 12, tglY = 6;
    if (is_pop_tap && mx >= tglX && mx <= tglX + tglW && my >= tglY && my <= tglY + tglH) {
      show_settings_attrs = show_settings_attrs ? 0 : 1;
      update_popup_dimensions(); return;
    }

    var prevMaxY = has_rows ? 70 : (h - 10);
    if (mbut && my >= 28 && my <= prevMaxY) {
      var localX = mx - 12;
      if (localX >= 0 && localX <= w - 24) {
        if (mode === 1) {
          cancel_hold(); open_touch_window(); return;
        }

        if (is_pop_tap) {
          cancel_hold(); mouse_is_down = 1;
          pop_click_start_x = mx; pop_click_start_y = my; lastPopY = my; active_pop_col = -1;
          hold_dir = (localX >= (w - 24) * 0.5) ? 1 : -1;
          val += hold_dir * step_size; clampValue(); outlet(0, val); redraw_all();

          if (!hold_task) hold_task = new Task(hold_task_fn, this);
          hold_task.interval = 350;
          hold_task.repeat();
          return;
        }

        if (active_pop_col === -1 && (Math.abs(mx - pop_click_start_x) > 3 || Math.abs(my - pop_click_start_y) > 3)) {
          cancel_hold(); active_pop_col = get_hit_col_preview(pop_click_start_x);
        }

        if (active_pop_col !== -1 && mode === 0 && preview_digit_columns[active_pop_col]) {
          var dy = lastPopY - my;
          val += dy * 0.8 * speed_control * preview_digit_columns[active_pop_col].step;
          clampValue(); outlet(0, val); lastPopY = my; redraw_all();
        }
      }
      return;
    }

    if (!has_rows) return;

    var sY = 28 + 42 + 16;
    var rowW = w - 24;
    var midX = 12 + rowW * 0.5;
    var valBoxX = midX + 4;
    var valBoxW = rowW * 0.5 - 8;

    if (active_pop_slider !== -1 && active_pop_slider < rows.length) {
      var rAct = rows[active_pop_slider];
      var pctDrag = Math.max(0.0, Math.min(1.0, (mx - valBoxX) / valBoxW));
      if (rAct.target_id === 10) set_step_size(pctDrag * 10.0);
      else if (rAct.target_id === 12) set_hold_speed(Math.max(10, Math.round(pctDrag * 200)));
      else if (rAct.target_id === 15) set_text_size(Math.round(6 + pctDrag * 18));
      else if (rAct.target_id === 1) set_integer_digits(Math.round(1 + pctDrag * 11));
      else if (rAct.target_id === 2) set_decimal_digits(Math.round(pctDrag * 8));
      else if (rAct.target_id === 4) set_border_radius(pctDrag * 25);
      else if (rAct.target_id === 7) set_border_thickness(pctDrag * 10);
      else if (rAct.target_id === 8) set_border_extension(pctDrag * 50);
      else if (rAct.target_id === 16) set_number_spacing(0.05 + pctDrag * 0.30);
      else if (rAct.target_id === 17) set_tag_gap(pctDrag * 40.0);
      draw_popup_to_window();
      return;
    }

    var rIdx = Math.floor((my - sY) / 28);
    if (rIdx >= 0 && rIdx < rows.length) {
      cancel_hold();
      var r = rows[rIdx];
      var pct = Math.max(0, Math.min(1, (mx - valBoxX) / valBoxW));

      if (r.is_slider || r.pct !== undefined) {
        active_pop_slider = rIdx;
        if (r.target_id === 10) set_step_size(pct * 10.0);
        else if (r.target_id === 12) set_hold_speed(Math.max(10, Math.round(pct * 200)));
        else if (r.target_id === 15) set_text_size(Math.round(6 + pct * 18));
        else if (r.target_id === 1) set_integer_digits(Math.round(1 + pct * 11));
        else if (r.target_id === 2) set_decimal_digits(Math.round(pct * 8));
        else if (r.target_id === 4) set_border_radius(pct * 25);
        else if (r.target_id === 7) set_border_thickness(pct * 10);
        else if (r.target_id === 8) set_border_extension(pct * 50);
        else if (r.target_id === 16) set_number_spacing(0.05 + pct * 0.30);
        else if (r.target_id === 17) set_tag_gap(pct * 40.0);
      } else if (is_pop_tap) {
        if (r.target_id === 100) open_touch_window();
        else if (r.target_id === 9) set_mode(mode === 0 ? 1 : 0);
        else if (r.target_id === 11) set_touch_type(touch_type === 0 ? 1 : 0);
        else if (r.target_id === 3) set_leading_zeros(leading_zeros ? 0 : 1);
        else if (r.target_id === 5) set_name_tag_on(name_tag_on ? 0 : 1);
        else if (r.target_id === 6) set_tag_position((tag_position + 1) % 4);
        else if (r.target_id === 13) set_label_mode((label_mode + 1) % 5);
        else if (r.target_id === 14) set_case_mode((case_mode + 1) % 3);
        else if (r.is_color) {
          openColorPicker(r.key, popupWindow.pos[0] + 180, popupWindow.pos[1] + 32 + rIdx * 28 + 14);
        }
      }
      draw_popup_to_window();
    }
  }
});

// =============================================================
// 10. MAIN CANVAS MOUSE INTERACTION
// =============================================================
function onclick(x, y, but, cmd, shift, capslock, option, ctrl) {
  var width = 150, height = 40;
  if (mgraphics.size && mgraphics.size[0] && mgraphics.size[1]) {
    width = mgraphics.size[0]; height = mgraphics.size[1];
  } else if (this.box && this.box.rect) {
    width = this.box.rect[2] - this.box.rect[0]; height = this.box.rect[3] - this.box.rect[1];
  }

  if (allow_popup) {
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(width, height) * 0.15));
    var dotX = width - dotMargin;
    var dotY = dotMargin;
    var hitR = Math.max(4.0, Math.min(8.0, Math.min(width, height) * 0.20));
    var distToDot = Math.sqrt((x - dotX) * (x - dotX) + (y - dotY) * (y - dotY));
    var is_right_click = (ctrl === 1);

    if (distToDot <= hitR || is_right_click) {
      showSettings = showSettings ? 0 : 1;
      if (showSettings) {
        update_popup_dimensions();
        popupWindow.visible = 1;
        popupWindow.front();
      } else {
        popupWindow.visible = 0; colorWindow.visible = 0; touchWindow.visible = 0;
      }
      mgraphics.redraw();
      return;
    }
  }

  if (mode === 1) {
    open_touch_window(); return;
  }

  last_x = x; last_y = y; click_start_x = x; click_start_y = y; active_col = -1;

  cancel_hold();
  mouse_is_down = 1;
  hold_dir = (x >= cached_nX + (cached_nW - cached_nX) * 0.5) ? 1 : -1;
  val += hold_dir * step_size;
  clampValue();
  outlet(0, val);
  redraw_all();

  if (!hold_task) hold_task = new Task(hold_task_fn, this);
  hold_task.interval = 350;
  hold_task.repeat();
}

function ondrag(x, y, but, cmd, shift, capslock, option, ctrl) {
  if (mode === 1) return;
  if (!but) {
    cancel_hold(); active_col = -1; redraw_all(); return;
  }
  if (active_col === -1 && (Math.abs(x - click_start_x) > 3 || Math.abs(y - click_start_y) > 3)) {
    cancel_hold();
    for (var i = 0; i < digit_columns.length; i++) {
      if (click_start_x >= digit_columns[i].x - 4 && click_start_x <= digit_columns[i].x + digit_columns[i].w + 4) {
        active_col = i; break;
      }
    }
  }
  if (active_col === -1) return;
  var dy = last_y - y;
  val += dy * 0.8 * speed_control * digit_columns[active_col].step;
  clampValue();
  outlet(0, val);
  redraw_all();
  last_y = y;
}

function onidle(x, y) { if (mouse_is_down) onmouseup(); }
function onidleout(x, y) { if (mouse_is_down) onmouseup(); }
function onmouseup() { cancel_hold(); active_col = -1; redraw_all(); }

// =============================================================
// 11. GETTERS & SETTERS
// =============================================================

// =============================================================
// ROBUST PATTR HOOKS FOR NUMTICKER
// =============================================================
function getvalueof() {
  return val;
}

function output_val() {
  if (is_transmitting) return;
  is_transmitting = true;
  try {
    outlet(0, val);
  } finally {
    is_transmitting = false;
  }
}

function setvalueof() {
  if (is_transmitting) return; // <-- Loop guard
  var args = arrayfromargs(arguments);
  while (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  if (args.length === 0) return;
  msg_float(args[0]);
}

function bang() { output_val(); }

function msg_float(v) {
  if (is_transmitting) return;
  var nextVal = Number(v);
  if (!isNaN(nextVal)) {
    val = nextVal;
    clampValue();
    output_val();
    redraw_all();
  }
}
function msg_int(v) { msg_float(v); }
function set_val(v) { val = Number(v); clampValue(); redraw_all(); }
function set(v) { set_val(v); }

function get_number_spacing() { return number_spacing; }
function set_number_spacing(v) {
  number_spacing = Math.max(0.05, Math.min(0.35, parseFloat(v) || 0.10));
  redraw_all();
}

function get_tag_gap() { return tag_gap; }
function set_tag_gap(v) {
  tag_gap = Math.max(0.0, Math.min(50.0, parseFloat(v) || 10.0));
  redraw_all();
}

function get_allow_popup() { return allow_popup; }
function set_allow_popup(v) {
  allow_popup = parseInt(v, 10) ? 1 : 0;
  if (!allow_popup) {
    showSettings = 0; popupWindow.visible = 0; colorWindow.visible = 0; touchWindow.visible = 0;
  }
  redraw_all();
}

function get_mode() { return mode; }
function set_mode(v) { mode = parseInt(v, 10); cancel_hold(); redraw_all(); }

function get_touch_type() { return touch_type; }
function set_touch_type(v) { touch_type = parseInt(v, 10); redraw_all(); }

function get_step_size() { return step_size; }
function set_step_size(v) { step_size = parseFloat(v); redraw_all(); }

function get_hold_speed() { return hold_speed; }
function set_hold_speed(v) {
  hold_speed = Math.max(5.0, parseFloat(v) || 50.0);
  if (hold_task && hold_task.running && hold_count > 0) hold_task.interval = hold_speed;
}

function get_integer_digits() { return integer_digits; }
function set_integer_digits(v) { integer_digits = Math.max(1, Math.min(12, parseInt(v, 10))); clampValue(); redraw_all(); }

function get_decimal_digits() { return decimal_digits; }
function set_decimal_digits(v) { decimal_digits = Math.max(0, Math.min(8, parseInt(v, 10))); clampValue(); redraw_all(); }

function get_leading_zeros() { return leading_zeros; }
function set_leading_zeros(v) { leading_zeros = parseInt(v, 10) ? 1 : 0; redraw_all(); }

function get_name_tag_on() { return name_tag_on; }
function set_name_tag_on(v) { name_tag_on = parseInt(v, 10) ? 1 : 0; redraw_all(); }

function get_tag_position() { return tag_position; }
function set_tag_position(v) { tag_position = parseInt(v, 10); redraw_all(); }

function get_name_tag_text() { return name_tag_text; }
function set_name_tag_text(v) {
  name_tag_text = cleanQuotes(String(v));
  redraw_all();
}

function get_name_tag_x() { return name_tag_x; }
function set_name_tag_x(v) { name_tag_x = parseFloat(v); redraw_all(); }

function get_name_tag_y() { return name_tag_y; }
function set_name_tag_y(v) { name_tag_y = parseFloat(v); redraw_all(); }

function get_name_tag_text_size() { return name_tag_text_size; }
function set_name_tag_text_size(v) { name_tag_text_size = parseInt(v, 10); redraw_all(); }

function get_label_mode() { return label_mode; }
function set_label_mode(v) { label_mode = Math.max(0, Math.min(4, parseInt(v, 10))); redraw_all(); }

function get_case_mode() { return case_mode; }
function set_case_mode(v) { case_mode = Math.max(0, Math.min(2, parseInt(v, 10))); redraw_all(); }

function get_border_radius() { return border_radius; }
function set_border_radius(v) { border_radius = parseFloat(v); redraw_all(); }

function get_border_thickness() { return border_thickness; }
function set_border_thickness(v) { border_thickness = parseFloat(v); redraw_all(); }

function get_border_extension() { return border_extension; }
function set_border_extension(v) { border_extension = parseFloat(v); redraw_all(); }

function get_background_color() { return background_color; }
function set_background_color() { background_color = parseColorArgs(arguments, background_color); redraw_all(); }

function get_border_color() { return border_color; }
function set_border_color() { border_color = parseColorArgs(arguments, border_color); redraw_all(); }

function get_textcolor() { return textcolor; }
function set_textcolor() { textcolor = parseColorArgs(arguments, textcolor); redraw_all(); }

function get_highlight_color() { return highlight_color; }
function set_highlight_color() { highlight_color = parseColorArgs(arguments, highlight_color); redraw_all(); }

function get_popup_dot_color() { return popup_dot_color; }
function set_popup_dot_color() { popup_dot_color = parseColorArgs(arguments, popup_dot_color); redraw_all(); }
function set_dot_color() { set_popup_dot_color.apply(this, arguments); }
function get_dot_color() { return popup_dot_color; }

function get_decimal_color() { return decimal_color; }
function set_decimal_color() { decimal_color = parseColorArgs(arguments, decimal_color); redraw_all(); }

function get_mode_color() { return mode_color; }
function set_mode_color() {
  mode_color = parseColorArgs(arguments, mode_color);
  tag_color = mode_color;
  redraw_all();
}

function get_tag_color() { return mode_color; }
function set_tag_color() { set_mode_color.apply(this, arguments); }

function get_pop_bgcolor() { return pop_bgcolor; }
function set_pop_bgcolor(v) { pop_bgcolor = parseColorArgs(arguments, pop_bgcolor); redraw_all(); }

function get_attr_bg_color() { return attr_bg_color; }
function set_attr_bg_color() { attr_bg_color = parseColorArgs(arguments, attr_bg_color); redraw_all(); }

function get_attr_border_color() { return attr_border_color; }
function set_attr_border_color() { attr_border_color = parseColorArgs(arguments, attr_border_color); redraw_all(); }

function get_attr_slider_color() { return attr_slider_color; }
function set_attr_slider_color() { attr_slider_color = parseColorArgs(arguments, attr_slider_color); redraw_all(); }

function get_attr_text_color() { return attr_text_color; }
function set_attr_text_color() { attr_text_color = parseColorArgs(arguments, attr_text_color); redraw_all(); }

function get_font() { return font; }
function set_font() { var a = arrayfromargs(arguments); font = a.join(" "); redraw_all(); }

function get_text_size() { return text_size; }
function set_text_size(v) { text_size = Math.max(6, parseInt(v, 10)); redraw_all(); }

function get_mask_performance() { return mask_performance; }
function set_mask_performance(v) { mask_performance = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_labels() { return mask_labels; }
function set_mask_labels(v) { mask_labels = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_geometry() { return mask_geometry; }
function set_mask_geometry(v) { mask_geometry = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_colors() { return mask_colors; }
function set_mask_colors(v) { mask_colors = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_mask_popup_colors() { return mask_popup_colors; }
function set_mask_popup_colors(v) { mask_popup_colors = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function get_show_settings_attrs() { return show_settings_attrs; }
function set_show_settings_attrs(v) { show_settings_attrs = parseInt(v, 10) ? 1 : 0; update_popup_dimensions(); }

function set_popup_mini_size(w, h) {
  var pw = parseFloat(w), ph = parseFloat(h);
  if (!isNaN(pw)) popup_mini_w = Math.max(260, Math.min(pw, 420));
  if (!isNaN(ph)) popup_mini_h = Math.max(85, Math.min(ph, 150));
  update_popup_dimensions();
}
function get_popup_mini_size() { return [popup_mini_w, popup_mini_h]; }

function anything() {
  var args = arrayfromargs(arguments);
  var key = messagename.toLowerCase().replace(/^set_?/, "");

  if (key === "update" || key === "theme_update" || key === "refresh" || key === "refresh_theme") {
    if (bus && bus.theme) onBusMessage(bus.theme);
    else loadThemeFromDict();
    redraw_all();
    return;
  }

  // Theme Master & Patcher message aliases
  if (key === "bg_color" || key === "bgcolor") key = "background_color";
  if (key === "corner_radius") key = "border_radius";
  if (key === "bordersize" || key === "border_size") key = "border_thickness";
  if (key === "accent_color") key = "highlight_color";
  if (key === "font_color" || key === "text_color") key = "textcolor";
  if (key === "dot_color" || key === "popupdotcolor") key = "popup_dot_color";
  if (key === "decimalcolor") key = "decimal_color";
  if (key === "modecolor") key = "mode_color";
  if (key === "label_style") key = "label_mode";
  if (key === "case_style") key = "case_mode";
  if (key === "tag_text" || key === "name_tag_text") key = "name_tag_text";
  if (key === "name_tag_visible") key = "name_tag_on";
  if (key === "fontsize") key = "text_size";
  if (key === "numberspacing" || key === "num_spacing" || key === "digit_spacing") key = "number_spacing";
  if (key === "taggap" || key === "tag_spacing") key = "tag_gap";

  var setterName = "set_" + key;
  if (typeof this[setterName] === "function") {
    this[setterName].apply(this, args);
  }
}

// =============================================================
// 12. MAX INSPECTOR ATTRIBUTE DECLARATIONS
// =============================================================
declareattribute("mode", { type: "int", style: "enumindex", enumvals: ["Touch", "Mouse"], label: "Interaction Mode", category: "Performance", getter: "get_mode", setter: "set_mode", embed: 1 });
declareattribute("touch_type", { type: "int", style: "enumindex", enumvals: ["Sliders", "Pad"], label: "Touch Interface Type", category: "Performance", getter: "get_touch_type", setter: "set_touch_type", embed: 1 });
declareattribute("step_size", { type: "float", label: "Step Size", category: "Performance", getter: "get_step_size", setter: "set_step_size", embed: 1 });
declareattribute("hold_speed", { type: "float", label: "Hold Speed (ms)", category: "Performance", getter: "get_hold_speed", setter: "set_hold_speed", embed: 1 });

declareattribute("integer_digits", { type: "int", label: "Integer Digits", category: "Setup", getter: "get_integer_digits", setter: "set_integer_digits", embed: 1 });
declareattribute("decimal_digits", { type: "int", label: "Decimal Digits", category: "Setup", getter: "get_decimal_digits", setter: "set_decimal_digits", embed: 1 });
declareattribute("leading_zeros", { type: "int", style: "onoff", label: "Leading Zeros", category: "Setup", getter: "get_leading_zeros", setter: "set_leading_zeros", embed: 1 });
declareattribute("allow_popup", { type: "int", style: "onoff", label: "Allow Settings Popup", category: "Setup", getter: "get_allow_popup", setter: "set_allow_popup", embed: 1 });

declareattribute("name_tag_on", { type: "int", style: "onoff", label: "Name Tag Visible", category: "Labels", getter: "get_name_tag_on", setter: "set_name_tag_on", embed: 1 });
declareattribute("name_tag_text", { type: "symbol", label: "Tag Text", category: "Labels", getter: "get_name_tag_text", setter: "set_name_tag_text", embed: 1 });
declareattribute("tag_position", { type: "int", style: "enumindex", enumvals: ["Top", "Bottom", "Left", "Right"], label: "Tag Position", category: "Labels", getter: "get_tag_position", setter: "set_tag_position", embed: 1 });
declareattribute("tag_gap", { type: "float", label: "Tag Gap", category: "Labels", getter: "get_tag_gap", setter: "set_tag_gap", embed: 1 });
declareattribute("case_mode", { type: "int", style: "enumindex", enumvals: ["First Cap", "All Cap", "All Small"], label: "Prefix Case Style", category: "Labels", getter: "get_case_mode", setter: "set_case_mode", embed: 1 });
declareattribute("label_mode", { type: "int", style: "enumindex", enumvals: ["Full", "No Vowels", "Caps Only", "First Letter", "No Text"], label: "Prefix Label Style", category: "Labels", getter: "get_label_mode", setter: "set_label_mode", embed: 1 });
declareattribute("name_tag_x", { type: "float", label: "Tag X Offset", category: "Labels", getter: "get_name_tag_x", setter: "set_name_tag_x", embed: 1 });
declareattribute("name_tag_y", { type: "float", label: "Tag Y Offset", category: "Labels", getter: "get_name_tag_y", setter: "set_name_tag_y", embed: 1 });
declareattribute("name_tag_text_size", { type: "int", label: "Tag Font Size", category: "Labels", getter: "get_name_tag_text_size", setter: "set_name_tag_text_size", embed: 1 });

declareattribute("number_spacing", { type: "float", label: "Number Spacing (5%-35%)", category: "Geometry", getter: "get_number_spacing", setter: "set_number_spacing", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", category: "Geometry", getter: "get_border_radius", setter: "set_border_radius", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", category: "Geometry", getter: "get_border_thickness", setter: "set_border_thickness", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", category: "Geometry", getter: "get_border_extension", setter: "set_border_extension", embed: 1 });

declareattribute("font", { type: "symbol", style: "font", label: "Font Face", category: "Typography", getter: "get_font", setter: "set_font", embed: 1 });
declareattribute("text_size", { type: "int", label: "Canvas Font Size", category: "Typography", getter: "get_text_size", setter: "set_text_size", embed: 1 });

declareattribute("mode_color", { type: "rgba", style: "rgba", label: "Mode / Tag Color", category: "Colors", getter: "get_mode_color", setter: "set_mode_color", embed: 1 });
declareattribute("background_color", { type: "rgba", style: "rgba", label: "Background Color", category: "Colors", getter: "get_background_color", setter: "set_background_color", embed: 1 });
declareattribute("border_color", { type: "rgba", style: "rgba", label: "Border Color", category: "Colors", getter: "get_border_color", setter: "set_border_color", embed: 1 });
declareattribute("textcolor", { type: "rgba", style: "rgba", label: "Text Color", category: "Colors", getter: "get_textcolor", setter: "set_textcolor", embed: 1 });
declareattribute("popup_dot_color", { type: "rgba", style: "rgba", label: "Popup Dot Color", category: "Colors", getter: "get_popup_dot_color", setter: "set_popup_dot_color", embed: 1 });
declareattribute("decimal_color", { type: "rgba", style: "rgba", label: "Decimal Color", category: "Colors", getter: "get_decimal_color", setter: "set_decimal_color", embed: 1 });
declareattribute("highlight_color", { type: "rgba", style: "rgba", label: "Highlight Color", category: "Colors", getter: "get_highlight_color", setter: "set_highlight_color", embed: 1 });

declareattribute("pop_bgcolor", { type: "rgba", style: "rgba", label: "Popup BG Color", category: "Popup Colors", getter: "get_pop_bgcolor", setter: "set_pop_bgcolor", embed: 1 });
declareattribute("attr_bg_color", { type: "rgba", style: "rgba", label: "Attr BG Color", category: "Popup Colors", getter: "get_attr_bg_color", setter: "set_attr_bg_color", embed: 1 });
declareattribute("attr_border_color", { type: "rgba", style: "rgba", label: "Attr Border Color", category: "Popup Colors", getter: "get_attr_border_color", setter: "set_attr_border_color", embed: 1 });
declareattribute("attr_slider_color", { type: "rgba", style: "rgba", label: "Attr Slider Color", category: "Popup Colors", getter: "get_attr_slider_color", setter: "set_attr_slider_color", embed: 1 });
declareattribute("attr_text_color", { type: "rgba", style: "rgba", label: "Attr Text Color", category: "Popup Colors", getter: "get_attr_text_color", setter: "set_attr_text_color", embed: 1 });

declareattribute("show_settings_attrs", { type: "int", style: "onoff", label: "Show Attributes List", category: "Popup Masks", getter: "get_show_settings_attrs", setter: "set_show_settings_attrs", embed: 1 });
declareattribute("mask_performance", { type: "int", style: "onoff", label: "1. Show Performance", category: "Popup Masks", getter: "get_mask_performance", setter: "set_mask_performance", embed: 1 });
declareattribute("mask_labels", { type: "int", style: "onoff", label: "2. Show Labels", category: "Popup Masks", getter: "get_mask_labels", setter: "set_mask_labels", embed: 1 });
declareattribute("mask_geometry", { type: "int", style: "onoff", label: "3. Show Geometry", category: "Popup Masks", getter: "get_mask_geometry", setter: "set_mask_geometry", embed: 1 });
declareattribute("mask_colors", { type: "int", style: "onoff", label: "4. Show Colors", category: "Popup Masks", getter: "get_mask_colors", setter: "set_mask_colors", embed: 1 });
declareattribute("mask_popup_colors", { type: "int", style: "onoff", label: "5. Show Popup Colors", category: "Popup Masks", getter: "get_mask_popup_colors", setter: "set_mask_popup_colors", embed: 1 });

// =============================================================
// 13. PERSISTENCE & CLEANUP
// =============================================================
function save() {
  embedmessage("set_val", val);
  embedmessage("set_mode", mode);
  embedmessage("set_touch_type", touch_type);
  embedmessage("set_step_size", step_size);
  embedmessage("set_hold_speed", hold_speed);
  embedmessage("set_text_size", text_size);
  embedmessage("set_integer_digits", integer_digits);
  embedmessage("set_decimal_digits", decimal_digits);
  embedmessage("set_leading_zeros", leading_zeros);
  embedmessage("set_allow_popup", allow_popup);

  embedmessage("set_font", font);
  embedmessage("set_name_tag_on", name_tag_on);
  embedmessage("set_name_tag_text", name_tag_text);
  embedmessage("set_tag_position", tag_position);
  embedmessage("set_tag_gap", tag_gap);
  embedmessage("set_label_mode", label_mode);
  embedmessage("set_case_mode", case_mode);
  embedmessage("set_name_tag_x", name_tag_x);
  embedmessage("set_name_tag_y", name_tag_y);
  embedmessage("set_name_tag_text_size", name_tag_text_size);

  embedmessage("set_number_spacing", number_spacing);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);

  embedmessage("set_mode_color", mode_color[0], mode_color[1], mode_color[2], mode_color[3]);
  embedmessage("set_background_color", background_color[0], background_color[1], background_color[2], background_color[3]);
  embedmessage("set_border_color", border_color[0], border_color[1], border_color[2], border_color[3]);
  embedmessage("set_textcolor", textcolor[0], textcolor[1], textcolor[2], textcolor[3]);
  embedmessage("set_popup_dot_color", popup_dot_color[0], popup_dot_color[1], popup_dot_color[2], popup_dot_color[3]);
  embedmessage("set_decimal_color", decimal_color[0], decimal_color[1], decimal_color[2], decimal_color[3]);
  embedmessage("set_highlight_color", highlight_color[0], highlight_color[1], highlight_color[2], highlight_color[3]);

  embedmessage("set_pop_bgcolor", pop_bgcolor[0], pop_bgcolor[1], pop_bgcolor[2], pop_bgcolor[3]);
  embedmessage("set_attr_bg_color", attr_bg_color[0], attr_bg_color[1], attr_bg_color[2], attr_bg_color[3]);
  embedmessage("set_attr_border_color", attr_border_color[0], attr_border_color[1], attr_border_color[2], attr_border_color[3]);
  embedmessage("set_attr_slider_color", attr_slider_color[0], attr_slider_color[1], attr_slider_color[2], attr_slider_color[3]);
  embedmessage("set_attr_text_color", attr_text_color[0], attr_text_color[1], attr_text_color[2], attr_text_color[3]);

  embedmessage("set_show_settings_attrs", show_settings_attrs);
  embedmessage("set_mask_performance", mask_performance);
  embedmessage("set_mask_labels", mask_labels);
  embedmessage("set_mask_geometry", mask_geometry);
  embedmessage("set_mask_colors", mask_colors);
  embedmessage("set_mask_popup_colors", mask_popup_colors);

  embedmessage("set_popup_mini_size", popup_mini_w, popup_mini_h);
}

function notifydeleted() {
  cancel_hold();
  if (hold_task) {
    try { hold_task.cancel(); } catch (e) {}
    hold_task = null;
  }
  if (render_task) {
    try { render_task.cancel(); } catch (e) {}
    render_task = null;
  }

  try {
    if (bus && bus.subscribers && bus.subscribers[uniqueID]) {
      delete bus.subscribers[uniqueID];
    }
  } catch (e) {}

  try { if (windowListener) windowListener.subjectname = ""; } catch (e) {}
  try { if (colorListener) colorListener.subjectname = ""; } catch (e) {}
  try { if (touchListener) touchListener.subjectname = ""; } catch (e) {}

  try { if (popupWindow) popupWindow.visible = 0; } catch (e) {}
  try { if (colorWindow) colorWindow.visible = 0; } catch (e) {}
  try { if (touchWindow) touchWindow.visible = 0; } catch (e) {}

  // Explicitly free C++ window peers
  try { if (popupWindow) popupWindow.free(); } catch (e) {}
  try { if (colorWindow) colorWindow.free(); } catch (e) {}
  try { if (touchWindow) touchWindow.free(); } catch (e) {}

  try { if (outMatrix) outMatrix.freepeer(); } catch (e) {}
  try { if (colorMatrix) colorMatrix.freepeer(); } catch (e) {}
  try { if (touchMatrix) touchMatrix.freepeer(); } catch (e) {}

  popupWindow = null;
  colorWindow = null;
  touchWindow = null;
  outMatrix = null;
  colorMatrix = null;
  touchMatrix = null;
}

if (bus && bus.theme && (bus.theme.bg_color || bus.theme.border_color)) {
  onBusMessage(bus.theme);
} else {
  loadThemeFromDict();
}

redraw_all();