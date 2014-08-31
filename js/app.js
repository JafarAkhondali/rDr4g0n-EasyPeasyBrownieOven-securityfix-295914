(function(){

	"use strict";

	// jquery-esque selectors
	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	var sliceEditor, brownieViewer, brownieModel;

	function init(){

		// our main model dude guy
		brownieModel = new BrownieModel(24, 24, 24);

		// 3D view of our model
		brownieViewer = new BrownieViewer({
			el: $("#brownieViewer"),
			model: brownieModel
		});

		// editor for the model
		sliceEditor = new SliceEditor({
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

		// listen for new brownie click
		$(".newBrownie").addEventListener("click", function(e){ initBrownie(); });
		$(".saveBrownie").addEventListener("click", saveBrownie);
		$(".loadBrownie").addEventListener("click", loadBrownie);
	}

	function initBrownie(brownie){
		// TODO - get size from user
		brownieModel = new BrownieModel(24, 24, 24);
		brownieViewer.updateModel(brownieModel);
		sliceEditor.updateModel(brownieModel);
	}

	function saveBrownie(){
		// TODO - store name, unique id and l,w,h
		localStorage.brownies = JSON.stringify(brownieViewer.brownies["brownie"].toJSON());
	}

	function loadBrownie(){
		var brownieModel,
			savedBrownieData = JSON.parse(localStorage.brownies),
			brownie = new Brownie(brownieViewer.renderer);

		brownie.fromJSON(savedBrownieData);

		// TODO - get l, w, h from stored object
		brownieModel = new BrownieModel(24, 24, 24);

		// read data from brownie object into browniemodel
		// TODO - savedBrownieData isn't a good place to get
		// this data from. brownie should expose a method
		savedBrownieData.forEach(function(px){
			// TODO - brownie color to hex
			brownieModel[brownieModel.createKey([px.x, px.y, px.z])] = "#FF0000";
		});

		brownieViewer.updateModel(brownieModel, brownie);
		sliceEditor.updateModel(brownieModel);
	}

	init();

})();
