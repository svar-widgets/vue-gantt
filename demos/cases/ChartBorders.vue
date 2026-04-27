<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { RadioButtonGroup } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const cellBorders = ref("full");

const options = [
	{ id: "full", label: "Full" },
	{ id: "column", label: "Column" },
];
</script>

<template>
	<div class="rows">
		<div class="bar">
			<div class="label">Chart cell borders</div>
			<RadioButtonGroup :options="options" v-model:value="cellBorders" type="inline" />
		</div>

		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:cellBorders="cellBorders"
			/>
		</div>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	background: var(--wx-background);
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 10px;

	display: flex;
	align-items: center;
}
.gtcell {
	position: relative;
	height: 100%;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}
.label {
	padding-right: 20px;
	font-size: var(--wx-font-size);
	font-weight: var(--wx-label-font-weight);
}
</style>
