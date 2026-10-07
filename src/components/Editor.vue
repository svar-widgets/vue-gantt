<script setup>
defineOptions({ name: "GanttEditor" });

import {
	ref,
	shallowRef,
	computed,
	watch,
	watchEffect,
	inject,
	provide,
} from "vue";
import { Editor, registerEditorItem } from "@svar-ui/vue-editor";
import { registerToolbarItem } from "@svar-ui/vue-toolbar";
import { Locale, Tabs } from "@svar-ui/vue-core";
import {
	defaultConstraintTypes,
	getEditorItems,
	prepareEditTask,
	getEditorButtons,
	filterEditorButtons,
	getDateEditorButtons,
	toInclusiveTask,
	fromInclusiveTask,
} from "@svar-ui/gantt-store";
import { dateToString, locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";
import { subscribeLater } from "@svar-ui/lib-vue";

import {
	RichSelect,
	Slider,
	Counter,
	TwoState,
	Checkbox,
} from "@svar-ui/vue-core";
import Links from "./editor/Links.vue";
import DateTimePicker from "./editor/DateTimePicker.vue";
import Resources from "./editor/Resources.vue";
import Segments from "./editor/Segments.vue";
import Constraint from "./editor/Constraint.vue";

registerEditorItem("select", RichSelect);
registerEditorItem("date", DateTimePicker);
registerEditorItem("twostate", TwoState);
registerEditorItem("slider", Slider);
registerEditorItem("counter", Counter);
registerEditorItem("links", Links);
registerEditorItem("checkbox", Checkbox);
registerEditorItem("resources", Resources);
registerEditorItem("segments", Segments);
registerEditorItem("constraint", Constraint);
registerToolbarItem("tabs", Tabs);

const props = defineProps({
	api: { default: null },
	items: { default: () => [] },
	css: { default: "" },
	layout: { default: "default" },
	readonly: { type: Boolean, default: false },
	placement: { default: "sidebar" },
	bottomBar: { type: [Boolean, Object], default: false },
	topBar: { type: [Boolean, Object], default: true },
	autoSave: { type: Boolean, default: true },
	focus: { type: Boolean, default: false },
	hotkeys: { default: () => ({}) },
});

let l = inject("wx-i18n", null);
if (!l) {
	l = locale({ ...en, ...coreEn });
	provide("wx-i18n", l);
}
const _ = l.getGroup("gantt");
const i18nData = l.getRaw();
const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
const dateFormat = dateToString(f, i18nData.calendar);

const activeTask = subscribeLater(() => props.api?.getReactiveState()?._activeTask);
const taskId = subscribeLater(() => props.api?.getReactiveState()?.activeTask);
const unscheduledTasks = subscribeLater(() => props.api?.getReactiveState()?.unscheduledTasks);
const inactiveTasks = subscribeLater(() => props.api?.getReactiveState()?.inactiveTasks);
const rollups = subscribeLater(() => props.api?.getReactiveState()?.rollups);
const summary = subscribeLater(() => props.api?.getReactiveState()?.summary);
const links = subscribeLater(() => props.api?.getReactiveState()?.links);
const splitTasks = subscribeLater(() => props.api?.getReactiveState()?.splitTasks);
const taskTypes = subscribeLater(() => props.api?.getReactiveState()?.taskTypes);
const resources = subscribeLater(() => props.api?.getReactiveState()?.resources ?? null);
const schedule = subscribeLater(() => props.api?.getReactiveState()?.schedule);
const compactMode = subscribeLater(() => props.api?.getReactiveState()?._compactMode);
const deadlines = subscribeLater(() => props.api?.getReactiveState()?.deadlines);
const criticalPath = subscribeLater(() => props.api?.getReactiveState()?.criticalPath);
const inclusiveEnd = subscribeLater(() => props.api?.getReactiveState()?.inclusiveEnd);
const undo = subscribeLater(() => props.api?.getReactiveState()?.undo);

const defBatch = "general";
const activeBatch = ref(defBatch);
const styleCss = computed(() => (compactMode().value ? "wx-full-screen" : ""));

const baseItems = computed(() =>
	getEditorItems({
		unscheduledTasks: unscheduledTasks().value,
		inactiveTasks: inactiveTasks().value,
		rollups: rollups().value,
		summary: summary().value,
		taskTypes: taskTypes().value,
		resources: resources().value,
		splitTasks: splitTasks().value,
		deadlines: deadlines().value,
		schedule: schedule().value,
		criticalPath: criticalPath().value,
	})
);

// Svelte $state does not proxy Map instances, mirror that with shallowRef
const linksActions = shallowRef(new Map());
let taskChanges = null;
const assignmentsActions = shallowRef(new Map());
const segmentsActions = shallowRef(new Map());
const inProgress = ref(null);

const editorValues = ref(undefined);
const editorErrors = ref(null);

const externalValues = {
	taskAssignments: null,
};
const notSavedValues = ref({ ...externalValues });

const task = computed(() => {
	const $activeTask = activeTask().value;
	if (!$activeTask) return null;
	const data = { ...$activeTask };

	if (props.readonly) {
		// preserve parent to differentiate between segment and task
		let values = { parent: data.parent };
		const shown = inclusiveEnd().value
			? toInclusiveTask(data, props.api.getTaskCalendar(data))
			: data;
		baseItems.value.forEach(({ key, comp }) => {
			if (comp !== "links" && comp !== "resources") {
				const value = shown[key];
				if (comp === "date" && value instanceof Date) {
					values[key] = dateFormat(value);
				} else if (comp === "slider" && key === "progress") {
					values[key] = `${value}%`;
				} else if (comp === "constraint") {
					const kind = defaultConstraintTypes.find(
						t => t.id === value?.type
					);
					values[key] = kind
						? `${_(kind.label)}: ${dateFormat(value.date)}`
						: "";
				} else {
					values[key] = value;
				}
			}
		});
		return values;
	}
	return inclusiveEnd().value
		? toInclusiveTask(data, props.api.getTaskCalendar(data))
		: data;
});

// the form shows end-like dates under inclusiveEnd,
// saves and app callbacks get the stored values behind them
const storedValues = shallowRef(null);

watchEffect(() => {
	editorValues.value = task.value;
	const $activeTask = activeTask().value;
	storedValues.value = $activeTask ? { ...$activeTask } : null;
});

watch(taskId, () => {
	linksActions.value = new Map();
	taskChanges = null;
	assignmentsActions.value = new Map();
	segmentsActions.value = new Map();
	editorErrors.value = null;
	inProgress.value = null;
	if (!activeBatch.value) activeBatch.value = defBatch;
	notSavedValues.value = { ...externalValues };
});

// items

function normalizeItems(items, area = "form") {
	if (!props.api || !items || !Array.isArray(items)) return items;
	return items
		.filter(b => {
			if (!storedValues.value) return true;
			return (
				!b.isHidden ||
				!b.isHidden(storedValues.value, props.api.getState())
			);
		})
		.map(b => {
			const item = { ...b };
			if (item.items && Array.isArray(item.items)) {
				item.items = normalizeItems(item.items);
				return item;
			}
			if (area === "form" && !item.batch) {
				item.batch = defBatch;
			}

			if (
				["links", "resources", "segments"].includes(item.key) &&
				props.api
			) {
				item.api = props.api;
				item.autoSave = props.autoSave;
				if (item.key === "resources") {
					item.taskAssignments = notSavedValues.value.taskAssignments;
				} else if (item.key === "links") {
					if (!props.autoSave) item.edits = linksActions.value;
				} else if (item.key === "segments") {
					item.segments = notSavedValues.value.segments;
				}
				item.onextchange = handleExternalChange;
			}
			if (item.key === "constraint") item.task = editorValues.value;
			if (item.id === "tabs") {
				item.api = props.api;
				item.css = "wx-gantt-tabs";
				item.value = activeBatch.value;
				item.onchange = item.onchange || onTabChange;
			}

			if (item.comp === "slider" && item.key === "progress") {
				item.labelTemplate = value => `${_(item.label)} ${value}%`;
			}
			if (item.text) item.text = _(item.text);
			if (item.label) item.label = _(item.label);
			if (item.options) item.options = normalizeItems(item.options);

			if (item.config) item.config = { ...item.config };
			if (item.config?.placeholder)
				item.config.placeholder = _(item.config.placeholder);

			if (item.comp === "date" && props.api) {
				item.config = { ...item.config };
				item.config.buttons = getDateEditorButtons(
					item.key,
					unscheduledTasks().value
				).map(b => _(b));
			}

			if (
				storedValues.value &&
				item.isDisabled &&
				item.isDisabled(
					storedValues.value,
					props.api.getState(),
					props.api.getTaskCalendar(storedValues.value)
				)
			) {
				item.disabled = true;
			} else delete item.disabled;
			return item;
		});
}

const editorItems = computed(() => {
	const eItems = props.items.length ? props.items : baseItems.value;
	return normalizeItems(eItems);
});

const editorBatches = computed(() => new Set(editorItems.value.map(i => i.batch)));

// Reset activeBatch
// (ex. Segments removed when all segments merged/removed)
watch(editorBatches, batches => {
	if (!batches.has(activeBatch.value)) activeBatch.value = defBatch;
});

const editorKeys = computed(() => editorItems.value.map(i => i.key));

function normalizeBar(bar, batches, type) {
	bar = typeof bar !== "object" ? {} : { ...bar };
	if (!bar.items) {
		bar.items = getEditorButtons({
			resources: resources().value,
			autoSave: props.autoSave,
			splitTasks: splitTasks().value,
			deadlines: deadlines().value,
			criticalPath: criticalPath().value,
			inactiveTasks: inactiveTasks().value,
			schedule: schedule().value,
		});
	}
	bar.items = filterEditorButtons(bar.items, item => {
		if (item.id === "tabs") {
			item.type = item.type || type;
			// filter options by batches and hide tabs with one tab
			item.options = item.options.filter(op => batches.has(op.id));
			if (item.options.length < 2) return false;
		}
		return true;
	});
	bar.items = normalizeItems(bar.items, "toolbar");
	if (!bar.layout) {
		const isColumn = bar.items.some(i => i.items);
		bar.layout = isColumn ? "column" : "row";
	}
	return bar;
}

const normalizedTopBar = computed(() => {
	if (!props.topBar || props.readonly) return false;
	return normalizeBar(props.topBar, editorBatches.value, "top");
});

const normalizedBottomBar = computed(() => {
	if (!props.bottomBar || props.readonly) return false;
	return normalizeBar(props.bottomBar, editorBatches.value, "bottom");
});

function handleExternalChange({ view, event, values = {} }) {
	let { id, action, data } = event;
	let actions;
	if (view === "links") actions = linksActions.value;
	else if (view === "resources") actions = assignmentsActions.value;
	else if (view === "segments") actions = segmentsActions.value;
	// edits to one link add up: a type change survives a later lag change
	const prev = actions.get(id);
	if (action === "update-link" && prev?.action === action)
		data = { ...data, link: { ...prev.data.link, ...data.link } };
	actions.set(id, { action, data });
	Object.keys(values).forEach(key => {
		notSavedValues.value[key] = values[key];
	});
}

function saveAll() {
	// removals, then link updates, then the task change: a link update is
	// checked against the saved task
	const edits = [...linksActions.value.values()].filter(e =>
		links().value.byId(e.data.id)
	);
	const steps = [
		...edits.filter(e => e.action === "delete-link"),
		...edits.filter(e => e.action !== "delete-link"),
	];

	const history = props.api.getHistory();
	history?.startBatch();
	steps.forEach(({ action, data }) => props.api.exec(action, data));
	if (taskChanges) save({ ...taskChanges });
	[assignmentsActions.value, segmentsActions.value].forEach(actions => {
		for (let [, value] of actions) {
			const { action, data } = value;
			props.api.exec(action, data);
		}
	});
	history?.endBatch();
	taskChanges = null;
}

function deleteTask() {
	props.api.exec("delete-task", { id: taskId().value });
}

function hide() {
	props.api.exec("show-editor", { id: null });
}

function handleAction(ev) {
	const { item } = ev;
	if (item.id === "delete") {
		deleteTask();
	} else if (item.id === "save") {
		if (editorErrors.value) return;
		saveAll();
	}
	if (item.comp) hide();
}

function handleChange(ev) {
	let { update, key, input } = ev;

	if (input) inProgress.value = true;

	const values = inclusiveEnd().value
		? fromInclusiveTask(update, key, storedValues.value)
		: { ...update };
	storedValues.value = normalizeTask(values, key, input);
	ev.update = inclusiveEnd().value
		? toInclusiveTask(
				storedValues.value,
				props.api.getTaskCalendar(storedValues.value)
			)
		: { ...storedValues.value };

	if (!props.autoSave) editorValues.value = ev.update;
	else if (!editorErrors.value && !input) {
		const item = editorItems.value.find(i => i.key === key);
		const v = update[key];
		const isValid = !item.validation || item.validation(v);
		if (isValid && (!item.required || v)) save({ ...storedValues.value });
	}
}

function normalizeTask(task, key, input) {
	prepareEditTask(task, props.api.getState(), props.api.getTaskCalendar(task), key);
	if (!input) inProgress.value = false;
	return task;
}

function handleSave() {
	if (!props.autoSave) taskChanges = { ...storedValues.value };
}

function handleValidation(check) {
	// get all errors after onchange action
	editorErrors.value = check.errors;
}

function save(values) {
	delete values.links;
	delete values.data;

	if (
		editorKeys.value.indexOf("duration") === -1 ||
		(values.segments && !values.duration)
	)
		delete values.duration;

	const data = {
		id: taskId().value,
		task: values,
	};
	if (props.autoSave && inProgress.value) data.inProgress = inProgress.value;

	props.api.exec("update-task", data);
}

const defaultHotkeys = computed(() =>
	undo().value
		? {
				"ctrl+z": ev => {
					ev.preventDefault();
					props.api.exec("undo");
				},
				"ctrl+y": ev => {
					ev.preventDefault();
					props.api.exec("redo");
				},
			}
		: {}
);

function onTabChange(ev) {
	activeBatch.value = ev.value;
}
</script>

<template>
	<Locale v-if="task">
		<Editor
			:css="`wx-gantt-editor ${styleCss} ${css}`"
			:items="editorItems"
			:values="task"
			:topBar="normalizedTopBar"
			:bottomBar="normalizedBottomBar"
			:placement="placement"
			:layout="layout"
			:readonly="readonly"
			:autoSave="autoSave"
			:focus="focus"
			:activeBatch="activeBatch"
			:onaction="handleAction"
			:onsave="handleSave"
			:onvalidation="handleValidation"
			:onchange="handleChange"
			:hotkeys="hotkeys && { ...defaultHotkeys, ...hotkeys }"
		/>
	</Locale>
</template>

<style>
.wx-sidearea .wx-gantt-editor {
	width: 450px;
	&.wx-full-screen {
		width: 100%;
	}
}

.wx-gantt-editor .wx-editor-toolbar {
	margin-bottom: 4px;
	& .wx-toolbar {
		padding-left: 0;
		padding-right: 0;
		gap: 16px;
	}
	& .wx-tb-body {
		gap: 8px;
	}
	& .wx-tb-element {
		padding-left: 0;
		padding-right: 0;
	}
	/* temp: vue-toolbar 2.6.1 stretches every .wx-tb-element under a
	   column toolbar, which also hits the ones inside row groups */
	& .wx-tb-group:not(.wx-column) > .wx-tb-body > .wx-tb-element {
		width: auto;
	}
	& .wx-gantt-tabs {
		align-self: start;
	}
	& .wx-gantt-tabs .wx-tabs {
		gap: 16px;
	}

	& .wx-gantt-tabs button {
		padding-left: 0;
		padding-right: 0;
		min-width: 40px;
	}
	& .wx-gantt-tabs .wx-active:after,
	& .wx-gantt-tabs button:hover:after {
		width: 100%;
		left: 0;
	}
}
</style>
