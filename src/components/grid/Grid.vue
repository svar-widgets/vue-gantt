<script setup>
defineOptions({ name: "GanttGridGrid" });

import {
	ref,
	computed,
	inject,
	watch,
	watchEffect,
	onMounted,
	onUnmounted,
} from "vue";
import { locateID } from "@svar-ui/lib-dom";
import { reorder, followReorder } from "../../helpers/reorder";
import {
	prepareEditTask,
	setTaskResources,
	getHeaderLength,
	isPlaceholder,
	getPlaceholderTask,
} from "@svar-ui/gantt-store";
import { asDirective, subscribe } from "@svar-ui/lib-vue";

import { Grid } from "@svar-ui/vue-grid";
import TextCell from "./TextCell.vue";
import ActionCell from "./ActionCell.vue";
import ResourcesCell from "./ResourcesCell.vue";
import EditorResourcesCell from "./EditorResourcesCell.vue";

import {
	getGridMinHeight,
	getGridStyle,
	getFlexBasis,
	getScrollX,
	getFitColumns,
	getFillColumn,
	getColumnsWidth,
	getSortMarks,
	getColumnStyle,
} from "../../helpers/grid";

const vReorder = asDirective(reorder);
const vFollowReorder = asDirective(followReorder);

const props = defineProps({
	readonly: {},
	section: { default: "grid" },
});

const tableAPI = defineModel("tableAPI");

const isSubGrid = computed(() => props.section === "subGrid");

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
	_columns,
	_sort: sort,
	durationUnit,
	inclusiveEnd,
	splitTasks,
	unscheduledTasks,
	inactiveTasks,
	filterValues: filterValuesStore,
	groupBy,
	gridWidth: gridWidthStore,
	subGridWidth,
	_displayPanels,
	_compactMode,
	_columnsWidth,
} = api.getReactiveState();

const $scrollTop = subscribe(scrollTop);
const $cellHeight = subscribe(cellHeight);
const $selected = subscribe(selected);
const $area = subscribe(area);
const $rTasks = subscribe(rTasks, true);
const $scales = subscribe(scales);
const $_columns = subscribe(_columns);
const $sort = subscribe(sort);
const $durationUnit = subscribe(durationUnit);
const $inclusiveEnd = subscribe(inclusiveEnd);
const $splitTasks = subscribe(splitTasks);
const $unscheduledTasks = subscribe(unscheduledTasks);
const $inactiveTasks = subscribe(inactiveTasks);
const $filterValues = subscribe(filterValuesStore);
const $groupBy = subscribe(groupBy);
const $gridWidth = subscribe(gridWidthStore);
const $subGridWidth = subscribe(subGridWidth);
const $_displayPanels = subscribe(_displayPanels);
const $_compactMode = subscribe(_compactMode);
const $_columnsWidth = subscribe(_columnsWidth);

const panelWidth = computed(() =>
	isSubGrid.value ? $subGridWidth.value : $gridWidth.value
);
const fillRemaining = computed(
	() => isSubGrid.value && !$_displayPanels.value.includes("chart")
);

const dragTask = ref(null);

const columnWidth = ref(0);

function execAction(id, action) {
	// no task behind the placeholder to target
	if (isPlaceholder(id)) return;
	if (action === "add-task") {
		api.exec(action, {
			target: id,
			task: { text: _("New task") },
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

function createPlaceholder(task) {
	const ev = {
		task: getPlaceholderTask(task, _("New task")),
		show: true,
		eventSource: "placeholder",
	};
	api.exec("add-task", ev);
	return ev.id;
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
				focus: isSubGrid.value ? "subGrid" : "grid",
			});
		}
	} else if (action === "add-task") {
		execAction(null, action);
	}
}

function onDblClick(e) {
	if (!props.readonly) {
		const id = locateID(e);
		if (isPlaceholder(id)) return;
		const column = locateID(e, "data-col-id");
		const columnObj = column && cols.value.find(c => c.id === column);
		if (!columnObj?.editor && id && !isSubGrid.value)
			api.exec("show-editor", { id });
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
			} else if (!$groupBy.value?.field && task.data && task.open) {
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
	if (props.readonly || isSubGrid.value) return false;
	if ($groupBy.value?.field) {
		const task = api.getTask(id);
		if (task.$group || task.data) return false;
	}

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

function handleHotkey(ev) {
	const { key, isInput } = ev;
	if (!isInput && (key === "arrowup" || key === "arrowdown")) {
		ev.eventSource = isSubGrid.value ? "subGrid" : "grid";
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

	tapi.intercept("resize-column", ev => {
		ev.flexgrowFallback = getFillColumn(cols.value, ev.id);
	});

	tapi.on("resize-column", ev => {
		const columns = tapi.getState().columns;
		columnWidth.value = getColumnsWidth(columns);
		if (ev.inProgress !== true) api.exec("set-columns", { columns });
	});

	tapi.on("hide-column", () => {
		const columns = tapi.getState().columns;
		columnWidth.value = getColumnsWidth(columns);
		api.exec("set-columns", { columns });
	});

	tapi.intercept("update-cell", e => {
		const { id, column, value } = e;
		const task = tasks.value.find(t => t.id === id);
		if (task) {
			if (column === "resources") {
				if (task.$placeholder) {
					const history = api.getHistory();
					if (history) history.startBatch();
					const newId = createPlaceholder(task);
					if (newId) setTaskResources(newId, value, api);
					if (history) history.endBatch();
				} else setTaskResources(id, value, api);
				return;
			}

			let v = value;
			if (
				typeof v !== "boolean" &&
				v &&
				!isNaN(v) &&
				!(v instanceof Date)
			)
				v *= 1;
			const update = { ...task };
			const col = $_columns.value.find(c => c.id === column);
			if (col?.setter) col.setter(update, v);
			else update[column] = v;
			prepareEditTask(
				update,
				{
					durationUnit: $durationUnit.value,
					splitTasks: $splitTasks.value,
					unscheduledTasks: $unscheduledTasks.value,
				},
				api.getTaskCalendar(update),
				column
			);

			if (task.$placeholder) {
				createPlaceholder(update);
			} else {
				api.exec("update-task", {
					id: id,
					task: update,
				});
			}
		}
		return false;
	});
}

// COLUMNS
// --------

const cols = computed(() => {
	// end-like column getters read the mode: new columns redraw the cells
	$inclusiveEnd.value;
	let colsArr = $_columns.value.map(col => {
		col = { ...col };
		const header = [...col.header];
		header.forEach(line => {
			if (line.text) line.text = _(line.text);
		});
		col.header = header;
		// in readonly mode we must disable column inline editors entirely.
		// otherwise grid will open per-cell editors on dblclick.
		col.editor = props.readonly ? null : col.editor;
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
	if (ai !== -1 && !isSubGrid.value) {
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

	colsArr = colsArr.filter(c => (c.section || "grid") === props.section);
	if (colsArr.length > 0) colsArr[colsArr.length - 1].resize = false;
	return colsArr;
});

watchEffect(
	() => {
		columnWidth.value = getColumnsWidth(cols.value);
	},
	{ flush: "pre" }
);

// SIZES
// --------
const scrollDelta = computed(() => $area.value.from);
const headerHeight = computed(() => $scales.value.height);
const flexBasis = computed(() =>
	getFlexBasis(
		$_columns.value,
		$_displayPanels.value,
		panelWidth.value,
		props.section,
		fillRemaining.value
	)
);
const scrollX = computed(() =>
	getScrollX(
		$_compactMode.value,
		$_displayPanels.value,
		columnWidth.value,
		gridClientWidth.value,
		panelWidth.value,
		props.section,
		fillRemaining.value
	)
);
const tableHeight = computed(() =>
	getGridMinHeight(gridClientHeight.value, $cellHeight.value)
);
const tableStyle = computed(
	() =>
		tableHeight.value +
		getGridStyle(
			$_displayPanels.value,
			columnWidth.value,
			scrollX.value,
			props.section
		)
);

// --------
// SELECTION
// --------
const sel = computed(() => $selected.value.map(o => o.id));

// --------
// TASKS
// --------
const tasks = computed(() => $rTasks.value.slice($area.value.start, $area.value.end));
const reorderTask = computed(() =>
	isSubGrid.value ? $rTasks.value.find(task => task.$reorder) : null
);
const allTasks = computed(() => {
	const extra = dragTask.value || reorderTask.value;
	const rows =
		extra && !tasks.value.find(t => t.id === extra.id)
			? [...tasks.value, extra]
			: tasks.value;
	return rows.map(t => ({ ...t }));
});

const sortMarks = computed(() => getSortMarks(allTasks.value, $sort.value));

// preserve filters while sorting
const filters = computed(() => {
	return sortMarks.value ? { ...$filterValues.value } : $filterValues.value;
});

const fitColumns = computed(() =>
	getFitColumns(
		cols.value,
		$_displayPanels.value,
		props.section,
		"add-task",
		$_columnsWidth.value
	)
);
const visibleHeaderLength = computed(() => getHeaderLength(fitColumns.value));

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

let focusFrame;
const $focusTask = subscribe(focusTask);
watch($focusTask, value => {
	if (!value) return;
	const { id, section } = value;
	if (section !== (isSubGrid.value ? "subGrid" : "grid")) return;
	if (focusFrame) return;
	focusFrame = requestAnimationFrame(() => {
		focusFrame = 0;
		const { focusCell, editor } = tableAPI.value.getState();
		if (!editor) {
			tableAPI.value.exec("focus-cell", {
				row: id,
				column: focusCell?.column || cols.value[0]?.id,
			});
		}
	});
});

onUnmounted(() => {
	resizeObserver?.disconnect();
	if (focusFrame) cancelAnimationFrame(focusFrame);
	tableAPI.value = null;
});

const reorderConfig = {
	start: startReorder,
	end: endReorder,
	move: moveReorder,
	getTask: api.getTask,
};
const followReorderConfig = computed(() =>
	isSubGrid.value ? { api } : null
);

const rowStyle = computed(() => {
	const inactive = $inactiveTasks.value;
	return row => {
		let style = row.$placeholder
			? "wx-placeholder-row"
			: row.$reorder
				? "wx-reorder-task"
				: "";
		if (inactive && row.inactive)
			style += (style ? " " : "") + "wx-inactive-row";
		return style;
	};
});

const selectedRows = computed(() => [...sel.value]);
const gridSizes = computed(() => ({
	rowHeight: $cellHeight.value,
	headerHeight: headerHeight.value / visibleHeaderLength.value,
}));
</script>

<template>
	<div
		class="wx-table-container"
		:class="{ 'wx-table-container-subgrid': isSubGrid }"
		:data-gantt-section="section"
		:style="{
			flex: `${fillRemaining ? '1 1' : '0 0'} ${flexBasis}`,
			minWidth: '0',
		}"
		ref="tableContainer"
	>
		<div
			:style="`${tableStyle}--wx-body-offset:${bodyOffset}px;`"
			class="wx-table"
			v-reorder="reorderConfig"
			v-follow-reorder="followReorderConfig"
			@click="onClick"
			@dblclick="onDblClick"
		>
			<Grid
				:init="init"
				:sizes="gridSizes"
				:rowStyle="rowStyle"
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

.wx-table-container-subgrid {
	border-right: none;
	border-left: var(--wx-gantt-border);
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
	padding: 0 var(--wx-grid-cell-padding-x);
	height: 100%;
	display: flex;
	align-items: center;
}
.wx-table :deep(.wx-body .wx-cell:not([tabindex="0"])) {
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
.wx-table :deep(.wx-grid .wx-body .wx-cell.wx-col-text) {
	padding-left: var(--wx-grid-tree-column-padding-left);
}
/*header*/
.wx-table :deep(.wx-grid .wx-header .wx-cell) {
	font: var(--wx-grid-header-font);
	text-transform: var(--wx-grid-header-text-transform);
}
.wx-table :deep(.wx-grid .wx-header .wx-h-row:not(:last-child) .wx-cell) {
	border-bottom-color: transparent;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-filter) {
	padding: 0 5px;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell:has(.wx-sort)) {
	padding-right: var(--wx-grid-header-sort-padding-right);
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
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-center.wx-action) {
	justify-content: center;
}
.wx-table :deep(.wx-grid .wx-header .wx-cell.wx-text-right.wx-action) {
	justify-content: right;
}

/*drag element*/
.wx-table :deep(.wx-grid .wx-reorder-task.wx-row) {
	width: 100%;
	background: var(--wx-background-alt);
	border-top: var(--wx-grid-body-row-border);
	z-index: 1;
}
.wx-table :deep(.wx-grid .wx-reorder-task.wx-selected) {
	background: var(--wx-gantt-select-color);
	border-top: transparent;
	border-bottom: transparent;
}
.wx-table :deep(.wx-grid .wx-inactive-row.wx-row) {
	color: var(--wx-gantt-inactive-color);
}
/*placeholder row*/
.wx-table :deep(.wx-grid .wx-placeholder-row) {
	color: var(--wx-color-font-disabled);
}
</style>
