<script setup>
defineOptions({ name: "GanttChartRollups" });

import { inject } from "vue";
import { setID } from "@svar-ui/lib-dom";
import { subscribe } from "@svar-ui/lib-vue";

const props = defineProps({
	rollup: {},
	parent: {},
});

const api = inject("gantt-store");
const { inactiveTasks } = api.getReactiveState();
const _inactiveTasks = subscribe(inactiveTasks);
</script>

<template>
	<div
		:data-rollup-id="setID(rollup.id)"
		:class="[
			`wx-rollup wx-${rollup.type}-rollup`,
			{ 'wx-inactive': _inactiveTasks && parent.inactive },
		]"
		:style="`left:${rollup.$x_rollup}px;top:${parent.$y + parent.$h + rollup.$y_rollup_relative}px;width:${rollup.$w_rollup}px;height:${rollup.$h_rollup}px;`"
	></div>
</template>

<style scoped>
.wx-rollup {
	position: absolute;
	z-index: 1;
	border: 1px solid var(--wx-gantt-marker-color);
	border-color: var(--wx-background);
	border-radius: var(--wx-gantt-baseline-border-radius);
	opacity: 0.75;

	background-color: var(
		--wx-gantt-task-color
	); /* fallback in case type has no matching class provided */
}
.wx-task-rollup {
	background-color: var(--wx-gantt-task-color);
}
.wx-summary-rollup {
	background-color: var(--wx-gantt-summary-color);
}
.wx-milestone-rollup {
	background-color: var(--wx-gantt-milestone-color);
	transform: rotate(45deg) scale(0.75);
	border-radius: var(--wx-gantt-milestone-border-radius);
}
.wx-rollup.wx-inactive {
	background-color: var(--wx-gantt-inactive-color);
}
</style>
