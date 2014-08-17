(function(){

	"use strict";

	// jquery-esque selectors
	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	// our main model dude guy
	var brownieModel = new BrownieModel(24, 24, 24);

	// 3D view of our model
	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer"),
		model: brownieModel
	});

	// editor for the mdoel
	var sliceEditor = new SliceEditor({
		canvas: $("#sliceEditor"),
		model: brownieModel
	});

	// slice selector
	// TODO - bind to model or something...
	$("#sliceSelector").addEventListener("change", function(e){
		sliceEditor.setSlice(e.target.value);
	});


	// hacky color palette stuff
	var colorPaletteHTML = [],
		colorPaletteEl = $("#colorPalette"),
		NESPalette = ["#7C7C7C","#0000FC","#0000BC","#4428BC","#940084","#A80020","#A81000","#881400","#503000","#007800","#006800","#005800","#004058","#000000","#000000","#000000","#BCBCBC","#0078F8","#0058F8","#6844FC","#D800CC","#E40058","#F83800","#E45C10","#AC7C00","#00B800","#00A800","#00A844","#008888","#000000","#000000","#000000","#F8F8F8","#3CBCFC","#6888FC","#9878F8","#F878F8","#F85898","#F87858","#FCA044","#F8B800","#B8F818","#58D854","#58F898","#00E8D8","#787878","#000000","#000000","#FCFCFC","#A4E4FC","#B8B8F8","#D8B8F8","#F8B8F8","#F8A4C0","#F0D0B0","#FCE0A8","#F8D878","#D8F878","#B8F8B8","#B8F8D8","#00FCFC","#F8D8F8","#000000","#000000"],
		SimplifiedNESPalette = ["#FFFFFF","#BCBCBC","#0078F8","#0058F8","#6844FC","#D800CC","#E40058","#F83800","#E45C10","#B8F818","#00B800","#00A800","#00A844","#008888"];
	
	// generate color palette
	SimplifiedNESPalette.forEach(function(color){
		colorPaletteHTML.push('<div class="color" style="background-color: '+ color +';" data-color="'+ color +'"></div>');
	});
	colorPaletteEl.innerHTML = colorPaletteHTML.join("");

	// listen for color palette clicks
	colorPaletteEl.addEventListener("click", function(e){
		sliceEditor.setColor(e.target.dataset.color);
	});

})();
