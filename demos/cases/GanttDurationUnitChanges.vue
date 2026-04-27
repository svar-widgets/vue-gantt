<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor, getEditorItems } from "../../src";
import { RadioButtonGroup } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const initialData = getData();
const tasks = ref(initialData.tasks);
const links = ref(initialData.links);
const scalesMap = {
	hour: getData("hour").scales,
	day: getData().scales,
};

const options = [
	{ id: "day", label: "Day" },
	{ id: "hour", label: "Hour" },
];

const durationUnit = ref("day");
const scales = ref(scalesMap["day"]);

const api = ref(null);

const items = computed(() =>
	getEditorItems().map(ed => ({
		...ed,
		...(ed.comp === "date" && {
			config: { time: durationUnit.value === "hour" },
		}),
	}))
);

function handleUnitChange({ value }) {
	const sTasks = api.value.serialize().map(task => {
		if (task.start && task.end) {
			const ms = 1000 * 60 * 60 * (value === "day" ? 24 : 1);
			const duration = Math.floor((task.end - task.start) / ms);
			return { ...task, duration };
		}
		return task;
	});
	tasks.value = sTasks;
	durationUnit.value = value;
	scales.value = scalesMap[value];
}
</script>

<template>
	<div class="rows">
		<div class="bar">
			<div class="label">Gantt duration unit</div>
			<RadioButtonGroup
				:options="options"
				:value="durationUnit"
				type="inline"
				:onchange="handleUnitChange"
			/>
		</div>

		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="tasks"
					:links="links"
					:scales="scales"
					:cellWidth="40"
					:durationUnit="durationUnit"
					lengthUnit="hour"
				/>
			</ContextMenu>
			<Editor :api="api" :items="items" />
		</div>
	</div>
</template>

<style scoped>
.rows {
	display: flex;
	flex-direction: column;
	background: var(--wx-background);
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 10px;
	display: flex;
	gap: 40px;
}
.bar div {
	display: flex;
}
.gtcell {
	position: relative;
	height: 100%;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}
.label {
	padding-right: 20px;
	font-size: var(--wx-font-size);
	font-weight: var(--wx-label-font-weight);
}
</style>
