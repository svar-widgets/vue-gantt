<script setup>
defineOptions({ name: "GanttGridGrid" });

import { ref, computed, inject, watch, watchEffect, onMounted, onUnmounted, onWatcherCleanup } from "vue";
import { locateID } from "@svar-ui/lib-dom";
import { reorder } from "../../helpers/reorder";
import { prepareEditTask } from "@svar-ui/gantt-store";
import { asDirective, subscribe } from "@svar-ui/lib-vue";

import { Grid } from "@svar-ui/vue-grid";
import TextCell from "./TextCell.vue";
import ActionCell from "./ActionCell.vue";
import ResourcesCell from "./ResourcesCell.vue";
import EditorResourcesCell from "./EditorResourcesCell.vue";
import { setTaskResources } from "../../helpers/setTaskResources.js";

import {
	getGridMinHeight,
	getGridStyle,
	getFlexBasis,
	getScrollX,
	getFitColumns,
	getSortMarks,
	adjustColumns,
	checkFlex,
} from "../../helpers/grid";

const vReorder = asDirective(reorder);

const props = defineProps({
	readonly: {},
	columnWidth: {},
});

const tableAPI = defineModel("tableAPI");

const locale = inject("wx-i18n");
const _ = locale.getGroup("gantt");
const api = inject("gantt-store");

const {
	scrollTop,
	cellHeight,
	focusTask,
	_selected: selected,
	area,
	_tasks: rTasks,
	_scales: scales,
	_headerLength,
	columns: columnsStore,
	_sort: sort,
	durationUnit,
	splitTasks,
	filterValues: filterValuesStore,
	groupBy,
	gridWidth: gridWidthStore,
	displayMode,
	_compactMode,
	_gridCollapseThreshold,
} = api.getReactiveState();

const $scrollTop = subscribe(scrollTop);
const $cellHeight = subscribe(cellHeight);
const $selected = subscribe(selected);
const $area = subscribe(area);
const $rTasks = subscribe(rTasks, true);
const $scales = subscribe(scales);
const $_headerLength = subscribe(_headerLength);
const $columns = subscribe(columnsStore);
const $sort = subscribe(sort);
const $durationUnit = subscribe(durationUnit);
const $splitTasks = subscribe(splitTasks);
const $filterValues = subscribe(filterValuesStore);
const $groupBy = subscribe(groupBy);
const $gridWidth = subscribe(gridWidthStore);
const $displayMode = subscribe(displayMode);
const $_compactMode = subscribe(_compactMode);
const $_gridCollapseThreshold = subscribe(_gridCollapseThreshold);

let dragTask = ref(null);

function execAction(id, action) {
	if (action === "add-task") {
		api.exec(action, {
			target: id,
			task: { text: _("New Task") },
			mode: "child",
			show: true,
			focus: id ? "grid" : null,
		});
	} else if (action === "open-task") {
		const task = tasks.value.find(a => a.id === id);
		if (task.data || task.lazy)
			api.exec(action, { id, mode: !task.open });
	}
}

function onClick(e) {
	if (e.detail > 1) return;
	const id = locateID(e);
	const action = e.target.dataset.action;
	if (action) e.preventDefault();
	if (id) {
		if (action === "add-task" || action === "open-task") {
			execAction(id, action);
		} else {
			api.exec("select-task", {
				id,
				toggle: e.ctrlKey || e.metaKey,
				range: e.shiftKey,
				show: "xy",
				focus: "grid",
			});
		}
	} else if (action === "add-task") {
		execAction(null, action);
	}
}

function onDblClick(e) {
	if (!props.readonly) {
		const id = locateID(e);
		const column = locateID(e, "data-col-id");
		const columnObj = column && cols.value.find(c => c.id === column);
		if (!columnObj?.editor && id) api.exec("show-editor", { id });
	}
}

let lastDetail;
function reorderTasks(detail) {
	const id = detail.id;
	const { before, after } = detail;
	const inProgress = detail.onMove;
	let target = before || after;
	let mode = before ? "before" : "after";
	if (inProgress) {
		if (mode === "after") {
			const index = allTasks.value.findIndex(t => t.id === id);
			const targetIndex = allTasks.value.findIndex(t => t.id === target);
			const task = allTasks.value[targetIndex];
			if (index - targetIndex === 1) {
				mode = "before";
			} else if (task.data && task.open) {
				mode = "before";
				target = task.data[0].id;
			}
		}
		lastDetail = { id, [mode]: target };
	} else lastDetail = null;

	api.exec("move-task", {
		id,
		mode,
		target,
		inProgress,
	});
}

function startReorder({ id }) {
	if (props.readonly) return false;

	if (api.getTask(id).open) api.exec("open-task", { id, mode: false });

	dragTask.value = tasks.value.find(t => t.id === id);
	if (!dragTask.value) return false;
}

function endReorder({ id, top }) {
	//task was moved
	if (lastDetail) reorderTasks({ ...lastDetail, onMove: false });
	//restore previous position
	else {
		api.exec("drag-task", {
			id,
			top: top + scrollDelta.value,
			inProgress: false,
		});
	}
	dragTask.value = null;
}

function moveReorder({ id, top, detail }) {
	if (detail) {
		reorderTasks({ ...detail, onMove: true });
	}

	api.exec("drag-task", {
		id,
		top: top + scrollDelta.value,
		inProgress: true,
	});
}

const gridClientWidth = ref(0);
const gridClientHeight = ref(0);

const tableContainer = ref(null);
const updateFlex = ref(false);

function handleHotkey(ev) {
	const { key, isInput } = ev;
	if (!isInput && (key === "arrowup" || key === "arrowdown")) {
		ev.eventSource = "grid";
		api.exec("hotkey", ev);
		return false;
	} else if (key === "enter") {
		const focusCell = tableAPI.value.getState().focusCell;
		if (focusCell) {
			const { row, column } = focusCell;
			if (column === "add-task") {
				execAction(row, "add-task");
			} else if (column === "text") {
				execAction(row, "open-task");
			}
		}
	}
}

function init(tapi) {
	tableAPI.value = tapi;
	tapi.intercept("hotkey", handleHotkey);
	tapi.intercept("select-row", () => false);
	tapi.intercept("scroll", () => false);
	tapi.intercept("sort-rows", ev => {
		const { key, add } = ev;
		let keySort = $sort.value ? $sort.value.find(s => s.key === key) : null;
		let order = "asc";
		if (keySort)
			order = !keySort || keySort.order === "asc" ? "desc" : "asc";

		api.exec("sort-tasks", {
			key,
			order,
			add,
		});
		return false;
	});
	tapi.intercept("filter-rows", ev => {
		const { key, value } = ev;

		api.exec("filter-tasks", {
			key,
			value,
			open: true,
		});
		return false;
	});

	tapi.on("resize-column", () => {
		setColumnWidth(true);
	});

	tapi.on("hide-column", ev => {
		if (!ev.mode) adjustColumns(cols.value);
		setColumnWidth();
	});

	tapi.intercept("update-cell", e => {
		const { id, column, value } = e;
		const task = tasks.value.find(t => t.id === id);
		if (task) {
			if (column === "resources") {
				setTaskResources(id, value, api);
				return;
			}

			const update = { ...task };
			let v = value;
			if (v && !isNaN(v) && !(v instanceof Date)) v *= 1;
			update[column] = v;
			prepareEditTask(
				update,
				{
					durationUnit: $durationUnit.value,
					splitTasks: $splitTasks.value,
				},
				api.getTaskCalendar(update),
				column
			);

			api.exec("update-task", {
				id: id,
				task: update,
			});
		}
		return false;
	});
}

// COLUMNS
// --------

const cols = computed(() => {
	let colsArr = $columns.value.map(col => {
		col = { ...col };
		const header = [...col.header];
		header.forEach(line => {
			if (line.text) line.text = _(line.text);
		});
		col.header = header;
		return col;
	});

	const ti = colsArr.findIndex(c => c.id === "text");
	const ai = colsArr.findIndex(c => c.id === "add-task");
	const ri = colsArr.findIndex(c => c.id === "resources");

	if (ti !== -1) {
		if (colsArr[ti].cell) colsArr[ti]._cell = colsArr[ti].cell;
		colsArr[ti].cell = TextCell;
	}
	if (ri !== -1) {
		const resCol = colsArr[ri];
		if (!resCol.cell) resCol.cell = ResourcesCell;
		if (resCol.editor && typeof resCol.editor !== "function") {
			const editor = resCol.editor;
			const config = editor.config;
			if (!config.cell) config.cell = EditorResourcesCell;
			config.cell = EditorResourcesCell;
			if (!config.dropdown) config.dropdown = { width: "auto" };
			resCol.editor = row => {
				if (row.type !== "summary") return editor;
			};
		}
	}
	if (ai !== -1) {
		colsArr[ai].cell = colsArr[ai].cell || ActionCell;
		const header = colsArr[ai].header[0];
		colsArr[ai].header[0].cell = header.cell || ActionCell;

		if (props.readonly) {
			colsArr.splice(ai, 1);
		} else {
			if ($_compactMode.value) {
				const [actionCol] = colsArr.splice(ai, 1);
				colsArr.unshift(actionCol);
			}
		}
	}

	if (colsArr.length > 0) colsArr[colsArr.length - 1].resize = false;
	return colsArr;
});

function getColumnStyle(col) {
	let style = `wx-text-${col.align} `;

	if (col.id === "add-task") style += "wx-action ";
	else if (col.id === "wbs") style += "wx-wbs ";

	return style.trim();
}

// SIZES
// --------
const scrollDelta = computed(() => $area.value.from);
const headerHeight = computed(() => $scales.value.height);
const flexBasis = computed(() =>
	getFlexBasis($columns.value, $displayMode.value, $gridWidth.value)
);
const scrollX = computed(() =>
	getScrollX(
		$_compactMode.value,
		$displayMode.value,
		props.columnWidth,
		gridClientWidth.value,
		$gridWidth.value
	)
);
const tableHeight = computed(() =>
	getGridMinHeight(gridClientHeight.value, $cellHeight.value)
);
const tableStyle = computed(() =>
	tableHeight.value + getGridStyle($displayMode.value, props.columnWidth, scrollX.value)
);

// --------
// SELECTION
// --------
const sel = computed(() => $selected.value.map(o => o.id));

// --------
// TASKS
// --------
const tasks = computed(() => $rTasks.value.slice($area.value.start, $area.value.end));
const allTasks = computed(() => {
	const rows =
		dragTask.value && !tasks.value.find(t => t.id === dragTask.value.id)
			? [...tasks.value, dragTask.value]
			: tasks.value;
	return rows.map(t => ({ ...t }));
});

const hasFlexCol = computed(() => {
	updateFlex.value;
	return checkFlex(cols.value);
});

function setColumnWidth(resized) {
	if (!checkFlex(cols.value)) {
		const newColumnWidth = fitColumns.value.reduce((acc, col) => {
			if (resized && col.$width) col.$width = col.width;
			return acc + (col.hidden ? 0 : col.width);
		}, 0);
		if (newColumnWidth !== props.columnWidth) {
			// columnWidth is a regular prop — parent must handle updates via callback/model
		}
	}
	// hasFlexCol update
	updateFlex.value = true;
	updateFlex.value = false;
}

const sortMarks = computed(() => getSortMarks(allTasks.value, $sort.value));

// preserve filters while sorting
const filters = computed(() => {
	return sortMarks.value ? { ...$filterValues.value } : $filterValues.value;
});

const fitColumns = computed(() =>
	getFitColumns(
		cols.value,
		props.columnWidth,
		$displayMode.value,
		gridClientWidth.value,
		$gridWidth.value,
		hasFlexCol.value,
		$_gridCollapseThreshold.value
	)
);

const bodyOffset = computed(() => scrollDelta.value - $scrollTop.value);

// ResizeObserver for clientWidth/clientHeight
let resizeObserver;
onMounted(() => {
	if (tableContainer.value) {
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				gridClientWidth.value = entry.contentRect.width;
				gridClientHeight.value = entry.contentRect.height;
			}
		});
		resizeObserver.observe(tableContainer.value);
	}
});
onUnmounted(() => {
	resizeObserver?.disconnect();
});

let pending = false;
const $focusTask = subscribe(focusTask);
watch($focusTask, (value) => {
	if (!value) return;
	const { id, column } = value;
	// focus a new cell
	if (column) {
		if (!pending) {
			pending = true;
			requestAnimationFrame(() => {
				const { focusCell, editor } = tableAPI.value.getState();
				if (!editor) {
					tableAPI.value.exec("focus-cell", {
						row: id,
						column: focusCell?.column || cols.value[0]?.id,
					});
					pending = false;
				}
			});
		}
	}
});

const reorderConfig = computed(() => ({
	isDisabled: () => !!$groupBy.value?.field,
	start: startReorder,
	end: endReorder,
	move: moveReorder,
	getTask: api.getTask,
}));

const selectedRows = computed(() => [...sel.value]);
const gridSizes = computed(() => ({
	rowHeight: $cellHeight.value,
	headerHeight: headerHeight.value / $_headerLength.value,
}));
</script>

<template>
	<div
		class="wx-table-container"
		:style="{ flex: `0 0 ${flexBasis}` }"
		ref="tableContainer"
	>
		<div
			:style="`${tableStyle}--wx-body-offset:${bodyOffset}px;`"
			class="wx-table"
			v-reorder="reorderConfig"
			@click="onClick"
			@dblclick="onDblClick"
		>
			<Grid
				:init="init"
				:sizes="gridSizes"
				:rowStyle="row => (row.$reorder ? 'wx-reorder-task' : '')"
				:columnStyle="getColumnStyle"
				:data="allTasks"
				:columns="fitColumns"
				:selectedRows="selectedRows"
				:sortMarks="sortMarks"
				:filterValues="filters"
			/>
		</div>
	</div>
</template>

<style scoped>
.wx-table-container {
	display: flex;
	flex-direction: column;
	border-right: var(--wx-gantt-border);
	overflow-x: auto;
	overflow-y: hidden;
	height: 100%;
	box-sizing: content-box;
}

/*table*/
.wx-table {
	--wx-table-select-background: var(--wx-gantt-select-color);
	--wx-table-select-focus-background: var(--wx-gantt-select-color);
	--wx-table-select-border: none;
	--wx-table-cell-border: var(--wx-grid-body-row-border);
	--wx-table-header-background: var(--wx-background);
	--wx-table-header-border: var(--wx-gantt-border);
	--wx-table-header-cell-border: var(--wx-gantt-border);
	height: 100%;
}
.wx-table :deep(.wx-grid .wx-table-box) {
	border: none;
}
.wx-table :deep(.wx-grid .wx-scroll) {
	overflow: visible !important;
}
.wx-table :deep(.wx-grid .wx-scroll .wx-body) {
	top: var(--wx-body-offset, 0);
}
.wx-table :deep(.wx-grid .wx-scroll .wx-body),
.wx-table :deep(.wx-grid .wx-scroll .wx-header) {
	width: 100% !important;
}
/*body*/
.wx-table :deep(.wx-grid .wx-cell) {
	padding: 0 5px;
	height: 100%;
	display: flex;
	align-items: center;
	outline: none;
}
.wx-table :deep(.wx-grid .wx-row) {
	display: flex;
	align-items: center;
}
.wx-table :deep(.wx-grid .wx-cell.wx-text-center) {
	justify-content: center;
}
.wx-table :deep(.wx-grid .wx-cell.wx-text-right) {
	justify-content: end;
}
.wx-table :deep(.wx-grid .wx-body .wx-cell) {
	border-right: var(--wx-grid-body-cell-border);
}
.wx-table :deep(.wx-grid .wx-cell:has(input, .wx-value)) {
	height: 100%;
	padding: 0;
}
/*header*/
.wx-table :deep(.wx-grid .wx-header .wx-cell) {
	font: var(--wx-grid-header-font);
	text-transform: var(--wx-grid-header-text-transform);
	padding: 0 5px;
	border-bottom-color: transparent;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell:first-child) {
	padding-left: 14px;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell .wx-text) {
	width: 100%;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell:has(.wx-sort) .wx-text) {
	width: calc(100% - 15px);
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-right) {
	text-align: right;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-center) {
	text-align: center;
	padding-left: 5px;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-center.wx-action) {
	justify-content: center;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-right.wx-action) {
	justify-content: right;
}
.wx-table :deep(.wx-grid .wx-row .wx-cell.wx-wbs) {
	padding: 0 14px;
}
/*drag element*/
.wx-table :deep(.wx-grid .wx-reorder-task.wx-row) {
	width: 100%;
	background: var(--wx-background-alt);
	border-top: var(--wx-grid-body-row-border);
}
.wx-table :deep(.wx-grid .wx-reorder-task.wx-selected) {
	background: var(--wx-gantt-select-color);
	border-top: transparent;
	border-bottom: transparent;
}
</style>
