<script setup>
import { ref } from "vue";
import { getRollupsData } from "../data";
import { Gantt, Editor, Tooltip } from "../../src";
import MyTooltipContent from "../custom/MyTooltipContent.vue";
import { Field, Switch, Select } from "@svar-ui/vue-core";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getRollupsData();

const api = ref(null);
const rollupsMode = ref("closest");

const showBaseline = ref(false);
const options = [
	{ id: "all", label: "All" },
	{ id: "closest", label: "Closest" },
];
</script>

<template>
	<div class="rows">
		<div class="bar">
			<Field label="Show baselines" position="left">
				<Switch v-model:value="showBaseline" />
			</Field>
			<Field label="Rollups mode" position="left">
				<Select :options="options" v-model:value="rollupsMode" />
			</Field>
		</div>
		<div class="gtcell">
			<Tooltip :api="api" :content="MyTooltipContent">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:rollups="{ type: rollupsMode }"
					:cellHeight="45"
					:tasks="data.tasks"
					:links="data.links"
					:baselines="showBaseline"
				/>
			</Tooltip>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.rows {
	display: flex;
	flex-direction: column;
	position: relative;
	width: 100%;
	height: 100%;
}

.bar {
	display: flex;
	height: 60px;
	font-family: var(--wx-font-family);
	font-size: var(--wx-font-size);
	padding-top: 12px;
	--wx-label-width: 130px;
}
.bar:first-child {
	margin-left: 10px;
}
.gtcell {
	height: 100%;
	position: relative;
	border-top: var(--wx-gantt-border);
	overflow: hidden;
}
</style>
