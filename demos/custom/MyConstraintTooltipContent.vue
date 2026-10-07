<script setup>
import { computed } from "vue";
import { dateToString } from "@svar-ui/lib-dom";
import { defaultConstraintTypes } from "@svar-ui/gantt-store";

const props = defineProps({
	api: {},
	data: {},
});

const dateFormat = dateToString("%d.%m.%Y");
const constraintLabels = Object.fromEntries(
	defaultConstraintTypes.map(t => [t.id, t.label])
);

function constraintLabel(type) {
	return constraintLabels[type] || type;
}

function constraintRow(c) {
	return {
		label: constraintLabel(c.type),
		value: c.date ? dateFormat(c.date) : "",
	};
}

const content = computed(() => {
	const data = props.data;
	const rows = [];
	let violated = false;

	if (data?.task) {
		const task = data.task;
		const c = task.constraint;
		rows.push({ label: "Name", value: task.text });
		if (task.start)
			rows.push({ label: "Start date", value: dateFormat(task.start) });
		if (task.end)
			rows.push({ label: "End date", value: dateFormat(task.end) });
		if (c?.type) {
			rows.push(constraintRow(c));
			violated = !!data.violated;
		}
	} else if (data?.link) {
		const link = data.link;
		rows.push({
			label: "Predecessors",
			value: props.api.getTask(link.source).text,
		});
		rows.push({
			label: "Successors",
			value: props.api.getTask(link.target).text,
		});
	} else if (data?.deadline) {
		const deadlineTask = data.deadline;
		if (deadlineTask.deadline)
			rows.push({
				label: "Deadline",
				value: dateFormat(deadlineTask.deadline),
			});
	} else if (data?.constraint) {
		const c = data.constraint.constraint;
		if (c?.type) rows.push(constraintRow(c));
		violated = !!data.violated;
	}

	return { rows, violated };
});

const visible = computed(
	() =>
		!!(
			props.data?.task ||
			props.data?.link ||
			props.data?.deadline ||
			props.data?.constraint
		)
);
</script>

<template>
	<div v-if="data?.text" class="data">
		<div class="wx-row">{{ data.text }}</div>
	</div>
	<div v-else-if="visible" class="data">
		<div v-for="row in content.rows" :key="row.label" class="wx-row">
			<span class="wx-label">{{ row.label }}:</span>
			<span class="wx-value">{{ row.value }}</span>
		</div>
		<div v-if="content.violated" class="wx-violated-row">Violated</div>
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

.wx-violated-row {
	font-family: var(--wx-font-family);
	font-size: 13px;
	font-weight: normal;
	color: var(--wx-gantt-constraint-violation-color);
}
</style>
