<script setup>
defineOptions({ name: "GanttEditor" });

import { ref, computed, watch, watchEffect, inject, provide } from "vue";
import { Editor, registerEditorItem } from "@svar-ui/vue-editor";
import { Locale } from "@svar-ui/vue-core";
import { getEditorItems, prepareEditTask } from "@svar-ui/gantt-store";
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

//helpers
import { useModeObserver } from "../helpers/modeResizeObserver";

registerEditorItem("select", RichSelect);
registerEditorItem("date", DateTimePicker);
registerEditorItem("twostate", TwoState);
registerEditorItem("slider", Slider);
registerEditorItem("counter", Counter);
registerEditorItem("links", Links);
registerEditorItem("checkbox", Checkbox);

const props = defineProps({
	api: { default: null },
	items: { default: () => [] },
	css: { default: "" },
	layout: { default: "default" },
	readonly: { type: Boolean, default: false },
	placement: { default: "sidebar" },
	bottomBar: { type: [Boolean, Object], default: true },
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
const taskTypes = subscribeLater(() => props.api?.getReactiveState()?.taskTypes);
const undo = subscribeLater(() => props.api?.getReactiveState()?.undo);
const segmentIndex = subscribeLater(() => props.api?.getReactiveState()?.segmentIndex);
const isSegment = subscribeLater(() => props.api?.getReactiveState()?.isSegment);

const normalizedTopBar = computed(() => {
	if (props.topBar === true && !props.readonly) {
		const buttons = [
			{ comp: "icon", icon: "wxi-close", id: "close" },
			{ comp: "spacer" },
			{
				comp: "button",
				type: "danger",
				text: _("Delete"),
				id: "delete",
			},
		];
		if (props.autoSave) return { items: buttons };
		return {
			items: [
				...buttons,
				{
					comp: "button",
					type: "primary",
					text: _("Save"),
					id: "save",
				},
			],
		};
	}
	return props.topBar;
});

// resize
const compactMode = ref(false);
const styleCss = computed(() => (compactMode.value ? "wx-full-screen" : ""));

watchEffect(onCleanup => {
	const ro = useModeObserver(handleResize);
	ro.observe();

	onCleanup(() => {
		ro.disconnect();
	});
});

function handleResize(mode) {
	compactMode.value = mode;
}

const baseItems = computed(() =>
	getEditorItems({
		unscheduledTasks: unscheduledTasks().value,
		rollups: rollups().value,
		summary: summary().value,
		taskTypes: taskTypes().value,
	})
);

const linksActionsMap = ref({});
const inProgress = ref(null);

const editorValues = ref(undefined);
const editorErrors = ref(null);

const task = computed(() => {
	const $activeTask = activeTask().value;
	if (!$activeTask) return null;
	let data;
	if (isSegment().value && $activeTask.segments)
		data = { ...$activeTask.segments[segmentIndex().value] };
	else data = { ...$activeTask };

	if (props.readonly) {
		// preserve parent to differentiate between segment and task
		let values = { parent: data.parent };
		baseItems.value.forEach(({ key, comp }) => {
			if (comp !== "links") {
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
	linksActionsMap.value = {};
	editorErrors.value = null;
	inProgress.value = null;
});

const editorItems = computed(() => {
	let eItems = props.items.length ? props.items : baseItems.value;
	eItems = prepareEditorItems(eItems, editorValues.value);
	if (!editorValues.value) return eItems;
	return eItems.filter(
		item =>
			!item.isHidden ||
			!item.isHidden(editorValues.value, props.api.getState())
	);
});

const editorKeys = computed(() => editorItems.value.map(i => i.key));

function prepareEditorItems(items, task) {
	return items.map(a => {
		const item = { ...a };
		if (a.config) item.config = { ...item.config };
		if (item.comp === "links" && props.api) {
			item.api = props.api;
			item.autoSave = props.autoSave;
			item.onlinkschange = handleLinksChange;
		}
		if (item.comp === "select" && item.key === "type") {
			const options = item.options ?? [];
			item.options = options.map(t => ({
				...t,
				label: _(t.label),
			}));
		}

		if (item.comp === "slider" && item.key === "progress") {
			item.labelTemplate = value => `${_(item.label)} ${value}%`;
		}

		if (item.label) item.label = _(item.label);
		if (item.config?.placeholder)
			item.config.placeholder = _(item.config.placeholder);

		if (task) {
			if (item.isDisabled && item.isDisabled(task, props.api.getState())) {
				item.disabled = true;
			} else delete item.disabled;
		}
		return item;
	});
}

function handleLinksChange({ id, action, data }) {
	linksActionsMap.value[id] = { action, data };
}

function saveLinks() {
	for (let link in linksActionsMap.value) {
		if (links().value.byId(link)) {
			const { action, data } = linksActionsMap.value[link];
			props.api.exec(action, data);
		}
	}
}

function deleteTask() {
	const $taskId = taskId().value;
	const $activeTask = activeTask().value;
	const $segmentIndex = segmentIndex().value;

	const id = $taskId.id || $taskId;	
	if (isSegment().value) {
		if ($activeTask.segments) {
			const segments = $activeTask.segments.filter(
				(s, index) => index !== $segmentIndex
			);
			props.api.exec("update-task", {
				id,
				task: { segments },
			});
		}
	} else {
		props.api.exec("delete-task", { id });
	}
}

function hide() {
	props.api.exec("show-editor", { id: null });
}

function handleAction(ev) {
	const { item, changes } = ev;
	if (item.id === "delete") {
		deleteTask();
	}
	if (item.id === "save") {
		if (!changes.length) saveLinks();
		else return;
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

	prepareEditTask(task, props.api.getState(), key);
	if (!input) inProgress.value = false;
	return task;
}

function handleSave(ev) {
	if (!props.autoSave) save(ev.values);
}

function handleValidation(check) {
	// get all errors after onchange action
	editorErrors.value = check.errors;
}

function save(values) {
	const $taskId = taskId().value;

	values = {
		...values,
		unscheduled:
			unscheduledTasks().value &&
			values.unscheduled &&
			values.type !== "summary",
	};
	delete values.links;
	delete values.data;

	if (
		editorKeys.value.indexOf("duration") === -1 ||
		(values.segments && !values.duration)
	)
		delete values.duration;

	const data = {
		id: $taskId.id || $taskId,
		task: values,
		...(isSegment().value && { segmentIndex: segmentIndex().value }),
	};
	if (props.autoSave && inProgress.value) data.inProgress = inProgress.value;

	props.api.exec("update-task", data);

	if (!props.autoSave) saveLinks();
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
</script>

<template>
	<Locale v-if="task">
		<Editor
			:css="`wx-gantt-editor ${styleCss} ${css}`"
			:items="editorItems"
			:values="task"
			:topBar="normalizedTopBar"
			:bottomBar="bottomBar"
			:placement="placement"
			:layout="layout"
			:readonly="readonly"
			:autoSave="autoSave"
			:focus="focus"
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
}
:global(.wx-sidearea .wx-gantt-editor.wx-full-screen) {
	width: 100%;
}
</style>
