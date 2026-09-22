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
        "rect": [ 100.0, 100.0, 1278.0, 751.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-26",
                    "linecount": 10,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1052.0, 44.0, 152.0, 150.0 ],
                    "text": "\"If you plan to morph between envelopes with different shapes, initialize all intermediate points on the line/axis in Preset 1 so they glide into place from where you want them, rather than peeling off from the end.\""
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [ "signal" ],
                    "patching_rect": [ 191.0, 402.0, 124.0, 23.0 ],
                    "text": "rampsmooth~ 50 50"
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 500.0, 96.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "int", "int" ],
                    "patching_rect": [ 265.0, 111.0, 29.5, 23.0 ],
                    "text": "t i i"
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 358.0, 44.0, 156.0, 23.0 ],
                    "text": "random @range 200 1000"
                }
            },
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "newobj",
                    "numinlets": 6,
                    "numoutlets": 1,
                    "outlettype": [ "signal" ],
                    "patching_rect": [ 191.0, 294.5, 124.0, 23.0 ],
                    "text": "scale~ 0. 1. 400 800"
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 89.0, 466.0, 73.0, 23.0 ],
                    "text": "loadmess 0"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-20",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1045.0, 507.0, 166.0, 39.0 ],
                    "text": "single point in line mode becomes pictcontrol"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-19",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 644.0, 325.0, 273.0, 25.0 ],
                    "text": "latch/unlatch firts and last point"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-18",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 644.0, 428.0, 114.0, 53.0 ],
                    "text": "line~ or curve~ continuous data"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-17",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 504.0, 524.5, 114.0, 39.0 ],
                    "text": "line~ or curve~ / when bang"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-16",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 644.0, 250.0, 273.0, 53.0 ],
                    "text": "1. click and hold to draw curve\n2. up click less than 300 creates new point\n3. double click point to remove it"
                }
            },
            {
                "box": {
                    "fontsize": 14.0,
                    "id": "obj-2",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 47.5, 47.0, 173.0, 23.0 ],
                    "text": "touch.pfunction.maxhelp"
                }
            },
            {
                "box": {
                    "id": "obj-69",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 296.0, 397.5, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-62",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 961.5, 620.5, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-58",
                    "linecount": 4,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 884.0, 651.0, 50.0, 66.0 ],
                    "text": "0.461538 0.494505"
                }
            },
            {
                "box": {
                    "id": "obj-57",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 1008.0, 651.0, 68.0, 23.0 ],
                    "text": "round 0.01"
                }
            },
            {
                "box": {
                    "id": "obj-56",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 977.0, 691.0, 50.0, 37.0 ],
                    "text": "0.46 0.49"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_rescale_mode", 1 ],
                        [ "set_curve_mode", 0 ],
                        [ "set_latch_first_point", 0 ],
                        [ "set_latch_last_point", 0 ],
                        [ "set_raw_output_mode", 1 ],
                        [ "set_x_min", 0 ],
                        [ "set_x_max", 1 ],
                        [ "set_y_min", 0 ],
                        [ "set_y_max", 1 ],
                        [ "set_display_value", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "SF Pro Text" ],
                        [ "set_text_size", 7 ],
                        [ "set_axis_style", 3 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_line_size", 1.84375 ],
                        [ "set_handle_size", 20 ],
                        [ "set_track_margin", 4 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 420, 180 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 0 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.025942028985507206, 0.025942028985507206, 0.02608695652173909, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.13, 0.13, 0.16, 1 ],
                        [ "set_attr_bg_color", 0.7130434782608696, 0.281256038647343, 0.281256038647343, 1 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.8, 0.5911111111111111, 0.5911111111111111, 1 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "list", 0.46153846153846156, 0.4945054945054945 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.7130434782608696, 0.281256038647343, 0.281256038647343, 1 ],
                        [ "attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "attr_slider_color", 0.8, 0.5911111111111111, 0.5911111111111111, 1 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "axis_style", 3 ],
                        [ "bg_color", 0.025942028985507206, 0.025942028985507206, 0.02608695652173909, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "curve_mode", 0 ],
                        [ "display_value", 1 ],
                        [ "font_name", "SF Pro Text" ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "handle_size", 20 ],
                        [ "label_mode", 0 ],
                        [ "latch_first_point", 0 ],
                        [ "latch_last_point", 0 ],
                        [ "line_size", 1.84375 ],
                        [ "mask_colors", 0 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.13, 0.13, 0.16, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "raw_output_mode", 1 ],
                        [ "rescale_mode", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_size", 7 ],
                        [ "track_margin", 4 ],
                        [ "x_max", 1 ],
                        [ "x_min", 0 ],
                        [ "y_max", 1 ],
                        [ "y_min", 0 ]
                    ],
                    "filename": "touch.pfunction.js",
                    "id": "obj-54",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 915.0, 477.0, 112.0, 99.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 305.0, 271.0, 58.0, 59.0 ],
                    "textfile": {
                        "filename": "touch.pfunction.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AC"
                }
            },
            {
                "box": {
                    "id": "obj-53",
                    "linecount": 3,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 384.5, 429.0, 251.0, 51.0 ],
                    "text": "0 0 0 69. 0.9 0 242.234043 0.109756 -0.525 455.106383 0.853659 0 690 0 0.99"
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 443.0, 117.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-44",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 443.0, 160.0, 73.0, 23.0 ],
                    "text": "metro 1000"
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 476.0, 390.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_rescale_mode", 1 ],
                        [ "set_curve_mode", 1 ],
                        [ "set_latch_first_point", 1 ],
                        [ "set_latch_last_point", 1 ],
                        [ "set_raw_output_mode", 1 ],
                        [ "set_x_min", 0 ],
                        [ "set_x_max", 690 ],
                        [ "set_y_min", 0 ],
                        [ "set_y_max", 1 ],
                        [ "set_display_value", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "SF Pro Text" ],
                        [ "set_text_size", 7 ],
                        [ "set_axis_style", 3 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_line_size", 1 ],
                        [ "set_handle_size", 10 ],
                        [ "set_track_margin", 9 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 420, 180 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 0 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 0 ],
                        [ "set_mask_popup_colors", 0 ],
                        [ "set_bg_color", 0.025942028985507206, 0.025942028985507206, 0.02608695652173909, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.13, 0.13, 0.16, 1 ],
                        [ "set_attr_bg_color", 0.7130434782608696, 0.281256038647343, 0.281256038647343, 1 ],
                        [ "set_attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "set_attr_slider_color", 0.8, 0.5911111111111111, 0.5911111111111111, 1 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "list", 0, 0, 0, 69.00000000000004, 0.9, 0, 242.2340425531915, 0.10975609756097561, -0.5249999999999999, 455.10638297872373, 0.8536585365853658, 0, 690, 0, 0.99 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.7130434782608696, 0.281256038647343, 0.281256038647343, 1 ],
                        [ "attr_border_color", 0.77, 0.77, 0.8608695652173913, 1 ],
                        [ "attr_slider_color", 0.8, 0.5911111111111111, 0.5911111111111111, 1 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "axis_style", 3 ],
                        [ "bg_color", 0.025942028985507206, 0.025942028985507206, 0.02608695652173909, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "curve_mode", 1 ],
                        [ "display_value", 1 ],
                        [ "font_name", "SF Pro Text" ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "handle_size", 10 ],
                        [ "label_mode", 0 ],
                        [ "latch_first_point", 1 ],
                        [ "latch_last_point", 1 ],
                        [ "line_size", 1 ],
                        [ "mask_colors", 0 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 0 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 0 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.13, 0.13, 0.16, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "raw_output_mode", 1 ],
                        [ "rescale_mode", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_size", 7 ],
                        [ "track_margin", 9 ],
                        [ "x_max", 690 ],
                        [ "x_min", 0 ],
                        [ "y_max", 1 ],
                        [ "y_min", 0 ]
                    ],
                    "filename": "touch.pfunction.js",
                    "id": "obj-37",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 335.5, 256.0, 300.0, 100.0 ],
                    "textfile": {
                        "filename": "touch.pfunction.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "ezdac~",
                    "numinlets": 2,
                    "numoutlets": 0,
                    "patching_rect": [ 191.0, 675.0, 45.0, 45.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "gain~",
                    "multichannelvariant": 0,
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "signal", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 191.0, 504.5, 22.0, 140.0 ]
                }
            },
            {
                "box": {
                    "fontsize": 12.0,
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "signal" ],
                    "patching_rect": [ 191.0, 326.0, 72.0, 23.0 ],
                    "text": "cycle~ 440"
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 443.0, 194.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "live.scope~",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 258.5, 675.0, 184.0, 68.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "signal" ],
                    "patching_rect": [ 191.0, 466.0, 29.5, 23.0 ],
                    "text": "*~"
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 2,
                    "outlettype": [ "signal", "bang" ],
                    "patching_rect": [ 335.5, 398.0, 48.0, 23.0 ],
                    "text": "curve~"
                }
            },
            {
                "box": {
                    "attr": "y_max",
                    "id": "obj-5",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 241.0, 194.5, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "linecount": 3,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 267.0, 518.5, 231.0, 51.0 ],
                    "text": "0 0 0 0.9 23.6 0 0.109756 59.251064 -0.525 0.853659 72.808511 0 0 80.340426 0.99"
                }
            },
            {
                "box": {
                    "attr": "x_max",
                    "id": "obj-4",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 241.0, 158.5, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "handle_size",
                    "id": "obj-8",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 581.0, 31.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "line_size",
                    "id": "obj-10",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 581.0, 63.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "text_size",
                    "id": "obj-12",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 581.0, 100.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "axis_style",
                    "id": "obj-22",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 581.0, 139.0, 230.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "track_margin",
                    "id": "obj-23",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 581.0, 187.0, 150.0, 23.0 ]
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
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-10", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-11", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-13", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 1 ],
                    "order": 1,
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "order": 2,
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 0 ],
                    "order": 0,
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-14", 0 ],
                    "source": [ "obj-21", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-22", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-23", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-25", 0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-4", 0 ],
                    "source": [ "obj-25", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-44", 1 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-44", 1 ],
                    "source": [ "obj-29", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "source": [ "obj-30", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 1 ],
                    "order": 0,
                    "source": [ "obj-37", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-37", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-53", 1 ],
                    "source": [ "obj-37", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "order": 1,
                    "source": [ "obj-37", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-69", 0 ],
                    "order": 2,
                    "source": [ "obj-37", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-11", 0 ],
                    "order": 0,
                    "source": [ "obj-44", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-24", 0 ],
                    "order": 1,
                    "source": [ "obj-44", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-44", 0 ],
                    "source": [ "obj-49", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-57", 0 ],
                    "source": [ "obj-54", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-58", 1 ],
                    "source": [ "obj-54", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-62", 0 ],
                    "source": [ "obj-54", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-56", 1 ],
                    "source": [ "obj-57", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "order": 1,
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 1 ],
                    "order": 0,
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-54", 0 ],
                    "source": [ "obj-62", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-14", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-37", 0 ],
                    "source": [ "obj-8", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}