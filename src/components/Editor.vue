<script setup>
defineOptions({ name: "GanttEditor" });

import { ref, computed, watch, watchEffect, inject, provide } from "vue";
import { Editor, registerEditorItem } from "@svar-ui/vue-editor";
import { registerToolbarItem } from "@svar-ui/vue-toolbar";
import { Locale, Tabs } from "@svar-ui/vue-core";
import {
	getEditorItems,
	prepareEditTask,
	getEditorButtons,
	filterEditorButtons,
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

registerEditorItem("select", RichSelect);
registerEditorItem("date", DateTimePicker);
registerEditorItem("twostate", TwoState);
registerEditorItem("slider", Slider);
registerEditorItem("counter", Counter);
registerEditorItem("links", Links);
registerEditorItem("checkbox", Checkbox);
registerEditorItem("resources", Resources);
registerEditorItem("segments", Segments);
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
const rollups = subscribeLater(() => props.api?.getReactiveState()?.rollups);
const summary = subscribeLater(() => props.api?.getReactiveState()?.summary);
const links = subscribeLater(() => props.api?.getReactiveState()?.links);
const splitTasks = subscribeLater(() => props.api?.getReactiveState()?.splitTasks);
const taskTypes = subscribeLater(() => props.api?.getReactiveState()?.taskTypes);
const resources = subscribeLater(() => props.api?.getReactiveState()?.resources ?? null);
const compactMode = subscribeLater(() => props.api?.getReactiveState()?._compactMode);
const undo = subscribeLater(() => props.api?.getReactiveState()?.undo);

const defBatch = "general";
const activeBatch = ref(defBatch);
const styleCss = computed(() => (compactMode().value ? "wx-full-screen" : ""));

const baseItems = computed(() =>
	getEditorItems({
		unscheduledTasks: unscheduledTasks().value,
		rollups: rollups().value,
		summary: summary().value,
		taskTypes: taskTypes().value,
		resources: resources().value,
		splitTasks: splitTasks().value,
	})
);

const linksActions = ref(new Map());
const assignmentsActions = ref(new Map());
const segmentsActions = ref(new Map());
const inProgress = ref(null);

const editorValues = ref(undefined);
const editorErrors = ref(null);

const externalValues = {
	taskAssignments: null,
	predecessors: null,
	successors: null,
};
const notSavedValues = ref({ ...externalValues });

const task = computed(() => {
	const $activeTask = activeTask().value;
	if (!$activeTask) return null;
	const data = { ...$activeTask };

	if (props.readonly) {
		// preserve parent to differentiate between segment and task
		let values = { parent: data.parent };
		baseItems.value.forEach(({ key, comp }) => {
			if (comp !== "links" && comp !== "resources") {
				const value = data[key];
				if (comp === "date" && value instanceof Date) {
					values[key] = dateFormat(value);
				} else if (comp === "slider" && key === "progress") {
					values[key] = `${value}%`;
				} else {
					values[key] = value;
				}
			}
		});
		return values;
	}
	return data || null;
});

watch(task, val => {
	editorValues.value = val;
});

watch(taskId, () => {
	linksActions.value = new Map();
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
			if (!editorValues.value) return true;
			return !b.isHidden || !b.isHidden(editorValues.value, props.api.getState());
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
					item.successors = notSavedValues.value.successors;
					item.predecessors = notSavedValues.value.predecessors;
				} else if (item.key === "segments") {
					item.segments = notSavedValues.value.segments;
				}
				item.onextchange = handleExternalChange;
			}
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

			if (
				editorValues.value &&
				item.isDisabled &&
				item.isDisabled(
					editorValues.value,
					props.api.getState(),
					props.api.getTaskCalendar(editorValues.value)
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

function handleExternalChange({ view, event, values }) {
	const { id, action, data } = event;
	let actions;
	if (view === "links") actions = linksActions.value;
	else if (view === "resources") actions = assignmentsActions.value;
	else if (view === "segments") actions = segmentsActions.value;
	actions.set(id, { action, data });
	Object.keys(values).forEach(key => {
		notSavedValues.value[key] = values[key];
	});
}

function saveSections() {
	for (let [linkId, value] of linksActions.value) {
		if (links().value.byId(linkId)) {
			const { action, data } = value;
			props.api.exec(action, data);
		}
	}
	[assignmentsActions.value, segmentsActions.value].forEach(actions => {
		for (let [, value] of actions) {
			const { action, data } = value;
			props.api.exec(action, data);
		}
	});
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
		saveSections();
	}
	if (item.comp) hide();
}

function handleChange(ev) {
	let { update, key, input } = ev;

	if (input) inProgress.value = true;

	ev.update = normalizeTask({ ...update }, key, input);

	if (!props.autoSave) editorValues.value = ev.update;
	else if (!editorErrors.value && !input) {
		const item = editorItems.value.find(i => i.key === key);
		const v = update[key];
		const isValid = !item.validation || item.validation(v);
		if (isValid && (!item.required || v)) save(ev.update);
	}
}

function normalizeTask(task, key, input) {
	if (unscheduledTasks().value && task.type === "summary")
		task.unscheduled = false;

	prepareEditTask(task, props.api.getState(), props.api.getTaskCalendar(task), key);
	if (!input) inProgress.value = false;
	return task;
}

function handleSave(ev) {
	if (!props.autoSave) save(ev.values, ev.changes);
}

function handleValidation(check) {
	// get all errors after onchange action
	editorErrors.value = check.errors;
}

function save(values, changes) {
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

	// when changes is not empty, Editor calls onsave and onaction({id: "save})
	if (!props.autoSave && !changes?.length) saveSections();
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

<style scoped>
:global(.wx-sidearea .wx-gantt-editor) {
	width: 450px;
	&.wx-full-screen {
		width: 100%;
	}
}

:global(.wx-gantt-editor .wx-editor-toolbar) {
	margin-bottom: 4px;
	& :global(.wx-toolbar) {
		padding-left: 0;
		padding-right: 0;
		gap: 16px;
	}
	& :global(.wx-tb-body) {
		gap: 8px;
	}
	& :global(.wx-tb-element) {
		padding-left: 0;
		padding-right: 0;
	}
	& :global(.wx-gantt-tabs) {
		align-self: start;
	}
	& :global(.wx-gantt-tabs .wx-tabs) {
		gap: 16px;
	}

	& :global(.wx-gantt-tabs button) {
		padding-left: 0;
		padding-right: 0;
		min-width: 40px;
	}
	& :global(.wx-gantt-tabs .wx-active:after),
	& :global(.wx-gantt-tabs button:hover:after) {
		width: 100%;
		left: 0;
	}
}
</style>
