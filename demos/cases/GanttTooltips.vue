<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Tooltip } from "../../src/";
import MyTooltipContent from "../custom/MyTooltipContent.vue";

const props = defineProps(["skinSettings"]);

const data = getData();
const api = ref(null);
</script>

<template>
	<Tooltip :api="api" :content="MyTooltipContent">
		<Gantt
			v-bind="skinSettings"
			:tasks="data.tasks"
			:links="data.links"
			:scales="data.scales"
			ref="api"
		/>
	</Tooltip>
</template>
