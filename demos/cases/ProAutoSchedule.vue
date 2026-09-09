<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src";
import { DatePicker, Field } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const projectStart = ref(new Date(2026, 3, 2));

const data = getData();
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Field label="Project start" position="left">
				<DatePicker v-model:value="projectStart" />
			</Field>
		</div>
		<div class="gantt">
			<Editor :api="api" />
			<ContextMenu :api="api">
				<Gantt
					v-bind="skinSettings"
					ref="api"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:schedule="{ auto: true }"
					:projectStart="projectStart"
					:projectEnd="new Date(2026, 5, 2)"
				/>
			</ContextMenu>
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
	align-items: center;
	padding: 12px;
	gap: 20px;
	border-bottom: var(--wx-gantt-border);
}

.gantt {
	position: relative;
	height: 100%;
	overflow: hidden;
}
:global(.bar .wx-field.wx-left) {
	margin-bottom: 0px;
}
</style>
