<script setup>
import {
	ref,
	computed,
	watchEffect,
	onMounted,
	onUnmounted,
	onWatcherCleanup,
	inject,
	provide,
} from "vue";
import { locateID } from "@svar-ui/lib-dom";
import {
	getResourceColumns,
	normalizeResourceColumns,
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

import {
	getFlexBasis,
	getFitColumns,
	getFillColumn,
	getColumnsWidth,
	getSortMarks,
	getResourceLoadColumns,
	getScrollbarWidth,
	getColumnStyle,
} from "../../helpers/grid";
import { createZoomWheelHandler } from "../../helpers/zoom";

const props = defineProps({
	api: {},
	columns: { default: () => getResourceColumns() },
	mode: { default: "grid" },
	template: {},
});

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
const rGanttColumns = subscribeLater(() => state.value?.columns);
const rScrollLeft = subscribeLater(() => state.value?.scrollLeft);
const rGridWidth = subscribeLater(() => state.value?.gridWidth);
const rDisplayMode = subscribeLater(() => state.value?.displayMode);
const rHeaderLength = subscribeLater(() => state.value?._headerLength);
const rHighlightTime = subscribeLater(() => state.value?.highlightTime);
const rColumnsWidth = subscribeLater(() => state.value?._columnsWidth);
const rGridCollapseThreshold = subscribeLater(
	() => state.value?._gridCollapseThreshold
);
const rCellBorders = subscribeLater(() => state.value?.cellBorders);
const rZoom = subscribeLater(() => state.value?.zoom);

const $rResources = computed(() => rResources().value ?? []);
const $rScales = computed(() => rScales().value ?? null);
const $rResourceSort = computed(() => rResourceSort().value ?? null);
const $cellHeight = computed(() => rCellHeight().value ?? 0);
const $ganttColumns = computed(() => rGanttColumns().value ?? []);
const $scrollLeft = computed(() => rScrollLeft().value ?? 0);
const $gridWidth = computed(() => rGridWidth().value ?? 0);
const $displayMode = computed(() => rDisplayMode().value ?? null);
const $_headerLength = computed(() => rHeaderLength().value ?? 1);
const $highlightTime = computed(() => rHighlightTime().value ?? null);
const $_columnsWidth = computed(() => rColumnsWidth().value ?? null);
const $_gridCollapseThreshold = computed(
	() => rGridCollapseThreshold().value ?? null
);
const $cellBorders = computed(() => rCellBorders().value ?? null);
const $zoom = computed(() => rZoom().value ?? null);

let locale = inject("wx-i18n", null);
if (!locale) {
	locale = l({ ...en, ...coreEn });
	provide("wx-i18n", locale);
}
const _ = locale.getGroup("gantt");

const containerWidth = ref(0);
const chartContainer = ref(null);
const scalesDiv = ref(null);
const rightContainerHeight = ref(0);
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
			header: $displayMode.value === "chart" ? "" : cols[ni].header,
			cell: $displayMode.value === "chart" ? NameCellCompact : NameCell,
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
	else if ($displayMode.value === "chart")
		width = $_gridCollapseThreshold.value || 0;
	else width = $gridWidth.value;
	columnWidth.value = width;
});

const fitColumns = computed(() =>
	getFitColumns(finalColumns.value, $displayMode.value, "name")
);

const rightColumns = computed(() =>
	getResourceLoadColumns($rScales.value, LoadCell, props.template)
);

const flexBasis = computed(() =>
	getFlexBasis($ganttColumns.value, $displayMode.value, $gridWidth.value)
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
	});
}

function getCellStyle(row, col) {
	const value = getValue(row, col);
	if (value) {
		return value.percent > 100 ? " wx-overload" : " wx-normal";
	}

	if (col.unit !== "day" && col.unit !== "hour") return "";

	const resourceCalendar = props.api.getResourceCalendar(row);
	if (resourceCalendar) {
		const isWorkingDay = resourceCalendar.isWorkingDay(col.date);
		if (!isWorkingDay) return resourceCalendar.css ?? "wx-weekend";
	} else if ($highlightTime.value) return $highlightTime.value(col.date, col.unit);

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

// ResizeObserver for containerWidth
const containerDiv = ref(null);
let containerRo;
onMounted(() => {
	if (containerDiv.value) {
		containerRo = new ResizeObserver(() => {
			containerWidth.value = containerDiv.value?.offsetWidth ?? 0;
		});
		containerRo.observe(containerDiv.value);
		containerWidth.value = containerDiv.value.offsetWidth;
	}
});
onUnmounted(() => {
	containerRo?.disconnect();
});

// ResizeObserver for gridClientWidth
const gridContainerDiv = ref(null);
let gridClientRo;
onMounted(() => {
	if (gridContainerDiv.value) {
		gridClientRo = new ResizeObserver(() => {
			gridClientWidth.value = gridContainerDiv.value?.clientWidth ?? 0;
		});
		gridClientRo.observe(gridContainerDiv.value);
		gridClientWidth.value = gridContainerDiv.value.clientWidth;
	}
});
onUnmounted(() => {
	gridClientRo?.disconnect();
});

// ResizeObserver for rightContainerHeight
const rightContainerDiv = ref(null);
let rightContainerRo;
onMounted(() => {
	if (rightContainerDiv.value) {
		rightContainerRo = new ResizeObserver(() => {
			rightContainerHeight.value =
				rightContainerDiv.value?.clientHeight ?? 0;
		});
		rightContainerRo.observe(rightContainerDiv.value);
		rightContainerHeight.value = rightContainerDiv.value.clientHeight;
	}
});
onUnmounted(() => {
	rightContainerRo?.disconnect();
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
								:sizes="{
									rowHeight: $cellHeight,
									headerHeight: $rScales.height / $_headerLength,
								}"
								:columnStyle="getColumnStyle"
								:data="$rResources"
								:columns="fitColumns"
								:sortMarks="sortMarks"
								:selectedRows="selectedRows"
							/>
						</div>
					</div>
				</div>

				<Resizer :containerWidth="containerWidth" :api="props.api" />
			</template>

			<div class="wx-chart" ref="chartContainer" :onwheel="onWheel">
				<div
					class="wx-timescale-viewport"
					:class="{ 'wx-v-scroll-reserve': rightHasVScroll }"
					ref="scalesDiv"
				>
					<TimeScales :api="props.api" />
				</div>
				<div
					v-if="props.mode === 'grid'"
					class="wx-grid-scale-container"
					ref="rightContainerDiv"
				>
					<Grid
						:init="initRight"
						:columns="rightColumns"
						:data="$rResources"
						:sizes="{
							rowHeight: $cellHeight,
							headerHeight: 0,
						}"
						:selectedRows="selectedRows"
						:rowStyle="() => ($cellBorders === 'column' ? 'wx-column-border' : '')"
						:cellStyle="getCellStyle"
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
.wx-grid-scale-container :deep(.wx-grid .wx-cell.wx-overload) {
	background: var(--wx-gantt-load-danger-color);
}
/* override load cell background for selected rows */
.wx-grid-scale-container :deep(.wx-grid .wx-row.wx-selected .wx-cell) {
	background: var(--wx-table-select-background);
}
</style>
