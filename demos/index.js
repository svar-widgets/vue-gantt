import { createApp } from "vue";
import Index from "./common/Index.vue";
import { router } from "./common/helpers";

import Willow from "../src/themes/Willow.vue";
import WillowDark from "../src/themes/WillowDark.vue";

import { Button, Segmented, Globals, Locale } from "@svar-ui/vue-core";
import "@svar-ui/vue-core/style.css";
import "@svar-ui/vue-menu/style.css";
import "@svar-ui/vue-toolbar/style.css";
import "@svar-ui/vue-editor/style.css";
import "@svar-ui/vue-comments/style.css";
import "@svar-ui/vue-tasklist/style.css";
import "@svar-ui/vue-filter/style.css";
import "@svar-ui/vue-grid/style.css";
import "@svar-ui/vue-excel-import/style.css";

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
