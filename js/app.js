(function(){

	"use strict";

	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer")
	});

	// allow adding random voxels
	$("#randVox").addEventListener("click", function(){
		brownieViewer.updateBrownie([[
			randWholeNumber(-10, 10),
			randWholeNumber(-10, 10),
			randWholeNumber(-10, 10)
		]]);
	});

	function randWholeNumber(min, max){
		return Math.floor((Math.random()*max) + min);
	}

	window.mainBrownieViewer = brownieViewer;


})();
