import { createApp } from "vue";
import Index from "./common/Index.vue";
import { router } from "./common/helpers";

import Willow from "../src/themes/Willow.vue";
import WillowDark from "../src/themes/WillowDark.vue";

import { Button, Segmented, Globals, Locale } from "@svar-ui/vue-core";
import "@wx/vue-core/style.css";
import "@wx/vue-menu/style.css";
import "@wx/vue-toolbar/style.css";
import "@wx/vue-editor/style.css";
import "@wx/vue-comments/style.css";
import "@wx/vue-tasklist/style.css";
import "@wx/vue-filter/style.css";
import "@wx/vue-grid/style.css";

const app = createApp(Index, {
	publicName: "Gantt",
	productTag: "gantt",
	productLink: "gantt",
	skins: [
		{ id: "willow", label: "Willow", component: Willow },
		{ id: "willow-dark", label: "Dark", component: WillowDark },
	],
	Button,
	Segmented,
	Globals,
	Locale,
});

app.use(router);
app.mount("#app");
