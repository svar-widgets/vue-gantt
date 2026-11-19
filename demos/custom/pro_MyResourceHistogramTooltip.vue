<script setup>
import { computed } from "vue";
import { addDays, format, isSameDay } from "date-fns";

const props = defineProps({
	api: {},
	data: {},
});

const histogram = computed(() => props.data?.histogram);
const percent = computed(() => {
	const h = histogram.value;
	return h?.capacity ? Math.round((h.hours / h.capacity) * 100) : 0;
});
const range = computed(() => {
	const h = histogram.value;
	if (!h?.start || !h?.end) return "";

	const start = h.start;
	const end = addDays(h.end, -1);
	const mask = "MMM d, yyyy";

	return isSameDay(start, end)
		? format(start, mask)
		: `${format(start, mask)} - ${format(end, mask)}`;
});
</script>

<template>
	<div v-if="histogram" class="data">
		<div class="text">
			<span class="caption">Name:</span>
			{{ histogram.resource?.name }}
		</div>
		<div class="text">
			<span class="caption">Range:</span>
			{{ range }}
		</div>
		<div class="text">
			<span class="caption">Load:</span>
			{{ histogram.hours }}h
		</div>
		<div class="text">
			<span class="caption">Capacity:</span>
			{{ histogram.capacity }}h
		</div>
		<div class="text">
			<span class="caption">Utilization:</span>
			{{ percent }}%
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
	margin-bottom: 5px;
}

.text:last-child {
	margin-bottom: 0;
}

.caption {
	font-weight: 700;
}
</style>
