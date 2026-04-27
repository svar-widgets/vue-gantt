<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor } from "../../src/";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const data = getData();

// show menu for certain tasks
function resolver(id) {
	return id > 2;
}

// filter menu options
function filter(option, task) {
	const type = task.type;
	if (option.id) {
		const ids = option.id.toString().split(":");
		if (type == "milestone" && ids[0] == "add-task")
			return ids[1] != "child";
	}

	return true;
}
</script>

<template>
	<ContextMenu :api="api" :resolver="resolver" :filter="filter">
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
