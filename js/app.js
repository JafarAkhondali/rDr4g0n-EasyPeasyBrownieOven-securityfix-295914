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
	var brownieModel = new BrownieModel(10, 10, 10);

	// 3D view of our model
	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer"),
		model: brownieModel
	});

	// editor for the mdoel
	var sliceEditor = new SliceEditor({
		canvas: $("#sliceEditor"),
		model: brownieModel
	});

})();
