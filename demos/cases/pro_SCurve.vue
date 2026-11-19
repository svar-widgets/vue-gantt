<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import {
	Editor,
	Gantt,
	Tooltip,
	ContextMenu,
	getEditorItems,
} from "../../src/";
import { Checkbox, Combo } from "@svar-ui/vue-core";
import MyTooltipContent from "../custom/MyTooltipContent.vue";

const props = defineProps(["skinSettings"]);

const api = ref(null);
const config = ref({
	baseline: { on: true, metric: "duration" },
	scheduled: { on: true, metric: "duration" },
	earned: { on: true, metric: "duration" },
});

const metrics = [
	{ id: "duration", label: "By duration" },
	{ id: "progress", label: "By progress" },
];

const sCurve = computed(() =>
	Object.entries(config.value)
		.filter(([, line]) => line.on)
		.map(([type, line]) => ({ type, metric: line.metric }))
);

const caption = type => type[0].toUpperCase() + type.slice(1);

// No work happens on a weekend, so the curves flatten across one
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

// A summary takes its baseline from its children, so it keeps its own
function withBaseline(task) {
	if (!task.start || task.type === "summary") return task;
	let base_start = new Date(
		new Date(task.start).setDate(task.start.getDate() - 2)
	);
	let base_duration = task.duration;
	while (base_start.getDay() === 0 || base_start.getDay() === 6) {
		base_start.setDate(base_start.getDate() - 1);
	}
	return { ...task, base_start, base_duration };
}

const data = getData("calendar");
const { links, scales } = data;
// The plan the project was set against ran two days ahead of the schedule
const tasks = data.tasks.map(withBaseline);

// Add fields for editing baseline dates
const items = getEditorItems().flatMap(item =>
	item.key === "links"
		? [
				{
					key: "base_start",
					comp: "date",
					label: "Baseline start",
					config: {
						format: "%d-%m-%Y",
					},
				},
				{
					key: "base_end",
					comp: "date",
					label: "Baseline end",
					config: {
						format: "%d-%m-%Y",
					},
				},
				{
					key: "base_duration",
					comp: "counter",
					hidden: true,
				},
				item,
			]
		: item
);
</script>

<template>
	<div class="rows">
		<div class="row">
			<div v-for="type in Object.keys(config)" :key="type" class="line">
				<Checkbox
					:label="caption(type)"
					v-model:value="config[type].on"
				/>
				<div class="metric">
					<Combo
						:options="metrics"
						v-model:value="config[type].metric"
						:disabled="!config[type].on"
					/>
				</div>
			</div>
		</div>
		<div class="gtcell">
			<ContextMenu :api="api">
				<Tooltip :api="api" :content="MyTooltipContent">
					<Gantt
						ref="api"
						v-bind="skinSettings"
						:tasks="tasks"
						:links="links"
						:scales="scales"
						:calendar="calendar"
						:baselines="true"
						:cellWidth="40"
						:cellHeight="45"
						:sCurve="sCurve"
						:zoom="true"
					/>
					<Editor :api="api" :items="items" />
				</Tooltip>
			</ContextMenu>
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

.row {
	display: flex;
	flex-wrap: wrap;
	gap: 8px 32px;
	align-items: center;
	padding: 13px;
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
}

.line {
	display: flex;
	align-items: center;
	gap: 8px;
}

.metric {
	width: 150px;
}

.gtcell {
	position: relative;
	height: 100%;
	min-height: 0;
	border-top: var(--wx-gantt-border);
	margin-bottom: 10px;
}

.gtcell:last-of-type {
	margin-bottom: 0;
}
</style>
