<script setup>
import { ref } from "vue";
import { Gantt, ContextMenu, Editor } from "../../src";

const server = "https://gantt-backend.svar.dev";

const api = ref(null);
const tasks = ref([]);
const links = ref([]);

Promise.all([
	fetch(server + "/tasks")
		.then(res => res.json())
		.then(arr => parseDates(arr)),
	fetch(server + "/links").then(res => res.json()),
]).then(([t, l]) => {
	tasks.value = t;
	links.value = l;
});

function parseDates(data) {
	data.forEach(item => {
		item.start = new Date(item.start);
		if (item.end) item.end = new Date(item.end);
	});
	return data;
}

function init(api) {
	api.on("request-data", ev => {
		Promise.all([
			fetch(server + `/tasks/${ev.id}`)
				.then(res => res.json())
				.then(arr => parseDates(arr)),
			fetch(server + `/links/${ev.id}`).then(res => res.json()),
		]).then(([tasks, links]) => {
			api.exec("provide-data", {
				id: ev.id,
				data: {
					tasks,
					links,
				},
			});
		});
	});
}
</script>

<template>
	<ContextMenu :api="api">
		<Gantt ref="api" :init="init" :tasks="tasks" :links="links" />
	</ContextMenu>
	<Editor :api="api" />
</template>
