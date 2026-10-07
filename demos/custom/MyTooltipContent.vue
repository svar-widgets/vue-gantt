<script setup>
import { format } from "date-fns";

const props = defineProps({
	api: {},
	data: {},
});

const mask = "yyyy.MM.dd";

function dateRows(item) {
	const rows = [{ label: "Name", value: item.text }];
	if (item.start)
		rows.push({ label: "Start date", value: format(item.start, mask) });
	if (item.end)
		rows.push({ label: "End date", value: format(item.end, mask) });
	return rows;
}

function linkRows(link) {
	return [
		{ label: "Predecessors", value: props.api.getTask(link.source).text },
		{ label: "Successors", value: props.api.getTask(link.target).text },
	];
}
</script>

<template>
	<div v-if="data?.text" class="data">
		<div class="wx-row">{{ data.text }}</div>
	</div>
	<div v-else-if="data?.task" class="data">
		<div v-for="row in dateRows(data.task)" :key="row.label" class="wx-row">
			<span class="wx-label">{{ row.label }}:</span>
			<span class="wx-value">{{ row.value }}</span>
		</div>
	</div>
	<div v-else-if="data?.link" class="data">
		<div v-for="row in linkRows(data.link)" :key="row.label" class="wx-row">
			<span class="wx-label">{{ row.label }}:</span>
			<span class="wx-value">{{ row.value }}</span>
		</div>
	</div>
	<div v-else-if="data?.rollup" class="data">
		<div
			v-for="row in dateRows(data.rollup)"
			:key="row.label"
			class="wx-row"
		>
			<span class="wx-label">{{ row.label }}:</span>
			<span class="wx-value">{{ row.value }}</span>
		</div>
	</div>
	<div v-else-if="data?.sCurve" class="data">
		<div class="wx-row">
			<span class="wx-label">Start date:</span>
			<span class="wx-value">{{ format(data.sCurve.date, mask) }}</span>
		</div>
		<div
			v-for="line in data.sCurve.lines"
			:key="line.line"
			class="wx-row"
			:class="{ hovered: line.line === data.sCurve.hovered.line }"
		>
			<span class="wx-label">{{ line.type }} by {{ line.metric }}:</span>
			<span class="wx-value">{{ Math.round(line.value) }}%</span>
		</div>
	</div>
	<div v-else-if="data?.deadline" class="data">
		<div class="text">
			<span class="caption">deadline:</span>
			{{ format(data.deadline.deadline, mask) }}
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

.hovered .wx-value {
	color: #ffd88a;
}
</style>
