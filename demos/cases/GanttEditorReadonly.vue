<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
	<Editor :api="api" readonly :topBar="true" />
</template>
