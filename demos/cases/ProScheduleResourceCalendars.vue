<script setup>
import { ref } from "vue";
import { getData } from "../data";
import {
	Gantt,
	ResourceLoad,
	Editor,
	ContextMenu,
	getDefaultColumns,
	getResourceColumns,
} from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("calendars");

const taskCalendarOptions = [
	{ id: "default", label: "Default" },
	{ id: "friday-off", label: "Friday off" },
	{ id: "wednesday-off", label: "Wednesday off" },
	{ id: "weekends-only", label: "Weekends only" },
	{ id: "part-time", label: "Part time" },
];

const columns = getDefaultColumns({ resources: true });
columns.splice(-1, 0, {
	id: "calendar",
	header: "Calendar",
	width: 140,
	editor: task => (task.type === "summary" ? null : "richselect"),
	options: taskCalendarOptions,
});
const fridayOffCalendar = {
	id: "friday-off",
	css: "friday-off",
	weekHours: {
		friday: 0,
	},
};

const calendars = [...data.calendars, fridayOffCalendar];

const calendarOptions = [
	{ id: "default", label: "Default" },
	{ id: "wednesday-off-resource", label: "Wednesday off" },
	{ id: "weekends-only-resource", label: "Weekends only" },
	{ id: "part-time-resource", label: "Part time" },
];

const resourceColumns = getResourceColumns();
resourceColumns.splice(1, 0, {
	id: "calendar",
	header: "Calendar",
	width: 140,
	resize: true,
	template: value =>
		calendarOptions.find(option => option.id === value)?.label ??
		"Default",
});

const resources = data.resources.map(r => ({ ...r }));

// only these two carry a calendar of their own, and it is the same one.
// 13 is assigned a weekday resource — nothing in common, so it is dimmed;
// 20 is assigned the weekend resource, so it schedules normally.
const weekendTasks = [13, 20];

const tasks = ref(
	data.tasks.map(t => {
		const copy = { ...t };
		delete copy.calendar;
		if (weekendTasks.includes(t.id)) copy.calendar = "weekends-only";
		if (t.id === 10) {
			copy.start = new Date(2026, 3, 3);
			copy.end = new Date(2026, 3, 11);
		}
		if (t.id === 11) copy.start = new Date(2026, 3, 7);
		if (t.id === 12) copy.start = new Date(2026, 3, 7);
		if (t.id === 20) copy.start = new Date(2026, 3, 20);
		if (t.id === 21) copy.start = new Date(2026, 3, 23);
		if (t.id === 23) copy.start = new Date(2026, 3, 18);
		return copy;
	})
);

const schedule = { resourceCalendars: true, auto: true };

const api = ref(null);

const loadTemplate = v => `${v.hours}h, ${v.percent}%`;
</script>

<template>
	<div class="demo">
		<div class="bar">
			<div class="labels">
				Wednesday off
				<div class="cell wednesday-off-resource"></div>
				Weekends only
				<div class="cell weekends-only-resource"></div>
				Part time
				<div class="cell part-time-resource"></div>
			</div>
		</div>

		<div class="main">
			<div class="gantt">
				<ContextMenu :api="api">
					<Gantt
						v-bind="skinSettings"
						ref="api"
						:tasks="tasks"
						:columns="columns"
						:resources="resources"
						:assignments="data.assignments"
						:calendars="calendars"
						calendar="default"
						:links="data.links"
						:schedule="schedule"
						:scales="data.scales"
						zoom
						splitTasks
					/>
				</ContextMenu>
			</div>
			<div class="resource">
				<ResourceLoad
					:api="api"
					:columns="resourceColumns"
					:template="loadTemplate"
				/>
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
	gap: 20px;
	border-bottom: var(--wx-gantt-border);
	& :deep(.wx-field) {
		width: auto;
	}
	& :deep(.wx-label) {
		width: auto !important;
		padding-top: 2px !important;
		white-space: nowrap;
	}
}

.main {
	width: 100%;
	height: calc(100% - 55px);
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

.demo :deep(.wednesday-off),
.demo :deep(.wednesday-off-resource) {
	background: repeating-linear-gradient(
		-60deg,
		#c8b8e0,
		#c8b8e0 1px,
		transparent 1px,
		transparent 8px
	);
}
.demo :deep(.part-time-resource) {
	background-color: lightyellow;
}

.demo :deep(.friday-off) {
	background-color: #ffe7ea;
}

.wx-willow-dark-theme .demo :deep(.wednesday-off),
.wx-willow-dark-theme .demo :deep(.wednesday-off-resource) {
	background: repeating-linear-gradient(
		-60deg,
		#5a5470,
		#5a5470 1px,
		transparent 1px,
		transparent 8px
	);
}
.wx-willow-dark-theme .demo :deep(.weekends-only-resource) {
	background-color: #4a2f37;
}
.wx-willow-dark-theme .demo :deep(.part-time-resource) {
	background-color: #45402a;
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
