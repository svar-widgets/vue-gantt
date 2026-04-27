<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor } from "../../src/";
import { Button } from "@svar-ui/vue-core";
import { subscribeLater } from "@svar-ui/lib-vue";

const props = defineProps({
	skinSettings: {},
});

const api = ref(null);
const menu = ref(null);
const data = getData();

const selectedSub = subscribeLater(
	() => api.value?.getReactiveState()?.selected
);

const resolver = () => {
	const sel = selectedSub();
	const id = sel.value?.length ? sel.value[sel.value.length - 1] : null;
	return id ? api.value.getTask(id) : null;
};
</script>

<template>
	<ContextMenu :api="api" :resolver="resolver" at="right" ref="menu" />

	<div class="rows">
		<div class="bar">
			<Button
				type="primary"
				:onclick="ev => menu.show(ev)"
			>Task action</Button>
		</div>

		<div class="gtcell">
			<Gantt
				ref="api"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
			/>
			<Editor :api="api" />
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

.bar {
	padding: 12px;
}
.gtcell {
	position: relative;
	height: calc(100% - 56px);
	border-top: var(--wx-gantt-border);
}
</style>
