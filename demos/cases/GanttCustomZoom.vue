<script setup>
import { getData, zoomConfig } from "../data";
import { Gantt } from "../../src/";

const props = defineProps(["skinSettings"]);

const data = getData();
</script>

<template>
	<div class="demo">
		<h4>
			Point over Gantt chart, then hold Ctrl and use mouse wheel to
			zoom
		</h4>
		<div class="gtcell">
			<Gantt
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:zoom="zoomConfig"
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
