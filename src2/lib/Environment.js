
import { Ball } from "../Ball.js";
import { Camera } from "./CameraAndLights.js";
import { Refree } from "../Refree.js";
export class Environment {
	
	static vs = `
	attribute vec4 a_position;
	attribute vec2 a_texcoord;
	attribute vec3 a_normal;
	attribute vec3 a_tangent;
	attribute vec4 a_color;
  
	uniform mat4 u_projection;
	uniform mat4 u_view;
	uniform mat4 u_world;
	uniform mat4 u_textureMatrix;
	uniform vec3 u_lightPosition;
	uniform vec3 u_viewWorldPosition;
	uniform vec3 u_lightWorldPosition;
  
	varying vec2 v_texcoord;
	varying vec4 v_projectedTexcoord;
	varying vec3 v_normal;
	varying vec3 v_tangent;
	varying vec3 v_surfaceToView;
	varying vec3 v_surfaceToLight;
	varying vec4 v_color;
  
	void main() {

	  vec4 worldPosition = u_world * a_position;
	  gl_Position = u_projection * u_view * worldPosition;
	  v_texcoord = a_texcoord;
	  v_projectedTexcoord = u_textureMatrix * worldPosition;
	  v_normal = mat3(u_world) * a_normal;
	  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
	  // compute the world position of the surface
	  vec3 surfaceWorldPosition = (u_world * a_position).xyz;
	  v_surfaceToLight = u_lightPosition - surfaceWorldPosition;
	  mat3 normalMat = mat3(u_world);
	  v_tangent = normalize(normalMat * a_tangent);
	  v_color = a_color;
	}
	`;

	static fs = `
	precision highp float;

	varying vec2 v_texcoord;
	varying vec3 v_normal;
	varying vec3 v_tangent;
	varying vec3 v_surfaceToView;
	varying vec4 v_color;
	varying vec3 v_surfaceToLight;
	varying vec4 v_projectedTexcoord;
	
	uniform vec3 diffuse;
	uniform vec3 ambient;
	uniform vec3 emissive;
	uniform vec3 specular;
	uniform vec3 u_lightDirection;
	uniform vec3 u_ambientLight;
	uniform vec3 u_reverseLightDirection;
	uniform vec4 u_colorMult;

	uniform sampler2D u_texture;
	uniform sampler2D u_projectedTexture;
	uniform sampler2D diffuseMap;
	uniform sampler2D specularMap;
	uniform sampler2D normalMap;

	uniform float opacity;
	uniform float shininess;
	uniform float u_bias;
	uniform float u_lightIntensity;
	uniform float u_shadowIntensity;
  
	void main () {
	  vec3 normal = normalize(v_normal);
	  vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
	  vec3 bitangent = normalize(cross(normal, tangent));
  
	  mat3 tbn = mat3(tangent, bitangent, normal);
	  normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
	  normal = normalize(tbn * normal);
  
	  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
	  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
	  float light = dot(v_normal, u_reverseLightDirection);
	  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
	  float currentDepth = projectedTexcoord.z + u_bias;
	  //float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
	  float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
	  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
	  vec3 effectiveSpecular = specular * specularMapColor.rgb;
  
	  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
	  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
	  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;
      bool inRange =
			  projectedTexcoord.x >= 0.0 &&
			  projectedTexcoord.x <= 1.0 &&
			  projectedTexcoord.y >= 0.0 &&
			  projectedTexcoord.y <= 1.0;

	  float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
	  float shadowLight = (inRange && projectedDepth <= currentDepth) ? u_shadowIntensity : u_lightIntensity; //2.5;
	  vec4 texColor = texture2D(u_texture, v_texcoord) * u_colorMult;
	  //gl_FragColor = vec4(texColor.rgb * light * shadowLight, texColor.a);
	  gl_FragColor = vec4(
		  emissive +
		  ambient * u_ambientLight +
		  effectiveDiffuse * light +
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
		this.camera = new Camera(this.gl.canvas, this.depthTexture);
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
			
			if(obj.name.startsWith("yellowCard"))
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