(function(){
	"use strict";

	var LAYER_OPACITY = 0.25,
		GRID_COLOR = "#555555",
		CURSOR_HINT_COLOR = "#4CE806";

	/**
	 * Raster grid for painting a slice of brownie
	 */
	function SliceEditor(config){

		// mixin event emitting superpowers
		eventEmitter.call(this);

		this.initModel(config.model);
        this._slice = 0;

        // TODO - retrieve from config?
        this.onionSkin = -1;

		// TODO - ensure el exists
		this.el = config.el;

        // used to pan the view around by offsetting/translating
        // any drawing to the canvas
        this.translation = [0,0];

        // add action bar to this mug
        // TODO - use a proper VM for panel or something
        var titleBar = document.createElement("div");
        titleBar.innerHTML = "<span class='title'>Slice Editor</span>";
        titleBar.classList.add("titleBar");
        this.el.appendChild(titleBar);

		this.canvas = document.createElement("canvas");
		this.resizeCanvas();
		this.el.appendChild(this.canvas);

        // TODO - dont use thisSliceEditor var... :/
        var thisSliceEditor = this;

        // show x, y and slice
        this.statusVM = new ViewModel({
            template: document.getElementById("sliceEditorControlsTemplate").innerHTML,
            // TODO - the `this` object updates frequently
            // causing the VM to re-render rapidly :(
            model: thisSliceEditor,
            eventMap: {
                "change .onionSkinSelect": function(e){
                    this.setOnionSkin(e.target.value);
                }
            },
            getOnionSkin: function(){
                return thisSliceEditor.onionSkin;
            },
            setOnionSkin: function(val){
                thisSliceEditor.onionSkin = +val;
            },
            generateOnionOptions: function(){
                var optsMap = {
                    "0": "none",
                    "-1": "below",
                    "1": "above"
                };
                var opts = [],
                    currOnionSkin = this.getOnionSkin();

                for(var i in optsMap){
                    // NOTE: currOnionSkin == i allows type coercion since
                    // i will be a string but currOnionSkin will be a number
                    opts.push("<option value='"+ i +"' "+ (currOnionSkin == i ? "selected" : "") +">"+ optsMap[i] +"</option>");
                }

                return opts.join("");
            }
        });
        this.el.appendChild(this.statusVM.el);

		this.context = this.canvas.getContext("2d");

		this.showGrid = config.showGrid;

		this.cursorPos = [];
		
		// bind context for event listeners
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseOut = this.onMouseOut.bind(this);

		// listen for clicksies
		// TODO - event object would be cleaner here
		this.canvas.addEventListener("mousedown", this.onMouseDown);
		this.canvas.addEventListener("mouseup", this.onMouseUp);
		this.canvas.addEventListener("mousewheel", this.onMouseWheel);
		this.canvas.addEventListener("mousemove", this.onMouseMove);
		this.canvas.addEventListener("mouseout", this.onMouseOut);

		this.render = this.render.bind(this);
		this.render();
	}

	SliceEditor.prototype = {
		constructor: SliceEditor,

		render: function(){

			var currLayer = [],
				onionLayer = [],
				pxMultiplier = this.pxMultiplier,
				val, onionVal,
                offsetX = this.translation[0],
                offsetY = this.translation[1];

			// clear canvas
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			// draw grid and store other pixels to draw
			this.context.strokeStyle = GRID_COLOR;
			for(var x = 0; x < this.brownieWidth; x++){
				for(var y = 0; y < this.brownieHeight; y++){

					val = this.modelGet([x, y, this.getSlice()]);
					onionVal = this.modelGet([x, y, this.getSlice() + this.onionSkin]);

					// if a value should be set here
					if(val){
						currLayer.push([x, y, val]);
						
					// if no value on this layer, but the onion skin layer has something
					} else if(this.onionSkin && onionVal){
						onionLayer.push([x, y,onionVal]);

					// if there is nothing on this pixel, and
					// grid should be shown, draw the grid box
					} else if(this.showGrid){
						this.context.strokeRect(x * pxMultiplier + offsetX, y * pxMultiplier + offsetY, pxMultiplier, pxMultiplier);
					}
				}
			}

			// draw origin marker thing
			this.context.fillStyle = GRID_COLOR;
			this.context.beginPath();
      		this.context.arc(this.canvas.width * 0.5 + offsetX, this.canvas.height * 0.5 + offsetY, 5, 0, 2 * Math.PI);
      		this.context.fill();

			// draw previous layer
			onionLayer.forEach(function(px){
				this.context.fillStyle = "rgba(" + hexColorToInt(px[2]).join(",") +","+ LAYER_OPACITY +")";
				this.context.fillRect(px[0] * pxMultiplier + offsetX, px[1] * pxMultiplier + offsetY, pxMultiplier, pxMultiplier);
				this.context.strokeStyle = px[2];
				this.context.strokeRect(px[0] * pxMultiplier + offsetX, px[1] * pxMultiplier + offsetY, pxMultiplier, pxMultiplier);
			}.bind(this));

			// draw current layer
			currLayer.forEach(function(px){
				this.context.fillStyle = px[2];
				this.context.fillRect(px[0] * pxMultiplier + offsetX, px[1] * pxMultiplier + offsetY, pxMultiplier, pxMultiplier);
			}.bind(this));

			// draw cursor hint
			if(this.cursorPos.length){
				this.context.strokeStyle = CURSOR_HINT_COLOR;
				this.context.strokeRect(this.cursorPos[0] * pxMultiplier + offsetX, this.cursorPos[1] * pxMultiplier + offsetY, pxMultiplier, pxMultiplier);
			}
			
			window.requestAnimationFrame(this.render);
		},

		// if containing element size changes,
		// resize the canvas
		resizeCanvas: function(){
			this.canvas.width = Math.min(this.el.clientHeight, this.el.clientWidth);
			this.canvas.height = Math.min(this.el.clientHeight, this.el.clientWidth);
			// ratio is always square
			this.pxMultiplier = Math.min(this.canvas.width / this.brownieWidth, this.canvas.height / this.brownieHeight);
		},

		onMouseDown: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mousedown", px, e);

			// listen for drag event
			this.canvas.addEventListener("mousemove", this.onDrag);
		},

		onMouseUp: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mouseup", px, e);

			// clear listener for drag
			this.canvas.removeEventListener("mousemove", this.onDrag);
		},

		onDrag: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("drag", px, e);
		},

		onMouseWheel: function(e){
			e.preventDefault();
			if(e.wheelDelta > 0){
				this.incrementSlice();
			} else {
				this.decrementSlice();
			}

			this.emit("mousewheel", e.wheelDelta);
			// this.render();
		},

		onMouseMove: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			// HACK - for some reason hover pixels are off by one
			px[0]--; px[1]--;
			this.cursorPos = px;
			this.emit("mousemove", px);
            
            // prevent dragging from highlighting
            e.preventDefault();
		},

		onMouseOut: function(e){
			this.cursorPos = [];
			this.emit("mouseout");
		},

		getTouchedPixel: function(mousePos){
			return [
				Math.ceil((mousePos[0] - this.translation[0]) / this.pxMultiplier),
				Math.ceil((mousePos[1] - this.translation[1]) / this.pxMultiplier),
			];
		},
		
		setColor: function(color){
			this.currColor = color;
		},

		modelSet: function(coords, val){
			var translatedCoords = this.translateOrigin(coords);

            // console.log("coords:", coords, "translatedCoords:", translatedCoords);
			// if val is null, delete the value
			if(val === null){
				delete this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])];
			} else {
				this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])] = val;
			}
		},
		modelGet: function(coords){			
			var translatedCoords = this.translateOrigin(coords);
			return this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])];
		},

		translateOrigin: function(coords){
			return [
				coords[0] - (this.brownieWidth * 0.5),
				(this.brownieHeight * 0.5) - coords[1],
				coords[2]
			];
		},

		getSlice: function(){
			return this._slice;
		},
		setSlice: function(slice){
			// TODO - ensure slice is within bounds
			this._slice = +slice;
			// this.render();
		},
		incrementSlice: function(){
			if(this._slice < this.model.depth * 0.5){
				this._slice++;
			}
		},
		decrementSlice: function(){
			if(this._slice > -this.model.depth * 0.5){
				this._slice--;
			}
		},

		// sets model and makes any model related configs
		initModel: function(model){

			this.model = model;
			// this.model.on("change", this.render, this);

			// determine brownie width
			this.brownieWidth = this.model.width;

			// determine brownie height
			this.brownieHeight = this.model.height;
		},

		// cleans up old state and loads a new brownie
		loadBrownie: function(model){
			this.initModel(model);
			this._slice = 0;
			this.resizeCanvas();
		},

        // move the canvas update the grid's translation coords
        // to effectively pan the grid
        updateTranslationOffset: function(coords){
            this.translation = [this.translation[0] - coords[0], this.translation[1] - coords[1]]; 
        },

        setZoom: function(newZoom){
            this.pxMultiplier = newZoom;    
        }
	};

	// http://stackoverflow.com/a/17108084/957341
	// but modified by me
	function getMousePos(evt){
		var isTouchSupported = 'ontouchstart' in window;

		// for touch devices
		if(isTouchSupported){ 
			return [evt.clientX-containerX, evt.clientY-containerY];

	    //for webkit browser like safari and chrome
		} else if(evt.offsetX || evt.offsetX === 0){
		   	return [evt.offsetX, evt.offsetY];

		// for mozilla firefox
		} else if(evt.layerX || evt.layerX === 0){
			return [evt.layerX, evt.layerY];
		}
	}

	// takes hex color like "#FF0000" and returns an
	// array of [r,g,b] ints
	function hexColorToInt(hex){
		var normalized = [];

		hex = hex.replace("#", "");
		for(var i = 0; i < 6; i+=2){
			normalized.push(parseInt(hex.substr(i, 2), 16));
		}

		return normalized;
	}

	window.SliceEditor = SliceEditor;

})();
