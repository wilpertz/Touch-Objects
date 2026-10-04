// ============================================================================
// TOUCH.STATUS -> PATTRSTORAGE MASTER EXTENSIONS (DROP-IN SNIPPETS)
// ============================================================================


// ----------------------------------------------------------------------------
// SNIPPET 1: PATTRSTORAGE BINDING ENGINE
// Paste near the top of the file (under module_name / stateDict declarations)
// ----------------------------------------------------------------------------
var pattrstorage_target = ""; // Leave blank to auto-detect first pattrstorage found
var boundPattrstorage = null;

function set_pattrstorage(name) {
  pattrstorage_target = String(name || "").trim();
  find_subordinate_pattrstorage();
}
function get_pattrstorage() { 
  return pattrstorage_target; 
}

function find_subordinate_pattrstorage() {
  boundPattrstorage = null;
  if (!this.patcher) return null;

  function search(p) {
    if (!p) return null;
    var o = p.firstobject;
    while (o) {
      if (String(o.maxclass).toLowerCase() === "pattrstorage") {
        if (!pattrstorage_target || o.varname === pattrstorage_target) {
          return o;
        }
      }
      var sub = o.subpatcher();
      if (sub) {
        var found = search(sub);
        if (found) return found;
      }
      o = o.nextobject;
    }
    return null;
  }

  boundPattrstorage = search(this.patcher);
  if (boundPattrstorage) {
    post(`\n[touch.status] Commandeered pattrstorage: "${boundPattrstorage.varname || 'unnamed'}" as subordinate.\n`);
  }
  return boundPattrstorage;
}


// ----------------------------------------------------------------------------
// SNIPPET 2: REPLACEMENT FOR scan_local_controls()
// Completely replace your existing scan_local_controls() function with this.
// (Enables discovery of native Max UI controls + binds pattrstorage)
// ----------------------------------------------------------------------------
function scan_local_controls() {
  discoveredControls = {};
  if (!this.patcher || !is_active_module()) return;

  // Auto-acquire / verify subordinate pattrstorage
  find_subordinate_pattrstorage();

  function traverse(p, pathPrefix) {
    if (!p) return;
    var o = p.firstobject;
    while (o) {
      var sub = o.subpatcher();
      if (sub) {
        var containerName = (o.varname && o.varname !== "v8ui") ? o.varname : "";
        var nextPrefix = containerName ? (pathPrefix ? `${pathPrefix}::${containerName}` : containerName) : pathPrefix;
        traverse(sub, nextPrefix);
      } else {
        if (o !== this.box && o.varname) {
          var mclass = String(o.maxclass).toLowerCase();
          var vname = String(o.varname);

          // Skip patch utility nodes and pattr internals
          var ignore = ["comment", "message", "inlet", "outlet", "pattrstorage", "autopattr", "pattr"];
          if (
            !vname ||
            vname === "v8ui" ||
            vname.startsWith("v8ui_") ||
            vname.startsWith("p_panel") ||
            ignore.indexOf(mclass) !== -1
          ) {
            // Skip utility wrappers
          } else if (
            mclass === "jsui" || 
            mclass === "v8ui" || 
            typeof o.getvalueof === "function" || 
            typeof o.setvalueof === "function"
          ) {
            var fullKey = pathPrefix ? `${pathPrefix}::${o.varname}` : o.varname;
            discoveredControls[fullKey] = o;
          }
        }
      }
      o = o.nextobject;
    }
  }

  traverse(this.patcher, "");
}


// ----------------------------------------------------------------------------
// SNIPPET 3: PATTRSTORAGE MORPH / INTERPOLATION
// Insert this inside dispatch_morph_to_controls(), right after effA, effB,
// and effectiveBlend are calculated (around line 290):
// ----------------------------------------------------------------------------
  // Command pattrstorage to interpolate (respects snap & mute composition rules)
  if (boundPattrstorage) {
    try {
      boundPattrstorage.message("recall", effA + 1, effB + 1, effectiveBlend);
    } catch(e) {}
  }


// ----------------------------------------------------------------------------
// SNIPPET 4: PATTRSTORAGE RECALL COMMAND
// Insert inside recall_slot(idx), just before outlet(0, active_slot + 1):
// ----------------------------------------------------------------------------
  // Command subordinate pattrstorage to recall slot
  if (boundPattrstorage) {
    try {
      boundPattrstorage.message("recall", idx + 1);
    } catch(e) {}
  }


// ----------------------------------------------------------------------------
// SNIPPET 5: PATTRSTORAGE STORE COMMAND
// Insert inside save_slot(idx), right after d.set(...) / disk write:
// ----------------------------------------------------------------------------
  // Command subordinate pattrstorage to snapshot its parameters
  if (boundPattrstorage) {
    try {
      boundPattrstorage.message("store", idx + 1);
    } catch(e) {}
  }


// ----------------------------------------------------------------------------
// SNIPPET 6: ATTRIBUTE DECLARATION & EMBED PERSISTENCE
// 1. Add this inside function save():
//    embedmessage("set_pattrstorage", pattrstorage_target);
//
// 2. Add this at the very bottom with the other declareattribute statements:
// ----------------------------------------------------------------------------
declareattribute("pattrstorage", { 
  type: "symbol", 
  label: "Subordinate Pattrstorage Name", 
  setter: "set_pattrstorage", 
  getter: "get_pattrstorage", 
  category: "Subordinates", 
  embed: 1 
});