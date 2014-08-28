(function(){

	"use strict";

	// jquery-esque selectors
	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	// our main model dude guy
	var brownieModel = new BrownieModel(24, 24, 24);

	// 3D view of our model
	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer"),
		model: brownieModel
	});

	// editor for the model
	var sliceEditor = new SliceEditor({
		canvas: $("#sliceEditor"),
		model: brownieModel,
		showGrid: true
	});

	// brownieViewer wants to show a cursor hint
	// when the mouse moves over a sliceEditor
	// TODO - when slice changes, the cursor position
	// should be updated
	sliceEditor.on("mousemove", function(coords){
		// TODO - gah this line is a travesty
		brownieViewer.updateCursorPosition(sliceEditor.translateOrigin(coords.concat(sliceEditor.getSlice())));
	});

	var toolbox = new Toolbox({
		editors: [sliceEditor],
		toolPropertiesEl: $("#toolProperties")
	});

	var brushTool = new BrushTool();
	var eraserTool = new EraserTool();

	toolbox.addTool("brush", brushTool);
	toolbox.addTool("eraser", eraserTool);

	toolbox.setCurrentTool("brush");
	$("#toolbox").insertBefore(toolbox.el, $("#toolbox").firstChild);

	// slice selector
	// TODO - bind to model or something...
	// $("#sliceSelector").addEventListener("change", function(e){
	// 	sliceEditor.setSlice(e.target.value);
	// });

})();
