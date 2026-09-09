<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, ContextMenu, Editor, Toolbar, Tooltip } from "../../src/";
import MyTooltipContent from "../custom/MySegmentTooltip.vue";

const props = defineProps({
	skinSettings: { type: Object },
});

const api = ref(null);
const data = getData("day", { splitTasks: true });
</script>

<template>
	<Toolbar :api="api" />
	<div class="gtcell">
		<ContextMenu :api="api">
			<Tooltip :api="api" :content="MyTooltipContent">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:splitTasks="true"
				/>
			</Tooltip>
		</ContextMenu>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.gtcell {
	height: calc(100% - 50px);
	border-top: var(--wx-gantt-border);
}
</style>
