<script setup>
defineOptions({ name: "GanttResourceLoadCell" });

import { getValue } from "@svar-ui/grid-store";
import { setID } from "@svar-ui/lib-dom";

const props = defineProps({
	row: {},
	column: {},
});
</script>

<template>
	<div :data-resource-id="setID(props.row.id)">
		{{ props.column.template(getValue(props.row, props.column)) }}
	</div>
</template>
