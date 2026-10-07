<script setup>
import { ref } from "vue";
import { locateID } from "@svar-ui/lib-dom";
import { Grid } from "@svar-ui/vue-grid";
import { getData, resources, assignments } from "../data";
import { Gantt, Editor, locateTask } from "../../src/";
import ResourceNameCell from "../custom/ResourceNameCell.vue";

const props = defineProps(["skinSettings"]);

const MIME = "application/x-svar-gantt-resource";
const data = getData();
const leafResources = resources.filter(r => r.parent);

const resourceColumns = [
	{
		id: "name",
		header: "Resources",
		flexgrow: 1,
		cell: ResourceNameCell,
	},
];

const api = ref(null);
const tableApi = ref(null);
let dropTarget = null;

function clearDropTarget() {
	if (dropTarget) {
		dropTarget.classList.remove("resource-drop");
		dropTarget = null;
	}
}

function isResourceDrag(e) {
	return Array.from(e.dataTransfer?.types || []).includes(MIME);
}

function onGridDragStart(e) {
	const id = locateID(e);
	if (!id || !tableApi.value) return;

	const row = tableApi.value.getRow(id);
	if (!row) return;

	e.dataTransfer.setData(MIME, JSON.stringify(row.id));
	e.dataTransfer.setData("text/plain", row.name);
	e.dataTransfer.effectAllowed = "copy";
}

function onDragOver(e) {
	if (!isResourceDrag(e)) return;

	const taskTarget = locateTask(e, api.value);
	if (!taskTarget || !api.value) {
		clearDropTarget();
		return;
	}

	const { id, node } = taskTarget;
	const task = api.value.getTask(id);
	if (!task || task.type === "summary") {
		clearDropTarget();
		return;
	}

	e.preventDefault();
	e.dataTransfer.dropEffect = "copy";

	if (dropTarget !== node) {
		clearDropTarget();
		node.classList.add("resource-drop");
		dropTarget = node;
	}
}

function onDragLeave(e) {
	if (!e.currentTarget.contains(e.relatedTarget)) {
		clearDropTarget();
	}
}

function onDrop(e) {
	if (!isResourceDrag(e) || !api.value) return;

	const resourceId = JSON.parse(e.dataTransfer.getData(MIME));
	const taskTarget = locateTask(e, api.value);
	clearDropTarget();

	if (resourceId == null || !taskTarget) return;

	e.preventDefault();
	e.stopPropagation();

	const { id } = taskTarget;
	const task = api.value.getTask(id);
	const resource = api.value.getResource(resourceId);
	if (!task || task.type === "summary" || !resource) return;

	api.value.exec("add-assignment", {
		assignment: {
			task: id,
			resource: resourceId,
		},
	});
}
</script>

<template>
	<div class="demo">
		<div class="hint">
			Drag a resource onto a task (grid row or chart) to assign it.
			Summaries are not valid targets.
		</div>
		<div class="body">
			<div class="panel" @dragstart="onGridDragStart">
				<Grid
					ref="tableApi"
					:data="leafResources"
					:columns="resourceColumns"
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
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:resources="resources"
					:assignments="assignments"
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

:global(.resource-drop) {
	outline: 2px solid var(--wx-color-primary);
	outline-offset: -2px;
}
</style>
