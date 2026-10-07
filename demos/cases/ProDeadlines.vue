<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, Tooltip, getDefaultColumns } from "../../src/";
import DeadlineTaskContent from "../custom/DeadlineTaskContent.vue";
import MyTooltipContent from "../custom/MyTooltipContent.vue";
import DeadlineCell from "../custom/DeadlineCell.vue";

const props = defineProps(["skinSettings"]);

const { tasks, links, scales } = getData("day", { deadlines: true });
const api = ref(null);

const columns = getDefaultColumns();
columns.splice(2, 0, {
	id: "deadline",
	header: "Deadline",
	align: "center",
	width: 110,
	cell: DeadlineCell,
});
</script>

<template>
	<Tooltip :api="api" :content="MyTooltipContent">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="tasks"
			:links="links"
			:scales="scales"
			:columns="columns"
			:gridWidth="560"
			:taskTemplate="DeadlineTaskContent"
			deadlines
		/>
		<Editor :api="api" />
	</Tooltip>
</template>
