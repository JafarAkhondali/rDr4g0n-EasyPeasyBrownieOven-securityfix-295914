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
            // track the touched pixel so that draggy zoom
            // is centered around that pixel
            this.lastCoords = coords;
		},

		onEditorDrag: function(editor, coords, e){
            var offset = this.lastX - e.offsetX,
                oldPxMulti = editor.pxMultiplier;

            this.draggyOffset += Math.abs(offset);
            
            // if the user's mouse has moved more than 20px,
            // then consider this a draggy zoom
            if(this.draggyOffset > DRAG_DEADZONE){
                editor.incZoom(-offset * 0.2);
                
                // translate grid by the difference of the
                // new zoom value
                editor.updateTranslationOffset([
                    -(oldPxMulti - editor.pxMultiplier) * this.lastCoords[0],
                    -(oldPxMulti - editor.pxMultiplier) * this.lastCoords[1]
                ]);
            }

            this.lastX = e.offsetX;
		},

        onEditorMouseUp: function(editor, coords, e){
            var oldPxMulti = editor.pxMultiplier;

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

                // translate grid by the difference of the
                // new zoom value
                editor.updateTranslationOffset([
                    -(oldPxMulti - editor.pxMultiplier) * coords[0],
                    -(oldPxMulti - editor.pxMultiplier) * coords[1]
                ]);
            }

            this.draggyOffset = 0;
            this.lastX = null;
            this.lastCoords = null;
        }
	};

	window.ZoomTool = ZoomTool;
	
})();
