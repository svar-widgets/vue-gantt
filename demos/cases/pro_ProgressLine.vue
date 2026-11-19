<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { RadioButtonGroup, DatePicker } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const MODE_OFF = 0;
const MODE_DATE = 1;

const mode = ref(MODE_DATE);
const date = ref(new Date("2026-04-04T00:00:00"));
const progressLine = computed(() =>
	mode.value === MODE_OFF ? false : date.value
);

const options = ["Off", "Custom date"].map((label, id) => ({
	id,
	label,
}));

const { tasks, links, scales } = getData();
</script>

<template>
	<div class="rows">
		<div class="bar">
			<RadioButtonGroup
				:options="options"
				type="inline"
				v-model:value="mode"
			/>
			<div>
				<DatePicker
					:disabled="mode !== MODE_DATE"
					v-model:value="date"
				/>
			</div>
		</div>
		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				:progressLine="progressLine"
				:tasks="tasks"
				:links="links"
				:scales="scales"
				:cellWidth="20"
				zoom
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
</style>
