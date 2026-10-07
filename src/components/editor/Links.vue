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
	batch: { default: "links" },
	edits: { default: null },
});

const { activeTask, links, tasks, schedule } = props.api.getReactiveState();

const $activeTask = subscribe(activeTask);
const $links = subscribe(links, true);
const $tasks = subscribe(tasks);
const $schedule = subscribe(schedule);

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

function getTypeOptions(row) {
	const link = $links.value.byId(row.id);
	if (!link) return list;
	const taken = getPairTypes(link, row.id);
	const check = props.api.getLinkValidator();
	return list.filter(
		({ id: type }) =>
			type === row.type ||
			(!taken.has(type) && !check({ ...link, type }))
	);
}

function getPairTypes(link, except) {
	const out = new Set();
	linksData.value.forEach(group =>
		group.data.forEach(row => {
			if (row.id === except) return;
			const other = $links.value.byId(row.id);
			if (
				other?.source === link.source &&
				other.target === link.target
			)
				out.add(row.type);
		})
	);
	return out;
}

const isLagHidden = computed(() => !$schedule.value?.auto);

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
			editor: { type: "text", config: { type: "number" } },
			flexgrow: 1,
			hidden: isLagHidden.value,
		},
		{
			id: "type",
			header: _("Type"),
			width: 124,
			options: list,
			editor: row => ({
				type: "richselect",
				config: {
					cell: LinkTypeCell,
					options: getTypeOptions(row),
				},
			}),
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
	if (!$activeTask.value) return;
	const inLinks = [];
	const outLinks = [];
	const toRow = (link, other) => ({
		id: link.id,
		type: link.type,
		lag: link.lag,
		taskText: $tasks.value.byId(other).text,
	});
	$links.value.forEach(saved => {
		const edit = props.edits?.get(saved.id);
		if (edit?.action === "delete-link") return;
		const link = edit ? { ...saved, ...edit.data.link } : saved;
		if (link.target === $activeTask.value)
			inLinks.push(toRow(link, link.source));
		if (link.source === $activeTask.value)
			outLinks.push(toRow(link, link.target));
	});
	return [
		{ title: _("Predecessors"), data: inLinks },
		{ title: _("Successors"), data: outLinks },
	];
}

function getActionData(evData) {
	return { view: "links", event: evData };
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
	if (column === "lag" && value !== "") value = value * 1;

	const update = { [column]: value };

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
