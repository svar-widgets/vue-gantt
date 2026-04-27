<script setup>
import { ref } from "vue";
import { getData, complexScales } from "../data";
import { Gantt } from "../../src/";
import { Slider } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const cellWidth = ref(100);
const scaleHeight = ref(38);
const cellHeight = ref(36);
</script>

<template>
	<div class="rows">
		<div class="bar">
			<Slider label="Cell width" v-model:value="cellWidth" :min="20" :max="200" />
			<Slider label="Cell height" v-model:value="cellHeight" :min="20" :max="60" />
			<Slider
				label="Scale height"
				v-model:value="scaleHeight"
				:min="20"
				:max="60"
			/>
		</div>

		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="complexScales"
				:cellWidth="cellWidth"
				:cellHeight="cellHeight"
				:scaleHeight="scaleHeight"
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
}
.gtcell {
	position: relative;
	height: 100%;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}
</style>
