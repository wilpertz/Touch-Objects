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
        "rect": [ 312.0, 197.0, 1000.0, 780.0 ],
        "openinpresentation": 1,
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "comment": "",
                    "id": "obj-6",
                    "index": 0,
                    "maxclass": "outlet",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 243.0, 462.6553955078125, 30.0, 30.0 ]
                }
            },
            {
                "box": {
                    "attr": "touch_output",
                    "id": "obj-5",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 71.0, 129.0, 280.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "output_type",
                    "id": "obj-4",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 165.0, 171.0, 186.0, 23.0 ]
                }
            },
            {
                "box": {
                    "fontsize": 12.0,
                    "id": "obj-3",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 50.0, 40.0, 236.0, 64.0 ],
                    "text": "touch.menupicker.js \nmultimenu mode + autopopulate\n\n"
                }
            },
            {
                "box": {
                    "id": "obj-91",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 278.0, 330.1553955078125, 36.0, 23.0 ],
                    "text": "clear"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 2,
                    "id": "obj-87",
                    "linecount": 4,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 42.0, 209.1553955078125, 150.0, 83.0 ],
                    "text": "be careful NOT to scroll through when muti-menu mode  connected to pcontrol"
                }
            },
            {
                "box": {
                    "id": "obj-79",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 92.0, 309.1553955078125, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_modes", "\"Audio System\" \"Chord Connect\" \"Chord Connect Root\" \"Main Phasor\" \"Panel Grade\" \"Pattrmarker Main\" \"Record 2 Channels\" \"Widget Template\" json , Default , Default , Default , Default , Default" ],
                        [ "set_prefix", "Mode, Instruments, Devices, Input, Video, Data" ],
                        [ "set_mode", 1 ],
                        [ "set_multimenu", 1 ],
                        [ "set_output_type", 1 ],
                        [ "set_touch_output", 1 ],
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
                        [ "set_mask_performance", 1 ],
                        [ "set_mask_labels", 1 ],
                        [ "set_mask_geometry", 1 ],
                        [ "set_mask_colors", 1 ],
                        [ "set_mask_popup_colors", 1 ],
                        [ "set_popup_mini_size", 270, 95 ],
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
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "mode", 1 ],
                        [ "mode_color", 0.9130434782608696, 0.6408212560386473, 0.09637681159420286, 1 ],
                        [ "modes", "\"Audio System\" \"Chord Connect\" \"Chord Connect Root\" \"Main Phasor\" \"Panel Grade\" \"Pattrmarker Main\" \"Record 2 Channels\" \"Widget Template\" json , Default , Default , Default , Default , Default" ],
                        [ "multimenu", 1 ],
                        [ "output_type", 1 ],
                        [ "pop_bgcolor", 0.12, 0.12, 0.15, 1 ],
                        [ "popup_dot_color", 0.85, 0.85, 0.85, 0.7 ],
                        [ "prefix", "Mode, Instruments, Devices, Input, Video, Data" ],
                        [ "selected", 0 ],
                        [ "show_arrow", 1 ],
                        [ "show_markers", 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "textcolor", 0.92, 0.94, 0.98, 1 ],
                        [ "touch_output", 1 ]
                    ],
                    "filename": "touch.ummanu.js",
                    "id": "obj-64",
                    "maxclass": "v8ui",
                    "numinlets": 2,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 241.0, 376.1553955078125, 160.0, 32.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 2.0, 2.0, 160.0, 32.0 ],
                    "textfile": {
                        "filename": "touch.ummanu.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "menumaker[1]"
                }
            },
            {
                "box": {
                    "id": "obj-65",
                    "maxclass": "newobj",
                    "numinlets": 7,
                    "numoutlets": 7,
                    "outlettype": [ "bang", "bang", "bang", "bang", "bang", "bang", "" ],
                    "patching_rect": [ 537.0, 432.1553955078125, 100.0, 23.0 ],
                    "text": "sel 0 1 2 3 4 5"
                }
            },
            {
                "box": {
                    "id": "obj-66",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 537.0, 466.1553955078125, 66.0, 23.0 ],
                    "text": "t b clear 0"
                }
            },
            {
                "box": {
                    "id": "obj-67",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 556.0, 496.1553955078125, 64.0, 23.0 ],
                    "text": "t b clear 1"
                }
            },
            {
                "box": {
                    "id": "obj-68",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 576.0, 526.1553955078125, 65.0, 23.0 ],
                    "text": "t b clear 2"
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 596.0, 556.1553955078125, 66.0, 23.0 ],
                    "text": "t b clear 3"
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 616.0, 586.1553955078125, 66.0, 23.0 ],
                    "text": "t b clear 4"
                }
            },
            {
                "box": {
                    "id": "obj-69",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "bang", "clear", "int" ],
                    "patching_rect": [ 636.0, 616.1553955078125, 66.0, 23.0 ],
                    "text": "t b clear 5"
                }
            },
            {
                "box": {
                    "id": "obj-70",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 683.0, 664.1553955078125, 90.0, 23.0 ],
                    "text": "prepend menu"
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 382.0, 106.1553955078125, 611.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/devices/main devices/\""
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 398.0, 149.1553955078125, 637.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/instruments/custom made/\""
                }
            },
            {
                "box": {
                    "id": "obj-23",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 415.0, 179.1553955078125, 615.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/devices/audio devices/\""
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 431.0, 209.1553955078125, 600.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/devices/audio input/\""
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 448.0, 239.1553955078125, 614.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/devices/video devices/\""
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 465.0, 269.1553955078125, 609.0, 23.0 ],
                    "text": "\"Macintosh HD:/Users/wilpertz/Documents/Max 9/Packages/transparency/patchers/devices/data devices/\""
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "int" ],
                    "patching_rect": [ 382.0, 309.1553955078125, 70.0, 23.0 ],
                    "text": "folder"
                }
            },
            {
                "box": {
                    "attr": "multimenu",
                    "id": "obj-1",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 201.0, 209.1553955078125, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "mode",
                    "id": "obj-2",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 241.0, 253.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-1", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-2", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-21", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-22", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-23", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-25", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 0 ],
                    "source": [ "obj-26", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 1 ],
                    "source": [ "obj-30", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-24", 0 ],
                    "source": [ "obj-33", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 629.0, 584.1553955078125, 371.0, 584.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-33", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-33", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-25", 0 ],
                    "source": [ "obj-34", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 649.0, 614.1553955078125, 371.0, 614.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-34", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-34", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-64", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-65", 0 ],
                    "source": [ "obj-64", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-33", 0 ],
                    "source": [ "obj-65", 3 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-34", 0 ],
                    "source": [ "obj-65", 4 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-66", 0 ],
                    "source": [ "obj-65", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-67", 0 ],
                    "source": [ "obj-65", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-68", 0 ],
                    "source": [ "obj-65", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-69", 0 ],
                    "source": [ "obj-65", 5 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-21", 0 ],
                    "source": [ "obj-66", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 570.0, 494.1553955078125, 371.0, 494.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-66", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-66", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-22", 0 ],
                    "source": [ "obj-67", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 588.0, 524.1553955078125, 371.0, 524.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-67", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-67", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-23", 0 ],
                    "source": [ "obj-68", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 608.5, 554.1553955078125, 371.0, 554.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-68", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-68", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-26", 0 ],
                    "source": [ "obj-69", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 669.0, 644.1553955078125, 371.0, 644.1553955078125, 371.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-69", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-70", 0 ],
                    "source": [ "obj-69", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "midpoints": [ 692.5, 691.1553955078125, 226.0, 691.1553955078125, 226.0, 366.1553955078125, 250.5, 366.1553955078125 ],
                    "source": [ "obj-70", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-79", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-64", 0 ],
                    "source": [ "obj-91", 0 ]
                }
            }
        ],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}