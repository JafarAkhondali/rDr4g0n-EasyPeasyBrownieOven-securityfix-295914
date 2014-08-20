(function(){
	"use strict";

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function BrushTool(){
		this.size = 1;
		this.mode = "paint";
		this.currColor = "#FFFFFF";

		// bind context for event handlers
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onDrag = this.onDrag.bind(this);
	}

	BrushTool.prototype = {
		constructor: BrushTool,

		onMouseDown: function(editor, coords){
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
			console.log("brush mousedown at", coords, editor.getSlice(), this.currColor);

			editor.on("mousemove", this.onDrag);
		},

		onDrag: function(editor, coords){
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
		},

		onMouseUp: function(editor, coords){
			editor.off("mousemove", this.onDrag);
		}
	}

	window.BrushTool = BrushTool;
})();