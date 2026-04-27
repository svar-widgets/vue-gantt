<script setup>
import { ref, inject } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor, getMenuOptions } from "../../src/";

const helpers = inject("wx-helpers");

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const data = getData();

const ids = ["cut-task", "copy-task", "paste-task", "delete-task"];
let arr = [{ id: "add-task:after", text: " Add below", icon: "wxi-plus" }];
arr = arr.concat(getMenuOptions().filter(op => ids.indexOf(op.id) >= 0));
arr.push({
	id: "my-action",
	text: "My action",
	icon: "wxi-empty",
	handler: actionHandler,
});

const options = ref(arr);

function actionHandler() {
	helpers.showNotice({ text: "'My action' clicked" });
}

function onClick({ context, action }) {
	if (!action.handler)
		helpers.showNotice({
			text: `'${action.id}' clicked for the '${context.id}' task`,
		});
}
</script>

<template>
	<ContextMenu :api="api" :options="options" :onclick="onClick">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
		/>
	</ContextMenu>
	<Editor :api="api" />
</template>
