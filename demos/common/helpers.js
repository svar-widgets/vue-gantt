import { createRouter, createWebHashHistory } from "vue-router";
import { links as raw } from "../routes";

// Create route configuration for Vue Router
function getRoutes(skinSettings) {
	const routes = raw.map((a) => ({
		path: a[0],
		component: a[2],
		props: { ...skinSettings }
	}));

	// Add redirect from root to default route
	routes.unshift({
		path: "/",
		redirect: "/base/willow",
	});

	return routes;
}

function getLinks() {
	return raw;
}


// Create router instance
const router = createRouter({
	history: createWebHashHistory(),
	routes: getRoutes({}),
});


export { router, getRoutes, getLinks };
