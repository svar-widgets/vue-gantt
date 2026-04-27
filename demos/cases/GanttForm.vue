<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, defaultTaskTypes } from "../../src/";
import Form from "../custom/Form.vue";

const props = defineProps(["skinSettings"]);

const data = getData();
const taskTypes = defaultTaskTypes;

const task = ref(null);
const gApi = ref(null);

function formAction({ action, data }) {
	switch (action) {
		case "close-form":
			task.value = null;
			break;
		default:
			gApi.value.exec(action, data);
			break;
	}
}

function init(api) {
	api.intercept("show-editor", ({ id }) => {
		if (id) task.value = api.getState().tasks.byId(id);
		return false;
	});
	gApi.value = api;
}
</script>

<template>
	<div class="wrapper">
		<Gantt
			:init="init"
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
		/>

		<Form
			v-if="task"
			:task="task"
			:taskTypes="taskTypes"
			:onaction="formAction"
		/>
	</div>
</template>

<style scoped>
.wrapper {
	height: 100%;
	overflow: hidden;
}
</style>
