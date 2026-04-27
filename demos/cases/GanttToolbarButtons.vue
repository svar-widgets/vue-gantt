<script setup>
import { ref, inject } from "vue";
import { getData } from "../data";
import { Gantt, Toolbar, Editor, getToolbarButtons } from "../../src/";

const helpers = inject("wx-helpers");
const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const data = getData();

//remove indentation buttons
const items = getToolbarButtons().filter(b => {
	return b.id?.indexOf("indent") === -1;
});

//add custom button
items.push({
	id: "my-action",
	comp: "icon",
	icon: "wxi-cat",
	handler: actionHandler,
});

function actionHandler() {
	helpers.showNotice({ text: "'My action' clicked" });
}
</script>

<template>
	<Toolbar :api="api" :items="items" />
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
