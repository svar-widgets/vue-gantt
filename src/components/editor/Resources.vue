<script setup>
defineOptions({ name: "GanttEditorResources", inheritAttrs: false });

import { inject, ref, computed, onUnmounted } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { Button } from "@svar-ui/vue-core";

import GridSection from "./GridSection.vue";
import ActionCell from "../grid/ActionCell.vue";
import ResourcesEditorCell from "./ResourcesEditorCell.vue";
import { tempID } from "@svar-ui/lib-state";

const locale = inject("wx-i18n");
const _ = locale.getGroup("gantt");

const props = defineProps({
	api: {},
	autoSave: {},
	onextchange: { type: Function },
	taskAssignments: { default: null },
});

const onchange = props.onextchange;

const { activeTask, resources, _assignments, assignments } =
	props.api.getReactiveState();

const $activeTask = subscribe(activeTask);
const $resources = subscribe(resources);
const $assignments = subscribe(assignments);

const gridApi = ref(undefined);
const newRowId = ref(null);
const taskResources = ref([]);

function subscribeHandler(taskid) {
	taskResources.value =
		props.taskAssignments ||
		props.api.getTaskResources(taskid).map(r => {
			return { ...r, resource: r.id, id: r.assignmentId };
		});
}

const unsubscribers = [
	activeTask.subscribe(v => {
		subscribeHandler(v);
	}),
	_assignments.subscribe(() => subscribeHandler($activeTask.value)),
];

onUnmounted(() => {
	for (const unsub of unsubscribers) unsub();
});

const allOptions = computed(() => {
	const items = [];
	$resources.value?.eachChild(item => {
		if (!item.data) items.push({ ...item, label: item.name });
	}, 0);
	return items;
});

const filteredOptions = computed(() => {
	return allOptions.value.filter(
		r => !taskResources.value.find(a => a.resource === r.id)
	);
});

function getActionData(evData) {
	return {
		view: "resources",
		event: evData,
		values: {
			taskAssignments: taskResources.value,
		},
	};
}

function deleteAssignment(id) {
	gridApi.value.exec("close-editor", { ignore: true });
	if (props.autoSave) {
		props.api.exec("delete-assignment", { id });
	} else {
		taskResources.value = taskResources.value.filter(a => a.id !== id);
		onchange &&
			onchange(
				getActionData({
					id,
					action: "delete-assignment",
					data: { id },
				})
			);
	}
	newRowId.value = null;
}

function addAssignment(id, assignment) {
	const activeTaskId = $activeTask.value;
	assignment = { ...assignment, units: 100, task: activeTaskId, id };
	const item = { assignment };
	if (props.autoSave) {
		props.api.exec("add-assignment", item);
	} else {
		const r = $resources.value?.byId(assignment.resource);
		taskResources.value = [...taskResources.value, { ...r, ...assignment }];
		onchange &&
			onchange(
				getActionData({
					id: r.id,
					action: "add-assignment",
					data: item,
				})
			);
	}
}

function getRowOptions(row) {
	if (row.id === newRowId.value) return filteredOptions.value;
	const rowOption = allOptions.value.find(op => op.id === row.resource);
	return [rowOption].concat(filteredOptions.value);
}

function updateAssignment(id, assignment) {
	let item = $assignments.value?.byId(id);
	if (!item) item = taskResources.value.find(a => a.id === id);
	const update = {
		id,
		assignment: { units: item.units || 100, ...assignment, id },
	};

	if (props.autoSave) {
		props.api.exec("update-assignment", update);
	} else {
		if (assignment.resource && assignment.resource !== item.resource) {
			const r = $resources.value?.byId(assignment.resource);
			assignment = { ...r, ...update.assignment };
		}

		taskResources.value = taskResources.value.map(item =>
			item.id === id ? { ...item, ...assignment } : item
		);
		onchange &&
			onchange(
				getActionData({
					id,
					action: "update-assignment",
					data: update,
				})
			);
	}
}

const columns = computed(() => {
	void filteredOptions.value;
	return [
		{
			id: "resource",
			header: _("Resource"),
			cell: ResourcesEditorCell,
			type: "string",
			flexgrow: 3,
			editor: row => {
				return {
					type: "combo",
					config: {
						options: getRowOptions(row),
						cell: ResourcesEditorCell,
					},
				};
			},
			options: allOptions.value,
		},
		{
			id: "units",
			header: _("Units"),
			flexgrow: 1,
			editor: {
				type: "text",
				config: { type: "number" },
			},
			template: v => `${v}%`,
		},
		{
			id: "delete",
			header: "",
			cell: ActionCell,
			width: 50,
			align: "center",
		},
	];
});

function onAction(id, action) {
	if (id && action === "delete") deleteAssignment(id);
}

function onEdit(id, column, value) {
	if (column === "units") updateAssignment(id, { units: value * 1 });
	else if (column === "resource") {
		const assignmentData = { resource: value };
		if (id === newRowId.value) {
			addAssignment(id, assignmentData);
		} else {
			updateAssignment(id, assignmentData);
		}
	}

	newRowId.value = null;
}

function oninit(tApi) {
	gridApi.value = tApi;
	// delete a new empty row if an editor closed without resource selection
	gridApi.value.on("close-editor", () => {
		if (newRowId.value) {
			gridApi.value.exec("delete-row", { id: newRowId.value });
			newRowId.value = null;
		}
	});
}

const addingDisabled = computed(() => newRowId.value || !filteredOptions.value.length);

let pending = false;
function onAddClick() {
	gridApi.value?.exec("close-editor", { ignore: true });
	if (!pending) {
		pending = true;
		newRowId.value = tempID();
		requestAnimationFrame(() => {
			addRow(newRowId.value);
			pending = false;
		});
	}
}

function addRow(id) {
	gridApi.value.exec("add-row", { id, row: { units: 100 } });
	setTimeout(() => {
		gridApi.value.exec("open-editor", { id, column: "resource" });
	});
}
</script>

<template>
	<div class="wx-section">
		<GridSection
			v-if="taskResources.length || newRowId"
			:oninit="oninit"
			:columns="columns"
			:onaction="onAction"
			:onedit="onEdit"
			:data="taskResources"
			:sizes="{ rowHeight: 52 }"
		/>
		<div v-else class="wx-nodata">{{ _("No assignments") }}</div>
		<div class="wx-button-wrapper">
			<Button
				:disabled="addingDisabled"
				icon="wxi-plus"
				css="wx-button"
				:onclick="onAddClick"
			>
				{{ _("Add resource") }}
			</Button>
		</div>
	</div>
</template>

<style scoped>
.wx-section {
	margin-bottom: 10px;
}

.wx-nodata {
	color: var(--wx-gantt-icon-color);
	margin-top: 8px;
}
.wx-button-wrapper {
	margin-top: 12px;
	width: 100%;
}
.wx-button-wrapper :deep(.wx-button) {
	width: 100% !important;
	background-color: inherit;
	border: var(--wx-table-cell-border);
}
</style>
