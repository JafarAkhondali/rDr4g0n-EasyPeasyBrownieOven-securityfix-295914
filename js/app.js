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
	var brownieModel = {},
		BROWNIE_WIDTH = 10,
		BROWNIE_HEIGHT = 10,
		// effectively z value
		sliceNum = 0;

	// create a 10x10 grid of points
	for(var x = 0; x < BROWNIE_WIDTH; x++){
		for(var y = 0; y < BROWNIE_HEIGHT; y++){
			brownieModel[x +","+ y] = null;
		}
	}

	// 3D view of our model
	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer")
	});

	window.brownie = brownieViewer;

	// editor for the mdoel
	var sliceEditor = new SliceEditor({
		canvas: $("#sliceEditor"),
		model: brownieModel
	});

	// event handlers for the model
	// TODO - event emitter instead of this mess
	Object.observe(brownieModel, function(changes){
		var brownieChangeset = [];

		// regardless of the change, the sliceEditor
		// needs to re-render
		sliceEditor.render();

		// find out waht the changes were and tell
		// the brownie viewer to set/unset those vox
		changes.forEach(function(change){
			// TODO - if !object[name] send unset command
			brownieChangeset.push([+change.name.split(",")[0], +change.name.split(",")[1], sliceNum]);
		});

		brownieViewer.updateBrownie(brownieChangeset);
	});

})();
