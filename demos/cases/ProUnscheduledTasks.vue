<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";
import Toolbar from "../../src/components/Toolbar.vue";
import { Button } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("day", { unscheduledTasks: true });

const api = ref(null);

const columns = [
	{
		id: "text",
		header: "Task name",
		width: 170,
		sort: true,
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
		width: 80,
		sort: true,
		align: "center",
		editor: "text",
	},
	{
		id: "unscheduled",
		header: "",
		width: 40,
		align: "center",
		template: v => (v ? "yes" : "no"),
	},
	{ id: "add-task", header: "Add task", width: 37, align: "center" },
];
</script>

<template>
	<div class="topbar">
		<Toolbar :api="api" />
		<Button
			type="primary"
			:onclick="
				() => api.exec('update-task', { id: 10, task: { start: null } })
			"
		>
			Unschedule task: 10
		</Button>
	</div>
	<div class="gtcell">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
			unscheduledTasks
			:columns="columns"
			undo
		/>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.topbar {
	margin-bottom: 8px;
}
.gtcell {
	height: calc(100% - 90px);
	border-top: var(--wx-gantt-border);
}
</style>
