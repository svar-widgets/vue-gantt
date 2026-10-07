<script setup>
import { ref } from "vue";
import { getRollupsData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src";
import { defaultColumns } from "@svar-ui/gantt-store";
import SchedulingFlagCell from "../custom/SchedulingFlagCell.vue";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);

const data = getRollupsData();

const schedulingColumns = [
	{
		id: "manual",
		header: "Manual",
		width: 90,
		align: "center",
		sort: true,
		cell: SchedulingFlagCell,
	},
	{
		id: "inactive",
		header: "Inactive",
		width: 90,
		align: "center",
		sort: true,
		cell: SchedulingFlagCell,
	},
];

const columns = [...defaultColumns];
columns.splice(
	columns.findIndex(c => c.id === "add-task"),
	0,
	...schedulingColumns
);
</script>

<template>
	<div class="gantt">
		<Editor :api="api" />
		<ContextMenu :api="api">
			<Gantt
				v-bind="skinSettings"
				:gridWidth="620"
				ref="api"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:schedule="{ auto: true }"
				inactiveTasks
				:columns="columns"
			/>
		</ContextMenu>
	</div>
</template>

<style scoped>
.gantt {
	height: 100%;
	position: relative;
	overflow: hidden;
}
</style>
