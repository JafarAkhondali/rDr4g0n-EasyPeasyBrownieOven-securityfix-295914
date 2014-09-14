(function(){
	"use strict";

	/**
	 * Toolbox tool for erasing on SliceEditor.js
	 */
	function EraserTool(config){
		// BrushTool.call(this, config);

		this.icon = "flaticon-eraser8";

		// TODO - expose various config options in UI
		this.size = 1;
		this.shape = "square";

        // batch up paint actions for easy
        // undo/redo
        this.actionBuffer = [];

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorMouseUp = this.onEditorMouseUp.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);
	}

	EraserTool.prototype = Object.create(BrushTool.prototype);
	EraserTool.prototype.constructor = EraserTool;

	EraserTool.prototype.render = function(){
		// TODO - use a template
		this.el.innerHTML = "e";
	};

	EraserTool.prototype.onEditorMouseDown = function(editor, coords){
        var currCoords = [coords[0]-1, coords[1]-1, editor.getSlice()]; 
        this.actionBuffer.push({
            // if currCoords is undefined, store null, which
            // is treated as deleting a pixel
            oldVal: [currCoords, editor.modelGet(currCoords) || null],
            newVal: [currCoords, null]
        });
        editor.modelSet(currCoords, null);
	};

	EraserTool.prototype.onEditorDrag = function(editor, coords){
        var currCoords = [coords[0]-1, coords[1]-1, editor.getSlice()]; 
        
        // only set if the oldVal differs from the newVal
        if(editor.modelGet(currCoords)){
            this.actionBuffer.push({
                // if currCoords is undefined, store null, which
                // is treated as deleting a pixel
                oldVal: [currCoords, editor.modelGet(currCoords) || null],
                newVal: [currCoords, null]
            });
            editor.modelSet(currCoords, null);
        }
	};

	EraserTool.prototype.onEditorMouseUp = function(editor, coords){
        // clone actionBuffer array for undo/redo
        // access via closure
        var actionBuffer = this.actionBuffer.slice();

        // painting is complete, so create an
        // undo action and clear actionBuffer
        app.undoQueue.push({
            label: "Erase",
            undo: function(){
                actionBuffer.forEach(function(vals){
                    editor.modelSet(vals.oldVal[0], vals.oldVal[1]);
                });
            },
            redo: function(){
                actionBuffer.forEach(function(vals){
                    editor.modelSet(vals.newVal[0], null);
                });
            }
        });
        this.actionBuffer = [];
	};

	window.EraserTool = EraserTool;
})();
