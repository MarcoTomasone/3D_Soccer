import {ObjectClass} from "./lib/ObjectClass.js";
import { SceneHandler } from "./lib/SceneHandler.js";
function getRndInteger(min, max) {
	var num =  Math.floor(Math.random() * (max - min + 1) ) + min;
	return (num > -1 && num < 1) ? getRndInteger(min, max) : num;
}

function checkIfPositionFree(x, y, positionList){
	var positionFree = true;
	for (var i = 0; i < positionList.length; i++) {
		if (positionList[i].x === x && positionList[i].y === y) {
			positionFree = false;
		}
	}
	return positionFree;
}

async function main() {
	var randomX = getRndInteger(-10, 10);
	var randomY = getRndInteger(-8, 8);
	var positionList = [];
	positionList.push({name: "yellowCard_1", x: randomX, y: randomY, z: 0.01, visibility: true});
	positionList.push({name: "yellowCard_2", x: randomX + 3, y: randomY, z: 0.01, visibility: true});
	positionList.push({name: "yellowCard_3", x: randomX + 6, y: randomY, z: 0.01, visibility: true});
	positionList.push({name: "markerCone", x: randomX - 1, y: randomY, z: 0.5, visibility: true});
	positionList.push({name: "markerCone", x: randomX + 2, y: randomY, z: 0.5, visibility: true});
	positionList.push({name: "markerCone", x: randomX + 5, y: randomY, z: 0.5, visibility: true});
	for(var i= 0; i < 15; i++){
		randomX = getRndInteger(-16, 16);
		randomY = getRndInteger(-8, 8);
		if(checkIfPositionFree(randomX, randomY, positionList)){
			positionList.push({name: "markerCone", x: randomX, y: randomY, z: 0.5, visibility: false});
		}	
	}
	const scene = new SceneHandler("#screenCanvas", positionList);
	const canvas = document.getElementById("screenCanvas");
	//TODO: far si che le posizioni di spawn siano dentro il campo solo
	await scene.addObject(new ObjectClass("plane", './resources/Plane.obj', {x: 0, y: 0, z: 0}, true));
	await scene.addObject(new ObjectClass("ball", './resources/Ball.obj', {x: 0, y: 0, z: 0.7}, true));
	await scene.addObject(new ObjectClass("refree", './resources/Refree.obj', {x: 0, y: 0, z: 1}, false));
	await scene.addObject(new ObjectClass("scene", './resources/Scena2.obj', {x: 0, y: 0, z: 0}, true));
	await scene.addObject(new ObjectClass("glass", './resources/Vetro.obj', {x: 19, y: 0, z: 8.5}, true));
	
	for (const element of positionList){
		var nameFile = element.name.startsWith("yellowCard") ? "YellowCard" : element.name;
		await scene.addObject(new ObjectClass(element.name, './resources/' + nameFile + ".obj", {x: element.x, y: element.y, z:element.z}, element.visibility));
	};
		
	async function render(time) {
		if(!toStop){	
			time *= 0.001;  // convert to seconds
		
			scene.render(time);
			
			requestAnimationFrame(render);
		}
		else {
			if(!win){
				const upperCanvas = document.getElementById("upperCanvas");
				const ctx = upperCanvas.getContext("2d");
				ctx.canvas.width = canvas.clientWidth;
				ctx.canvas.height = canvas.clientHeight;
				ctx.canvas.style.margin = 0 + "px";
				ctx.canvas.style.borderRadius = 0 + "px";
				const game_over = new Image();
				game_over.src = "./resources/gameOver.png";
				await game_over.decode();
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.drawImage(game_over, 0, 0, upperCanvas.clientWidth, upperCanvas.clientHeight);     
				ctx.font = '60pt VT323, sans-serif';
				ctx.fillStyle = 'white';
				if(cone)
					ctx.fillText("You have to improve your dribbling!", 100,50);
				else 
					ctx.fillText("The Refree sent you under the shower!", 75,50);
				ctx.font = '40pt VT323, sans-serif';
				ctx.fillText("Click to play again", 430,100);
				upperCanvas.addEventListener('click', function() {
					location.reload();
				});
			}
			cancelAnimationFrame(render);
		}
	}
	
	
	requestAnimationFrame(render);
}


main();
	