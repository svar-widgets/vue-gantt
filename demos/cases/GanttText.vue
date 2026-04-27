<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import MyTaskContent from "../custom/MyTaskContent.vue";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

function doClick(ev) {
	api.value.exec("update-task", {
		id: ev.id,
		task: {
			clicked: ev.clicked,
		},
	});
}
</script>

<template>
	<Gantt
		v-bind="skinSettings"
		ref="api"
		:oncustomclick="doClick"
		:taskTemplate="MyTaskContent"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
</template>
