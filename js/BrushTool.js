(function(){
	"use strict";

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function BrushTool(config){
		this.icon = "flaticon-pencil5";

		// TODO - expose various config options in UI
		this.size = 1;
		this.shape = "square";
		this.currColor = "#FFFFFF";
		this.palette = "NES Basic";

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorMouseUp = this.onEditorMouseUp.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);
	}

	BrushTool.prototype = {
		constructor: BrushTool,

		onEditorMouseDown: function(editor, coords){
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
			console.log("brush mousedown at", coords, editor.getSlice(), this.currColor);

			editor.on("mousemove", this.onDrag);
		},

		onEditorDrag: function(editor, coords){
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
		},

		onEditorMouseUp: function(editor, coords){
			editor.off("mousemove", this.onDrag);
		}
	}

	window.BrushTool = BrushTool;
})();