<script setup>
import { ref } from "vue";
import {
	Gantt,
	ContextMenu,
	Editor,
	getEditorItems,
	defaultColumns,
} from "../../src";
import { format } from "date-fns";
import { getData } from "../data";

const props = defineProps(["skinSettings"]);

const { tasks, links, scales } = getData("hour");

const api = ref(null);

const items = getEditorItems().map(ed => ({
	...ed,
	...(ed.comp === "date" && { config: { time: true } }),
}));

const columns = defaultColumns.map(col => ({
	...col,
	...(col.id === "start" && {
		template: d => format(d, "MMM d, HH:mm"),
		width: 120,
	}),
}));

function highlightTime(date, unit) {
	const h = date.getHours();
	if ((unit === "hour" && h < 8) || h > 21) return "wx-weekend";
	return "";
}
</script>

<template>
	<ContextMenu :api="api">
		<Gantt
			ref="api"
			v-bind="skinSettings"
			:tasks="tasks"
			:links="links"
			:columns="columns"
			:scales="scales"
			:cellWidth="40"
			durationUnit="hour"
			lengthUnit="minute"
			:highlightTime="highlightTime"
		/>
	</ContextMenu>
	<Editor :api="api" :items="items" />
</template>
