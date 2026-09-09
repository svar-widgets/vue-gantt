<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, ResourceLoad, Editor } from "../../src";
import { Field, Switch } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("calendars");

const taskCalendar = {
	id: "prototyping",
	css: "prototyping",
	weekHours: {
		saturday: 8,
		sunday: 8,
		monday: 0,
		tuesday: 0,
		wednesday: 0,
		thursday: 0,
		friday: 0,
	},
};

const calendars = [...data.calendars, taskCalendar];

const tasks = data.tasks.map(t => {
	const copy = { ...t };
	delete copy.calendar;
	if (t.id === 13) copy.calendar = "prototyping";
	return copy;
});

const api = ref(null);
const enabled = ref(true);

const groupBy = computed(() => (enabled.value ? { field: "resource" } : null));
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Field label="Group by resource" position="left">
				<Switch v-model:value="enabled"></Switch>
			</Field>
			<div class="labels">
				Wednesday off
				<div class="cell wednesday-off-resource"></div>
				Weekends only
				<div class="cell weekends-only-resource"></div>
				Part time
				<div class="cell part-time-resource"></div>
				Weekends only (task)
				<div class="cell prototyping"></div>
			</div>
		</div>

		<div class="main">
			<div class="gantt">
				<Gantt
					v-bind="skinSettings"
					ref="api"
					:tasks="tasks"
					:columns="data.columns"
					:resources="data.resources"
					:assignments="data.assignments"
					:calendars="calendars"
					calendar="default"
					:links="data.links"
					:groupBy="groupBy"
					:scales="data.scales"
					zoom
				/>
			</div>
			<div class="resource">
				<ResourceLoad :api="api" :template="v => `${v.hours}h, ${v.percent}%`" />
			</div>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.demo {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.bar {
	padding-left: 12px;
	display: flex;
	align-items: center;
	border-bottom: var(--wx-gantt-border);
	& :global(.wx-field) {
		width: auto;
	}
	& :global(.wx-label) {
		width: auto !important;
		padding-top: 2px !important;
		white-space: nowrap;
	}
}
.main {
	width: 100%;
	height: calc(100% - 50px);
}

.gantt {
	height: 60%;
	border-bottom: 2px solid var(--wx-gantt-border-color);
}
.resource {
	height: 40%;
}

.demo :deep(.weekends-only-resource) {
	background-color: #ffe7ea;
}

.demo :deep(.wednesday-off-resource) {
	background-color: lavender;
}
.demo :deep(.part-time-resource) {
	background-color: lightyellow;
}

.wx-willow-dark-theme .demo :deep(.wednesday-off-resource) {
	background-color: #383650;
}
.wx-willow-dark-theme .demo :deep(.weekends-only-resource) {
	background-color: #4a2f37;
}
.wx-willow-dark-theme .demo :deep(.part-time-resource) {
	background-color: #45402a;
}

.demo :deep(.prototyping) {
	background-color: #e6f9ea;
}
.wx-willow-dark-theme .demo :deep(.prototyping) {
	background-color: #2e3f30;
}
.cell {
	width: 60px;
	height: 36px;
	border-radius: 3px;
	margin: 6px;
}
.labels {
	display: flex;
	align-items: center;
	padding-left: 20px;
	font-weight: 600;
}
</style>
