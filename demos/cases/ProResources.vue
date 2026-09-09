<script setup>
import { ref, computed } from "vue";
import { getData, resources, assignments } from "../data";
import { Gantt, ContextMenu, getDefaultColumns, Editor } from "../../src";
import { Field, Switch, Button, Dropdown } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: {},
});

const data = getData();
const api = ref(null);

const tasks = ref([...data.tasks]);

const enabled = ref(false);
const multipleResources = ref(false);
const resourceHierarchy = ref(false);
const popup = ref(false);

const groupBy = computed(() =>
	enabled.value
		? {
				field: "resource",
				multipleResources: multipleResources.value,
				resourceHierarchy: resourceHierarchy.value,
			}
		: null
);

const columns = computed(() => {
	let cols = getDefaultColumns({ resources: true });
	cols.find(c => c.id === "resources").editor = "multiselect";

	// drop the resources column when grouping by resource
	if (enabled.value) {
		const index = cols.findIndex(c => c.id === "resources");
		if (index >= 0) cols.splice(index, 1);
	}

	return cols;
});

function init(ganttApi) {
	api.value = ganttApi;
}

function onResourceOptionChange() {
	if (multipleResources.value) resourceHierarchy.value = false;
}
</script>

<template>
	<ContextMenu :api="api">
		<div class="demo">
			<div class="bar">
				<div class="group-controls">
					<div class="toggle">
						<Field label="Group by resource" position="left">
							<Switch v-model:value="enabled"></Switch>
						</Field>
					</div>
					<div class="settings-anchor">
						<Button :disabled="!enabled" :onclick="() => (popup = true)">
							Settings
						</Button>
						<Dropdown
							v-if="popup"
							width="auto"
							:oncancel="() => (popup = false)"
							css="my-dropdown"
						>
							<div class="dropdown-wrapper">
								<div class="switch">
									<Field
										label="Multiple resources"
										position="left"
									>
										<Switch
											:onchange="onResourceOptionChange"
											v-model:value="multipleResources"
										></Switch>
									</Field>
								</div>
								<div class="switch">
									<Field
										label="Resource hierarchy"
										position="left"
									>
										<Switch
											:onchange="onResourceOptionChange"
											v-model:value="resourceHierarchy"
											:disabled="multipleResources"
										></Switch>
									</Field>
								</div>
							</div>
						</Dropdown>
					</div>
				</div>
			</div>

			<div class="gtcell">
				<Gantt
					:init="init"
					v-bind="skinSettings"
					:tasks="tasks"
					:columns="columns"
					:resources="resources"
					:assignments="assignments"
					:groupBy="groupBy"
					:links="data.links"
					:scales="data.scales"
					undo
				/>
			</div>

			<Editor :api="api" />
		</div>
	</ContextMenu>
</template>

<style scoped>
.demo {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.bar {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	min-height: 50px;
	gap: 20px;
	border-bottom: var(--wx-gantt-border);
}
.group-controls {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 0 12px;
}
.settings-anchor {
	position: relative;
}
.toggle {
	display: flex;
	align-items: center;
	& :deep(.wx-field) {
		width: auto;
	}
	& :deep(.wx-label) {
		width: auto !important;
		padding-top: 2px !important;
		white-space: nowrap;
	}
}
.gtcell {
	flex: 1;
	min-height: 0;
	border-top: var(--wx-gantt-border);
}

.switch {
	width: 230px;
	display: flex;
	align-items: center !important;
	& :deep(.wx-label) {
		width: 140px !important;
		padding-top: 2px !important;
	}
}

.dropdown-wrapper {
	padding: 16px 0 0 16px;
}
</style>
