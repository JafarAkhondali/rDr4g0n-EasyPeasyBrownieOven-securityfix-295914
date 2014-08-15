(function(){
	"use strict";

	function SliceEditor(config){
		// TODO - ensure config.canvas
		this.canvas = config.canvas;
		this.context = this.canvas.getContext("2d");

		this.brownieWidth = config.brownieWidth || 10;
		this.brownieHeight = config.brownieHeight || 10;

		// ratio is always square
		this.pxRatio = Math.min(this.canvas / this.brownieWidth, this.canvas / this.brownieHeight);
	}

	SliceEditor.prototype = {
		constructor: SliceEditor,

		render: function(){

		}
	}

})();m