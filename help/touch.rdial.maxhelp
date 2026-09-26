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
        "rect": [ 140.0, 162.0, 1074.0, 811.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 174.5, 461.0, 73.0, 23.0 ],
                    "text": "loadmess 0"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-24",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 174.5, 573.5, 357.0, 39.0 ],
                    "text": "this is an abstraction\n0-100 x [0.01] x [pow1.6] -> [$1 20]->[line~] -> [mc.*]"
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-14",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 174.5, 514.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 0,
                    "patching_rect": [ 94.5, 671.0, 37.0, 23.0 ],
                    "text": "dac~"
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "signal" ],
                    "patching_rect": [ 94.5, 514.0, 72.0, 23.0 ],
                    "text": "cycle~ 440"
                }
            },
            {
                "box": {
                    "bgmode": 0,
                    "border": 0,
                    "clickthrough": 0,
                    "enablehscroll": 0,
                    "enablevscroll": 0,
                    "id": "obj-3",
                    "lockeddragscroll": 0,
                    "lockedsize": 0,
                    "maxclass": "bpatcher",
                    "name": "touch.rdial~.maxpat",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "offset": [ 0.0, 0.0 ],
                    "outlettype": [ "multichannelsignal" ],
                    "patching_rect": [ 94.5, 562.0, 65.0, 62.0 ],
                    "varname": "touch.rdial~",
                    "viewvisibility": 1
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-6",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 856.0, 188.0, 50.0, 23.0 ]
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
                    "patching_rect": [ 271.0, 110.0, 209.0, 23.0 ]
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
                    "patching_rect": [ 523.0, 110.0, 209.0, 23.0 ]
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
                    "patching_rect": [ 762.0, 358.0, 50.0, 37.0 ],
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
                        [ "set_show_background", 1 ],
                        [ "set_border_radius", 7.303370786516854 ],
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
                        [ "set_border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 0 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.1298550724637681, 0.2683671497584541, 0.27826086956521734, 1 ],
                        [ "set_attr_bg_color", 0.281256038647343, 0.7130434782608696, 0.684257648953301, 0.4888888888888889 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.5911111111111111, 0.8, 0.7860740740740741, 0.4722222222222222 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0.14391921639673533 ],
                        [ "set_unit_mode", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-20",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 748.0, 229.0, 64.0, 64.0 ],
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
                    "patching_rect": [ 748.0, 156.0, 242.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 537.0, 358.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 1 ],
                        [ "set_borders", 1 ],
                        [ "set_show_background", 0 ],
                        [ "set_border_radius", 7.303370786516854 ],
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
                        [ "set_border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 0 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.1298550724637681, 0.2683671497584541, 0.27826086956521734, 1 ],
                        [ "set_attr_bg_color", 0.281256038647343, 0.7130434782608696, 0.684257648953301, 0.4888888888888889 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.5911111111111111, 0.8, 0.7860740740740741, 0.4722222222222222 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0 ],
                        [ "set_unit_mode", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-15",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 523.0, 229.0, 64.0, 64.0 ],
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
                    "patching_rect": [ 285.0, 358.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 2 ],
                        [ "set_borders", 0 ],
                        [ "set_show_background", 0 ],
                        [ "set_border_radius", 7.303370786516854 ],
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
                        [ "set_border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 0 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.1298550724637681, 0.2683671497584541, 0.27826086956521734, 1 ],
                        [ "set_attr_bg_color", 0.281256038647343, 0.7130434782608696, 0.684257648953301, 0.4888888888888889 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.5911111111111111, 0.8, 0.7860740740740741, 0.4722222222222222 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0 ],
                        [ "set_unit_mode", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-12",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 271.0, 229.0, 64.0, 64.0 ],
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
                    "patching_rect": [ 102.0, 358.0, 50.0, 37.0 ],
                    "text": "0.253992"
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
                    "patching_rect": [ 107.0, 177.0, 50.0, 23.0 ]
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
                    "border": 0,
                    "embedstate": [
                        [ "set_active_mask_tab", 0 ],
                        [ "set_borders", 0 ],
                        [ "set_show_background", 0 ],
                        [ "set_border_radius", 7.303370786516854 ],
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
                        [ "set_border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 0 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.1298550724637681, 0.2683671497584541, 0.27826086956521734, 1 ],
                        [ "set_attr_bg_color", 0.281256038647343, 0.7130434782608696, 0.684257648953301, 0.4888888888888889 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.5911111111111111, 0.8, 0.7860740740740741, 0.4722222222222222 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0.2539917630419209 ],
                        [ "set_unit_mode", 0 ]
                    ],
                    "filename": "touch.rdial.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 88.0, 235.0, 64.0, 64.0 ],
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
                    "patching_rect": [ 271.0, 156.0, 194.0, 23.0 ]
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
                    "patching_rect": [ 523.0, 156.0, 209.0, 23.0 ]
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
                    "patching_rect": [ 88.0, 123.0, 150.0, 23.0 ]
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
                    "destination": [ "obj-3", 1 ],
                    "source": [ "obj-14", 0 ]
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
                    "destination": [ "obj-14", 0 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-8", 1 ],
                    "order": 0,
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-8", 0 ],
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