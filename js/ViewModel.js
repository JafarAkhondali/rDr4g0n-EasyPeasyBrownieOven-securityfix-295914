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

		this.el.innerHTML = this.template || "";

		// TODO - iterate el's children and look
		// for data-bind-* properties and bind
		// listeners to them, and interpolate model
		// values
		// 
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
					// TODO - event handlers that can be removed
					this.el.addEventListener(eventAction, function(e){
						// TODO - cross browser `matches` method
						if(e.target.webkitMatchesSelector(selector)){
							func(e);
						}
					});
				}
			}
		},

		teardown: function(){
			this.el = this.model = this.init = null;
			// TODO - unbind event listeners
		},

		setModel: function(model){
			this.model = model;
		}
	}

	window.ViewModel = ViewModel;
})();