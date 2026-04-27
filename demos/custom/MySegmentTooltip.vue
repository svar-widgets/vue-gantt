<script setup>
import { computed } from "vue";
import { format } from "date-fns";

const props = defineProps({
	data: {},
	segmentIndex: {},
});

const mask = "yyyy.MM.dd";

const isSegment = computed(
	() => props.data?.segments && typeof props.segmentIndex === "number"
);
const values = computed(() =>
	isSegment.value ? props.data.segments[props.segmentIndex] : props.data
);
</script>

<template>
	<div v-if="data" class="data">
		<div class="text">
			<span class="caption">{{ data.type }}:</span>
			{{ data.text }}
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
