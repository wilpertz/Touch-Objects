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
                    "name": "touch_sliders_b.maxpat",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "offset": [ 0.0, 0.0 ],
                    "patching_rect": [ 550.0, 402.0, 325.0, 272.0 ],
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
                    "patching_rect": [ 97.0, 67.0, 93.0, 21.0 ],
                    "text": "touch.vslider.js"
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
                    "patching_rect": [ 81.0, 488.0, 50.0, 37.0 ],
                    "text": "68.692352"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_min_val", 0 ],
                        [ "set_max_val", 100 ],
                        [ "set_step_amount", 1 ],
                        [ "set_step_speed_ms", 100 ],
                        [ "set_curve_exponent", 0.35 ],
                        [ "mode", 0 ],
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
                        [ "msg_float", 68.69235225497906 ]
                    ],
                    "filename": "touch.vslider.js",
                    "id": "obj-67",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 112.0, 285.0, 41.0, 182.0 ],
                    "textfile": {
                        "filename": "touch.vslider.js",
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
                    "patching_rect": [ 182.0, 165.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "allowPopup",
                    "id": "obj-3",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 182.0, 213.0, 150.0, 23.0 ]
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