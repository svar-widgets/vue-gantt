<script setup>
import { getData, complexScales } from "../data";
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
		:scales="complexScales"
		:start="new Date(2026, 3, 1)"
		:end="new Date(2026, 4, 12)"
		:cellWidth="60"
	/>
</template>
