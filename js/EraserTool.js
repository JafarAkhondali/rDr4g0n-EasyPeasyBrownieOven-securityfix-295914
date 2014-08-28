(function(){
	"use strict";

	/**
	 * Toolbox tool for erasing on SliceEditor.js
	 */
	function EraserTool(config){
		// BrushTool.call(this, config);

		this.icon = "flaticon-eraser8";

		// TODO - expose various config options in UI
		this.size = 1;
		this.shape = "square";

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorMouseUp = this.onEditorMouseUp.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);
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
	};

	EraserTool.prototype.onEditorDrag = function(editor, coords){
		editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], null);
	};

	EraserTool.prototype.onEditorMouseUp = function(editor, coords){
	}

	window.EraserTool = EraserTool;
})();