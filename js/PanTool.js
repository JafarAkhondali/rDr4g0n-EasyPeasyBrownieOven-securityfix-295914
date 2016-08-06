(function(){
	"use strict";

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function PanTool(config){
		this.icon = "flaticon-right3";

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);

	}

	PanTool.prototype = {
		constructor: PanTool,

		onEditorMouseDown: function(editor, coords, e){
            this.lastCoords = [e.offsetX, e.offsetY];
		},

		onEditorDrag: function(editor, coords, e){
            var offset = [this.lastCoords[0] - e.offsetX, this.lastCoords[1] - e.offsetY];
            this.lastCoords = [e.offsetX, e.offsetY];
            editor.updateTranslationOffset(offset);
		},

        onEditorMouseUp: function(){}
	};

	window.PanTool = PanTool;
	
})();
