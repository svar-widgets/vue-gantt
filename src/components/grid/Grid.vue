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

const vReorder = asDirective(reorder);

const props = defineProps({
	readonly: {},
	compactMode: {},
	width: { default: 0 },
	columnWidth: {},
});

const display = defineModel("display", { default: "all" });
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
	calendar,
	durationUnit,
	splitTasks,
	filterValues: filterValuesStore,
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
const $calendar = subscribe(calendar);
const $durationUnit = subscribe(durationUnit);
const $splitTasks = subscribe(splitTasks);
const $filterValues = subscribe(filterValuesStore);

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

const gridWidth = ref(0);
const gridHeight = ref(0);

const table = ref(null);
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
	tapi.intercept("scroll", () => false);
	tapi.intercept("select-row", () => false);
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
		if (!ev.mode) adjustColumns();
		setColumnWidth();
	});

	tapi.intercept("update-cell", e => {
		const { id, column, value } = e;
		const task = tasks.value.find(t => t.id === id);

		if (task) {
			const update = { ...task };
			let v = value;
			if (v && !isNaN(v) && !(v instanceof Date)) v *= 1;
			update[column] = v;

			prepareEditTask(
				update,
				{
					calendar: $calendar.value,
					durationUnit: $durationUnit.value,
					splitTasks: $splitTasks.value,
				},
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

	if (ti !== -1) {
		if (colsArr[ti].cell) colsArr[ti]._cell = colsArr[ti].cell;
		colsArr[ti].cell = TextCell;
	}
	if (ai !== -1) {
		colsArr[ai].cell = colsArr[ai].cell || ActionCell;
		const header = colsArr[ai].header[0];
		colsArr[ai].header[0].cell = header.cell || ActionCell;

		if (props.readonly) {
			colsArr.splice(ai, 1);
		} else {
			if (props.compactMode) {
				const [actionCol] = colsArr.splice(ai, 1);
				colsArr.unshift(actionCol);
			}
		}
	}

	if (colsArr.length > 0) colsArr[colsArr.length - 1].resize = false;
	return colsArr;
});

// SIZES
// --------
const scrollDelta = computed(() => $area.value.from);
const headerHeight = computed(() => $scales.value.height);
const scrollX = computed(() =>
	!props.compactMode && display.value !== "grid"
		? props.columnWidth > props.width
		: props.columnWidth > gridWidth.value
);
const basis = computed(() =>
	display.value === "all"
		? `${props.width}px`
		: display.value === "grid"
			? "calc(100% - 4px)"
			: cols.value.find(c => c.id === "add-task")
				? "50px"
				: "0"
);
const tableHeight = computed(() =>
	`min-height:${gridHeight.value + $cellHeight.value * 4}px;`
);
const tableStyle = computed(() =>
	tableHeight.value +
		(scrollX.value && display.value === "all"
			? `width:${props.columnWidth}px;`
			: display.value === "grid"
				? scrollX.value
					? `width:${props.columnWidth}px;`
					: `width:100%;`
				: ``)
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

function checkFlex() {
	return cols.value.some(c => c.flexgrow && !c.hidden);
}

const hasFlexCol = computed(() => {
	updateFlex.value;
	return checkFlex();
});

function setColumnWidth(resized) {
	if (!checkFlex()) {
		const newColumnWidth = fitColumns.value.reduce((acc, col) => {
			if (resized && col.$width) col.$width = col.width;
			return acc + (col.hidden ? 0 : col.width);
		}, 0);
		if (newColumnWidth !== props.columnWidth) {
			// columnWidth comes from props, emit update
			// Since columnWidth is a regular prop (not defineModel), we cannot mutate it directly.
			// The parent should handle this via v-model or callback.
			// For now, we keep the same pattern - columnWidth is read from props.
		}
	}
	// hasFlexCol update
	updateFlex.value = true;
	updateFlex.value = false;
}

// reset widths of columns
// after a column has been shown
function adjustColumns() {
	const flexCols = cols.value.filter(c => c.flexgrow && !c.hidden);
	if (flexCols.length === 1)
		cols.value.forEach(c => {
			if (c.$width && !c.flexgrow && !c.hidden) c.width = c.$width;
		});
}

const sortMarks = computed(() => {
	if (allTasks.value && $sort.value?.length) {
		const marks = {};
		$sort.value.forEach(({ key, order }, index) => {
			marks[key] = {
				order,
				...($sort.value.length > 1 && { index }),
			};
		});
		return marks;
	}
	return {};
});

// preserve filters while sorting
const filters = computed(() => {
	return sortMarks.value ? { ...$filterValues.value } : $filterValues.value;
});

const fitColumns = computed(() => {
	let filteredColumns =
		display.value === "chart" ? cols.value.filter(c => c.id === "add-task") : cols.value;

	// Adjust widths if needed
	const containerWidth = display.value === "all" ? props.width : gridWidth.value;
	if (!hasFlexCol.value) {
		let baseColumnWidth = props.columnWidth;
		let forceReset = false;
		if (cols.value.some(c => c.$width)) {
			let actualWidth = 0;
			baseColumnWidth = cols.value.reduce((acc, col) => {
				if (!col.hidden) {
					actualWidth += col.width;
					acc += col.$width || col.width;
				}
				return acc;
			}, 0);

			// Force widths reset when "display" "grid" changed to "all"
			if (
				actualWidth > baseColumnWidth &&
				baseColumnWidth >= containerWidth
			)
				forceReset = true;
		}

		if (forceReset || baseColumnWidth < containerWidth) {
			let k = 1;
			if (!forceReset)
				k = (containerWidth - 50) / (baseColumnWidth - 50 || 1);
			return filteredColumns.map(c => {
				if (c.id !== "add-task" && !c.hidden) {
					if (!c.$width) c.$width = c.width;
					c.width = c.$width * k;
				}
				return c;
			});
		}
	}
	return filteredColumns;
});

// --------
// SCROLLS AND TOP ROW OFFSET
// --------

function setScrollOffset() {
	// hack to align scroll
	if (table.value && allTasks.value !== null)
		table.value.querySelector(".wx-body").style.top =
			-($scrollTop.value - scrollDelta.value) + "px";
}

watchEffect(() => {
	if (table.value) {
		$scrollTop.value;
		scrollDelta.value;
		setScrollOffset();
	}
});

// Observe grid inner container and set offset on size change
watchEffect(() => {
	if (table.value) {
		// Touch reactive dependencies to track them
		fitColumns.value;
		tableStyle.value;
		display.value;
		basis.value;
		allTasks.value;
		const ro = new ResizeObserver(() => {
			setScrollOffset();
		});
		ro.observe(table.value.querySelector(".wx-table-box .wx-body"));
		onWatcherCleanup(() => {
			ro.disconnect();
		});
	}
});

// ResizeObserver for clientWidth/clientHeight
let resizeObserver;
onMounted(() => {
	if (tableContainer.value) {
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				gridWidth.value = entry.contentRect.width;
				gridHeight.value = entry.contentRect.height;
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
				const focusCell = tableAPI.value.getState().focusCell;
				tableAPI.value.exec("focus-cell", {
					row: id,
					column: focusCell?.column || cols.value[0]?.id,
				});
				pending = false;
			});
		}
	}
});

const reorderConfig = computed(() => ({
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
		:style="{ flex: `0 0 ${basis}` }"
		ref="tableContainer"
	>
		<div
			ref="table"
			:style="tableStyle"
			class="wx-table"
			v-reorder="reorderConfig"
			@click="onClick"
			@dblclick="onDblClick"
		>
			<Grid
				:init="init"
				:sizes="gridSizes"
				:rowStyle="row => (row.$reorder ? 'wx-reorder-task' : '')"
				:columnStyle="col =>
					`wx-text-${col.align} ${col.id === 'add-task' ? 'wx-action' : ''}`"
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
.wx-table :deep(.wx-grid .wx-scroll .wx-body),
.wx-table :deep(.wx-grid .wx-scroll .wx-header) {
	width: 100% !important;
}
.wx-table :deep(.wx-grid) {
	font: var(--wx-grid-body-font);
	color: var(--wx-grid-body-font-color);
}
/*body*/
.wx-table :deep(.wx-grid .wx-cell) {
	padding: 0 5px;
	height: 100%;
	display: flex;
	align-items: center;
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
.wx-table :deep(.wx-grid .wx-header) {
	box-shadow: var(--wx-grid-header-shadow);
	z-index: 1;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell) {
	font: var(--wx-grid-header-font);
	text-transform: var(--wx-grid-header-text-transform);
	color: var(--wx-grid-header-font-color);
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
.wx-table :deep(.wx-grid .wx-header .wx-action i) {
	font-size: var(--wx-icon-size);
	color: var(--wx-gantt-icon-color);
}
.wx-table :deep(.wx-grid .wx-header .wx-action .wx-text) {
	display: none;
}
.wx-table :deep(.wx-grid .wx-header .wx-action i:hover) {
	color: var(--wx-color-link);
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
