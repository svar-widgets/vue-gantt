<script setup>
defineOptions({ name: "GanttChartChart" });

import { ref, computed, watch, watchEffect, onMounted, onUnmounted, inject } from 'vue';

import CellGrid from './CellGrid.vue';
import Bars from './Bars.vue';
import TimeScales from './TimeScale.vue';

import { hotkeys } from '@svar-ui/grid-store';
import { setID } from '@svar-ui/lib-dom';
import { asDirective } from '@svar-ui/lib-vue';
import { subscribe } from '@svar-ui/lib-vue';

const vHotkeys = asDirective(hotkeys);

const props = defineProps({
	readonly: {},
	fullWidth: {},
	fullHeight: {},
	taskTemplate: {},
	cellBorders: {},
	highlightTime: {},
});

const api = inject('gantt-store');

const {
	_selected: selected,
	scrollTop: rScrollTop,
	scrollLeft: rScrollLeft,
	cellHeight,
	_scales: scales,
	zoom,
	_markers,
} = api.getReactiveState();

const $selected = subscribe(selected, true);
const $rScrollTop = subscribe(rScrollTop);
const $rScrollLeft = subscribe(rScrollLeft);
const $cellHeight = subscribe(cellHeight);
const $scales = subscribe(scales);
const $zoom = subscribe(zoom);
const $_markers = subscribe(_markers);

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

watch(chartHeight, () => {
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
	setScroll();
	dataRequest();
}

function setScroll() {
	const ev = {};
	if (chart.value.scrollTop !== $rScrollTop.value) ev.top = chart.value.scrollTop;
	if (chart.value.scrollLeft !== $rScrollLeft.value) ev.left = chart.value.scrollLeft;
	api.exec('scroll-chart', ev);
}

function dataRequest() {
	const clientHeight = chartHeight.value || 0;
	const num = Math.ceil(clientHeight / $cellHeight.value) + 1;
	const pos = Math.floor((chart.value?.scrollTop || 0) / $cellHeight.value);
	const start = Math.max(0, pos - extraRows);
	const end = pos + num + extraRows;
	const from = start * $cellHeight.value;
	api.exec('render-data', {
		start,
		end,
		from,
	});
}

let lastWheelTime = performance.now();
const MAX_ZOOM_RATE = 0.003; // per ms
function getZoomFactor(evDelta) {
	const isTouchpad = Math.abs(evDelta) < 50; // or mouse with smooth scrolling
	const SENSITIVITY = isTouchpad ? 0.004 : 0.01; // smaller - slower
	const now = performance.now();
	const dt = Math.min(now - lastWheelTime, 50);
	lastWheelTime = now;
	const normalized = clamp(
		-evDelta * SENSITIVITY,
		-MAX_ZOOM_RATE * dt,
		MAX_ZOOM_RATE * dt
	);
	return Math.exp(normalized);
}
function clamp(value, min, max) {
	return Math.max(Math.min(value, max), min);
}
let pending = false;
function onWheel(e) {
	if ($zoom.value && (e.ctrlKey || e.metaKey)) {
		e.preventDefault();
		const ratio = getZoomFactor(e.deltaY);
		const offset = e.clientX - chart.value.getBoundingClientRect().left;
		if (!pending) {
			pending = true;
			requestAnimationFrame(() => {
				api.exec('zoom-scale', {
					dir: ratio > 1 ? 1 : -1,
					ratio: Math.abs(1 - ratio),
					offset,
				});
				pending = false;
			});
		}
	}
}

function getHoliday(cell) {
	const style = props.highlightTime(cell.date, cell.unit);
	if (style)
		return {
			css: style,
			width: cell.width,
		};
	return null;
}

const holidays = computed(() => {
	return ($scales.value.minUnit === 'hour' || $scales.value.minUnit === 'day') &&
		props.highlightTime
		? $scales.value.rows[$scales.value.rows.length - 1].cells.map(getHoliday)
		: null;
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
		<TimeScales :highlightTime="props.highlightTime" />
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
						:style="`width: ${holiday.width}px; left:${i * holiday.width}px`"
					></div>
				</template>
			</div>

			<CellGrid :borders="props.cellBorders" />

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
</style>
