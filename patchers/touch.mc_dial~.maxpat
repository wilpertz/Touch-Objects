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
        "rect": [ 469.0, 291.0, 659.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 406.0, 195.0, 84.0, 23.0 ],
                    "text": "loadmess 0 0"
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-53",
                    "index": 1,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 156.0, 465.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-52",
                    "index": 1,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "multichannelsignal" ],
                    "patching_rect": [ 156.0, 87.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-51",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 391.5, 305.0, 59.0, 23.0 ],
                    "text": "chans $1"
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 277.5, 157.0, 76.0, 23.0 ],
                    "text": "mc.makelist"
                }
            },
            {
                "box": {
                    "id": "obj-46",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 277.5, 195.0, 92.0, 23.0 ],
                    "text": "prepend meter"
                }
            },
            {
                "box": {
                    "id": "obj-45",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 305.5, 117.0, 106.0, 23.0 ],
                    "text": "mc.peakamp~ 20"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "multichannelsignal", "", "" ],
                    "patching_rect": [ 306.0, 345.0, 133.0, 23.0 ],
                    "text": "mc.line~ 20 @chans 2"
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "multichannelsignal" ],
                    "patching_rect": [ 156.0, 380.0, 169.0, 23.0 ],
                    "text": "mc.*~"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_count", 2 ],
                        [ "set_direction", 0 ],
                        [ "set_alignment", 0 ],
                        [ "set_dial_spacing", 13 ],
                        [ "set_dial_val_idx", 0, 0 ],
                        [ "set_mode_idx", 0, 0 ],
                        [ "set_mouse_mode_idx", 0, 1 ],
                        [ "set_min_val_idx", 0, 0 ],
                        [ "set_max_val_idx", 0, 100 ],
                        [ "set_step_amount_idx", 0, 0.5 ],
                        [ "set_dec_digits_idx", 0, 1 ],
                        [ "set_int_digits_idx", 0, 2 ],
                        [ "set_multiplier_idx", 0, 0.01 ],
                        [ "set_dial_size_idx", 0, 0.2 ],
                        [ "set_style_idx", 0, 0 ],
                        [ "set_ribbon_fill_idx", 0, 1 ],
                        [ "set_rotary_mode_idx", 0, 0 ],
                        [ "set_slider_speed_idx", 0, 1 ],
                        [ "set_step_speed_ms_idx", 0, 20 ],
                        [ "set_curve_exponent_idx", 0, 0.35 ],
                        [ "set_unit_mode_idx", 0, 1 ],
                        [ "set_text_size_idx", 0, 9 ],
                        [ "set_font_style_idx", 0, 0 ],
                        [ "set_label_mode_idx", 0, 0 ],
                        [ "set_case_mode_idx", 0, 0 ],
                        [ "set_dial_val_idx", 1, 0 ],
                        [ "set_mode_idx", 1, 0 ],
                        [ "set_mouse_mode_idx", 1, 1 ],
                        [ "set_min_val_idx", 1, 0 ],
                        [ "set_max_val_idx", 1, 100 ],
                        [ "set_step_amount_idx", 1, 0.5 ],
                        [ "set_dec_digits_idx", 1, 1 ],
                        [ "set_int_digits_idx", 1, 2 ],
                        [ "set_multiplier_idx", 1, 0.01 ],
                        [ "set_dial_size_idx", 1, 0.2 ],
                        [ "set_style_idx", 1, 0 ],
                        [ "set_ribbon_fill_idx", 1, 1 ],
                        [ "set_rotary_mode_idx", 1, 0 ],
                        [ "set_slider_speed_idx", 1, 1 ],
                        [ "set_step_speed_ms_idx", 1, 20 ],
                        [ "set_curve_exponent_idx", 1, 0.35 ],
                        [ "set_unit_mode_idx", 1, 1 ],
                        [ "set_text_size_idx", 1, 9 ],
                        [ "set_font_style_idx", 1, 0 ],
                        [ "set_label_mode_idx", 1, 0 ],
                        [ "set_case_mode_idx", 1, 0 ],
                        [ "set_borders", 1 ],
                        [ "set_show_background", 0 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_track_breadth", 3.5 ],
                        [ "set_handle_size", 4.5 ],
                        [ "set_needle_thickness", 1.8 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.21589371980676325, 0.7526441223832528, 0.9478260869565217, 1 ],
                        [ "set_track_color", 0, 0, 0, 0.75 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_labels", "LiveOut RecOut" ],
                        [ "set_font_name", "Arial" ],
                        [ "set_gain_exponent", 1.6 ],
                        [ "set_use_gain_curve", 1 ],
                        [ "alignment", 0 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0.21589371980676325, 0.7526441223832528, 0.9478260869565217, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "borders", 1 ],
                        [ "case_mode", 0 ],
                        [ "count", 2 ],
                        [ "curve_exponent", 0.35 ],
                        [ "decimal_digits", 1 ],
                        [ "dial_size", 0.2, 0.2 ],
                        [ "dial_spacing", 13 ],
                        [ "dial_style", 0 ],
                        [ "direction", 0 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "gain_exponent", 1.6 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "handle_size", 4.5 ],
                        [ "integer_digits", 2 ],
                        [ "label_mode", 0 ],
                        [ "labels", "LiveOut RecOut" ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "multiplier", 0.01 ],
                        [ "needle_thickness", 1.8 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "ribbon_fill", 1 ],
                        [ "rotary_mode", 0 ],
                        [ "show_background", 0 ],
                        [ "slider_speed", 1 ],
                        [ "step_speed_ms", 20 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_size", 9 ],
                        [ "track_breadth", 3.5 ],
                        [ "track_color", 0, 0, 0, 0.75 ],
                        [ "unit_mode", 1 ],
                        [ "use_gain_curve", 1 ]
                    ],
                    "filename": "touch.mdial.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 5,
                    "outlettype": [ "", "", "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 277.5, 237.0, 133.0, 59.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 1.0, 0.0, 142.0, 63.0 ],
                    "textfile": {
                        "filename": "touch.mdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "mc_dial~"
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-1", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-51", 0 ],
                    "source": [ "obj-1", 4 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 1 ],
                    "source": [ "obj-10", 0 ]
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
                    "destination": [ "obj-49", 2 ],
                    "source": [ "obj-45", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-49", 1 ],
                    "source": [ "obj-45", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-46", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-46", 0 ],
                    "source": [ "obj-49", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-51", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-52", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-45", 0 ],
                    "order": 0,
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-53", 0 ],
                    "order": 1,
                    "source": [ "obj-6", 0 ]
                }
            }
        ],
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}