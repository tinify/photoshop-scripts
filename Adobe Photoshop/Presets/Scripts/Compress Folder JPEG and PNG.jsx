/*

// Open a given folder and compress all PNG and JPEG images with Tinify.
// Copyright (c) 2015 Voormedia B.V. All rights reserved.

<javascriptresource>
<menu>automate</menu>
<category>compression</category>
<name>$$$/TinifyFolderJPEGandPNG/Menu=Compress Folder with JPEG and PNG Images...</name>
<eventid>55C8CE17-1F22-43F4-80A3-AB98A6B5A24B</eventid>
</javascriptresource>

*/

function compressFile(file, percentage) {
    try {
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

        var compress = new ActionDescriptor();
        compress.putObject(charIDToTypeID("Usng"), charIDToTypeID("tinY"), tinify);
        executeAction(charIDToTypeID("Expr"), compress, DialogModes.NO);

        document.close(SaveOptions.DONOTSAVECHANGES);
    } catch (e) {}
}

function convertBitDepth(bitdepth) {
    var id1 = charIDToTypeID("CnvM");
    var convert = new ActionDescriptor();
    var id2 = charIDToTypeID("Dpth");
    convert.putInteger(id2, bitdepth);
    executeAction(id1, convert, DialogModes.NO);
}

function compressFolder(folder) {
    // Recursively open files in the given folder
    var children = folder.getFiles();
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child instanceof Folder) {
            compressFolder(child);
        } else {
            if ((child.name.slice(-4).toLowerCase() == ".png")||(child.name.slice(-5).toLowerCase() == ".jpeg")||(child.name.slice(-4).toLowerCase() == ".jpg")) {
                compressFile(child);
            }
        }
    }
}

if (confirm("Warning. You are about to compress all JPEG and PNG files in the chosen folder. This cannot be undone.\n\rAre you sure you want to continue?")) {
    try {
        // Let user select a folder
        compressFolder(Folder.selectDialog("Choose a folder with JPEG/PNG images to compress with TinyPNG/JPG"));
        alert("All JPEG and PNG files compressed.");
    } catch(error) {
        alert("Error while processing: " + error);
    }
}
