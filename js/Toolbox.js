(function(){
	"use strict";

	/**
	 * Viewmodel for handling handling tools for interacting with
	 * SliceEditor.js
	 */
	function Toolbox(config){
		this.el = document.createElement("div");
		this.toolsEl = document.createElement("ul");
		this.toolsEl.classList.add("vbox");
		this.el.appendChild(this.toolsEl);

		this.brownieViewer = config.brownieViewer;

		this.toolPropertiesEl = config.toolPropertiesEl;

		this.onToolClick = this.onToolClick.bind(this);

		this.tools = [];

		// listen to slice editors
		if(config.editors){
			config.editors.forEach(function(editor){
				editor.on("mousedown", function(coords, e){
					this.editorMouseDown(editor, coords, e);
				}.bind(this));
				editor.on("mouseup", function(coords, e){
					this.editorMouseUp(editor, coords, e);
				}.bind(this));
				editor.on("drag", function(coords, e){
					this.editorDrag(editor, coords, e);
				}.bind(this));
				editor.on("mousewheel", function(wheelDelta){
					this.editorMouseWheel(editor, wheelDelta);
				}.bind(this));
				editor.on("mousemove", function(coords, e){
					this.editorMouseMove(editor, coords, e);
				}.bind(this));
				editor.on("mouseout", function(){
					this.editorMouseOut(editor);
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
			toolEl.addEventListener("click", this.onToolClick);

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

			// empty tool properties element
			this.toolPropertiesEl.innerHTML = "";

			if(toolWrapped){
				this.currentTool = toolWrapped;
				this.selectToolEl(toolWrapped.el);

				// if a property sheet is present, use it
				if(this.currentTool.tool.propertyVM){
                    this.toolPropertiesEl.style.display = "block";
					this.toolPropertiesEl.appendChild(this.currentTool.tool.propertyVM.el);

                // otherwise, hide property panel
				} else {
                    this.toolPropertiesEl.style.display = "none";
               }
			}
		},

		// proxy events to the currently selected tool
		editorMouseDown: function(editor, coords, e){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorMouseDown(editor, coords, e);
		},
		editorMouseUp: function(editor, coords, e){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorMouseUp(editor, coords, e);
		},
		editorDrag: function(editor, coords, e){
			// TODO - ensure a tool is selected
			this.currentTool.tool.onEditorDrag(editor, coords, e);
		},
		editorMouseWheel: function(editor, wheelDelta){
			var sliceData;

			sliceData = editor.model.getSlice(editor.getSlice());
			this.brownieViewer.showSlice(sliceData);
		},
		editorMouseMove: function(editor, coords, e){
			var cursorPos;

			// update 3D cursor position
			cursorPos = editor.translateOrigin(coords.concat(editor.getSlice()));
			this.brownieViewer.updateCursorPosition(cursorPos);
		},
		editorMouseOut: function(editor){
			this.brownieViewer.updateCursorPosition();
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
	};

	window.Toolbox = Toolbox;
})();
