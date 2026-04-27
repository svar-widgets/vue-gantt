<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src/";
import { Toolbar } from "@svar-ui/vue-toolbar";
import { subscribeLater } from "@svar-ui/lib-vue";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const api = ref(null);

const selectedSub = subscribeLater(
	() => api.value?.getReactiveState()?.selected
);

function handleAdd() {
	const selected = selectedSub();
	api.value.exec("add-task", {
		task: {
			text: "New task",
		},
		target: selected.value[0],
		mode: "after",
	});
}

function handleDelete() {
	const order = getActionOrder(true);
	order.forEach(id => api.value.exec("delete-task", { id }));
}

function handleMove(mode) {
	const changeDir = mode === "down";
	const order = getActionOrder(changeDir);
	order.forEach(id => api.value.exec("move-task", { id, mode }));
}

function getActionOrder(changeDir) {
	const selected = selectedSub();
	// sort by visible order and level
	const tasks = selected.value
		.map(id => api.value.getTask(id))
		.sort((a, b) => {
			return a.$level - b.$level || a.$y - b.$y;
		});
	const idOrder = tasks.map(o => o.id);

	// reverse for deleting/moving tasks down
	if (changeDir) return idOrder.reverse();
	return idOrder;
}

const allItems = [
	{
		comp: "button",
		type: "primary",
		text: "Add task",
		handler: handleAdd,
	},
	{
		comp: "button",
		text: "Delete task",
		handler: handleDelete,
	},
	{
		comp: "button",
		type: "primary",
		text: "Move task down",
		handler: () => handleMove("down"),
	},
	{
		comp: "button",
		type: "primary",
		text: "Move task up",
		handler: () => handleMove("up"),
	},
];

const items = computed(() => {
	if (api.value) {
		const selected = selectedSub();
		return selected.value?.length ? allItems : [allItems[0]];
	}
	return [allItems[0]];
});
</script>

<template>
	<Toolbar :items="items" />
	<div class="gtcell">
		<Gantt
			v-bind="skinSettings"
			ref="api"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
		/>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.gtcell {
	height: calc(100% - 50px);
	border-top: var(--wx-gantt-border);
}
</style>
