<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor } from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();
const gApi = ref(null);

function init(api) {
	gApi.value = api;
}

const summary = { autoConvert: true };
</script>

<template>
	<ContextMenu :api="gApi">
		<Gantt
			:init="init"
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
			:summary="summary"
		/>
	</ContextMenu>
	<Editor :api="gApi" />
</template>
