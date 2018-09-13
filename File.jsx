/*

// Open a given file and compress with Tinify.
// Copyright (c) 2015 Voormedia B.V. All rights reserved.

<javascriptresource>
<menu>automate</menu>
<category>compression</category>
<name>$$$/TinifyFile/Menu=Compress File...</name>
<eventid>2D0D30E6-55C2-455B-AF0A-87A30CC543DE</eventid>
</javascriptresource>

*/

function compressFile(file, percentage) {

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
        convertBitDepth(document, 8);
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
}

try {
    // Let user select a file
    compressFile(File.openDialog("Choose a PNG or JPEG file to compress"));
} catch(error) {
    alert("No JPEG or PNG file selected or compression error.");
}
