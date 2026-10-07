<script setup>
defineOptions({ name: "GanttLayout" });

import { ref, computed, watch, watchEffect, onMounted, onUnmounted, inject } from "vue";
import { hotkeys } from "@svar-ui/grid-store";
import { toggleGridChart, toggleChartSubGrid } from "@svar-ui/gantt-store";
import { asDirective, subscribe } from "@svar-ui/lib-vue";

// views
import Grid from "./grid/Grid.vue";
import Chart from "./chart/Chart.vue";
import Resizer from "./Resizer.vue";

import { getResizerUi } from "../helpers/resizer.js";

const vHotkeys = asDirective(hotkeys);

defineProps({
	taskTemplate: {},
	readonly: {},
});

const tableAPI = defineModel("tableAPI");
const subGridTableAPI = defineModel("subGridTableAPI");

const ganttWidth = ref(undefined);

const api = inject("gantt-store");

const {
	_tasks: rTasks,
	_scales: rScales,
	cellHeight: rCellHeight,
	_columns: rColumns,
	scrollTop: rScrollTop,
	undo,
	_columnsWidth,
	gridWidth,
	subGridWidth,
	_displayPanels,
	_compactMode,
} = api.getReactiveState();

const $rTasks = subscribe(rTasks);
const $rScales = subscribe(rScales);
const $rCellHeight = subscribe(rCellHeight);
const $rColumns = subscribe(rColumns);
const $rScrollTop = subscribe(rScrollTop);
const $undo = subscribe(undo);
const $_columnsWidth = subscribe(_columnsWidth);
const $gridWidth = subscribe(gridWidth);
const $subGridWidth = subscribe(subGridWidth);
const $_displayPanels = subscribe(_displayPanels);
const $_compactMode = subscribe(_compactMode);

const hasSubGrid = computed(() =>
	$rColumns.value.some(c => c.section === "subGrid")
);
const drag = ref(null);
const layoutPanels = computed(
	() => drag.value?.panels ?? $_displayPanels.value
);
const subGridVisible = computed(() =>
	$_displayPanels.value.includes("subGrid")
);
const chartVisible = computed(() => $_displayPanels.value.includes("chart"));
const showSubGridResizer = computed(
	() =>
		hasSubGrid.value &&
		(chartVisible.value || drag.value?.section === "subGrid")
);
// 4px per resizer; the subGrid one is shown only next to the chart
const resizerWidth = computed(() =>
	hasSubGrid.value && chartVisible.value ? 8 : 4
);
const effectiveSubGridWidth = computed(() =>
	subGridVisible.value ? $subGridWidth.value : 0
);

const gridChartResizerUi = computed(() =>
	getResizerUi("gridChart", layoutPanels.value, $_compactMode.value)
);

const subGridResizerUi = computed(() =>
	getResizerUi("subGrid", layoutPanels.value, $_compactMode.value)
);

const ganttHeight = ref(undefined);
const innerWidth = ref(undefined);

const scrollSize = computed(() => ganttWidth.value - innerWidth.value);

const fullWidth = computed(() => $rScales.value.width);
const fullHeight = computed(() => $rTasks.value.length * $rCellHeight.value);
const scrollHeight = computed(
	() => $rScales.value.height + fullHeight.value + scrollSize.value
);

function startDrag(section) {
	drag.value = { section, panels: [...$_displayPanels.value] };
}

function resizeGrid(section, width, commit) {
	api.exec("resize-grid", { width, section, inProgress: !commit });
	if (commit) drag.value = null;
}

function onExpandStart() {
	api.exec("set-display-mode", {
		mode: toggleGridChart(
			$_displayPanels.value,
			"start",
			$_compactMode.value
		),
	});
}
function onExpandEnd() {
	api.exec("set-display-mode", {
		mode: toggleGridChart($_displayPanels.value, "end", $_compactMode.value),
	});
}

function toggleSubGridStart() {
	api.exec("set-display-mode", {
		mode: toggleChartSubGrid(
			$_displayPanels.value,
			"start",
			$_compactMode.value
		),
	});
}
function toggleSubGridEnd() {
	api.exec("set-display-mode", {
		mode: toggleChartSubGrid(
			$_displayPanels.value,
			"end",
			$_compactMode.value
		),
	});
}

watch(
	() => {
		if (ganttWidth.value == null || drag.value) return null;

		const width =
			ganttHeight.value != null && chartVisible.value
				? ganttWidth.value -
					$_columnsWidth.value -
					effectiveSubGridWidth.value -
					resizerWidth.value -
					scrollSize.value
				: 0;
		const height =
			ganttHeight.value != null
				? ganttHeight.value - $rScales.value.height
				: 0;

		return {
			width,
			height,
			scrollSize: scrollSize.value,
			ganttWidth: ganttWidth.value,
		};
	},
	size => {
		if (size) api.exec("resize-chart", size);
	},
	{ immediate: true }
);

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

const pseudoRowsDiv = ref(null);
let ro;
function measure() {
	if (ganttDiv.value) {
		ganttHeight.value = ganttDiv.value.offsetHeight;
		ganttWidth.value = ganttDiv.value.offsetWidth;
	}
	if (pseudoRowsDiv.value) innerWidth.value = pseudoRowsDiv.value.offsetWidth;
}
onMounted(() => {
	ro = new ResizeObserver(measure);
	if (ganttDiv.value) ro.observe(ganttDiv.value);
	if (pseudoRowsDiv.value) ro.observe(pseudoRowsDiv.value);
	measure();
});
onUnmounted(() => {
	ro?.disconnect();
});
</script>

<template>
	<div class="wx-gantt" ref="ganttDiv" @scroll="onScroll">
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
						<Grid :readonly="readonly" v-model:tableAPI="tableAPI" />
						<Resizer
							side="left"
							:panelWidth="$gridWidth"
							v-bind="gridChartResizerUi"
							:onResizeStart="() => startDrag('grid')"
							:onResize="width => resizeGrid('grid', width)"
							:onResizeEnd="width => resizeGrid('grid', width, true)"
							:onExpandStart="onExpandStart"
							:onExpandEnd="onExpandEnd"
						/>
					</template>

					<div
						class="wx-content"
						:class="{ 'wx-content-visible': chartVisible }"
					>
						<Chart
							:readonly="readonly"
							:fullWidth="fullWidth"
							:fullHeight="fullHeight"
							:taskTemplate="taskTemplate"
						/>
					</div>

					<!-- Mounted only while chart is open; grid+subGrid uses grid/chart resizer -->
					<Resizer
						v-if="hasSubGrid && showSubGridResizer"
						side="right"
						:panelWidth="$subGridWidth"
						:resizeInvert="true"
						v-bind="subGridResizerUi"
						:onResizeStart="() => startDrag('subGrid')"
						:onResize="width => resizeGrid('subGrid', width)"
						:onResizeEnd="width => resizeGrid('subGrid', width, true)"
						:onExpandStart="toggleSubGridStart"
						:onExpandEnd="toggleSubGridEnd"
					/>
					<Grid
						v-if="hasSubGrid && subGridVisible"
						section="subGrid"
						:readonly="readonly"
						v-model:tableAPI="subGridTableAPI"
					/>
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
	/* Keep Chart mounted when hidden without claiming layout space */
	flex: 0 0 0;
	width: 0;
	min-width: 0;
}

.wx-content-visible {
	/* basis 0 so chart content width cannot crush resizers */
	flex: 1 1 0;
	width: auto;
	min-width: 0;
}
</style>
