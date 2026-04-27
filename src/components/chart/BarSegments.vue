<script setup>
const props = defineProps({
	task: {},
	type: {},
});

function segmentStyle(i) {
	const s = props.task.segments[i];
	return `left:${s.$x}px;top:0px;width:${s.$w}px;height:100%;`;
}

function getSegProgress(segmentIndex) {
	if (!props.task.progress) return 0;

	const progress = (props.task.duration * props.task.progress) / 100;
	const segments = props.task.segments;
	let duration = 0,
		i = 0,
		result = null;
	do {
		const s = segments[i];
		if (i === segmentIndex) {
			if (duration > progress) result = 0;
			else
				result =
					Math.min((progress - duration) / s.duration, 1) * 100;
		}
		duration += s.duration;
		i++;
	} while (result === null && i < segments.length);
	return result || 0;
}
</script>

<template>
	<div class="wx-segments">
		<div
			v-for="(seg, i) in task.segments"
			:key="i"
			:class="['wx-segment', 'wx-bar', `wx-${type}`]"
			:data-segment="i"
			:style="segmentStyle(i)"
		>
			<div v-if="task.progress" class="wx-progress-wrapper">
				<div
					class="wx-progress-percent"
					:style="`width:${getSegProgress(i)}%`"
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
