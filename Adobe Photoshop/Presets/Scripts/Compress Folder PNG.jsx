/*

// Open a given folder and compress all PNG images with Tinify.
// Copyright (c) 2015 Voormedia B.V. All rights reserved.

<javascriptresource>
<menu>automate</menu>
<category>compression</category>
<name>$$$/TinifyFolderPNG/Menu=Compress Folder with PNG Images...</name>
<eventid>1A8EAE6F-AEF3-44FA-AC71-CB9BB47F613A</eventid>
</javascriptresource>

*/

function compressPNGFile(file, percentage) {

    // Open the file without dialogs like Adobe Camera Raw
    var opener = new ActionDescriptor();
    opener.putPath(charIDToTypeID("null"), file);
    executeAction(charIDToTypeID("Opn "), opener, DialogModes.NO);

    // Select the opened document
    var document = app.activeDocument;

    // Change the color space to RGB if needed
    if (document.mode == DocumentMode.INDEXEDCOLOR) {
        document.changeMode(ChangeMode.RGB);
    }

    // Switch to 8 bit RGB if the image is 16 bit
    if (document.bitsPerChannel == BitsPerChannelType.SIXTEEN) {
        convertBitDepth(8);
    }

    // Choose the scale percentage
    if (percentage === undefined || percentage < 10 || percentage > 100) {
      percentage = 100;
    }

    // Compress the document
    var tinify = new ActionDescriptor();
    tinify.putPath(charIDToTypeID("In  "), file); /* Overwrite original! */
    tinify.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), percentage );
    tinify.putEnumerated(charIDToTypeID("FlTy"), charIDToTypeID("tyFT"), charIDToTypeID("tyPN")); /* Force PNG */

    var compress = new ActionDescriptor();
    compress.putObject(charIDToTypeID("Usng"), charIDToTypeID("tinY"), tinify);
    executeAction(charIDToTypeID("Expr"), compress, DialogModes.NO);

    document.close(SaveOptions.DONOTSAVECHANGES);
}

function convertBitDepth(bitdepth) {
    var id1 = charIDToTypeID("CnvM");
    var convert = new ActionDescriptor();
    var id2 = charIDToTypeID("Dpth");
    convert.putInteger(id2, bitdepth);
    executeAction(id1, convert, DialogModes.NO);
}

function compressPNGFolder(folder) {
    // Recursively open files in the given folder
    var children = folder.getFiles();
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child instanceof Folder) {
        } else {
            /* Only attempt to compress PNG files. */
            if (child.name.slice(-4).toLowerCase() == ".png") {
                compressPNGFile(child);
            }
        }
    }
}

if (confirm("Warning. You are about to compress all PNG files in the chosen folder. This cannot be undone.\n\rAre you sure you want to continue?")) {
    try {
        // Let user select a folder
        compressPNGFolder(Folder.selectDialog("Choose a folder with PNG images to compress"));
        alert("All PNG files compressed.");
    } catch(error) {
        alert("Error while processing: " + error);
    }
}
