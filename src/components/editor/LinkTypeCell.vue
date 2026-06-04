<script setup>
import { computed } from "vue";

const props = defineProps({
	row: {},
	column: {},
	data: {},
});

const label = computed(() => {
	if (props.data) return props.data.label;
	return props.column.options.find(op => op.id === props.row.type)?.label || "";
});
</script>

<template>
	<div class="wx-wrapper">
		<div class="wx-text">{{ label }}</div>
		<i v-if="row" class="wxi-angle-down"></i>
	</div>
</template>

<style scoped>
.wx-wrapper {
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	flex-wrap: nowrap;
}
.wx-text {
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}
</style>
