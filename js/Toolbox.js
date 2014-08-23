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

		this.onToolClick = this.onToolClick.bind(this);

		this.tools = [];

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
			var toolWrap,
				toolEl = document.createElement("li");

			// setup a dom element for this tool
			toolEl.classList.add("tool");
			toolEl.setAttribute("data-id", id);
			toolEl.innerHTML = "<i class='tool-icon "+ tool.icon +"'></i>";
			toolEl.addEventListener("click", this.onToolClick)

			this.tools.push({
				id: id,
				tool: tool,
				el: toolEl
			});

			// put tool's dom element into tool li
			this.toolsEl.appendChild(toolEl);
		},

		setCurrentTool: function(toolId){
			var toolWrapped = this._getTool(toolId);

			// this tool aint in here bra!
			if(!toolWrapped) return;

			if(toolWrapped){
				this.currentTool = toolWrapped;
				this.selectToolEl(toolWrapped.el);
			}
		},

		// proxy events to the currently selected tool
		editorMouseDown: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorMouseDown(editor, coords);
		},
		editorMouseUp: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorMouseUp(editor, coords);
		},
		editorDrag: function(editor, coords){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorDrag(editor, coords);
		},

		// delegate to tool that was clicked
		onToolClick: function(e){
			// if a tool was clicked and its not the current tool
			if(e.currentTarget.dataset.id !== this.currentTool.id){
				this.setCurrentTool(e.currentTarget.dataset.id);
			}
		},

		// NOTE: this returns the wrapped up tool, not
		// the straight up tool object
		_getTool: function(id){
			for(var i = 0; i < this.tools.length; i++){
				if (this.tools[i].id === id){
					return this.tools[i];
				}
			}
		},

		selectToolEl: function(el){
			this.tools.forEach(function(tool){
				this.deselectToolEl(tool.el);
			}.bind(this));
			el.classList.add("selected");
		},

		deselectToolEl: function(el){
			el.classList.remove("selected");
		}
	}

	window.Toolbox = Toolbox;
})();