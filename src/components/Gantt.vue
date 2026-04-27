<script setup>
defineOptions({ name: "GanttComponentsGantt" });

import { ref, computed, watch, watchEffect, provide, inject, useAttrs } from "vue";
import { writable } from "@svar-ui/lib-vue";

// locales
import { locale as l } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";

// stores
import { EventBusRouter } from "@svar-ui/lib-state";
import {
	DataStore,
	defaultColumns,
	defaultTaskTypes,
	parseTaskDates,
	normalizeZoom,
	normalizeLinks,
} from "@svar-ui/gantt-store";

// views
import Layout from "./Layout.vue";

// helpers
import {
	prepareScales,
	prepareFormats,
	prepareColumns,
	prepareZoom,
} from "../helpers/prepareConfig.js";

const props = defineProps({
	taskTemplate: { default: null },
	markers: { default: () => [] },
	taskTypes: { default: () => defaultTaskTypes },
	tasks: { default: () => [] },
	selected: { default: () => [] },
	activeTask: { default: null },
	links: { default: () => [] },
	scales: {
		default: () => [
			{ unit: "month", step: 1, format: "%F %Y" },
			{ unit: "day", step: 1, format: "%j" },
		],
	},
	columns: { default: () => defaultColumns },
	start: { default: null },
	end: { default: null },
	lengthUnit: { default: "day" },
	durationUnit: { default: "day" },
	cellWidth: { default: 100 },
	cellHeight: { default: 38 },
	scaleHeight: { default: 36 },
	readonly: { type: Boolean, default: false },
	cellBorders: { default: "full" },
	zoom: { type: [Boolean, Object, Array], default: false },
	baselines: { type: [Boolean, Object], default: false },
	rollups: { type: [Boolean, Object], default: false },
	highlightTime: { type: Function, default: null },
	init: { type: Function, default: null },
	autoScale: { type: Boolean, default: true },
	unscheduledTasks: { type: Boolean, default: false },
	criticalPath: { default: null },
	schedule: { default: () => ({ type: "forward" }) },
	projectStart: { default: null },
	projectEnd: { default: null },
	calendar: { default: null },
	undo: { type: Boolean, default: false },
	splitTasks: { type: Boolean, default: false },
	summary: { default: null },
	slack: { type: Boolean, default: false },
	_export: { type: Boolean, default: false },
});

const attrs = useAttrs();

// init stores
const dataStore = new DataStore(writable);

// locale and formats
// uses same logic as the Locale component
const words = { ...coreEn, ...en };
let locale = inject("wx-i18n", null);
if (!locale) locale = l(words);
else locale = locale.extend(words, true);
provide("wx-i18n", locale);

// prepare configuration objects
const { calendar: lCalendar } = locale.getRaw();

const normalizedConfig = computed(() => {
	let config = {
		zoom: prepareZoom(props.zoom, lCalendar),
		scales: prepareScales(props.scales, lCalendar),
		columns: prepareColumns(props.columns, lCalendar),
		links: normalizeLinks(props.links),
		cellWidth: props.cellWidth,
	};
	if (config.zoom) {
		config = {
			...config,
			...normalizeZoom(
				config.zoom,
				prepareFormats(lCalendar, locale.getGroup("gantt")),
				config.scales,
				props.cellWidth
			),
		};
	}
	return config;
});

watch(
	() => [props.tasks, props.durationUnit, props.calendar],
	() => {
		if (!props._export)
			parseTaskDates(props.tasks, {
				durationUnit: props.durationUnit,
				splitTasks: props.splitTasks,
				calendar: props.calendar,
			});
	},
	{ immediate: true, flush: "pre" }
);

// define event route
let firstInRoute = dataStore.in;

const dash = /-/g;
let lastInRoute = new EventBusRouter((a, b) => {
	const name = "on" + a.replace(dash, "");
	if (attrs[name]) {
		attrs[name](b);
	}
});
firstInRoute.setNext(lastInRoute);

const tableAPI = ref(undefined);

// highlightTime: prop can be overridden by calendar effect
const calendarHighlightTime = ref(null);

watchEffect(() => {
	if (props.calendar && props.tasks) {
		calendarHighlightTime.value = (day, unit) => {
			if (unit === "day" && !props.calendar.getDayHours(day))
				return "wx-weekend";
			if (unit === "hour" && !props.calendar.getDayHours(day))
				return "wx-weekend";
			return "";
		};
	}
});

const effectiveHighlightTime = computed(() =>
	calendarHighlightTime.value || props.highlightTime
);

// public API
const getState = dataStore.getState.bind(dataStore);
const getReactiveState = dataStore.getReactive.bind(dataStore);
const getStores = () => ({ data: dataStore });
const exec = firstInRoute.exec;
const setNext = ev => (lastInRoute = lastInRoute.setNext(ev));
const intercept = firstInRoute.intercept.bind(firstInRoute);
const on = firstInRoute.on.bind(firstInRoute);
const detach = firstInRoute.detach.bind(firstInRoute);
const getTask = id => dataStore.getTask(id);
const serialize = () => dataStore.serialize();
const getTable = waitRender =>
	waitRender
		? new Promise(res => setTimeout(() => res(tableAPI.value), 1))
		: tableAPI.value;
const getHistory = () => dataStore.getHistory();

const api = {
	getState,
	getReactiveState,
	getStores,
	exec,
	setNext,
	intercept,
	on,
	detach,
	getTable,
	getTask,
	serialize,
	getHistory,
};

defineExpose({
	getState,
	getReactiveState,
	getStores,
	exec,
	setNext,
	intercept,
	on,
	detach,
	getTable,
	getTask,
	serialize,
	getHistory,
});

// common API available in components
provide("gantt-store", {
	getReactiveState: dataStore.getReactive.bind(dataStore),
	exec: firstInRoute.exec.bind(firstInRoute),
	getTask: dataStore.getTask.bind(dataStore),
});

let init_once = true;
const reinitStore = () => {
	const nc = normalizedConfig.value;
	dataStore.init({
		tasks: props.tasks,
		links: nc.links,
		start: props.start,
		columns: nc.columns,
		end: props.end,
		lengthUnit: props.lengthUnit,
		cellWidth: nc.cellWidth,
		cellHeight: props.cellHeight,
		scaleHeight: props.scaleHeight,
		scales: nc.scales,
		taskTypes: props.taskTypes,
		zoom: nc.zoom,
		selected: props.selected,
		activeTask: props.activeTask,
		baselines: props.baselines,
		rollups: props.rollups === true ? { type: "closest" } : props.rollups,
		autoScale: props.autoScale,
		unscheduledTasks: props.unscheduledTasks,
		markers: props.markers,
		durationUnit: props.durationUnit,
		criticalPath: props.criticalPath,
		schedule: props.schedule,
		projectStart: props.projectStart,
		projectEnd: props.projectEnd,
		calendar: props.calendar,
		slack: props.slack,
		undo: props.undo,
		_weekStart: lCalendar.weekStart,
		splitTasks: props.splitTasks,
		summary: props.summary,
	});

	if (init_once && props.init) {
		props.init(api);
		init_once = false;
	}
};

// run on init and re-run on any dependency change
watchEffect(reinitStore);
</script>

<template>
	<Layout
		:taskTemplate="props.taskTemplate"
		:readonly="props.readonly"
		:cellBorders="props.cellBorders"
		:highlightTime="effectiveHighlightTime"
		v-model:tableAPI="tableAPI"
	/>
</template>
