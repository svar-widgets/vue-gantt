<script setup>
import { ref, computed, inject, provide } from "vue";
import { Button, Icon } from "@svar-ui/vue-core";
import { dateToString, locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/gantt-locales";
import { en as coreEn } from "@svar-ui/core-locales";
import { defaultConstraintTypes } from "@svar-ui/gantt-store";
import { subscribeLater } from "@svar-ui/lib-vue";

const props = defineProps({
	api: { default: null },
	onclose: { type: Function },
});

// set locale
let l = inject("wx-i18n", null);
if (!l) {
	l = locale({ ...en, ...coreEn });
	provide("wx-i18n", l);
}
const _ = l.getGroup("gantt");
const i18nData = l.getRaw();
const f = i18nData.gantt?.dateFormat || i18nData.formats?.dateFormat;
const dateFormat = dateToString(f, i18nData.calendar);
const constraintLabels = Object.fromEntries(
	defaultConstraintTypes.map(t => [t.id, t.label])
);
const typeIcons = {
	constraint: "wxi-triangles-out-h",
	link: "wxi-link",
};

const _conflicts = subscribeLater(
	() => props.api?.getReactiveState()?._conflicts
);
const showConflicts = subscribeLater(
	() => props.api?.getReactiveState()?.showConflicts
);
// collections mutated in place - force update on every publish
const links = subscribeLater(() => props.api?.getReactiveState()?.links, true);
const tasks = subscribeLater(() => props.api?.getReactiveState()?.tasks, true);
const scaleHeight = subscribeLater(
	() => props.api?.getReactiveState()?.scaleHeight
);

const open = computed(() => !!showConflicts().value);

const clickedId = ref(null);
const rows = computed(() => _conflicts().value?.rows ?? []);
const selectedId = computed(() =>
	open.value && rows.value.some(r => r.id === clickedId.value)
		? clickedId.value
		: null
);

const headerHeight = computed(() => (scaleHeight().value ?? 36) + "px");

function taskText(id) {
	if (id == null) return "—";
	return tasks().value?.byId?.(id)?.text ?? String(id);
}

function itemTitle(row) {
	return row.typeKey ? _(row.typeKey) : "";
}

function actionsFor(row) {
	const resolveAction = row.required
		? { id: "resolve", label: "Move task" }
		: null;
	if (row.type === "constraint")
		return [
			resolveAction,
			{ id: "remove-constraint", label: "Remove constraint" },
		].filter(Boolean);
	if (row.type === "link")
		return [
			resolveAction,
			{ id: "remove-link", label: "Remove link" },
		].filter(Boolean);
	return [];
}

function taskIdFor(row) {
	return row.task ?? null;
}

function focusTask(taskId) {
	if (!props.api || taskId == null) return;
	props.api.exec("select-task", { id: taskId, show: "xy", focus: "chart" });
}

function selectItem(row) {
	clickedId.value = row.id;
	focusTask(taskIdFor(row));
}

function liveLink(row) {
	if (row.link == null) return null;
	return links().value?.byId?.(row.link);
}

function rowConstraint(row) {
	return tasks().value?.byId?.(row.task)?.constraint;
}

function resolve(row, action) {
	if (!props.api) return;
	clickedId.value = row.id;
	const taskId = taskIdFor(row);
	switch (action) {
		case "remove-link": {
			const link = liveLink(row);
			if (link?.id != null) props.api.exec("delete-link", { id: link.id });
			break;
		}
		case "resolve": {
			if (taskId == null || !row.required) break;
			props.api.exec("update-task", {
				id: taskId,
				task: { start: row.required },
			});
			break;
		}
		case "remove-constraint": {
			if (taskId == null) break;
			props.api.exec("update-task", {
				id: taskId,
				task: { constraint: null },
			});
			break;
		}
	}
}

function close() {
	props.api?.exec("show-conflicts", { mode: false });
	props.onclose?.();
}

const items = computed(() =>
	rows.value.map(row => ({
		row,
		actions: actionsFor(row),
		icon: typeIcons[row.type],
	}))
);
</script>

<template>
	<div v-if="open" class="wx-conflict-report">
		<div class="wx-header" :style="{ height: headerHeight }">
			<div class="wx-title">
				{{ _("Conflicts") }}
				<span v-if="rows.length" class="wx-count">{{ rows.length }}</span>
			</div>
			<Icon css="wxi-close" :onclick="close" />
		</div>

		<div v-if="!rows.length" class="wx-empty">
			<div class="wx-empty-title">
				<span class="wx-check" aria-hidden="true"></span>
				{{ _("No conflicts found") }}
			</div>
		</div>
		<div v-else class="wx-list" role="list">
			<div
				v-for="{ row, actions, icon } in items"
				:key="row.id"
				class="wx-item"
				:class="{ 'wx-selected': selectedId === row.id }"
				role="listitem"
				:data-id="row.id"
				@click="selectItem(row)"
			>
				<div class="wx-item-title">
					<span class="wx-type-icon">
						<i v-if="icon" :class="icon"></i>
					</span>
					<span class="wx-item-title-text">{{ itemTitle(row) }}</span>
				</div>

				<div class="wx-item-detail">
					<div v-if="row.type === 'link'" class="wx-detail-line">
						<span class="wx-detail-label">{{ _("From link") }}:</span
						>{{
							`${taskText(liveLink(row)?.source)} → ${taskText(row.task)}`
						}}
					</div>
					<template v-else>
						<div class="wx-detail-line">
							<span class="wx-detail-label">{{ _("Task") }}:</span
							>{{ taskText(row.task) }}
						</div>
						<div
							v-if="rowConstraint(row)?.date"
							class="wx-detail-line"
						>
							<span class="wx-detail-label"
								>{{
									_(
										constraintLabels[rowConstraint(row).type] ||
											rowConstraint(row).type
									)
								}}:</span
							>{{ dateFormat(rowConstraint(row).date) }}
						</div>
					</template>
				</div>
				<div v-if="actions.length" class="wx-item-actions">
					<Button
						v-for="action in actions"
						:key="action.id"
						:type="selectedId === row.id ? 'primary' : undefined"
						:onclick="() => resolve(row, action.id)"
					>
						{{ _(action.label) }}
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.wx-conflict-report {
	display: flex;
	flex-direction: column;
	width: 310px;
	min-width: 310px;
	height: 100%;
	border-left: var(--wx-gantt-border);
	background: var(--wx-background);
}

.wx-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding: 0 8px 0 16px;
	box-sizing: border-box;
	border-bottom: var(--wx-gantt-border);
	flex-shrink: 0;
}
.wx-header :deep(.wx-icon) {
	box-sizing: border-box;
	max-height: calc(
		var(--wx-button-icon-size) + 2 * var(--wx-button-icon-indent)
	);
}

.wx-title {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
	font-weight: var(--wx-header-font-weight);
}

.wx-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	min-width: 16px;
	height: 16px;
	padding: 0 4px;
	border-radius: 8px;
	font-size: 11px;
	color: var(--wx-gantt-constraint-violation-font-color, inherit);
	background: var(--wx-gantt-constraint-violation-color);
}

.wx-empty {
	padding: 32px 16px;
	text-align: center;
}
.wx-empty-title {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	margin: 0;
	font-weight: normal;
}

.wx-check {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	border-radius: 50%;
	background: var(--wx-color-success);
}
.wx-check::before {
	content: "";
	width: 5px;
	height: 9px;
	margin-top: -1px;
	border: solid var(--wx-background);
	border-width: 0 2px 2px 0;
	transform: rotate(45deg);
}

.wx-list {
	flex: 1;
	min-height: 0;
	overflow: auto;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;
	box-sizing: border-box;
}

.wx-item {
	padding: 8px;
	border: var(--wx-gantt-border);
	border-radius: 4px;
	background: var(--wx-background);
	cursor: pointer;
	box-sizing: border-box;
}
.wx-item:hover {
	background: var(--wx-background-hover);
}
.wx-item.wx-selected {
	background: var(--wx-gantt-select-color);
}

.wx-item-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: var(--wx-font-size-sm);
	font-weight: var(--wx-font-weight-md);
	line-height: var(--wx-line-height-sm);
}
.wx-type-icon {
	display: inline-flex;
	align-items: center;
}
.wx-type-icon i {
	font-size: 14px;
}

.wx-item-detail {
	margin-top: 4px;
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: var(--wx-font-size-sm);
	font-weight: var(--wx-font-weight);
	line-height: var(--wx-line-height-sm);
	overflow-wrap: anywhere;
}

.wx-detail-label {
	margin-right: 4px;
}

.wx-item-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 10px;
}
.wx-item-actions :deep(.wx-button) {
	font-size: var(--wx-font-size-sm);
	line-height: var(--wx-line-height-sm);
}
</style>
