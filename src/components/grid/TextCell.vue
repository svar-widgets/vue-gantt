<script setup>
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
	<div class="wx-content" :style="getStyle(row, column)">
		<template v-if="!row.$empty && (row.data || row.lazy)">
			<i
				:class="
					'wx-toggle-icon wxi-menu-' +
					(row.open ? 'down' : 'right')
				"
				data-action="open-task"
			></i>
		</template>
		<i v-else class="wx-toggle-placeholder"></i>
		<div class="wx-text">
			<component
				v-if="column._cell"
				:is="column._cell"
				:row="row"
				:column="column"
			/>
			<template v-else>
				{{ row.text }}
			</template>
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
}
.wx-toggle-placeholder {
	width: var(--wx-icon-size);
	height: 16px;
	line-height: 16px;
	margin: 0 5px;
	flex: 0 0 var(--wx-icon-size);
}

.wx-text {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}
</style>
