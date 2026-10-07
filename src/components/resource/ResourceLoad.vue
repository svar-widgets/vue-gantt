<script setup>
import { ref, computed, watch, watchEffect, onMounted, inject, provide } from "vue";
import { locateID } from "@svar-ui/lib-dom";
import {
	getResourceColumns,
	getResourceLoadColumns,
	getResourceHistogramColumns,
	normalizeResourceColumns,
	getHeaderLength,
	toggleGridChart,
} from "@svar-ui/gantt-store";
import { locale as l } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";
import { getValue } from "@svar-ui/grid-store";
import { subscribeLater } from "@svar-ui/lib-vue";

import { Grid } from "@svar-ui/vue-grid";
import TimeScales from "../chart/TimeScale.vue";
import Resizer from "../Resizer.vue";
import NameCell from "./NameCell.vue";
import NameCellCompact from "./NameCellCompact.vue";
import LoadCell from "./LoadCell.vue";
import HistogramCell from "./HistogramCell.vue";
import HistogramCapacityOverlay from "./HistogramCapacityOverlay.vue";

import {
	getFlexBasis,
	getFitColumns,
	getFillColumn,
	getColumnsWidth,
	getSortMarks,
	getScrollbarWidth,
	getColumnStyle,
} from "../../helpers/grid";
import { getResizerUi } from "../../helpers/resizer.js";
import { createZoomWheelHandler } from "../../helpers/zoom";

const props = defineProps({
	api: {},
	columns: { default: () => getResourceColumns() },
	mode: { default: "utilization" }, // "utilization" | "histogram"
	template: {},
	histogram: {},
	draggableRows: { type: [Boolean, Function], default: false },
});

const overloadHeadroom = computed(() => props.histogram?.overloadHeadroom);
const capacityLine = computed(() => props.histogram?.capacityLine ?? true);

// detect scrollbar width that may differ in browsers
const scrollbarWidth = ref(17);
onMounted(() => {
	scrollbarWidth.value = getScrollbarWidth();
});

const state = computed(() => props.api?.getReactiveState());

// the api prop may be null until the linked Gantt mounts, so the reactive
// state stores can appear later — subscribe lazily and expose them as
// computeds that start tracking once the stores become available
const rResources = subscribeLater(() => state.value?._resources);
const rScales = subscribeLater(() => state.value?._scales);
const rResourceSort = subscribeLater(() => state.value?._resourceSort);
const rCellHeight = subscribeLater(() => state.value?.cellHeight);
const rGanttColumns = subscribeLater(() => state.value?._columns);
const rScrollLeft = subscribeLater(() => state.value?.scrollLeft);
const rGridWidth = subscribeLater(() => state.value?.gridWidth);
const rDisplayPanels = subscribeLater(() => state.value?._displayPanels);
const rHighlightTime = subscribeLater(() => state.value?.highlightTime);
const rColumnsWidth = subscribeLater(() => state.value?._columnsWidth);
const rGridCollapseThreshold = subscribeLater(
	() => state.value?._gridCollapseThreshold
);
const rCellBorders = subscribeLater(() => state.value?.cellBorders);
const rZoom = subscribeLater(() => state.value?.zoom);
const rCompactMode = subscribeLater(() => state.value?._compactMode);

const $rResources = computed(() => rResources().value ?? []);
const $rScales = computed(() => rScales().value ?? null);
const $rResourceSort = computed(() => rResourceSort().value ?? null);
const $cellHeight = computed(() => rCellHeight().value ?? 0);
const $ganttColumns = computed(() => rGanttColumns().value ?? []);
const $scrollLeft = computed(() => rScrollLeft().value ?? 0);
const $gridWidth = computed(() => rGridWidth().value ?? 0);
const $_displayPanels = computed(() => rDisplayPanels().value ?? null);
const $highlightTime = computed(() => rHighlightTime().value ?? null);
const $_columnsWidth = computed(() => rColumnsWidth().value ?? null);
const $_gridCollapseThreshold = computed(
	() => rGridCollapseThreshold().value ?? null
);
const $cellBorders = computed(() => rCellBorders().value ?? null);
const $zoom = computed(() => rZoom().value ?? null);
const $_compactMode = computed(() => rCompactMode().value ?? false);

let locale = inject("wx-i18n", null);
if (!locale) {
	locale = l({ ...en, ...coreEn });
	provide("wx-i18n", locale);
}
const _ = locale.getGroup("gantt");

const drag = ref(null);
const layoutPanels = computed(
	() => drag.value?.panels ?? $_displayPanels.value
);
const hasGrid = computed(() => !!$_displayPanels.value?.includes("grid"));
const chartVisible = computed(
	() => !!$_displayPanels.value?.includes("chart")
);

const gridChartResizerUi = computed(() =>
	getResizerUi("gridChart", layoutPanels.value ?? [], $_compactMode.value)
);

function startDrag() {
	drag.value = { panels: [...$_displayPanels.value] };
}

// the store fits the width to the gantt layout, incl. its subGrid
function resizeGrid(width, commit) {
	props.api.exec("resize-grid", { width, inProgress: !commit });
	if (commit) drag.value = null;
}

const onExpandStart = () => {
	props.api.exec("set-display-mode", {
		mode: toggleGridChart(
			$_displayPanels.value,
			"start",
			$_compactMode.value
		),
	});
};
const onExpandEnd = () => {
	props.api.exec("set-display-mode", {
		mode: toggleGridChart($_displayPanels.value, "end", $_compactMode.value),
	});
};

const containerWidth = ref(0);
const chartContainer = ref(null);
const scalesDiv = ref(null);
const rightContainerHeight = ref(0);
const rightContainerWidth = ref(0);
const rightScrollTop = ref(0);
let leftApi;
let rightApi;

const finalColumns = computed(() => {
	if (!props.columns || !props.columns.length) return [];
	let cols = normalizeResourceColumns(props.columns).map(col => {
		col = { ...col };
		const header = col.header;
		if (typeof header === "object") {
			const text = header.text && _(header.text);
			col.header = { ...header, text };
		} else col.header = _(header);

		col.align = col.align || "left";
		col.editor = false;
		return col;
	});
	const ni = cols.findIndex(c => c.id === "name");

	if (ni !== -1) {
		if (cols[ni].cell) cols[ni]._cell = cols[ni].cell;
		cols[ni] = {
			...cols[ni],
			header: hasGrid.value ? cols[ni].header : "",
			cell: hasGrid.value ? NameCell : NameCellCompact,
		};
	}

	if (cols.length > 0) cols[cols.length - 1].resize = false;
	return cols;
});

const sortMarks = computed(() =>
	getSortMarks($rResources.value, $rResourceSort.value)
);

const gridClientWidth = ref(0);

const columnWidth = ref(0);
watchEffect(() => {
	let width;
	if ($_columnsWidth.value) width = $_columnsWidth.value;
	else if (hasGrid.value) width = $gridWidth.value;
	else width = $_gridCollapseThreshold.value || 0;
	columnWidth.value = width;
});

const fitColumns = computed(() =>
	getFitColumns(finalColumns.value, $_displayPanels.value, "grid", "name")
);
const visibleHeaderLength = computed(() => getHeaderLength(fitColumns.value));

const rightColumns = computed(() =>
	props.mode === "histogram"
		? getResourceHistogramColumns($rScales.value, HistogramCell, {
				overloadHeadroom: overloadHeadroom.value,
			})
		: getResourceLoadColumns($rScales.value, LoadCell, props.template)
);

const leftSizes = computed(() => ({
	rowHeight: $cellHeight.value,
	headerHeight: $rScales.value.height / visibleHeaderLength.value,
}));
const rightSizes = computed(() => ({
	rowHeight: $cellHeight.value,
	headerHeight: 0,
}));
const rowStyle = computed(() => {
	const css = $cellBorders.value === "column" ? "wx-column-border" : "";
	return () => css;
});

const flexBasis = computed(() =>
	getFlexBasis($ganttColumns.value, $_displayPanels.value, $gridWidth.value)
);

// right grid V-scroll eats one scrollbar width on the right; timescales
// must match so the time axis aligns at horizontal-max.
const rightHasHScroll = computed(
	() =>
		($rScales.value?.width ?? 0) > containerWidth.value - gridClientWidth.value
);
const rightHasVScroll = computed(() => {
	const contentH = $rResources.value?.length * $cellHeight.value;
	const viewportH =
		rightContainerHeight.value -
		(rightHasHScroll.value ? scrollbarWidth.value : 0);
	return contentH > viewportH;
});

// left grid only overflows once its own X scrollbar appears. If the Y
// scrollbar is clipped, that hidden strip also delays the X overflow.
const leftHasHScroll = computed(
	() =>
		columnWidth.value >
		gridClientWidth.value + (rightHasVScroll.value ? scrollbarWidth.value : 0)
);

watchEffect(() => {
	const left = $scrollLeft.value;
	rightApi?.exec("scroll-to", { left });
	if (scalesDiv.value && Math.abs(scalesDiv.value.scrollLeft - left) > 1)
		scalesDiv.value.scrollLeft = left;
});

function onClick(ev) {
	const action = ev.target.dataset.action;
	if (action === "open-resource-row") {
		ev.preventDefault();
		const id = locateID(ev);
		const task = $rResources.value.find(a => a.id === id);
		if (task.data) props.api.exec(action, { id, mode: !task.open });
	}
}

const selectedRows = ref([]);

function initLeft(lapi) {
	leftApi = lapi;
	leftApi.on("select-row", ev => {
		selectedRows.value = [ev.id];
	});
	leftApi.intercept("sort-rows", ev => {
		const { key, add } = ev;
		let keySort = $rResourceSort.value
			? $rResourceSort.value.find(s => s.key === key)
			: null;
		let order = "asc";
		if (keySort)
			order = !keySort || keySort.order === "asc" ? "desc" : "asc";

		props.api.exec("sort-resources", {
			key,
			order,
			add,
			_columns: finalColumns.value,
		});
		return false;
	});

	leftApi.intercept("resize-column", ev => {
		ev.flexgrowFallback = getFillColumn(finalColumns.value, ev.id);
	});

	leftApi.on("resize-column", () => {
		columnWidth.value = getColumnsWidth(leftApi.getState().columns);
	});

	leftApi.on("scroll-to", ev => {
		if (ev.top !== undefined && !ev.rSync)
			rightApi?.exec("scroll-to", {
				top: ev.top,
				rSync: true,
			});
	});
}

function initRight(rapi) {
	rightApi = rapi;
	rightApi.on("select-row", ev => {
		selectedRows.value = [ev.id];
	});

	rightApi.on("scroll-to", ev => {
		if (ev.left !== undefined && Math.abs(ev.left - $scrollLeft.value) > 1)
			props.api.exec("scroll-chart", { left: ev.left });
		if (ev.top !== undefined && !ev.rSync)
			leftApi?.exec("scroll-to", {
				top: ev.top,
				rSync: true,
			});
		if (ev.top !== undefined) rightScrollTop.value = ev.top;
	});
}

function getCellStyle(row, col) {
	if (props.mode !== "histogram") {
		const value = getValue(row, col);
		if (value) return value.percent > 100 ? "wx-overload" : "wx-normal";
	}

	if (col.unit !== "day" && col.unit !== "hour") return "";

	const resourceCalendar = props.api.getResourceCalendar(row);
	if (resourceCalendar) {
		const isWorkingDay = resourceCalendar.isWorkingDay(col.date);
		if (!isWorkingDay) return resourceCalendar.css ?? "wx-weekend";
	} else if ($highlightTime.value)
		return $highlightTime.value(col.date, col.unit);

	return "";
}

const onWheel = computed(
	() =>
		props.api &&
		createZoomWheelHandler(
			props.api,
			() => $zoom.value,
			() => chartContainer.value
		)
);

// replaces Svelte's bind:offsetWidth / bind:clientWidth / bind:clientHeight;
// watches the element ref (not onMounted) because the markup is rendered
// only once the api prop is available
function observeSize(elRef, update) {
	watch(
		elRef,
		(el, prev, onCleanup) => {
			if (!el) return;
			update(el);
			const ro = new ResizeObserver(() => update(el));
			ro.observe(el);
			onCleanup(() => ro.disconnect());
		},
		{ immediate: true, flush: "post" }
	);
}

const containerDiv = ref(null);
observeSize(containerDiv, el => {
	containerWidth.value = el.offsetWidth;
});

const gridContainerDiv = ref(null);
observeSize(gridContainerDiv, el => {
	gridClientWidth.value = el.clientWidth;
});

const rightContainerDiv = ref(null);
observeSize(rightContainerDiv, el => {
	rightContainerHeight.value = el.clientHeight;
	rightContainerWidth.value = el.clientWidth;
});
</script>

<template>
	<div
		v-if="props.api"
		class="wx-resource-load"
		:style="`--wx-scrollbar-width: ${scrollbarWidth}px;`"
		ref="containerDiv"
		data-menu-ignore="true"
	>
		<div class="wx-layout">
			<template v-if="props.columns && props.columns.length">
				<div
					class="wx-grid-container"
					:class="{
						'wx-y-scroll': rightHasVScroll,
						'wx-h-scroll-reserve': rightHasHScroll && !leftHasHScroll,
					}"
					:style="`flex: 0 0 ${flexBasis};`"
					ref="gridContainerDiv"
				>
					<!-- extended past container's right edge so Grid's Y scrollbar gets clipped by overflow:hidden -->
					<div class="wx-y-bar-clip">
						<div class="wx-resource-grid" @click="onClick">
							<Grid
								:init="initLeft"
								:sizes="leftSizes"
								:columnStyle="getColumnStyle"
								:data="$rResources"
								:columns="fitColumns"
								:sortMarks="sortMarks"
								:selectedRows="selectedRows"
								:draggableRows="props.draggableRows"
							/>
						</div>
					</div>
				</div>

				<Resizer
					side="left"
					:panelWidth="$gridWidth"
					v-bind="gridChartResizerUi"
					:onResizeStart="startDrag"
					:onResize="width => resizeGrid(width)"
					:onResizeEnd="width => resizeGrid(width, true)"
					:onExpandStart="onExpandStart"
					:onExpandEnd="onExpandEnd"
				/>
			</template>

			<div
				class="wx-chart"
				:class="{ 'wx-chart-collapsed': !chartVisible }"
				ref="chartContainer"
				:onwheel="onWheel"
			>
				<div
					class="wx-timescale-viewport"
					:class="{ 'wx-v-scroll-reserve': rightHasVScroll }"
					ref="scalesDiv"
				>
					<TimeScales :api="props.api" />
				</div>
				<div
					class="wx-grid-scale-container"
					:class="{ 'wx-histogram-grid': props.mode === 'histogram' }"
					ref="rightContainerDiv"
				>
					<Grid
						:init="initRight"
						:columns="rightColumns"
						:data="$rResources"
						:sizes="rightSizes"
						:selectedRows="selectedRows"
						:rowStyle="rowStyle"
						:cellStyle="getCellStyle"
					/>
					<HistogramCapacityOverlay
						v-if="props.mode === 'histogram' && capacityLine"
						:rows="$rResources"
						:columns="rightColumns"
						:cellHeight="$cellHeight"
						:viewportHeight="rightContainerHeight"
						:viewportWidth="rightContainerWidth"
						:rightInset="rightHasVScroll ? scrollbarWidth : 0"
						:bottomInset="rightHasHScroll ? scrollbarWidth : 0"
						:scrollLeft="$scrollLeft"
						:scrollTop="rightScrollTop"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-resource-load {
	height: 100%;
	width: 100%;
	background-color: var(--wx-background);
}

.wx-layout {
	position: relative;
	display: flex;
	background-color: var(--wx-background);
	overflow: hidden;
	outline: none;
	height: 100%;
}

.wx-chart {
	position: relative;
	flex: 1 1 auto;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	outline: none;
}

.wx-chart-collapsed {
	flex: 0 0 0;
	width: 0;
	min-width: 0;
}

.wx-timescale-viewport {
	flex: 0 0 auto;
	overflow: hidden;
}
/* match right grid body width when it has a V scrollbar — else timescales
   shows cells past the right grid's last visible column at horizontal-max */
.wx-timescale-viewport.wx-v-scroll-reserve {
	box-sizing: border-box;
	padding-right: var(--wx-scrollbar-width);
}

.wx-grid-container {
	display: flex;
	flex-direction: column;
	border-right: var(--wx-gantt-border);
	height: 100%;
	box-sizing: content-box;
	overflow: hidden;
}
.wx-y-bar-clip {
	width: 100%;
	height: 100%;
}
/* extend by one scrollbar width so Grid's Y scrollbar gets clipped by
   wx-grid-container; --wx-scrollbar-width is set inline from JS */
.wx-grid-container.wx-y-scroll .wx-y-bar-clip {
	width: calc(100% + var(--wx-scrollbar-width));
}
/* shrink left body so rows align with right grid's when only right H-scrolls;
   gate (rightHasHScroll && !leftHasHScroll) skips this when left has its own */
.wx-grid-container.wx-h-scroll-reserve .wx-y-bar-clip {
	height: calc(100% - var(--wx-scrollbar-width));
}

.wx-grid-scale-container {
	position: relative;
	flex: 1 1 auto;
	overflow: hidden;
}

/*table*/
.wx-grid-scale-container,
.wx-resource-grid {
	box-sizing: content-box;
	height: 100%;
	--wx-table-select-background: var(--wx-gantt-select-color);
	--wx-table-select-focus-background: var(--wx-gantt-select-color);
	--wx-table-select-border: none;
	--wx-table-cell-border: var(--wx-grid-body-row-border);
	--wx-table-header-background: var(--wx-background);
	--wx-table-header-border: var(--wx-gantt-border);
	--wx-table-header-cell-border: var(--wx-gantt-border);
}
.wx-grid-scale-container :deep(.wx-grid .wx-header) {
	display: none;
}
.wx-resource-grid :deep(.wx-grid .wx-table-box),
.wx-grid-scale-container :deep(.wx-grid .wx-table-box) {
	border: none;
}
.wx-resource-grid :deep(.wx-grid),
.wx-grid-scale-container :deep(.wx-grid) {
	font: var(--wx-grid-body-font);
	color: var(--wx-grid-body-font-color);
}
/*body*/
.wx-resource-grid :deep(.wx-grid .wx-cell) {
	padding: 0 var(--wx-grid-cell-padding-x);
	height: 100%;
	display: flex;
	align-items: center;
}
.wx-resource-grid :deep(.wx-grid .wx-row) {
	display: flex;
	align-items: center;
}
.wx-resource-grid :deep(.wx-grid .wx-cell.wx-text-center) {
	justify-content: center;
}
.wx-resource-grid :deep(.wx-grid .wx-cell.wx-text-right) {
	justify-content: end;
}
.wx-resource-grid :deep(.wx-grid .wx-body .wx-cell) {
	border-right: var(--wx-grid-body-cell-border);
}
.wx-resource-grid :deep(.wx-grid .wx-body .wx-cell.wx-col-name) {
	padding-left: var(--wx-grid-tree-column-padding-left);
}
.wx-resource-grid :deep(.wx-grid .wx-cell:has(input, .wx-value)) {
	height: 100%;
	padding: 0;
}
.wx-grid-scale-container :deep(.wx-row.wx-column-border:not(:last-child)),
.wx-grid-scale-container :deep(.wx-row.wx-column-border:last-child) {
	border-bottom: none;
}
/*header*/
.wx-resource-grid :deep(.wx-grid .wx-header) {
	box-shadow: var(--wx-grid-header-shadow);
	z-index: 1;
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell) {
	font: var(--wx-grid-header-font);
	text-transform: var(--wx-grid-header-text-transform);
	color: var(--wx-grid-header-font-color);
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell.wx-filter) {
	padding: 0 5px;
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell:has(.wx-sort)) {
	padding-right: var(--wx-grid-header-sort-padding-right);
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell .wx-text) {
	width: 100%;
}
.wx-resource-grid
	:deep(.wx-grid .wx-header .wx-cell:has(.wx-sort) .wx-text) {
	width: calc(100% - 15px);
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell.wx-text-right) {
	text-align: right;
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-cell.wx-text-center) {
	text-align: center;
}
.wx-resource-grid
	:deep(.wx-grid .wx-header .wx-cell.wx-text-right.wx-action) {
	justify-content: right;
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-action i) {
	font-size: var(--wx-icon-size);
	color: var(--wx-gantt-icon-color);
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-action .wx-text) {
	display: none;
}
.wx-resource-grid :deep(.wx-grid .wx-header .wx-action i:hover) {
	color: var(--wx-color-link);
}

/*cell*/
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-weekend) {
	background: var(--wx-gantt-holiday-background);
	color: var(--wx-gantt-holiday-color);
}
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-normal) {
	background: var(--wx-gantt-load-normal-color);
}
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-normal:hover) {
	background: var(--wx-gantt-load-normal-hover-color);
}
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-overload) {
	background: var(--wx-gantt-load-danger-color);
}
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-overload:hover) {
	background: var(--wx-gantt-load-danger-hover-color);
}
.wx-grid-scale-container.wx-histogram-grid :deep(.wx-grid .wx-cell) {
	padding: 0;
}
.wx-grid-scale-container.wx-histogram-grid
	:deep(.wx-grid .wx-cell[tabindex="0"]:focus) {
	outline: none;
}
/* override load cell background for selected rows */
.wx-grid-scale-container
	:deep(.wx-grid .wx-row.wx-selected .wx-cell:not(.wx-normal):not(.wx-overload)) {
	background: var(--wx-table-select-background);
}
</style>
