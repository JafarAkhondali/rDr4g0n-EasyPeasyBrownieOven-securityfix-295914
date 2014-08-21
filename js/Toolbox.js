(function(){
	"use strict";

	/**
	 * Viewmodel for handling handling tools for interacting with
	 * SliceEditor.js
	 */
	function Toolbox(config){
		this.el = document.createElement("div");
		this.toolsEl = document.createElement("ul");
		this.el.appendChild(this.toolsEl);
		this.el.addEventListener("click", this.onClick.bind(this));

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
			tool.id = id;
			this.tools[id] = tool;
			tool.el.setAttribute("data-id", id);
			this.el.appendChild(tool.el);
		},

		setCurrentTool: function(tool){
			// if a string was passed in, treat it
			// as an id and lookup the tool
			if(typeof tool === "string"){
				tool = this.tools[tool];
			}

			// TODO - ensure this tool is in the toolbox?
			this.currentTool = tool;
			this.currentTool.select();
		},

		// proxy events to the currently selected tool
		editorMouseDown: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onEditorMouseDown(editor, coords);
		},
		editorMouseUp: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onEditorMouseUp(editor, coords);
		},
		editorDrag: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.onEditorDrag(editor, coords);
		},

		// delegate to tool that was clicked
		onClick: function(e){
			// if a tool was clicked and its not the current tool
			if(e.target.classList.contains("tool") && e.target.dataset.id !== this.currentTool.id){
				this.currentTool.deselect();
				this.setCurrentTool(e.target.dataset.id);
			}
		}
	}

	window.Toolbox = Toolbox;
})();