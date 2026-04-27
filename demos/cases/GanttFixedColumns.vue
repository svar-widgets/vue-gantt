<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const columns = [
	{ id: "text", header: "Task name", width: 120 },
	{
		id: "start",
		header: "Start date",
		width: 120,
		align: "center",
	},
	{
		id: "duration",
		header: "Duration",
		width: 90,
		align: "center",
	},
	{ id: "add-task", header: "Add task", width: 50, align: "center" },
];
</script>

<template>
	<Gantt
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
		:columns="columns"
	/>
</template>
