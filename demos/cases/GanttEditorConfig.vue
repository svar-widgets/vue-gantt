<script setup>
import { ref, computed } from "vue";
import { getData, resources, assignments } from "../data";
import {
	Gantt,
	Editor,
	ContextMenu,
	getEditorItems,
	getEditorButtons,
} from "../../src";
import { getDefaultColumns } from "../../src/index.js";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

const toolbarRows = getEditorButtons({
	autoSave: false,
	resources: true,
	splitTasks: true,
});

const [closeBtn, spacer, deleteBtn, saveBtn] = toolbarRows[0].items;
const tabs = toolbarRows[1];

const columns = computed(() => getDefaultColumns({ resources: true }));

const topBar = {
	items: [tabs, spacer, deleteBtn, saveBtn, closeBtn],
};

const keys = [
	"text",
	"type",
	"start",
	"end",
	"duration",
	"progress",
	"details",
	"links",
	"resources",
	"segments",
];
const defaultEditorItems = computed(() =>
	getEditorItems({ resources: true, splitTasks: true })
);
const items = keys.map(key => ({
	...defaultEditorItems.value.find(op => op.key === key),
}));
</script>

<template>
	<div class="rows">
		<div class="bar">
			Demo uses "resources" and "split tasks" <span class="pro">PRO</span> features
		</div>
		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:columns="columns"
					:resources="resources"
					:assignments="assignments"
					:splitTasks="true"
				/>
			</ContextMenu>
			<Editor
				:api="api"
				:items="items"
				:topBar="topBar"
				css="myeditor"
				placement="modal"
				:autoSave="false"
			/>
		</div>
	</div>
</template>

<style scoped>
:global(.myeditor) {
	min-height: 660px;
}
.rows {
	height: 100%;
}
.bar {
	display: flex;
	align-items: center;
	height: 50px;
	border-bottom: var(--wx-gantt-border);
	padding: 12px;
}
.pro {
	color: var(--demo-framework-color);
	border: 1px solid var(--demo-framework-color);
	border-radius: 4px;
	padding: 0px 8px;
	font-size: 12px;
	font-weight: 600;
	margin: 0 4px;
	display: inline-flex;
}
.gtcell {
	height: calc(100% - 50px);
}
</style>
