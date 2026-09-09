<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src";
import { DatePicker, Field, Checkbox } from "@svar-ui/vue-core";
import { defaultColumns } from "@svar-ui/gantt-store";

const data = getData("calendar", {
	splitTasks: true,
	unscheduledTasks: true,
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

const criticalPath = ref({ type: "flexible" });
const baselines = ref(true);
const unscheduledTasks = ref(true);
const splitTasks = ref(true);
const slack = ref(false);

const cellHeight = ref(44);

const slackColumns = [
	{
		id: "text",
		header: "Task name",
		flexgrow: 1,
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
		width: 100,
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

const columns = computed(() => (slack.value ? slackColumns : defaultColumns));

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

function onBaselinesChange(ev) {
	baselines.value = ev.value;
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

function onSplitChange() {
	tasks.value = api.value.serialize().map(t => {
		//recalculate duration
		if (t.segments) delete t.duration;
		return t;
	});
}

//calculate baselines after summary dates are set
function init(ganttApi) {
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
			<Field label="Project start" position="left" width="250px">
				<DatePicker v-model:value="projectStart" />
			</Field>
			<Field label="Project end" position="left" width="250px">
				<DatePicker v-model:value="projectEnd" />
			</Field>
			<Checkbox
				:value="!!criticalPath"
				label="Critical path"
				:onchange="onCriticalPathChange"
			/>
			<Checkbox
				v-model:value="baselines"
				label="Baselines"
				:onchange="onBaselinesChange"
			/>
			<Checkbox v-model:value="unscheduledTasks" label="Unscheduled tasks" />
			<Checkbox
				v-model:value="splitTasks"
				label="Split tasks"
				:onchange="onSplitChange"
			/>
			<Checkbox v-model:value="slack" label="Slack" />
			<Checkbox
				:value="taskCalendars"
				label="Task calendars"
				:onchange="onTaskCalendarsChange"
			/>
		</div>
		<div class="gantt">
			<Editor :api="api" />
			<ContextMenu :api="api">
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:cellWidth="50"
					:cellHeight="cellHeight"
					ref="api"
					:tasks="tasks"
					:links="data.links"
					:scales="data.scales"
					:calendar="calendar"
					:calendars="calendarsList"
					:schedule="{ auto: true }"
					:criticalPath="criticalPath"
					:projectStart="projectStart"
					:projectEnd="projectEnd"
					:markers="markers"
					:baselines="baselines"
					:unscheduledTasks="unscheduledTasks"
					:splitTasks="splitTasks"
					:slack="slack"
					:columns="columns"
				/>
			</ContextMenu>
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
	align-items: center;
	padding: 12px;
	gap: 20px;
	border-bottom: var(--wx-gantt-border);
}

.gantt {
	position: relative;
	height: 100%;
	overflow: hidden;
}
:global(.bar .wx-field.wx-left) {
	margin-bottom: 0px;
}
.demo :global(.wednesday-off) {
	background-color: lavender;
}

:global(.wx-willow-dark-theme) .demo :global(.wednesday-off) {
	background-color: #383650;
}
</style>
