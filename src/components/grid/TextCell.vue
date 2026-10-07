<script setup>
import { inject } from "vue";
import GroupCellText from "./GroupCellText.vue";

const props = defineProps({
	row: {},
	column: {},
});

const _ = inject("wx-i18n").getGroup("gantt");

function getStyle(row, col) {
	return `justify-content:${col.align};padding-left: ${
		(row.$level - 1) * 20
	}px`;
}
</script>

<template>
	<div class="wx-content" :style="getStyle(row, column)">
		<template v-if="!row.$empty && (row.data?.length || row.lazy)">
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
			<GroupCellText v-else-if="row.$group" :row="row" />
			<span v-else-if="row.$placeholder && !row.text" class="wx-hint">{{
				_("New task")
			}}</span>
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
	flex-shrink: 0;
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

.wx-hint {
	color: var(--wx-color-font-disabled);
}
</style>
