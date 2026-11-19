<script setup>
import { ref } from "vue";
import { getData} from "../data";
import { Gantt, ContextMenu, Editor, getDefaultColumns } from "../../src";

const props = defineProps({
	skinSettings: {},
});

const data = getData();

const api = ref(null);

const columns = getDefaultColumns({ wbs: true });
</script>

<template>
	<div class="gtcell">
		<ContextMenu :api="api">
			<Gantt
				ref="api"
				v-bind="skinSettings"
				:tasks="data.tasks"
				:links="data.links"
				:scales="data.scales"
				:columns="columns"
				:gridWidth="550"
				zoom
				wbs
			/>
		</ContextMenu>
		<Editor :api="api" />
	</div>
</template>

<style scoped>
.gtcell {
	position: relative;
	overflow: hidden;
	height: 100%;
}
</style>
