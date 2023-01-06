import {Environment} from "./lib/Environment.js";
import {ObjectRenderer} from "./lib/ObjectRenderer.js";

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

async function main() {
	var randomX = getRndInteger(-10, 10);
	var randomY = getRndInteger(-8, 8);

	const env = new Environment("#screenCanvas", randomX, randomY);
	//TODO: far si che le posizioni di spawn siano dentro il campo solo
	await env.addObject(new ObjectRenderer("scene", '../resources/scene.obj', {x: 0, y: 0, z: 0}));
	await env.addObject(new ObjectRenderer("ball", '../resources/ball.obj', {x: 0, y: 0, z: 0.7}));
	await env.addObject(new ObjectRenderer("markerCone", '../resources/markerCone.obj', {x: randomX - 1, y: randomY, z: 0.5}));
	await env.addObject(new ObjectRenderer("markerCone", '../resources/markerCone.obj', {x: randomX + 2, y: randomY, z: 0.5}));
	await env.addObject(new ObjectRenderer("markerCone", '../resources/markerCone.obj', {x: randomX + 5, y: randomY, z: 0.5}));
	await env.addObject(new ObjectRenderer("yellowCard_1", '../resources/YellowCard.obj', {x: randomX, y: randomY, z: 0.001}));
	await env.addObject(new ObjectRenderer("yellowCard_2", '../resources/YellowCard.obj', {x: randomX + 3, y: randomY, z: 0.001}));
	await env.addObject(new ObjectRenderer("yellowCard_3", '../resources/YellowCard.obj', {x: randomX + 6, y: randomY, z: 0.001}));
	randomX = getRndInteger(-10, 10);
	randomY = getRndInteger(-8, 8);
	//env.addObject(new ObjectRenderer("redCard", '../resources/YellowCard.obj', {x: randomX, y: randomY, z: 0.001}));
	
	function render(time) {
		time *= 0.001;  // convert to seconds

		env.render(time);
		
		requestAnimationFrame(render);
	}
	
	
	requestAnimationFrame(render);
}


main();
	