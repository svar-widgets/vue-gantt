<script setup>
defineOptions({ name: "GanttEditorConstraint", inheritAttrs: false });

import { computed, inject } from "vue";
import { RichSelect } from "@svar-ui/vue-core";
import { defaultConstraintTypes } from "@svar-ui/gantt-store";
import DateTimePicker from "./DateTimePicker.vue";

const props = defineProps({
	value: {},
	onchange: { type: Function },
	task: {},
	config: {},
});

const _ = inject("wx-i18n").getGroup("gantt");

const NONE = "none";

const options = [
	{ id: NONE, label: _("None") },
	...defaultConstraintTypes.map(t => ({ ...t, label: _(t.label) })),
];

const finishSide = type => type === "fnlt" || type === "fnet" || type === "mfo";

const type = computed(() => props.value?.type ?? NONE);

// a milestone has a single start date
function defaultDate(next) {
	if (finishSide(next) && props.task?.type !== "milestone")
		return props.task?.end ?? props.task?.start;
	return props.task?.start;
}

function handleTypeChange(ev) {
	const next = ev.value;
	if (next === NONE) return props.onchange?.({ value: null });

	const keep = props.value?.date && finishSide(next) === finishSide(type.value);
	props.onchange?.({
		value: { type: next, date: keep ? props.value.date : defaultDate(next) },
	});
}

function handleDateChange(ev) {
	if (type.value === NONE || !ev.value) return;
	props.onchange?.({ value: { type: type.value, date: ev.value } });
}
</script>

<template>
	<div class="wx-constraint-editor">
		<RichSelect :options="options" :value="type" :onchange="handleTypeChange" />
		<DateTimePicker
			v-if="type !== NONE"
			:value="value?.date"
			:onchange="handleDateChange"
			:format="config?.format"
		/>
	</div>
</template>

<style scoped>
.wx-constraint-editor {
	display: flex;
	flex-direction: column;
	gap: 12px;
}
</style>
