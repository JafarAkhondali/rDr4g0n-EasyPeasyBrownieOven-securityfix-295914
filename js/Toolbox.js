(function(){
	"use strict";

	/**
	 * Viewmodel for handling handling tools for interacting with
	 * SliceEditor.js
	 */
	function Toolbox(config){

		this.tools = {};

		// listen to slice editors
		if(config.editors){
			config.editors.forEach(function(editor){
				editor.on("mousedown", function(coords){
					this.editorMouseDown(editor, coords);
				}.bind(this));
				editor.on("mouseup", function(coords){
					this.editorMouseUp(editor, coords);
				}.bind(this));
				editor.on("drag", function(coords){
					this.editorDrag(editor, coords);
				}.bind(this));
			}.bind(this));
		}
	}

	Toolbox.prototype = {
		constructor: Toolbox,

		addTool: function(id, tool){
			this.tools[id] = tool;
			// TODO - wire up toolbox event listeners
		},

		setCurrentTool: function(tool){
			// TODO - ensure this tool is in the toolbox?
			this.currentTool = tool;
		},

		// proxy events to the currently selected tool
		editorMouseDown: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onMouseDown(editor, coords);
		},
		editorMouseUp: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onMouseUp(editor, coords);
		},
		editorDrag: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onDrag(editor, coords);
		}
	}

	window.Toolbox = Toolbox;
})();