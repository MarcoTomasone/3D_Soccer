export class CameraAndLights {

	constructor(canvas) {
		this.target = {x: 0, y: 0, z: 0};
		this.position ={x: 0, y: 0, z: 0}; // This will be overwritten by moveCamera() after a drag movement, to set start position use angle xy and xz
		this.up = {x: 0, y: 0, z: 1}; // Z axis will be up
		this.fovRad = 70;
		this.near = 1;
		this.far = 2000;
		this.radius = 50;
		this.aspect = canvas.clientWidth / canvas.clientHeight;
		//Booleans to keep track the camera type
		this.cameraOnBall = false;
		this.rearCamera = false;
		this.upCamera = false;
		//Default angle for the camera
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

		this.lightPosition = {x: 0, y: 100, z: 350};
		this.lightTarget = {x: 0, y: 0, z: 0};
		
		//Set the listeners for the camera
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

		//Set listeners for the light
		document.getElementById("xLight").addEventListener("input", function (event) {
			this.setLight("x",event.target.value);
			//this.setLight(0,event.target.value);
		}.bind(this));
		document.getElementById("yLight").addEventListener("input", function (event) {
			this.setLight("y", event.target.value);
			//this.setLight(1,event.target.value);
		}.bind(this));
		document.getElementById("zLight").addEventListener("input", function (event) {
			this.setLight("z", event.target.value);
			//this.setLight(2,event.target.value);
		}.bind(this));

		document.getElementById("defaultLightButton").onclick = function () {
			document.getElementById("xLight").value = 0;
			document.getElementById("yLight").value = 100;
			document.getElementById("zLight").value = 350;
			this.setLight("x", 0);
			this.setLight("y", 100);
			this.setLight("z", 350);
		}.bind(this);
	}

	setLight(pos, value){
		if(pos == "x")
			this.lightPosition.x = value;
		else if(pos == "y")
			this.lightPosition.y = value;
		else if(pos == "z")
			this.lightPosition.z = value;
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
		const camera = m4.lookAt(
			[this.position.x, this.position.y, this.position.z], 
			[this.target.x, this.target.y, this.target.z],
			[this.up.x, this.up.y, this.up.z]
		);

		// Make a view matrix from the camera matrix.
		const view = m4.inverse(camera);
		const projection = m4.perspective(this.fovRad, this.aspect, this.near, this.far);

		return {
			u_lightWorldPosition: [this.lightPosition.x, this.lightPosition.y, this.lightPosition.z],
			u_lightDirection: m4.normalize([-1,3,5]),
			u_view: view,
			u_projection: projection,
			u_viewWorldPosition: [this.position.x, this.position.y, this.position.z],
		}
	};

	
	//Update the camera position after a drag movement
	moveCamera() {
		if (this.movement.updateCamera) {
			this.position.x = this.radius * Math.cos(this.movement.angle.xz) * Math.cos(this.movement.angle.xy);
			this.position.y = this.radius * Math.cos(this.movement.angle.xz) * Math.sin(this.movement.angle.xy);
			this.position.z = this.radius * Math.sin(this.movement.angle.xz);
			this.movement.updateCamera = false;
		}
	}

	resetCamera() {
		this.movement.dragging = false;
		this.movement.angle.xy = this.defaultAngle.xy;
		this.movement.angle.xz = this.defaultAngle.xz;
		this.movement.updateCamera = true;
		this.setFov(4010); //Equivalent to 70 rad
		document.getElementById("zoomCamera").value = 70;
		this.setRadius(50);
		this.rearCamera = false;
		this.upCamera = false;
		this.moveCamera();
	}

	//Set Camera event listeners
	static setCameraControls(canvas, camera) {
		
		//Lock angle to be between 0 and maxRad. Zero to not going under the ground
		function lockAngle(angle, maxRad) {
			if (angle > maxRad) return maxRad;
			if (angle < 0.01) return 0.01;
			return angle;
		}
		
		if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			canvas.addEventListener("mousedown", function (event) {
				camera.movement.old = {
					x: event.pageX,
					y: event.pageY
				};
				camera.movement.dragging = true;
			});
			
			canvas.addEventListener("mouseup", function (event) {
				camera.moveCamera();
				camera.movement.dragging = false;
			});

			canvas.addEventListener("mousemove", function (event) {
				if (!camera.movement.dragging) return;

				// Compute drag delta
				let deltaY = (-(event.pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;
				let deltaX = (-(event.pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;

				// Update camera angle
				camera.movement.angle.xy = camera.movement.angle.xy + deltaX;
				camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, (Math.PI / 2)- 0.001);
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
		} else {
			
			canvas.addEventListener("touchstart", function (event) {	
				camera.movement.old = {
					x: event.touches[0].pageX,
					y: event.touches[0].pageY
				};
				camera.movement.dragging = true;
			});
		
			canvas.addEventListener("touchend", function (event) {
				camera.moveCamera();
				camera.movement.dragging = false;
			});

			canvas.addEventListener("touchmove", function (event) {
				if (!camera.movement.dragging) return;

				// Compute drag delta
				let deltaX = (-(event.touches[0].pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;
				let deltaY = (-(event.touches[0].pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;

				// Update camera angle
				camera.movement.angle.xy = camera.movement.angle.xy + deltaX;
				camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, (Math.PI / 2)-0.001);
				
				// Save current mouse position
				camera.movement.old.x = event.touches[0].pageX;			
				camera.movement.old.y = event.touches[0].pageY;
				camera.movement.updateCamera = true;
				
			});
		}
	}
}

function degToRad(d) {
	return d * Math.PI / 180;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}

