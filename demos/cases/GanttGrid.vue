<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";
import AvatarCell from "../custom/AvatarCell.vue";
import NameAndDateCell from "../custom/NameAndDateCell.vue";
import AddTaskCell from "../custom/AddTaskCell.vue";

const props = defineProps({
	skinSettings: {},
});

const columns = [
	{ id: "text", header: "Task", width: 220, cell: NameAndDateCell },
	{ id: "assigned", header: "Assigned", width: 160, cell: AvatarCell },
	{
		id: "add-task",
		header: { cell: AddTaskCell },
		align: "center",
		width: 80,
	},
];

const data = getData();
</script>

<template>
	<Gantt
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
		:columns="columns"
		:cellHeight="40"
	/>
</template>
