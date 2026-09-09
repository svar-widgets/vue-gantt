<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("day", { unscheduledTasks: true });

const api = ref(null);
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
		:unscheduledTasks="true"
	/>
	<Editor :api="api" />
</template>
