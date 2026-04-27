<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src/";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

function init(ganttApi) {
	api.value = ganttApi;
	// show Editor on "add-task" action
	api.value.on("add-task", ({ id }) => {
		api.value.exec("show-editor", { id });
	});
}
</script>

<template>
	<Gantt
		:init="init"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
	<Editor :api="api" />
</template>
