<script setup>
defineOptions({ name: "GanttToolbar" });

import { computed, inject, provide } from "vue";
import { Toolbar } from "@svar-ui/vue-toolbar";
import {
	handleAction,
	getToolbarButtons,
	isHandledAction,
} from "@svar-ui/gantt-store";

import { locale } from "@svar-ui/lib-dom";
import { subscribeLater } from "@svar-ui/lib-vue";
import { en } from "@svar-ui/gantt-locales";

const props = defineProps({
	api: { default: null },
	items: { default: () => [] },
});

// set locale
let l = inject("wx-i18n", null);
if (!l) {
	l = locale(en);
	provide("wx-i18n", l);
}
const _ = inject("wx-i18n").getGroup("gantt");

const selected = subscribeLater(() => props.api?.getReactiveState()?._selected);
const undo = subscribeLater(() => props.api?.getReactiveState()?.undo);
const history = subscribeLater(() => props.api?.getReactiveState()?.history);
const splitTasks = subscribeLater(() => props.api?.getReactiveState()?.splitTasks);
const groupBy = subscribeLater(() => props.api?.getReactiveState()?.groupBy);

const historyActions = ["undo", "redo"];

const finalItems = computed(() => {
	const fullButtons = getToolbarButtons({ undo: true, splitTasks: true });
	const buttons = props.items.length
		? props.items
		: getToolbarButtons({
				undo: undo().value,
				splitTasks: splitTasks().value,
				group: !!groupBy().value?.field,
			});
	return buttons.map(b => {
		b = { ...b, disabled: false };
		b.handler = isHandledAction(fullButtons, b.id)
			? item => handleAction(props.api, item.id, null, _)
			: b.handler;
		if (b.text) b.text = _(b.text);
		if (b.menuText) b.menuText = _(b.menuText);
		return b;
	});
});

const buttons = computed(() => {
	const $_selected = selected().value;
	const finalButtons = [];
	finalItems.value.forEach(item => {
		const action = item.id;

		if (action === "add-task" || !historyActions.includes(action)) {
			if (!$_selected?.length || !props.api) {
				if (action !== "add-task") return;
				finalButtons.push(item);
			} else {
				finalButtons.push({
					...item,
					disabled:
						item.isDisabled &&
						$_selected.some(task =>
							item.isDisabled(
								task,
								props.api.getState(),
								props.api.getTaskCalendar(task)
							)
						),
				});
			}
		} else if (historyActions.includes(action)) {
			finalButtons.push({
				...item,
				disabled: item.isDisabled(history().value),
			});
		}
	});
	// filter out consecutive separators
	return finalButtons.filter((button, index) => {
		if (props.api && button.isHidden)
			return !$_selected.some(task =>
				button.isHidden(task, props.api.getState())
			);
		if (button.comp === "separator") {
			const nextButton = finalButtons[index + 1];
			if (!nextButton || nextButton.comp === "separator") return false;
		}
		return true;
	});
});
</script>

<template>
	<Toolbar :items="buttons" />
</template>
