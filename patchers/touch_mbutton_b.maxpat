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
        "rect": [ 217.0, 195.0, 1000.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "comment": "",
                    "id": "obj-1",
                    "index": 0,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 145.0, 206.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-15",
                    "index": 0,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 64.0, 206.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "comment": "",
                    "id": "obj-14",
                    "index": 0,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 64.0, 32.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_count", 1 ],
                        [ "set_direction", 0 ],
                        [ "set_group_mode", 0 ],
                        [ "set_all_modes", 2 ],
                        [ "set_flash_time", 100 ],
                        [ "set_modes", "2" ],
                        [ "set_labels", "Touch/Hold" ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_font_style", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_text_size", 12 ],
                        [ "set_border_radius", 4 ],
                        [ "set_border_thickness", 1.2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_popup_mini_size", 320, 140 ],
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_text_color_mode", 1 ],
                        [ "set_btn_color_off", 0.12, 0.12, 0.14, 1 ],
                        [ "set_btn_color_on", 1, 0.22, 0.25, 1 ],
                        [ "set_border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "set_text_color", 0.95, 0.95, 0.95, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.1, 0.1, 0.12, 1 ],
                        [ "set_attr_bg_color", 0.14, 0.14, 0.16, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.35, 0.38, 0.42, 1 ],
                        [ "set_attr_text_color", 0.88, 0.88, 0.88, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.14, 0.14, 0.16, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.35, 0.38, 0.42, 1 ],
                        [ "attr_text_color", 0.88, 0.88, 0.88, 1 ],
                        [ "border_color", 0.45, 0.45, 0.5, 1 ],
                        [ "border_extension", 6 ],
                        [ "border_radius", 4 ],
                        [ "border_thickness", 1.2 ],
                        [ "btn_color_off", 0.12, 0.12, 0.14, 1 ],
                        [ "btn_color_on", 1, 0.22, 0.25, 1 ],
                        [ "case_mode", 0 ],
                        [ "count", 1 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 0 ],
                        [ "labels", "Touch/Hold" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "2" ],
                        [ "pop_bgcolor", 0.1, 0.1, 0.12, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.95, 0.95, 0.95, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-12",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 64.0, 107.0, 100.0, 40.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 0.0, 1.0, 68.0, 67.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    }
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-1", 0 ],
                    "source": [ "obj-12", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-14", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}