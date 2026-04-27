<script setup>
defineOptions({ name: "GanttWidgetsTooltip" });

import { ref, watchEffect } from "vue";
import { locateID, getID } from "@svar-ui/lib-dom";

const props = defineProps({
	api: {},
	content: {},
});

const area = ref(null);
const areaCoords = ref({});
const contentProps = ref({});
const tooltipNode = ref(null);
const pos = ref({});

function findAttribute(node) {
	const trg = node;
	while (node) {
		if (node.getAttribute) {
			const id = getID(node, "data-tooltip-id");
			const at = getID(node, "data-tooltip-at");
			const tooltip = node.getAttribute("data-tooltip");
			if (id || tooltip) {
				const segment = locateID(trg, "data-segment");
				return { id, tooltip, target: node, at, segment };
			}
		}
		node = node.parentNode;
	}

	return {
		id: null,
		tooltip: null,
		target: null,
		at: null,
		segment: null,
	};
}

watchEffect(() => {
	if (tooltipNode.value) {
		const tooltipCoords = tooltipNode.value.getBoundingClientRect();
		if (tooltipCoords.right >= areaCoords.value.right) {
			pos.value.left = areaCoords.value.width - tooltipCoords.width - 5;
		}
		if (tooltipCoords.bottom >= areaCoords.value.bottom) {
			pos.value.top -= tooltipCoords.bottom - areaCoords.value.bottom + 2;
		}
	}
});

let timer;
const TIMEOUT = 300;
const debounce = code => {
	clearTimeout(timer);
	timer = setTimeout(() => {
		code();
	}, TIMEOUT);
};

function move(e) {
	let { id, tooltip, target, at, segment } = findAttribute(e.target);
	pos.value = null;
	contentProps.value = {};

	if (!tooltip) {
		if (!id) {
			clearTimeout(timer);
			return;
		} else {
			tooltip = getTaskText(id, segment);
		}
	}

	debounce(() => {
		if (id) {
			contentProps.value = { data: getTaskObj(id) };
			if (segment != null) contentProps.value.segmentIndex = segment;
		}

		const targetCoords = target.getBoundingClientRect();
		areaCoords.value = area.value.getBoundingClientRect();

		let top, left;
		if (at === "left") {
			top = targetCoords.top + 5 - areaCoords.value.top;
			left = targetCoords.right + 5 - areaCoords.value.left;
		} else {
			top = targetCoords.top + targetCoords.height - areaCoords.value.top;
			left = e.clientX - areaCoords.value.left;
		}

		pos.value = { top, left, text: tooltip };
	});
}

function getTaskObj(id) {
	return props.api?.getTask(id) || null;
}

function getTaskText(id, segment) {
	const task = getTaskObj(id);
	if (segment !== null && task?.segments)
		return task.segments[segment]?.text || "";
	return task?.text || "";
}
</script>

<template>
	<div class="wx-tooltip-area" ref="area" @mousemove="move">
		<div
			v-if="pos && (pos.text || content)"
			class="wx-gantt-tooltip"
			ref="tooltipNode"
			:style="`top:${pos.top}px;left:${pos.left}px`"
		>
			<component
				v-if="content"
				:is="content"
				v-bind="contentProps"
			/>
			<div v-else-if="pos.text" class="wx-gantt-tooltip-text">
				{{ pos.text }}
			</div>
		</div>

		<slot />
	</div>
</template>

<style scoped>
.wx-tooltip-area {
	position: relative;
	height: 100%;
	width: 100%;
}

:deep(.wx-gantt-tooltip) {
	pointer-events: none;
	position: absolute;
	z-index: 10;
	box-shadow: var(--wx-box-shadow);
	border-radius: 2px;
	overflow: hidden;
}

.wx-gantt-tooltip-text {
	padding: 6px 10px;
	background-color: var(--wx-tooltip-background);
	font: var(--wx-tooltip-font);
	color: var(--wx-tooltip-font-color);
}
</style>
