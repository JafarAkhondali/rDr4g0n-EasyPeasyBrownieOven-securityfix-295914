(function(){

	"use strict";

	/**
	 * Creates a threejs rendering context in the provided
	 * canvas and displays a single brownie voxel thingy
	 */
	function BrownieViewer(config){
		config = config || {};

		// TODO - ensure canvas exists
		this.canvas = config.canvas;

		// TODO - probably a better way to set width/height
		this.canvas.width = +this.canvas.dataset["width"];
		this.canvas.height = +this.canvas.dataset["height"];
		
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, .1, 100);
		this.camera.position.set(10, 10, 10);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		this.light = new THREE.PointLight(0xFFFFFF);
		this.light.position = this.camera.position.clone();

		this.scene = new THREE.Scene();
		this.scene.add(this.light);

		// the material won't change each render,
		// so keep a single material to reuse
		this.material = new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			vertexColors: THREE.VertexColors,
			specular: 0
		});
		this.meshes = [];

		this.newBrownie();

		// auto-rotate meshes
		this.autoRotateMesh = this.autoRotateMesh.bind(this);
		this.autoRotateMesh();
	}

	BrownieViewer.prototype = {
		constructor: BrownieViewer,

		newBrownie: function(brownie){
			this.brownie = new Brownie(this.renderer);
		},

		updateBrownie: function(brownieData){
			brownieData.forEach(function(position){
				this.brownie.set.apply(null, position.concat([1,1,1]));
			}.bind(this));
			this.renderBrownie();
		},

		renderBrownie: function(){
			// rebuild brownie geometry
			this.brownie.rebuild();			
			var geo = this.brownie.getGeometry();

			// remove any existing meshes from the scene
			this.meshes.forEach(function(mesh){
				this.scene.remove(mesh);
			});
			this.meshes = [];

			// keep a reference to mesh for removal before
			// updating scene
			var mesh = new THREE.Mesh(geo, this.material)
			this.meshes.push(mesh);

			this.scene.add(mesh);

			this.renderScene();
		},

		// TODO - debounce?
		renderScene: function(){
			this.renderer.render(this.scene, this.camera);
		},

		autoRotateMesh: function(){
			this.meshes.forEach(function(mesh){
				mesh.rotation.y += 0.01;
			});
			this.renderScene();
			requestAnimationFrame(this.autoRotateMesh);
		}
	}

	window.BrownieViewer = BrownieViewer;

})();