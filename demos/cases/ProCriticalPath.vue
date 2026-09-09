<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";
import { DatePicker, Field, Locale, RichSelect } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("critical");

const api = ref(null);
const pathMode = ref("flexible");
const projectStart = ref(new Date(2026, 3, 2));
const projectEnd = ref(new Date(2026, 3, 12));

function init(ganttApi) {
	api.value = ganttApi;
}
</script>

<template>
	<div class="demo">
		<Locale>
			<div class="bar">
				<Field label="Mode" position="left">
					<RichSelect
						:options="[
							{ id: 'flexible', label: 'Flexible' },
							{ id: 'strict', label: 'Strict' },
						]"
						v-model:value="pathMode"
					/>
				</Field>
				<Field label="Project start" position="left">
					<DatePicker v-model:value="projectStart" />
				</Field>
				<Field label="Project end" position="left">
					<DatePicker v-model:value="projectEnd" />
				</Field>
			</div>
		</Locale>
		<Gantt
			v-bind="skinSettings"
			:init="init"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
			:criticalPath="{ type: pathMode }"
			:projectStart="projectStart"
			:projectEnd="projectEnd"
		/>
	</div>
	<Editor :api="api" />
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.bar {
	display: flex;
	justify-content: center;
	padding: 12px;
	border-bottom: var(--wx-gantt-border);
}
</style>
