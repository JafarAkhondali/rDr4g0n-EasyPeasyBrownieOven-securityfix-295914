(function(){

	"use strict";

	/**
	 * Creates a threejs rendering context in the provided
	 * canvas and displays a single brownie voxel thingy
	 */
	function BrownieViewer(config){
		config = config || {};

		this.model = config.model;
		this.model.on("changeset", this.updateBrownie, this);

		// TODO - ensure canvas exists
		this.canvas = config.canvas;

		// TODO - probably a better way to set width/height
		this.canvas.width = +this.canvas.dataset["width"];
		this.canvas.height = +this.canvas.dataset["height"];
		
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		// TODO - use model dimensions to position camera better
		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, .1, 100);
		this.camera.position.set(0, -this.model.height, this.model.depth);

		this.light = new THREE.PointLight(0xFFFFFF);
		this.light.position = this.camera.position.clone();

		this.scene = new THREE.Scene();
		this.scene.add(this.light);

		// cursor hint voxel
		this.cursorMesh = new THREE.Mesh(
			new THREE.CubeGeometry(1, 1, 1),
			new THREE.MeshBasicMaterial({
				wireframe: true,
				wireframeLinewidth: 3,
				color: "#4CE806"
			})
		);

		// the material won't change each render,
		// so keep a single material to reuse
		this.material = new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			vertexColors: THREE.VertexColors,
			specular: 0
		});

		this.newBrownie();

		// auto-rotate meshes
		this.autoRotateMesh = this.autoRotateMesh.bind(this);
		this.autoRotateMesh();
	}

	BrownieViewer.prototype = {
		constructor: BrownieViewer,

		newBrownie: function(brownie){
			this.brownie = new Brownie(this.renderer);
			var geo = this.brownie.getGeometry();
			
			// TODO - remove previous brownie's mesh from scene
			this.mesh = new THREE.Mesh(geo, this.material);

			// add cursor hint
			this.mesh.add(this.cursorMesh);

			this.scene.add(this.mesh);
			this.renderScene();
		},

		updateBrownie: function(brownieData){
			brownieData.forEach(function(val){

				// if index 3, 4, and 5 are null, this is a delete
				if(val[3] === null){
					this.brownie.unset.apply(null, val);

				// otherwise this is an add
				} else {
					this.brownie.set.apply(null, val);
				}

			}.bind(this));
			this.renderBrownie();
		},

		renderBrownie: function(){
			this.brownie.rebuild();
			this.renderScene();
		},

		// TODO - debounce?
		renderScene: function(){
			this.renderer.render(this.scene, this.camera);
		},

		autoRotateMesh: function(){
			this.mesh.rotation.y += 0.01;
			this.renderScene();
			requestAnimationFrame(this.autoRotateMesh);
		},

		updateCursorPosition: function(coords){
			this.cursorMesh.position.set(coords[0] + 0.5, coords[1] + 0.5, coords[2] + 0.5);
		}
	}

	window.BrownieViewer = BrownieViewer;

})();