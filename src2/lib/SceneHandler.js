
import { Ball } from "./Ball.js";
import { Camera } from "./CameraAndLights.js";
import { Refree } from "./Refree.js";
export class SceneHandler {
	
	constructor(canvasName, objPositionList) {
		//Get canvas from canvas name 
		const canvas = document.querySelector(canvasName);
		if (!canvas) {
			console.error("Can't find canvas " + canvasName);
			return;
		}
		//Create a WebGL2RenderingContext
		this.gl = canvas.getContext("webgl2");
		if (!this.gl) {
			console.error("Can't initialize WebGL2 on canvas " + canvasName);
			return;
		}
		//Create a 2d context for the upper canvas and setting the menu for it
		this.ctx = document.getElementById("upperCanvas").getContext("2d");
		this.set2DMenu(0);
		
		//Compiles and links the shaders, looks up attribute and uniform locations
		this.programInfo = webglUtils.createProgramInfo(this.gl, [vs, fs]);
		//Set up the position of all objects in the scene
		this.objList = [];
		this.objPositionList = objPositionList;
		//Set up the camera and the ball 
		this.camera = new Camera(this.gl.canvas);
		this.ball = new Ball(this.gl.canvas, this.objPositionList, this.removeObject.bind(this));
		this.refree = null;
		this.timerStarted = false;
		this.startTime = null;

		//Setting up controls for the camera and the ball
		Camera.setCameraControls(this.gl.canvas, this.camera);
		Ball.setBallControls(this.gl.canvas, this.ball)
		
		//Camera radio buttons event listeners
		document.getElementById("cameraOnBall").addEventListener("click", function(){
			this.cameraOnBall = true;
		}.bind(this));
		
		document.getElementById("fixedCamera").addEventListener("click", function(){
			this.cameraOnBall = false;		
			this.camera.resetCamera();
		}.bind(this));	
		
	}

	//Add an object to the environment after loading its mesh
	async addObject(obj) {
		this.objList.push(obj)
		await obj.loadMesh(this.gl);
	};

	removeObject(objName) {
		this.objList = this.objList.filter(obj => obj.name != objName);
	}
	/*
	async reloadMeshes() {
		for (let obj of this.objList) {
			await obj.loadMesh(this.gl);
		}
	}*/

	async set2DMenu(numCardsGathered) {
		this.ctx.canvas.width = this.gl.canvas.width * 20 / 100;
		this.ctx.canvas.height = this.gl.canvas.height /2;
		this.ctx.font = "30px Arial";
		this.ctx.fontFamily = "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif";
		this.ctx.fillStyle = 'black';
		this.ctx.fillText("Instructions", 50,50);
		this.ctx.font = "20px Arial";
		//If on mobile 
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			wrapText(this.ctx, "Use joystick to move the ball", 5, 100, this.ctx.canvas.width, 20);
			wrapText(this.ctx, "Use touch to move the camera", 5, 150, this.ctx.canvas.width, 20);
			wrapText(this.ctx, "Collect all the yellow cards while avoiding the cones and don't get caught by the referee!", 5, 290, this.ctx.canvas.width, 20);
		} else {
			wrapText(this.ctx, "Use WASD to move the ball", 5, 70, this.ctx.canvas.width, 20);
			const wasd = new Image();
			wasd.src = "./resources/wasd.png";
			await wasd.decode();
			this.ctx.drawImage(wasd, 13, 100, this.ctx.canvas.clientWidth-25, 100); 
			wrapText(this.ctx, "Use mouse to move the camera", 5, 230, this.ctx.canvas.width, 20);
			wrapText(this.ctx, "Collect all the yellow cards while avoiding the cones and don't get caught by the referee!", 5, 290, this.ctx.canvas.width, 20);
			//this.ctx.fillText("Use mouse to move the camera", 10,250);
		}
	}

	async setEndGame2DMenu(time) {
		this.ctx.canvas.width = this.gl.canvas.width * 20 / 100;
		this.ctx.canvas.height = this.gl.canvas.height /2;
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.font = "30px Arial";
		this.ctx.fontFamily = "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif";
		wrapText(this.ctx, "RUN AWAY FROM THE REFREE!", 20, 70, this.ctx.canvas.width, 30);
		if(this.timerStarted){
			var timeElapsed = new Date().getTime() - this.startTime;
			var seconds = 60 - Math.floor(timeElapsed / 1000);
			if(seconds > 0){
				this.ctx.font = "60px Arial";
				this.ctx.fillText( seconds, 100, 200);
			}
			else {
				toStop = true;
				this.ctx.canvas.width = this.gl.canvas.width;
				this.ctx.canvas.height = this.gl.canvas.height;
				this.ctx.canvas.style.margin = 0 + "px";
				this.ctx.canvas.style.borderRadius = 0 + "px";
				const winning = new Image();
				winning.src = "./resources/winning.jpg";
				await winning.decode();
				this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
				this.ctx.drawImage(winning, 0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);     
				this.ctx.font = '60pt VT323, sans-serif';
				this.ctx.fillStyle = 'white';
				this.ctx.fillText("YOU ARE A CHAMPION!", this.ctx.canvas.width/2 - 50 ,this.ctx.canvas.height - 100);
				this.ctx.font = '40pt VT323, sans-serif';
				this.ctx.fillText("Click to play again", this.ctx.canvas.width/2 - 50,this.ctx.canvas.height - 50);
				upperCanvas.addEventListener('click', function() {
					location.reload();
				});	
			}

		} else{
			this.startTime = new Date().getTime();
			this.timerStarted = true;
			 }
				
	
	}


	checkAllCardsGathered() {
		var allCardsGathered = true;
		var count = 0;
		this.objList.forEach( obj => {
			if(obj.name.startsWith("yellowCard")){
				count ++; 
				allCardsGathered = false;
			}
		});
		document.getElementById("cardNumParagraph").innerText = "Yellow cards gathered: " + (3-count) + "/3";
		return allCardsGathered;
	}

	render(time) {
		webglUtils.resizeCanvasToDisplaySize(this.gl.canvas);
		//Set the viewport to the canvas size
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.enable(this.gl.DEPTH_TEST);
		if(!document.querySelector("#transparencyCheckbox").checked)
				this.gl.disable(this.gl.BLEND);
		else
			this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		

		this.camera.moveCamera();
		
		this.objList.forEach( obj => {
			if(obj.name == "ball"){
				this.ball.moveBall();
				obj.position.x = this.ball.getXPosition();
				obj.position.y = this.ball.getYPosition();
				obj.rotation.x = this.ball.getXRotation();
				obj.rotation.y = this.ball.getYRotation();
				//obj.rotation.z = this.ball.getZRotation();
				
				
				if(this.cameraOnBall){
					this.camera.setCameraTarget(obj.position);
					document.getElementById("rearCamera").disabled = false;
					document.getElementById("upCamera").disabled = false;
				}
				else {
					this.camera.setCameraTarget({x:0, y:0, z:0});
					document.getElementById("rearCamera").disabled = true;
					document.getElementById("upCamera").disabled = true;
				}
				if(this.camera.getisUpCamera())
					this.camera.setCameraPosition({x: obj.position.x - 1, y: obj.position.y, z: obj.position.z + 20});
				
				if(this.camera.getisRearCamera())
					this.camera.setCameraPosition({x: obj.position.x - 2, y: obj.position.y, z:obj.position.z + 1});
			}
			
			if(obj.name.startsWith("yellowCard"))
				obj.rotation.z += 0.1;
			
			if(this.checkAllCardsGathered()){
				if(obj.name == "markerCone"){
					obj.visibility = true;
				}
				if(obj.name == "refree"){
					obj.visibility = true;
					if(this.refree == null)
						this.refree = new Refree(this.ball.getXPosition(), this.ball.getYPosition());
					else {
						obj.rotation.z += 0.01;
						this.refree.moveRefree(this.ball.getXPosition(), this.ball.getYPosition(), obj.visibility);
						obj.position.x = this.refree.getXPosition();
						obj.position.y = this.refree.getYPosition();
						this.setEndGame2DMenu(time);
					}
				}	
			}			
		});
		

		this.objList.forEach(obj => { 
			obj.render(this.gl, this.programInfo, time, this.camera.getSharedUniforms()) });
	}
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';
	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
		context.fillText(line, x, y);
		line = words[n] + ' ';
		y += lineHeight;
	  }
	  else {
		line = testLine;
	  }
	}
	context.fillText(line, x, y);
  }