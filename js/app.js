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
	var brownieModel = new BrownieModel("NES sprite", 24, 24, 24);

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
		var brownieModel = new BrownieModel(name, width, height, depth);
		brownieViewer.loadBrownie(brownieModel);
		sliceEditor.loadBrownie(brownieModel);
	}
	// loads an existing brownie into brownieViewer and sliceEditor
	function loadBrownie(brownieModel){
		brownieViewer.loadBrownie(brownieModel);
		sliceEditor.loadBrownie(brownieModel);
	}
	
	$(".exportIcon").addEventListener("click", function(){
		// TODO - dont rely explicitly on brownieViewer to get model?
		var brownieData = JSON.stringify(brownieViewer.model.export());

		new Modal({
			title: "Here's your order sir.",
			content: "<textarea style='width:100%; height: 200px; padding: 4px;'>{{model.brownieData}}</textarea>",
			model: {brownieData: brownieData},
			actions: [
				{ label: "Oah Neato!", class: "primary close" }
			],
			eventMap: {
				"click .close": "close"
			}
		}).open();
	});
	
	$(".importIcon").addEventListener("click", function(){
		new Modal({
			title: "Paste your brownie batter below.",
			content: "<textarea style='width:100%; height: 200px; padding: 4px;' placeholder='Brownie data here please.'></textarea>",
			actions: [
				{ label: "Nevermind", class: "passive close" },
				{ label: "Import", class: "primary import" }
			],
			eventMap: {
				"click .close": "close",
				"click .import": function(e){
					var	brownieData,
						brownieDataStr = this.modal.querySelector("textarea").value,
						brownieModel;

					// TODO - try/catch json parse and fromJSON
					brownieData = JSON.parse(brownieDataStr);
					
					// TODO - ensure all fields are present/valid
					brownieModel = new BrownieModel(brownieData.name, brownieData.width, brownieData.height, brownieData.depth);

					brownieModel.import(brownieData.data);

					loadBrownie(brownieModel);

					this.close();
				}
			}
		}).open();
	});
	
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



})();
