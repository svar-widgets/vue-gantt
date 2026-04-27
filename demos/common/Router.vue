<script setup>
defineOptions({ name: "DemoRouter" });
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { getLinks } from "./helpers";

const props = defineProps({
	skin: {},
	productTag: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(["onnewpage"]);

const baseLink =
	"https://github.com/svar-widgets/vue-" +
	props.productTag +
	"/blob/main/demos/cases/";

const links = getLinks();

const router = useRouter();
router.afterEach((to) => {
	onRouteChange(to.path);
});

// Watch for skin prop changes and navigate
watch(() => props.skin, (newSkin) => {
	const currentRoute = router.currentRoute.value;
	const parts = currentRoute.path.split("/");
	const page = parts[1];

	if (newSkin && page) {
		router.push(`/${page}/${newSkin}`);
	}
});

function onRouteChange(path) {
	const parts = path.split("/");
	const page = parts[1];
	const newSkin = parts[2];

	const tPage = `/${page}/:skin`;
	const matched = links.find((a) => a[0] === tPage);
	const title = matched?.[1] ?? "";
	const filename = matched?.[3] ?? "";
	const link = `${baseLink}${filename.replace(/\s+/g, "")}.vue`;

	emit("onnewpage", {
		page: page,
		skin: newSkin,
		title: title,
		link: link,
	});
}

onMounted(() => {
	// Handle initial route
	onRouteChange(router.currentRoute.value.path);
});
</script>

<template>
	<RouterView />
</template>
