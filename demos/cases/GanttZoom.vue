<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";

const props = defineProps(["skinSettings"]);

const data = getData();

function init(api) {
	api.on("zoom-scale", () => {
		console.log("The current zoom level is", api.getState().zoom);
	});
}
</script>

<template>
	<div class="demo">
		<h4>
			Point over Gantt chart, then hold Ctrl and use mouse wheel to
			zoom
		</h4>
		<div class="gtcell">
			<Gantt
				:init="init"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:cellWidth="100"
				:zoom="true"
			/>
		</div>
	</div>
</template>

<style scoped>
.demo {
	display: flex;
	flex-direction: column;
	gap: 10px;
	height: 100%;
}

.gtcell {
	overflow: hidden;
	border: var(--wx-gantt-border);
	height: calc(100% - 32px);
}
</style>
