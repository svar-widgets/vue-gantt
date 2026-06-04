<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src";
import { Slider, RadioButtonGroup, Field, Button } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const gridWidth = ref(400);
const displayMode = ref("chart");
const options = [
	{ id: "all", label: "All" },
	{ id: "grid", label: "Grid" },
	{ id: "chart", label: "Chart" },
];

const api = ref(null);
</script>

<template>
	<div class="rows">
		<div class="bar">
			<Field label="Display mode:" :position="'left'">
				<RadioButtonGroup
					:options="options"
					v-model:value="displayMode"
					type="inline"
				/>
			</Field>
			<Field :label="`Grid width: ${gridWidth}`" :position="'left'">
				<Slider v-model:value="gridWidth" :min="200" :max="600" :step="50" />
			</Field>
			<div>
				<Field label="For test only(action):" :position="'left'">
					<Button
						v-for="mode in ['all', 'grid', 'chart']"
						:key="mode"
						:onclick="() => api.exec('set-display-mode', { mode })"
						>{{ mode }}</Button
					>
				</Field>
			</div>
		</div>

		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				ref="api"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:displayMode="displayMode"
				:gridWidth="gridWidth"
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
	flex-direction: column;
	gap: 16px;
}
.bar :deep(.wx-field.wx-left) {
	align-items: center;
}
.bar :deep(.wx-field.wx-left > .wx-label) {
	width: 120px;
}
.gtcell {
	position: relative;
	height: 100%;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}
</style>
