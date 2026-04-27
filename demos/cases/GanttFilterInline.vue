<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu } from "../../src/";
import { Button } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);
const tasks = ref([...data.tasks]);

function reload() {
	tasks.value = [...data.tasks];
	tasks.value.pop();
}
function clear() {
	api.value.exec("filter-tasks", {});
}
const textfilter = { filter: { type: "text", config: { clear: true } } };
const datefilter = {
	filter: { type: "datepicker", config: { format: "%d-%m-%Y" } },
};
const numberfilter = {
	filter: {
		type: "text",
		config: {
			clear: true,
			handler: (a, b) => !b || a === b * 1,
		},
	},
};

const columns = [
	{ id: "text", header: ["Task name", textfilter], width: 200 },
	{
		id: "start",
		header: ["Start date", datefilter],
		align: "center",
		width: 130,
	},
	{
		id: "end",
		header: ["End date", datefilter],
		align: "center",
		width: 130,
	},
	{
		id: "duration",
		header: ["Duration", numberfilter],
		width: 100,
		align: "center",
	},
	{ id: "add-task", header: "Add task", align: "center" },
];
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Button type="primary" :onclick="reload">Reload</Button>
			<Button type="primary" :onclick="clear">Clear filters</Button>
		</div>
		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="tasks"
					:columns="columns"
					:links="data.links"
					:scales="data.scales"
					zoom
				/>
			</ContextMenu>
		</div>
	</div>
</template>

<style scoped>
.demo {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 12px;
	gap: 20px;
	display: flex;
}
.gtcell {
	position: relative;
	height: calc(100% - 56px);
	border-top: var(--wx-gantt-border);
}
</style>
