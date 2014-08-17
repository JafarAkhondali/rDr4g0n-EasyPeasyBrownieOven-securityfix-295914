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

		// intialize empty model
		for(var x = 0; x < width; x++){
			for(var y = 0; y < height; y++){
				for(var z = 0; z < height; z++){
					this.model[x +","+ y +","+ z] = null;
				}
			}
		}

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
				// TODO - if !object[name] send unset command
				// TODO - get colors from change
				brownieChangeset.push(this.parseKey(change.name));
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

	window.BrownieModel = BrownieModel;
	
})();