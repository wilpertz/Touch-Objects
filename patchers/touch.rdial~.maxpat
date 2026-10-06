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
        "rect": [ 777.0, 303.0, 659.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 457.0, 225.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "comment": "label_text",
                    "id": "obj-8",
                    "index": 3,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 475.0, 46.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 56.0, 131.0, 50.0, 37.0 ],
                    "text": "meter 0."
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 130.0, 88.0, 92.0, 23.0 ],
                    "text": "prepend meter"
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 130.0, 57.0, 106.0, 23.0 ],
                    "text": "mc.peakamp~ 20"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embed": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 1 ],
                        [ "set_borders", 1 ],
                        [ "set_show_background", 0 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_dial_style", 0 ],
                        [ "set_ribbon_fill", 0 ],
                        [ "set_rotary_mode", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_mouse_mode", 1 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 100 ],
                        [ "set_decimal_digits", 1 ],
                        [ "set_integer_digits", 2 ],
                        [ "set_leading_zeros", 0 ],
                        [ "set_step_amount", 0.05 ],
                        [ "set_step_speed_ms", 20 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "Out Vol" ],
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
                        [ "set_bg_color", 0.025942028985507206, 0.025942028985507206, 0.02608695652173909, 0.46111111111111114 ],
                        [ "set_border_color", 0.5043478260869565, 0, 0, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.8956521739130435, 0.41299516908212563, 0.41299516908212563, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.13, 0.13, 0.16, 1 ],
                        [ "set_attr_bg_color", 0.7130434782608696, 0.281256038647343, 0.281256038647343, 0.4722222222222222 ],
                        [ "set_attr_border_color", 0.782608695652174, 0.4379710144927537, 0.4260869565217392, 1 ],
                        [ "set_attr_slider_color", 0.8, 0.5911111111111111, 0.5911111111111111, 0.4722222222222222 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_unit_mode", 0 ],
                        [ "set", 83.10605482640784 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-13",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 247.0, 92.0, 70.0, 69.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 0.0, 0.0, 70.0, 71.0 ],
                    "textfile": {
                        "filename": "touch.rdial.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "rdial~"
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "float" ],
                    "patching_rect": [ 247.0, 217.0, 51.0, 23.0 ],
                    "text": "pow 1.6"
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "float" ],
                    "patching_rect": [ 247.0, 176.0, 41.0, 23.0 ],
                    "text": "* 0.01"
                }
            },
            {
                "box": {
                    "comment": "value in",
                    "id": "obj-12",
                    "index": 2,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 247.0, 46.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "signal", "bang" ],
                    "patching_rect": [ 247.0, 289.0, 36.0, 23.0 ],
                    "text": "line~"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 247.0, 260.0, 40.0, 23.0 ],
                    "text": "$1 20"
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-5",
                    "index": 1,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 168.0, 385.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "comment": "audio in",
                    "id": "obj-4",
                    "index": 1,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "multichannelsignal" ],
                    "patching_rect": [ 168.0, 131.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "multichannelsignal" ],
                    "patching_rect": [ 168.0, 334.0, 41.0, 23.0 ],
                    "text": "mc.*~"
                }
            },
            {
                "box": {
                    "attr": "label_text",
                    "id": "obj-1",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 374.0, 169.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-11", 0 ],
                    "source": [ "obj-10", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 1 ],
                    "source": [ "obj-11", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-18", 0 ],
                    "source": [ "obj-13", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-19", 0 ],
                    "source": [ "obj-18", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-19", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "order": 0,
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "order": 1,
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-8", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "order": 0,
                    "source": [ "obj-9", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 1 ],
                    "order": 1,
                    "source": [ "obj-9", 0 ]
                }
            }
        ],
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}