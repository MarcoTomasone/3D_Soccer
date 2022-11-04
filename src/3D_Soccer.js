import {Environment} from "./lib/Environment.js";
import {ObjectRenderer} from "./lib/ObjectRenderer.js";

async function main() {
	
	const env = new Environment("#screenCanvas");

	await env.addObject(new ObjectRenderer("campo", '../resources/fullscene.obj', {x: 0, y: 0, z: 0}));

	function render(time) {
		time *= 0.001;  // convert to seconds

		env.render(time);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();
	