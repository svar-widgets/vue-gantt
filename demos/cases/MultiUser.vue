<script setup>
import { ref, shallowRef, onUnmounted } from "vue";
import { RemoteEvents, RestDataProvider } from "@svar-ui/gantt-data-provider";
import { Gantt, ContextMenu, Editor } from "../../src";
import { Checkbox, Button } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

const server = "https://gantt-backend.svar.dev";

function makeClient(label) {
	const gantt = shallowRef(null);
	const tasks = shallowRef([]);
	const links = shallowRef([]);
	const connected = ref(false);
	let ganttApi = null;
	let loadRetry = null;

	const restProvider = new RestDataProvider(server);
	const remoteEvents = new RemoteEvents(restProvider, {
		url: `${server}/events`,
		onResync: load,
		onConnectionChange: online => (connected.value = online),
	});
	restProvider.setHeaders({ "X-Client-Id": remoteEvents.clientId });

	async function load() {
		clearTimeout(loadRetry);
		try {
			const response = await restProvider.getData();
			tasks.value = response.tasks;
			links.value = response.links;
		} catch (error) {
			console.error("could not load the project, retrying", error);
			loadRetry = setTimeout(load, 2000);
		}
	}

	function init(api) {
		ganttApi = api;
		gantt.value = api;
		api.setNext(restProvider);
		remoteEvents
			.connect(api)
			.catch(() => console.error("could not connect to remote events"))
			.then(load);

		api.on("request-data", ev => {
			restProvider
				.getData(ev.id)
				.then(({ tasks, links }) => {
					api.exec("provide-data", {
						id: ev.id,
						data: { tasks, links },
					});
				})
				.catch(error =>
					console.error("could not load the branch", error)
				);
		});
	}

	function toggleConnection() {
		if (connected.value) remoteEvents.disconnect();
		else remoteEvents.connect(ganttApi).catch(() => {});
	}

	function destroy() {
		clearTimeout(loadRetry);
		remoteEvents.disconnect();
	}

	return {
		label,
		init,
		toggleConnection,
		destroy,
		get api() {
			return gantt.value;
		},
		get tasks() {
			return tasks.value;
		},
		get links() {
			return links.value;
		},
		get connected() {
			return connected.value;
		},
	};
}

const clients = [makeClient("Client A"), makeClient("Client B")];

onUnmounted(() => clients.forEach(client => client.destroy()));

const autoschedule = ref(false);
</script>

<template>
	<div class="rows">
		<div class="row config">
			<Checkbox label="Auto scheduling" v-model:value="autoschedule" />
			<span class="pro">PRO</span>
		</div>
		<template v-for="client in clients" :key="client.label">
			<div class="row config">
				<div style="color: var(--wx-color-font-alt)">
					{{ client.label }}
				</div>
				<span>&middot;</span>
				<div>
					<span>Status</span>:
					<span
						class="status"
						:class="{
							connected: client.connected,
							disconnected: !client.connected,
						}"
					>
						{{ client.connected ? "Connected" : "Disconnected" }}
					</span>
					(<Button :onclick="client.toggleConnection" type="link">
						{{ client.connected ? "Disconnect" : "Connect" }}
					</Button>)
				</div>
			</div>
			<div class="row gantt">
				<ContextMenu :api="client.api">
					<Gantt
						v-bind="skinSettings"
						:cellHeight="32"
						:cellWidth="60"
						:init="client.init"
						:tasks="client.tasks"
						:links="client.links"
						:schedule="{ auto: autoschedule }"
						undo
						zoom
					/>
				</ContextMenu>
				<Editor :api="client.api" />
			</div>
		</template>
	</div>
</template>

<style scoped>
.rows {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.row:not(:last-child) {
	border-bottom: var(--wx-border);
}

.row.config {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 8px;
	user-select: none;
}

.row.gantt {
	position: relative;
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.status {
	padding: 2px;
	color: var(--status-color);

	&.connected {
		--status-color: limegreen;
	}
	&.disconnected {
		--status-color: tomato;
	}
}

.pro {
	color: var(--demo-framework-color);
	border: 1px solid var(--demo-framework-color);
	border-radius: 4px;
	padding: 0px 8px;
	font-size: 12px;
	font-weight: 600;
}
</style>
