<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";
import { Button } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

let { tasks, links, scales } = getData("calendar");
const tasksRef = ref(tasks);
const calendar = {
	weekHours: {
		monday: 8,
		tuesday: 8,
		wednesday: 8,
		thursday: 8,
		friday: 8,
		saturday: 0,
		sunday: 0,
	},
};

function addNewRule() {
	const cal = api.value.getCalendar();
	cal.addRule({
		type: "weekday",
		weekday: "wednesday",
		hours: 0,
		name: "Wednesday off",
	});

	tasksRef.value = api.value.serialize().map(task => {
		if (!cal.isWorkingDay(task.start)) {
			task.start = cal.getNextWorkingDay(task.start);
		}
		return task;
	});
}

const api = ref(null);
</script>

<template>
	<div class="rows">
		<div class="bar">
			<span> Rule: every Wednesday is off</span>
			<Button type="primary" :onclick="addNewRule">Add rule</Button>
		</div>

		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				ref="api"
				:calendar="calendar"
				:tasks="tasksRef"
				:links="links"
				:scales="scales"
				:cellWidth="60"
			/>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 12px;
	display: flex;
	align-items: center;
	gap: 20px;
}
.gtcell {
	position: relative;
	height: calc(100% - 56px);
	border-top: var(--wx-gantt-border);
}
</style>
