<script setup>
import { inject, computed } from "vue";
import { setID } from "@svar-ui/lib-dom";
import { subscribe } from "@svar-ui/lib-vue";

const props = defineProps({
	row: {},
	column: {},
});

const api = inject("gantt-store");
const { conflicts } = api.getReactiveState();
const $conflicts = subscribe(conflicts);

const taskId = computed(() => props.row.$id || props.row.id);
const isViolated = computed(() =>
	$conflicts.value?.some(
		c => c.type === "constraint" && c.task === taskId.value
	)
);

const constraint = computed(
	() => props.row.constraint ?? props.row[props.column.id]
);
const text = computed(() =>
	constraint.value?.type ? constraint.value.type.toUpperCase() : ""
);
</script>

<template>
	<span
		v-if="text"
		class="wx-constraint-cell"
		:data-constraint-id="setID(row.id)"
	>
		<i v-if="isViolated" class="wxi-warning"></i>
		<span class="wx-label">{{ text }}</span>
	</span>
</template>

<style scoped>
.wx-constraint-cell {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	min-width: 0;
	max-width: 100%;
}
.wx-label {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.wxi-warning {
	font-size: 14px;
	color: var(--wx-gantt-constraint-violation-color);
}
</style>
