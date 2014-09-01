(function(){
	"use strict";

	/**
	 * Glues html to a model
	 */
	function ViewModel(config){
		// extend all config properties
		// onto this
		// TODO - default properties as well
		for(var prop in config){
			this[prop] = config[prop];
		}

		// TODO - configurable tag
		this.el = document.createElement("div");

		// TODO - iterate el's children and look
		// for data-bind-* properties and bind
		// listeners to them, and interpolate model
		// values instead of string interpolation
		this.template = Handlebars.compile(this.template);

		this.el.innerHTML = this.template(this);
		
		this.bindEvents();

		if(this.init) this.init.call(this);
	}

	ViewModel.prototype = {
		constructor: ViewModel,

		bindEvents: function(){
			var func, selector, eventAction,
				eventMap = this.eventMap || {};

			for(var i in eventMap){
				selector = i.split(" ");
				eventAction = selector.shift();
				selector = selector.join(" ");
				func = this[eventMap[i]].bind(this);

				if (typeof func === "function") {
					bindEvent(this.el, eventAction, selector, func);
				}
			}
		},

		setModel: function(model){
			this.model = model;
		}
	}

	function bindEvent(el, eventAction, selector, func){
		// TODO - event handlers that can be removed
		el.addEventListener(eventAction, function(e){
			// TODO - cross browser `matches` method
			if(e.target.webkitMatchesSelector(selector)){
				func(e);
			}
		});
	}

	window.ViewModel = ViewModel;
})();