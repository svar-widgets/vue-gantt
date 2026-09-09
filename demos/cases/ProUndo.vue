<script setup>
import { ref, computed } from "vue";
import { subscribeLater } from "@svar-ui/lib-vue";
import { Button } from "@svar-ui/vue-core";
import { getData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);

const { tasks, links, scales } = getData();

const history = subscribeLater(() => api.value?.getReactiveState()?.history);
const isUndo = computed(() => history().value?.undo);
const isRedo = computed(() => history().value?.redo);

function handleUndo() {
	api.value.exec("undo");
}
function handleRedo() {
	api.value.exec("redo");
}

function init(ganttApi) {
	api.value = ganttApi;
}
</script>

<template>
	<div class="rows">
		<div class="buttons">
			<div class="button">
				<Button
					type="primary"
					:onclick="handleUndo"
					:disabled="!isUndo"
					>Undo
				</Button>
				<span v-if="isUndo">{{ history().value?.undo }}</span>
			</div>
			<div class="button">
				<Button
					type="primary"
					:onclick="handleRedo"
					:disabled="!isRedo"
					>Redo
				</Button>
				<span v-if="isRedo">{{ history().value?.redo }}</span>
			</div>
		</div>

		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:tasks="tasks"
					:links="links"
					:scales="scales"
					undo
				/>
			</ContextMenu>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
.buttons {
	display: flex;
	gap: 10px;
	padding: 8px 12px;
}
.gtcell {
	position: relative;
	height: calc(100% - 48px);
	border-top: var(--wx-gantt-border);
}
.button {
	position: relative;
}
.button span {
	background-color: var(--wx-color-danger);
	height: 18px;
	width: 18px;
	border-radius: 50px;
	position: absolute;
	text-align: center;
	font-size: 12px;
	line-height: 12px;
	padding: 3px 0;
	color: #fff;
	top: -6px;
	right: -6px;
}
</style>
