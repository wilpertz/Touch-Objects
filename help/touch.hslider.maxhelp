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
        "rect": [ 100.0, 100.0, 1032.0, 790.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-44",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 858.0, 178.0, 151.0, 53.0 ],
                    "text": "in the inspector add or remove attrui from popup "
                }
            },
            {
                "box": {
                    "bgmode": 0,
                    "border": 0,
                    "clickthrough": 0,
                    "enablehscroll": 0,
                    "enablevscroll": 0,
                    "id": "obj-7",
                    "lockeddragscroll": 0,
                    "lockedsize": 0,
                    "maxclass": "bpatcher",
                    "name": "touch_sliders_b.maxpat",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "offset": [ 0.0, 0.0 ],
                    "patching_rect": [ 551.0, 383.0, 336.0, 270.0 ],
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
                    "patching_rect": [ 112.0, 165.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 112.0, 65.0, 150.0, 21.0 ],
                    "text": "touch.hslider.js"
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 81.0, 316.0, 50.0, 37.0 ],
                    "text": "28.313801"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_slider_style", 0 ],
                        [ "set_mode", 0 ],
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 100 ],
                        [ "set_step_amount", 1 ],
                        [ "set_step_speed_ms", 100 ],
                        [ "set_slider_speed", 1 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_label_text", "value" ],
                        [ "set_border_radius", 1 ],
                        [ "set_border_thickness", 1.2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_track_breadth", 2.5 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_font_size", 12 ],
                        [ "set_font_style", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 0 ],
                        [ "set_popup_mini_size", 1305, 130 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 0 ],
                        [ "set_bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 1 ],
                        [ "set_track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ],
                        [ "set_handle_color", 1, 1, 1, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "msg_float", 28.313800979080302 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "attr_border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "attr_text_color", 1, 1, 1, 1 ],
                        [ "bg_color", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "border_color", 0.9130434782608696, 0.8420289855072465, 0.8420289855072465, 1 ],
                        [ "border_extension", 6 ],
                        [ "border_radius", 1 ],
                        [ "border_thickness", 1.2 ],
                        [ "case_mode", 0 ],
                        [ "curve_exponent", 0.35 ],
                        [ "font_name", "Arial" ],
                        [ "font_size", 12 ],
                        [ "font_style", 0 ],
                        [ "handle_color", 1, 1, 1, 1 ],
                        [ "label_mode", 0 ],
                        [ "label_text", "value" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 0 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 0 ],
                        [ "max_val", 100 ],
                        [ "min_val", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 0 ],
                        [ "slider_breadth", 90 ],
                        [ "slider_speed", 1 ],
                        [ "slider_style", 0 ],
                        [ "step_amount", 1 ],
                        [ "step_speed_ms", 100 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "track_breadth", 2.5 ],
                        [ "track_color", 0.4521739130434783, 0.4371014492753624, 0.4371014492753624, 0.4722222222222222 ]
                    ],
                    "filename": "touch.hslider.js",
                    "id": "obj-67",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 112.0, 242.0, 234.0, 38.0 ],
                    "textfile": {
                        "filename": "touch.hslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "attr": "mode",
                    "id": "obj-1",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 178.0, 165.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "allow_popup",
                    "id": "obj-3",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 187.0, 202.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-67", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-67", 0 ],
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-67", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-2", 1 ],
                    "order": 0,
                    "source": [ "obj-67", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "order": 1,
                    "source": [ "obj-67", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}