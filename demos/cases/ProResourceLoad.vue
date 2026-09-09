<script setup>
import { ref } from "vue";
import { getData, resources, assignments } from "../data";
import { Gantt, ResourceLoad, Tooltip, Editor } from "../../src";
import MyTaskResourceTooltip from "../custom/MyTaskResourceTooltip.vue";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData();

const api = ref(null);
</script>

<template>
	<Tooltip :api="api" :content="MyTaskResourceTooltip">
		<div class="gantt">
			<Gantt
				ref="api"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:resources="resources"
				:assignments="assignments"
				zoom
			/>
		</div>
		<div class="resource">
			<ResourceLoad :api="api" />
		</div>
		<Editor :api="api" />
	</Tooltip>
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
