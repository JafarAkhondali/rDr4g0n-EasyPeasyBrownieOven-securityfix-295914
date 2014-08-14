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


})();
