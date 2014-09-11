(function(){

    /* BrownieOven.js
     * Creates the BrownieOven app and
     * stores its state
     */
    function BrownieOven(){
        this.editors = [];       
    }

    BrownieOven.prototype = {
        constructor: BrownieOven,

        createEditor: function(config){
            // TODO - dont directly edit user's config?
            config.model = this.model;
            
            this.editors.push(new SliceEditor(config));                
        },

        createModel: function(config){
            // TODO - destroy existing model
            this.model = new BrownieModel(config);
        },

        createView: function(config){
            // TODO - dont directly edit user's config?
            config.model = this.model;
           
            this.viewer = new BrownieViewer(config); 

            // toggle individual slice vs entire brownie view
            // TODO - unregister this event when viewer is removed
            this.viewer.canvas.addEventListener("click", function(e){
                if(this.viewer.sliced){
                    this.viewer.unshowSlice();
                } else {
                    // TODO - editors[0] is not necessarily the
                    // right slice
                    this.viewer.showSlice(this.model.getSlice(this.editors[0].getSlice()));
                }
            }.bind(this));


        },

        createToolBox: function(config){
            config.editors = this.editors;
            config.brownieViewer = this.viewer;

            // TODO - destroy existing toolbox
            this.toolbox = new Toolbox(config);
        },

        resizeAllViews: function(){
            this.editors.forEach(function(sliceEditor){
                sliceEditor.resizeCanvas();
            });
            this.viewer.resizeCanvas();
        },

        loadBrownie: function(brownieModel){
            // TODO - properly destroy this.model
            this.model = brownieModel;
            this.editors.forEach(function(sliceEditor){
                sliceEditor.loadBrownie(brownieModel);
            });
            this.viewer.loadBrownie(brownieModel);
        }
    };

    window.BrownieOven = BrownieOven;

})();
