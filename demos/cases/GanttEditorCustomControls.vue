<script setup>
import { ref } from "vue";
import {
	Gantt,
	Editor,
	registerEditorItem,
	defaultTaskTypes,
	getEditorItems,
} from "../../src";
import { RadioButtonGroup } from "@svar-ui/vue-core";
import UsersCustomCombo from "../custom/UsersCustomCombo.vue";
import AvatarCell from "../custom/AvatarCell.vue";
import { getData, users } from "../data";

const props = defineProps({
	skinSettings: {},
});

registerEditorItem("radio", RadioButtonGroup);
registerEditorItem("custom-combo", UsersCustomCombo);

const defaultEditorItems = getEditorItems();

const items = defaultEditorItems.map(item => ({ ...item }));
items.splice(
	defaultEditorItems.findIndex(d => d.key === "type"),
	1,
	{
		key: "type",
		comp: "radio",
		label: "Type",
		options: defaultTaskTypes.map(o => ({
			...o,
			value: o.id,
		})),
		config: {
			type: "inline",
		},
	},
	{
		key: "assigned",
		comp: "custom-combo",
		label: "Assigned",
		options: users,
	}
);

items.forEach(d => {
	if (d.comp === "date") {
		d.config = {
			time: true,
		};
	}
});

const data = getData();
const api = ref(null);

const columns = [
	{ id: "text", header: "Task name", flexgrow: 1 },
	{ id: "assigned", header: "Assigned", width: 160, cell: AvatarCell },
	{ id: "start", header: "Start Date", width: 100 },
];
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
		lengthUnit="hour"
		:columns="columns"
		:gridWidth="480"
	/>
	<Editor :api="api" :items="items" />
</template>
