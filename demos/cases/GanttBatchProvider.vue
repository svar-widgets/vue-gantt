<script setup>
import { ref } from "vue";
import { RestDataProvider } from "@svar-ui/gantt-data-provider";
import { Gantt, ContextMenu, Editor } from "../../src";

const restProvider = new RestDataProvider(
	"https://master--svar-gantt-go--dev.webix.io",
	{ batchURL: "batch" }
);
const api = ref(null);
const tasks = ref(undefined);
const links = ref(undefined);

restProvider.getData().then(({ tasks: t, links: l }) => {
	tasks.value = t;
	links.value = l;
});

function init(api) {
	api.setNext(restProvider);

	api.on("request-data", ev => {
		restProvider.getData(ev.id).then(({ tasks, links }) => {
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
