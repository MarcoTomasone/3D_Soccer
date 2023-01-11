export class Camera {

	constructor(canvas) {
		this.target = [0, 0, 0];
		this.position = [0, 0, 0]; // This will be overwritten by moveCamera() after a drag movement, to set start position use angle xy and xz
		this.up = [0, 0, 1]; // Z axis will be up
		this.fovRad = 70;
		this.near = 1;
		this.far = 2000;
		this.radius = 50;
		this.aspect = canvas.clientWidth / canvas.clientHeight;
		this.cameraOnBall = false;
		this.rearCamera = false;
		this.upCamera = false;
		this.lightDirection = [-1, 3, 5];
		this.defaultAngle = {
			xy: degToRad(190),
			xz: degToRad(30)
		},
		this.movement = {
			delta: {
				x: 0,
				y: 0
			},
			angle: {
				xy: this.defaultAngle.xy,
				xz: this.defaultAngle.xz
			},
			dragging: false,
			updateCamera: true
		};

		document.getElementById("zoomCamera").addEventListener("input", function (event) {
			this.setFov(event.target.value);
		}.bind(this));

		document.getElementById("defaultFovButton").onclick = function () {
			document.getElementById("zoomCamera").value = 70;
			this.setFov(4010); //Equivalent to 70 rad
		}.bind(this);
		
		document.getElementById("defaultAngleButton").onclick = function () {
			this.setDefaultAngle();
		}.bind(this);

		document.getElementById("upCamera").onclick = function () {
			this.rearCamera = false;
			this.upCamera = true;
			this.setUpCamera();
		}.bind(this);

		document.getElementById("rearCamera").onclick = function () {
			this.upCamera = false;
			this.rearCamera = true;
			this.setRearCamera();
		}.bind(this);

		document.getElementById("xLight").addEventListener("input", function (event) {
			this.setLight(0, event.target.value);
		}.bind(this));
		document.getElementById("yLight").addEventListener("input", function (event) {
			this.setLight(1, event.target.value);
		}.bind(this));
		document.getElementById("zLight").addEventListener("input", function (event) {
			this.setLight(2, event.target.value);
		}.bind(this));

		document.getElementById("defaultLightButton").onclick = function () {
			document.getElementById("xLight").value = 0;
			document.getElementById("yLight").value = 3;
			document.getElementById("zLight").value = 5;
			this.lightDirection = [-1, 3, 5]; 
		}.bind(this);
	}

	setLight(pos, value){
		this.lightDirection[pos] = value;
	}

	getisUpCamera() {
		return this.upCamera;
	}

	getisRearCamera() {
		return this.rearCamera;
	}

	setAspect(canvas) {
		this.aspect = canvas.clientWidth / canvas.clientHeight;
	}

	setFov(fovDeg) {
		this.fovRad = degToRad(fovDeg);
	}
	
	getFov() {
		return radToDeg(this.fovRad);
	}
	
	setCameraTarget(target) {
		this.target = target;
	}

	setCameraPosition(position) {
		this.position = position;
	}

	setDefaultAngle() {
		this.movement = {
			delta: {
				x: 0,
				y: 0
			},
			angle: {
				xy: this.defaultAngle.xy,
				xz: this.defaultAngle.xz
			},
			dragging: false,
			updateCamera: true
		};
	}

	setUpCamera() {	
		console.log("Ciao" + this.movement) 
		this.setCameraPosition([0, 0, 0]);
		this.setRadius(30);
		this.movement = {
			delta: {
				x: 0,
				y: 0
			},
			angle: {
				xy: -Math.PI,
				xz: 1.5
			},
			dragging: false,
			updateCamera: true
		};
	}

	setRearCamera() {
		console.log(this.movement)
		this.setRadius(10);
		this.movement = {
			delta: {
				x: 0,
				y: 0
			},
			angle: {
				xy: -Math.PI,
				xz: 0.1
			},
			dragging: false,
			updateCamera: true
		};
	}

	setRadius(radius) {
		this.radius = radius;
	}

	getSharedUniforms = () => {

		// Compute the camera's matrix using look at.
		const camera = m4.lookAt(this.position, this.target, this.up);
		// Make a view matrix from the camera matrix.
		const view = m4.inverse(camera);
		const projection = m4.perspective(this.fovRad, this.aspect, this.near, this.far);

		return {
			u_lightDirection: m4.normalize([this.lightDirection[0], this.lightDirection[1],this.lightDirection[2]]),
			u_view: view,
			u_projection: projection,
			u_viewWorldPosition: this.position,
		}
	};


	/**
	 * Update the camera position after a drag movement
	 */
	moveCamera() {
		if (this.movement.updateCamera) {
			this.position[0] = this.radius * Math.cos(this.movement.angle.xz) * Math.cos(this.movement.angle.xy);
			this.position[1] = this.radius * Math.cos(this.movement.angle.xz) * Math.sin(this.movement.angle.xy);
			this.position[2] = this.radius * Math.sin(this.movement.angle.xz);
			this.movement.updateCamera = false;
		}
	}

	resetCamera() {
		if (debug == true) console.log("Reset camera");
		this.movement.dragging = false;
		this.movement.angle.xy = this.defaultAngle.xy;
		this.movement.angle.xz = this.defaultAngle.xz;
		this.movement.updateCamera = true;
		this.setFov(4010); //Equivalent to 70 rad
		this.setRadius(50);
		this.rearCamera = false;
		this.moveCamera();
	}

	/**
	 * Set camera drag movement event listeners
	 * @param {*} canvas 
	 * @param {*} camera 
	 */
	static setCameraControls(canvas, camera) {
		
		/**
		 * On mouse down, set dragging to true and save starting position
		 */
		canvas.addEventListener("mousedown", function (event) {
			if (debug == true) console.log("mousedown");
			camera.movement.old = {
				x: event.pageX,
				y: event.pageY
			};
			camera.movement.dragging = true;
		});

		/**
		 * On mouse up, set dragging to false and update camera position
		 */
		canvas.addEventListener("mouseup", function (event) {
			if (debug == true) console.log("mouseup");
			camera.moveCamera();
			camera.movement.dragging = false;
		});

		/**
		 * On mouse move, update camera position angle if dragging
		 */
		canvas.addEventListener("mousemove", function (event) {
			if (!camera.movement.dragging) return;

			/**
			 * Make sure that the angle is between -PI and PI. If outside map it to the equivalent angle inside the range.
			 * @param {*} angle 
			 * @returns 
			 */
			function minimizeAngle(angle) {
				if (angle > Math.PI) return (angle % Math.PI) - Math.PI;
				if (angle < -Math.PI) return (angle % Math.PI) + Math.PI;
				return angle;
			}

			/**
			 * Force an angle to be in an interval between -maxRad and maxRad
			 * @param {*} angle 
			 * @param {*} maxRad
			 * @returns 
			 */
			function lockAngle(angle, maxRad) {
				if (angle > maxRad) return maxRad;
				if (angle < 0) return 0;
				return angle;
			}

			if (debug == true) console.log("mousemove", camera.movement);

			// Compute drag delta
			let deltaY = (-(event.pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;
			let deltaX = (-(event.pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;

			// Update camera angle
			camera.movement.angle.xy = minimizeAngle(camera.movement.angle.xy + deltaX);
			camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, (Math.PI / 2)-0.001);

			// Save current mouse position
			camera.movement.old.x = event.pageX;
			camera.movement.old.y = event.pageY;

			camera.movement.updateCamera = true;
		});

		canvas.addEventListener("keydown", function (event) {
			switch (event.key) {
				case "r":
					camera.resetCamera();
					break;
			}
		});
		
		
	}
}

function degToRad(d) {
	return d * Math.PI / 180;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}