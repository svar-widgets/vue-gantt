<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";
import { format } from "date-fns";

const props = defineProps({
	skinSettings: { type: Object },
});

const { tasks, links, scales } = getData("critical");

const api = ref(null);

const columns = [
	{
		id: "text",
		header: "Task name",
		flexgrow: 1,
	},
	{
		id: "earliestStart",
		header: "Earliest start",
		align: "center",
		width: 120,
		getter: t => t.slack.earliestStart,
		template: v => (v ? format(v, "dd-MM-yy") : "-"),
	},
	{
		id: "latestStart",
		header: "Latest start",
		align: "center",
		width: 120,
		getter: t => t.slack.latestStart,
		template: v => (v ? format(v, "dd-MM-yy") : "-"),
	},
	{
		id: "freeSlack",
		header: "Free slack",
		align: "center",
		width: 100,
		getter: t => t.slack.freeSlack,
		template: v => v ?? "-",
	},
	{
		id: "totalSlack",
		header: "Total slack",
		align: "center",
		width: 100,
		getter: t => t.slack.totalSlack,
	},
];
</script>

<template>
	<div class="demo">
		<Gantt
			v-bind="skinSettings"
			ref="api"
			:tasks="tasks"
			:links="links"
			:scales="scales"
			:columns="columns"
			:gridWidth="590"
			slack
		/>
	</div>
	<Editor :api="api" />
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
