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
        "rect": [ 100.0, 100.0, 972.0, 750.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "patching_rect": [ 334.0, 646.0, 29.5, 23.0 ],
                    "text": "+ 1"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_modes", "\"Core Audio\" NonRealTime \"ad portaudio Core Audio\"" ],
                        [ "set_prefix", "Driver" ],
                        [ "set_mode", 1 ],
                        [ "set_multimenu", 0 ],
                        [ "set_output_type", 2 ],
                        [ "set_touch_output", 0 ],
                        [ "set_show_markers", 1 ],
                        [ "set_show_arrow", 0 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_hold_speed", 90 ],
                        [ "set_fontsize", 11 ],
                        [ "set_font_name", "SF Pro Text" ],
                        [ "set_label_mode", 4 ],
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
                        [ "font_name", "SF Pro Text" ],
                        [ "fontsize", 11 ],
                        [ "highlight_color", 0.9161996779388083, 0.9739130434782609, 0.6276328502415458, 0.5666666666666667 ],
                        [ "hold_speed", 90 ],
                        [ "label_mode", 4 ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 1 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "modes", "\"Core Audio\" NonRealTime \"ad portaudio Core Audio\"" ],
                        [ "multimenu", 0 ],
                        [ "output_type", 2 ],
                        [ "pop_bgcolor", 0.24347826086956526, 0.2297262479871176, 0.16096618357487924, 1 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "prefix", "Driver" ],
                        [ "selected", 0 ],
                        [ "show_arrow", 0 ],
                        [ "show_markers", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_output", 0 ]
                    ],
                    "filename": "touch.ummanu.js",
                    "id": "obj-201",
                    "maxclass": "v8ui",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 284.0, 608.0, 119.0, 22.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 305.9233522415161, 3.8327527046203613, 119.1637659072876, 19.16724729537964 ],
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
                    "fontname": "Arial",
                    "fontsize": 11.0,
                    "id": "obj-2",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 4,
                    "outlettype": [ "int", "float", "int", "int" ],
                    "patching_rect": [ 120.0, 535.0, 59.0, 21.0 ],
                    "text": "dspstate~"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.0,
                    "id": "obj-38",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 191.0, 535.0, 67.0, 21.0 ],
                    "text": "loadmess 1"
                }
            },
            {
                "box": {
                    "fontname": "Arial",
                    "fontsize": 11.0,
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "numinlets": 2,
                    "numoutlets": 2,
                    "outlettype": [ "", "int" ],
                    "patching_rect": [ 191.0, 609.0, 83.0, 21.0 ],
                    "text": "adstatus driver"
                }
            },
            {
                "box": {
                    "bgcolor": [ 1.0, 1.0, 1.0, 0.0 ],
                    "blinkcolor": [ 1.0, 1.0, 0.0, 1.0 ],
                    "id": "obj-61",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "outlinecolor": [ 0.1, 0.2, 1.0, 1.0 ],
                    "parameter_enable": 1,
                    "patching_rect": [ 191.0, 573.0, 20.0, 20.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_enum": [ "off", "on" ],
                            "parameter_longname": "button",
                            "parameter_mmax": 1,
                            "parameter_modmode": 0,
                            "parameter_shortname": "button",
                            "parameter_type": 2
                        }
                    },
                    "varname": "button"
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 266.0, 419.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 2,
                    "id": "obj-15",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 600.0, 418.5, 150.0, 68.0 ],
                    "text": "Look inside bpatcher to see how to load entire folders"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-13",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 779.0, 477.5, 150.0, 25.0 ],
                    "text": "Change output mode"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-10",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 754.0, 115.0, 152.0, 39.0 ],
                    "text": "Just hide all the attrui and drag the popup"
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 600.0, 572.5, 83.0, 23.0 ],
                    "text": "prepend load"
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 600.0, 607.5, 60.0, 23.0 ],
                    "text": "pcontrol"
                }
            },
            {
                "box": {
                    "attr": "label_mode",
                    "id": "obj-37",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 264.0, 114.0, 267.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "output_type",
                    "id": "obj-36",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 264.0, 76.0, 267.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_popup_colors",
                    "id": "obj-35",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 223.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_colors",
                    "id": "obj-34",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 184.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_geometry",
                    "id": "obj-28",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 148.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_labels",
                    "id": "obj-27",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 106.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_performance",
                    "id": "obj-25",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 67.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 55.0, 253.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 187.5, 419.0, 50.0, 23.0 ],
                    "text": "5"
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 109.0, 419.0, 50.0, 37.0 ],
                    "text": "Mode 5"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_modes", "1 2 3 4 5 6" ],
                        [ "set_prefix", "Mode, Instruments, Devices, Input, Video, Data" ],
                        [ "set_mode", 0 ],
                        [ "set_multimenu", 0 ],
                        [ "set_output_type", 3 ],
                        [ "set_touch_output", 0 ],
                        [ "set_show_markers", 1 ],
                        [ "set_show_arrow", 1 ],
                        [ "set_allow_popup", 1 ],
                        [ "set_hold_speed", 90 ],
                        [ "set_fontsize", 13 ],
                        [ "set_font_name", "Arial" ],
                        [ "set_label_mode", 0 ],
                        [ "set_case_mode", 0 ],
                        [ "set_bordersize", 0.747191011235955 ],
                        [ "set_corner_radius", 14.325842696629213 ],
                        [ "set_border_extension", 5.842696629213483 ],
                        [ "set_bgcolor", 0.10434782608695647, 0.10434782608695647, 0.10434782608695647, 0.5333333333333333 ],
                        [ "set_textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "set_bordercolor", 0.8197101449275362, 0.9130434782608696, 0.21304347826086953, 0 ],
                        [ "set_highlight_color", 0.896, 1, 0.21999999999999997, 0.42777777777777776 ],
                        [ "set_mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "set_popup_dot_color", 0.85, 0.85, 0.85, 0.7 ],
                        [ "set_pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "set_attr_bg_color", 0.18, 0.18, 0.22, 1 ],
                        [ "set_attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "set_attr_slider_color", 0.35, 0.38, 0.42, 1 ],
                        [ "set_attr_text_color", 0.88, 0.88, 0.88, 1 ],
                        [ "set_show_settings_attrs", 1 ],
                        [ "set_mask_performance", 0 ],
                        [ "set_mask_labels", 0 ],
                        [ "set_mask_geometry", 0 ],
                        [ "set_mask_colors", 0 ],
                        [ "set_mask_popup_colors", 0 ],
                        [ "set_popup_mini_size", 420, 150 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.18, 0.18, 0.22, 1 ],
                        [ "attr_border_color", 0.28, 0.28, 0.32, 1 ],
                        [ "attr_slider_color", 0.35, 0.38, 0.42, 1 ],
                        [ "attr_text_color", 0.88, 0.88, 0.88, 1 ],
                        [ "bgcolor", 0.10434782608695647, 0.10434782608695647, 0.10434782608695647, 0.5333333333333333 ],
                        [ "border_extension", 5.842696629213483 ],
                        [ "bordercolor", 0.8197101449275362, 0.9130434782608696, 0.21304347826086953, 0 ],
                        [ "bordersize", 0.747191011235955 ],
                        [ "case_mode", 0 ],
                        [ "corner_radius", 14.325842696629213 ],
                        [ "font_name", "Arial" ],
                        [ "fontsize", 13 ],
                        [ "highlight_color", 0.896, 1, 0.21999999999999997, 0.42777777777777776 ],
                        [ "hold_speed", 90 ],
                        [ "label_mode", 0 ],
                        [ "mask_colors", 0 ],
                        [ "mask_geometry", 0 ],
                        [ "mask_labels", 0 ],
                        [ "mask_performance", 0 ],
                        [ "mask_popup_colors", 0 ],
                        [ "mode", 0 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "modes", "1 2 3 4 5 6" ],
                        [ "multimenu", 0 ],
                        [ "output_type", 3 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 0.85, 0.85, 0.85, 0.7 ],
                        [ "prefix", "Mode, Instruments, Devices, Input, Video, Data" ],
                        [ "selected", 5 ],
                        [ "show_arrow", 1 ],
                        [ "show_markers", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_output", 0 ]
                    ],
                    "filename": "touch.ummanu.js",
                    "id": "obj-5",
                    "maxclass": "v8ui",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 140.0, 344.0, 176.0, 38.0 ],
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
                    "bgmode": 0,
                    "border": 0,
                    "clickthrough": 0,
                    "enablehscroll": 0,
                    "enablevscroll": 0,
                    "id": "obj-7",
                    "lockeddragscroll": 0,
                    "lockedsize": 0,
                    "maxclass": "bpatcher",
                    "name": "touch_ummanu_b.maxpat",
                    "numinlets": 0,
                    "numoutlets": 1,
                    "offset": [ 0.0, 0.0 ],
                    "outlettype": [ "" ],
                    "patching_rect": [ 600.0, 484.5, 172.0, 36.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 489.0, 220.0, 181.0, 36.0 ],
                    "viewvisibility": 1
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 59.0, 22.0, 116.0, 35.0 ],
                    "text": "touch.ummanu.js help file"
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
                    "patching_rect": [ 59.0, 153.0, 169.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "allow_popup",
                    "id": "obj-14",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 87.5, 193.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mask_colors",
                    "id": "obj-24",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 569.0, 32.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 0 ],
                    "source": [ "obj-11", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-12", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-61", 0 ],
                    "source": [ "obj-2", 3 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-61", 0 ],
                    "source": [ "obj-2", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-61", 0 ],
                    "source": [ "obj-2", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-61", 0 ],
                    "source": [ "obj-2", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-17", 0 ],
                    "source": [ "obj-201", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-27", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-28", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-34", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-35", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-36", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "source": [ "obj-37", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-61", 0 ],
                    "source": [ "obj-38", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-16", 1 ],
                    "source": [ "obj-5", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-8", 1 ],
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-9", 1 ],
                    "source": [ "obj-5", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-201", 0 ],
                    "source": [ "obj-6", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "midpoints": [ 200.5, 630.0, 200.5, 630.0 ],
                    "source": [ "obj-61", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-11", 0 ],
                    "source": [ "obj-7", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-61": [ "button", "button", 0 ],
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