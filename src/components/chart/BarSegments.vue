<script setup>
import { inject } from "vue";
import { getSegmentProgress } from "@svar-ui/gantt-store";
import { subscribe } from "@svar-ui/lib-vue";

const props = defineProps({
	task: {},
	type: {},
});

const api = inject("gantt-store");
const { inactiveTasks } = api.getReactiveState();
const $inactiveTasks = subscribe(inactiveTasks);

function segmentStyle(i) {
	const s = props.task.segments[i];
	return `left:${s.$x}px;top:0px;width:${s.$w}px;height:100%;`;
}
</script>

<template>
	<div class="wx-segments">
		<div
			v-for="(seg, i) in task.segments"
			:key="i"
			:class="[
				'wx-segment',
				'wx-bar',
				`wx-${type}`,
				{ 'wx-inactive': $inactiveTasks && task.inactive },
			]"
			:data-segment="i"
			:style="segmentStyle(i)"
		>
			<div v-if="task.progress" class="wx-progress-wrapper">
				<div
					class="wx-progress-percent"
					:style="`width:${getSegmentProgress(task, i)}%`"
				></div>
			</div>
			<div class="wx-content">
				{{ seg.text || "" }}
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-segments {
	position: relative;
	width: 100%;
	height: 100%;
}
.wx-segment {
	height: 100%;
}
.wx-segments::before {
	content: "";
	position: absolute;
	top: 50%;
	left: 0;
	width: 100%;
	height: 0;
	border-top: 1px dashed #7f7f7f;
	transform: translateY(-50%);
}

.wx-progress-percent {
	background-color: var(--wx-gantt-task-fill-color);
}
</style>
