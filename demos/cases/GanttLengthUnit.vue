<script setup>
import { ref, computed } from "vue";
import { getData, bigScales } from "../data";
import { Gantt } from "../../src/";
import { Select } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const data = getData();
const options = [
	{ id: "minute", label: "Minute" },
	{ id: "hour", label: "Hour" },
	{ id: "day", label: "Day" },
	{ id: "week", label: "Week" },
	{ id: "month", label: "Month" },
	{ id: "quarter", label: "Quarter" },
];

const lengthUnit = ref("day");

const scales = computed(() => {
	let scales;
	switch (lengthUnit.value) {
		case "minute":
			scales = [
				{ unit: "day", step: 1, format: "%M %j" },
				{ unit: "hour", step: 1, format: "%H:%i" },
			];
			break;
		case "hour":
			scales = [
				{ unit: "month", step: 1, format: "%M" },
				{ unit: "day", step: 1, format: "%M %j" },
			];
			break;
		case "day":
			scales = [
				{ unit: "month", step: 1, format: "%M" },
				{ unit: "week", step: 1, format: "%w" },
			];
			break;
		case "week":
			scales = [
				{ unit: "year", step: 1, format: "%Y" },
				{ unit: "month", step: 1, format: "%M" },
			];
			break;
		case "month":
			scales = [
				{ unit: "year", step: 1, format: "%Y" },
				{ unit: "quarter", step: 1, format: "%Q" },
			];
			break;
		case "quarter":
			scales = [{ unit: "year", step: 1, format: "%Y" }];
			break;
		default:
			scales = bigScales;
	}
	return scales;
});
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Select v-model:value="lengthUnit" :options="options" />
		</div>
		<div class="gantt">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="scales"
				:lengthUnit="lengthUnit"
				:cellWidth="300"
			/>
		</div>
	</div>
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.bar {
	padding: 20px;
	background-color: var(--wx-background);
	border: var(--wx-border);

	--wx-input-width: 100px;
}

.gantt {
	position: relative;
	height: calc(100% - 74px);
}
</style>
