<script setup>
import { computed } from "vue";
import { subscribe } from "@svar-ui/lib-vue";

const props = defineProps({
	api: {},
});

const { _scales: scales, xArea, highlightTime } = props.api.getReactiveState();
const $scales = subscribe(scales);
const $xArea = subscribe(xArea);
const $highlightTime = subscribe(highlightTime);

function mapRow(row, xFrom, xEnd) {
	const cells = row.cells;
	let from = 0;
	let start = cells.length;
	let acc = 0;
	for (let i = 0; i < cells.length; i++) {
		if (acc + cells[i].width > xFrom) {
			start = i;
			from = acc;
			break;
		}
		acc += cells[i].width;
	}
	let end = start;
	while (end < cells.length && acc < xEnd) {
		acc += cells[end].width;
		end++;
	}
	return { from, slice: cells.slice(start, end) };
}

const renderedRows = computed(() => {
	const rows = $scales.value.rows;
	const lastIndex = rows.length - 1;

	return rows.map((row, ri) => {
		if (ri === lastIndex) {
			return {
				height: row.height,
				from: $xArea.value.from,
				slice: row.cells.slice($xArea.value.start, $xArea.value.end),
			};
		}
		return {
			height: row.height,
			...mapRow(row, $xArea.value.from, $xArea.value.to),
		};
	});
});
</script>

<template>
	<div class="wx-scale" :style="{ width: $scales.width + 'px' }">
		<div
			v-for="(r, ri) in renderedRows"
			:key="ri"
			class="wx-row"
			:style="{ height: r.height + 'px', paddingLeft: r.from + 'px' }"
		>
			<div
				v-for="(cell, ci) in r.slice"
				:key="ci"
				:class="[
					'wx-cell',
					cell.css,
					$highlightTime ? $highlightTime(cell.date, cell.unit) : '',
				]"
				:style="{ width: cell.width + 'px' }"
			>
				<span :class="{ 'wx-cell-value': cell.width > 100 }">
					{{ cell.value }}
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-scale {
	position: sticky;
	top: 0;
	background-color: var(--wx-background);
	box-shadow: var(--wx-timescale-shadow);
	z-index: 5;
	border-bottom: var(--wx-gantt-border);
}

.wx-row,
.wx-cell {
	display: flex;
	box-sizing: border-box;
}

.wx-row:not(:last-child) {
	border-bottom: var(--wx-gantt-border);
}
.wx-cell-value {
	position: sticky;
	left: 0px;
	right: 0px;
	padding-left: 12px;
	padding-right: 12px;
	background-color: var(--wx-background);
}

.wx-cell {
	justify-content: center;
	align-items: center;
	border-right: var(--wx-timescale-border);
	font: var(--wx-timescale-font);
	color: var(--wx-timescale-font-color);
}

.wx-cell.wx-weekend {
	background: var(--wx-gantt-holiday-background);
	color: var(--wx-gantt-holiday-color);
}
</style>
