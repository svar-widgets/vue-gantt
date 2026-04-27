<script setup>
import { ref, watchEffect } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu } from "../../src/";
import { FilterBuilder, getOptions, createFilter } from "@svar-ui/vue-filter";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const tasks = data.tasks;
const api = ref(null);

function init(ganttApi) {
	api.value = ganttApi;
}
const value = {
	glue: "or",
	rules: [
		{
			field: "text",
			filter: "contains",
			value: "plan",
		},
		{
			field: "duration",
			filter: "greater",
			value: 5,
		},
	],
};

let options = {
	text: getOptions(tasks, "text"),
	start: getOptions(tasks, "start"),
	end: getOptions(tasks, "end"),
	duration: getOptions(tasks, "duration"),
};

let fields = [
	{ id: "text", label: "Task name", type: "text" },
	{ id: "start", label: "Start date", type: "date" },
	{ id: "end", label: "End date", type: "date" },
	{ id: "duration", label: "Duration", type: "number" },
];

function applyFilter({ value }) {
	const filter = createFilter(value);
	api.value.exec("filter-tasks", { filter });
}

watchEffect(() => {
	if (api.value) applyFilter({ value });
});
</script>

<template>
	<div class="demo">
		<div class="bar">
			<FilterBuilder
				:value="value"
				:fields="fields"
				:options="options"
				type="line"
				:onchange="applyFilter"
			/>
		</div>
		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:tasks="tasks"
					:links="data.links"
					:scales="data.scales"
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
