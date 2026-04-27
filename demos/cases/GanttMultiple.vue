<script setup>
import { ref } from "vue";
import { getData } from "../data";
import { Gantt } from "../../src/";
import { Button } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);

let counter = 0;
const gantts = ref([]);
addGantt();
addGantt();

function addGantt() {
	gantts.value = [
		...gantts.value,
		{
			id: counter,
			data: getData(),
		},
	];
	counter++;
}

function removeGantt(id) {
	gantts.value = gantts.value.filter(a => a.id !== id);
}
</script>

<template>
	<div class="rows">
		<div class="row">
			<Button type="primary" :onclick="addGantt">Add Gantt</Button>
		</div>

		<div v-for="gantt in gantts" :key="gantt.id" class="ganttCell">
			<div class="ganttHeader">
				<Button
					type="secondary"
					:onclick="() => removeGantt(gantt.id)"
				>
					Delete Gantt
				</Button>
			</div>
			<div class="ganttBox">
				<Gantt
					v-bind="skinSettings"
					:tasks="gantt.data.tasks"
					:links="gantt.data.links"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.rows {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.row {
	padding: 13px;
}

.ganttCell {
	height: 410px;
	width: 100%;
	display: flex;
	flex-direction: column;
	margin-bottom: 10px;
}

.ganttHeader {
	padding: 13px;
	border-bottom: var(--wx-gantt-border);
}

.ganttBox {
	overflow: hidden;
}
</style>
