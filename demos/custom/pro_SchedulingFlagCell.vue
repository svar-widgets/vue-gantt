<script setup>
import { Checkbox } from "@svar-ui/vue-core";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	row: {},
	column: {},
	onaction: { type: Function },
});

function handleChange({ value }) {
	props.onaction({
		action: "update-cell",
		data: { id: props.row.id, column: props.column.id, value },
	});
}
</script>

<template>
	<div class="wx-flag-cell">
		<Checkbox :value="!!row[column.id]" :onchange="handleChange" />
	</div>
</template>

<style scoped>
.wx-flag-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}
</style>
