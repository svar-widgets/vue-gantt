<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ResourceLoad, Tooltip, Editor } from "../../src";
import MyResourceHistogramTooltip from "../custom/MyResourceHistogramTooltip.vue";

const props = defineProps(["skinSettings"]);

const data = getData("resource-histogram");
const api = ref(null);
</script>

<template>
	<Tooltip :api="api" :content="MyResourceHistogramTooltip">
		<div class="gantt">
			<Gantt
				ref="api"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:resources="data.resources"
				:assignments="data.assignments"
				:calendars="data.calendars"
				calendar="standard"
				zoom
			/>
		</div>
		<div class="resource">
			<ResourceLoad :api="api" mode="histogram" />
		</div>
	</Tooltip>
	<Editor :api="api" />
</template>

<style scoped>
.gantt {
	height: 60%;
	border-bottom: 2px solid var(--wx-gantt-border-color);
}
.resource {
	height: 40%;
}
</style>
