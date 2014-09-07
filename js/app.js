(function(){

	"use strict";

	// jquery-esque selectors
	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	// our main model dude guy
	var brownieModel = new BrownieModel({
		name: "NES sprite",
		height: 24,
		width: 24,
		depth: 24
	});

	// 3D view of our model
	var brownieViewer = new BrownieViewer({
		el: $("#brownieViewer"),
		model: brownieModel
	});

	// editor for the model
	var sliceEditor = new SliceEditor({
		el: $("#sliceEditor"),
		model: brownieModel,
		showGrid: true
	});

	window.onresize = function(){
		sliceEditor.resizeCanvas();
		brownieViewer.resizeCanvas();
	};

	// TODO - move this somewhere else...
	// toggle individual slice vs entire brownie view
	brownieViewer.canvas.addEventListener("click", function(e){
		if(brownieViewer.sliced){
			brownieViewer.unshowSlice();
		} else {
			brownieViewer.showSlice(brownieModel.getSlice(sliceEditor.getSlice()));
		}
	});

	var toolbox = new Toolbox({
		editors: [sliceEditor],
		toolPropertiesEl: $("#toolProperties"),
		// TODO - is it appropriate to pass this in?
		brownieViewer: brownieViewer
	});

	var brushTool = new BrushTool();
	var eraserTool = new EraserTool();

	toolbox.addTool("brush", brushTool);
	toolbox.addTool("eraser", eraserTool);

	toolbox.setCurrentTool("brush");
	$("#toolbox").insertBefore(toolbox.el, $("#toolbox").firstChild);

	// slice selector
	// TODO - bind to model or something...
	// $("#sliceSelector").addEventListener("change", function(e){
	// 	sliceEditor.setSlice(e.target.value);
	// });


	// loads a new brownie into brownieViewer and sliceEditor
	function newBrownie(name, width, height, depth){
		var brownieModel = new BrownieModel({
			name: name,
			width: width,
			height: height,
			depth: depth
		});
		brownieViewer.loadBrownie(brownieModel);
		sliceEditor.loadBrownie(brownieModel);
	}
	// loads an existing brownie into brownieViewer and sliceEditor
	function loadBrownie(brownieModel){
		brownieViewer.loadBrownie(brownieModel);
		sliceEditor.loadBrownie(brownieModel);
	}
	
	function importBrownie(data){
		var	brownieData,
			brownieDataStr = data,
			brownieModel;

		// TODO - try/catch json parse and fromJSON
		if(typeof brownieDataStr === "string"){
			brownieData = JSON.parse(brownieDataStr);

		// an already parsed brownie was passed in
		} else if(typeof brownieDataStr === "object"){
			brownieData = brownieDataStr;
		}
		
		// TODO - ensure all fields are present/valid
		brownieModel = new BrownieModel({
			id: brownieData.id,
			name: brownieData.name,
			width: brownieData.width,
			height: brownieData.height,
			depth: brownieData.depth
		});

		brownieModel.import(brownieData.data);

		loadBrownie(brownieModel);
	}
	
	$(".newBrownieIcon").addEventListener("click", function(){
		new Modal({
			title: "Bake Up a New Brownie!",
			content: $("#newBrownieTemplate").innerHTML,
			actions: [
				{ label: "Nevermind", class: "passive close" },
				{ label: "Create", class: "primary create" }
			],
			eventMap: {
				"click .close": "close",
				"change .size": function(e){
					// keep all sizes even
					var size = e.target.value;
					this.modal.querySelector(".width").value = size;
					this.modal.querySelector(".height").value = size;
					this.modal.querySelector(".depth").value = size;
				},
				"click .create": function(e){
					// TODO - validate!
					var name = this.modal.querySelector(".name").value,
						width = this.modal.querySelector(".width").value,
						height = this.modal.querySelector(".height").value,
						depth = this.modal.querySelector(".depth").value;

					newBrownie(name, width, height, depth);
					this.close();
				}
			}
		}).open();
	});

	$(".openBrownieIcon").addEventListener("click", function() {
		new Modal({
			title: "Load Up an Existing Brownie!",
			content: $("#loadBrownieTemplate").innerHTML,
			actions: [
				{ label: "Nevermind", class: "passive close" },
				{ label: "Load 'er Up", class: "primary load" }
			],
			eventMap: {
				"click .close": "close",
				"click .load": function(e){
					// TODO - validate!					
					var importData = this.modal.querySelector(".import").value,
						selectedBrownie = this.modal.querySelector(".brownieList li.selected"),
						brownieData;

					// if import has data, then try to parse that guy
					if(importData){
						brownieData = importData;

					// load the selected one from LS
					} else if(selectedBrownie){
						brownieData = this.getLocalBrownie(selectedBrownie.getAttribute("data-id"));
					}

					if(brownieData) importBrownie(brownieData);

					this.close();
				},
				"click .brownieList li": function(e){
					var currSelected = this.modal.querySelector(".brownieList li.selected");
					if(currSelected) currSelected.classList.remove("selected");

					e.target.classList.add("selected");
				}
			},
			// gets local brownies and returns em in li's
			getLocalBrownies: function(){
				var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
					brownies = localStore.brownies || {},
					brownieElements = [],
					brownie;

				for(var i in brownies){
					brownie = brownies[i];
					brownieElements.push("<li data-id='"+ brownie.id +"'>"+ brownie.name +"</li>");
				}

				return brownieElements.join(" ");
			},
			// gets a specific local brownie by id
			getLocalBrownie: function(id){
				var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
					brownies = localStore.brownies || {};

				return brownies[id];
			}
		}).open();
	});

	$(".configureBrownieIcon").addEventListener("click", function() {
		new Modal({
			title: "Load Up an Existing Brownie!",
			content: $("#configureBrownieTemplate").innerHTML,
			actions: [
				{ label: "Nevermind", class: "passive close" },
				{ label: "Save Them Changes", class: "primary save" }
			],
			eventMap: {
				"click .close": "close",
				"click .save": function(e){
					// TODO - validate!
					var name = this.modal.querySelector(".name").value;

					brownieViewer.model.name = name;
					brownieViewer.model.saveToLS();

					this.close();
				}
			},
			// gets a specific local brownie by id
			getLocalBrownie: function(id){
				var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
					brownies = localStore.brownies || {};

				return brownies[id];
			},
			getBrownieName: function(){
				return this.getLocalBrownie(brownieViewer.model.id).name;
			},
			getBrownieData: function(){
				return JSON.stringify(this.getLocalBrownie(brownieViewer.model.id));
			}
		}).open();
	});



})();
