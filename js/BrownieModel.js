(function(){
	"use strict";

	/**
	 * A model that emits events when it changes, allowing
	 * many different objects to observe it
	 */
	function BrownieModel(width, height, depth){

		// mixin event emitting superpowers
		eventEmitter.call(this);

		// TODO - this.model.model is kinda icky to type
		this.model = {};
		
		// currently these values are modely just hints
		this.width = width;
		this.height = height;
		this.depth = depth;

		// begin observing the model for changes
		Object.observe(this.model, this.onChange.bind(this));
	}

	BrownieModel.prototype = {
		constuctor: BrownieModel,

		onChange: function(changes){
			// general change event with no details
			this.emit("change");

			var brownieChangeset = [];

			// find out waht the changes were and tell
			// the brownie viewer to set/unset those vox
			changes.forEach(function(change){
				// TODO - unset pixel
				if(!change.object[change.name]){

				// otherwise, set pixel with color
				} else {
					brownieChangeset.push(this.parseKey(change.name).concat(hexColorToBrownieColor(change.object[change.name])));
				}
			}.bind(this));

			// changeset event with a set of changes made
			this.emit("changeset", brownieChangeset);
		},

		// returns [x,y,z] from a model key
		parseKey: function(key){
			return key.split(",").map(function(key){ return +key; });
		},
		// creates model key from [x,y,z] coords
		createKey: function(coords){
			return coords.join(",");
		}
	};

	// takes hex color like "#FF0000" and normalizes to
	// 3 zero to one values. eg FF0000 becomes 1, 0, 0
	function hexColorToBrownieColor(hex){
		var normalized = [];

		hex = hex.replace("#", "");
		for(var i = 0; i < 6; i+=2){
			normalized.push(parseInt(hex.substr(i, 2), 16) / 255);
		}

		return normalized;
	}

	window.BrownieModel = BrownieModel;
	
})();