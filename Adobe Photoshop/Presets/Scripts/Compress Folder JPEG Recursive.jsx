/*

// Open a given folder and compress all JPEG images with Tinify.
// Copyright (c) 2015 Voormedia B.V. All rights reserved.

<javascriptresource>
<menu>automate</menu>
<category>compression</category>
<name>$$$/TinifySubFolderJPEG/Menu=Compress Folder and Subfolders with JPEG Images...</name>
<eventid>67D7CF49-7026-4F65-9032-71ACD289B0DE</eventid>
</javascriptresource>

*/

function compressJPEGFile(file, percentage) {

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

    if (File.fs == "Windows") {
        tinify.putString(charIDToTypeID("Nm  "), File.encode(file.fsName)); /* Overwrite original! */
    } else {
        tinify.putPath(charIDToTypeID("In  "), file); /* Overwrite original! */
    }

    tinify.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), percentage);
    tinify.putEnumerated(charIDToTypeID("FlTy"), charIDToTypeID("tyFT"), charIDToTypeID("tyJP")); /* Force JPEG */

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

function compressJPEGFolder(folder) {
    // Recursively open files in the given folder
    var children = folder.getFiles();
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child instanceof Folder) {
            compressJPEGFolder(child);
          } else {
            /* Only attempt to compress PNG files. */
            if ((child.name.slice(-5).toLowerCase() == ".jpeg")||(child.name.slice(-4).toLowerCase() == ".jpg")) {
                compressJPEGFile(child);
            }
        }
    }
}

if (confirm("Warning. You are about to compress all JPEG files in the chosen folder and all subfolders. This cannot be undone.\n\rAre you sure you want to continue?")) {
    try {
        // Let user select a folder
        compressJPEGFolder(Folder.selectDialog("Choose a folder with JPEG images to compress with TinyJPG"));
        alert("All JPEG files compressed.");
    } catch(error) {
        alert("Error while processing: " + error);
    }
}
