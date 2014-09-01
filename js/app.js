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
	var brownieModel = new BrownieModel(24, 24, 24);

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

	// HACK - just getting this working for now
	sliceEditor.canvas.addEventListener("mousewheel", function(e){
		var sliceData;

		sliceData = brownieModel.getSlice(sliceEditor.getSlice());
		brownieViewer.showSlice(sliceData);
	});
	brownieViewer.canvas.addEventListener("click", function(e){
		if(brownieViewer.sliced){
			brownieViewer.unshowSlice();
		} else {
			brownieViewer.showSlice(brownieModel.getSlice(sliceEditor.getSlice()));
		}
	});

	// cursor hinting for brownie viewer and slice editor
	// TODO - these 2 listeners may belong on toolbox
	// instead of up here at app level
	sliceEditor.on("mousemove", function(coords){
		// TODO - gah this line is a travesty
		brownieViewer.updateCursorPosition(sliceEditor.translateOrigin(coords.concat(sliceEditor.getSlice())));
	});
	// hide cursor hint on mouseout
	sliceEditor.on("mouseout", function(coords){
		brownieViewer.updateCursorPosition();
	});

	var toolbox = new Toolbox({
		editors: [sliceEditor],
		toolPropertiesEl: $("#toolProperties")
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
	
	$(".exportIcon").addEventListener("click", function(){
		var brownieData = JSON.stringify(brownieViewer.brownies["brownie"].toJSON());

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
				"click .import": "import"
			},
			import: function(e){
				var brownieData = this.modal.querySelector("textarea").value;

				// TODO - try/catch this junk
				console.log(brownieData);
				this.close();
			}
		}).open();
	});



})();
