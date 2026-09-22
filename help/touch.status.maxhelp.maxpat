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
        "rect": [ 129.0, 117.0, 1396.0, 912.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-69",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 520.0, 383.5, 144.0, 53.0 ],
                    "presentation_linecount": 3,
                    "text": "open the gate to store when slot is assigned"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 2,
                    "id": "obj-66",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 291.5, 65.0, 179.0, 40.0 ],
                    "presentation_linecount": 2,
                    "text": "Prename or change slot name"
                }
            },
            {
                "box": {
                    "id": "obj-65",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 292.0, 394.5, 102.0, 23.0 ],
                    "text": "set john"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-63",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 69.0, 156.0, 142.0, 25.0 ],
                    "text": "Choose slot to name"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_slider_style", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_min_val", 1 ],
                        [ "set_max_val", 2 ],
                        [ "set_step_amount", 0.1 ],
                        [ "set_step_speed_ms", 5 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 280, 130 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 1.3499718223812078 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "curve_exponent", 0.35 ],
                        [ "font_name", "Arial" ],
                        [ "font_size", 12 ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "label_mode", 0 ],
                        [ "label_text", "value" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "max_val", 2 ],
                        [ "min_val", 1 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ]
                    ],
                    "filename": "touch.hslider.js",
                    "id": "obj-62",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 74.0, 247.5, 166.0, 25.0 ],
                    "textfile": {
                        "filename": "touch.hslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AB"
                }
            },
            {
                "box": {
                    "id": "obj-58",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 142.0, 301.5, 93.0, 23.0 ],
                    "text": "rename 5 11/8"
                }
            },
            {
                "box": {
                    "id": "obj-56",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 257.0, 197.5, 29.5, 23.0 ],
                    "text": "+ 1"
                }
            },
            {
                "box": {
                    "id": "obj-43",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 257.0, 248.5, 91.0, 23.0 ],
                    "text": "pak rename i s"
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 331.0, 202.5, 63.0, 23.0 ],
                    "text": "route text"
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "textedit",
                    "numinlets": 1,
                    "numoutlets": 4,
                    "outlettype": [ "", "int", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 331.0, 121.5, 100.0, 50.0 ],
                    "text": "11/8"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-20",
                    "linecount": 7,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 701.0, 265.5, 144.0, 111.0 ],
                    "presentation_linecount": 7,
                    "text": "Once in the storage menu, click + to add slots, - to remiove slots, save to arm , then select any prename to save store the presets"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-19",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 538.0, 301.5, 144.0, 39.0 ],
                    "presentation_linecount": 2,
                    "text": "Click and \"hold\" to open storage menu"
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
                    "patching_rect": [ 607.0, 456.5, 144.0, 39.0 ],
                    "presentation_linecount": 2,
                    "text": "Max can find these file in /Packages"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-15",
                    "linecount": 7,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1175.0, 54.0, 150.0, 111.0 ],
                    "presentation_linecount": 7,
                    "text": "in this address is \"states\" folder - go to \"Options\" memu and select \"file preferences\" to add a states folder to your search path"
                }
            },
            {
                "box": {
                    "fontsize": 16.0,
                    "id": "obj-14",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 61.0, 28.0, 174.0, 26.0 ],
                    "text": "touch.status.maxhelp"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-12",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 647.0, 670.0, 150.0, 39.0 ],
                    "presentation_linecount": 2,
                    "text": "use pattr with max objects"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-18",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 750.0, 726.0, 150.0, 25.0 ],
                    "text": "no scripting name"
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-16",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 685.0, 727.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "patching_rect": [ 549.0, 678.0, 82.0, 23.0 ],
                    "restore": [ 0 ],
                    "saved_object_attributes": {
                        "parameter_enable": 0,
                        "parameter_mappable": 0
                    },
                    "text": "pattr t_oggle",
                    "varname": "t_oggle"
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 580.0, 726.0, 24.0, 24.0 ],
                    "varname": "toggle"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 459.0, 361.5, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 478.0, 398.5, 34.0, 23.0 ],
                    "text": "gate"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 478.0, 429.5, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 478.0, 464.5, 117.0, 23.0 ],
                    "text": "write drum_kit.json"
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 937.0, 52.0, 61.0, 23.0 ],
                    "text": "loadbang"
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "linecount": 4,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 937.0, 76.0, 218.0, 66.0 ],
                    "text": "write \"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/touch.objects/states/drum_kit.json\""
                }
            },
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 319.0, 464.5, 114.0, 23.0 ],
                    "text": "read drum_kit.json"
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 624.0, 52.0, 61.0, 23.0 ],
                    "text": "loadbang"
                }
            },
            {
                "box": {
                    "id": "obj-59",
                    "linecount": 4,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 624.0, 76.0, 278.0, 66.0 ],
                    "text": "read \"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/touch.objects/states/drum_kit.json\""
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 189.0, 435.5, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-54",
                    "linecount": 10,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 928.0, 460.0, 152.0, 150.0 ],
                    "text": "\"If you plan to morph between envelopes with different shapes, initialize all intermediate points on the line/axis in Preset 1 so they glide into place from where you want them, rather than peeling off from the end.\""
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_rescale_mode", 1 ],
                        [ "set_curve_mode", 1 ],
                        [ "set_latch_first_point", 1 ],
                        [ "set_latch_last_point", 1 ],
                        [ "set_raw_output_mode", 0 ],
                        [ "set_x_min", 0 ],
                        [ "set_x_max", 1000 ],
                        [ "set_y_min", 0 ],
                        [ "set_y_max", 1 ],
                        [ "set_display_value", 1 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_text_size", 10 ],
                        [ "set_axis_style", 3 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_line_size", 1.5 ],
                        [ "set_handle_size", 7 ],
                        [ "set_track_margin", 14 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 420, 180 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "list", 0, 0, 0, 360.1190476190476, 0.15463917525773196, 0, 610.1190476190477, 0.4020618556701031, -0.06000000000000005, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "axis_style", 3 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "curve_mode", 1 ],
                        [ "display_value", 1 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "handle_size", 7 ],
                        [ "label_mode", 0 ],
                        [ "latch_first_point", 1 ],
                        [ "latch_last_point", 1 ],
                        [ "line_size", 1.5 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "range_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "raw_output_mode", 0 ],
                        [ "rescale_mode", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_size", 10 ],
                        [ "track_margin", 14 ],
                        [ "x_max", 1000 ],
                        [ "x_min", 0 ],
                        [ "y_max", 1 ],
                        [ "y_min", 0 ]
                    ],
                    "filename": "touch.pfunction.js",
                    "id": "obj-50",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 928.0, 621.0, 364.0, 125.0 ],
                    "textfile": {
                        "filename": "touch.pfunction.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "this_function"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_modes", "1 2 3 4 5 6 7 8 9 10 11 12" ],
                        [ "set_prefix", "Slot Number" ],
                        [ "set_mode", 0 ],
                        [ "set_multimenu", 0 ],
                        [ "set_output_type", 2 ],
                        [ "set_touch_output", 0 ],
                        [ "set_show_markers", 1 ],
                        [ "set_show_arrow", 1 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_hold_speed", 90 ],
                        [ "set_fontsize", 13 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_bordersize", 2.662921348314607 ],
                        [ "set_corner_radius", 0 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_bgcolor", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "set_bordercolor", 0, 0, 0, 1 ],
                        [ "set_highlight_color", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bgcolor", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "bordercolor", 0, 0, 0, 1 ],
                        [ "bordersize", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "corner_radius", 0 ],
                        [ "font_name", "Arial" ],
                        [ "fontsize", 13 ],
                        [ "highlight_color", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "hold_speed", 90 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "modes", "1 2 3 4 5 6 7 8 9 10 11 12" ],
                        [ "multimenu", 0 ],
                        [ "output_type", 2 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "prefix", "Slot Number" ],
                        [ "selected", 4 ],
                        [ "show_arrow", 1 ],
                        [ "show_markers", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_output", 0 ]
                    ],
                    "filename": "touch.ummanu.js",
                    "id": "obj-48",
                    "maxclass": "v8ui",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 221.0, 156.5, 92.0, 24.0 ],
                    "textfile": {
                        "filename": "touch.ummanu.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_slider_style", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_step_amount", 0.1 ],
                        [ "set_step_speed_ms", 5 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 280, 130 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "msg_float", 0.6022220697330525 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "curve_exponent", 0.35 ],
                        [ "font_name", "Arial" ],
                        [ "font_size", 12 ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "label_mode", 0 ],
                        [ "label_text", "value" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "max_val", 1 ],
                        [ "min_val", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ]
                    ],
                    "filename": "touch.hslider.js",
                    "id": "obj-42",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 270.0, 707.0, 167.0, 39.0 ],
                    "textfile": {
                        "filename": "touch.hslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "h_value"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_grid", 3, 2 ],
                        [ "set_name_bank_attr", "4/4, 3/8 4/4, 2/2, 7/8, 11/8, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, carlo" ],
                        [ "set_name", "drum_kit" ],
                        [ "set_allow_hold_edit", 1 ],
                        [ "set_hold_threshold", 450 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_text_size", 11 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 0 ],
                        [ "set_popup_mini_size", 320, 110 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_highlight_color", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_slots_saved", "%5B%22Init%20Status%22%2C%22Clean%20Tone%22%2C%22Lead%2080s%22%2C%22john%22%2C%22Heavy%20Drive%22%2C%22Solo%20Boost%22%5D" ],
                        [ "list", 1, 2 ],
                        [ "allow_hold_edit", 1 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "font_style", 0 ],
                        [ "grid", "3/2" ],
                        [ "highlight_color", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "hold_threshold", 450 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "name", "drum_kit" ],
                        [ "name_bank", "4/4, 3/8 4/4, 2/2, 7/8, 11/8, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, carlo" ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 0 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_size", 11 ]
                    ],
                    "filename": "touch.status.js",
                    "id": "obj-39",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 257.0, 297.0, 255.0, 57.0 ],
                    "textfile": {
                        "filename": "touch.status.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AF"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_count", 1 ],
                        [ "set_direction", 0 ],
                        [ "set_group_mode", 0 ],
                        [ "set_all_modes", 1 ],
                        [ "set_flash_time", 100 ],
                        [ "set_modes", "1" ],
                        [ "set_labels", "Touch/Hold rock/roll bob/tom" ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_text_size", 12 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_text_color_mode", 1 ],
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "case_mode", 0 ],
                        [ "count", 1 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 0 ],
                        [ "labels", "Touch/Hold rock/roll bob/tom" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "1" ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-34",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 274.5, 631.0, 212.0, 48.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "button"
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 257.0, 523.5, 215.0, 23.0 ],
                    "saved_object_attributes": {
                        "client_rect": [ 3, 100, 416, 445 ],
                        "parameter_enable": 0,
                        "parameter_mappable": 0,
                        "storage_rect": [ 583, 69, 1034, 197 ]
                    },
                    "text": "pattrstorage drum_kit @savemode 0",
                    "varname": "drum_kit"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_slider_style", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_step_amount", 0.1 ],
                        [ "set_step_speed_ms", 5 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_window_height", 540 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "msg_float", 0.6013071895424836 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "curve_exponent", 0.35 ],
                        [ "font_name", "Arial" ],
                        [ "font_size", 12 ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "label_mode", 0 ],
                        [ "label_text", "value" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "max_val", 1 ],
                        [ "min_val", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-25",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 193.0, 631.0, 42.0, 153.0 ],
                    "textfile": {
                        "filename": "touch.vslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui[1]"
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 4,
                    "outlettype": [ "", "", "", "" ],
                    "patching_rect": [ 165.0, 523.5, 61.0, 23.0 ],
                    "restore": {
                        "button": [ 0 ],
                        "h_value": [ 0.6022220697330525 ],
                        "slid": [ 0.1568627450980392 ],
                        "t_slider": [ 13 ],
                        "this_function": [ 0, 0, 0, 360.1190476190476, 0.15463917525773196, 0, 610.1190476190477, 0.4020618556701031, -0.06000000000000005, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0 ],
                        "v8ui[1]": [ 0.6013071895424836 ],
                        "v8ui_AA": [ 4 ],
                        "v8ui_AB": [ 1.3499718223812078 ],
                        "v8ui_AF": [ 1, 2 ]
                    },
                    "text": "autopattr",
                    "varname": "u620003692"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_slider_style", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 1 ],
                        [ "set_step_amount", 0.1 ],
                        [ "set_step_speed_ms", 5 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 2.662921348314607 ],
                        [ "set_border_extension", 7.640449438202247 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_window_height", 540 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0, 0, 0, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "msg_float", 0.1568627450980392 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0, 0, 0, 1 ],
                        [ "border_extension", 7.640449438202247 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 2.662921348314607 ],
                        [ "case_mode", 0 ],
                        [ "curve_exponent", 0.35 ],
                        [ "font_name", "Arial" ],
                        [ "font_size", 12 ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "label_mode", 0 ],
                        [ "label_text", "value" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "max_val", 1 ],
                        [ "min_val", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-21",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 136.0, 635.0, 42.0, 153.0 ],
                    "textfile": {
                        "filename": "touch.vslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "slid"
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "slider",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 505.0, 631.0, 20.0, 140.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_linknames": 1,
                            "parameter_longname": "t_slider",
                            "parameter_modmode": 4,
                            "parameter_shortname": "name",
                            "parameter_type": 1,
                            "parameter_unitstyle": 0
                        }
                    },
                    "varname": "t_slider"
                }
            },
            {
                "box": {
                    "attr": "name",
                    "id": "obj-40",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 411.0, 248.5, 216.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "grid",
                    "id": "obj-68",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 411.0, 215.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-33", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-10", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-11", 0 ],
                    "source": [ "obj-13", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-33", 0 ],
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-38", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-33", 0 ],
                    "source": [ "obj-39", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-65", 1 ],
                    "source": [ "obj-39", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 1 ],
                    "source": [ "obj-39", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-40", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-43", 2 ],
                    "source": [ "obj-41", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "order": 0,
                    "source": [ "obj-43", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-58", 1 ],
                    "order": 1,
                    "source": [ "obj-43", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-56", 0 ],
                    "source": [ "obj-48", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-59", 0 ],
                    "source": [ "obj-49", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-43", 1 ],
                    "source": [ "obj-56", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-33", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-62", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-68", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "source": [ "obj-9", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-2": [ "t_slider", "name", 0 ],
            "parameterbanks": {
                "0": {
                    "index": 0,
                    "name": "",
                    "parameters": [ "-", "-", "-", "-", "-", "-", "-", "-" ],
                    "buttons": [ "-", "-", "-", "-", "-", "-", "-", "-" ]
                }
            },
            "inherited_shortname": 1
        },
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}