<script setup>
import { computed } from "vue";

const props = defineProps({
	column: {},
	row: {},
	cell: {},
});

const action = computed(() => props.column.id);

const icon = computed(() => {
	if (action.value.includes("edit")) return "wxi-edit";
	if (action.value.includes("add")) return "wxi-plus";
	if (action.value.includes("delete")) return "wxi-delete";
	return "";
});

const disabled = computed(() => {
	if (!action.value.includes("add")) return false;
	const gValue = props.row.$groupValue;
	return (
		(!props.row.$group && typeof gValue !== "undefined") ||
		(props.row.$group && typeof gValue === "undefined")
	);
});
</script>

<template>
	<div
		v-if="cell || icon"
		:style="{ textAlign: column.align }"
	>
		<i
			:class="['wx-action-icon', icon, { 'wx-disabled': disabled }]"
			:data-action="!disabled && action"
		></i>
	</div>
</template>

<style scoped>
.wx-action-icon.wx-disabled {
	color: var(--wx-color-font-disabled);
	cursor: default;
}
.wx-action-icon {
	cursor: pointer;
	font-size: var(--wx-icon-size);
	height: 16px;
	line-height: 16px;
	display: block;
	color: var(--wx-gantt-icon-color);
}
.wx-action-icon:not(.wx-disabled):hover {
	color: var(--wx-color-link);
}
</style>
