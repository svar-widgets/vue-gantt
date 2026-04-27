<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { DatePicker, Field, Locale, Switch } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const start = ref(new Date(2026, 3, 5));
const end = ref(new Date(2026, 4, 1));
const autoScale = ref(false);
</script>

<template>
	<div class="demo">
		<Locale>
			<div class="bar">
				<Field label="Start" position="left">
					<DatePicker v-model:value="start" />
				</Field>
				<Field label="End" position="left">
					<DatePicker v-model:value="end" />
				</Field>
				<Field label="autoScale" position="left">
					<div class="input">
						<Switch v-model:value="autoScale" />
					</div>
				</Field>
			</div>
		</Locale>

		<div class="gantt">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:autoScale="autoScale"
				zoom
				:start="start"
				:end="end"
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
	display: flex;
	padding: 12px;
	border-bottom: var(--wx-gantt-border);
}

.gantt {
	position: relative;
	height: 100%;
	overflow: hidden;
}
.input {
	margin: 4px;
}
</style>
