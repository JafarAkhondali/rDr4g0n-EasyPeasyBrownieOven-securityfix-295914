(function(){
	"use strict";

	/**
	 * Viewmodel for handling handling tools for interacting with
	 * SliceEditor.js
	 */
	function Toolbox(config){
		this.el = document.createElement("div");
		this.toolsEl = document.createElement("ul");
		this.toolsEl.classList.add("hbox");
		this.el.appendChild(this.toolsEl);

		this.toolPropertiesEl = config.toolPropertiesEl;

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

			// destroy previous tool's vm if preset
			if(this.currentTool && this.currentTool.tool.vm){
				teardownVM(this.currentTool.tool.vm);
			}
			
			var toolWrapped = this._getTool(toolId);

			// this tool aint in here bra!
			if(!toolWrapped) return;

			// empty tool properties element
			this.toolPropertiesEl.innerHTML = "";

			// if tool properties vm is provided, set it up
			if(toolWrapped.tool.vm){
				setupVM(toolWrapped.tool.vm, toolWrapped.tool, this.toolPropertiesEl);
			}

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



	// TODO - move these guys into general utils
	// or possibly onto some sorta VM object
	// and inherit them or something?
	function setupVM(vm, model, el){
		// insert template into DOM
		// TODO - create empty node if no el supplied
		el.innerHTML = vm.template;	
		vm.el = el;
		vm.model = model;
		bindVMEvents(vm);
		vm.init();
	}
	function teardownVM(vm){
		vm.el = null;
		vm.model = null;
		// TODO - unbind event listeners
		vm.destroy();
	}
	function bindVMEvents(vm){
		var func, selector, eventAction,
			eventMap = vm.eventMap || {};

		for(var i in eventMap){
			selector = i.split(" ");
			eventAction = selector.shift();
			selector = selector.join(" ");
			func = vm[eventMap[i]].bind(vm);

			if (typeof (func) == "function") {
				// TODO - event handlers that can be removed
				vm.el.addEventListener(eventAction, function(e){
					// TODO - cross browser `matches` method
					if(e.target.webkitMatchesSelector(selector)){
						func(e);
					}
				});
			}
		}
	}

	window.Toolbox = Toolbox;
})();