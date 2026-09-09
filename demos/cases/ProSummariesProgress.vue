<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const tasks = data.tasks;
const gApi = ref(null);

function init(api) {
	gApi.value = api;
}

const summary = { autoProgress: true };
</script>

<template>
	<div class="wrapper">
		<ContextMenu :api="gApi">
			<Gantt
				v-bind="skinSettings"
				:init="init"
				:tasks="tasks"
				:links="data.links"
				:scales="data.scales"
				:cellWidth="30"
				:summary="summary"
			/>
		</ContextMenu>
		<Editor :api="gApi" />
	</div>
</template>
