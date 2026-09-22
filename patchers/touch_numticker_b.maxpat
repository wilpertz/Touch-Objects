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
        "rect": [ 182.0, 216.0, 1000.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "comment": "",
                    "id": "obj-2",
                    "index": 1,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 128.0, 266.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-1",
                    "index": 1,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 128.0, 97.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_allow_popup", 1 ],
                        [ "set_integer_digits", 3 ],
                        [ "set_decimal_digits", 0 ],
                        [ "set_val", 493.4399999999998 ],
                        [ "set_font", "sans-serif" ],
                        [ "set_text_size", 12 ],
                        [ "set_mode", 0 ],
                        [ "set_touch_type", 1 ],
                        [ "set_step_size", 1 ],
                        [ "set_hold_speed", 50 ],
                        [ "set_leading_zeros", 1 ],
                        [ "set_name_tag_on", 1 ],
                        [ "set_tag_position", 2 ],
                        [ "set_name_tag_text", "Tempo" ],
                        [ "set_name_tag_x", 0 ],
                        [ "set_name_tag_y", 0 ],
                        [ "set_name_tag_text_size", 11 ],
                        [ "set_border_radius", 0 ],
                        [ "set_border_thickness", 1.2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_background_color", 0.12, 0.12, 0.12, 1 ],
                        [ "set_border_color", 0.9647058823529412, 1, 0, 1 ],
                        [ "set_textcolor", 0.9, 0.9, 0.9, 1 ],
                        [ "set_highlight_color", 1, 0, 0, 1 ],
                        [ "set_tag_color", 0.9058823529411765, 0.027450980392156862, 0.027450980392156862, 1 ],
                        [ "set_mask_values", 1 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_colors", 0 ]
                    ],
                    "filename": "touch.numticker.js",
                    "id": "obj-67",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 128.0, 168.0, 156.0, 32.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 1.0, 1.0, 156.0, 32.0 ],
                    "textfile": {
                        "filename": "touch.numticker.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
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
                    "destination": [ "obj-2", 0 ],
                    "source": [ "obj-67", 0 ]
                }
            }
        ],
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}