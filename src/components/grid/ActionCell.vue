<script setup>
import { computed } from "vue";

const props = defineProps({
	column: {},
	cell: {},
});

const action = computed(() => props.column.id);
</script>

<template>
	<div
		v-if="cell || column.id === 'add-task'"
		:style="{ textAlign: column.align }"
	>
		<i class="wx-action-icon wxi-plus" :data-action="action"></i>
	</div>
</template>

<style scoped>
.wx-action-icon {
	cursor: pointer;
	font-size: var(--wx-icon-size);
	height: 16px;
	line-height: 16px;
	display: block;
	color: var(--wx-gantt-icon-color);
}
.wx-action-icon:hover {
	color: var(--wx-color-link);
}
</style>
