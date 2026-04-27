<script setup>
import { ref, watchEffect, inject } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { grid } from "@svar-ui/gantt-store";

const { borders = "" } = defineProps({
	borders: { default: "" },
});

const api = inject("gantt-store");
const { cellWidth, cellHeight } = api.getReactiveState();
const _cellWidth = subscribe(cellWidth);
const _cellHeight = subscribe(cellHeight);

const node = ref(null);
const color = ref("#e4e4e4");
watchEffect(() => {
	if (typeof getComputedStyle !== "undefined" && node.value) {
		const border = getComputedStyle(node.value).getPropertyValue(
			"--wx-gantt-border"
		);
		color.value = border
			? border.substring(border.indexOf("#"))
			: "#1d1e261a";
	}
});
</script>

<template>
	<div
		ref="node"
		:style="`width:100%; height:100%; background:url(${grid(
			_cellWidth,
			_cellHeight,
			color,
			borders
		)}); position: absolute;`"
	></div>
</template>
