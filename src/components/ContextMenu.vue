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

import { locale, locateID } from "@svar-ui/lib-dom";
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

// set locale
let l = inject("wx-i18n", null);
if (!l) {
	l = locale({ ...en, ...coreEn });
	provide("wx-i18n", l);
}
const _ = inject("wx-i18n").getGroup("gantt");

const taskTypes = subscribeLater(() => props.api?.getReactiveState()?.taskTypes);
const selected = subscribeLater(() => props.api?.getReactiveState()?.selected);
const _selected = subscribeLater(() => props.api?.getReactiveState()?._selected);
const splitTasks = subscribeLater(() => props.api?.getReactiveState()?.splitTasks);
const summary = subscribeLater(() => props.api?.getReactiveState()?.summary);

const config = computed(() => ({
	splitTasks: splitTasks().value,
	taskTypes: taskTypes().value,
	summary: summary().value,
}));

const fullOptions = computed(() => getMenuOptions(config.value));

function getOptions() {
	const finalOptions = props.options.length
		? props.options
		: getMenuOptions(config.value);

	return applyLocale(finalOptions);
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

function itemResolver(id, ev) {
	let task = id ? props.api.getTask(id) : null;
	if (props.resolver) {
		const result = props.resolver(id, ev);
		task = result === true ? task : result;
	}
	if (task) {
		const segmentIndex = locateID(ev.target, "data-segment");
		if (segmentIndex !== null) activeId = { id: task.id, segmentIndex };
		else activeId = task.id;

		if (!selected().value.includes(task.id)) {
			props.api.exec("select-task", { id: task.id });
		}
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

function filterMenu(item, task) {
	const tasks = _selected().value?.length
		? _selected().value
		: task
			? [task]
			: [];

	let result = props.filter
		? tasks.every(task => props.filter(item, task))
		: true;

	if (result) {
		if (item.isHidden)
			result = !tasks.some(task =>
				item.isHidden(task, props.api.getState(), activeId)
			);
		if (item.isDisabled) {
			const disabled = tasks.some(task =>
				item.isDisabled(task, props.api.getState(), activeId)
			);
			item.disabled = disabled;
		}
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

const cOptions = computed(() => getOptions());

const menu = ref(null);

function show(ev, obj) {
	menu.value.show(ev, obj);
}

defineExpose({ show });
</script>

<template>
	<ContextMenu
		:filter="filterMenu"
		:options="cOptions"
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
