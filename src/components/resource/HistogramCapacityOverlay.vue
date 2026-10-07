<script setup>
import { computed } from "vue";
import { getHistogramCapacityPath } from "@svar-ui/gantt-store";

const props = defineProps({
	rows: { default: () => [] },
	columns: { default: () => [] },
	cellHeight: { default: 1 },
	viewportHeight: { default: 0 },
	viewportWidth: { default: 0 },
	rightInset: { default: 0 },
	bottomInset: { default: 0 },
	scrollLeft: { default: 0 },
	scrollTop: { default: 0 },
});

const width = computed(() =>
	props.columns.reduce((total, column) => total + column.width, 0)
);
const columnPositions = computed(() => {
	let left = 0;
	return props.columns.map(column => {
		const position = { column, left, right: left + column.width };
		left = position.right;
		return position;
	});
});
const visibleColumns = computed(() => {
	const positions = columnPositions.value;
	const start = positions.findIndex(
		position => position.right > props.scrollLeft
	);
	if (start === -1) return [];

	const end = props.scrollLeft + props.viewportWidth;
	let index = start;
	while (index < positions.length && positions[index].left < end) index++;

	return positions.slice(Math.max(0, start - 1), index);
});
const visibleStart = computed(() =>
	Math.max(0, Math.floor(props.scrollTop / props.cellHeight) - 1)
);
const visibleEnd = computed(() =>
	Math.min(
		props.rows.length,
		Math.ceil((props.scrollTop + props.viewportHeight) / props.cellHeight) +
			1
	)
);
const visibleRows = computed(() =>
	props.rows.slice(visibleStart.value, visibleEnd.value)
);
</script>

<template>
	<div
		class="wx-histogram-capacity-overlay"
		:style="`right:${props.rightInset}px;bottom:${props.bottomInset}px;`"
		aria-hidden="true"
	>
		<svg
			:width="width"
			:height="props.rows.length * props.cellHeight"
			:style="`transform:translate(${-props.scrollLeft}px, ${-props.scrollTop}px);`"
		>
			<template v-if="visibleColumns.length">
				<path
					v-for="(row, index) in visibleRows"
					:key="row.id"
					class="wx-histogram-capacity-path"
					:d="
						getHistogramCapacityPath(row, visibleColumns, props.cellHeight)
					"
					:transform="`translate(0, ${(visibleStart + index) * props.cellHeight})`"
				/>
			</template>
		</svg>
	</div>
</template>

<style scoped>
.wx-histogram-capacity-overlay {
	position: absolute;
	inset: 0;
	z-index: 2;
	overflow: hidden;
	pointer-events: none;
}

.wx-histogram-capacity-path {
	fill: none;
	stroke: var(--wx-gantt-resource-histogram-capacity-color);
	stroke-width: 1;
}
</style>
