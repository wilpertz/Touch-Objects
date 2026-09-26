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
        "rect": [ 407.0, 262.0, 950.0, 892.0 ],
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 851.0, 651.0, 50.0, 23.0 ],
                    "text": "0 0 0"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-22",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1043.0, 553.0, 80.0, 25.0 ],
                    "text": "click here"
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 533.0, 389.0, 33.0, 23.0 ],
                    "text": "0 $1"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-52",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 1087.0, 615.0, 155.0, 53.0 ],
                    "text": "rout and feedback to control different bottons"
                }
            },
            {
                "box": {
                    "clickedimage": 1,
                    "id": "obj-51",
                    "maxclass": "pictctrl",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 1013.5, 720.0, 20.0, 20.0 ]
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "bubbleside": 2,
                    "id": "obj-48",
                    "linecount": 3,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 828.0, 234.0, 155.0, 68.0 ],
                    "text": "1. milti-menu\n2. multi-modal\n3. dual label"
                }
            },
            {
                "box": {
                    "attr": "labels",
                    "id": "obj-47",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 373.0, 685.0, 199.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "labels",
                    "id": "obj-46",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 293.0, 651.0, 199.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-39",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 884.5, 718.0, 73.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 978.0, 476.0, 84.0, 23.0 ],
                    "text": "loadmess 0 0"
                }
            },
            {
                "box": {
                    "id": "obj-77",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 765.0, 571.0, 29.5, 23.0 ],
                    "text": "0 1"
                }
            },
            {
                "box": {
                    "id": "obj-68",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 975.5, 671.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-72",
                    "maxclass": "newobj",
                    "numinlets": 4,
                    "numoutlets": 4,
                    "outlettype": [ "", "", "", "" ],
                    "patching_rect": [ 938.5, 630.0, 132.0, 23.0 ],
                    "text": "route Edit Clamp Hold"
                }
            },
            {
                "box": {
                    "border": 0,
                    "embedstate": [
                        [ "set_count", 3 ],
                        [ "set_direction", 0 ],
                        [ "set_group_mode", 0 ],
                        [ "set_all_modes", 2 ],
                        [ "set_flash_time", 100 ],
                        [ "set_modes", "1 0 0" ],
                        [ "set_labels", "Edit/Locked Clamp Close" ],
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0, 0, 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "case_mode", 0 ],
                        [ "count", 3 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 0 ],
                        [ "labels", "Edit/Locked Clamp Close" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "1 0 0" ],
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-41",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 882.0, 537.0, 132.0, 57.0 ],
                    "presentation": 1,
                    "presentation_rect": [ 672.0, 7.0, 54.0, 56.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AB"
                }
            },
            {
                "box": {
                    "id": "obj-181",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "patching_rect": [ 765.0, 536.0, 61.0, 23.0 ],
                    "text": "loadbang"
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 629.0, 517.0, 50.0, 37.0 ],
                    "text": "Touch 0"
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 584.0, 516.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-27",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 430.0, 727.0, 134.0, 25.0 ],
                    "text": "All same Text Label"
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
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
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-20",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 151.0, 719.0, 100.0, 40.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA[4]"
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
                        [ "set_label_mode", 3 ],
                        [ "set_case_mode", 1 ],
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "case_mode", 1 ],
                        [ "count", 1 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 3 ],
                        [ "labels", "Touch/Hold" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "2" ],
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-15",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 373.0, 728.0, 30.0, 24.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA[3]"
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
                        [ "set_label_mode", 1 ],
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "case_mode", 0 ],
                        [ "count", 1 ],
                        [ "direction", 0 ],
                        [ "flash_time", 100 ],
                        [ "font_name", "Arial" ],
                        [ "font_style", 0 ],
                        [ "group_mode", 0 ],
                        [ "label_mode", 1 ],
                        [ "labels", "Touch/Hold" ],
                        [ "mask_colors", 1 ],
                        [ "mask_geometry", 1 ],
                        [ "mask_labels", 1 ],
                        [ "mask_performance", 1 ],
                        [ "mask_popup_colors", 1 ],
                        [ "modes", "2" ],
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-13",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 293.0, 721.0, 42.0, 37.5 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA[2]"
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
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
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-12",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 136.0, 399.0, 100.0, 40.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA[1]"
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
                        [ "set_btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "set_btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
                        [ "set_border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "set_text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "set_popup_dot_color", 1, 0, 0, 1 ],
                        [ "set_pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "set_attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "set_attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "set_attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "set_attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "set", 0 ],
                        [ "allow_popup", 1 ],
                        [ "attr_bg_color", 0.23130434782608697, 0.3473623188405799, 0.5478260869565217, 0.55 ],
                        [ "attr_border_color", 0.08333333333333337, 0.9388888888888891, 1, 0.5555555555555556 ],
                        [ "attr_slider_color", 0.20444444444444443, 0.4, 0.38696296296296295, 0.5111111111111111 ],
                        [ "attr_text_color", 0.8608695652173913, 0.8417391304347827, 0.8417391304347827, 1 ],
                        [ "border_color", 0.12512077294685994, 0.5764573268921097, 0.6086956521739131, 1 ],
                        [ "border_extension", 4.943820224719101 ],
                        [ "border_radius", 0 ],
                        [ "border_thickness", 1.6123595505617978 ],
                        [ "btn_color_off", 0.16521739130434787, 0.1486956521739131, 0.1486956521739131, 0.46111111111111114 ],
                        [ "btn_color_on", 0.7207729468599033, 0.8695652173913043, 0.463768115942029, 0.5666666666666667 ],
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
                        [ "pop_bgcolor", 0.0711111111111111, 0.07801610305958127, 0.27826086956521734, 0.5111111111111111 ],
                        [ "popup_dot_color", 1, 0, 0, 1 ],
                        [ "show_settings_attrs", 1 ],
                        [ "text_color", 0.92, 0.94, 0.98, 1 ],
                        [ "text_color_mode", 1 ],
                        [ "text_size", 12 ]
                    ],
                    "filename": "touch.mbutton.js",
                    "id": "obj-7",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "outlettype": [ "", "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 49.0, 127.0, 100.0, 40.0 ],
                    "textfile": {
                        "filename": "touch.mbutton.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    },
                    "varname": "v8ui_AA"
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 451.0, 517.0, 35.0, 23.0 ],
                    "text": "print"
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 593.0, 272.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-8",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 618.0, 215.0, 69.0, 25.0 ],
                    "text": "pictctrl"
                }
            },
            {
                "box": {
                    "clickedimage": 1,
                    "id": "obj-14",
                    "maxclass": "pictctrl",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 593.0, 217.0, 20.0, 20.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "linecount": 2,
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 85.0, 272.0, 50.0, 37.0 ],
                    "text": "Touch 0"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-29",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 612.5, 412.0, 155.0, 39.0 ],
                    "text": "access attrui from bpatcher"
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "message",
                    "numinlets": 2,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "patching_rect": [ 502.0, 517.0, 50.0, 23.0 ],
                    "text": "0"
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "live.text",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 533.0, 339.0, 59.0, 24.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_enum": [ "val1", "val2" ],
                            "parameter_longname": "live.text[2]",
                            "parameter_mmax": 1,
                            "parameter_modmode": 0,
                            "parameter_shortname": "live.text",
                            "parameter_type": 2
                        }
                    },
                    "varname": "live.text[2]"
                }
            },
            {
                "box": {
                    "clickedimage": 1,
                    "id": "obj-23",
                    "maxclass": "pictctrl",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 680.0, 341.0, 20.0, 20.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 642.0, 339.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 468.0, 388.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "bgmode": 0,
                    "border": 0,
                    "clickthrough": 0,
                    "enablehscroll": 0,
                    "enablevscroll": 0,
                    "id": "obj-17",
                    "lockeddragscroll": 0,
                    "lockedsize": 0,
                    "maxclass": "bpatcher",
                    "name": "touch_mbutton_b.maxpat",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "offset": [ 0.0, 0.0 ],
                    "outlettype": [ "", "" ],
                    "patching_rect": [ 533.0, 422.0, 70.0, 70.0 ],
                    "viewvisibility": 1
                }
            },
            {
                "box": {
                    "fontsize": 16.0,
                    "id": "obj-1",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 49.0, 24.0, 174.0, 26.0 ],
                    "text": "touch.button.maxhelp"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-43",
                    "linecount": 2,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 294.0, 333.0, 155.0, 39.0 ],
                    "text": "allow popup to use custom attrui"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-42",
                    "linecount": 4,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 263.0, 54.5, 155.0, 68.0 ],
                    "text": "3 differnt modes: 0=monemetary\n1=toggle\n2=touch-hold"
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 411.0, 272.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "number",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 276.0, 272.0, 50.0, 23.0 ]
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-11",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 488.0, 214.0, 69.0, 25.0 ],
                    "text": "live.text"
                }
            },
            {
                "box": {
                    "bubble": 1,
                    "id": "obj-10",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 333.0, 215.0, 63.0, 25.0 ],
                    "text": "toggle"
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
                    "patching_rect": [ 92.0, 200.0, 153.0, 53.0 ],
                    "text": "change momentary mode timer and compare to button"
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "live.text",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 1,
                    "patching_rect": [ 411.0, 215.0, 59.0, 24.0 ],
                    "saved_attribute_attributes": {
                        "valueof": {
                            "parameter_enum": [ "val1", "val2" ],
                            "parameter_longname": "live.text",
                            "parameter_mmax": 1,
                            "parameter_modmode": 0,
                            "parameter_shortname": "live.text",
                            "parameter_type": 2
                        }
                    },
                    "varname": "live.text"
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "toggle",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "int" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 276.0, 215.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "button",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "bang" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 49.0, 215.0, 24.0, 24.0 ]
                }
            },
            {
                "box": {
                    "attr": "allow_popup",
                    "id": "obj-40",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 136.0, 341.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "modes",
                    "id": "obj-16",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 49.0, 77.0, 192.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "count",
                    "id": "obj-34",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 822.0, 320.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "labels",
                    "id": "obj-35",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 822.0, 407.5, 251.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "modes",
                    "id": "obj-36",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 824.0, 362.0, 150.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "labels",
                    "id": "obj-45",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 151.0, 611.0, 199.0, 23.0 ]
                }
            },
            {
                "box": {
                    "attr": "direction",
                    "id": "obj-49",
                    "maxclass": "attrui",
                    "numinlets": 1,
                    "numoutlets": 1,
                    "outlettype": [ "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 1008.0, 320.0, 150.0, 23.0 ]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "destination": [ "obj-6", 0 ],
                    "source": [ "obj-14", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-7", 0 ],
                    "source": [ "obj-16", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-25", 0 ],
                    "order": 1,
                    "source": [ "obj-17", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-28", 1 ],
                    "order": 0,
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-3", 0 ],
                    "order": 1,
                    "source": [ "obj-17", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-30", 1 ],
                    "order": 0,
                    "source": [ "obj-17", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-77", 0 ],
                    "source": [ "obj-181", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-31", 0 ],
                    "source": [ "obj-21", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-31", 0 ],
                    "source": [ "obj-23", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-31", 0 ],
                    "source": [ "obj-24", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-17", 0 ],
                    "source": [ "obj-26", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-17", 0 ],
                    "source": [ "obj-31", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-34", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-35", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-36", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-37", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-18", 0 ],
                    "source": [ "obj-4", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-12", 0 ],
                    "source": [ "obj-40", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-38", 1 ],
                    "source": [ "obj-41", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-72", 0 ],
                    "source": [ "obj-41", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-20", 0 ],
                    "source": [ "obj-45", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-13", 0 ],
                    "source": [ "obj-46", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-15", 0 ],
                    "source": [ "obj-47", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-49", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-19", 0 ],
                    "source": [ "obj-5", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-77", 0 ],
                    "source": [ "obj-68", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-14", 0 ],
                    "order": 0,
                    "source": [ "obj-7", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-2", 0 ],
                    "order": 1,
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-32", 1 ],
                    "order": 0,
                    "source": [ "obj-7", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-4", 0 ],
                    "order": 2,
                    "source": [ "obj-7", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-5", 0 ],
                    "order": 1,
                    "source": [ "obj-7", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-39", 1 ],
                    "source": [ "obj-72", 0 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-51", 0 ],
                    "source": [ "obj-72", 2 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-68", 0 ],
                    "source": [ "obj-72", 1 ]
                }
            },
            {
                "patchline": {
                    "destination": [ "obj-41", 0 ],
                    "source": [ "obj-77", 0 ]
                }
            }
        ],
        "parameters": {
            "obj-21": [ "live.text[2]", "live.text", 0 ],
            "obj-5": [ "live.text", "live.text", 0 ],
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