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
        "rect": [ 574.0, 197.0, 510.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "comment": "",
                    "id": "obj-3",
                    "index": 0,
                    "maxclass": "inlet",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 77.0, 81.0, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 100 ],
                        [ "set_step_amount", 1 ],
                        [ "set_step_speed_ms", 5 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "mode", 0 ],
                        [ "set_allowPopup", 1 ],
                        [ "set_border_radius", 1 ],
                        [ "set_border_thickness", 2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_track_breadth", 23 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_text_size", 12 ],
                        [ "set_base_speed", 1 ],
                        [ "set_mask_values", 1 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_btn_colors", 0 ],
                        [ "set_mask_popup_colors", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_label_text", "Frequency" ],
                        [ "set_sliderColor", 0.03529411764705882, 0.8156862745098039, 0.9647058823529412, 1 ],
                        [ "set_textColor", 1, 1, 1, 1 ],
                        [ "set_bordercolor", 1, 1, 0, 1 ],
                        [ "set_v_needlecolor", 1, 1, 1, 1 ],
                        [ "set_v_outlinecolor", 0.035294117647059, 0.580392156862745, 0.964705882352941, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_bgcolor", 0.1, 0.1, 0.1, 1 ],
                        [ "msg_float", 72.18202726262022 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 77.0, 204.0, 43.0, 185.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 18.0, 66.0, 43.0, 185.0 ],
                    "textfile": {
                        "filename": "touch.vslider.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    }
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_min_val", -100 ],
                        [ "set_max_val", 100 ],
                        [ "set_step_amount", 1 ],
                        [ "set_step_speed_ms", 100 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "set_click_jump_to_mouse", 0 ],
                        [ "set_allowPopup", 1 ],
                        [ "set_border_radius", 1 ],
                        [ "set_border_thickness", 1.2 ],
                        [ "set_border_extension", 6 ],
                        [ "set_track_breadth", 2.5 ],
                        [ "set_slider_breadth", 90 ],
                        [ "set_text_size", 12 ],
                        [ "set_base_speed", 1 ],
                        [ "set_mask_values", 1 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_btn_colors", 0 ],
                        [ "set_mask_popup_colors", 0 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_label_text", "value" ],
                        [ "set_sliderColor", 0, 0, 0, 1 ],
                        [ "set_textColor", 1, 1, 1, 1 ],
                        [ "set_bordercolor", 1, 1, 0, 1 ],
                        [ "set_v_needlecolor", 1, 1, 1, 1 ],
                        [ "set_v_outlinecolor", 1, 0, 0, 1 ],
                        [ "set_attr_bg_color", 0.22, 0.22, 0.22, 1 ],
                        [ "set_attr_border_color", 0.4, 0.4, 0.4, 1 ],
                        [ "set_attr_slider_color", 0.5, 0.5, 0.5, 1 ],
                        [ "set_attr_text_color", 1, 1, 1, 1 ],
                        [ "set_bgcolor", 0.1, 0.1, 0.1, 1 ],
                        [ "msg_float", 14.03124924002968 ]
                    ],
                    "filename": "touch.hslider.js",
                    "id": "obj-67",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 110.0, 150.0, 234.0, 38.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 51.0, 12.0, 234.0, 38.0 ],
                    "textfile": {
                        "filename": "touch.hslider.js",
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
                    "destination": [ "obj-1", 0 ],
                    "order": 1,
                    "source": [ "obj-3", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-67", 0 ],
                    "order": 0,
                    "source": [ "obj-3", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}