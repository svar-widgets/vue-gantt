<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, getEditorItems } from "../../src";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

const bottomBar = {
	items: [
		{ comp: "button", type: "secondary", text: "Close", id: "close" },
		{ comp: "spacer" },
		{ comp: "button", type: "danger", text: "Delete", id: "delete" },
		{ comp: "button", type: "primary", text: "Save", id: "save" },
	],
};

const keys = [
	"text",
	"type",
	"start",
	"end",
	"duration",
	"progress",
	"details",
];
const defaultEditorItems = getEditorItems();
const items = keys.map(key => ({
	...defaultEditorItems.find(op => op.key === key),
}));
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
	<Editor
		:api="api"
		:items="items"
		:bottomBar="bottomBar"
		:topBar="false"
		placement="modal"
		:autoSave="false"
	/>
</template>
