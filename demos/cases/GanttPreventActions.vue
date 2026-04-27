<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, defaultColumns } from "../../src/";
import { Field, Switch } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const data = getData();

const add = ref(true); // if false - cannot add and edit task
const drag = ref(true); // if false - cannot drag tasks on scale
const order = ref(true); // if false - cannot reorder tasks in grid
const newLink = ref(true); // if false - cannot create new links
const deleteLink = ref(true); // if false - cannot delete links
const progress = ref(true); // if false - cannot edit progress in chart
const api = ref(null);

function init(gApi) {
	api.value = gApi;

	api.value.intercept("drag-task", ev => {
		if (typeof ev.top !== "undefined") return order.value;
		return drag.value; //ev.width && ev.left
	});
}

const columns = computed(() =>
	add.value
		? defaultColumns
		: defaultColumns.filter(a => a.id != "add-task")
);
</script>

<template>
	<div class="rows">
		<div class="bar">
			<Field label="Adding tasks" position="left">
				<Switch v-model:value="add" />
			</Field>
			<Field label="Creating links" position="left">
				<Switch v-model:value="newLink" />
			</Field>
			<Field label="Deleting links" position="left">
				<Switch v-model:value="deleteLink" />
			</Field>
			<Field label="Dragging tasks" position="left">
				<Switch v-model:value="drag" />
			</Field>
			<Field label="Reordering tasks" position="left">
				<Switch v-model:value="order" />
			</Field>
			<Field label="Editing progress" position="left">
				<Switch v-model:value="progress" />
			</Field>
		</div>
		<div
			class="gantt"
			:class="{
				'hide-links': !newLink,
				'hide-delete-links': !deleteLink,
				'hide-drag': !drag,
				'hide-progress': !progress,
			}"
		>
			<Gantt
				:init="init"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:columns="columns"
			/>
		</div>
	</div>
</template>

<style scoped>
.rows {
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
	height: 100%;
}

.bar {
	display: flex;
	height: 60px;
	align-items: end;
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
	padding: 12px 0;
	--wx-label-width: 130px;
}

.bar:first-child {
	margin-left: 10px;
}

.gantt {
	height: 100%;
	position: relative;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}

.gantt.hide-progress > :deep(.wx-gantt .wx-bar .wx-progress-marker) {
	display: none;
}
.gantt.hide-links > :deep(.wx-gantt .wx-bar .wx-link) {
	display: none;
}
.gantt.hide-delete-links > :deep(.wx-gantt .wx-delete-link) {
	display: none;
}
.gantt.hide-delete-links > :deep(.wx-gantt .wx-line:hover) {
	cursor: default;
	stroke: var(--wx-gantt-link-color);
}
.gantt.hide-delete-links > :deep(.wx-gantt .wx-line.wx-line-selectable) {
	cursor: default;
}
.gantt.hide-drag > :deep(.wx-gantt .wx-bar) {
	cursor: pointer !important;
}
</style>
