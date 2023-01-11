
import { Ball } from "../Ball.js";
import { Camera } from "./Camera.js";
import { Refree } from "../Refree.js";
export class Environment {
	
	static vs = `
	attribute vec4 a_position;
	attribute vec3 a_normal;
	attribute vec3 a_tangent;
	attribute vec2 a_texcoord;
	attribute vec4 a_color;
  
	uniform mat4 u_projection;
	uniform mat4 u_view;
	uniform mat4 u_world;
	uniform vec3 u_viewWorldPosition;
  
	varying vec3 v_normal;
	varying vec3 v_tangent;
	varying vec3 v_surfaceToView;
	varying vec2 v_texcoord;
	varying vec4 v_color;
  
	void main() {
	  vec4 worldPosition = u_world * a_position;
	  gl_Position = u_projection * u_view * worldPosition;
	  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
	  mat3 normalMat = mat3(u_world);
	  v_normal = normalize(normalMat * a_normal);
	  v_tangent = normalize(normalMat * a_tangent);
  
	  v_texcoord = a_texcoord;
	  v_color = a_color;
	}
	`;

	static fs = `
	precision highp float;
  
	varying vec3 v_normal;
	varying vec3 v_tangent;
	varying vec3 v_surfaceToView;
	varying vec2 v_texcoord;
	varying vec4 v_color;
  
	uniform vec3 diffuse;
	uniform sampler2D diffuseMap;
	uniform vec3 ambient;
	uniform vec3 emissive;
	uniform vec3 specular;
	uniform sampler2D specularMap;
	uniform float shininess;
	uniform sampler2D normalMap;
	uniform float opacity;
	uniform vec3 u_lightDirection;
	uniform vec3 u_ambientLight;
  
	void main () {
	  vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
	  vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
	  vec3 bitangent = normalize(cross(normal, tangent));
  
	  mat3 tbn = mat3(tangent, bitangent, normal);
	  normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
	  normal = normalize(tbn * normal);
  
	  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
	  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);
  
	  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
	  float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
	  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
	  vec3 effectiveSpecular = specular * specularMapColor.rgb;
  
	  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
	  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
	  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;
  
	  gl_FragColor = vec4(
		  emissive +
		  ambient * u_ambientLight +
		  effectiveDiffuse * fakeLight +
		  effectiveSpecular * pow(specularLight, shininess),
		  effectiveOpacity);
	}
	`;

	constructor(canvasName, objPositionList) {

		//Get canvas from canvas name 
		const canvas = document.querySelector(canvasName);
		if (!canvas) {
			console.error("Unable to find canvas " + canvasName);
			return;
		}

		//Create a WebGL2RenderingContext
		this.gl = canvas.getContext("webgl2");
		if (!this.gl) {
			console.error("Unable to initialize WebGL2 on canvas " + canvasName);
			return;
		}

		//Compiles and links the shaders, looks up attribute and uniform locations
		this.programInfo = webglUtils.createProgramInfo(this.gl, [Environment.vs, Environment.fs]);
		this.objPositionList = objPositionList;
		
		this.objList = [];
		this.camera = new Camera(this.gl.canvas);
		this.ball = new Ball(this.gl.canvas, this.objPositionList, this.removeObject.bind(this));
		this.refree = null;
		const upperCanvas = document.getElementById("upperCanvas");
		Camera.setCameraControls(upperCanvas, this.camera);
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

	

	async reloadMeshes() {
		for (let obj of this.objList) {
			await obj.loadMesh(this.gl);
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
					this.camera.setCameraTarget([obj.position.x, obj.position.y, obj.position.z])
					document.getElementById("rearCamera").disabled = false;
					document.getElementById("upCamera").disabled = false;
				}
				else {
					this.camera.setCameraTarget([0,0,0]);
					document.getElementById("rearCamera").disabled = true;
					document.getElementById("upCamera").disabled = true;
				}
				
				if(this.camera.getisRearCamera())
					this.camera.setCameraPosition([obj.position.x - 2, obj.position.y, obj.position.z + 1]);
			}
			
			if(obj.name.startsWith("yellowCard") || obj.name == "redCard")
				obj.rotation.z += 0.1;

			if(obj.name == "refree")
				obj.rotation.z += 0.01;
				
			if(this.checkAllCardsGathered()){
				if(obj.name == "markerCone"){
					obj.visibility = true;
				}
				if(obj.name == "refree"){
					obj.visibility = true;
					if(this.refree == null)
						this.refree = new Refree(this.ball.getXPosition(), this.ball.getYPosition());
					else {
						this.refree.moveRefree(this.ball.getXPosition(), this.ball.getYPosition());
						obj.position.x = this.refree.getXPosition();
						obj.position.y = this.refree.getYPosition();
					}
				}	
			}			
		});
		

		this.objList.forEach(obj => { 
			obj.render(this.gl, this.programInfo, time, this.camera.getSharedUniforms()) });
	}

	
}