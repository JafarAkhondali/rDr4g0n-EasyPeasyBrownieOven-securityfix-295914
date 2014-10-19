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

    // resize views when window resizes
	window.onresize = function(){
        app.resizeAllViews();
	};

    // HACK - toggle workspace
    // TODO - some legit UI element for workspace selection
    var currWorkspace = "simple";
    $(".workspaceToggleIcon").addEventListener("click", function(){
        switch(currWorkspace){
            case "script":
                loadSimpleWorkspace();
                currWorkspace = "simple";
                break;
            case "simple":
                loadScriptWorkspace();
                currWorkspace = "script";
                break;
        }
    });

    // set undo/redo queue
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

    // setup new brownie, load brownie, edit brownie
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

    // if localStorage has no brownies, load up some defaults
    if(!localStorage.EasyPeasyBrownieOven){
        localStorage.EasyPeasyBrownieOven = '{"brownies":{"1411619926471":{"id":1411619926471,"name":"nasty mushroom","width":"24","height":"24","depth":"24","data":{"-1,10,0":"#00A800","0,10,0":"#00A800","1,10,0":"#00A800","-2,10,0":"#00A800","-3,10,0":"#00A800","2,10,0":"#00A800","-3,9,0":"#00A800","-4,9,0":"#00A800","-5,9,0":"#00A800","2,9,0":"#00A800","3,9,0":"#00A800","4,9,0":"#00A800","-5,8,0":"#00A800","-6,8,0":"#00A800","4,8,0":"#00A800","5,8,0":"#00A800","-6,7,0":"#00A800","-7,6,0":"#00A800","-7,5,0":"#00A800","-7,7,0":"#00A800","-8,4,0":"#00A800","-8,3,0":"#00A800","-8,2,0":"#00A800","-8,1,0":"#00A800","-8,0,0":"#00A800","-8,5,0":"#00A800","-8,-1,0":"#00A800","5,7,0":"#00A800","6,7,0":"#00A800","6,6,0":"#00A800","6,5,0":"#00A800","7,5,0":"#00A800","7,4,0":"#00A800","7,3,0":"#00A800","7,2,0":"#00A800","7,1,0":"#00A800","7,0,0":"#00A800","7,-1,0":"#00A800","-7,-1,0":"#00A800","-6,-1,0":"#00A800","-5,-1,0":"#00A800","6,-1,0":"#00A800","5,-1,0":"#00A800","4,-1,0":"#00A800","4,0,0":"#00A800","3,0,0":"#00A800","2,0,0":"#00A800","1,0,0":"#00A800","0,0,0":"#00A800","-1,0,0":"#00A800","-2,0,0":"#00A800","-3,0,0":"#00A800","-4,0,0":"#00A800","-5,0,0":"#00A800","-2,-1,0":"#00A800","-2,-2,0":"#00A800","1,-1,0":"#00B800","1,-2,0":"#00A800","-7,-2,0":"#00A800","-6,-2,0":"#00A800","-6,-3,0":"#00A800","-6,-4,0":"#00A800","5,-2,0":"#00A800","6,-2,0":"#00A800","5,-3,0":"#00A800","5,-4,0":"#00A800","-5,-4,0":"#00A800","4,-4,0":"#00A800","-5,-5,0":"#00A800","-4,-5,0":"#00A800","-3,-5,0":"#00A800","-2,-5,0":"#00A800","-1,-5,0":"#00A800","0,-5,0":"#00A800","1,-5,0":"#00A800","2,-5,0":"#00A800","3,-5,0":"#00A800","4,-5,0":"#00A800","-4,-1,0":"#FFFFFF","-3,-1,0":"#FFFFFF","-3,-2,0":"#FFFFFF","-4,-2,0":"#FFFFFF","-4,-3,0":"#FFFFFF","-5,-3,0":"#FFFFFF","-5,-2,0":"#FFFFFF","-3,-3,0":"#FFFFFF","-2,-3,0":"#FFFFFF","-1,-3,0":"#FFFFFF","0,-3,0":"#FFFFFF","1,-3,0":"#FFFFFF","2,-3,0":"#FFFFFF","3,-3,0":"#FFFFFF","4,-2,0":"#FFFFFF","4,-3,0":"#FFFFFF","3,-1,0":"#FFFFFF","2,-1,0":"#FFFFFF","2,-2,0":"#FFFFFF","3,-2,0":"#FFFFFF","-1,-1,0":"#FFFFFF","-1,-2,0":"#FFFFFF","0,-2,0":"#FFFFFF","0,-1,0":"#FFFFFF","-4,-4,0":"#FFFFFF","-3,-4,0":"#FFFFFF","-2,-4,0":"#FFFFFF","-1,-4,0":"#FFFFFF","0,-4,0":"#FFFFFF","1,-4,0":"#FFFFFF","2,-4,0":"#FFFFFF","3,-4,0":"#FFFFFF","-2,9,0":"#00A800","-2,8,0":"#00A800","-3,8,0":"#00A800","-4,8,0":"#00A800","-4,7,0":"#00A800","-3,7,0":"#00A800","1,9,0":"#00A800","1,8,0":"#00A800","2,8,0":"#00A800","3,8,0":"#00A800","2,7,0":"#00A800","3,7,0":"#00A800","-6,6,0":"#00A800","-6,5,0":"#00A800","-5,5,0":"#00A800","-5,4,0":"#00A800","-5,3,0":"#00A800","-6,2,0":"#00A800","-7,2,0":"#00A800","-7,3,0":"#00A800","-6,3,0":"#00A800","-6,4,0":"#00A800","-7,4,0":"#00A800","5,6,0":"#00A800","5,5,0":"#00A800","4,5,0":"#00A800","4,4,0":"#00A800","4,3,0":"#00A800","5,2,0":"#00A800","6,2,0":"#00A800","6,3,0":"#00A800","6,4,0":"#00A800","5,4,0":"#00A800","5,3,0":"#00A800","-2,1,0":"#00A800","-1,1,0":"#00A800","0,1,0":"#00A800","1,1,0":"#00A800","-3,2,0":"#00A800","-2,2,0":"#00A800","-1,2,0":"#00A800","0,2,0":"#00A800","1,2,0":"#00A800","2,2,0":"#00A800","-3,3,0":"#00A800","-2,3,0":"#00A800","-1,3,0":"#00A800","0,3,0":"#00A800","1,3,0":"#00A800","2,3,0":"#00A800","-3,4,0":"#00A800","-2,4,0":"#00A800","-1,4,0":"#00A800","0,4,0":"#00A800","1,4,0":"#00A800","2,4,0":"#00A800","-2,5,0":"#00A800","-1,5,0":"#00A800","0,5,0":"#00A800","1,5,0":"#00A800","-7,1,0":"#FFFFFF","-6,1,0":"#FFFFFF","-6,0,0":"#FFFFFF","-7,0,0":"#FFFFFF","-5,1,0":"#FFFFFF","-4,1,0":"#FFFFFF","-3,1,0":"#FFFFFF","-4,2,0":"#FFFFFF","-5,2,0":"#FFFFFF","-4,3,0":"#FFFFFF","-4,4,0":"#FFFFFF","-4,5,0":"#FFFFFF","-4,6,0":"#FFFFFF","-5,6,0":"#FFFFFF","-5,7,0":"#FFFFFF","-3,6,0":"#FFFFFF","-3,5,0":"#FFFFFF","-2,6,0":"#FFFFFF","-1,6,0":"#FFFFFF","0,6,0":"#FFFFFF","1,6,0":"#FFFFFF","2,6,0":"#FFFFFF","3,6,0":"#FFFFFF","4,6,0":"#FFFFFF","4,7,0":"#FFFFFF","1,7,0":"#FFFFFF","0,7,0":"#FFFFFF","-1,7,0":"#FFFFFF","-2,7,0":"#FFFFFF","-1,8,0":"#FFFFFF","-1,9,0":"#FFFFFF","0,9,0":"#FFFFFF","0,8,0":"#FFFFFF","2,5,0":"#FFFFFF","3,5,0":"#FFFFFF","3,4,0":"#FFFFFF","3,3,0":"#FFFFFF","3,2,0":"#FFFFFF","3,1,0":"#FFFFFF","2,1,0":"#FFFFFF","4,1,0":"#FFFFFF","5,1,0":"#FFFFFF","6,1,0":"#FFFFFF","6,0,0":"#FFFFFF","5,0,0":"#FFFFFF","4,2,0":"#FFFFFF","-3,9,1":"#00A800","-2,9,1":"#00A800","1,9,1":"#00A800","2,9,1":"#00A800","-2,8,1":"#00A800","-3,8,1":"#00A800","-4,8,1":"#00A800","1,8,1":"#00A800","2,8,1":"#00A800","3,8,1":"#00A800","-3,7,1":"#00A800","-4,7,1":"#00A800","2,7,1":"#00A800","3,7,1":"#00A800","-6,6,1":"#00A800","-6,5,1":"#00A800","-7,4,1":"#00A800","-6,4,1":"#00A800","-5,4,1":"#00A800","-5,5,1":"#00A800","-7,3,1":"#00A800","-6,3,1":"#00A800","-5,3,1":"#00A800","-7,2,1":"#00A800","-6,2,1":"#00A800","-5,0,1":"#00A800","-4,0,1":"#00A800","-3,0,1":"#00A800","-2,0,1":"#00A800","-1,0,1":"#00A800","0,0,1":"#00A800","1,0,1":"#00A800","2,0,1":"#00A800","3,0,1":"#00A800","4,0,1":"#00A800","5,6,1":"#00A800","5,5,1":"#00A800","4,5,1":"#00A800","4,4,1":"#00A800","4,3,1":"#00A800","5,3,1":"#00A800","5,4,1":"#00A800","5,2,1":"#00A800","-2,5,1":"#00A800","-1,5,1":"#00A800","0,5,1":"#00A800","1,5,1":"#00A800","2,4,1":"#00A800","1,4,1":"#00A800","0,4,1":"#00A800","-1,4,1":"#00A800","-2,4,1":"#00A800","-3,4,1":"#00A800","-3,3,1":"#00A800","-2,3,1":"#00A800","-1,3,1":"#00A800","0,3,1":"#00A800","1,3,1":"#00A800","2,3,1":"#00A800","2,2,1":"#00A800","1,2,1":"#00A800","0,2,1":"#00A800","-1,2,1":"#00A800","-2,2,1":"#00A800","-3,2,1":"#00A800","-2,1,1":"#00A800","-1,1,1":"#00A800","0,1,1":"#00A800","1,1,1":"#00A800","-1,9,1":"#FFFFFF","0,9,1":"#FFFFFF","0,8,1":"#FFFFFF","-1,8,1":"#FFFFFF","-1,7,1":"#FFFFFF","-2,7,1":"#FFFFFF","-2,6,1":"#FFFFFF","-3,6,1":"#FFFFFF","-4,6,1":"#FFFFFF","-5,6,1":"#FFFFFF","-5,7,1":"#FFFFFF","-3,5,1":"#FFFFFF","-4,5,1":"#FFFFFF","-4,4,1":"#FFFFFF","-4,3,1":"#FFFFFF","-4,2,1":"#FFFFFF","-4,1,1":"#FFFFFF","-3,1,1":"#FFFFFF","-5,1,1":"#FFFFFF","-6,1,1":"#FFFFFF","-7,1,1":"#FFFFFF","-7,0,1":"#FFFFFF","-6,0,1":"#FFFFFF","-5,2,1":"#FFFFFF","-1,6,1":"#FFFFFF","0,6,1":"#FFFFFF","1,6,1":"#FFFFFF","2,6,1":"#FFFFFF","3,6,1":"#FFFFFF","4,6,1":"#FFFFFF","4,7,1":"#FFFFFF","1,7,1":"#FFFFFF","0,7,1":"#FFFFFF","2,5,1":"#FFFFFF","3,5,1":"#FFFFFF","3,4,1":"#FFFFFF","3,3,1":"#FFFFFF","3,2,1":"#FFFFFF","2,1,1":"#FFFFFF","3,1,1":"#FFFFFF","4,1,1":"#FFFFFF","5,1,1":"#FFFFFF","6,1,1":"#FFFFFF","6,0,1":"#FFFFFF","5,0,1":"#FFFFFF","4,2,1":"#FFFFFF","6,4,1":"#00A800","6,3,1":"#00A800","6,2,1":"#00A800","-3,8,2":"#00A800","-2,8,2":"#00A800","1,8,2":"#00A800","2,8,2":"#00A800","-4,7,2":"#00A800","-5,5,2":"#00A800","-5,4,2":"#00A800","-5,3,2":"#00A800","-6,4,2":"#00A800","-6,3,2":"#00A800","-6,2,2":"#00A800","4,5,2":"#00A800","4,4,2":"#00A800","4,3,2":"#00A800","5,4,2":"#00A800","5,3,2":"#00A800","5,2,2":"#00A800","4,0,2":"#00A800","3,0,2":"#00A800","2,0,2":"#00A800","1,0,2":"#00A800","0,0,2":"#00A800","-1,0,2":"#00A800","-2,0,2":"#00A800","-3,0,2":"#00A800","-4,0,2":"#00A800","-5,0,2":"#00A800","-3,4,2":"#00A800","-2,4,2":"#00A800","-2,5,2":"#00A800","-1,5,2":"#00A800","0,5,2":"#00A800","1,5,2":"#00A800","1,4,2":"#00A800","2,4,2":"#00A800","0,4,2":"#00A800","-1,4,2":"#00A800","-2,3,2":"#00A800","-3,3,2":"#00A800","-1,3,2":"#00A800","0,3,2":"#00A800","1,3,2":"#00A800","2,3,2":"#00A800","2,2,2":"#00A800","1,2,2":"#00A800","0,2,2":"#00A800","-1,2,2":"#00A800","-2,2,2":"#00A800","-3,2,2":"#00A800","-2,1,2":"#00A800","-1,1,2":"#00A800","0,1,2":"#00A800","1,1,2":"#00A800","-1,8,2":"#FFFFFF","0,8,2":"#FFFFFF","-4,6,2":"#FFFFFF","-3,6,2":"#FFFFFF","-2,6,2":"#FFFFFF","-1,6,2":"#FFFFFF","0,6,2":"#FFFFFF","1,6,2":"#FFFFFF","2,6,2":"#FFFFFF","3,6,2":"#FFFFFF","-2,7,2":"#FFFFFF","-1,7,2":"#FFFFFF","0,7,2":"#FFFFFF","1,7,2":"#FFFFFF","-3,5,2":"#FFFFFF","-4,5,2":"#FFFFFF","-4,4,2":"#FFFFFF","-4,3,2":"#FFFFFF","-4,2,2":"#FFFFFF","-4,1,2":"#FFFFFF","-5,1,2":"#FFFFFF","-5,2,2":"#FFFFFF","-3,1,2":"#FFFFFF","2,5,2":"#FFFFFF","3,5,2":"#FFFFFF","3,4,2":"#FFFFFF","3,3,2":"#FFFFFF","3,2,2":"#FFFFFF","3,1,2":"#FFFFFF","2,1,2":"#FFFFFF","4,1,2":"#FFFFFF","4,2,2":"#FFFFFF","-3,7,2":"#00A800","2,7,2":"#00A800","3,7,2":"#00A800","-5,3,3":"#00A800","-2,1,3":"#00A800","-1,1,3":"#00A800","0,1,3":"#00A800","1,1,3":"#00A800","2,2,3":"#00A800","2,3,3":"#00A800","2,4,3":"#00A800","1,4,3":"#00A800","1,5,3":"#00A800","0,5,3":"#00A800","-1,5,3":"#00A800","-2,5,3":"#00A800","-2,4,3":"#00A800","-3,4,3":"#00A800","-3,3,3":"#00A800","-2,3,3":"#00A800","-2,2,3":"#00A800","-1,2,3":"#00A800","0,2,3":"#00A800","0,3,3":"#00A800","-1,3,3":"#00A800","-1,4,3":"#00A800","0,4,3":"#00A800","1,3,3":"#00A800","1,2,3":"#00A800","-3,2,3":"#00A800","4,3,3":"#00A800","-1,7,3":"#FFFFFF","0,7,3":"#FFFFFF","-3,6,3":"#FFFFFF","-2,6,3":"#FFFFFF","-1,6,3":"#FFFFFF","0,6,3":"#FFFFFF","1,6,3":"#FFFFFF","2,6,3":"#FFFFFF","2,5,3":"#FFFFFF","-3,5,3":"#FFFFFF","-3,1,3":"#FFFFFF","2,1,3":"#FFFFFF","-4,4,3":"#FFFFFF","-4,3,3":"#FFFFFF","-4,2,3":"#FFFFFF","3,4,3":"#FFFFFF","3,3,3":"#FFFFFF","3,2,3":"#FFFFFF","-1,6,4":"#FFFFFF","0,6,4":"#FFFFFF","-2,5,4":"#00A800","-1,5,4":"#00A800","0,5,4":"#00A800","1,5,4":"#00A800","-3,4,4":"#00A800","-2,4,4":"#00A800","-1,4,4":"#00A800","0,4,4":"#00A800","1,4,4":"#00A800","2,4,4":"#00A800","-3,3,4":"#00A800","-2,3,4":"#00A800","-1,3,4":"#00A800","0,3,4":"#00A800","1,3,4":"#00A800","2,3,4":"#00A800","-3,2,4":"#00A800","-2,2,4":"#00A800","-1,2,4":"#00A800","0,2,4":"#00A800","1,2,4":"#00A800","2,2,4":"#00A800","-2,1,4":"#00A800","-1,1,4":"#00A800","0,1,4":"#00A800","1,1,4":"#00A800","-5,0,3":"#00A800","-4,0,3":"#00A800","-3,0,3":"#00A800","-2,0,3":"#00A800","-1,0,3":"#00A800","0,0,3":"#00A800","1,0,3":"#00A800","2,0,3":"#00A800","3,0,3":"#00A800","4,0,3":"#00A800","-4,1,3":"#FFFFFF","3,1,3":"#FFFFFF","4,1,3":"#FFFFFF","-5,1,3":"#FFFFFF","-5,2,3":"#FFFFFF","4,2,3":"#FFFFFF","-7,1,2":"#FFFFFF","-6,1,2":"#FFFFFF","-6,0,2":"#FFFFFF","-7,0,2":"#FFFFFF","5,1,2":"#FFFFFF","6,1,2":"#FFFFFF","6,0,2":"#FFFFFF","5,0,2":"#FFFFFF","-6,1,3":"#FFFFFF","-6,0,3":"#FFFFFF","5,1,3":"#FFFFFF","5,0,3":"#FFFFFF","-5,0,4":"#00A800","-4,0,4":"#00A800","-3,0,4":"#00A800","-2,0,4":"#00A800","-1,0,4":"#00A800","0,0,4":"#00A800","1,0,4":"#00A800","2,0,4":"#00A800","3,0,4":"#00A800","4,0,4":"#00A800","-3,1,4":"#FFFFFF","-4,1,4":"#FFFFFF","-5,1,4":"#FFFFFF","2,1,4":"#FFFFFF","3,1,4":"#FFFFFF","4,1,4":"#FFFFFF","-4,2,4":"#FFFFFF","3,2,4":"#FFFFFF","-4,-1,1":"#FFFFFF","-3,-1,1":"#FFFFFF","-3,-2,1":"#FFFFFF","-4,-2,1":"#FFFFFF","-5,-2,1":"#FFFFFF","-5,-3,1":"#FFFFFF","-4,-3,1":"#FFFFFF","-3,-3,1":"#FFFFFF","-2,-3,1":"#FFFFFF","-1,-3,1":"#FFFFFF","0,-3,1":"#FFFFFF","1,-3,1":"#FFFFFF","2,-3,1":"#FFFFFF","3,-3,1":"#FFFFFF","4,-3,1":"#FFFFFF","4,-2,1":"#FFFFFF","3,-2,1":"#FFFFFF","2,-2,1":"#FFFFFF","2,-1,1":"#FFFFFF","3,-1,1":"#FFFFFF","-1,-1,1":"#FFFFFF","-1,-2,1":"#FFFFFF","0,-2,1":"#FFFFFF","0,-1,1":"#FFFFFF","-4,-4,1":"#FFFFFF","-3,-4,1":"#FFFFFF","-2,-4,1":"#FFFFFF","-1,-4,1":"#FFFFFF","0,-4,1":"#FFFFFF","1,-4,1":"#FFFFFF","2,-4,1":"#FFFFFF","3,-4,1":"#FFFFFF","-4,-1,2":"#FFFFFF","-4,-2,2":"#FFFFFF","-4,-3,2":"#FFFFFF","-3,-3,2":"#FFFFFF","-2,-3,2":"#FFFFFF","-1,-3,2":"#FFFFFF","0,-3,2":"#FFFFFF","1,-3,2":"#FFFFFF","2,-3,2":"#FFFFFF","3,-3,2":"#FFFFFF","3,-2,2":"#FFFFFF","3,-1,2":"#FFFFFF","2,-1,2":"#FFFFFF","2,-2,2":"#FFFFFF","0,-1,2":"#FFFFFF","0,-2,2":"#FFFFFF","-1,-2,2":"#FFFFFF","-1,-1,2":"#FFFFFF","-3,-1,2":"#FFFFFF","-3,-2,2":"#FFFFFF","-2,-1,1":"#00A800","-2,-2,1":"#00A800","1,-1,1":"#00A800","1,-2,1":"#00A800","-2,-1,2":"#00A800","-2,-2,2":"#00A800","1,-1,2":"#00A800","1,-2,2":"#00A800"}},"1411619111188":{"id":1411619111188,"name":"sickly mario","width":"24","height":"24","depth":"24","data":{"-4,8,0":"#F83800","-3,8,0":"#F83800","-2,8,0":"#F83800","-1,8,0":"#F83800","0,8,0":"#F83800","1,8,0":"#F83800","-5,7,0":"#F83800","-4,7,0":"#F83800","-3,7,0":"#F83800","-2,7,0":"#F83800","-1,7,0":"#F83800","0,7,0":"#F83800","1,7,0":"#F83800","2,7,0":"#F83800","3,7,0":"#F83800","-5,6,0":"#E45C10","-4,6,0":"#E45C10","-3,6,0":"#E45C10","-4,5,0":"#E45C10","-4,4,0":"#E45C10","-3,4,0":"#E45C10","-6,5,0":"#E45C10","-6,4,0":"#E45C10","-6,3,0":"#E45C10","0,6,0":"#E45C10","0,5,0":"#E45C10","0,4,0":"#B8F818","1,3,0":"#E45C10","-5,5,0":"#B8F818","-5,4,0":"#B8F818","-5,3,0":"#E45C10","-4,3,0":"#B8F818","-3,3,0":"#B8F818","-2,3,0":"#B8F818","-1,3,0":"#B8F818","0,3,0":"#E45C10","-1,6,0":"#B8F818","-2,6,0":"#B8F818","-2,5,0":"#B8F818","-3,5,0":"#B8F818","-1,5,0":"#B8F818","-1,4,0":"#B8F818","-2,4,0":"#B8F818","1,6,0":"#B8F818","1,5,0":"#B8F818","1,4,0":"#E45C10","2,5,0":"#B8F818","3,5,0":"#B8F818","4,4,0":"#B8F818","3,4,0":"#B8F818","2,4,0":"#B8F818","2,3,0":"#E45C10","3,3,0":"#E45C10","-4,2,0":"#B8F818","-3,2,0":"#B8F818","-2,2,0":"#B8F818","-1,2,0":"#B8F818","0,2,0":"#B8F818","1,2,0":"#B8F818","2,2,0":"#B8F818","-3,1,0":"#F83800","-3,0,0":"#F83800","-3,-1,0":"#F83800","-2,-1,0":"#F83800","-1,-1,0":"#F83800","0,-1,0":"#F83800","0,0,0":"#F83800","-4,-2,0":"#F83800","-3,-2,0":"#B8F818","-2,-2,0":"#F83800","-1,-2,0":"#F83800","0,-2,0":"#B8F818","1,-2,0":"#F83800","-4,-3,0":"#F83800","-3,-3,0":"#F83800","-2,-3,0":"#F83800","-1,-3,0":"#F83800","0,-3,0":"#F83800","1,-3,0":"#F83800","-5,-4,0":"#F83800","-4,-4,0":"#F83800","-3,-4,0":"#F83800","-2,-4,0":"#F83800","-1,-4,0":"#F83800","0,-4,0":"#F83800","1,-4,0":"#F83800","2,-4,0":"#F83800","-5,-5,0":"#F83800","-4,-5,0":"#F83800","-3,-5,0":"#F83800","2,-5,0":"#F83800","1,-5,0":"#F83800","0,-5,0":"#F83800","-4,1,0":"#E45C10","-5,1,0":"#E45C10","-4,0,0":"#E45C10","-5,0,0":"#E45C10","-6,0,0":"#E45C10","-4,-1,0":"#E45C10","-5,-1,0":"#E45C10","-6,-1,0":"#E45C10","-7,-1,0":"#E45C10","-5,-2,0":"#E45C10","-7,-2,0":"#B8F818","-7,-3,0":"#B8F818","-7,-4,0":"#B8F818","-6,-4,0":"#B8F818","-6,-3,0":"#B8F818","-6,-2,0":"#B8F818","-5,-3,0":"#B8F818","2,-3,0":"#B8F818","3,-4,0":"#B8F818","3,-3,0":"#B8F818","3,-2,0":"#B8F818","4,-4,0":"#B8F818","4,-3,0":"#B8F818","4,-2,0":"#B8F818","2,-2,0":"#E45C10","3,-1,0":"#E45C10","2,-1,0":"#E45C10","1,-1,0":"#E45C10","1,0,0":"#E45C10","2,0,0":"#E45C10","3,0,0":"#E45C10","-2,1,0":"#E45C10","-1,1,0":"#E45C10","0,1,0":"#E45C10","-1,0,0":"#E45C10","-2,0,0":"#E45C10","-4,-6,0":"#E45C10","-5,-6,0":"#E45C10","-6,-6,0":"#E45C10","-4,-7,0":"#E45C10","-5,-7,0":"#E45C10","-6,-7,0":"#E45C10","-7,-7,0":"#E45C10","1,-6,0":"#E45C10","2,-6,0":"#E45C10","3,-6,0":"#E45C10","1,-7,0":"#E45C10","2,-7,0":"#E45C10","3,-7,0":"#E45C10","4,-7,0":"#E45C10","-3,-2,1":"#B8F818","0,-2,1":"#B8F818","-4,-2,1":"#F83800","-3,-1,1":"#F83800","0,-1,1":"#F83800","-2,-2,1":"#F83800","-1,-2,1":"#F83800","1,-2,1":"#F83800","1,-3,1":"#F83800","0,-3,1":"#F83800","-1,-3,1":"#F83800","-2,-3,1":"#F83800","-3,-3,1":"#F83800","-4,-3,1":"#F83800","-3,-4,1":"#F83800","-2,-4,1":"#F83800","-1,-4,1":"#F83800","0,-4,1":"#F83800","3,7,1":"#F83800","2,7,1":"#F83800","1,7,1":"#F83800","0,7,1":"#F83800","-1,7,1":"#F83800","-2,7,1":"#F83800","-1,7,2":"#F83800","0,7,2":"#F83800","1,7,2":"#F83800","2,7,2":"#F83800","3,7,2":"#F83800","-4,5,1":"#E45C10","-4,4,1":"#E45C10","-3,4,1":"#E45C10","1,4,1":"#E45C10","1,3,1":"#E45C10","0,3,1":"#E45C10","2,3,1":"#E45C10","3,3,1":"#E45C10","-6,5,1":"#E45C10","-6,4,1":"#E45C10","-6,3,1":"#E45C10","-5,3,1":"#E45C10","-3,6,1":"#E45C10","-4,6,1":"#E45C10","-5,6,1":"#E45C10","-3,0,1":"#F83800","0,0,1":"#F83800","-3,-3,-1":"#F83800","-2,-3,-1":"#F83800","-1,-3,-1":"#F83800","0,-3,-1":"#F83800","-3,-4,-1":"#F83800","-2,-4,-1":"#F83800","-1,-4,-1":"#F83800","0,-4,-1":"#F83800","-3,-2,-1":"#F83800","-2,-2,-1":"#F83800","-1,-2,-1":"#F83800","0,-2,-1":"#F83800","-6,5,-1":"#E45C10","-6,4,-1":"#E45C10","-6,3,-1":"#E45C10","-5,3,-1":"#E45C10","-5,6,-1":"#E45C10","-4,6,-1":"#E45C10","-3,6,-1":"#E45C10","-4,5,-1":"#E45C10","-4,4,-1":"#E45C10","-3,4,-1":"#E45C10","1,4,-1":"#E45C10","1,3,-1":"#E45C10","0,3,-1":"#E45C10","2,3,-1":"#E45C10","3,3,-1":"#E45C10","-2,7,-1":"#F83800","-1,7,-1":"#F83800","0,7,-1":"#F83800","1,7,-1":"#F83800","2,7,-1":"#F83800","3,7,-1":"#F83800","3,7,-2":"#F83800","2,7,-2":"#F83800","1,7,-2":"#F83800","0,7,-2":"#F83800","-1,7,-2":"#F83800","-2,6,1":"#B8F818","-1,6,1":"#B8F818","-1,5,1":"#B8F818","-2,5,1":"#B8F818","-3,5,1":"#B8F818","-5,4,1":"#B8F818","-5,5,1":"#B8F818","-2,4,1":"#B8F818","-1,4,1":"#B8F818","-1,3,1":"#B8F818","-2,3,1":"#B8F818","-3,3,1":"#B8F818","-4,3,1":"#B8F818","-4,2,1":"#B8F818","-3,2,1":"#B8F818","-2,2,1":"#B8F818","-1,2,1":"#B8F818","0,4,1":"#B8F818","0,2,1":"#B8F818","-2,6,-1":"#B8F818","-1,6,-1":"#B8F818","-1,5,-1":"#B8F818","-2,5,-1":"#B8F818","-3,5,-1":"#B8F818","-5,5,-1":"#B8F818","-5,4,-1":"#B8F818","-2,4,-1":"#B8F818","-1,4,-1":"#B8F818","-1,3,-1":"#B8F818","-2,3,-1":"#B8F818","-3,3,-1":"#B8F818","-4,3,-1":"#B8F818","-4,2,-1":"#B8F818","-3,2,-1":"#B8F818","-2,2,-1":"#B8F818","-1,2,-1":"#B8F818","0,2,-1":"#B8F818","0,4,-1":"#B8F818","0,6,1":"#E45C10","0,5,1":"#E45C10","0,6,-1":"#E45C10","0,5,-1":"#E45C10","-3,-1,-1":"#F83800","-2,-1,-1":"#F83800","-1,-1,-1":"#F83800","0,-1,-1":"#F83800","-3,7,-1":"#F83800","-4,7,-1":"#F83800","-5,7,-1":"#F83800","-3,7,1":"#F83800","-4,7,1":"#F83800","-5,7,1":"#F83800"}}}}';
    }

    // load workspace
    // TODO - choose workspace from user config
    loadSimpleWorkspace();

    // open a new empty brownie
    app.loadBrownie(new BrownieModel({
        name: "NES sprite",
        height: 24,
        width: 24,
        depth: 24
    }));

    function importBrownie(data){
        var brownieData,
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

    function loadSimpleWorkspace(){
        // TODO - clean up previous workspace (listeners, empty toolbox, etc)

        // load workspace layout
        $("#workspace").innerHTML = $("#simpleLayoutTemplate").innerHTML;

        // TODO - this is ugly hax. get rid of it idiot
        $("#toolProperties").style.display = "block";
        $("#workspace").style.width = "calc(100% - 200px)";
        
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

        // add toolbox to contain tools and control views
        // NOTE: only one toolbox for now
        app.createToolBox({
            toolPropertiesEl: $("#toolProperties"),
        });

        app.toolbox.addTool("brush", new BrushTool());
        app.toolbox.addTool("eraser", new EraserTool());
        app.toolbox.addTool("pan", new PanTool());
        app.toolbox.addTool("zoom", new ZoomTool());
        app.toolbox.setCurrentTool("brush");

	    $("#toolbox").insertBefore(app.toolbox.el, $("#toolbox").firstChild);
    }

    function loadScriptWorkspace(){
        // load workspace layout
        // TODO - choose workspace from user settings
        $("#workspace").innerHTML = $("#scriptLayoutTemplate").innerHTML;

        // TODO - this is ugly hax. get rid of it idiot
        $("#toolProperties").style.display = "none";
        $("#workspace").style.width = "100%";

        // the primary 3D view of the brownie
        // NOTE: there can be only one view for now
        app.createView({
            el: $("#brownieViewer"),
            zoomFactor: 2
        });

        // TODO - keep previous script!

        var editor = ace.edit("scriptEditor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
        editor.setShowPrintMargin(false);
        // TODO - adjust theme, fill vertical height
        //    reduce width, light/dark theme

        $("#render").addEventListener("click", function(e){
            parseBrownieScript(editor.getValue());
        });
        $("#clearRender").addEventListener("click", function(e){
            parseBrownieScript(editor.getValue(), true);
        });
    }

    function parseBrownieScript(script, clear){
        
        var brownieModel;
        // if clear is set, create a new brownieModel
        
        if(clear){
            brownieModel = new BrownieModel({
                name: "procedural brownie",
                width: 50,
                height: 50,
                depth: 50
            });
        } else {
            brownieModel = app.model;
        }

        // TODO - use a worker with a well defined
        // API to make this as clean and safe as possible
        (function(){

            // takes an array of 3 0-1 values and 
            // generates a hex color for it
            var colorArrayToHex = function(arr){
                var hex = ["#"];

                arr.forEach(function(color){
                    hex.push(parseInt(color*16, 16));
                });

                return hex.join("");
            };
            var clear = function(){};
            var setCamera = function(){};
            var set = function(x, y, z, r, g, b){
                brownieModel.model[brownieModel.createKey([x, y, z])] = colorArrayToHex([r,g,b]);
            };
            var unset = function(x, y, z){
                brownieModel.model[brownieModel.createKey([x, y, z])] = null;
            };
            var get = function(x, y, z){
                return brownieModel.model[brownieModel.createKey([x, y, z])];
            };

            eval(script);
        })();

        // TODO - add to undoqueue!

        // if this is a new brownie, load it
        if(clear){
            app.loadBrownie(brownieModel);

        // otherwise, just re-render it
        } else {
            app.viewer.renderBrownie();
        }
    }

})();
