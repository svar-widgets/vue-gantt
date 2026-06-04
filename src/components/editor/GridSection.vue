<script setup>
import { Grid } from "@svar-ui/vue-grid";
import { locateID } from "@svar-ui/lib-dom";

const props = defineProps({
	columns: {},
	data: {},
	onaction: { type: Function },
	onedit: { type: Function },
	sizes: {},
	oninit: { type: Function },
});

function onClick(e) {
	const id = locateID(e);
	const action = e.target.dataset.action;
	if (action) e.preventDefault();
	if (id && action && props.onaction) props.onaction(id, action);
}

function init(tApi) {
	if (props.oninit) props.oninit(tApi);
	tApi.on("update-cell", ev => {
		const { id, column, value } = ev;
		props.onedit(id, column, value);
	});
}
</script>

<template>
	<div class="wx-table" @click="onClick">
		<Grid
			:init="init"
			:columns="columns"
			:data="data"
			:select="false"
			:columnStyle="col =>
				`wx-editor-cell wx-text-${col.align} ${col.id === 'delete' ? 'wx-action' : ''}`"
			:sizes="sizes || {}"
		/>
	</div>
</template>

<style scoped>
.wx-table :deep(.wx-editor-cell),
.wx-table :deep(.wx-editor > .wx-value) {
	display: flex;
	align-items: center;
	background: inherit;
}
.wx-table :deep(.wx-text-center) {
	justify-content: center;
}
.wx-table :deep(.wx-cell:not(:last-child)) {
	border-right-color: transparent;
}
</style>
