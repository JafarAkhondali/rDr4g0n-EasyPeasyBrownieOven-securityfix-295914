(function(){
	"use strict";

	/**
	 * Raster grid for painting a slice of brownie
	 */
	function SliceEditor(config){

		// mixin event emitting superpowers
		eventEmitter.call(this);

		// TODO - ensure config.canvas
		this.canvas = config.canvas;

		// TODO - probably a better way to set width/height
		this.canvas.width = +this.canvas.dataset["width"];
		this.canvas.height = +this.canvas.dataset["height"];
		this.context = this.canvas.getContext("2d");

		// TODO - bind model
		this.model = config.model;
		this.model.on("change", this.render, this);

		// determine brownie width
		this.brownieWidth = this.model.width;

		// determine brownie height
		this.brownieHeight = this.model.height;

		// ratio is always square
		this.pxMultiplier = Math.min(this.canvas.width / this.brownieWidth, this.canvas.height / this.brownieHeight);
		
		// bind context for event listeners
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);

		// listen for clicksies
		this.canvas.addEventListener("mousedown", this.onMouseDown);
		this.canvas.addEventListener("mouseup", this.onMouseUp);
		this.canvas.addEventListener("mousewheel", this.onMouseWheel);

		this._slice = 0;

		this.render();
	}

	SliceEditor.prototype = {
		constructor: SliceEditor,

		render: function(){

			// draw pixels
			var val,
				pxMultiplier = this.pxMultiplier;

			// clear canvas
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			this.context.strokeStyle = "#444444";

			for(var x = 0; x < this.brownieWidth; x++){
				for(var y = 0; y < this.brownieHeight; y++){
					val = this.modelGet([x, y, this.getSlice()]);

					if(val){
						this.context.fillStyle = val;
						this.context.fillRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);
					}
					this.context.strokeRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);
				}
			}
		},

		onMouseDown: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mousedown", px);

			// listen for drag event
			this.canvas.addEventListener("mousemove", this.onDrag);
		},

		onMouseUp: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mouseup", px);

			// clear listener for drag
			this.canvas.removeEventListener("mousemove", this.onDrag);
		},

		onDrag: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("drag", px);
		},

		onMouseWheel: function(e){
			e.preventDefault();
			console.log(e.wheelDelta);
			if(e.wheelDelta > 0){
				this.incrementSlice();
			} else {
				this.decrementSlice();
			}
			this.render();
		},

		getTouchedPixel: function(mousePos){
			return [
				Math.ceil(mousePos[0] / this.pxMultiplier),
				Math.ceil(mousePos[1] / this.pxMultiplier),
			];
		},
		
		setColor: function(color){
			this.currColor = color;
		},

		modelSet: function(coords, val){
			this.model.model[this.model.createKey([coords[0], coords[1], coords[2]])] = val;
		},
		modelGet: function(coords){
			return this.model.model[this.model.createKey([coords[0], coords[1], coords[2]])];
		},

		getSlice: function(){
			return this._slice;
		},
		setSlice: function(slice){
			// TODO - ensure slice is within bounds
			this._slice = +slice;
			this.render();
		},
		incrementSlice: function(){
			// TODO - clamp
			this._slice++;
		},
		decrementSlice: function(){
			this._slice--;
		},
	}

	// http://stackoverflow.com/a/17108084/957341
	// but modified by me
	function getMousePos(evt){
		var isTouchSupported = 'ontouchstart' in window;

		// for touch devices
		if(isTouchSupported){ 
			return [evt.clientX-containerX, evt.clientY-containerY]

	    //for webkit browser like safari and chrome
		} else if(evt.offsetX || evt.offsetX == 0){
		   	return [evt.offsetX, evt.offsetY];

		// for mozilla firefox
		} else if(evt.layerX || evt.layerX == 0){
			return [evt.layerX, evt.layerY]
		}
	}

	window.SliceEditor = SliceEditor;

})();