<script setup>
import {
	ref,
	computed,
	inject,
	provide,
	watchEffect,
} from "vue";
import { ContextMenu } from "@svar-ui/vue-menu";
import {
	handleAction,
	getMenuOptions,
	isHandledAction,
} from "@svar-ui/gantt-store";

import { locale, locateID, locate } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";
import { subscribeLater } from "@svar-ui/lib-vue";

const props = defineProps({
	options: { default: () => [] },
	api: { default: null },
	resolver: { default: null },
	filter: { default: null },
	at: { default: "point" },
	onclick: { type: Function },
	css: {},
});

let activeId = null;
const activeTask = ref(null);

// set locale
let l = inject("wx-i18n", null);
if (!l) {
	l = locale({ ...en, ...coreEn });
	provide("wx-i18n", l);
}
const _ = l.getGroup("gantt");

const taskTypes = subscribeLater(() => props.api?.getReactiveState()?.taskTypes);
const selected = subscribeLater(() => props.api?.getReactiveState()?.selected);
const _selected = subscribeLater(() => props.api?.getReactiveState()?._selected);
const splitTasks = subscribeLater(() => props.api?.getReactiveState()?.splitTasks);
const summary = subscribeLater(() => props.api?.getReactiveState()?.summary);
const groupBy = subscribeLater(() => props.api?.getReactiveState()?.groupBy);

const config = computed(() => ({
	splitTasks: splitTasks().value,
	taskTypes: taskTypes().value,
	summary: summary().value,
	group: !!groupBy().value?.field,
}));

// _selected lags behind single selection from resolver (setAsyncState)
const tasks = computed(() =>
	_selected().value?.length
		? _selected().value
		: activeTask.value
			? [activeTask.value]
			: []
);

const fullOptions = computed(() => getMenuOptions(config.value));

const customOptions = computed(() =>
	props.options.length ? props.options : null
);
const localizedOptions = computed(() =>
	applyLocale(customOptions.value ?? fullOptions.value)
);

function cloneMenuItems(items) {
	return items.map(op => {
		const copy = { ...op };
		if (op.data) copy.data = cloneMenuItems(op.data);
		return copy;
	});
}

function applyLocale(options) {
	return options.map(op => {
		op = { ...op };
		if (op.text) op.text = _(op.text);
		if (op.subtext) op.subtext = _(op.subtext);
		if (op.data) op.data = applyLocale(op.data);
		return op;
	});
}

function buildOptions() {
	if (!props.api) return [];
	const items = cloneMenuItems(localizedOptions.value);
	const setDisabled = data => {
		data.forEach(item => {
			if (item.isDisabled) {
				item.disabled = tasks.value.some(task =>
					item.isDisabled(
						task,
						props.api.getState(),
						props.api.getTaskCalendar(task),
						activeId
					)
				);
			}
			if (item.data) setDisabled(item.data);
		});
	};
	setDisabled(items);
	return items;
}

function itemResolver(id, ev) {
	if (
		locate(ev.target, "data-menu-ignore")?.classList.contains(
			"wx-resource-load"
		)
	)
		return null;

	let task = id ? props.api.getTask(id) : null;
	if (props.resolver) {
		const result = props.resolver(id, ev);
		task = result === true ? task : result;
	}
	activeTask.value = task;

	if (task) {
		const segmentIndex = locateID(ev.target, "data-segment");
		if (segmentIndex !== null) activeId = { id: task.id, segmentIndex };
		else activeId = task.id;

		if (!selected().value.includes(task.id)) {
			props.api.exec("select-task", { id: task.id });
		}

		menuOptions.value = buildOptions();
	}

	return task;
}

function menuAction(ev) {
	const action = ev.action;
	if (action) {
		const isAction = isHandledAction(fullOptions.value, action.id);
		if (isAction) handleAction(props.api, action.id, activeId, _);
		props.onclick && props.onclick(ev);
	}
}

function filterMenu(item) {
	if (!props.api) return true;
	let result = props.filter
		? tasks.value.every(task => props.filter(item, task))
		: true;

	if (result) {
		if (item.isHidden)
			result = !tasks.value.some(task =>
				item.isHidden(task, props.api.getState(), activeId)
			);
	}
	return result;
}

let subscribed = false;
watchEffect(() => {
	if (props.api && !subscribed) {
		subscribed = true;
		props.api.on("scroll-chart", () => menu.value.show());
		props.api.on("drag-task", () => menu.value.show());
	}
});

// built imperatively before the menu opens, not derived from the store (avoids rebuild churn on every store tick)
const menuOptions = ref([]);

const menu = ref(null);

function show(ev, obj) {
	menuOptions.value = buildOptions();
	menu.value.show(ev, obj);
}

defineExpose({ show });
</script>

<template>
	<ContextMenu
		:filter="filterMenu"
		:options="menuOptions"
		dataKey="id"
		:resolver="itemResolver"
		:onclick="menuAction"
		:css="css"
		:at="at"
		ref="menu"
	/>
	<span :oncontextmenu="menu?.show" data-menu-ignore="true">
		<slot />
	</span>
</template>

<style scoped>
:global(.wx-menu .wx-option.wx-disabled) {
	pointer-events: none;
}
:global(.wx-menu .wx-option.wx-disabled .wx-value),
:global(.wx-menu .wx-option.wx-disabled .wx-icon) {
	color: var(--wx-color-font-disabled);
}
</style>
