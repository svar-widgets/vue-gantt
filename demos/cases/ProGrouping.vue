<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, getDefaultColumns, Editor, ContextMenu } from "../../src";
import { Field, RichSelect, Switch } from "@svar-ui/vue-core";
import GroupTextCell from "../custom/GroupTextCell.vue";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const api = ref(null);
const field = ref("priority");
const taskHierarchy = ref(false);
const ungroupedTop = ref(false);

const groupBy = computed(() => {
	if (field.value === "none") return null;
	return {
		field: field.value,
		taskHierarchy: taskHierarchy.value,
		ungrouped: ungroupedTop.value ? "top" : "bottom",
	};
});

const columns = computed(() => {
	let cols = getDefaultColumns();

	// use custom cell for [GroupField: group value] template
	if (field.value) cols[0].cell = GroupTextCell;

	// delete columns that is used for grouping
	if (field.value) {
		const index = cols.findIndex(c => c.id === field.value);
		if (index >= 0) {
			cols.splice(index, 1);
		}
	}

	return cols;
});
</script>

<template>
	<div class="demo">
		<div class="bar">
			<div class="select">
				<Field label="Group by" position="left">
					<RichSelect
						:dropdown="{ css: 'select-dropdown' }"
						:options="[
							{ id: 'none', label: '- none -' },
							{ id: 'duration', label: 'duration' },
							{ id: 'priority', label: 'priority' },
							{ id: 'progress', label: 'progress' },
						]"
						v-model:value="field"
					/>
				</Field>
			</div>
			<div class="switch">
				<Field label="Task hierarchy" position="left">
					<Switch
						v-model:value="taskHierarchy"
						:disabled="field === 'none'"
					></Switch>
				</Field>
			</div>
			<div class="switch">
				<Field
					label="Top position for ungrouped tasks"
					position="left"
					type="checkbox"
				>
					<Switch
						v-model:value="ungroupedTop"
						:disabled="field === 'none'"
					></Switch>
				</Field>
			</div>
		</div>

		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:columns="columns"
					:groupBy="groupBy"
					undo
				/>
			</ContextMenu>
			<Editor :api="api" />
		</div>
	</div>
	<Editor :api="api" />
</template>

<style scoped>
.demo {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
}

.bar {
	display: flex;
	align-items: center;
	border-bottom: var(--wx-gantt-border);
	padding: 12px;
	gap: 20px;
}
.gtcell {
	position: relative;
	overflow: hidden;
	height: calc(100% - 60px);
	border-top: var(--wx-gantt-border);
}

.demo :deep(.wx-field) {
	display: flex;
	align-items: center !important;
}

.switch {
	display: flex;
	align-items: center !important;
	gap: 8px;
	& :deep(.wx-field) {
		width: auto;
	}
	& :deep(.wx-label) {
		width: auto !important;
		padding-top: 2px !important;
		white-space: nowrap;
	}
}

/* select styles */
.select {
	width: 200px;
	& :deep(.wx-field > .wx-label) {
		width: 65px !important;
		padding-top: 2px !important;
	}
	& :deep(.wx-field-control) {
		max-width: calc(100% - 65px) !important;
	}
}
:global(.select-dropdown .wx-item[data-id=":none"]) {
	color: #888;
}
</style>
