<script setup>
defineOptions({ name: "GanttLayout" });

import {
	ref,
	computed,
	watchEffect,
	onMounted,
	onUnmounted,
	onWatcherCleanup,
	inject,
} from "vue";
import { hotkeys } from "@svar-ui/grid-store";
import { asDirective, subscribe } from "@svar-ui/lib-vue";

// views
import Grid from "./grid/Grid.vue";
import Chart from "./chart/Chart.vue";
import Resizer from "./Resizer.vue";

const vHotkeys = asDirective(hotkeys);

const props = defineProps({
	taskTemplate: {},
	readonly: {},
});

const tableAPI = defineModel("tableAPI");
const ganttWidth = defineModel("ganttWidth");

const api = inject("gantt-store");

const {
	_tasks: rTasks,
	_scales: rScales,
	cellHeight: rCellHeight,
	columns: rColumns,
	scrollTop: rScrollTop,
	undo,
	_columnsWidth,
} = api.getReactiveState();

const $rTasks = subscribe(rTasks);
const $rScales = subscribe(rScales);
const $rCellHeight = subscribe(rCellHeight);
const $rColumns = subscribe(rColumns);
const $rScrollTop = subscribe(rScrollTop);
const $undo = subscribe(undo);
const $_columnsWidth = subscribe(_columnsWidth);

const ganttHeight = ref(undefined);
const innerWidth = ref(undefined);
const chart = ref(null);

const scrollSize = computed(() => ganttWidth.value - innerWidth.value);
const fullWidth = computed(() => $rScales.value.width);
const fullHeight = computed(() => $rTasks.value.length * $rCellHeight.value);
const scrollHeight = computed(
	() => $rScales.value.height + fullHeight.value + scrollSize.value
);

// expand scale
watchEffect(() => {
	let ro;
	if (chart.value) {
		ro = new ResizeObserver(chartResizeHandler);
		ro.observe(chart.value);
	}
	onWatcherCleanup(() => {
		if (ro) ro.disconnect();
	});
});

function chartResizeHandler() {
	api.exec("resize-chart", {
		width: ganttWidth.value - $_columnsWidth.value - scrollSize.value - 4, // resizer width
		height: ganttHeight.value - $rScales.value.height,
		scrollSize: scrollSize.value,
	});
}

// scroll
const ganttDiv = ref(null);

function onScroll() {
	api.exec("scroll-chart", {
		top: ganttDiv.value.scrollTop,
	});
}

function syncScroll() {
	if (ganttDiv.value && $rScrollTop.value !== ganttDiv.value.scrollTop)
		ganttDiv.value.scrollTop = $rScrollTop.value;
}

watchEffect(() => {
	// access $rScrollTop.value to track it as dependency
	$rScrollTop.value;
	syncScroll();
});

// ResizeObserver for ganttDiv dimensions
let ganttRo;
onMounted(() => {
	if (ganttDiv.value) {
		ganttRo = new ResizeObserver(() => {
			ganttHeight.value = ganttDiv.value?.offsetHeight;
			ganttWidth.value = ganttDiv.value?.offsetWidth;
		});
		ganttRo.observe(ganttDiv.value);
		ganttHeight.value = ganttDiv.value.offsetHeight;
		ganttWidth.value = ganttDiv.value.offsetWidth;
	}
});
onUnmounted(() => {
	ganttRo?.disconnect();
});

// ResizeObserver for innerWidth
const pseudoRowsDiv = ref(null);
let innerRo;
onMounted(() => {
	if (pseudoRowsDiv.value) {
		innerRo = new ResizeObserver(() => {
			innerWidth.value = pseudoRowsDiv.value?.offsetWidth;
		});
		innerRo.observe(pseudoRowsDiv.value);
		innerWidth.value = pseudoRowsDiv.value.offsetWidth;
	}
});
onUnmounted(() => {
	innerRo?.disconnect();
});
</script>

<template>
	<div
		class="wx-gantt"
		ref="ganttDiv"
		@scroll="onScroll"
	>
		<div
			ref="pseudoRowsDiv"
			class="wx-pseudo-rows"
			:style="`height:${scrollHeight}px;width:100%;`"
		>
			<div
				class="wx-stuck"
				:style="`height:${ganttHeight}px;width:${innerWidth}px;`"
			>
				<div
					tabindex="0"
					class="wx-layout"
					v-hotkeys="{
						keys: {
							'ctrl+c': true,
							'ctrl+v': true,
							'ctrl+x': true,
							'ctrl+d': true,
							backspace: true,
							'ctrl+z': $undo,
							'ctrl+y': $undo,
						},
						exec: ev => {
							if (!ev.isInput) api.exec('hotkey', ev);
						},
					}"
				>
					<template v-if="$rColumns.length">
						<Grid
							:readonly="readonly"
							:fullHeight="fullHeight"
							v-model:tableAPI="tableAPI"
						/>
						<Resizer
							:containerWidth="ganttWidth"
							:api="api"
						/>
					</template>

					<div class="wx-content" ref="chart">
						<Chart
							:readonly="readonly"
							:fullWidth="fullWidth"
							:fullHeight="fullHeight"
							:taskTemplate="taskTemplate"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-gantt {
	height: 100%;
	width: 100%;
	overflow-y: auto;
}
.wx-pseudo-rows {
	width: 100%;
	height: auto;
	min-height: 100%;
}
.wx-stuck {
	position: sticky;
	top: 0;
	height: 100%;
	width: 100%;
	max-height: 100%;
}
.wx-layout {
	position: relative;
	display: flex;
	max-height: 100%;
	max-width: 100%;
	background-color: var(--wx-background);
	overflow: hidden;
	outline: none;
	height: 100%;
}

.wx-content {
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
</style>
