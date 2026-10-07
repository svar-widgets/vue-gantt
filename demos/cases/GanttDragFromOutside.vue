<script setup>
import { ref, shallowRef } from "vue";
import { locateID } from "@svar-ui/lib-dom";
import { Grid } from "@svar-ui/vue-grid";
import { getData, backlogTasks } from "../data";
import { Gantt, Editor, locateTask } from "../../src/";
import BacklogTaskCell from "../custom/BacklogTaskCell.vue";

const props = defineProps(["skinSettings"]);

const MIME = "application/x-svar-gantt-task";
const data = getData();

const backlog = ref([...backlogTasks]);

const backlogColumns = [
	{
		id: "text",
		header: "Backlog",
		flexgrow: 1,
		cell: BacklogTaskCell,
	},
];

const api = shallowRef(null);
let tableApi = null;
let dropTarget = null;

function init(ganttApi) {
	api.value = ganttApi;
}

function initTable(gridApi) {
	tableApi = gridApi;
}

function clearDropTarget() {
	if (dropTarget) {
		dropTarget.classList.remove("task-drop");
		dropTarget = null;
	}
}

function isTaskDrag(e) {
	return Array.from(e.dataTransfer?.types || []).includes(MIME);
}

function onGridDragStart(e) {
	const id = locateID(e);
	if (id == null || !tableApi) return;

	const row = tableApi.getRow(id);
	if (!row) return;

	e.dataTransfer.setData(MIME, JSON.stringify(row.id));
	e.dataTransfer.setData("text/plain", row.text || "");
	e.dataTransfer.effectAllowed = "copy";
}

function onDragOver(e) {
	if (!isTaskDrag(e)) return;

	const taskTarget = locateTask(e, api.value);
	if (!taskTarget) {
		clearDropTarget();
		return;
	}

	const { node } = taskTarget;
	e.preventDefault();
	e.dataTransfer.dropEffect = "copy";

	if (dropTarget !== node) {
		clearDropTarget();
		node.classList.add("task-drop");
		dropTarget = node;
	}
}

function onDragLeave(e) {
	if (!e.currentTarget.contains(e.relatedTarget)) {
		clearDropTarget();
	}
}

function onDrop(e) {
	if (!isTaskDrag(e) || !api.value) return;

	const gantt = api.value;
	const taskId = JSON.parse(e.dataTransfer.getData(MIME));
	const taskTarget = locateTask(e, gantt);
	clearDropTarget();

	if (taskId == null || !taskTarget) return;

	e.preventDefault();
	e.stopPropagation();

	const { id } = taskTarget;
	const item = backlog.value.find(task => task.id === taskId);
	if (!item) return;

	const target = gantt.getTask(id);
	const mode = target.type === "summary" ? "child" : "after";
	const summaryId =
		target.type === "summary"
			? target.id
			: gantt.getState().tasks.getSummaryId(target.id);
	const dateSource = summaryId ? gantt.getTask(summaryId) : target;

	const task = {
		text: item.text,
		type: item.type || "task",
		duration: item.type === "milestone" ? 0 : (item.duration ?? 1),
		start: dateSource.start,
	};

	gantt.exec("add-task", {
		task,
		target: id,
		mode,
	});
	backlog.value = backlog.value.filter(t => t.id !== taskId);
}
</script>

<template>
	<div class="demo">
		<div class="hint">
			Drag a backlog task onto a task (grid row or chart) to add it. Start
			date comes from the parent summary, or the drop target.
		</div>
		<div class="body">
			<div class="panel" @dragstart="onGridDragStart">
				<Grid
					:init="initTable"
					:data="backlog"
					:columns="backlogColumns"
					draggableRows
					:sizes="{ headerHeight: 72, rowHeight: 38 }"
				/>
			</div>
			<div
				class="gantt"
				@dragover="onDragOver"
				@dragleave="onDragLeave"
				@drop="onDrop"
			>
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
				/>
			</div>
		</div>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.demo {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.hint {
	flex-shrink: 0;
	padding: 8px 12px;
	color: var(--wx-color-font-alt);
	border-bottom: var(--wx-gantt-border);
}

.body {
	flex: 1;
	min-height: 0;
	display: flex;
}

.panel {
	flex: 0 0 240px;
	min-width: 0;
	min-height: 0;
	overflow: hidden;
	border-right: var(--wx-gantt-border);
	--wx-table-header-background: var(--wx-gantt-background);
	--wx-table-cell-border: none;
}

.panel :deep(.wx-table-box) {
	border: none;
}

.panel :deep(.wx-cell) {
	display: flex;
	align-items: center;
	padding-top: 0;
	padding-bottom: 0;
}

.panel :deep(.wx-row[draggable="true"]) {
	cursor: grab;
}

.gantt {
	flex: 1;
	min-width: 0;
	min-height: 0;
}

:global(.task-drop) {
	outline: 2px solid var(--wx-color-primary);
	outline-offset: -2px;
}
</style>
