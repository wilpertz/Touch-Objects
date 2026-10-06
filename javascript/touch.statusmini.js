// ============================================================================
// touch.statusmini.js - Max 9 v8ui / jsui
// Micro Preset Chip / Minion for Local Subpatches
// Smooth Scrub / Morph + 500ms Hold Save Counter Ring
// ============================================================================

autowatch = 1;

if (typeof mgraphics.init === "function") mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

inlets = 1;
outlets = 2;
setinletassist(0, "Inlet 0: int / float / connect <0|1> / store <int> / messages");
setoutletassist(0, "Outlet 0: Active slot (int) / Morph value (float)");
setoutletassist(1, "Outlet 1: Notifications (stored, recalled, connect)");

const uniqueID = Math.floor(Math.random() * 1000000);
let is_transmitting = false;

// =============================================================
// 1. CONFIGURATION & STATE
// =============================================================
let minion_id      = "";
let status_name    = "";
let num_slots      = 4;
let active_slot    = 0;
let morph_val      = 1.0;
let is_morphing    = 0;
let connect_status = 0; // 0 = Autonomous, 1 = Controlled by Status

// Persistent Canvas Dimensions
let view_w = 120;
let view_h = 24;

// Theme Palette (Synced to touch_theme_bus)
let bg_color         = [0.12, 0.12, 0.14, 0.95];
let border_color     = [0.35, 0.35, 0.40, 1.0];
let highlight_color  = [0.85, 0.52, 0.20, 1.0];
let empty_dot_color  = [0.25, 0.26, 0.30, 0.8];
let saved_dot_color  = [0.65, 0.68, 0.75, 1.0];
let hold_ring_color  = [1.00, 0.30, 0.30, 1.0]; // 500ms Hold ring color

let border_radius    = 3.0;
let border_thickness = 1.0;
let border_extension = 4.0;
let borders          = 1;

// Touch Timing & 500ms Save Ring
let hold_threshold      = 500; // Exact 500ms save threshold
let hold_grace_ms       = 100; // Ring starts filling after 100ms so quick taps don't flicker
let isMouseDown         = false;
let pendingSlot         = -1;
let clickStartX         = 0;
let clickStartY         = 0;
let clickStartTime      = 0;
let has_dragged         = false;
let has_saved_on_hold   = false;
let hold_progress       = 0.0;
let holdAnimTask        = null;

// =============================================================
// 2. SLOTS & DIMENSIONS ENGINE
// =============================================================
let slots = [];
function init_slots() {
  slots = [];
  for (let i = 0; i < num_slots; i++) {
    slots.push({ stored: false, controls: {} });
  }
}
init_slots();

let discoveredControls = {};

function onresize(w, h) {
  if (w > 0 && h > 0) {
    view_w = w;
    view_h = h;
  }
  mgraphics.redraw();
}

function update_dimensions() {
  if (typeof mgraphics !== "undefined" && mgraphics && mgraphics.size && mgraphics.size[0] > 0) {
    view_w = mgraphics.size[0];
    view_h = mgraphics.size[1];
    return;
  }
  try {
    if (this.box && this.box.rect && Array.isArray(this.box.rect)) {
      const rw = this.box.rect[2] - this.box.rect[0];
      const rh = this.box.rect[3] - this.box.rect[1];
      if (rw > 0 && rh > 0) {
        view_w = rw;
        view_h = rh;
      }
    }
  } catch(e) {}
}

function get_minion_id() {
  if (minion_id && minion_id.length > 0) return minion_id;
  if (this.box && this.box.varname && this.box.varname.length > 0 && this.box.varname !== "v8ui") {
    return this.box.varname;
  }
  return `mini_${uniqueID}`;
}

function scan_neighborhood() {
  discoveredControls = {};
  if (!this.patcher) return;
  let o = this.patcher.firstobject;
  while (o) {
    if (o !== this.box && o.varname) {
      const vname = String(o.varname);
      const mclass = String(o.maxclass).toLowerCase();
      if (!vname.startsWith("v8ui_") && !vname.startsWith("p_panel") && vname !== "v8ui") {
        if (mclass === "jsui" || mclass === "v8ui" || typeof o.getvalueof === "function") {
          discoveredControls[vname] = o;
        }
      }
    }
    o = o.nextobject;
  }
}

// =============================================================
// 3. STATUS BONDING & SHARED DICTIONARY
// =============================================================
const statusBus = new Global("touch_status_bus");

function find_status_name() {
  if (status_name && status_name.length > 0) return status_name;

  let p = this.patcher;
  while (p) {
    let o = p.firstobject;
    while (o) {
      if (o !== this.box) {
        const mclass = String(o.maxclass || "").toLowerCase();
        if (mclass === "jsui" || mclass === "v8ui") {
          try {
            const fn = String(o.getattr("filename") || "");
            if (fn.indexOf("touch.status") !== -1 && fn.indexOf("statusmini") === -1 && fn.indexOf("statusmanager") === -1) {
              const mName = o.getattr("name");
              if (mName && mName !== "unnamed" && String(mName).trim().length > 0) {
                status_name = String(mName).trim();
                return status_name;
              }
            }
          } catch(e) {}
        }
      }
      o = o.nextobject;
    }
    p = p.parentpatcher;
  }

  if (statusBus && statusBus.clients) {
    const keys = Object.keys(statusBus.clients);
    if (keys.length === 1) {
      status_name = keys[0];
      return status_name;
    }
  }

  return "";
}

function get_status_dict() {
  const sName = find_status_name();
  if (!sName) return null;
  return new Dict(`touch_states_${sName}`);
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

function write_states_to_disk() {
  const sName = find_status_name();
  if (!sName) return;
  const d = get_status_dict();
  if (!d) return;

  const dir = get_states_dir();
  const safeName = sName.replace(/\s+/g, "_");
  const fullpath = dir ? `${dir}${safeName}.json` : `${safeName}.json`;

  try {
    d.export_json(fullpath);
  } catch(e) {}
}

function pull_from_status_dict() {
  const d = get_status_dict();
  if (!d) return;

  const id = get_minion_id();
  const minionKey = `mini_${id}`;

  try {
    if (d.contains(minionKey)) {
      const raw = d.get(minionKey);
      const data = (typeof raw === "string") ? JSON.parse(raw) : raw;
      if (data && Array.isArray(data.slots)) {
        for (let i = 0; i < data.slots.length && i < slots.length; i++) {
          slots[i] = data.slots[i];
        }
        if (data.active_slot !== undefined) {
          active_slot = data.active_slot;
        }
      }
    }
  } catch(e) {}
  mgraphics.redraw();
}

function sync_to_status_dict() {
  const d = get_status_dict();
  if (!d) return;

  const id = get_minion_id();
  const minionKey = `mini_${id}`;

  const payload = {
    active_slot: active_slot,
    slots: slots
  };

  try {
    d.set(minionKey, JSON.stringify(payload));
    write_states_to_disk();
  } catch(e) {}
}

// =============================================================
// 4. RECALL, STORE & SMOOTH MORPH ENGINE
// =============================================================
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
function lerp(a, b, t) { return a + (b - a) * t; }

function recall_slot(idx) {
  if (idx < 0 || idx >= slots.length) return;
  active_slot = idx;
  morph_val = idx + 1.0;
  is_morphing = 0;

  scan_neighborhood();
  const sData = slots[active_slot];
  if (sData && sData.stored && sData.controls) {
    for (const k in sData.controls) {
      const o = discoveredControls[k];
      if (!o) continue;
      const cVal = sData.controls[k];
      try {
        if (o.js && typeof o.js.set_state === "function") {
          o.js.set_state(cVal);
        } else if (typeof o.setvalueof === "function") {
          const direct = (typeof cVal === "object" && cVal !== null && cVal.val !== undefined) ? cVal.val : cVal;
          o.setvalueof(direct);
        } else {
          const directVal = (typeof cVal === "object" && cVal !== null && cVal.val !== undefined) ? cVal.val : cVal;
          if (Array.isArray(directVal)) o.message("list", directVal);
          else if (directVal !== undefined) o.message("float", directVal);
        }
      } catch(e) {}
    }
  }

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, active_slot + 1);
      outlet(1, ["recalled", active_slot + 1]);
    } finally {
      is_transmitting = false;
    }
  }
  sync_to_status_dict();
  mgraphics.redraw();
}

function save_slot(idx) {
  if (idx < 0 || idx >= slots.length) return;
  scan_neighborhood();

  const snapshot = {};
  for (const k in discoveredControls) {
    const o = discoveredControls[k];
    if (!o) continue;
    try {
      if (o.js && typeof o.js.get_state === "function") {
        snapshot[k] = o.js.get_state();
      } else if (typeof o.getvalueof === "function") {
        snapshot[k] = { val: o.getvalueof() };
      }
    } catch(e) {}
  }

  slots[idx].stored = true;
  slots[idx].controls = snapshot;
  active_slot = idx;
  morph_val = idx + 1.0;
  is_morphing = 0;

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, active_slot + 1);
      outlet(1, ["stored", active_slot + 1]);
    } finally {
      is_transmitting = false;
    }
  }
  sync_to_status_dict();
  mgraphics.redraw();
}

function morph_between(slotA_idx, slotB_idx, blend) {
  const dataA = slots[slotA_idx] ? slots[slotA_idx].controls : {};
  const dataB = slots[slotB_idx] ? slots[slotB_idx].controls : {};

  for (const k in discoveredControls) {
    const o = discoveredControls[k];
    if (!o) continue;
    let valA = dataA[k];
    let valB = dataB[k];

    if (valA === undefined && valB === undefined) continue;
    if (valA === undefined) valA = valB;
    if (valB === undefined) valB = valA;

    try {
      if (o.js && typeof o.js.morph_state === "function") {
        o.js.morph_state(valA, valB, blend);
        continue;
      }
      const rawA = (typeof valA === "object" && valA !== null && valA.val !== undefined) ? valA.val : valA;
      const rawB = (typeof valB === "object" && valB !== null && valB.val !== undefined) ? valB.val : valB;

      if (typeof rawA === "number" && typeof rawB === "number") {
        const res = lerp(rawA, rawB, blend);
        if (typeof o.setvalueof === "function") o.setvalueof(res);
        else o.message("float", res);
      } else if (Array.isArray(rawA) && Array.isArray(rawB)) {
        const maxLen = Math.max(rawA.length, rawB.length);
        const blendedArr = [];
        for (let i = 0; i < maxLen; i++) {
          const nA = i < rawA.length ? Number(rawA[i]) : Number(rawA[rawA.length - 1]);
          const nB = i < rawB.length ? Number(rawB[i]) : Number(rawB[rawB.length - 1]);
          blendedArr.push(lerp(nA, nB, blend));
        }
        if (typeof o.setvalueof === "function") o.setvalueof(blendedArr);
        else o.message("list", blendedArr);
      } else {
        const snap = blend >= 0.5 ? rawB : rawA;
        if (typeof o.setvalueof === "function") o.setvalueof(snap);
        else o.message(snap);
      }
    } catch(e) {}
  }
}

function morph_to(fVal) {
  if (num_slots <= 1) return;
  const fClamped = clamp(parseFloat(fVal), 1.0, num_slots);
  const fPos = fClamped - 1.0;

  morph_val = fClamped;
  is_morphing = 1;

  const sA = Math.floor(fPos);
  const sB = Math.min(num_slots - 1, sA + 1);
  const frac = fPos - sA;

  active_slot = clamp(Math.round(morph_val) - 1, 0, num_slots - 1);
  morph_between(sA, sB, frac);

  if (!is_transmitting) {
    is_transmitting = true;
    try {
      outlet(0, morph_val);
    } finally {
      is_transmitting = false;
    }
  }
  mgraphics.redraw();
}

// Full-span smooth drag
function apply_drag_morph(localX, totalW) {
  if (num_slots <= 1 || totalW <= 0) return;
  const padW = totalW / num_slots;
  const fVal = clamp(0.5 + (localX / padW), 1.0, num_slots);
  morph_to(fVal);
}

// =============================================================
// 5. STATUS VALUE HOOKS (GOVERNED BY CONNECT_STATUS)
// =============================================================
function getvalueof() {
  return is_morphing ? morph_val : (active_slot + 1);
}

function setvalueof(v) {
  if (!connect_status || isMouseDown || has_dragged) return;

  if (typeof v === "number") {
    if (v % 1 !== 0) {
      morph_to(v);
    } else {
      recall_slot(Math.round(v) - 1);
    }
  }
}

function get_state() {
  return {
    val: is_morphing ? morph_val : (active_slot + 1),
    active_slot: active_slot
  };
}

function set_state(st) {
  if (!connect_status || isMouseDown || has_dragged) return;
  if (typeof st === "object" && st !== null) {
    if (st.val !== undefined) setvalueof(st.val);
  } else if (typeof st === "number") {
    setvalueof(st);
  }
}

function morph_state(stA, stB, frac) {
  if (!connect_status || isMouseDown || has_dragged) return;
  const vA = (typeof stA === "object" && stA !== null && stA.val !== undefined) ? Number(stA.val) : Number(stA);
  const vB = (typeof stB === "object" && stB !== null && stB.val !== undefined) ? Number(stB.val) : Number(stB);
  if (!isNaN(vA) && !isNaN(vB)) {
    morph_to(lerp(vA, vB, frac));
  }
}

// =============================================================
// 6. VECTOR DRAW ENGINE (WITH 500MS COUNTER RING)
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
  if (r > 0) ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); else { ctx.move_to(x, y + eh); ctx.line_to(x, y); }
  ctx.line_to(x + r + ew, y); ctx.move_to(x, y + r); ctx.line_to(x, y + r + eh); ctx.stroke();

  // 2. Top-Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2.0); else { ctx.move_to(x + w - ew, y); ctx.line_to(x + w, y); }
  ctx.line_to(x + w, y + r + eh); ctx.move_to(x + w - r - ew, y); ctx.line_to(x + w - r, y); ctx.stroke();

  // 3. Bottom-Right
  ctx.new_path();
  if (r > 0) ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5); else { ctx.move_to(x + w, y + h - eh); ctx.line_to(x + w, y + h); }
  ctx.line_to(x + w - r - ew, y + h); ctx.move_to(x + w, y + h - r); ctx.line_to(x + w, y + h - r - eh); ctx.stroke();

  // 4. Bottom-Left
  ctx.new_path();
  if (r > 0) ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI); else { ctx.move_to(x + ew, y + h); ctx.line_to(x, y + h); }
  ctx.line_to(x, y + h - r - eh); ctx.move_to(x + r + ew, y + h); ctx.line_to(x + r, y + h); ctx.stroke();
}

function paint() {
  const sz = mgraphics.size;
  if (sz && sz[0] > 0 && sz[1] > 0) {
    view_w = sz[0];
    view_h = sz[1];
  }

  const w = view_w, h = view_h;
  const sName = find_status_name();
  const hasStatus = (sName && sName.length > 0);

  const b = isNaN(border_thickness) ? 1.0 : border_thickness;
  const inset = b * 0.5;
  const rw = Math.max(1, w - b);
  const rh = Math.max(1, h - b);
  const radVal = isNaN(border_radius) ? 3.0 : border_radius;
  const r = Math.min(radVal, rw * 0.5, rh * 0.5);
  const extVal = isNaN(border_extension) ? 4.0 : border_extension;
  const ew = Math.min(extVal, Math.max(0, (rw - 2 * r) * 0.5));
  const eh = Math.min(extVal, Math.max(0, (rh - 2 * r) * 0.5));

  const ctx = mgraphics;

  ctx.set_source_rgba(bg_color);
  draw_common_path(ctx, inset, inset, rw, rh, r);
  ctx.fill();

  if (borders === 1 && b > 0) {
    drawCorners(ctx, inset, inset, rw, rh, r, ew, eh, border_color, b);
  }

  if (!hasStatus) {
    ctx.set_source_rgba(0.55, 0.55, 0.60, 0.5);
    ctx.select_font_face("Arial", "normal", "bold");
    ctx.set_font_size(Math.max(7, Math.min(9, h * 0.45)));
    const msg = "NO STATUS";
    const tm = ctx.text_measure(msg);
    ctx.move_to((w - tm[0]) * 0.5, h * 0.5 + 3.0);
    ctx.show_text(msg);
    return;
  }

  if (connect_status === 1) {
    ctx.set_source_rgba(highlight_color);
    ctx.arc(4.0, 4.0, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const padW = w / num_slots;
  const dotR = Math.max(2.5, Math.min(padW * 0.22, h * 0.28));

  for (let i = 0; i < num_slots; i++) {
    const cx = i * padW + padW * 0.5;
    const cy = h * 0.5;
    const isStored = slots[i] && slots[i].stored;

    // Continuous crossfade
    let highlightAlpha = 0.0;
    if (is_morphing && num_slots > 1) {
      const fPos = morph_val - 1.0;
      const sA = Math.floor(fPos);
      const sB = Math.min(num_slots - 1, sA + 1);
      const frac = fPos - sA;
      if (i === sA) highlightAlpha = 1.0 - frac;
      else if (i === sB) highlightAlpha = frac;
    } else {
      if (i === active_slot) highlightAlpha = 1.0;
    }

    if (i > 0) {
      ctx.set_source_rgba(border_color[0], border_color[1], border_color[2], 0.25);
      ctx.set_line_width(0.75);
      ctx.move_to(i * padW, 3);
      ctx.line_to(i * padW, h - 3);
      ctx.stroke();
    }

    // Background Pad Tint
    if (highlightAlpha > 0.01) {
      ctx.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], 0.25 * highlightAlpha);
      ctx.rectangle_rounded(i * padW + 1.5, 1.5, padW - 3, h - 3, 2, 2);
      ctx.fill();
    }

    // 1. Draw base dot
    if (isStored) {
      ctx.set_source_rgba(saved_dot_color);
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.set_source_rgba(empty_dot_color);
      ctx.set_line_width(1.0);
      ctx.arc(cx, cy, dotR - 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Continuous highlight overlay
    if (highlightAlpha > 0.01) {
      ctx.set_source_rgba(highlight_color[0], highlight_color[1], highlight_color[2], highlightAlpha);
      ctx.arc(cx, cy, dotR + 0.5 * highlightAlpha, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 500ms Hold Save Counter Ring
    if (isMouseDown && !has_dragged && pendingSlot === i && hold_progress > 0.0) {
      const ringR = dotR + 4.0;
      ctx.set_source_rgba(hold_ring_color);
      ctx.set_line_width(2.0);
      ctx.new_path();
      ctx.arc(cx, cy, ringR, -Math.PI * 0.5, -Math.PI * 0.5 + (Math.PI * 2 * hold_progress));
      ctx.stroke();
    }
  }
}

// =============================================================
// 7. TOUCH HIT-TESTING & SMOOTH DRAG ENGINE
// =============================================================
function stop_hold_timer() {
  if (holdAnimTask) {
    try { holdAnimTask.cancel(); } catch(e) {}
    holdAnimTask = null;
  }
  hold_progress = 0.0;
}

function onclick(x, y, button, cmd, shift) {
  update_dimensions();
  const padW = view_w / num_slots;
  const hitIdx = clamp(Math.floor(x / padW), 0, num_slots - 1);

  if (shift === 1) {
    save_slot(hitIdx);
    return;
  }

  scan_neighborhood();

  isMouseDown = true;
  has_dragged = false;
  has_saved_on_hold = false;
  pendingSlot = hitIdx;
  clickStartX = x;
  clickStartY = y;
  clickStartTime = Date.now();
  hold_progress = 0.0;

  stop_hold_timer();

  // 500ms Animation Watchdog Task
  holdAnimTask = new Task(function() {
    if (!isMouseDown || pendingSlot === -1 || has_dragged) {
      stop_hold_timer();
      return;
    }

    const elapsed = Date.now() - clickStartTime;

    if (elapsed > hold_grace_ms) {
      hold_progress = clamp((elapsed - hold_grace_ms) / (hold_threshold - hold_grace_ms), 0.0, 1.0);
      mgraphics.redraw();
    }

    if (elapsed >= hold_threshold) {
      has_saved_on_hold = true;
      save_slot(pendingSlot);
      stop_hold_timer();
      mgraphics.redraw();
    }
  }, this);

  holdAnimTask.interval = 16;
  holdAnimTask.repeat();
}

function ondrag(x, y, button) {
  // Finger / Mouse Released
  if (button === 0) {
    stop_hold_timer();

    if (isMouseDown && pendingSlot !== -1 && !has_dragged && !has_saved_on_hold) {
      // Normal quick tap release -> recall clicked slot
      recall_slot(pendingSlot);
    } else if (has_dragged) {
      // Drag released -> finalize selection
      active_slot = clamp(Math.round(morph_val) - 1, 0, num_slots - 1);
      is_morphing = 0;
      sync_to_status_dict();
    }

    isMouseDown = false;
    pendingSlot = -1;
    has_dragged = false;
    has_saved_on_hold = false;
    hold_progress = 0.0;
    mgraphics.redraw();
    return;
  }

  // Once > 3px deadband is crossed, engage drag mode once
  if (!has_dragged) {
    if (Math.abs(x - clickStartX) > 3 || Math.abs(y - clickStartY) > 3) {
      has_dragged = true;
      pendingSlot = -1;
      stop_hold_timer();
    }
  }

  // Continuous smooth drag tracking across entire strip
  if (has_dragged) {
    apply_drag_morph(x, view_w);
  }
}

function onidle() { 
  if (isMouseDown) { 
    stop_hold_timer(); 
    isMouseDown = false; 
    pendingSlot = -1; 
    has_dragged = false;
    mgraphics.redraw();
  } 
}

function onidleout() { 
  if (isMouseDown) { 
    stop_hold_timer(); 
    isMouseDown = false; 
    pendingSlot = -1; 
    has_dragged = false;
    mgraphics.redraw();
  } 
}

// =============================================================
// 8. INLET MESSAGES, ATTRIBUTES & PERSISTENCE
// =============================================================
function msg_int(v)   { recall_slot(parseInt(v, 10) - 1); }
function msg_float(v) { morph_to(v); }
function store(v)     { save_slot(parseInt(v, 10) - 1); }

function set_connect(v) {
  connect_status = parseInt(v, 10) ? 1 : 0;
  outlet(1, ["connect", connect_status]);
  mgraphics.redraw();
}
function get_connect() { return connect_status; }

function set_slots(v) {
  const p = parseInt(v, 10);
  if (!isNaN(p) && p >= 2 && p <= 16) {
    num_slots = p;
    init_slots();
    pull_from_status_dict();
    mgraphics.redraw();
  }
}
function get_slots() { return num_slots; }

function set_id(v) {
  minion_id = String(v).trim();
  if (this.box && minion_id.length > 0) {
    this.box.varname = minion_id;
  }
  pull_from_status_dict();
  mgraphics.redraw();
}
function get_id() { return get_minion_id(); }

function set_status(v) {
  status_name = String(v).trim();
  pull_from_status_dict();
  mgraphics.redraw();
}
function get_status() { return status_name; }

function set_borders(v) { borders = parseInt(v, 10) ? 1 : 0; mgraphics.redraw(); }
function get_borders() { return borders; }

function set_border_radius(v) { var p = parseFloat(v); if (!isNaN(p)) border_radius = Math.max(0.0, p); mgraphics.redraw(); }
function get_border_radius() { return border_radius; }

function set_border_thickness(v) { var p = parseFloat(v); if (!isNaN(p)) border_thickness = Math.max(0.0, p); mgraphics.redraw(); }
function get_border_thickness() { return border_thickness; }

function set_border_extension(v) { var p = parseFloat(v); if (!isNaN(p)) border_extension = Math.max(0.0, p); mgraphics.redraw(); }
function get_border_extension() { return border_extension; }

function anything() {
  const args = arrayfromargs(arguments);
  const msg = messagename.trim();

  if (msg === "connect" || msg === "link") { 
    if (args.length > 0) set_connect(args[0]); 
    else set_connect(!connect_status);
    return; 
  }
  if (msg === "slots") { if (args.length > 0) set_slots(args[0]); return; }
  if (msg === "id") { if (args.length > 0) set_id(args[0]); return; }
  if (msg === "status") { if (args.length > 0) set_status(args[0]); return; }
  if (msg === "rescan" || msg === "find") { find_status_name(); pull_from_status_dict(); mgraphics.redraw(); return; }

  var name = msg.replace(/^set_?/, "").toLowerCase();
  if (name === "corner_radius") name = "border_radius";
  if (name === "bordersize" || name === "border_size") name = "border_thickness";
  if (typeof this["set_" + name] === "function") {
    this["set_" + name].apply(this, args);
  }
}

function save() {
  embedmessage("set_connect", connect_status);
  embedmessage("set_slots", num_slots);
  embedmessage("set_id", get_minion_id());
  embedmessage("set_status", status_name);
  embedmessage("set_borders", borders);
  embedmessage("set_border_radius", border_radius);
  embedmessage("set_border_thickness", border_thickness);
  embedmessage("set_border_extension", border_extension);
}

declareattribute("connect", { type: "int", style: "onoff", label: "Connect to Status", setter: "set_connect", getter: "get_connect", category: "Config", embed: 1 });
declareattribute("slots", { type: "int", label: "Number of Slots", setter: "set_slots", getter: "get_slots", category: "Config", embed: 1 });
declareattribute("id", { type: "symbol", label: "Minion Unique ID", setter: "set_id", getter: "get_id", category: "Config", embed: 1 });
declareattribute("status", { type: "symbol", label: "Status Module Name", setter: "set_status", getter: "get_status", category: "Config", embed: 1 });
declareattribute("borders", { type: "int", style: "onoff", label: "Show Outer Borders", setter: "set_borders", getter: "get_borders", category: "Styles", embed: 1 });
declareattribute("border_radius", { type: "float", label: "Border Radius", setter: "set_border_radius", getter: "get_border_radius", category: "Styles", embed: 1 });
declareattribute("border_thickness", { type: "float", label: "Border Thickness", setter: "set_border_thickness", getter: "get_border_thickness", category: "Styles", embed: 1 });
declareattribute("border_extension", { type: "float", label: "Border Extension", setter: "set_border_extension", getter: "get_border_extension", category: "Styles", embed: 1 });

// Theme Bus
const themeBus = new Global("touch_theme_bus");
if (!themeBus.subscribers) themeBus.subscribers = {};
themeBus.subscribers[uniqueID] = function(theme) {
  if (!theme) return;
  if (theme.bg_color) bg_color = theme.bg_color.slice(0);
  if (theme.border_color) border_color = theme.border_color.slice(0);
  if (theme.highlight_color) highlight_color = theme.highlight_color.slice(0);
  if (theme.hold_ring_color) hold_ring_color = theme.hold_ring_color.slice(0);
  if (theme.border_radius !== undefined) border_radius = Number(theme.border_radius);
  if (theme.border_thickness !== undefined) border_thickness = Number(theme.border_thickness);
  if (theme.border_extension !== undefined) border_extension = Number(theme.border_extension);
  mgraphics.redraw();
};
if (themeBus.theme) themeBus.subscribers[uniqueID](themeBus.theme);

function notifydeleted() {
  stop_hold_timer();
  if (themeBus && themeBus.subscribers) delete themeBus.subscribers[uniqueID];
}

// Initial binding
find_status_name();
pull_from_status_dict();
mgraphics.redraw();