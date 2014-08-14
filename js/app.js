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

	brownieViewer.updateBrownie([
		[1,1,1],
		[1,2,1],
		[1,3,1],
		[2,1,1],
		[2,2,1],
		[2,3,1],
		[5,5,5]
	]);

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
