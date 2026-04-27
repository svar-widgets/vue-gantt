<script setup>
import { ref, watchEffect } from "vue";
import { getGeneratedData, complexScales } from "../data";
import { Gantt } from "../../src/";
import { Button } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const count = 10000;
const years = 3;
const data = getGeneratedData("", count, years);

const start = ref(null);
const outArea = ref(null);

watchEffect(() => {
	if (start.value && outArea.value)
		outArea.value.innerHTML = new Date() - start.value;
});
</script>

<template>
	<div class="rows">
		<div class="row">
			<template v-if="start">
				10 000 tasks (
				{{ years }}
				years ) rendered in
				<span ref="outArea"></span>
				ms
			</template>
			<template v-else>
				<Button
					type="primary"
					:onclick="() => (start = new Date())"
				>
					Press me to render Gantt chart with 10 000 tasks
				</Button>
			</template>
		</div>

		<div v-if="start" class="gtcell">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="complexScales"
			/>
		</div>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.row {
	padding: 13px;
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
}

.gtcell {
	position: relative;
	height: 100%;
	min-height: 0;
	border-top: var(--wx-gantt-border);
	margin-bottom: 10px;
}

.gtcell:last-of-type {
	margin-bottom: 0;
}
</style>
