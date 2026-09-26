{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 9,
            "minor": 1,
            "revision": 5,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [ 100.0, 100.0, 1039.0, 625.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "format": 6,
                    "id": "obj-6",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 856.0, 232.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mouse_mode",
                    "id": "obj-23",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 271.0, 154.0, 209.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mouse_mode",
                    "id": "obj-22",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 523.0, 154.0, 209.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 762.0, 402.0, 50.0, 37.0 ],
                    "text": "0.143919"
                }
            },
            {
                "box": {
                    "background": 1,
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 2 ],
                        [ "set_borders", 1 ],
                        [ "set_background", 1 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_dial_style", 0 ],
                        [ "set_ribbon_fill", 0 ],
                        [ "set_rotary_mode", 3 ],
                        [ "set_mode", 0 ],
                        [ "set_mouse_mode", 1 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_decimal_digits", 2 ],
                        [ "set_integer_digits", 1 ],
                        [ "set_leading_zeros", 0 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_step_speed_ms", 20 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_label_mode", 3 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "This Long Dial Name" ],
                        [ "set_track_breadth", 4 ],
                        [ "set_handle_size", 5 ],
                        [ "set_needle_thickness", 2 ],
                        [ "set_dial_margin", 4 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 11 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 190, 190 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_track_color", 0.9065700483091789, 0.9565217391304348, 0.20724637681159422, 0.8055555555555556 ],
                        [ "set_handle_color", 0.8684057971014493, 0.9304347826086956, 0, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.6052173913043478, 0.9391304347826087, 0.6831304347826087, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0.14391921639673533 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-20",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 748.0, 273.0, 64.0, 64.0 ],
                    "textfile": {
                        "filename": "touch.rdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AC[1]"
                }
            },
            {
                "box": {
                    "attr": "rotary_mode",
                    "id": "obj-21",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 748.0, 200.0, 242.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 537.0, 402.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "background": 0,
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 1 ],
                        [ "set_borders", 1 ],
                        [ "set_background", 0 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_dial_style", 0 ],
                        [ "set_ribbon_fill", 1 ],
                        [ "set_rotary_mode", 2 ],
                        [ "set_mode", 0 ],
                        [ "set_mouse_mode", 0 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_decimal_digits", 2 ],
                        [ "set_integer_digits", 1 ],
                        [ "set_leading_zeros", 0 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_step_speed_ms", 20 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 1 ],
                        [ "set_label_text", "dial" ],
                        [ "set_track_breadth", 1.1166666666666667 ],
                        [ "set_handle_size", 5 ],
                        [ "set_needle_thickness", 5.883333333333333 ],
                        [ "set_dial_margin", 3.333333333333333 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 2 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 190, 190 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_track_color", 0.9065700483091789, 0.9565217391304348, 0.20724637681159422, 0.8055555555555556 ],
                        [ "set_handle_color", 0.8684057971014493, 0.9304347826086956, 0, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.6052173913043478, 0.9391304347826087, 0.6831304347826087, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-15",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 523.0, 273.0, 64.0, 64.0 ],
                    "textfile": {
                        "filename": "touch.rdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AC"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 285.0, 402.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "background": 0,
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 0 ],
                        [ "set_borders", 0 ],
                        [ "set_background", 0 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_dial_style", 0 ],
                        [ "set_ribbon_fill", 1 ],
                        [ "set_rotary_mode", 1 ],
                        [ "set_mode", 0 ],
                        [ "set_mouse_mode", 1 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_decimal_digits", 2 ],
                        [ "set_integer_digits", 1 ],
                        [ "set_leading_zeros", 0 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_step_speed_ms", 20 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "dial" ],
                        [ "set_track_breadth", 4 ],
                        [ "set_handle_size", 5 ],
                        [ "set_needle_thickness", 2 ],
                        [ "set_dial_margin", 4 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 9 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 190, 190 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_track_color", 0.9065700483091789, 0.9565217391304348, 0.20724637681159422, 0.8055555555555556 ],
                        [ "set_handle_color", 0.8684057971014493, 0.9304347826086956, 0, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.6052173913043478, 0.9391304347826087, 0.6831304347826087, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-12",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 271.0, 273.0, 64.0, 64.0 ],
                    "textfile": {
                        "filename": "touch.rdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AB"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 102.0, 402.0, 50.0, 37.0 ],
                    "text": "0.303992"
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-7",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 107.0, 221.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "fontsize": 16.0,
                    "id": "obj-5",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 88.0, 56.0, 106.0, 26.0 ],
                    "text": "touch.rdial.js"
                }
            },
            {
                "box": {
                    "background": 0,
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 0 ],
                        [ "set_borders", 0 ],
                        [ "set_background", 0 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_dial_style", 0 ],
                        [ "set_ribbon_fill", 1 ],
                        [ "set_rotary_mode", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_mouse_mode", 1 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_decimal_digits", 2 ],
                        [ "set_integer_digits", 1 ],
                        [ "set_leading_zeros", 0 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_step_speed_ms", 20 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "dial" ],
                        [ "set_track_breadth", 4 ],
                        [ "set_handle_size", 5 ],
                        [ "set_needle_thickness", 2 ],
                        [ "set_dial_margin", 4 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 9 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 0 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 190, 190 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_track_color", 0.9065700483091789, 0.9565217391304348, 0.20724637681159422, 0.8055555555555556 ],
                        [ "set_handle_color", 0.8684057971014493, 0.9304347826086956, 0, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.6052173913043478, 0.9391304347826087, 0.6831304347826087, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0.3039917630419209 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 88.0, 279.0, 64.0, 64.0 ],
                    "textfile": {
                        "filename": "touch.rdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "attr": "rotary_mode",
                    "id": "obj-16",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 271.0, 200.0, 194.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "rotary_mode",
                    "id": "obj-17",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 523.0, 200.0, 209.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "allow_popup",
                    "id": "obj-2",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 88.0, 167.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-9", 1 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 1 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 1 ],
                    "source": [ "obj-15", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-16", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-2", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-18", 1 ],
                    "source": [ "obj-20", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-20", 0 ],
                    "source": [ "obj-21", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-22", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-23", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-20", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}