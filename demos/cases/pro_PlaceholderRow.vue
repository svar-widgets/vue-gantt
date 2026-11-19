<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt, Editor, ContextMenu } from "../../src/";

const props = defineProps({
	skinSettings: { type: Object },
});

const data = getData("day");

const api = ref(null);

const textFilter = { filter: { type: "text", config: { clear: true } } };
const dateFilter = {
	filter: { type: "datepicker", config: { format: "%d-%m-%Y" } },
};
const numberFilter = {
	filter: {
		type: "text",
		config: { clear: true, handler: (a, b) => !b || a === b * 1 },
	},
};

// only columns with an editor of their own are editable on the placeholder
const columns = [
	{
		id: "text",
		header: ["Task name", textFilter],
		width: 220,
		sort: true,
		editor: "text",
	},
	{
		id: "start",
		header: ["Start date", dateFilter],
		width: 120,
		align: "center",
		sort: true,
		editor: "datepicker",
	},
	{
		id: "end",
		header: ["End date", dateFilter],
		width: 120,
		align: "center",
		sort: true,
		editor: "datepicker",
	},
	{
		id: "duration",
		header: ["Duration", numberFilter],
		width: 100,
		align: "center",
		sort: true,
		editor: "text",
	},
	{ id: "add-task", header: "", width: 37, align: "center" },
];
</script>

<template>
	<div class="rows">
		<div class="topbar">
			<p>
				Double-click a cell of the empty row at the bottom to name a new
				task, or click and drag on its timeline row to draw one.
			</p>
		</div>
		<div class="gtcell">
			<ContextMenu :api="api">
				<Gantt
					ref="api"
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
					:scales="data.scales"
					:gridWidth="600"
					placeholderRow
					:columns="columns"
					undo
				/>
			</ContextMenu>
			<Editor :api="api" />
		</div>
	</div>
</template>

<style scoped>
.rows {
	display: flex;
	flex-direction: column;
	height: 100%;
}
.topbar {
	margin-bottom: 8px;
}
.topbar p {
	margin: 8px 0 0;
	font: var(--wx-font);
	color: var(--wx-color-font-alt);
}
.gtcell {
	position: relative;
	flex: 1;
	min-height: 0;
	border-top: var(--wx-gantt-border);
}
</style>
