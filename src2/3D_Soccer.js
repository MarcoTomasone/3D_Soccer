import {Environment} from "./lib/Environment.js";
import {ObjectRenderer} from "./lib/ObjectRenderer.js";

async function main() {
	const env = new Environment("#screenCanvas");
	const mainCanvas = document.getElementById("#screenCanvas");

	await env.addObject(new ObjectRenderer("scene", '../resources/scene.obj', {x: 0, y: 0, z: 0}));
	await env.addObject(new ObjectRenderer("ball", '../resources/ball.obj', {x: 0, y: 0, z: 0.7}));
	
	
	function render(time) {
		time *= 0.001;  // convert to seconds

		env.render(time);

		requestAnimationFrame(render);
	}
	
	
	requestAnimationFrame(render);
}

main();
	