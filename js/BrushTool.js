(function(){
	"use strict";

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function BrushTool(config){
		this.icon = "flaticon-gross";

		// TODO - expose various config options in UI
		this.size = 1;
		this.shape = "square";
		this.currColor = "#FFFFFF";
		this.palette = "NES Basic";

        // batch up paint actions for easy
        // undo/redo
        this.actionBuffer = [];

		// bind context for editor event handlers
		this.onEditorMouseDown = this.onEditorMouseDown.bind(this);
		this.onEditorMouseUp = this.onEditorMouseUp.bind(this);
		this.onEditorDrag = this.onEditorDrag.bind(this);

		this.propertyVM = new ViewModel({
			template: document.getElementById("brushToolTemplate").innerHTML,
			model: this,
			eventMap: {
				"click .color": "setColor"
			},
			setColor: function(e){
				this.model.currColor = e.target.dataset.color;
			},
			init: function(){
				// hacky color palette stuff
				var colorPaletteHTML = [],
					NESPalette = ["#7C7C7C","#0000FC","#0000BC","#4428BC","#940084","#A80020","#A81000","#881400","#503000","#007800","#006800","#005800","#004058","#000000","#000000","#000000","#BCBCBC","#0078F8","#0058F8","#6844FC","#D800CC","#E40058","#F83800","#E45C10","#AC7C00","#00B800","#00A800","#00A844","#008888","#000000","#000000","#000000","#F8F8F8","#3CBCFC","#6888FC","#9878F8","#F878F8","#F85898","#F87858","#FCA044","#F8B800","#B8F818","#58D854","#58F898","#00E8D8","#787878","#000000","#000000","#FCFCFC","#A4E4FC","#B8B8F8","#D8B8F8","#F8B8F8","#F8A4C0","#F0D0B0","#FCE0A8","#F8D878","#D8F878","#B8F8B8","#B8F8D8","#00FCFC","#F8D8F8","#000000","#000000"],
					SimplifiedNESPalette = ["#FFFFFF","#BCBCBC","#0078F8","#0058F8","#6844FC","#D800CC","#E40058","#F83800","#E45C10","#B8F818","#00B800","#00A800","#00A844","#008888"];
				
				// generate color palette
				SimplifiedNESPalette.forEach(function(color){
					colorPaletteHTML.push('<div class="color" style="background-color: '+ color +';" data-color="'+ color +'"></div>');
				});
				this.model.colorPaletteHTML = colorPaletteHTML.join("");
			}
		});
	}

	BrushTool.prototype = {
		constructor: BrushTool,

		onEditorMouseDown: function(editor, coords){
            var currCoords = [coords[0]-1, coords[1]-1, editor.getSlice()]; 
            this.actionBuffer.push({
                // if currCoords is undefined, store null, which
                // is treated as deleting a pixel
                oldVal: [currCoords, editor.modelGet(currCoords) || null],
                newVal: [currCoords, this.currColor]
            });
			editor.modelSet(currCoords, this.currColor);
		},

		onEditorDrag: function(editor, coords){
            var currCoords = [coords[0]-1, coords[1]-1, editor.getSlice()]; 

            // only set if the oldVal differs from the newVal
            if(editor.modelGet(currCoords) !== this.currColor){
                this.actionBuffer.push({
                    // if currCoords is undefined, store null, which
                    // is treated as deleting a pixel
                    oldVal: [currCoords, editor.modelGet(currCoords) || null],
                    newVal: [currCoords, this.currColor]
                });
                editor.modelSet(currCoords, this.currColor);
            }
		},

		onEditorMouseUp: function(editor, coords){
            // clone actionBuffer array for undo/redo
            // access via closure
            var actionBuffer = this.actionBuffer.slice();

            // painting is complete, so create an
            // undo action and clear actionBuffer
            app.undoQueue.push({
                label: "Brush",
                undo: function(){
                    actionBuffer.forEach(function(vals){
                        editor.modelSet(vals.oldVal[0], vals.oldVal[1]);
                    });
                },
                redo: function(){
                    actionBuffer.forEach(function(vals){
                        editor.modelSet(vals.newVal[0], vals.newVal[1]);
                    });
                }
            });
            this.actionBuffer = [];
		}
	};

	window.BrushTool = BrushTool;
	
})();
