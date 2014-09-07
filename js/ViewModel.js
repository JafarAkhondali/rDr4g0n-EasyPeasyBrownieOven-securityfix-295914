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

		// default model object
		this.model = this.model || {};

		// watch model for changes
		// TODO - use smart data-binding instead
		// of string interpolation for view updates
		Object.observe(this.model, function(){
			this.render();
		}.bind(this));

		// TODO - configurable tag
		this.el = document.createElement("div");

		// TODO - iterate el's children and look
		// for data-bind-* properties and bind
		// listeners to them, and interpolate model
		// values instead of string interpolation
		this.template = compile(this.template, this);

		// TODO - should this happen before or after
		// render and bindEvents?
		if(this.init) this.init.call(this);

		this.render();
		this.bindEvents();
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
				func = this[eventMap[i]] || eventMap[i];

				if (typeof func === "function") {
					bindEvent(this.el, eventAction, selector, func, this);
				}
			}
		},

		render: function(){
			this.el.innerHTML = this.template(this);	
		},

		setModel: function(model){
			this.model = model;
		}
	}

	function bindEvent(el, eventAction, selector, func, context){
		// TODO - event handlers that can be removed
		el.addEventListener(eventAction, function(e){
			// TODO - cross browser `matches` method
			if(e.target.webkitMatchesSelector(selector)){
				func.call(context, e);
			}
		});
	}

	// template interpolator taggy tags
	var OPEN_TAG = /{{/,
		CLOSE_TAG = /}}/,
		TAGS_LENGTH = 2;

	// identifies interpolation points and returns
	// a function that quickly inserts values into
	// those points		
	function compile(template, context){
		var modifiedTemplate = template,
			currOpen, currClose,
			points = [];

		while((currOpen = modifiedTemplate.search(OPEN_TAG)) !== -1){

			// oh hey we found an open tag. let's find close
			if((currClose = modifiedTemplate.search(CLOSE_TAG)) !== -1){

				// store the interpolation point
				points.push({
					index: currOpen,
					val: modifiedTemplate.slice(currOpen + TAGS_LENGTH, currClose)
				});

				// slice out the interpolation point
				modifiedTemplate = modifiedTemplate.substr(0, currOpen) + modifiedTemplate.substr(currClose + TAGS_LENGTH, modifiedTemplate.length);

			// uhh... there's open but no close tag. what
			// the heck brah.
			} else {
				// TODO - more details about error
				throw new Error("Invalid template, idiot.");
			}	

			currOpen = -1;
			currClose = -1;

		}

		// reverse points array so that insertion
		// happens in reverse order. this prevents the
		// modifications to the string from offsetting
		// the point values
		points = points.reverse();

		return function(model){
			var interpolatedTemplate = modifiedTemplate;
			points.forEach(function(point){
				interpolatedTemplate = interpolatedTemplate.substr(0, point.index) +
					getValue(model, point.val, context) +
					interpolatedTemplate.substr(point.index, interpolatedTemplate.length);
			});
			return interpolatedTemplate;
		};

	}

	// gets `val` from `obj`. can traverse object with `.`
	// TODO - handle []?
	// TODO - handle filters?
	function getValue(obj, val, context){
		var valArr = val.split("."),
			currVal = obj;

		valArr.forEach(function(v){
			try {
				currVal = currVal[v];
			} catch(e){
				throw new Error("Value '"+ v +"' don't exist, brah!");
			}
		});

		// if the value is a function, return the
		// result of calling the function
		// TODO - bind function context? pass args? etc
		if(typeof currVal === "function"){
			return currVal.call(context);

		// otherwise, return the value
		} else {
			return currVal;
		}
	}

	window.ViewModel = ViewModel;
})();