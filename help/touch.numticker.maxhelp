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
                    "bgmode": 0,
                    "border": 0,
                    "clickthrough": 0,
                    "enablehscroll": 0,
                    "enablevscroll": 0,
                    "id": "obj-12",
                    "lockeddragscroll": 0,
                    "lockedsize": 0,
                    "maxclass": "bpatcher",
                    "numinlets": 0,
                    "numoutlets": 0,
                    "offset": [ 0.0, 0.0 ],
                    "patching_rect": [ 426.0, 107.0, 128.0, 128.0 ],
                    "viewvisibility": 1
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-9",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 723.0, 385.0, 151.0, 53.0 ],
                    "text": "change modes and attrui in popup in bpatcher"
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 519.0, 446.0, 50.0, 23.0 ],
                    "text": "281"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 3,
                    "id": "obj-44",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 863.0, 178.0, 151.0, 53.0 ],
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
                    "name": "touch_numticker_b.maxpat",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "offset": [ 0.0, 0.0 ],
                    "outlettype": [ "" ],
                    "patching_rect": [ 550.0, 402.0, 164.0, 36.0 ],
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
                    "patching_rect": [ 38.0, 226.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 97.0, 67.0, 112.0, 21.0 ],
                    "text": "touch.numticker.js"
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 81.0, 488.0, 50.0, 23.0 ],
                    "text": "503.08"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_val", 503.0800000000012 ],
                        [ "set_mode", 1 ],
                        [ "set_touch_type", 1 ],
                        [ "set_step_size", 1 ],
                        [ "set_hold_speed", 50 ],
                        [ "set_text_size", 12 ],
                        [ "set_integer_digits", 4 ],
                        [ "set_decimal_digits", 2 ],
                        [ "set_leading_zeros", 1 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_name_tag_on", 0 ],
                        [ "set_name_tag_text", "ticker" ],
                        [ "set_tag_position", 0 ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_name_tag_x", 0 ],
                        [ "set_name_tag_y", 0 ],
                        [ "set_name_tag_text_size", 11 ],
                        [ "set_border_radius", 8 ],
                        [ "set_border_thickness", 1.2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_mode_color", 0.6, 0.6, 0.6, 1 ],
                        [ "set_background_color", 0.12, 0.12, 0.12, 1 ],
                        [ "set_border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "set_textcolor", 0.9, 0.9, 0.9, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_decimal_color", 1, 1, 1, 0.75 ],
                        [ "set_highlight_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "set_attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "set_attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "set_attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_colors", 0 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.29565217391304344, 0.2940096618357488, 0.2940096618357488, 1 ],
                        [ "attr_border_color", 1, 0.9694444444444446, 0.08333333333333337, 1 ],
                        [ "attr_slider_color", 1, 1, 0.5666666666666667, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "background_color", 0.12, 0.12, 0.12, 1 ],
                        [ "border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "border_extension", 6 ],
                        [ "border_radius", 8 ],
                        [ "border_thickness", 1.2 ],
                        [ "case_mode", 0 ],
                        [ "decimal_color", 1, 1, 1, 0.75 ],
                        [ "decimal_digits", 2 ],
                        [ "font", "sans-serif" ],
                        [ "highlight_color", 1, 0, 0, 1 ],
                        [ "hold_speed", 50 ],
                        [ "integer_digits", 4 ],
                        [ "label_mode", 0 ],
                        [ "leading_zeros", 1 ],
                        [ "mask_colors", 0 ],
                        [ "mask_geometry", 0 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 1 ],
                        [ "mode_color", 0.6, 0.6, 0.6, 1 ],
                        [ "name_tag_on", 0 ],
                        [ "name_tag_text", "ticker" ],
                        [ "name_tag_text_size", 11 ],
                        [ "name_tag_x", 0 ],
                        [ "name_tag_y", 0 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "step_size", 1 ],
                        [ "tag_position", 0 ],
                        [ "text_size", 12 ],
                        [ "textcolor", 0.9, 0.9, 0.9, 1 ],
                        [ "touch_type", 1 ]
                    ],
                    "filename": "touch.numticker.js",
                    "id": "obj-67",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 112.0, 285.0, 123.0, 31.0 ],
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
                    "attr": "mode",
                    "id": "obj-1",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 112.0, 184.0, 198.0, 23.0 ]
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
                    "patching_rect": [ 182.0, 234.0, 150.0, 23.0 ]
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
            },
            {
                "patchline": {
                    "destination": [ "obj-8", 1 ],
                    "source": [ "obj-7", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}