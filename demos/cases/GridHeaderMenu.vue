<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, HeaderMenu } from "../../src/";
import { RadioButtonGroup } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const api = ref(null);

const selected = ref("all");
const options = [
	{ id: "all", label: "All" },
	{ id: "some", label: "Some" },
];
const hidable = { start: true, duration: true };

const columns = computed(() => (selected.value === "some" ? hidable : null));
</script>

<template>
	<div class="rows">
		<div class="bar">
			<div>Right-click the grid header and select visible columns</div>
			<div class="bar">
				<div class="label">Columns that can be hidden:</div>
				<RadioButtonGroup
					:options="options"
					v-model:value="selected"
					type="inline"
				/>
			</div>
		</div>
		<div class="gtcell">
			<HeaderMenu :api="api" :columns="columns">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
				/>
			</HeaderMenu>
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
	justify-content: space-between;
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
}
</style>
