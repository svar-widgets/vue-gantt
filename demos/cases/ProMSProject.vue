<script setup>
import { ref, computed } from "vue";
import { getData, resources, assignments } from "../data";
import { Gantt } from "../../src";
import ConstraintCell from "../custom/ConstraintCell.vue";
import { Toolbar, registerToolbarItem } from "@svar-ui/vue-toolbar";
import UploadButton from "../custom/UploadButton.vue";
registerToolbarItem("upload", UploadButton);

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("day", { constraints: true });
const tasks = ref(data.tasks);
const links = ref(data.links);

const columns = [
	{ id: "text", header: "Task name", flexgrow: 1 },
	{ id: "start", header: "Start date", align: "center", width: 100 },
	{ id: "resources", header: "Resources", width: 110 },
	{
		id: "constraint",
		header: "Constraint",
		width: 160,
		cell: ConstraintCell,
	},
];

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
			:columns="columns"
			:resources="resources"
			:assignments="assignments"
			:scales="data.scales"
			:gridWidth="480"
			:schedule="{ auto: true }"
			:projectStart="new Date(2026, 3, 2)"
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
