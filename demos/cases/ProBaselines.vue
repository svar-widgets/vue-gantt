<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, getEditorItems } from "../../src";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("day", { baselines: true });

const api = ref(null);

// add fields for editing baseline dates
const items = getEditorItems().flatMap(item =>
	item.key === "links"
		? [
				...[
					{
						key: "base_start",
						comp: "date",
						label: "Baseline start",
						config: {
							format: "%d-%m-%Y",
						},
					},
					{
						key: "base_end",
						comp: "date",
						label: "Baseline end",
						config: {
							format: "%d-%m-%Y",
						},
					},
					{
						key: "base_duration",
						comp: "counter",
						hidden: true,
					},
				],
				item,
			]
		: item
);
</script>

<template>
	<Gantt
		ref="api"
		v-bind="skinSettings"
		:baselines="true"
		:cellHeight="45"
		:tasks="data.tasks"
		:links="data.links"
	/>
	<Editor :api="api" :items="items" />
</template>
