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
        "rect": [ 100.0, 100.0, 1482.0, 918.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-6",
                    "linecount": 5,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1147.0, 205.0, 123.0, 82.0 ],
                    "text": "remove scripting name is the best way to avoid accidental object saving"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 0,
                    "id": "obj-55",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 981.833333333333, 364.5833194255829, 117.0, 40.0 ],
                    "text": "rename main slots "
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-53",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 503.0, 199.0, 139.0, 25.0 ],
                    "text": "rename popup slots"
                }
            },
            {
                "box": {
                    "id": "obj-46",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "bang", "" ],
                    "patching_rect": [ 328.0, 163.54166042804718, 33.0, 23.0 ],
                    "text": "t b s"
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "bang", "" ],
                    "patching_rect": [ 940.0, 277.0, 33.0, 23.0 ],
                    "text": "t b s"
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 1078.0, 277.0, 29.5, 23.0 ],
                    "text": "+ 1"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "newobj",
                    "numinlets": 3,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 940.0, 325.0, 157.0, 23.0 ],
                    "text": "pack rename_slot_save s i"
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 940.0, 241.5, 63.0, 23.0 ],
                    "text": "route text"
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "textedit",
                    "numinlets": 1,
                    "numoutlets": 4,
                    "outlettype": [ "", "int", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 940.0, 186.5, 100.0, 50.0 ],
                    "text": "woo"
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
                        [ "set_bordersize", 1.6123595505617978 ],
                        [ "set_corner_radius", 0 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_bgcolor", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "set_bordercolor", 0.45, 0.45, 0.5, 1 ],
                        [ "set_highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bgcolor", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "bordercolor", 0.45, 0.45, 0.5, 1 ],
                        [ "bordersize", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "corner_radius", 0 ],
                        [ "font_name", "Arial" ],
                        [ "fontsize", 13 ],
                        [ "highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "hold_speed", 90 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "modes", "1 2 3 4 5 6 7 8 9 10 11 12" ],
                        [ "multimenu", 0 ],
                        [ "output_type", 2 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "prefix", "Slot Number" ],
                        [ "selected", 3 ],
                        [ "show_arrow", 1 ],
                        [ "show_markers", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_output", 0 ]
                    ],
                    "filename": "touch.ummanu.js",
                    "id": "obj-22",
                    "maxclass": "v8ui",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 1041.5, 241.0, 92.0, 24.0 ],
                    "textfile": {
                        "filename": "touch.ummanu.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    }
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_val", 120 ],
                        [ "set_mode", 0 ],
                        [ "set_touch_type", 1 ],
                        [ "set_step_size", 1 ],
                        [ "set_hold_speed", 50 ],
                        [ "set_text_size", 12 ],
                        [ "set_integer_digits", 3 ],
                        [ "set_decimal_digits", 0 ],
                        [ "set_leading_zeros", 1 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_font", "Arial" ],
                        [ "set_name_tag_on", 1 ],
                        [ "set_name_tag_text", "Tempo" ],
                        [ "set_tag_position", 2 ],
                        [ "set_tag_gap", 10 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_name_tag_x", 0 ],
                        [ "set_name_tag_y", 0 ],
                        [ "set_name_tag_text_size", 12 ],
                        [ "set_number_spacing", 0.1 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_background_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_decimal_color", 1, 1, 1, 0.75 ],
                        [ "set_highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "background_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "decimal_color", 1, 1, 1, 0.75 ],
                        [ "decimal_digits", 0 ],
                        [ "font", "Arial" ],
                        [ "highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "hold_speed", 50 ],
                        [ "integer_digits", 3 ],
                        [ "label_mode", 0 ],
                        [ "leading_zeros", 1 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "name_tag_on", 1 ],
                        [ "name_tag_text", "Tempo" ],
                        [ "name_tag_text_size", 12 ],
                        [ "name_tag_x", 0 ],
                        [ "name_tag_y", 0 ],
                        [ "number_spacing", 0.1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "step_size", 1 ],
                        [ "tag_gap", 10 ],
                        [ "tag_position", 2 ],
                        [ "text_size", 12 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_type", 1 ]
                    ],
                    "filename": "touch.numticker.js",
                    "id": "obj-35",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 783.0, 785.0, 181.0, 30.0 ],
                    "textfile": {
                        "filename": "touch.numticker.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-31",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 22.0, 462.0, 144.0, 39.0 ],
                    "text": "This patch needs autopattr to work!"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 0,
                    "id": "obj-30",
                    "linecount": 8,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 40.0, 212.0, 146.0, 140.0 ],
                    "text": "change different grid orientations \nnote: dragging works best if gid layout alredy set, change grid layout disorders vertical and diaagonal dragging over slots."
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-26",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 529.0, 262.0, 144.0, 53.0 ],
                    "text": "just name the objects and connect to patterstaorage "
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "patching_rect": [ 660.0, 665.0, 103.0, 23.0 ],
                    "restore": [ 0 ],
                    "saved_object_attributes": {
                        "parameter_enable": 0,
                        "parameter_mappable": 0
                    },
                    "text": "pattr this_toggle",
                    "varname": "this_toggle"
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 702.0, 726.0, 24.0, 24.0 ],
                    "varname": "toggle[1]"
                }
            },
            {
                "box": {
                    "id": "obj-27",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "patching_rect": [ 481.0, 675.0, 104.0, 23.0 ],
                    "restore": [ 0, 0, 1 ],
                    "saved_object_attributes": {
                        "parameter_enable": 0,
                        "parameter_mappable": 0
                    },
                    "text": "pattr this_button",
                    "varname": "this_button"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_count", 3 ],
                        [ "set_direction", 0 ],
                        [ "set_group_mode", 0 ],
                        [ "set_all_modes", 2 ],
                        [ "set_flash_time", 100 ],
                        [ "set_modes", "1 1 1" ],
                        [ "set_labels", "Touch/Hold bob joe" ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_text_size", 12 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 270, 90 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_text_color_mode", 1 ],
                        [ "set_btn_color_off", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_btn_color_on", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set", 0, 0, 1 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.12, 0.12, 0.14, 0.85 ],
                        [ "btn_color_on", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "case_mode", 0 ],
                        [ "count", 3 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 0 ],
                        [ "labels", "Touch/Hold bob joe" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "1 1 1" ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-23",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 524.0, 721.0, 118.0, 35.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui"
                }
            },
            {
                "box": {
                    "id": "obj-56",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 472.0, 129.0, 29.5, 23.0 ],
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
                    "patching_rect": [ 328.0, 200.0, 163.0, 23.0 ],
                    "text": "pack rename_pallet_slot s i"
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 328.0, 129.0, 63.0, 23.0 ],
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
                    "patching_rect": [ 328.0, 74.83333539962769, 100.0, 50.0 ],
                    "text": "willy"
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
                    "patching_rect": [ 713.0, 212.0, 144.0, 111.0 ],
                    "text": "Once in the storage menu, click + to add slots, - to remiove slots, save to arm , then select any prename to save store the presets"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-19",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 544.0, 350.0, 240.0, 53.0 ],
                    "text": "1. Click and \"hold\" to save preset\n2.Drag mouse to morph prestes\n3.Double click to open name palette"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-15",
                    "linecount": 4,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 708.5, 76.08333039283752, 153.0, 68.0 ],
                    "text": "dont need these antmore - everything is built in to touch.status"
                }
            },
            {
                "box": {
                    "fontsize": 16.0,
                    "id": "obj-14",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 30.0, 25.0, 174.0, 26.0 ],
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
                    "patching_rect": [ 269.0, 665.0, 150.0, 39.0 ],
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
                    "patching_rect": [ 550.0, 787.5, 150.0, 25.0 ],
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
                    "patching_rect": [ 485.0, 788.5, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "patching_rect": [ 177.0, 673.0, 82.0, 23.0 ],
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
                    "patching_rect": [ 208.0, 721.0, 24.0, 24.0 ],
                    "varname": "toggle"
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 1164.7499825954437, 53.12499797344208, 61.0, 23.0 ],
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
                    "patching_rect": [ 1164.7499825954437, 77.08333039283752, 217.0, 66.0 ],
                    "text": "write \"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/touch.objects/states/honey_chicken.json\""
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 889.7499930858612, 53.12499797344208, 61.0, 23.0 ],
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
                    "patching_rect": [ 889.7499930858612, 77.08333039283752, 226.0, 66.0 ],
                    "text": "read \"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/touch.objects/misc/honey_chicken.json\""
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
                    "patching_rect": [ 205.0, 427.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-54",
                    "linecount": 10,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 812.0, 448.0, 152.0, 150.0 ],
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
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_line_size", 1.5 ],
                        [ "set_handle_size", 9.516666666666667 ],
                        [ "set_track_margin", 14 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 0 ],
                        [ "set_popup_mini_size", 921, 613 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_range_color", 1, 0, 0, 1 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "list", 0, 0, 0, 818.452380952381, 0.15463917525773196, 0, 907.7380952380952, 0.9175257731958762, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "axis_style", 3 ],
                        [ "bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "curve_mode", 1 ],
                        [ "display_value", 1 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "handle_size", 9.516666666666667 ],
                        [ "label_mode", 0 ],
                        [ "latch_first_point", 1 ],
                        [ "latch_last_point", 1 ],
                        [ "line_size", 1.5 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "range_color", 1, 0, 0, 1 ],
                        [ "raw_output_mode", 0 ],
                        [ "rescale_mode", 1 ],
                        [ "show_settings_attrs", 0 ],
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
                    "patching_rect": [ 812.0, 609.0, 364.0, 125.0 ],
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
                        [ "set_bordersize", 1.6123595505617978 ],
                        [ "set_corner_radius", 0 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_bgcolor", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "set_bordercolor", 0.45, 0.45, 0.5, 1 ],
                        [ "set_highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bgcolor", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "bordercolor", 0.45, 0.45, 0.5, 1 ],
                        [ "bordersize", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "corner_radius", 0 ],
                        [ "font_name", "Arial" ],
                        [ "fontsize", 13 ],
                        [ "highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "hold_speed", 90 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "modes", "1 2 3 4 5 6 7 8 9 10 11 12" ],
                        [ "multimenu", 0 ],
                        [ "output_type", 2 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "prefix", "Slot Number" ],
                        [ "selected", 5 ],
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
                    "patching_rect": [ 434.5000014305115, 87.33333492279053, 92.0, 24.0 ],
                    "textfile": {
                        "filename": "touch.ummanu.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    }
                }
            },
            {
                "box": {
                    "format": 6,
                    "id": "obj-47",
                    "maxclass": "flonum",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 34.0, 103.5, 50.0, 23.0 ]
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
                        [ "set_slider_speed", 2 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 0 ],
                        [ "set_popup_mini_size", 1389, 130 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_track_color", 1, 0, 0, 1 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "msg_float", 0.041916167664670656 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
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
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 0 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 2 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 1, 0, 0, 1 ]
                    ],
                    "filename": "touch.hslider.js",
                    "id": "obj-42",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 185.0, 775.0, 167.0, 39.0 ],
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
                    "embedstate": [
                        [ "grid", "4/1" ],
                        [ "set_name_bank_attr", "s1, s2, s2, s2, s2, s2, john, john, john, willy, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, carlo" ],
                        [ "set_name", "honey_chicken" ],
                        [ "set_allow_hold_save", 1 ],
                        [ "set_hold_threshold", 450 ],
                        [ "set_double_tap_threshold", 320 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_text_size", 11 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 320, 110 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_accent_bar_color", 1, 1, 1, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_slot_names", "she, he, dow, woo" ],
                        [ "set_slots_saved", "%5B%22she%22%2C%22he%22%2C%22dow%22%2C%22woo%22%5D" ],
                        [ "msg_float", 4 ],
                        [ "accent_bar_color", 1, 1, 1, 1 ],
                        [ "allow_hold_save", 1 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "case_mode", 0 ],
                        [ "double_tap_threshold", 320 ],
                        [ "font_style", 0 ],
                        [ "grid", "4/1" ],
                        [ "highlight_color", 1, 0.21999999999999997, 0.2499999999999999, 0.46111111111111114 ],
                        [ "hold_threshold", 450 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "name", "honey_chicken" ],
                        [ "name_bank", "s1, s2, s2, s2, s2, s2, john, john, john, willy, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, john, carlo" ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slot_names", "she, he, dow, woo" ],
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
                    "patching_rect": [ 269.0, 354.0, 255.0, 57.0 ],
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
                    "autorestore": "honey_chicken.json",
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 269.0, 470.0, 161.0, 23.0 ],
                    "saved_object_attributes": {
                        "client_rect": [ 3, 100, 416, 445 ],
                        "parameter_enable": 0,
                        "parameter_mappable": 0,
                        "storage_rect": [ 583, 69, 1034, 197 ]
                    },
                    "text": "pattrstorage @savemode 0",
                    "varname": "honey_chicken"
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
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_window_height", 540 ],
                        [ "set_bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_track_color", 1, 0, 0, 1 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "msg_float", 0.034451580571881704 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
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
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 1, 0, 0, 1 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-25",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 107.0, 666.0, 42.0, 153.0 ],
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
                    "patching_rect": [ 177.0, 470.0, 61.0, 23.0 ],
                    "restore": {
                        "h_value": [ 0.041916167664670656 ],
                        "slid": [ 0.08496732026143794 ],
                        "t_slider": [ 6 ],
                        "this_function": [ 0, 0, 0, 818.452380952381, 0.15463917525773196, 0, 907.7380952380952, 0.9175257731958762, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0 ],
                        "v8ui[1]": [ 0.034451580571881704 ],
                        "v8ui_AA": [ 120 ],
                        "v8ui_AF": [ 4 ]
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
                        [ "set_border_thickness", 1.6123595505617978 ],
                        [ "set_border_extension", 4.943820224719101 ],
                        [ "set_track_breadth", 10.134831460674159 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_window_height", 540 ],
                        [ "set_bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_track_color", 1, 0, 0, 1 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "msg_float", 0.08496732026143794 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bg_color", 0.12, 0.12, 0.14, 0.85 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
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
                        [ "mode_color", 0.85, 0.85, 0.9, 1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 0.1 ],
                        [ "step_speed_ms", 5 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 10.134831460674159 ],
                        [ "track_color", 1, 0, 0, 1 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-21",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 38.0, 666.0, 42.0, 153.0 ],
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
                    "patching_rect": [ 438.0, 672.5, 20.0, 140.0 ],
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
                    "patching_rect": [ 301.0, 277.0, 216.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "grid",
                    "id": "obj-8",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 30.0, 151.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "name_bank",
                    "id": "obj-1",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 269.0, 34.0, 426.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
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
                    "destination": [ "obj-11", 0 ],
                    "source": [ "obj-13", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-10", 0 ],
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "source": [ "obj-22", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-23", 0 ],
                    "source": [ "obj-27", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-28", 0 ],
                    "source": [ "obj-29", 1 ]
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
                    "destination": [ "obj-9", 1 ],
                    "source": [ "obj-37", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 0 ],
                    "source": [ "obj-37", 0 ]
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
                    "destination": [ "obj-46", 0 ],
                    "source": [ "obj-41", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-43", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-43", 1 ],
                    "source": [ "obj-46", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-43", 0 ],
                    "source": [ "obj-46", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-47", 0 ]
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
                    "destination": [ "obj-43", 2 ],
                    "source": [ "obj-56", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 2 ],
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
                    "source": [ "obj-8", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 0 ],
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