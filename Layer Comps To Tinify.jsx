// Copyright 2007.  Adobe Systems, Incorporated.  All rights reserved.
// This script will apply each comp and then export to a file
// Written by Naoki Hada
// ZStrings and auto layout by Tom Ruark
// PNG support by Jeffrey Tranberry

// Modified for TinyPNG and TinyJPG 2018.

/*
@@@BUILDINFO@@@ Layer Comps To Tinify.jsx 1.0.0.25

*/

/*

// BEGIN__HARVEST_EXCEPTION_ZSTRING

<javascriptresource>
<name>$$$/JavaScripts/LayerCompsToTinify/Menu=Layer Comps To Tinify...</name>
    <category>layercomps</category>
<eventid>05c43700-96e0-428d-8fef-ecb4d9b6f28f</eventid>
<enableinfo>true</enableinfo>
<terminology><![CDATA[<< /Version 1 
                         /Events << 
                          /05c43700-96e0-428d-8fef-ecb4d9b6f28f [($$$/JavaScripts/LayerCompsToTinify/Action=Layer Comps To Tinify) /noDirectParam <<
                          >>] 
                         >> 
                      >> ]]></terminology>
</javascriptresource>

// END__HARVEST_EXCEPTION_ZSTRING

*/
 app.playbackDisplayDialogs = DialogModes.ALL 
// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 0;
// debugger; // launch debugger on next line



// on localized builds we pull the $$$/Strings from a .dat file, see documentation for more details
$.localize = true;

//=================================================================
// Globals
//=================================================================

// UI strings to be localized
var strTitle = localize("$$$/JavaScripts/LayerCompsToTinify/Title=Layer Comps To Tinify");
var strButtonRun = localize("$$$/JavaScripts/LayerCompsToTinify/Run=Run");
var strButtonCancel = localize("$$$/JavaScripts/LayerCompsToTinify/Cancel=Cancel");
var strHelpText = localize("$$$/JavaScripts/LayerCompsToTinify/Help=Please specify the format and location for saving each layer comp as a file.");
var strLabelDestination = localize("$$$/JavaScripts/LayerCompsToTinify/Destination=Destination:");
var strButtonBrowse = localize("$$$/JavaScripts/LayerCompsToTinify/Browse=&Browse...");
var strLabelFileNamePrefix = localize("$$$/JavaScripts/LayerCompsToTinify/FileNamePrefix=File Name Prefix:");
var strCheckboxSelectionOnly = localize("$$$/JavaScripts/LayerCompsToTinify/SelectedOnly=&Selected Layer Comps Only");
var strLabelFileType = localize("$$$/JavaScripts/LayerCompsToTinify/FileType=File Type:");
var strCheckboxIncludeICCProfile = localize("$$$/JavaScripts/LayerCompsToTinify/IncludeICC=&Include ICC Profile");
var strJPEGOptions = localize("$$$/JavaScripts/LayerCompsToTinify/JPEGOptions=JPEG Export Options:");
var strLabelResize = localize("$$$/JavaScripts/LayerCompsToTinify/Resize=Resize percentage:");
var strLabelImageCompression = localize("$$$/JavaScripts/LayerCompsToTinify/ImageCompression=Image Compression:");
var strNone = localize("$$$/JavaScripts/LayerCompsToTinify/None=None");
var strLabelDepth = localize("$$$/JavaScripts/LayerCompsToTinify/Depth=Depth:");
var strAlertSpecifyDestination = localize("$$$/JavaScripts/LayerCompsToTinify/SpecifyDestination=Please specify destination.");
var strAlertDestinationNotExist = localize("$$$/JavaScripts/LayerCompsToTinify/DestionationDoesNotExist=Destination does not exist.");
var strTitleSelectDestination = localize("$$$/JavaScripts/LayerCompsToTinify/SelectDestination=Select Destination");
var strAlertDocumentMustBeOpened = localize("$$$/JavaScripts/LayerCompsToTinify/OneDocument=You must have a document open to export!");
var strAlertNoLayerCompsFound = localize("$$$/JavaScripts/LayerCompsToTinify/NoComps=No layer comps found in document!");
var strAlertNoLayerCompsSelected = localize("$$$/JavaScripts/LayerCompsToTinify/NoSelectedComps=No layer comps selected in document!");

var strAlertWasSuccessful = localize("$$$/JavaScripts/LayerCompsToTinify/Success= was successful.");
var strUnexpectedError = localize("$$$/JavaScripts/LayerCompsToTinify/Unexpectedd=Unexpected error");
var strMessage = localize("$$$/JavaScripts/LayerCompsToTinify/Message=Layer Comps To Tinify action settings");
var stretResize = localize( "$$$/locale_specific/JavaScripts/LayerCompsToTinify/ETResizeLength=40" );
var stretDestination = localize( "$$$/locale_specific/JavaScripts/LayerCompsToTinify/ETDestinationLength=160" );
var strddFileType = localize( "$$$/locale_specific/JavaScripts/LayerCompsToTinify/DDFileType=100" );
var strpnlOptions = localize( "$$$/locale_specific/JavaScripts/LayerCompsToTinify/PNLOptions=100" );
var strCreateFolder = localize( "$$$/JavaScripts/LayerCompsToTinify/CreateFolder=The folder does not exist. Do you wish to create it?^r" );
var strCouldNotCreate = localize( "$$$/JavaScripts/LayerCompsToTinify/CouldNotCreate=The folder could not be created." );
var strPNG8Options = localize("$$$/JavaScripts/ExportLayersToFiles/PNG8Options=PNG Export Options:");

// the drop down list indexes for file type
var jpegIndex = 0;
var png8Index = 1; 

// the drop down list indexes for tiff compression
var compNoneIndex = 0;
var compLZWIndex = 1;
var compZIPIndex = 2;
var compJPEGIndex = 3;

// ok and cancel button
var runButtonID = 1;
var cancelButtonID = 2;


///////////////////////////////////////////////////////////////////////////////
// Dispatch
///////////////////////////////////////////////////////////////////////////////


main();



///////////////////////////////////////////////////////////////////////////////
// Functions
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Function: main
// Usage: the core routine for this script
// Input: <none>
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function main() {
    
    if ( app.documents.length <= 0 ) {
        if ( DialogModes.NO != app.playbackDisplayDialogs ) {
            alert( strAlertDocumentMustBeOpened );
        }
    	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
    }

    var exportInfo = new Object();
    
    initExportInfo(exportInfo);
    
 	// look for last used params via Photoshop registry, getCustomOptions will throw if none exist
	try {
		var d = app.getCustomOptions("d69fc733-75b4-4d5c-ae8a-c6d6f9a8aa32");
		descriptorToObject(exportInfo, d, strMessage, postProcessExportInfo);
	}
	catch(e) {
		// it's ok if we don't have any options, continue with defaults
	}
	
	// see if I am getting descriptor parameters
    descriptorToObject(exportInfo, app.playbackParameters, strMessage, postProcessExportInfo);
    
    if ( DialogModes.ALL == app.playbackDisplayDialogs ) {
    	if (cancelButtonID == settingDialog(exportInfo)) {
	    	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	    }
	}

    try {
        var docName = app.activeDocument.name;  // save the app.activeDocument name before duplicate.
        var compsName = new String("none");
        var compsCount = app.activeDocument.layerComps.length;
        if ( compsCount < 1 ) {
            if ( DialogModes.NO != app.playbackDisplayDialogs ) {
                alert ( strAlertNoLayerCompsFound );
            }
	    	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
        } else if ( selectedCompsConfigError(app.activeDocument.layerComps, exportInfo) ) {
            
            if ( DialogModes.NO != app.playbackDisplayDialogs ) {

                alert ( strAlertNoLayerCompsSelected );

            }

	    	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script

        } else {
            app.activeDocument = app.documents[docName];
            docRef = app.activeDocument;
    
            var rememberMaximize;
            var needMaximize = exportInfo.psdMaxComp ? QueryStateType.ALWAYS : QueryStateType.NEVER;
            if ( exportInfo.fileType == jpegIndex && app.preferences.maximizeCompatibility != needMaximize ) {
                rememberMaximize = app.preferences.maximizeCompatibility;
                app.preferences.maximizeCompatibility = needMaximize;
            }
            var nameCountObj = countCompsNames(docRef.layerComps);
            for ( compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {
                var compRef = docRef.layerComps[ compsIndex ];
                if (exportInfo.selectionOnly && !compRef.selected) continue; // selected only
                compRef.apply();
                var duppedDocument = app.activeDocument.duplicate();
                var fileNameBody = exportInfo.fileNamePrefix ; 
                if (fileNameBody.length > 0 ) {  fileNameBody +=  "_" };
                if (exportInfo.prefixIndex) 
                { 
                    fileNameBody += zeroSuppress(compsIndex, 4) +"_" ; 
                    fileNameBody += compRef.name;
                } else      // not using prefix, but we'll still make sure each file name is unique
                {
                    fileNameBody += compRef.name;
                    var nameEntry = nameCountObj[compRef.name];
                    if(nameEntry.total > 1)
                        fileNameBody +=  '_' + nameEntry.nameIndex++;
                }
                if (null != compRef.comment)    fileNameBody += "_" + compRef.comment;
                fileNameBody = fileNameBody.replace(/[:\/\\*\?\"\<\>\|\\\r\\\n]/g, "_");  // '/\:*?"<>|\r\n' -> '_'
                if (fileNameBody.length > 120) fileNameBody = fileNameBody.substring(0,120);
                saveFile(duppedDocument, fileNameBody, exportInfo);
                duppedDocument.close(SaveOptions.DONOTSAVECHANGES);
            }

			var d = objectToDescriptor(exportInfo, strMessage, preProcessExportInfo);
 	        app.putCustomOptions("d69fc733-75b4-4d5c-ae8a-c6d6f9a8aa32", d);

			var dd = objectToDescriptor(exportInfo, strMessage, preProcessExportInfo);
            app.playbackParameters = dd;

            if ( rememberMaximize != undefined ) {
                app.preferences.maximizeCompatibility = rememberMaximize;
            }
            
            if ( DialogModes.ALL == app.playbackDisplayDialogs ) {
                alert(strTitle + strAlertWasSuccessful);
            }

            app.playbackDisplayDialogs = DialogModes.ALL;

        }
    } 
    catch (e) {
        if ( DialogModes.NO != app.playbackDisplayDialogs ) {
            alert(e);
        }
    	return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
    }
}


///////////////////////////////////////////////////////////////////////////////
// Function: settingDialog
// Usage: pop the ui and get user settings
// Input: exportInfo object containing our parameters
// Return: on ok, the dialog info is set to the exportInfo object
///////////////////////////////////////////////////////////////////////////////
function settingDialog(exportInfo)
{
    var dlgMain = new Window("dialog", strTitle);
    
	dlgMain.orientation = 'column';
	dlgMain.alignChildren = 'left';
	
	// -- top of the dialog, first line
    dlgMain.add("statictext", undefined, strLabelDestination);

	// -- two groups, one for left and one for right ok, cancel
	dlgMain.grpTop = dlgMain.add("group");
	dlgMain.grpTop.orientation = 'row';
	dlgMain.grpTop.alignChildren = 'top';
	dlgMain.grpTop.alignment = 'fill';

	// -- group top left 
	dlgMain.grpTopLeft = dlgMain.grpTop.add("group");
	dlgMain.grpTopLeft.orientation = 'column';
	dlgMain.grpTopLeft.alignChildren = 'left';
	dlgMain.grpTopLeft.alignment = 'fill';
     dlgMain.grpTopLeft.spacing = 5;
	
	// -- the second line in the dialog
	dlgMain.grpSecondLine = dlgMain.grpTopLeft.add("group");
    dlgMain.grpSecondLine.spacing = 5;
    dlgMain.grpSecondLine.margins = 5;
	dlgMain.grpSecondLine.orientation = 'row';
	dlgMain.grpSecondLine.alignChildren = 'center';

    dlgMain.etDestination = dlgMain.grpSecondLine.add("edittext", undefined, exportInfo.destination.toString());
    dlgMain.etDestination.preferredSize = [220,20];
    
    dlgMain.btnBrowse = dlgMain.grpSecondLine.add("button", undefined, strButtonBrowse);
    dlgMain.btnBrowse.preferredSize = [50,25];
    
    dlgMain.btnBrowse.onClick = function() {
		var defaultFolder = dlgMain.etDestination.text;
		var testFolder = new Folder(dlgMain.etDestination.text);
		if (!testFolder.exists) defaultFolder = "~";
		var selFolder = Folder.selectDialog(strTitleSelectDestination, defaultFolder);
		if ( selFolder != null ) {
	        dlgMain.etDestination.text = selFolder.fsName;
	    }
		dlgMain.defaultElement.active = true;
	}

	// -- the third line in the dialog
    dlgMain.grpTopLeft.add("statictext", undefined, strLabelFileNamePrefix);

	// -- the fourth line in the dialog
    dlgMain.grFileNamePrefixGr = dlgMain.grpTopLeft.add("group");
    dlgMain.grFileNamePrefixGr .orientation = "row";
    dlgMain.grFileNamePrefixGr .spacing = 5;
    dlgMain.grFileNamePrefixGr .margins = 5;
    dlgMain.etFileNamePrefix = dlgMain.grFileNamePrefixGr.add("edittext", undefined, exportInfo.fileNamePrefix.toString());
    dlgMain.etFileNamePrefix.preferredSize = [250,20];
    dlgMain.cbFileNamePrefixIndex = dlgMain.grFileNamePrefixGr.add("checkbox", undefined, "Index");
    dlgMain.cbFileNamePrefixIndex.alignment = "right";
    dlgMain.cbFileNamePrefixIndex.value = exportInfo.prefixIndex;

	// -- the fifth line in the dialog
    dlgMain.cbSelection = dlgMain.grpTopLeft.add("checkbox", undefined, strCheckboxSelectionOnly);
    dlgMain.cbSelection.value = exportInfo.selectionOnly;

	// -- the sixth line is the panel
    dlgMain.pnlFileType = dlgMain.grpTopLeft.add("panel", undefined, strLabelFileType);
	dlgMain.pnlFileType.alignment = 'fill';
    
    // -- now a dropdown list
    dlgMain.ddFileType = dlgMain.pnlFileType.add("dropdownlist");
    dlgMain.ddFileType.preferredSize.width = StrToIntWithDefault( strddFileType, 100 );
    dlgMain.ddFileType.alignment = 'left';

    dlgMain.ddFileType.add("item", "JPEG");
    dlgMain.ddFileType.add("item", "PNG");

	dlgMain.ddFileType.onChange = function() {
		switch(this.selection.index) {
			case jpegIndex:	
				dlgMain.pnlFileType.pnlOptions.text = strJPEGOptions;
				break;
			case png8Index:		
			default:		
				dlgMain.pnlFileType.pnlOptions.text = strPNG8Options;
				break;
		}
	}

	// -- now the options panel that changes
    dlgMain.pnlFileType.pnlOptions = dlgMain.pnlFileType.add("panel", undefined, "Options");
    dlgMain.pnlFileType.pnlOptions.alignment = 'fill';
    dlgMain.pnlFileType.pnlOptions.orientation = 'stack';
    dlgMain.pnlFileType.pnlOptions.preferredSize.height = StrToIntWithDefault( strpnlOptions, 100 );

	// Image resize percentage options
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions = dlgMain.pnlFileType.pnlOptions.add("group");
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.add("statictext", undefined, strLabelResize);
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize = dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.add('slider', undefined, exportInfo.imageResize, 10, 100);
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize.preferredSize = [99, -1];
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize = dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.add("edittext", undefined, exportInfo.imageResize.toString());
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize.preferredSize.width = StrToIntWithDefault( stretResize, 40 );
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize.onChange = makeResizeFieldValidationFunction(undefined, dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize);
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize.onChanging = (function(field) { return function () { this.value = field.text = Math.round(this.value); }; })(dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize);
    dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize.onChange = dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.slResize.onChanging;

    dlgMain.ddFileType.items[exportInfo.fileType].selected = true;

	// the right side of the dialog, the ok and cancel buttons
	dlgMain.grpTopRight = dlgMain.grpTop.add("group");
	dlgMain.grpTopRight.orientation = 'column';
	dlgMain.grpTopRight.alignChildren = 'fill';
	
	dlgMain.btnRun = dlgMain.grpTopRight.add("button", undefined, strButtonRun );
    dlgMain.btnRun.onClick = function() {
		// check if the setting is properly
		var destination = dlgMain.etDestination.text;
		if (destination.length == 0) {
	        alert(strAlertSpecifyDestination);
			return;
		}
		var testFolder = new Folder(destination);
		if (!testFolder.exists) {
	        alert(strAlertDestinationNotExist);
			return;
		}
    
		dlgMain.close(runButtonID);
	}

	dlgMain.btnCancel = dlgMain.grpTopRight.add("button", undefined, strButtonCancel );
    dlgMain.btnCancel.onClick = function() { 
		dlgMain.close(cancelButtonID); 
	}

	dlgMain.defaultElement = dlgMain.btnRun;
	dlgMain.cancelElement = dlgMain.btnCancel;

   	// the bottom of the dialog
	dlgMain.grpBottom = dlgMain.add("group");
	dlgMain.grpBottom.orientation = 'column';
	dlgMain.grpBottom.alignChildren = 'left';
	dlgMain.grpBottom.alignment = 'fill';
    
    dlgMain.pnlHelp = dlgMain.grpBottom.add("panel");
    dlgMain.pnlHelp.alignment = 'fill';

    dlgMain.etHelp = dlgMain.pnlHelp.add("statictext", undefined, strHelpText, {multiline:true});
    dlgMain.etHelp.alignment = 'fill';

	// do not allow anything except for numbers 0-9
	//dlgMain.pnlFileType.pnlOptions.grpPDFOptions.grpQuality.etResize.addEventListener ('keydown', NumericEditKeyboardHandler);

	// do not allow anything except for numbers 0-9
	//dlgMain.pnlFileType.pnlOptions.grpTIFFOptions.grpQuality.etResize.addEventListener ('keydown', NumericEditKeyboardHandler);

	// do not allow anything except for numbers 0-9
	//dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize.addEventListener ('keydown', NumericEditKeyboardHandler);

	 dlgMain.onShow = function() {
		 dlgMain.ddFileType.onChange();
	 }

    // in case we double clicked the file
    app.bringToFront();

    dlgMain.center();
    
    var result = dlgMain.show();
    
    if (cancelButtonID == result) {
		return result;  // close to quit
	}
    
    // get setting from dialog
    exportInfo.destination = dlgMain.etDestination.text;
    exportInfo.fileNamePrefix = dlgMain.etFileNamePrefix.text;
    exportInfo.selectionOnly = dlgMain.cbSelection.value;
    exportInfo.fileType = dlgMain.ddFileType.selection.index;
    exportInfo.imageResize = dlgMain.pnlFileType.pnlOptions.grpImageResizeOptions.etResize.text;
    exportInfo.prefixIndex = dlgMain.cbFileNamePrefixIndex.value;

    return result;
}


///////////////////////////////////////////////////////////////////////////////
// Function: initExportInfo
// Usage: create our default parameters
// Input: a new Object
// Return: a new object with params set to default
///////////////////////////////////////////////////////////////////////////////
function initExportInfo(exportInfo)
{
    exportInfo.destination = new String("");
    exportInfo.fileNamePrefix = new String("untitled_");
    exportInfo.selectionOnly = false;
    exportInfo.fileType = jpegIndex;
    exportInfo.imageResize = 100;
    exportInfo.prefixIndex = true;

    try {
        exportInfo.destination = Folder(app.activeDocument.fullName.parent).fsName; // destination folder
        var tmp = app.activeDocument.fullName.name;
        exportInfo.fileNamePrefix = decodeURI(tmp.substring(0, tmp.indexOf("."))); // filename body part
    } catch(someError) {
        exportInfo.destination = new String("");
        exportInfo.fileNamePrefix = app.activeDocument.name; // filename body part
    }
}

function logToHeadLights(eventRecord) 
{
    var headlightsActionID = stringIDToTypeID("headlightsLog");
    var desc = new ActionDescriptor();
    desc.putString(stringIDToTypeID("subcategory"), "Export");
    desc.putString(stringIDToTypeID("eventRecord"), eventRecord);
    executeAction(headlightsActionID, desc, DialogModes.NO);
}



///////////////////////////////////////////////////////////////////////////////
// Function: saveFile
// Usage: the worker routine, take our params and save the file accordingly
// Input: reference to the document, the name of the output file, 
//        export info object containing more information
// Return: <none>, a file on disk
///////////////////////////////////////////////////////////////////////////////
function saveFile( docRef, fileNameBody, exportInfo)
{
	// Select the opened document
	var document = docRef;

	// Choose the scale percentage
	var percentage = exportInfo.imageResize;
	if (percentage === undefined || percentage < 10 || percentage > 100) {
		percentage = 100;
	}

	switch (exportInfo.fileType) {
		case jpegIndex:
			var type = charIDToTypeID("tyJP"); /* tyJP for JPEG, tyPN for PNG */
			var saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".jpg");
		break;
		case png8Index:
			var type = charIDToTypeID("tyPN"); /* tyJP for JPEG, tyPN for PNG */
			var saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".png");
		break;
	}

	// Export the document
	var tinify = new ActionDescriptor();
	tinify.putPath(charIDToTypeID("In  "), saveFile); /* Overwrite original! */
	tinify.putUnitDouble(charIDToTypeID("Scl "), charIDToTypeID("#Prc"), percentage );

	var compress = new ActionDescriptor();
	compress.putObject(charIDToTypeID("Usng"), charIDToTypeID("tinY"), tinify);
	executeAction(charIDToTypeID("Expr"), compress, DialogModes.NO);

}


///////////////////////////////////////////////////////////////////////////////
// Function: zeroSuppress
// Usage: return a string padded to digit(s)
// Input: num to convert, digit count needed
// Return: string padded to digit length
///////////////////////////////////////////////////////////////////////////////
function zeroSuppress (num, digit)
{
    var tmp = num.toString();
    while (tmp.length < digit) {
		tmp = "0" + tmp;
	}
    return tmp;
}


///////////////////////////////////////////////////////////////////////////////
// Function: objectToDescriptor
// Usage: create an ActionDescriptor from a JavaScript Object
// Input: JavaScript Object (o)
//        object unique string (s)
//        Pre process converter (f)
// Return: ActionDescriptor
// NOTE: Only boolean, string, number and UnitValue are supported, use a pre processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you 
//        modify. I am not using include or eval statements as I want these 
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function objectToDescriptor (o, s, f) {
	if (undefined != f) {
		o = f(o);
	}
	var d = new ActionDescriptor;
	var l = o.reflect.properties.length;
	d.putString( app.charIDToTypeID( 'Msge' ), s );
	for (var i = 0; i < l; i++ ) {
		var k = o.reflect.properties[i].toString();
		if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
			continue;
		var v = o[ k ];
		k = app.stringIDToTypeID(k);
		switch ( typeof(v) ) {
			case "boolean":
				d.putBoolean(k, v);
				break;
			case "string":
				d.putString(k, v);
				break;
			case "number":
				d.putDouble(k, v);
				break;
			default:
			{
				if ( v instanceof UnitValue ) {
					var uc = new Object;
					uc["px"] = charIDToTypeID("#Rlt"); // unitDistance
					uc["%"] = charIDToTypeID("#Prc"); // unitPercent
					d.putUnitDouble(k, uc[v.type], v.value);
				} else {
					throw( new Error("Unsupported type in objectToDescriptor " + typeof(v) ) );
				}
			}
		}
	}
    return d;
}


///////////////////////////////////////////////////////////////////////////////
// Function: descriptorToObject
// Usage: update a JavaScript Object from an ActionDescriptor
// Input: JavaScript Object (o), current object to update (output)
//        Photoshop ActionDescriptor (d), descriptor to pull new params for object from
//        object unique string (s)
//        JavaScript Function (f), post process converter utility to convert
// Return: Nothing, update is applied to passed in JavaScript Object (o)
// NOTE: Only boolean, string, number and UnitValue are supported, use a post processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you 
//        modify. I am not using include or eval statements as I want these 
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
function descriptorToObject (o, d, s, f) {
	var l = d.count;
	if (l) {
	    var keyMessage = app.charIDToTypeID( 'Msge' );
        if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
	}
	for (var i = 0; i < l; i++ ) {
		var k = d.getKey(i); // i + 1 ?
		var t = d.getType(k);
		strk = app.typeIDToStringID(k);
		switch (t) {
			case DescValueType.BOOLEANTYPE:
				o[strk] = d.getBoolean(k);
				break;
			case DescValueType.STRINGTYPE:
				o[strk] = d.getString(k);
				break;
			case DescValueType.DOUBLETYPE:
				o[strk] = d.getDouble(k);
				break;
			case DescValueType.UNITDOUBLE:
				{
				var uc = new Object;
				uc[charIDToTypeID("#Rlt")] = "px"; // unitDistance
				uc[charIDToTypeID("#Prc")] = "%"; // unitPercent
				uc[charIDToTypeID("#Pxl")] = "px"; // unitPixels
				var ut = d.getUnitDoubleType(k);
				var uv = d.getUnitDoubleValue(k);
				o[strk] = new UnitValue( uv, uc[ut] );
				}
				break;
			case DescValueType.INTEGERTYPE:
			case DescValueType.ALIASTYPE:
			case DescValueType.CLASSTYPE:
			case DescValueType.ENUMERATEDTYPE:
			case DescValueType.LISTTYPE:
			case DescValueType.OBJECTTYPE:
			case DescValueType.RAWTYPE:
			case DescValueType.REFERENCETYPE:
			default:
				throw( new Error("Unsupported type in descriptorToObject " + t ) );
		}
	}
	if (undefined != f) {
		o = f(o);
	}
}


///////////////////////////////////////////////////////////////////////////////
// Function: preProcessExportInfo
// Usage: convert Photoshop enums to strings for storage
// Input: JavaScript Object of my params for this script
// Return: JavaScript Object with objects converted for storage
///////////////////////////////////////////////////////////////////////////////
function preProcessExportInfo(o) {
	o.tiffCompression = o.tiffCompression.toString();
	o.pdfEncoding = o.pdfEncoding.toString();
	o.targaDepth = o.targaDepth.toString();
	o.bmpDepth = o.bmpDepth.toString();
	return o;
}

///////////////////////////////////////////////////////////////////////////////
// Function: postProcessExportInfo
// Usage: convert strings from storage to Photoshop enums
// Input: JavaScript Object of my params in string form
// Return: JavaScript Object with objects in enum form
///////////////////////////////////////////////////////////////////////////////
function postProcessExportInfo(o) {
	o.tiffCompression = eval(o.tiffCompression);
	o.pdfEncoding = eval(o.pdfEncoding);
	o.targaDepth = eval(o.targaDepth);
	o.bmpDepth = eval(o.bmpDepth);
	return o;
}

///////////////////////////////////////////////////////////////////////////
// Function: StrToIntWithDefault
// Usage: convert a string to a number, first stripping all characters
// Input: string and a default number
// Return: a number
///////////////////////////////////////////////////////////////////////////
function StrToIntWithDefault( s, n ) {
    var onlyNumbers = /[^0-9]/g;
    var t = s.replace( onlyNumbers, "" );
	t = parseInt( t );
	if ( ! isNaN( t ) ) {
        n = t;
    }
    return n;
}

///////////////////////////////////////////////////////////////////////////
// Function: makeResizeFieldValidationFunction
// Usage: Validation for Resize fields
// Input: either an integer or a holding property
// Return: a function for .onChange
///////////////////////////////////////////////////////////////////////////
function makeResizeFieldValidationFunction(defaultValue, alternateProperty)
{
    return function () 
        {
            var val = this.text;
            if(isNaN(val))
                this.text = defaultValue ? defaultValue : alternateProperty.value;
            else
            {
                if(val > 100)
                    val = 100;
                if(val < 10)
                    val = 10;
                this.text = val;
                if(alternateProperty)
                    alternateProperty.value = val;
            }
        }; 
}

///////////////////////////////////////////////////////////////////////////////
// Function: folderExists
// Usage: see if the string passed in is a valid folder ask to create if not
// Input: string of the folder in question
// Return: true if folder exists or was created successfully
///////////////////////////////////////////////////////////////////////////////
function folderExists( folderAsString ) {
	var f = Folder(folderAsString);
	if (f.exists) return true;
	if (DialogModes.NO == app.playbackDisplayDialogs) return false;
	if (confirm(strCreateFolder + folderAsString)) {
		if (f.create()) {
			return true;
		} else {
			alert(strCouldNotCreate);
		}
	}
	return false;
}

///////////////////////////////////////////////////////////////////////////////
// Function: NumericEditKeyboardHandler
// Usage: Do not allow anything except for numbers 0-9
// Input: ScriptUI keydown event
// Return: <nothing> key is rejected and beep is sounded if invalid
///////////////////////////////////////////////////////////////////////////////
function NumericEditKeyboardHandler (event) {
    try {
        var keyIsOK = KeyIsNumeric (event) || 
		              KeyIsDelete (event) || 
					  KeyIsLRArrow (event) ||
					  KeyIsTabEnterEscape (event);
					  
        if (! keyIsOK) {
            //    Bad input: tell ScriptUI not to accept the keydown event
            event.preventDefault();
            /*    Notify user of invalid input: make sure NOT
                to put up an alert dialog or do anything which
                requires user interaction, because that
                interferes with preventing the 'default'
                action for the keydown event */
            app.beep();
        }
    }
    catch (e) {
        ; // alert ("Ack! bug in NumericEditKeyboardHandler: " + e);
    }
}


//    key identifier functions
function KeyHasModifier (event) {
    return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

function KeyIsNumeric (event) {
    return  (event.keyName >= '0') && (event.keyName <= '9') && ! KeyHasModifier (event);
}

function KeyIsDelete (event) {
    //    Shift-delete is ok
    return ((event.keyName == 'Backspace') || (event.keyName == 'Delete')) && ! (event.ctrlKey);
}

function KeyIsLRArrow (event) {
    return ((event.keyName == 'Left') || (event.keyName == 'Right')) && ! (event.altKey || event.metaKey);
}

function KeyIsTabEnterEscape (event) {
	return event.keyName == 'Tab' || event.keyName == 'Enter' || event.keyName == 'Escape';
}

///////////////////////////////////////////////////////////////////////////////
// Function: countCompsNames
// Usage:  Count the comps' names collecting duplicates
// Input: collection of comps
// Return: object with names as keys and as values, an object with total count and an index (for incrementing during file naming)
///////////////////////////////////////////////////////////////////////////////
function countCompsNames(list)
{
    var obj = {};
    for(var i = 0; i<list.length; i++)
    {
        var name = list[i].name;
        if(name in obj)
            obj[name].total += 1;
        else 
            obj[name] = {total: 1, nameIndex: 1};
    }
    return obj;
}

///////////////////////////////////////////////////////////////////////////////

// Function: selectedCompsConfigError

// Usage:  if the selected comps only option is on see if we have any selected

// Input: layer comps in the document, export settings

// Return: true for option on and none selected

///////////////////////////////////////////////////////////////////////////////

function selectedCompsConfigError(docLayerComps, exportInfo)

{
    
    if (exportInfo.selectionOnly) {
    
        var compsCount = docLayerComps.length;
    
        for ( compsIndex = 0; compsIndex < compsCount; compsIndex++ ) {

            var compRef = docLayerComps[ compsIndex ];

            if (compRef.selected) {
                
                return false; // all good, we have work to do
               
            }
        
        }
    
        return true; // none found selected, this is bad, no work to do
        
    }
                
    return false; // option off
    
}

// End Layer Comps To Tinify.jsx
