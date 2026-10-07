<script setup>
import { ref } from "vue";
import { Gantt, Editor, ContextMenu, Tooltip } from "../../src/";
import { Checkbox } from "@svar-ui/vue-core";
import { getData } from "../data";
import MyInclusiveEndTooltip from "../custom/MyInclusiveEndTooltip.vue";

const props = defineProps(["skinSettings"]);

const { tasks, links, scales } = getData();

const api = ref(null);
const inclusiveEnd = ref(true);

const columns = [
	{ id: "text", header: "Task name", flexgrow: 1 },
	{
		id: "start",
		header: "Start",
		width: 100,
		align: "center",
		editor: "datepicker",
	},
	// shown by gantt: the default text and the editor
	{
		id: "end",
		header: "End",
		width: 100,
		align: "center",
		editor: "datepicker",
	},
	{
		id: "duration",
		header: "Duration",
		width: 100,
		align: "center",
		editor: { type: "text", config: { type: "number" } },
	},
	{ id: "add-task", header: "", width: 50, align: "center" },
];
</script>

<template>
	<div class="demo">
		<div class="bar">
			<Checkbox v-model:value="inclusiveEnd" label="Inclusive end" />
			<span class="hint">
				Grid, editor, and tooltips show the last day covered; bars and
				durations do not change
			</span>
		</div>
		<div class="gantt">
			<ContextMenu :api="api">
				<Tooltip :api="api" :content="MyInclusiveEndTooltip">
					<Gantt
						ref="api"
						v-bind="skinSettings"
						:tasks="tasks"
						:links="links"
						:scales="scales"
						:columns="columns"
						:inclusiveEnd="inclusiveEnd"
						:gridWidth="540"
					/>
				</Tooltip>
			</ContextMenu>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.demo {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 8px 12px;
	gap: 8px 20px;
	border-bottom: var(--wx-gantt-border);
}

.hint {
	color: var(--wx-color-font-alt, #71717a);
	font-size: var(--wx-font-size, 14px);
}

.gantt {
	position: relative;
	flex: 1;
	min-height: 0;
	overflow: hidden;
}
</style>
