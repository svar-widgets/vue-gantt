import { createApp } from "vue";
import Gantt from "./components/Export.vue";

function init(target, config, skin) {
	const app = createApp(Gantt, {
		config,
		skin,
	});
	app.mount(target ? document.querySelector(target) : document.body);
}

export { init };
