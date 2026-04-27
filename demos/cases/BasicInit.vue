<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
</script>

<template>
	<Gantt
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
</template>
