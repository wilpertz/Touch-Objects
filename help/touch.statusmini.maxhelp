{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 2,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 412.0, 274.0, 1173.0, 780.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "fontsize": 16.0,
                    "id": "obj-35",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 59.0, 58.0, 198.0, 26.0 ],
                    "text": "touch.statusmin.maxhelp"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-33",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 82.0, 499.0, 116.0, 39.0 ],
                    "presentation_linecount": 2,
                    "text": "scripe name both"
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 600.0, 499.0, 97.0, 23.0 ],
                    "presentation_linecount": 2,
                    "text": "Curve_mode $1"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 2,
                    "id": "obj-26",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 205.0, 253.0, 132.0, 40.0 ],
                    "presentation_linecount": 2,
                    "text": "status stores the mini"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-25",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 410.0, 428.0, 116.0, 25.0 ],
                    "text": "name the mini"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-24",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 372.0, 165.0, 116.0, 25.0 ],
                    "text": "name the status"
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 532.0, 499.0, 56.0, 23.0 ],
                    "text": "width $1"
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 459.0, 499.0, 59.0, 23.0 ],
                    "text": "shape $1"
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 384.0, 499.0, 61.0, 23.0 ],
                    "presentation_linecount": 2,
                    "text": "height $1"
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 307.0, 499.0, 51.0, 23.0 ],
                    "text": "level $1"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 228.0, 499.0, 61.0, 23.0 ],
                    "text": "center $1"
                }
            },
            {
                "box": {
                    "embed": 0,
                    "embedstate": [
                        [ "set_preset_target", 1 ],
                        [ "set_count", 16 ],
                        [ "set_direction", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_show_curve_ui", 1 ],
                        [ "set_show_text", 1 ],
                        [ "set_labels", "Volume" ],
                        [ "set_slider_gap", 2 ],
                        [ "set_cap_height", 3 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_borders", 1 ],
                        [ "set_show_background", 1 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 0.5 ],
                        [ "set_border_extension", 8.98876404494382 ],
                        [ "set_text_size", 9 ],
                        [ "set_font_style", 0 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_bar_color", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_cap_color", 0.8260869565217391, 0.5686231884057971, 0.37173913043478257, 0.9277777777777778 ],
                        [ "set_mode_color", 0.9304347826086956, 0.40318840579710147, 0, 1 ],
                        [ "set_text_color", 1, 1, 1, 0.75 ],
                        [ "set_bg_color", 0, 0, 0, 0.23333333333333334 ],
                        [ "set_border_color", 0.9304830917874397, 0.9565217391304348, 0.17536231884057973, 1 ],
                        [ "set_pop_bgcolor", 0.5391304347826087, 0.5391304347826087, 0.16173913043478264, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.24347826086956526, 0.24347826086956526, 0.11227053140096621, 0.55 ],
                        [ "set_attr_border_color", 0.9694444444444446, 1, 0.08333333333333337, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.3674074074074074, 0.4, 0.20444444444444443, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "setvalueof", 0.9215010918199344, 0.8766129976709462, 0.8158479075711242, 0.7362368491289122, 0.6346455327784407, 0.5077826660670234, 0.35220712453001424, 0.16433421986194263, 0.05712816173648483, 0.2625373377177731, 0.43380472601649955, 0.5745846791882088, 0.6883908381598396, 0.7785902465873507, 0.8483966566965802, 0.9008628220483038 ],
                        [ "attr_bg_color", 0.24347826086956526, 0.24347826086956526, 0.11227053140096621, 0.55 ],
                        [ "attr_border_color", 0.9694444444444446, 1, 0.08333333333333337, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.3674074074074074, 0.4, 0.20444444444444443, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bar_color", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "bg_color", 0, 0, 0, 0.23333333333333334 ],
                        [ "border_color", 0.9304830917874397, 0.9565217391304348, 0.17536231884057973, 1 ],
                        [ "border_extension", 8.98876404494382 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 0.5 ],
                        [ "borders", 1 ],
                        [ "cap_color", 0.8260869565217391, 0.5686231884057971, 0.37173913043478257, 0.9277777777777778 ],
                        [ "cap_height", 3 ],
                        [ "count", 16 ],
                        [ "curve_exponent", 0.35 ],
                        [ "direction", 0 ],
                        [ "labels", "Volume" ],
                        [ "max_val", 1 ],
                        [ "min_val", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9304347826086956, 0.40318840579710147, 0, 1 ],
                        [ "pop_bgcolor", 0.5391304347826087, 0.5391304347826087, 0.16173913043478264, 0.5111111111111111 ],
                        [ "preset_target", 1 ],
                        [ "show_background", 1 ],
                        [ "show_curve_ui", 1 ],
                        [ "show_text", 1 ],
                        [ "slider_gap", 2 ],
                        [ "slider_speed", 1 ],
                        [ "step_amount", 0.05 ],
                        [ "text_color", 1, 1, 1, 0.75 ]
                    ],
                    "filename": "touch.mslider.js",
                    "id": "obj-5",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 5,
                    "outlettype": [ "", "", "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 228.0, 529.0, 250.0, 60.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 537.0, 346.0, 163.0, 60.0 ],
                    "textfile": {
                        "filename": "touch.mslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "volume_slider"
                }
            },
            {
                "box": {
                    "embed": 0,
                    "embedstate": [
                        [ "set_connect", 0 ],
                        [ "set_slots", 7 ],
                        [ "set_id", "status_mini_vol" ],
                        [ "set_status", "tb-303" ],
                        [ "set_borders", 1 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 0.5 ],
                        [ "set_border_extension", 8.98876404494382 ],
                        [ "border_extension", 8.98876404494382 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 0.5 ],
                        [ "borders", 1 ],
                        [ "connect", 0 ],
                        [ "id", "status_mini_vol" ],
                        [ "slots", 7 ],
                        [ "status", "tb-303" ]
                    ],
                    "filename": "touch.statusmini.js",
                    "id": "status_mini_vol",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 228.0, 459.0, 159.0, 31.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 537.0, 408.0, 163.0, 18.0 ],
                    "textfile": {
                        "filename": "touch.statusmini.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "status_mini_vol"
                }
            },
            {
                "box": {
                    "embed": 0,
                    "embedstate": [
                        [ "set_name", "tb-303" ],
                        [ "grid", "4/1" ],
                        [ "set_active_mask_tab", 0 ],
                        [ "set_name_bank_attr", "Init Status, Clean Tone, Warm Crunch, Lead 80s, Heavy Drive, Solo Boost, Ambient Pad, Perc 3/8, Drum 2/4, Mute / Cut, Sub Bass, FX Riser" ],
                        [ "set_allow_hold_save", 1 ],
                        [ "set_hold_threshold", 500 ],
                        [ "set_double_tap_threshold", 320 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_text_size", 11 ],
                        [ "set_borders", 1 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 0.5 ],
                        [ "set_border_extension", 8.98876404494382 ],
                        [ "set_slot_names", "Init Status, Clean Tone, Lead 80s, Solo Boost" ],
                        [ "set_master_mode", 0 ],
                        [ "set_slot_behaviors", "0 0 0 0" ],
                        [ "set_normalize", 0 ],
                        [ "set_low_slot", 1 ],
                        [ "set_high_slot", 4 ],
                        [ "set_time_mode", 0 ],
                        [ "set_wrap", 0 ],
                        [ "set_slots_saved", "%5B%22Init%20Status%22%2C%22Clean%20Tone%22%2C%22Lead%2080s%22%2C%22Solo%20Boost%22%5D" ],
                        [ "active_mask_tab", 0 ],
                        [ "borders", 1 ],
                        [ "grid", "4/1" ],
                        [ "high_slot", 4 ],
                        [ "low_slot", 1 ],
                        [ "master_mode", 0 ],
                        [ "name", "tb-303" ],
                        [ "normalize", 0 ],
                        [ "popup_slots", "Init Status, Clean Tone, Warm Crunch, Lead 80s, Heavy Drive, Solo Boost, Ambient Pad, Perc 3/8, Drum 2/4, Mute / Cut, Sub Bass, FX Riser" ],
                        [ "slot_behaviors", "0 0 0 0" ],
                        [ "slot_names", "Init Status, Clean Tone, Lead 80s, Solo Boost" ],
                        [ "time_mode", 0 ],
                        [ "wrap", 0 ]
                    ],
                    "filename": "touch.status.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 134.0, 197.0, 265.0, 43.0 ],
                    "textfile": {
                        "filename": "touch.status.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "attr": "name",
                    "id": "obj-7",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 134.0, 167.0, 231.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "id",
                    "id": "obj-32",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 228.0, 429.0, 180.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-15", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-16", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-18", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-31", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "status_mini_vol", 0 ],
                    "source": [ "obj-32", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-9", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}