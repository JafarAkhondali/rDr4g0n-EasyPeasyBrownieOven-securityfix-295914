(function(){
	"use strict";

	/**
	 * Toolbox tool for erasing on SliceEditor.js
	 */
	function EraserTool(config){
		BrushTool.call(this, config);
	}

	EraserTool.prototype = Object.create(BrushTool.prototype);
	EraserTool.prototype.constructor = EraserTool;

	EraserTool.prototype.render = function(){
		// TODO - use a template
		this.el.innerHTML = "e";
	};

	EraserTool.prototype.onEditorMouseDown = function(editor, coords){
		editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], null);
		console.log("eraser mousedown at", coords, editor.getSlice(), null);

		editor.on("mousemove", this.onDrag);
	};

	EraserTool.prototype.onEditorDrag = function(editor, coords){
		editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], null);
	};

	EraserTool.prototype.onEditorMouseUp = function(editor, coords){
		editor.off("mousemove", this.onDrag);
	}

	window.EraserTool = EraserTool;
})();