<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const columns = [
	{
		id: "text",
		header: "Task name",
		width: 170,
		sort: true,
		editor: "text",
	},
	{
		id: "start",
		header: "Start date",
		width: 120,
		align: "center",
		sort: true,
		editor: "datepicker",
	},
	{
		id: "duration",
		header: "Duration",
		width: 100,
		sort: true,
		align: "center",
		editor: "text",
	},
	{ id: "add-task", header: "Add task", width: 37, align: "center" },
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
