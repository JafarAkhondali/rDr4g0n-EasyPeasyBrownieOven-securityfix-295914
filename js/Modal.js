(function(){
	"use strict";

	var MODAL_TEMPLATE = '\
		<div class="modal">\
			<header>{{modalConfig.title}}</header>\
			<div class="content">{{{modalConfig.content}}}</div>';
		// 	<ul class="actions hbox">\
		// 		<li><button class="btn passive">No, you listen. Idiot</button></li>\
		// 		<li><button class="btn primary">Okay.</button></li>\
		// 	</ul>\
		// </div>';

	/**
	 * VM that provides an easy interface for modal dialog window
	 */
	function Modal(config){

		// put modal configuration options in a place
		// that the modal template knows to look
		this.modalConfig = {
			title: config.title,
			content: Handlebars.compile(config.content || "")(config.model || {})
		}
		// these shouldnt be extended on the object
		// when super is called, so remove them
		delete config.title;
		delete config.content;

		// use the modal template
		config.template = MODAL_TEMPLATE;

		// if actions were provded, add action
		// bar to end of modal
		// TODO - better wiring of action to handler
		// TODO - auto-wire close action buttons
		if(config.actions){
			var actionsString = ['<ul class="actions hbox">'];
			config.actions.forEach(function(action){
				actionsString.push('<li><button class="btn '+ action.class +'">'+ action.label +'</button></li>');
			});
			actionsString.push("</ul>");

			config.template += actionsString.join("\n");
		}

		// this is hack, but gotta close out the template
		config.template += '</div>';

		// call super
		ViewModel.call(this, config);

		// do a bit more processing on the el
		// that VM created
		this.el.classList.add("modalWrap");
		this.el.addEventListener("click", function(e){
			if(e.target.webkitMatchesSelector(".modalWrap")){
				this.close();
			}
		}.bind(this));
		this.modal = this.el.querySelector(".modal");
	}

	Modal.prototype = Object.create(ViewModel.prototype);
	Modal.prototype.constructor = Modal;

	Modal.prototype.open = function(){
		// TODO - animate in
		document.body.appendChild(this.el);
	}

	Modal.prototype.close = function(e){
		// TODO - animate out
		document.body.removeChild(this.el);
		// TODO - clean up event listeners
		this.el = this.modal = this.model = null;
	}

	window.Modal = Modal;
})();
	