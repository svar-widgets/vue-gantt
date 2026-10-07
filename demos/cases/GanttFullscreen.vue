<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";
import { Fullscreen } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);
const data = getData();
</script>

<template>
	<div class="demo">
		<div class="hint">
			Click the "expand" icon, or click on Gantt and press
			Ctrl+Shift+F
		</div>
		<div class="gtcell">
			<Fullscreen hotkey="ctrl+shift+f">
				<Gantt
					v-bind="skinSettings"
					:tasks="data.tasks"
					:links="data.links"
				/>
			</Fullscreen>
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
