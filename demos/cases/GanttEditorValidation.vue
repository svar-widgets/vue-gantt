<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, getEditorItems } from "../../src";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

const items = getEditorItems().map(ed => ({
	...ed,
	...(ed.comp === "text" && { required: true }),
	...(ed.comp === "counter" && {
		validation: v => v <= 50,
		validationMessage: "Task duration should not exceed 50 days",
	}),
}));
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:tasks="data.tasks"
		:links="data.links"
		:scales="data.scales"
	/>
	<Editor :api="api" :items="items" :autoSave="false" />
</template>
