<script setup>
defineOptions({ name: "GanttResourceNameCell" });

import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	row: {},
	column: {},
});

function getStyle(row, col) {
	return `justify-content:${col.align};padding-left: ${
		(row.$level - 1) * 20
	}px`;
}
</script>

<template>
	<div class="wx-content" :style="getStyle(props.row, props.column)">
		<template v-if="props.row.data">
			<i
				:class="`wx-toggle-icon wxi-menu-${props.row.open ? 'down' : 'right'}`"
				data-action="open-resource-row"
			></i>
		</template>
		<i v-else class="wx-toggle-placeholder"></i>
		<div class="wx-name">
			<component
				v-if="props.column._cell"
				:is="props.column._cell"
				:row="props.row"
				:column="props.column"
			/>
			<div v-else-if="props.row.role" class="wx-avatar-name">
				<Avatar :value="props.row" :size="28" />
				<span>{{ props.row.name }}</span>
			</div>
			<template v-else>{{ props.row.name }}</template>
		</div>
	</div>
</template>

<style scoped>
.wx-content {
	width: 100%;
	white-space: nowrap;
	display: flex;
	align-items: center;
}

.wx-toggle-icon {
	width: var(--wx-icon-size);
	min-width: 12px;
	height: 16px;
	line-height: 16px;
	margin: 0 5px;
	font-size: var(--wx-icon-size);
	color: var(--wx-gantt-icon-color);
	cursor: pointer;
	flex-shrink: 0;
}
.wx-toggle-placeholder {
	width: var(--wx-icon-size);
	height: 16px;
	line-height: 16px;
	margin: 0 5px;
	flex: 0 0 var(--wx-icon-size);
}

.wx-name,
.wx-avatar-name span {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.wx-avatar-name {
	display: flex;
	align-items: center;
	gap: 5px;
	& :deep(.wx-avatar-root) {
		flex: 0 0 auto;
	}
}
</style>
