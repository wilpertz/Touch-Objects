================================================================================
MAX/MSP: FILE DELETION, FOLDER SCANNING & MACOS TRASH WORKFLOW
================================================================================

[USER QUESTION 1]
In Max MSP there are various ways to create folders and files from within the 
program. Is there a way to delete files from within the program?

--------------------------------------------------------------------------------
[ASSISTANT ANSWER 1]
In Max/MSP, there is intentionally no native UI object or message (such as a 
generic "filedelete" or a "delete" message to standard file objects) for safety 
reasons. 

However, you can delete files from within a patch using several methods:

1. THE MODERN BUILT-IN METHOD: [node.script] (Recommended)
Since Max 8, Max includes Node for Max, giving you access to the full Node.js 
runtime and its file system (fs) module. This is cross-platform, natively 
supported, and requires no 3rd-party externals.

Step 1: Create a script (fileops.js) in your patch folder:
------------------------------------------------------------------
const maxApi = require('max-api');
const fs = require('fs');

maxApi.addHandler('deleteFile', (filepath) => {
    fs.unlink(filepath, (err) => {
        if (err) {
            maxApi.post(`Failed to delete file: ${err.message}\n`);
            maxApi.outlet('status', 0);
        } else {
            maxApi.post(`Successfully deleted: ${filepath}\n`);
            maxApi.outlet('status', 1);
        }
    });
});

maxApi.addHandler('deleteFolder', (folderpath) => {
    fs.rm(folderpath, { recursive: true, force: true }, (err) => {
        if (err) {
            maxApi.post(`Failed to delete folder: ${err.message}\n`);
            maxApi.outlet('status', 0);
        } else {
            maxApi.post(`Successfully deleted folder: ${folderpath}\n`);
            maxApi.outlet('status', 1);
        }
    });
});
------------------------------------------------------------------

Step 2: In your Max patch:
- Create object: [node.script fileops.js]
- Send message: [script start]
- Trigger deletion: [deleteFile /path/to/your/file.ext]


2. THE [shell] EXTERNAL
Using the [shell] external (available in the Max Package Manager):
- macOS: Send 'rm "/path/to/your/file.txt"'
- Windows: Send 'del "C:\path\to\your\file.txt"'


3. JAVA ([mxj])
Using Java's java.io.File API via [mxj].


* Note on standard [js]:
The built-in Max JavaScript environment ([js] / SpiderMonkey) provides File 
and Folder objects to read and write files, but Cycling '74 never implemented 
an .unlink() or .delete() method in that engine. [node.script] is the direct 
replacement.

================================================================================

[USER QUESTION 2]
I will be creating a lot of files in this directory, some of them for testing, 
for example honey_chicken.json - on Mac. Which is the best solution for directly 
deleting that file. In fact, can I open a menu or dictionary that scans that folder 
and allows me to see which files are in it and instantly refresh when one is 
deleted (literally move the file to the trash)?

--------------------------------------------------------------------------------
[ASSISTANT ANSWER 2]
The best solution on macOS is to use [node.script] paired with macOS's built-in 
AppleScript (osascript) and Node's file system watcher (fs.watch).

This fulfills all requirements:
1. Moves files directly to the macOS Trash (safe, recoverable in Finder).
2. Populates a menu ([umenu]) with all files in that 'states' folder.
3. Instantly auto-refreshes when a file is deleted or created.

--- STEP 1: CREATE THE NODE SCRIPT (trash_manager.js) ---
Save the following as 'trash_manager.js' in your patch folder:

const maxApi = require('max-api');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let currentFolder = '';
let watcher = null;
let debounceTimer = null;

// Scan directory and send file names to [umenu]
function scanFolder() {
    if (!currentFolder || !fs.existsSync(currentFolder)) return;

    try {
        const files = fs.readdirSync(currentFolder);
        
        // Filter: show .json files and ignore hidden / anchor files
        const filtered = files.filter(f => !f.startsWith('.') && f !== 'states_anchor.txt');

        // Clear existing menu items
        maxApi.outlet('clear');

        // Populate menu items
        filtered.forEach(file => {
            maxApi.outlet('append', file);
        });

        maxApi.post(`Scanned ${filtered.length} files in states directory.\n`);
    } catch (err) {
        maxApi.post(`Error scanning directory: ${err.message}\n`);
    }
}

// Watch directory for live changes (creation/deletion)
function watchFolder(folderPath) {
    if (watcher) watcher.close();

    watcher = fs.watch(folderPath, (eventType, filename) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            scanFolder();
        }, 150);
    });
}

// 1. Set directory path and start watcher
maxApi.addHandler('setFolder', (folderPath) => {
    currentFolder = path.resolve(folderPath);
    maxApi.post(`Target folder set to: ${currentFolder}\n`);
    watchFolder(currentFolder);
    scanFolder();
});

// 2. Manual refresh trigger
maxApi.addHandler('refresh', () => {
    scanFolder();
});

// 3. Move selected file to macOS Trash
maxApi.addHandler('moveToTrash', (filename) => {
    if (!currentFolder || !filename) return;

    const fullPath = path.join(currentFolder, filename);

    if (!fs.existsSync(fullPath)) {
        maxApi.post(`File does not exist: ${fullPath}\n`);
        return;
    }

    // Native macOS AppleScript command to delete to Trash
    const script = `osascript -e 'tell application "Finder" to delete POSIX file "${fullPath}"'`;

    exec(script, (error, stdout, stderr) => {
        if (error) {
            maxApi.post(`Failed to trash file: ${stderr || error.message}\n`);
        } else {
            maxApi.post(`Moved to Trash: ${filename}\n`);
            scanFolder();
        }
    });
});


--- STEP 2: BUILD THE MAX PATCH ---

Patch diagram:

                  [loadbang]
                      |
           [script start]  [setFolder /path/to/Packages/your-package/states]
                      \     /
                 [node.script trash_manager.js]
                               | (outlet)
                           [umenu]
                               | (middle outlet: symbol)
                         [set $1]
                               |
                       [message box]  <- stores selected filename
                               |
                   [prepend moveToTrash]
                               |
                 [node.script trash_manager.js]

Summary of features:
- Uses macOS Finder's native 'delete' verb via osascript, sending items safely 
  to the macOS Trash can.
- Uses fs.watch() so any new files saved to the folder will automatically 
  appear in [umenu] without manual refreshing.
================================================================================