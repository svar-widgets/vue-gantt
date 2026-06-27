<script setup>
defineOptions({ name: "GanttChartChart" });

import { ref, computed, watch, watchEffect, onMounted, onUnmounted, inject } from 'vue';

import CellGrid from './CellGrid.vue';
import Bars from './Bars.vue';
import TimeScales from './TimeScale.vue';

import { hotkeys } from '@svar-ui/grid-store';
import { setID } from '@svar-ui/lib-dom';
import { asDirective, subscribe } from '@svar-ui/lib-vue';
import { createZoomWheelHandler } from '../../helpers/zoom';

const vHotkeys = asDirective(hotkeys);

const props = defineProps({
	readonly: {},
	fullWidth: {},
	fullHeight: {},
	taskTemplate: {},
});

const api = inject('gantt-store');

const {
	_selected: selected,
	scrollTop: rScrollTop,
	scrollLeft: rScrollLeft,
	cellHeight,
	_tasks: rTasks,
	resources,
	_scales: scales,
	area,
	groupBy,
	xArea,
	zoom,
	_calendars,
	_markers,
	highlightTime,
} = api.getReactiveState();

const $selected = subscribe(selected, true);
const $rScrollTop = subscribe(rScrollTop);
const $rScrollLeft = subscribe(rScrollLeft);
const $cellHeight = subscribe(cellHeight);
const $scales = subscribe(scales);
const $zoom = subscribe(zoom);
const $_markers = subscribe(_markers);
const $rTasks = subscribe(rTasks);
const $resources = subscribe(resources);
const $area = subscribe(area);
const $groupBy = subscribe(groupBy);
const $xArea = subscribe(xArea);
const $_calendars = subscribe(_calendars);
const $highlightTime = subscribe(highlightTime);

const chartHeight = ref(0);
const chart = ref(null);

const extraRows = 1;

const selectStyle = computed(() => {
	const t = [];
	if ($selected.value.length && $cellHeight.value) {
		$selected.value.forEach(obj => {
			t.push(`height: ${$cellHeight.value}px;top: ${obj.$y - 3}px`);
		});
	}
	return t;
});

watch([$rScrollTop, chartHeight, $cellHeight], () => {
	dataRequest();
});

const chartGridHeight = computed(() => Math.max(chartHeight.value, props.fullHeight));

watchEffect(() => {
	if (chart.value) {
		chart.value.scrollTop = $rScrollTop.value;
		chart.value.scrollLeft = $rScrollLeft.value;
	}
});

function onScroll() {
	if (chart.value.scrollLeft !== $rScrollLeft.value)
		api.exec('scroll-chart', { left: chart.value.scrollLeft });
}

function dataRequest() {
	const clientHeight = chartHeight.value || 0;
	const num = Math.ceil(clientHeight / $cellHeight.value) + 1;
	const pos = Math.floor(($rScrollTop.value || 0) / $cellHeight.value);
	const start = Math.max(0, pos - extraRows);
	const end = pos + num + extraRows;
	const from = start * $cellHeight.value;
	api.exec('render-data', {
		start,
		end,
		from,
	});
}

const onWheel = createZoomWheelHandler(
	api,
	() => $zoom.value,
	() => chart.value
);

function getHoliday(cell) {
	const style = $highlightTime.value?.(cell.date, cell.unit);
	if (style)
		return {
			css: style,
			width: cell.width,
		};
	return null;
}

const holidays = computed(() => {
	if (!$highlightTime.value) return null;
	const cells = $scales.value.rows[$scales.value.rows.length - 1].cells;
	return cells.slice($xArea.value.start, $xArea.value.end).map(getHoliday);
});

const timelineCells = computed(() => {
	const row = $scales.value.rows[$scales.value.rows.length - 1];
	const cells = row?.cells;
	return ($scales.value.minUnit === 'hour' || $scales.value.minUnit === 'day') && cells
		? cells.slice($xArea.value.start, $xArea.value.end)
		: [];
});

const visibleTasks = computed(() => $rTasks.value.slice($area.value.start, $area.value.end));

function getRowCalendars(task) {
	if ($groupBy.value?.field === 'resource') {
		if (task.$resource) {
			const calendar = api.getResourceCalendar(task);
			return calendar ? [calendar] : [];
		}

		const groupValue = task.$groupValue;
		if (groupValue === undefined || groupValue === '$ungrouped')
			return [];

		const resourceIds = Array.isArray(groupValue)
			? groupValue
			: [groupValue];

		return resourceIds.flatMap(id => {
			const resource = $resources.value?.byId(id);
			if (!resource) return [];
			const calendar = api.getResourceCalendar(resource);
			return calendar ? [calendar] : [];
		});
	}

	const calendar = task.calendar ? api.getTaskCalendar(task) : undefined;
	return calendar ? [calendar] : [];
}

const rowHighlights = computed(() => {
	const result = [];
	if (!$_calendars.value) return result;
	const globalCalendar = api.getCalendar();
	visibleTasks.value.forEach((task, index) => {
		const rowCalendars = getRowCalendars(task);
		if (!rowCalendars.length) return;
		timelineCells.value.forEach((cell, cellIndex) => {
			const nonWorkingCalendars = rowCalendars.filter(
				cal => !cal.isWorkingDay(cell.date)
			);
			const isRowWorkingDay = nonWorkingCalendars.length === 0;
			const isGlobalHoliday =
				globalCalendar && !globalCalendar.isWorkingDay(cell.date);

			const cellConfig = {
				width: cell.width,
				height: $cellHeight.value,
				left: (cellIndex + $xArea.value.start) * cell.width,
				top: $area.value.from + index * $cellHeight.value,
			};

			let css = '';
			if (!isRowWorkingDay) {
				const extra = nonWorkingCalendars
					.map(cal => cal.css)
					.filter(Boolean);
				css = ['wx-weekend', ...extra].join(' ');
			}
			if (isRowWorkingDay && isGlobalHoliday)
				css = 'wx-weekend-override';

			if (css) result.push({ ...cellConfig, css });
		});
	});
	return result;
});

function handleHotkey(ev) {
	ev.eventSource = 'chart';
	api.exec('hotkey', ev);
}

let ro;
onMounted(() => {
	if (chart.value) {
		chartHeight.value = chart.value.clientHeight;
		ro = new ResizeObserver(entries => {
			for (const entry of entries) {
				chartHeight.value = entry.target.clientHeight;
			}
		});
		ro.observe(chart.value);
	}
});

onUnmounted(() => {
	ro?.disconnect();
});
</script>

<template>
	<div
		class="wx-chart"
		tabindex="-1"
		ref="chart"
		@scroll="onScroll"
		@wheel="onWheel"
		v-hotkeys="{
			keys: {
				arrowup: true,
				arrowdown: true,
			},
			exec: v => handleHotkey(v),
		}"
	>
		<TimeScales :api="api" />
		<div v-if="$_markers.length" class="wx-markers" :style="`height:${chartGridHeight}px;`">
			<div
				v-for="marker in $_markers"
				:key="marker.id || marker.left"
				:class="'wx-marker ' + (marker.css || '')"
				:style="`left:${marker.left}px`"
			>
				<div class="wx-content">{{ marker.text }}</div>
			</div>
		</div>

		<div class="wx-area" :style="`width:${props.fullWidth}px;height:${chartGridHeight}px`">
			<div v-if="holidays" class="wx-gantt-holidays" style="height:100%;">
				<template v-for="(holiday, i) in holidays" :key="i">
					<div
						v-if="holiday"
						:class="holiday.css"
						:style="`width: ${holiday.width}px; left:${$xArea.from + i * holiday.width}px`"
					></div>
				</template>
			</div>

			<div
				v-for="(row, index) in rowHighlights"
				:key="index"
				:class="row.css"
				:style="`position: absolute; pointer-events: none; width:${row.width}px; height:${row.height}px; left:${row.left}px; top:${row.top}px`"
			></div>

			<template v-if="$selected.length">
				<template v-for="(obj, index) in $selected" :key="obj.id">
					<div
						v-if="obj.$y"
						class="wx-selected"
						:data-id="setID(obj.id)"
						:style="selectStyle[index]"
					></div>
				</template>
			</template>

			<CellGrid />

			<Bars :readonly="props.readonly" :taskTemplate="props.taskTemplate" />
		</div>
	</div>
</template>

<style scoped>
.wx-chart {
	position: relative;
	flex: 1 1 auto;
	overflow-x: auto;
	overflow-y: hidden;
	outline: none;
}

.wx-markers {
	position: absolute;
}

.wx-marker {
	position: absolute;
	z-index: 4;
	width: 2px;
	height: 100%;
	text-align: center;
	user-select: none;
	transform: scaleX(-1);
	background: var(--wx-gantt-marker-color);
}

.wx-content {
	position: absolute;
	min-width: 50px;
	padding: 4px 8px;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
	font: var(--wx-gantt-marker-font);
	color: var(--wx-gantt-marker-font-color);
	background-color: inherit;
	white-space: nowrap;
	transform: scaleX(-1);
}

.wx-area {
	position: relative;
	overflow-y: hidden;
}

.wx-selected {
	position: absolute;
	box-sizing: border-box;
	left: 0;
	width: 100%;
	background: var(--wx-gantt-select-color);
}

.wx-cut {
	opacity: 50%;
}

.wx-gantt-holidays {
	height: 100%;
	width: 100%;
	position: absolute;
}

.wx-weekend {
	height: 100%;
	background: var(--wx-gantt-holiday-background);
	color: var(--wx-gantt-holiday-color);
	position: absolute;
}

.wx-weekend-override {
	background: var(--wx-background);
}
</style>
