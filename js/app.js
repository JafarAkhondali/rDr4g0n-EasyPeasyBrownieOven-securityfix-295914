(function(){

	"use strict";

	// jquery-esque selectors
	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

    // expose a global like this?
    window.app = new BrownieOven();

    // this is the model that all views will
    // share for the app
    app.createModel({
		name: "NES sprite",
		height: 24,
		width: 24,
		depth: 24
	});

    // the primary 3D view of the brownie
    // NOTE: there can be only one view for now
    app.createView({
		el: $("#brownieViewer"),
        zoomFactor: 2
	});

    // add a slice editor to the app
    // NOTE: there can be many slice editors
    app.createEditor({
		el: $("#sliceEditor"),
		showGrid: true
	});

    // add toolbox to contain tools and control
    // views
    // NOTE: only one toolbox for now
    app.createToolBox({
		toolPropertiesEl: $("#toolProperties"),
	});

    app.toolbox.addTool("brush", new BrushTool());
    app.toolbox.addTool("eraser", new EraserTool());
    app.toolbox.setCurrentTool("brush");

    // dont even remember what this does...
	$("#toolbox").insertBefore(app.toolbox.el, $("#toolbox").firstChild);
    
    // resize views when window resizes
	window.onresize = function(){
        app.resizeAllViews();
	};
	
    function importBrownie(data){
        var	brownieData,
            brownieDataStr = data,
            brownieModel;

        // TODO - try/catch json parse and fromJSON
        if(typeof brownieDataStr === "string"){
            brownieData = JSON.parse(brownieDataStr);

        // an already parsed brownie was passed in
        } else if(typeof brownieDataStr === "object"){
            brownieData = brownieDataStr;
        }
        
        // TODO - ensure all fields are present/valid
        brownieModel = new BrownieModel({
            id: brownieData.id,
            name: brownieData.name,
            width: brownieData.width,
            height: brownieData.height,
            depth: brownieData.depth
        });

        brownieModel.import(brownieData.data);

        app.loadBrownie(brownieModel);
    }

    $(".undoIcon").addEventListener("click", function(){
        if(app.undoQueue.undoQueue.length){
            app.undoQueue.undo();
        }
    });
    $(".redoIcon").addEventListener("click", function(){
        if(app.undoQueue.redoQueue.length){
            app.undoQueue.redo();
        }
    });
    // watch undoQueue and enable/disable und/redo icons
    app.undoQueue.on("update", function(){
        if(app.undoQueue.undoQueue.length){
            $(".undoIcon").classList.remove("disabled");
        } else {
            $(".undoIcon").classList.add("disabled"); 
        }
        if(app.undoQueue.redoQueue.length){
            $(".redoIcon").classList.remove("disabled");
        } else {
            $(".redoIcon").classList.add("disabled"); 
        }
    });
	
    $(".newBrownieIcon").addEventListener("click", function(){
        new Modal({
            title: "Bake Up a New Brownie!",
            content: $("#newBrownieTemplate").innerHTML,
            actions: [
                { label: "Nevermind", class: "passive close" },
                { label: "Create", class: "primary create" }
            ],
            eventMap: {
                "click .close": "close",
                "change .size": function(e){
                    // keep all sizes even
                    var size = e.target.value;
                    this.modal.querySelector(".width").value = size;
                    this.modal.querySelector(".height").value = size;
                    this.modal.querySelector(".depth").value = size;
                },
                "click .create": function(e){
                    // TODO - validate!
                    var name = this.modal.querySelector(".name").value,
                        width = this.modal.querySelector(".width").value,
                        height = this.modal.querySelector(".height").value,
                        depth = this.modal.querySelector(".depth").value;

                    app.loadBrownie(new BrownieModel({
                        name: name,
                        width: width,
                        height: height,
                        depth: depth
                    }));

                    this.close();
                }
            }
        }).open();
    });

    $(".openBrownieIcon").addEventListener("click", function() {
        new Modal({
            title: "Load Up an Existing Brownie!",
            content: $("#loadBrownieTemplate").innerHTML,
            actions: [
                { label: "Nevermind", class: "passive close" },
                { label: "Load 'er Up", class: "primary load" }
            ],
            eventMap: {
                "click .close": "close",
                "click .load": "load",
                "click .brownieList li": function(e){
                    var currSelected = this.modal.querySelector(".brownieList li.selected");
                    if(currSelected) currSelected.classList.remove("selected");

                    e.target.classList.add("selected");

                    this.load();
                }
            },
            load: function(){
                // TODO - validate!					
                var importData = this.modal.querySelector(".import").value,
                    selectedBrownie = this.modal.querySelector(".brownieList li.selected"),
                    brownieData;

                // if import has data, then try to parse that guy
                if(importData){
                    brownieData = importData;

                // load the selected one from LS
                } else if(selectedBrownie){
                    brownieData = this.getLocalBrownie(selectedBrownie.getAttribute("data-id"));
                }

                if(brownieData) importBrownie(brownieData);

                this.close();
            },
            // gets local brownies and returns em in li's
            getLocalBrownies: function(){
                var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
                    brownies = localStore.brownies || {},
                    brownieElements = [],
                    brownie;

                for(var i in brownies){
                    brownie = brownies[i];
                    brownieElements.push("<li data-id='"+ brownie.id +"'>"+ brownie.name +"</li>");
                }

                return brownieElements.join(" ");
            },
            // gets a specific local brownie by id
            getLocalBrownie: function(id){
                var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
                    brownies = localStore.brownies || {};

                return brownies[id];
            }
        }).open();
    });

    $(".configureBrownieIcon").addEventListener("click", function() {
        new Modal({
            title: "Look all up in ur Brownie",
            content: $("#configureBrownieTemplate").innerHTML,
            actions: [
                { label: "Nevermind", class: "passive close" },
                { label: "Delete this Guy", class: "danger delete" },
                { label: "Save Them Changes", class: "primary save" }
            ],
            eventMap: {
                "click .close": "close",
                "click .save": function(e){
                    // TODO - validate!
                    var name = this.modal.querySelector(".name").value;

                    app.model.name = name;
                    app.saveToLS();

                    this.close();
                },
                "click .delete": function(){
                    if(confirm("You sure, idiot?")){
                        // TODO - better confirmation!
                        app.deleteFromLS();

                        // load up a new brownie
                        app.loadBrownie(new BrownieModel({
                            name: "NES Sprite",
                            width: 24,
                            height: 24,
                            depth: 24
                        }));

                        this.close();
                    }
                }
            },
            // gets a specific local brownie by id
            getLocalBrownie: function(id){
                var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}"),
                    brownies = localStore.brownies || {};

                return brownies[id];
            },
            getBrownieName: function(){
                return app.model.name;
            },
            getBrownieData: function(){
                return JSON.stringify(this.getLocalBrownie(app.model.id)) || "";
            }
        }).open();
    });

})();
