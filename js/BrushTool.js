(function(){
	"use strict";

	/**
	 * Toolbox tool for painting on SliceEditor.js
	 */
	function BrushTool(config){
		this.icon = "flaticon-pencil5";

		// TODO - expose various config options in UI
		this.size = 1;
		this.shape = "square";
		this.currColor = "#FFFFFF";
		this.palette = "NES Basic";

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
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
		},

		onEditorDrag: function(editor, coords){
			editor.modelSet([coords[0]-1, coords[1]-1, editor.getSlice()], this.currColor);
		},

		onEditorMouseUp: function(editor, coords){
		}
	}

	window.BrushTool = BrushTool;
	
})();