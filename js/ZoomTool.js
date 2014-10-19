(function(){
	"use strict";

    // amount of dead space before mouse
    // movement is considered a drag
    var DRAG_DEADZONE = 20;

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function ZoomTool(config){
		this.icon = "flaticon-zoom46";

        // if draggy zoom, we don't want to apply the regular
        // clicky zoom on mouseup
        this.draggyOffset = 0;

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);

	}

	ZoomTool.prototype = {
		constructor: ZoomTool,

		onEditorMouseDown: function(editor, coords, e){
            this.lastX = e.offsetX;
		},

		onEditorDrag: function(editor, coords, e){
            var offset = this.lastX - e.offsetX;

            this.draggyOffset += Math.abs(offset);
            
            // if the user's mouse has moved more than 20px,
            // then consider this a draggy zoom
            if(this.draggyOffset > DRAG_DEADZONE){
                editor.incZoom(offset * 0.1);
                // TODO - translate grid so zoom is centered around mouse pointer
            }

            this.lastX = e.offsetX;
		},

        onEditorMouseUp: function(editor, coords, e){
            var oldPxMulti = editor.pxMultiplier,
                // when zooming, an offset needs to be supplied
                // to keep the zoomed pixel directly under the mouse
                translateOffsetX,
                translateOffsetY;

            e.preventDefault();

            // if this isn't a drag, zoom!
            if(this.draggyOffset < DRAG_DEADZONE){
                var zoomMulti = 0.1,
                    zoomIncrement;

                // if ctrl+click, zoom out
                // TODO - use alt modifier ala photoshop?
                if(e.ctrlKey){
                    zoomIncrement = 1 - zoomMulti;
                } else {
                    zoomIncrement = 1 + zoomMulti;
                }

                editor.zoom(zoomIncrement);
                
                //TODO - translate the grid so that zoom is centered around mouse pointer
                //translateOffsetX = ((editor.canvas.width * 0.5 - e.offsetX) * oldPxMulti) - ((editor.canvas.width * 0.5 - e.offsetX) * editor.pxMultiplier);
                //translateOffsetY = ((editor.canvas.height * 0.5 - e.offsetY) * oldPxMulti) - ((editor.canvas.height * 0.5 - e.offsetY) * editor.pxMultiplier);

                //// TODO - dont directly access editor.canvas.width and height
                //editor.updateTranslationOffset(translateOffsetX, translateOffsetY);
            }

            this.draggyOffset = 0;
        }
	};

	window.ZoomTool = ZoomTool;
	
})();
