<script setup>
import { getData, zoomConfig } from "../data";
import { Gantt } from "../../src/";

const props = defineProps(["skinSettings"]);

const data = getData();
</script>

<template>
	<div class="demo">
		<div class="hint">
			Point over Gantt chart, then hold Ctrl and use mouse wheel to
			zoom
		</div>
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
	height: 100%;
}

.hint {
	flex-shrink: 0;
	padding: 8px 12px;
	color: var(--wx-color-font-alt);
	border-bottom: var(--wx-gantt-border);
}

.gtcell {
	flex: 1;
	min-height: 0;
}
</style>
