<script setup>
defineOptions({ name: "GanttComponentsGantt" });

import { ref, computed, watchEffect, provide, inject, useAttrs } from "vue";
import { writable } from "@svar-ui/lib-vue";

// locales
import { locale as l } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";

// stores
import { EventBusRouter } from "@svar-ui/lib-state";
import {
	DataStore,
	getDefaultColumns,
	defaultTaskTypes,
	normalizeZoom,
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
	resources: { default: null },
	assignments: { default: () => [] },
	scales: {
		default: () => [
			{ unit: "month", step: 1, format: "%F %Y" },
			{ unit: "day", step: 1, format: "%j" },
		],
	},
	columns: { default: null },
	start: { default: null },
	end: { default: null },
	lengthUnit: { default: "day" },
	durationUnit: { default: "day" },
	inclusiveEnd: { type: Boolean, default: false },
	cellWidth: { default: 100 },
	cellHeight: { default: 38 },
	scaleHeight: { default: 36 },
	gridWidth: { default: null },
	subGridWidth: { default: null },
	displayMode: { default: "all" },
	readonly: { type: Boolean, default: false },
	cellBorders: { default: "full" },
	zoom: { type: [Boolean, Object, Array], default: false },
	baselines: { type: [Boolean, Object], default: false },
	rollups: { type: [Boolean, Object], default: false },
	highlightTime: { type: Function, default: null },
	init: { type: Function, default: null },
	autoScale: { type: Boolean, default: true },
	unscheduledTasks: { type: Boolean, default: false },
	inactiveTasks: { type: Boolean, default: false },
	placeholderRow: { type: Boolean, default: false },
	criticalPath: { default: null },
	schedule: { default: () => ({ type: "forward" }) },
	projectStart: { default: null },
	projectEnd: { default: null },
	calendar: { default: null },
	calendars: { default: () => [] },
	undo: { type: Boolean, default: false },
	splitTasks: { type: Boolean, default: false },
	summary: { default: null },
	slack: { type: Boolean, default: false },
	groupBy: { default: null },
	wbs: { type: Boolean, default: false },
	deadlines: { type: Boolean, default: false },
	progressLine: { type: [Boolean, Date], default: false },
	sCurve: { type: [Boolean, Array], default: false },
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

// default column set (incl. auto-added resources/wbs columns)
const defaultGridColumns = computed(() =>
	getDefaultColumns({ resources: !!props.resources, wbs: props.wbs })
);

const normalizedConfig = computed(() => {
	let config = {
		zoom: prepareZoom(props.zoom, lCalendar),
		scales: prepareScales(props.scales, lCalendar),
		columns: prepareColumns(
			props.columns ?? defaultGridColumns.value,
			lCalendar
		),
		links: props.links,
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
const subGridTableAPI = ref(undefined);

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
const getResource = id => dataStore.getResource(id);
const serialize = config => dataStore.serialize(config);
const getTable = (waitRender, section = "grid") => {
	const getTableAPI = () =>
		section === "subGrid" ? subGridTableAPI.value : tableAPI.value;
	return waitRender
		? new Promise(res => setTimeout(() => res(getTableAPI()), 1))
		: getTableAPI();
};
const getHistory = () => dataStore.getHistory();
const getCalendar = id => dataStore.getCalendar(id);
const getTaskCalendar = task => dataStore.getTaskCalendar(task);
const getResourceCalendar = resource => dataStore.getResourceCalendar(resource);
const getTaskResources = id => dataStore.getTaskResources(id);
const getResourceTasks = id => dataStore.getResourceTasks(id);
const getLinkValidator = () => dataStore.getLinkValidator();

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
	getResource,
	serialize,
	getHistory,
	getCalendar,
	getTaskResources,
	getResourceTasks,
	getTaskCalendar,
	getResourceCalendar,
	getLinkValidator,
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
	getResource,
	serialize,
	getHistory,
	getCalendar,
	getTaskResources,
	getResourceTasks,
	getTaskCalendar,
	getResourceCalendar,
	getLinkValidator,
});

// common API available in components
provide("gantt-store", {
	getReactiveState: dataStore.getReactive.bind(dataStore),
	getState: dataStore.getState.bind(dataStore),
	exec: firstInRoute.exec.bind(firstInRoute),
	on: firstInRoute.on.bind(firstInRoute),
	detach: firstInRoute.detach.bind(firstInRoute),
	getTask: dataStore.getTask.bind(dataStore),
	getTaskCalendar: dataStore.getTaskCalendar.bind(dataStore),
	getResourceCalendar: dataStore.getResourceCalendar.bind(dataStore),
	getCalendar: dataStore.getCalendar.bind(dataStore),
	getTaskResources: dataStore.getTaskResources.bind(dataStore),
	getHistory: dataStore.getHistory.bind(dataStore),
	getLinkValidator: dataStore.getLinkValidator.bind(dataStore),
});

let init_once = true;
const reinitStore = () => {
	const nc = normalizedConfig.value;
	dataStore.init({
		tasks: props.tasks,
		links: nc.links,
		resources: props.resources,
		assignments: props.assignments,
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
		inactiveTasks: props.inactiveTasks,
		placeholderRow: props.placeholderRow && !props.readonly,
		markers: props.markers,
		durationUnit: props.durationUnit,
		inclusiveEnd: props.inclusiveEnd,
		criticalPath: props.criticalPath,
		schedule: props.schedule,
		projectStart: props.projectStart,
		projectEnd: props.projectEnd,
		calendar: props.calendar,
		calendars: props.calendars,
		slack: props.slack,
		undo: props.undo,
		_weekStart: lCalendar.weekStart,
		splitTasks: props.splitTasks,
		deadlines: props.deadlines,
		summary: props.summary,
		groupBy: props.groupBy,
		highlightTime: props.highlightTime,
		wbs: props.wbs,
		progressLine: props.progressLine,
		cellBorders: props.cellBorders,
		sCurve: props.sCurve,
		displayMode: props.displayMode,
		...(props.gridWidth != null ? { gridWidth: props.gridWidth } : {}),
		...(props.subGridWidth != null
			? { subGridWidth: props.subGridWidth }
			: {}),
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
		v-model:tableAPI="tableAPI"
		v-model:subGridTableAPI="subGridTableAPI"
	/>
</template>
