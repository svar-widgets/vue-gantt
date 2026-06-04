<script setup>
import { ref, watchEffect, inject } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { grid } from "@svar-ui/gantt-store";

const api = inject("gantt-store");
const { cellWidth, cellHeight, cellBorders } = api.getReactiveState();
const _cellWidth = subscribe(cellWidth);
const _cellHeight = subscribe(cellHeight);
const _cellBorders = subscribe(cellBorders);

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
			_cellBorders
		)}); position: absolute;`"
	></div>
</template>
