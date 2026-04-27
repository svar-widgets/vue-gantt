<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { Button, Locale } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

function scrollToStart() {
	api.value.exec("scroll-chart", { date: new Date() });
}
function scrollToEnd() {
	api.value.exec("scroll-chart", { date: new Date(2026, 5, 1) });
}
</script>

<template>
	<div class="demo">
		<Locale>
			<div class="bar">
				<Button :onclick="scrollToStart">Scroll to scale start</Button>
				<Button :onclick="scrollToEnd">Scroll to scale end</Button>
			</div>
		</Locale>

		<div class="gantt">
			<Gantt
				ref="api"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				zoom
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
	gap: 12px;
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
