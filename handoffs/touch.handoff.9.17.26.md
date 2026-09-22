# TOUCH JSUI & V8UI SUITE: ARCHITECTURE, DESIGN SYSTEM & COMPLETE HANDOFF

==============================================================================
1. OBJECTIVE: GLOBAL WORKFLOW & TEACHING PROTOCOL
==============================================================================

A. The 1-2-3 Teaching Standard
Every AI agent assisting on this project must structure deliverables strictly using the three-part teaching model:
  1. Objective (Top): Clear, concise statement of what is being built, refactored, or audited.
  2. Lesson / Work (Code) (Middle): The complete, fully realized code or specification deliverable. Never provide fragmented snippets, partial edits, or omitted ellipsis blocks.
  3. Review / Summary (Bottom): Summary, design notes, and technical changelog.
Rationale: Working across complex modular patches requires immediate clarity without having to scroll backward through thousands of lines of code to find context.

B. Complete Copyable Handoffs
Handoff specifications must be delivered as a single unified, contiguous text block. Avoid splitting documentation across conversational preambles or fragmented code snippets so the file can be captured in a single copy-paste action.

C. Compact Sizing & Scaling Integrity
- Objects are frequently sized down to dense hardware footprints: 30x30 px, 35x150 px, or 40x40 px.
- Visual elements (reticle corner brackets, extensions, typography, zone dividers, and indicator dots) must scale dynamically without visual bloat, clipping, or hitbox collisions.

D. Max 9 v8ui Attribute Declaration Syntax
In Max 9 v8ui, declareattribute requires an options configuration object to expose Inspector categories, custom labels, enum dropdowns, and color swatches:

    declareattribute("attr_name", {
        type: "int", // or "float", "symbol", "rgba"
        style: "enumindex", // or "onoff", "rgba", "font"
        enumvals: ["Val1", "Val2"],
        label: "Inspector Display Title",
        category: "Category Name",
        getter: "get_attr_name",
        setter: "set_attr_name",
        embed: 1
    });

Rule: Never convert these declarations into the legacy 4-parameter form (declareattribute(name, get, set, 1)). Doing so causes Max 9 to strip all Inspector UI widgets, falling back to an unstyled, flat alphabetical list of raw numbers and strings.

==============================================================================
2. LESSON: THE SHARED DESIGN SYSTEM
==============================================================================

SUITE TOPOLOGY:
  - touch.master.js    : Central Theme & Preset Matrix (Broadcasts to all clients)
  - touch.hslider.js   : Horizontal Touch Slider (Ribbon / Rail, 85px Breadth)
  - touch.vslider.js   : Vertical Touch Slider (Rotated text, 85px Breadth)
  - touch.button.js    : Touch-Hold / Toggle / Momentary (Auto-contrast luminance)
  - touch.numticker.js : Precision Numeric Drag / Stepper (Sliders / Keypad Touch)
  - touch.ummanu.js    : Touch Menu Picker / Multi-Category Browser (Folder Ingest)
  - touch.panel.js     : Soft-chassis Backdrop & 16-Stop Cosine Diffusion Glass

A. Precision Reticle & Body Aesthetics
Every component is framed by 4 disconnected corner arc brackets evocative of precision laboratory oscilloscopes:
- border_radius / corner_radius: Radius of the four corner arcs (clamped to half-dimensions).
- border_thickness / bordersize: Stroke line width of the corner brackets.
- border_extension: Pixel length of the straight ticks extending along edges from each corner arc.
- draw_common_path(ctx, x, y, w, h, r): Builds the closed rounded rectangle substrate path.
- draw_corners(ctx, x, y, w, h, r, ew, eh, col, thick): Strokes the four independent corner bracket ticks.

B. Two-Pass Typography & Mode Color Decoupling
Typography strictly decouples descriptive prefix labels from primary values or items:
- mode_color: Dedicated prefix/category label color.
- text_color / textcolor: Dedicated active value, item string, or number color.
- case_mode: 0 = First Cap (Title Case), 1 = All Cap (Uppercase), 2 = All Small (Lowercase).
- label_mode: Abbreviation algorithm applied exclusively to labels:
    0 = Full: Complete string.
    1 = No Vowels: Strips inner vowels while keeping initial characters ("Volume" -> "Vlm").
    2 = Caps Only: Retains uppercase letters and digits ("TouchMode" -> "TM").
    3 = First Letter: Word initials ("Master Output" -> "MO").
    4 = No Text: Suppresses label text completely.

C. Standardized 5-Tier Popup Masks Architecture
Every inspector popup (jit.window + MGraphics + JitterMatrix) organizes its 50/50 Attrui parameters into five standardized collapsible tiers:
  1. mask_performance (1. Show Performance): Operational modes, timings, repeat rates, step sizes, ranges, and touch interfaces.
  2. mask_labels (2. Show Labels): Label visibility, placement, prefix abbreviation (label_mode), casing (case_mode), and font posture.
  3. mask_geometry (3. Show Geometry): Corner radius, border thickness, bracket extension, track wire breadth, and font size.
  4. mask_colors (4. Show Colors): Main canvas component colors (body fill, brackets, needle/knob, text, dot).
  5. mask_popup_colors (5. Show Popup Colors): The complete 5-color inspector UI theme palette.
- show_settings_attrs: Master pill toggle (show / hide) that collapses the 50/50 attribute list.

D. Full 5-Color Popup Theme Suite
Floating inspector themes are completely isolated from main canvas component colors:
- pop_bgcolor: Floating window background fill ([0.10, 0.10, 0.12, 1.0]).
- attr_bg_color: Background fill for individual 50/50 attribute rows.
- attr_border_color: Cell outlines and slider troughs.
- attr_slider_color: Interactive drag slider/gauge fill.
- attr_text_color: Attribute title and value typography.

E. Scaled Red Dot Launcher & Hitbox Integrity
- When allow_popup === 1, a red indicator dot renders in the top-right corner of the canvas.
- Radial Distance Check: Prevents hitbox bloat on dense 30x30 px controls:

    var dotR = Math.max(1.5, Math.min(2.8, Math.min(w, h) * 0.08));
    var dotMargin = Math.max(3.5, Math.min(6.5, Math.min(w, h) * 0.15));
    var hitR = Math.max(4.0, Math.min(8.0, Math.min(w, h) * 0.20));
    var distToDot = Math.sqrt((x - (w - dotMargin)) * (x - (w - dotMargin)) + (y - dotMargin) * (y - dotMargin));
    if (distToDot <= hitR || ctrl === 1) { popup(); }

- All objects provide a popup inlet message (popup, popup 1, popup 0) for external patch cord control.

F. Dual-Mode Inspector Sizing & 85 px Cross-Axis Chassis Breadth
- Attrui Shown (show_settings_attrs = 1): Window width snaps to the standardized narrow width (280 px) so attribute rows never stretch out over the screen.
- Attrui Hidden (show_settings_attrs = 0 / Mini Mode): Window height collapses to mini mode while width unlocks horizontal stretching (up to 1920 px) for precise touch tracking.
- Unified 85 px Preview Breadth: Both touch.hslider (horizontal) and touch.vslider (vertical) lock their preview chassis cross-axis breadth strictly to 85 px (prevH = 85 on hslider, previewW = 85 on vslider), ensuring identical visual weight inside inspector windows.

==============================================================================
3. GLOBAL THEME MASTER & WIRELESS BUS PROTOCOL
==============================================================================

A. Bus Architecture (Global("touch_theme_bus"))
The suite synchronizes styling across the patcher without patch cables using a global shared memory bus and persistent dictionary store (touch_theme_store):
- Master Object: touch.master.js manages palettes, panel properties, and preset matrices.
- Client Objects: touch.hslider, touch.vslider, touch.button, touch.numticker, touch.ummanu, and touch.panel subscribe using their uniqueID:

    var bus = new Global("touch_theme_bus");
    if (!bus.subscribers || typeof bus.subscribers !== "object") bus.subscribers = {};
    bus.subscribers[uniqueID] = onBusMessage;

- Lifecycle Cleanup: In notifydeleted(), clients must delete their subscriber ID from bus.subscribers to prevent memory leaks on script reload.

B. Parameter Mapping Reference
  Theme Master Key        Client Variable Handlers
  -----------------------------------------------------------------
  bg_color                bg_color, bgcolor, btn_color_off
  border_color            border_color, bordercolor
  text_color / font_color text_color, textcolor
  highlight_color         handle_color, highlight_color, btn_color_on
  border_radius           border_radius, corner_radius
  border_thickness        border_thickness, bordersize
  border_extension        border_extension
  mode_color              mode_color (tag / prefix color)
  popup_dot_color         popup_dot_color
  pop_bgcolor             pop_bgcolor
  attr_bg_color           attr_bg_color
  attr_border_color       attr_border_color
  attr_slider_color       attr_slider_color
  attr_text_color         attr_text_color
  panel_glass_inner       glass_inner (touch.panel)
  panel_glass_outer       glass_outer (touch.panel)
  panel_border_color      border_color (touch.panel)
  panel_border_radius     border_radius (touch.panel)
  panel_border_size       border_size (touch.panel)
  panel_glass_spread      glass_spread (touch.panel)
  slider_rail_color       track_color (hslider, vslider)
  slider_handle_color     handle_color (hslider, vslider)
  slider_rail_breadth     track_breadth (hslider, vslider)
  decimal_color           decimal_color (numticker)

==============================================================================
4. COMPONENT SPECIFICATIONS
==============================================================================

A. touch.master (Theme Master & Preset Matrix)
- Role: Central design director and preset manager.
- Canvas Interface (4 Pages):
    0 = Objects: Body, border, text, and highlight colors; corner radius, line thickness, extensions.
    1 = Panels: Glass inner substrate, outer smear, panel border, radius, size, and diffusion spread.
    2 = Special: Popup dot, slider rail, knob/line, decimal color, mode prefix color, rail breadth.
    3 = Popups: Popup background, attribute cell background, borders, sliders, and typography.
- Preset Matrix & Morph Subsystem:
  * Floating Jitter matrix grid (preset_cols x preset_rows, up to 8 columns x 6 rows).
  * Every row features an independent linear morph fader blending color and geometry snapshots in real time.
  * Multi-tag library (quick_tags) with instant naming buttons.
  * Auto-expanding modal capture dialog (185-190 px) prevents vertical off-screen clipping during preset naming.
  * Persistent disk storage via touch_theme_presets.json.

B. touch.hslider (Horizontal Touch Slider)
- Chassis Styles (slider_style): 0 = Ribbon (bracket body, guide wire, sliding needle crossbar); 1 = Rail (minimal 2.5 px wire rail, solid orb knob with drop shadow and contrast rim).
- Interactions (mode): 0 = Touch (discrete step tap, hold auto-repeat past 350 ms, proximity-easing drag); 1 = Mouse (direct jump to cursor position).
- Proximity Easing Equation:
    Normalized Dist = min(1.0, abs(cursor_x - crossbar_x) / track_w)
    Increment = 0.0005 + (Normalized Dist ^ curve_exponent) * slider_speed * 0.01
- Typography: Two-pass vector follower tracking the needle/knob horizontally above the guide wire.
- Inspector Geometry: Fixed 85 px preview height, 130 px mini height, narrow 280 px Attrui snap-back.

C. touch.vslider (Vertical Touch Slider)
- Inverted Synth-Fader Mapping: Bottom (y = h) maps to min_val (0.0); Top (y = 0) maps to max_val (1.0).
- Rotated Canvas Typography: Label and value rendered along the vertical track using ctx.rotate(-Math.PI * 0.5) with vector path fills.
- Vertical Elastic Resizing: Inspector width locked to 280 px. Dragging the bottom grip handle elastically stretches the vertical preview bar without breaking attribute layout.
- Chassis Breadth: Fixed 85 px preview width (matching touch.hslider preview height).

D. touch.button (Touch / Toggle / Momentary Button)
- Operating Modes (mode):
    0 = Touch-Hold: State 1 on press, State 0 on release (emits double bang).
    1 = Toggle: Alternates state 0/1 on each press (emits bang on change).
    2 = Momentary: Pulses state 1 for flash_time ms (default: 100 ms), then returns to 0 (emits single bang).
- Auto-Contrast Engine (text_color_mode):
    0 = Auto: Calculates background relative luminance (0.2126R + 0.7152G + 0.0722B). If < 0.5, renders light text ([0.92, 0.94, 0.98]); otherwise renders dark text ([0.10, 0.12, 0.15]).
    1 = Manual: Overridden directly by text_color or Theme Master.

E. touch.numticker (Numeric Touch/Mouse Controller)
- Precision Stepping: Left/right directional tap stepping, hold auto-repeat, and vertical dragging over individual integer and decimal columns.
- Clamping Engine: Dynamically clamps value based on integer_digits (1-12) and decimal_digits (0-8) with optional leading_zeros.
- Integrated Touch Windows: Launches multi-column vertical faders (touch_type = 0) or a scientific keypad pad (touch_type = 1) with sign toggle, backspace, and clear.
- Protruding Name Tag: Multi-position tab (0 = Top, 1 = Bottom, 2 = Left, 3 = Right) supporting full specialized abbreviation styling.

F. touch.ummanu (Menu Picker / Multi-Category Browser)
- Tactile Touch-First Core: Operates by default as a horizontal step strip with hold auto-repeat and scrub gestures; expands into a floating centered dropdown list when mode = 1.
- MultiMenu Paging & Data Ingest: Inlet 1 receives background streams (append, set, clear, folder_menu, clear_folders) directly from folder objects to populate multiple category pages without colliding with Inlet 0 selection messages.
- Output Routing (output_type):
    0 = Prefix + Item: Outputs [Prefix, Item] without colons (e.g. [Mode, Advanced]), directly routable by Max route objects.
    1 = Raw File: Outputs raw filename for pcontrol.
    2 = Item Name: Outputs display label string.
    3 = Prefix + Index: Outputs [Prefix, Index].
- Output Safety (touch_output): 0 = Instant (Scrub); 1 = Staged (arms selection visually with highlight fill; requires center tap confirmation before outputting to protect patch loaders).
- Presentation-Aware Coordinate Resolver: Uses zero-drift parent walking to align the floating dropdown menu underneath the object in both patching and presentation views.

G. touch.panel (Chassis Backdrop & Diffusion Glass)
- Optical Diffusion Engine: Directional linear patterns with 16-stop cosine-eased alpha curves create soft glass bleeds (glass_inner, glass_outer, glass_spread).
- Pass-Through Transparency vs. Window Dragging (drag_patch):
    0 = Pass-Through: box.ignoreclick = 1 lets all clicks and patch cords pass through to underlying objects without obstruction.
    1 = Window Drag: box.ignoreclick = 0 allows clicking and dragging anywhere on the panel to reposition floating borderless subpatcher windows (patcher.wind.location).

==============================================================================
5. TECHNICAL RULES FOR MAX JS ENGINES
==============================================================================

1. 8-Parameter Mouse Signatures:
All JSUI canvas event functions must declare the full 8-parameter signature to correctly support macOS trackpads:
    function onclick(x, y, button, cmd, shift, capslock, option, ctrl) {}
    function ondrag(x, y, button, cmd, shift, capslock, option, ctrl) {}
    function onmouseup(x, y, button, cmd, shift, capslock, option, ctrl) {}
    function onidleout(x, y, button, cmd, shift, capslock, option, ctrl) {}
Note: On macOS, two-finger taps and right-clicks pass ctrl === 1.

2. Safe C-Tree Walker (No Null Pointers):
When walking up patcher.parentpatcher hierarchies to calculate screen coordinates, always guard against root-level null pointer dereferencing:
    var pWalk = this.patcher;
    while (pWalk && pWalk.parentpatcher) {
        var pParent = pWalk.parentpatcher;
        var pBox = null;
        try { pBox = pWalk.box; } catch(e) {}
        if (!pBox) break;
        pWalk = pParent;
    }

3. Lifecycle Destruction (notifydeleted):
To eliminate Max console "bad object <hex>" errors on script save or patcher close:
- Cancel all active Task objects (task.cancel()).
- Clear listener targets (listener.subjectname = "").
- Explicitly hide and free Jitter objects (window.freepeer() or window.free()).
- Explicitly release Jitter matrices (matrix.freepeer()).
- Remove unique subscriber IDs from bus.subscribers.

4. Retina Display 1:1 Pixel Mapping:
Never apply ctx.scale(2, 2) or double matrix dimensions for floating Jitter sub-windows (jit.window). Use exact 1:1 matrix pixel dimensions so that drawing coordinates align with JitterListener mouse coordinates.

==============================================================================
6. REVIEW: SUMMARY & COMPONENT STATUS
==============================================================================

Component          JavaScript File       Max Ref XML                Status     Key Features
---------------------------------------------------------------------------------------------------------------------------------
Theme Master       touch.master.js       touch.master.maxref.xml    Complete   4-Page Canvas, Multi-Row Preset Grid, Row Morphing, 190px Capture Modal
Horizontal Slider  touch.hslider.js      touch.hslider.maxref.xml   Complete   Ribbon/Rail, 85px Breadth, 130px Mini Height, Proximity Drag Easing
Vertical Slider    touch.vslider.js      touch.vslider.maxref.xml   Complete   Ribbon/Rail, 85px Breadth, 280px Locked Width, Rotated Typography
Touch Button       touch.button.js       touch.button.maxref.xml    Complete   Touch-Hold/Toggle/Momentary, Auto-Contrast Luminance Engine
Number Ticker      touch.numticker.js    touch.numticker.maxref.xml Complete   Precision Column Drag, Multi-Column Fader & Scientific Keypad Popups
Menu Browser       touch.ummanu.js       touch.ummanu.maxref.xml    Complete   Touch Step Strip, MultiMenu Folder Ingest, Staged Confirmation, Zero-Drift Window
Glass Panel        touch.panel.js        touch.panel.maxref.xml     Complete   16-Stop Cosine Diffusion Smear, drag_patch Window Drag, Pass-Through Transparency