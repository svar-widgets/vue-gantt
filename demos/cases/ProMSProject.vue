<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src";
import { Toolbar, registerToolbarItem } from "@svar-ui/vue-toolbar";
import UploadButton from "../custom/UploadButton.vue";
registerToolbarItem("upload", UploadButton);

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();
const tasks = ref(data.tasks);
const links = ref(data.links);

const items = computed(() => [
	{
		id: "export",
		comp: "button",
		text: "Download MS Project XML",
	},
	{
		id: "import",
		comp: "upload",
		text: "Upload MS Project XML",
		onchange: importMSProject,
	},
]);

let api = ref(null);
function handleClick({ item }) {
	if (item.id === "export") {
		api.value.exec("export-data", { format: "mspx" });
	}
}
function importMSProject() {
	const file = document.getElementById("import-file").files[0];
	const reader = new FileReader();
	reader.onload = e => {
		const xml = e.target.result;
		api.value.exec("import-data", {
			data: xml,
		});
	};
	reader.readAsText(file);
}
</script>

<template>
	<Toolbar :items="items" :onclick="handleClick" />
	<div class="gtcell">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="tasks"
			:links="links"
			:scales="data.scales"
		/>
	</div>
</template>

<style scoped>
.gtcell {
	position: relative;
	height: calc(100% - 48px);
	border-top: var(--wx-gantt-border);
}
</style>
