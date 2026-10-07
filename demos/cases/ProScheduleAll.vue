<script setup>
import { ref, computed, inject } from "vue";
import { getData, resources, assignments } from "../data";
import { Gantt, Editor, ContextMenu, ResourceLoad } from "../../src";
import { DatePicker, Field, Checkbox } from "@svar-ui/vue-core";
import { getDefaultColumns } from "@svar-ui/gantt-store";
import SchedulingFlagCell from "../custom/SchedulingFlagCell.vue";

const helpers = inject("wx-helpers");

const linkRemovalReasons = {
	cycle: "it would close a dependency loop",
	"parent-chain": "a task cannot be linked to its own summary or subtask",
	"summary-endpoint":
		"a summary can only be linked from its end or to its start",
};

const data = getData("calendar", {
	splitTasks: true,
	unscheduledTasks: true,
	constraints: true,
	linkTypes: true,
});

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const tasks = ref(
	data.tasks.map(t => {
		const copy = { ...t };
		delete copy.calendar;
		return copy;
	})
);

const calendar = true;
const taskCalendars = ref(false);
const calendarsList = ref([]);
const projectStart = ref(new Date(2026, 3, 2));
const projectEnd = ref(new Date(2026, 4, 20));

const autoSchedule = ref(true);
const criticalPath = ref({ type: "flexible" });
const baselines = ref(true);
const unscheduledTasks = ref(true);
const inactiveTasks = ref(true);
const splitTasks = ref(true);
const slack = ref(false);
const resourceLoad = ref(false);

const cellHeight = ref(44);

const inactiveColumn = {
	id: "inactive",
	header: "Inactive",
	width: 90,
	align: "center",
	sort: true,
	cell: SchedulingFlagCell,
};

const slackColumns = [
	{
		id: "text",
		header: "Task name",
		flexgrow: 1,
	},
	{
		id: "resources",
		header: "Resources",
		width: 110,
		editor: "multiselect",
	},
	{
		id: "duration",
		header: "Duration",
		align: "center",
		width: 100,
	},
	{
		id: "slack",
		header: "Total slack",
		align: "center",
		width: 110,
		getter: t => t.slack?.totalSlack,
		template: v => v || "-",
	},
	{
		id: "add-task",
		header: "Add task",
		width: 37,
		align: "center",
	},
];

const columns = computed(() => {
	const cols = slack.value
		? [...slackColumns]
		: getDefaultColumns({ resources: true }).map(c =>
				c.id === "resources" ? { ...c, editor: "multiselect" } : c
			);
	const i = cols.findIndex(c => c.id === "add-task");
	if (inactiveTasks.value) cols.splice(i, 0, inactiveColumn);

	return cols;
});

const markers = computed(() =>
	projectStart.value
		? [
				{
					text: "Start",
					start: projectStart.value,
				},
			]
		: []
);

function onCriticalPathChange() {
	criticalPath.value =
		criticalPath.value?.type === "flexible" ? null : { type: "flexible" };
}

function onBaselinesChange() {
	cellHeight.value = baselines.value ? 44 : 38;
}

function onTaskCalendarsChange(ev) {
	taskCalendars.value = ev.value;
	calendarsList.value = taskCalendars.value ? data.calendars : [];
	tasks.value = (api.value ? api.value.serialize() : tasks.value).map(t => {
		if (!taskCalendars.value) {
			const copy = { ...t };
			delete copy.calendar;
			return copy;
		}
		if (t.id === 10 || t.id === 23)
			return { ...t, calendar: "wednesday-off" };
		return t;
	});
}

// gantt expects every task to have a start when unscheduled tasks are off
const originalStarts = new Map(
	getData("calendar").tasks.map(t => [t.id, t.start])
);

let unscheduledIds = new Set();

function onUnscheduledChange() {
	if (unscheduledTasks.value) {
		tasks.value = api.value.serialize().map(t => {
			if (!unscheduledIds.has(t.id)) return t;
			const copy = { ...t };
			delete copy.start;
			return copy;
		});
		unscheduledIds = new Set();
		return;
	}
	tasks.value = api.value.serialize().map(t => {
		if (t.start || t.type === "summary") return t;
		unscheduledIds.add(t.id);
		const copy = {
			...t,
			start: originalStarts.get(t.id) || projectStart.value,
		};
		delete copy.unscheduled;
		delete copy.end;
		return copy;
	});
}

function onSplitChange() {
	tasks.value = api.value.serialize().map(t => {
		//recalculate duration
		if (t.segments) delete t.duration;
		return t;
	});
}

//calculate baselines after summary dates are set
function init(ganttApi) {
	ganttApi.on("delete-link", ({ reason }) => {
		if (reason)
			helpers.showNotice({
				text: `Link removed: ${linkRemovalReasons[reason]}`,
			});
	});

	tasks.value = ganttApi.serialize().map(t => {
		return {
			...t,
			base_start: t.start,
			base_end: t.end,
			base_duration: t.segments ? 0 : t.duration,
		};
	});
}

/*data.links.push({
	source: 2,
	target: 3,
	type: "e2s",
	id: 100,
});
data.links.push({
	source: 30,
	target: 4,
	type: "e2s",
	id: 101,
});*/
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Field label="Project start" position="left" width="220px">
				<DatePicker v-model:value="projectStart" />
			</Field>
			<Field label="Project end" position="left" width="220px">
				<DatePicker v-model:value="projectEnd" />
			</Field>
			<Checkbox v-model:value="autoSchedule" label="Auto scheduling" />
			<Checkbox
				:value="!!criticalPath"
				label="Critical path"
				:onchange="onCriticalPathChange"
			/>
			<Checkbox v-model:value="slack" label="Slack" />
			<Checkbox
				v-model:value="baselines"
				label="Baselines"
				:onchange="onBaselinesChange"
			/>
			<Checkbox
				v-model:value="unscheduledTasks"
				label="Unscheduled tasks"
				:onchange="onUnscheduledChange"
			/>
			<Checkbox v-model:value="inactiveTasks" label="Inactive tasks" />
			<Checkbox
				v-model:value="splitTasks"
				label="Split tasks"
				:onchange="onSplitChange"
			/>
			<Checkbox
				:value="taskCalendars"
				label="Task calendars"
				:onchange="onTaskCalendarsChange"
			/>
			<Checkbox v-model:value="resourceLoad" label="Resource load" />
		</div>
		<div class="main" :class="{ 'with-resources': resourceLoad }">
			<div class="gantt">
				<Editor :api="api" />
				<ContextMenu :api="api">
					<Gantt
						:init="init"
						v-bind="skinSettings"
						:cellWidth="50"
						:cellHeight="cellHeight"
						:gridWidth="660"
						ref="api"
						:tasks="tasks"
						:links="data.links"
						:scales="data.scales"
						:calendar="calendar"
						:calendars="calendarsList"
						:resources="resources"
						:assignments="assignments"
						:schedule="{ auto: autoSchedule }"
						:criticalPath="criticalPath"
						:projectStart="projectStart"
						:projectEnd="projectEnd"
						:markers="markers"
						:baselines="baselines"
						:unscheduledTasks="unscheduledTasks"
						:inactiveTasks="inactiveTasks"
						:splitTasks="splitTasks"
						:slack="slack"
						:columns="columns"
						undo
					/>
				</ContextMenu>
			</div>
			<div v-if="resourceLoad" class="resource">
				<ResourceLoad :api="api" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 12px;
	gap: 12px 20px;
	border-bottom: var(--wx-gantt-border);
}

.main {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.gantt {
	flex: 1;
	min-height: 0;
	position: relative;
	overflow: hidden;
}

.main.with-resources .gantt {
	height: 60%;
	flex: none;
	border-bottom: 2px solid var(--wx-gantt-border-color);
}

.resource {
	height: 40%;
	overflow: hidden;
}
:global(.bar .wx-field.wx-left) {
	margin-bottom: 0px;
}
.bar :deep(.wx-field.wx-left > .wx-label) {
	width: auto;
	text-align: left;
}
.bar :deep(.wx-field.wx-left > .wx-field-control) {
	max-width: none;
}
.demo :deep(.wednesday-off) {
	background-color: lavender;
}

.wx-willow-dark-theme .demo :deep(.wednesday-off) {
	background-color: #383650;
}
</style>
