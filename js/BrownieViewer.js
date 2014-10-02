(function(){

	"use strict";

    /* Trackball controls for brownie viewer. Thanks rye! */
    function Trackball(eventElement, targetMesh) {
        this.element = eventElement;
        this.mesh = targetMesh;
        this.mouseDown = false;
        this.pos = {x:0, y:0};

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.rotate = this.rotate.bind(this);

        this.element.addEventListener('mousedown', this.onMouseDown, false);
        window.addEventListener('mouseup', this.onMouseUp, false);
        window.addEventListener('mousemove', this.onMouseMove, false);
    }

    Trackball.prototype = {
        constructor: Trackball,

        onMouseMove: function(e) {
            if (!this.mouseDown) { 
                return; 
            }
            var dx = e.clientX -this.pos.x;
            var dy = e.clientY -this.pos.y;
            this.rotate(dx*0.015, dy*0.015);
            this.pos.x = e.clientX; 
            this.pos.y = e.clientY;
        },

        rotate: function(dx, dy) {
            var tempMat = new THREE.Matrix4();
            tempMat.makeRotationAxis(new THREE.Vector3(0,1,0), dx);
            tempMat.multiply(this.mesh.matrix);
            var tempMat2 = new THREE.Matrix4();
            tempMat2.makeRotationAxis(new THREE.Vector3(1,0,0), dy);
            tempMat2.multiply(tempMat);
            this.mesh.rotation.setFromRotationMatrix(tempMat2);
        },

        onMouseDown: function(e) {
            if (e.button === 0) {
                this.mouseDown = true;
                this.pos.x = e.clientX;
                this.pos.y = e.clientY;
            }
        },

        onMouseUp: function(e) {
            if (e.button === 0) {
                this.mouseDown = false;
            }
        }
    };


	/**
	 * Creates a threejs rendering context in the provided
	 * canvas and displays a single brownie voxel thingy
	 */
	function BrownieViewer(config){
		config = config || {};

		this.initModel(config.model);

		// TODO - ensure el exists
		this.el = config.el;

        this.zoomFactor = config.zoomFactor || 1;
		this.canvas = document.createElement("canvas");
		
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		this.resizeCanvas();
		this.el.appendChild(this.canvas);

        this.brownieMaterial = config.brownieMaterial || "brownieFlat";

        this.controlsVM = new ViewModel({
            template: document.getElementById("brownieViewerControlsTemplate").innerHTML,
            model: this,
            eventMap: {
                "click .showSlice": function(e){
                    if(e.target.checked){
                        // TODO - this is terrible and dumb and smells like a butt
                        this.model.shouldShowSliceBool = true;
                        this.model.showSlice(this.model.model.getSlice(app.editors[0].getSlice()));
                    } else {
                        this.model.shouldShowSliceBool = false;
                        this.model.unshowSlice();
                    }
                },
                "click .rotateX": function(e){
                    if(e.target.checked){
                        this.model.shouldRotateXBool = true;
                    } else {
                        this.model.shouldRotateXBool= false;
                    }
                },
                "click .rotateY": function(e){
                    if(e.target.checked){
                        this.model.shouldRotateYBool = true;
                    } else {
                        this.model.shouldRotateYBool= false;
                    }
                },
                "click .rotateZ": function(e){
                    if(e.target.checked){
                        this.model.shouldRotateZBool = true;
                    } else {
                        this.model.shouldRotateZBool= false;
                    }
                },
                "click .resetRotation": function(){
                    this.model.meshes["brownie"].rotation.set(0,0,0);
                },
                "change .materialSelect": function(e){
                    this.model.brownieMaterial = e.target.value;
                    this.model.updateBrownieMaterial();
                }
            },
            init: function(){
            },
            shouldShowSlice: function(){
                return this.model.shouldShowSliceBool ? "checked" : "";
            },
            shouldRotateX: function(){
                return this.model.shouldRotateXBool ? "checked" : "";
            },
            shouldRotateY: function(){
                return this.model.shouldRotateYBool ? "checked" : "";
            },
            shouldRotateZ: function(){
                return this.model.shouldRotateZBool ? "checked" : "";
            },
            generateMaterialOptions: function(){
                var optsMap = {
                    "browniePhong": "phong",
                    "brownieFlat": "flat"
                };
                var opts = [];

                for(var i in optsMap){
                    opts.push("<option value='"+ i +"' "+ (this.model.brownieMaterial === i ? "selected" : "") +">"+ optsMap[i] +"</option>");
                }

                return opts.join("");
            }
        });
        // default to showing current slice
        this.shouldShowSliceBool = true;

        this.el.appendChild(this.controlsVM.el);

		this.camera = new THREE.PerspectiveCamera(65, this.canvas.width / this.canvas.height, 1, 1000);
		this.camera.position.set(0, -this.model.height, this.model.depth * this.zoomFactor);

		this.light = new THREE.PointLight(0xFFFFFF);
		this.light.position = this.camera.position.clone();

		this.scene = new THREE.Scene();
		this.scene.add(this.light);

		this.brownies = {};
		this.meshes = {};
		this.materials = {
			browniePhong: new THREE.MeshPhongMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors,
				specular: 0,
                map: ambientOcclusionTexture
			}),
			brownieFlat: new THREE.MeshBasicMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors,
				specular: 0,
				shading: THREE.FlatShading,
                map: ambientOcclusionTexture
			}),
			cursor: new THREE.MeshBasicMaterial({
				wireframe: true,
				wireframeLinewidth: 3,
				color: "#4CE806"
			}),
			brownieTransparent: new THREE.MeshPhongMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors,
				specular: 0,
				transparent: true,
				opacity: 0.35
			})
		};

		// cursor hint voxel
		this.meshes["cursor"] = new THREE.Mesh(
			new THREE.CubeGeometry(1, 1, 1),
			this.materials["cursor"]
		);

		// base brownie
		this.newBrownie();

		// auto-rotate meshes
		//this.autoRotateMesh = this.autoRotateMesh.bind(this);
		//this.autoRotateMesh();
        this.updateMesh = this.updateMesh.bind(this);
        this.updateMesh();
	}

	BrownieViewer.prototype = {
		constructor: BrownieViewer,

		newBrownie: function(){
			this.brownies["brownie"] = new Brownie(this.renderer);
			var geo = this.brownies["brownie"].getGeometry();
			
			// remove previous brownie mesh before updating
			this.scene.remove(this.meshes["brownie"]);

			this.meshes["brownie"] = new THREE.Mesh(geo, this.materials[this.brownieMaterial]);

			// add cursor hint
			this.meshes["brownie"].add(this.meshes["cursor"]);

            // trackball controls
            // TODO - clear previous trackball object/events
            new Trackball(this.canvas, this.meshes["brownie"]);

			this.scene.add(this.meshes["brownie"]);
			this.renderScene();
		},

		updateBrownie: function(brownieData){
			// if a slice brownie is available,
			// update it as well
			var slice = this.brownies["slice"];

			brownieData.forEach(function(val){

				// if index 3, 4, and 5 are null, this is a delete
				if(val[3] === null){
					if(slice) slice.unset.apply(null, val);
					this.brownies["brownie"].unset.apply(null, val);

				// otherwise this is an add
				} else {
					if(slice) slice.set.apply(null, val);
					this.brownies["brownie"].set.apply(null, val);
				}

			}.bind(this));
			this.renderBrownie();
		},

		// make brownie translucent and show the
		// current slice
		showSlice: function(sliceData){
            // TODO - probably shouldn't do this shouldShowSlice
            // check here
            if(!this.shouldShowSliceBool) return;

			var sliceBrownie = this.brownies["slice"] = new Brownie(this.renderer);

			this.meshes["brownie"].material = this.materials["brownieTransparent"];

			// remove previous slice
			this.meshes["brownie"].remove(this.meshes["slice"]);

			this.meshes["slice"] = new THREE.Mesh(
				sliceBrownie.getGeometry(),
				this.materials[this.brownieMaterial]
			);

			// add new slice mesh
			this.meshes["brownie"].add(this.meshes["slice"]);

			// update slice mesh
			sliceData.forEach(function(val){
				sliceBrownie.set.apply(null, val);
			});
			sliceBrownie.rebuild();

			this.renderScene();

			// to determine if this thing is
			// sliced or not
			this.sliced = true;
		},

		// restore brownie to original material
		// and remove slice
		unshowSlice: function(){
			this.meshes["brownie"].material = this.materials[this.brownieMaterial];
			// remove previous slice
			this.meshes["brownie"].remove(this.meshes["slice"]);
			// remove slice brownie
			delete this.brownies["slice"];

			// to determine if this thing is
			// sliced or not
			this.sliced = false;
		},

		renderBrownie: function(){
			for(var i in this.brownies){
				this.brownies[i].rebuild();
			}
			this.renderScene();
		},

		// TODO - debounce?
		renderScene: function(){
			this.renderer.render(this.scene, this.camera);
		},

		updateMesh: function(){
            // TODO - clean these rotation things up
            if(this.shouldRotateYBool) {
                this.meshes["brownie"].rotation.y += 0.01; 
            }
            if(this.shouldRotateXBool) {
                this.meshes["brownie"].rotation.x += 0.01; 
            }
            if(this.shouldRotateZBool) {
                this.meshes["brownie"].rotation.z += 0.01; 
            }
			this.renderScene();
			requestAnimationFrame(this.updateMesh);
		},

		updateCursorPosition: function(coords){
			// hide cursor
			if(!coords){
				this.meshes["brownie"].remove(this.meshes["cursor"]);

			// move cursor
			} else {
				this.meshes["brownie"].add(this.meshes["cursor"]);
				this.meshes["cursor"].position.set(coords[0] + 0.5, coords[1] + 0.5, coords[2] + 0.5);
			}
		},

        updateBrownieMaterial: function(){
           this.meshes["brownie"].material = this.materials[this.brownieMaterial]; 
        },

		resizeCanvas: function(){
			this.canvas.width = Math.min(this.el.clientHeight, this.el.clientWidth);
			this.canvas.height = Math.min(this.el.clientHeight, this.el.clientWidth);
			this.renderer.setSize(Math.min(this.el.clientHeight, this.el.clientWidth), Math.min(this.el.clientHeight, this.el.clientWidth));
		},

		// sets model and makes any model related configs
		initModel: function(model){
			this.model = model;
			this.model.on("changeset", this.updateBrownie, this);
		},

		// cleans up old state and loads a new brownie
		loadBrownie: function(model){
			var brownieData = [],
				currCoords,
				currColor;

			this.initModel(model);
			this.newBrownie();

			// if the model has any data, format it for brownie
			if(Object.keys(model.model).length){
				for(var i in model.model){
					currCoords = model.parseKey(i);
					currColor = model.hexColorToBrownieColor(model.model[i]);

					brownieData.push({
						x: currCoords[0],
						y: currCoords[1],
						z: currCoords[2],
						r: currColor[0],
						g: currColor[1],
						b: currColor[2]
					});
				}
			}

			// batch update brownie with the brownieData
			this.brownies["brownie"].fromJSON(brownieData);

			// update camera position with new height/depth
			this.camera.position.set(0, 0, this.model.depth * this.zoomFactor);

			this.renderBrownie();
			this.renderScene();
		}
	};

	window.BrownieViewer = BrownieViewer;

})();
