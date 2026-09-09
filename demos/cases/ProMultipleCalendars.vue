<script setup>
import { ref, computed } from "vue";
import { getData } from "../data";
import { Gantt, Editor } from "../../src";
import { Field, Switch } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const { tasks, links, scales, calendars } = getData("calendars");
const api = ref(null);

const enabled = ref(false);
const groupBy = computed(() => (enabled.value ? { field: "duration" } : null));
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Field label="Group by duration" position="left">
				<Switch v-model:value="enabled"></Switch>
			</Field>
			<div class="labels">
				Wednesday off
				<div class="cell wednesday-off"></div>
				Weekends only
				<div class="cell weekends-only"></div>
				Part time
				<div class="cell part-time"></div>
			</div>
		</div>
		<div class="gt-cell">
			<Gantt
				v-bind="skinSettings"
				ref="api"
				:groupBy="groupBy"
				:calendars="calendars"
				calendar="default"
				:tasks="tasks"
				:links="links"
				:scales="scales"
				:cellWidth="60"
			/>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.demo {
	height: 100%;
}
.gt-cell {
	width: 100%;
	height: calc(100% - 50px);
	border-top: var(--wx-gantt-border);
}
.demo :deep(.wednesday-off) {
	background-color: lavender;
}
.demo :deep(.weekends-only) {
	background-color: #ffe7ea;
}
.demo :deep(.part-time) {
	background-color: lightyellow;
}
.bar {
	padding-left: 12px;
	display: flex;
	align-items: center;
	border-bottom: var(--wx-gantt-border);
	& :global(.wx-field) {
		width: auto;
	}
	& :global(.wx-label) {
		width: auto !important;
		padding-top: 2px !important;
		white-space: nowrap;
	}
}
.cell {
	width: 60px;
	height: 36px;
	border-radius: 3px;
	margin: 6px;
}
.labels {
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	padding-left: 12px;
}

.wx-willow-dark-theme .demo :deep(.wednesday-off) {
	background-color: #383650;
}
.wx-willow-dark-theme .demo :deep(.weekends-only) {
	background-color: #4a2f37;
}
.wx-willow-dark-theme .demo :deep(.part-time) {
	background-color: #45402a;
}
</style>
