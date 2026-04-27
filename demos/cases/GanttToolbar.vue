<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Toolbar, Editor } from "../../src/";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const api = ref(null);
</script>

<template>
	<Toolbar :api="api" />
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
