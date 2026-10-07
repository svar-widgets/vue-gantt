<script setup>
import { computed } from "vue";
import { addDays, format } from "date-fns";

const props = defineProps({
	api: {},
	data: {},
});

const mask = "dd-MM-yyyy";

// custom content gets the stored (exclusive) end, convert it here
const shownEnd = date =>
	props.api.getState().inclusiveEnd ? addDays(date, -1) : date;

const rows = computed(() => {
	const task = props.data?.task;
	if (!task) return [];
	const res = [{ label: "Name", value: task.text }];
	if (task.start)
		res.push({ label: "Start date", value: format(task.start, mask) });
	if (task.end)
		res.push({
			label: "End date",
			value: format(shownEnd(task.end), mask),
		});
	return res;
});
</script>

<template>
	<div v-if="data?.text" class="data">
		<div class="wx-row">{{ data.text }}</div>
	</div>
	<div v-else-if="data?.task" class="data">
		<div v-for="row in rows" :key="row.label" class="wx-row">
			<span class="wx-label">{{ row.label }}:</span>
			<span class="wx-value">{{ row.value }}</span>
		</div>
	</div>
</template>

<style scoped>
.data {
	white-space: nowrap;
	background-color: var(--wx-tooltip-background);
	padding: 6px 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.wx-row {
	display: flex;
	align-items: baseline;
	gap: 6px;
	font-family: var(--wx-font-family);
	font-size: 13px;
	color: var(--wx-color-primary-font);
}

.wx-label {
	font-weight: normal;
}

.wx-value {
	font-weight: 600;
}
</style>
