<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const columns = [
	{ id: "text", header: "Task name", flexgrow: 2 },
	{
		id: "start",
		header: "Start date",
		flexgrow: 1,
		align: "center",
	},
	{
		id: "duration",
		header: "Duration",
		align: "center",
		flexgrow: 1,
	},
	{
		id: "add-task",
		header: "Add task",
		width: 37,
		align: "center",
	},
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
