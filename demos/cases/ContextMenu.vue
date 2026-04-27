<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor } from "../../src/";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const data = getData();
</script>

<template>
	<ContextMenu :api="api">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
			zoom
		/>
	</ContextMenu>
	<Editor :api="api" />
</template>
