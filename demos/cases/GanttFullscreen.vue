<script setup>
import { getData } from "../data";
import { Gantt } from "../../src/";
import { Fullscreen } from "@svar-ui/vue-core";

const props = defineProps(["skinSettings"]);
const data = getData();
</script>

<template>
	<div class="demo">
		<h4>
			Click the "expand" icon, or click on Gantt and press
			Ctrl+Shift+F
		</h4>
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
	gap: 10px;
	height: 100%;
}

.gtcell {
	overflow: hidden;
	border: var(--wx-gantt-border);
	height: calc(100% - 32px);
}
</style>
