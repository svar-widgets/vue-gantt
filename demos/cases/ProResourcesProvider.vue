<script setup>
import { ref } from "vue";
import { ContextMenu, Editor, Gantt, getDefaultColumns } from "../../src";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";

const restProvider = new RestDataProvider(
	"https://gantt-backend.svar.dev"
);

const api = ref(null);
const tasks = ref([]);
const links = ref([]);
const resources = ref([]);
const assignments = ref([]);

restProvider
	.getData(undefined, { resources: true, assignments: true })
	.then(response => {
		const {
			tasks: t,
			links: l,
			resources: r,
			assignments: a,
		} = response;
		tasks.value = t;
		links.value = l;
		resources.value = r;
		assignments.value = a;
	});

function init(ganttApi) {
	api.value = ganttApi;
	ganttApi.setNext(restProvider);

	ganttApi.on("request-data", ev => {
		restProvider
			.getData(ev.id, { assignments: true })
			.then(({ tasks, links, assignments }) => {
				ganttApi.exec("provide-data", {
					id: ev.id,
					data: { tasks, links, assignments },
				});
			});
	});
}
</script>

<template>
	<div class="demo">
		<ContextMenu :api="api">
			<Gantt
				ref="api"
				:init="init"
				:tasks="tasks"
				:links="links"
				:resources="resources"
				:assignments="assignments"
				:columns="getDefaultColumns({ resources: true })"
			/>
		</ContextMenu>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.demo {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
