<script setup>
defineOptions({ name: "GanttEditorLinks", inheritAttrs: false });

import { ref, computed, watchEffect, inject } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import ActionCell from "../grid/ActionCell.vue";
import GridSection from "./GridSection.vue";
import LinkTypeCell from "./LinkTypeCell.vue";

const _ = inject("wx-i18n").getGroup("gantt");
const props = defineProps({
	api: {},
	autoSave: {},
	onextchange: { type: Function },
	predecessors: { default: null },
	successors: { default: null },
	batch: { default: "links" },
});

const {
	activeTask,
	_activeTask,
	links,
	tasks,
	schedule,
	unscheduledTasks,
} = props.api.getReactiveState();

const $activeTask = subscribe(activeTask);
const $_activeTask = subscribe(_activeTask);
const $links = subscribe(links, true);
const $tasks = subscribe(tasks);
const $schedule = subscribe(schedule);
const $unscheduledTasks = subscribe(unscheduledTasks);

const linksData = ref();

watchEffect(() => {
	linksData.value = getLinksData();
});

const list = [
	{ id: "e2s", label: _("End-to-start") },
	{ id: "s2s", label: _("Start-to-start") },
	{ id: "e2e", label: _("End-to-end") },
	{ id: "s2e", label: _("Start-to-end") },
];

function lagEditorHandler(row) {
	return row.type === "e2s"
		? { type: "text", config: { type: "number" } }
		: null;
}

const isLagHidden = computed(
	() => !$schedule.value?.auto || ($unscheduledTasks.value && $_activeTask.value.unscheduled)
);

function getColumns() {
	return [
		{
			id: "taskText",
			header: _("Task name"),
			flexgrow: 2,
		},
		{
			id: "lag",
			header: _("Lag"),
			editor: lagEditorHandler,
			flexgrow: 1,
			hidden: isLagHidden.value,
		},
		{
			id: "type",
			header: _("Type"),
			width: 124,
			options: list,
			editor: {
				type: "richselect",
				config: {
					cell: LinkTypeCell,
				},
			},
			cell: LinkTypeCell,
		},
		{
			id: "delete",
			header: "",
			cell: ActionCell,
			width: 50,
			align: "center",
		},
	];
}

function getLinksData() {
	if ($activeTask.value) {
		const il = [];
		const ol = [];

		if (!props.predecessors || !props.successors) {
			$links.value.forEach(l => {
				if (!props.predecessors && l.target === $activeTask.value) il.push(l);
				if (!props.successors && l.source === $activeTask.value) ol.push(l);
			});
		}

		const inLinks =
			props.predecessors ||
			il.map(link => {
				const { id, lag, type, source } = link;
				return {
					id,
					type,
					lag,
					taskText: $tasks.value.byId(source).text,
				};
			});

		const outLinks =
			props.successors ||
			ol.map(link => {
				const { id, lag, type, target } = link;
				return {
					id,
					type,
					lag,
					taskText: $tasks.value.byId(target).text,
				};
			});

		return [
			{ title: _("Predecessors"), data: inLinks },
			{ title: _("Successors"), data: outLinks },
		];
	}
}

function getActionData(evData) {
	return {
		view: "links",
		event: evData,
		values: {
			predecessors: linksData.value[0].data,
			successors: linksData.value[1].data,
		},
	};
}

function onDeleteAction(id) {
	if (props.autoSave) {
		props.api.exec("delete-link", { id });
	} else {
		linksData.value = linksData.value.map(group => ({
			...group,
			data: group.data.filter(item => item.id !== id),
		}));
		props.onextchange?.(
			getActionData({
				id,
				action: "delete-link",
				data: { id },
			})
		);
	}
}

function onEdit(id, column, value) {
	const update = { [column]: value };
	if (column === "type" && $schedule.value?.auto) {
		if (value !== "e2s") update.lag = "";
	}

	if (props.autoSave) {
		props.api.exec("update-link", {
			id,
			link: update,
		});
	} else {
		linksData.value = linksData.value.map(group => ({
			...group,
			data: group.data.map(item =>
				item.id === id ? { ...item, ...update } : item
			),
		}));

		props.onextchange?.(
			getActionData({
				id,
				action: "update-link",
				data: {
					id,
					link: update,
				},
			})
		);
	}
}

const isMessage = computed(() => {
	return (
		linksData.value && !linksData.value[0].data.length && !linksData.value[1].data.length
	);
});
</script>

<template>
	<div class="wx-wrapper" :class="{ 'wx-nobatch': batch !== 'links' }">
		<template v-for="linkGroup in linksData" :key="linkGroup.title">
			<template v-if="linkGroup.data.length">
				<div class="wx-title">{{ linkGroup.title }}</div>
				<GridSection
					:columns="getColumns()"
					:onaction="onDeleteAction"
					:onedit="onEdit"
					:data="linkGroup.data"
					:sizes="{
						rowHeight: 44,
					}"
				/>
			</template>
		</template>
		<div v-if="isMessage" class="wx-nodata">{{ _("No links") }}</div>
	</div>
</template>

<style scoped>
.wx-wrapper {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.wx-nobatch {
	gap: 4px;
}
.wx-title {
	font-weight: var(--wx-header-font-weight);
}
.wx-nodata {
	color: var(--wx-gantt-icon-color);
	margin-top: 8px;
}
</style>
