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
        "default_fontname": "SF Pro Text",
        "subpatcher_template": "wil.new.2026",
        "boxes": [
            {
                "box": {
                    "id": "obj-6",
                    "linecount": 5,
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 80.0, 118.0, 150.0, 78.0 ],
                    "presentation_linecount": 5,
                    "text": "use touch.statusmanger with touch.status. Use only ONE statusmanger to manage all touch.status object"
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "comment",
                    "numinlets": 1,
                    "numoutlets": 0,
                    "patching_rect": [ 80.0, 78.0, 150.0, 21.0 ],
                    "text": "touch.statusmanager.js"
                }
            },
            {
                "box": {
                    "embedstate": [
                        [ "set_active_module_idx", 0 ],
                        [ "set_active_set_idx", 0 ],
                        [ "set_active_palette_idx", -1 ],
                        [ "set_sets_per_page", 5 ],
                        [ "set_bank_saved", "New%20Opera%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Soundscape%203%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Live%20Modular%20A%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Free%20Ambient%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Percussion%20Rig%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Drone%20Vault%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Poly%20Synth%201%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Noise%20Textures%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Bass%20Lab%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty%40%40%40Interlude%20B%7C%7CPalette%201%3D%3DEmpty%23%23Palette%202%3D%3DEmpty%23%23Palette%203%3D%3DEmpty%23%23Palette%204%3D%3DEmpty" ],
                        [ "sets_per_page", 5 ]
                    ],
                    "filename": "touch.statusmanager.js",
                    "id": "obj-1",
                    "maxclass": "v8ui",
                    "numinlets": 1,
                    "numoutlets": 2,
                    "outlettype": [ "", "" ],
                    "parameter_enable": 0,
                    "patching_rect": [ 271.0, 249.0, 249.0, 157.0 ],
                    "textfile": {
                        "filename": "touch.statusmanager.js",
                        "flags": 0,
                        "embed": 0,
                        "autowatch": 1
                    }
                }
            }
        ],
        "lines": [],
        "autosave": 0,
        "accentcolor": [ 0.0, 0.0, 0.0, 1.0 ],
        "patchlinecolor": [ 0.933333333333333, 0.964705882352941, 0.219607843137255, 1.0 ]
    }
}