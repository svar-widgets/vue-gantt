<script setup>
import { computed } from "vue";
import { format } from "date-fns";

const props = defineProps({
	api: {},
	data: {},
});

const isSegment = computed(
	() => props.data?.task?.segments && typeof props.data.segmentIndex === "number"
);

const values = computed(() =>
	isSegment.value ? props.data.task.segments[props.data.segmentIndex] : props.data.task
);

const mask = "yyyy.MM.dd";
</script>

<template>
	<div v-if="data?.task" class="data">
		<div class="text">
			<span class="caption">{{ data.task.type }}:</span>
			{{ data.task.text }}
		</div>
		<div v-if="isSegment" class="text">
			<span class="caption">segment:</span>
			{{ values?.text || "" }}
		</div>
		<div class="text">
			<span class="caption">start:</span>
			{{ format(values.start, mask) }}
		</div>
		<div v-if="values.end" class="text">
			<span class="caption">end:</span>
			{{ format(values.end, mask) }}
		</div>
	</div>
	<div v-else-if="data?.link" class="data">
		<div class="text">
			<span class="caption">predecessor:</span>
			{{ api.getTask(data.link.source).text }}
		</div>
		<div class="text">
			<span class="caption">successor:</span>
			{{ api.getTask(data.link.target).text }}
		</div>
	</div>
</template>

<style scoped>
.data {
	white-space: nowrap;
	background-color: var(--wx-tooltip-background);
	padding: 3px 8px;
}

.text {
	font-family: var(--wx-font-family);
	color: var(--wx-color-primary-font);
	font-size: 13px;
	text-transform: capitalize;
	margin-bottom: 5px;
}

.text:last-child {
	margin-bottom: 0;
}

.caption {
	font-weight: 700;
}
</style>
