<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu } from "../../src/";
import { Switch, Field, Text, Button } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

const open = ref(true);
const text = ref("");
const tasks = ref([...data.tasks]);

function init(ganttApi) {
	api.value = ganttApi;
}
function filterTasks(ev) {
	let { value } = ev;
	value = value.toLowerCase();
	const filter = value
		? task => {
				return (task.text || "").toLowerCase().indexOf(value) > -1;
			}
		: null;

	api.value.exec("filter-tasks", { filter, open: open.value });
}
function reload() {
	tasks.value = [...data.tasks];
	text.value = "";
}
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Field label="Filter by Task name" class="field">
				<template #default="{ id }">
					<Text
						:id="id"
						clear
						icon="wxi-search"
						v-model:value="text"
						:onchange="filterTasks"
					/>
				</template>
			</Field>
			<Field label="Open tasks while filtering" class="field">
				<template #default="{ id }">
					<Switch :id="id" v-model:value="open" />
				</template>
			</Field>
			<div class="reload-btn">
				<Button type="primary" :onclick="reload">Reload</Button>
			</div>
		</div>

		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:tasks="tasks"
					:links="data.links"
					:scales="data.scales"
				/>
			</ContextMenu>
		</div>
	</div>
</template>

<style scoped>
.demo {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.bar {
	padding: 12px;
	gap: 20px;
	display: flex;
}
.gtcell {
	position: relative;
	height: calc(100% - 96px);
	border-top: var(--wx-gantt-border);
}
.reload-btn :deep(button) {
	height: 32px;
}
.reload-btn {
	align-content: center;
}
</style>
