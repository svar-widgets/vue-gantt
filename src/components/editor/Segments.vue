<script setup>
defineOptions({ name: "GanttEditorSegments", inheritAttrs: false });

import { inject, ref, computed, watchEffect } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { dateToString } from "@svar-ui/lib-dom";
import { prepareEditTask } from "@svar-ui/gantt-store";

import GridSection from "./GridSection.vue";
import { tempID } from "@svar-ui/lib-state";
import ActionCell from "../grid/ActionCell.vue";

const l = inject("wx-i18n");
const _ = l.getGroup("gantt");
const i18nData = l.getRaw();
const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
const dateFormat = dateToString(f, i18nData.calendar);

const props = defineProps({
	api: {},
	autoSave: {},
	segments: {},
	onextchange: { type: Function },
});

const onchange = props.onextchange;

const { _activeTask } = props.api.getReactiveState();
const $_activeTask = subscribe(_activeTask);

const segmentsState = ref([]);

function getSegmentsData() {
	const activeTaskVal = $_activeTask.value;
	if (!activeTaskVal || props.segments === null) return [];
	return props.segments
		? [...props.segments]
		: activeTaskVal?.segments?.map(s => ({
				...s,
				id: s.id || tempID(),
			}));
}

watchEffect(() => {
	void $_activeTask.value;
	segmentsState.value = getSegmentsData();
});

const columns = computed(() => {
	return [
		{
			id: "text",
			header: _("Name"),
			type: "string",
			flexgrow: 3,
			editor: "text",
		},
		{
			id: "start",
			header: _("Start"),
			flexgrow: 2,
			template: v => dateFormat(v),
			editor: "datepicker",
		},
		{
			id: "duration",
			header: _("Duration"),
			flexgrow: 2,
			editor: {
				type: "text",
				config: { type: "number" },
			},
		},
		{
			id: "delete",
			header: "",
			cell: ActionCell,
			width: 50,
			align: "center",
		},
	];
});

const gridApi = ref(null);

function oninit(t) {
	gridApi.value = t;
}

function getActionData(evData) {
	return {
		view: "segments",
		event: evData,
		values: {
			segments: segmentsState.value.length ? [...segmentsState.value] : null,
		},
	};
}

function deleteSegment(id) {
	const index = segmentsState.value.findIndex(s => s.id === id);
	segmentsState.value = segmentsState.value.filter((s, i) => i !== index);

	const activeTaskVal = $_activeTask.value;
	const update = {
		id: activeTaskVal.id,
		task: {
			segments: segmentsState.value.length ? [...segmentsState.value] : null,
		},
	};
	if (props.autoSave) {
		props.api.exec("update-task", update);
	} else {
		onchange &&
			onchange(
				getActionData({
					id,
					action: "update-task",
					data: update,
				})
			);
	}
}

function onaction(id, action) {
	if (action === "delete") deleteSegment(id);
}

function onedit(id, column, value) {
	const { data } = gridApi.value.getState();
	let index = data.findIndex(s => s.id === id);
	if (column === "duration") value = value * 1;
	const segment = { ...segmentsState.value[index], [column]: value };
	const activeTaskVal = $_activeTask.value;
	prepareEditTask(segment, props.api.getState(), props.api.getTaskCalendar(activeTaskVal), column);
	const update = {
		id: activeTaskVal.id,
		segmentIndex: index,
		task: segment,
	};

	if (props.autoSave) {
		props.api.exec("update-task", update);
	} else {
		segmentsState.value = segmentsState.value.map(s =>
			s.id === id ? { ...s, ...segment } : s
		);
		onchange &&
			onchange(
				getActionData({
					id,
					action: "update-task",
					data: update,
				})
			);
	}
}
</script>

<template>
	<div class="wx-section">
		<GridSection
			v-if="segmentsState.length"
			:columns="columns"
			:oninit="oninit"
			:onaction="onaction"
			:data="segmentsState"
			:onedit="onedit"
		/>
		<div v-else class="wx-nodata">{{ _("No segments") }}</div>
	</div>
</template>

<style scoped>
.wx-section {
	margin-bottom: 10px;
}
.wx-nodata {
	color: var(--wx-gantt-icon-color);
	margin-top: 8px;
}
</style>
