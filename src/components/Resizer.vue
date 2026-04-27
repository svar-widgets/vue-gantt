<script setup>
defineOptions({ name: "GanttResizer" });

import { ref, computed, watchEffect } from "vue";

const props = defineProps({
	position: { default: "after" },
	size: { default: 4 },
	dir: { default: "x" },
	onmove: { type: Function },
	compactMode: {},
	containerWidth: { default: 0 },
	leftThreshold: { default: 50 },
	rightThreshold: { default: 50 },
});

const value = defineModel("value", { default: 0 });
const display = defineModel("display", { default: "all" });

function getBox(val) {
	let offset = 0;
	if (props.position === "center") offset = props.size / 2;
	else if (props.position === "before") offset = props.size;

	const box = {
		size: [props.size + "px", "auto"],
		p: [val - offset + "px", "0px"],
		p2: ["auto", "0px"],
	};

	if (props.dir !== "x") for (let name in box) box[name] = box[name].reverse();
	return box;
}

let start = 0,
	pos;
const active = ref(false);
const initialPosition = ref(null);

watchEffect(() => {
	if (initialPosition.value === null && value.value > 0) {
		initialPosition.value = value.value;
	}
});

function getEventPos(ev) {
	return props.dir === "x" ? ev.clientX : ev.clientY;
}

function down(ev) {
	// Prevent dragging when in normal mode and only one view is visible
	if (
		!props.compactMode &&
		(display.value === "grid" || display.value === "chart")
	) {
		return;
	}

	start = getEventPos(ev);
	pos = value.value;
	active.value = true;

	document.body.style.cursor = cursor.value;
	document.body.style.userSelect = "none";

	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", up);
}

let timeout;
function move(ev) {
	const newPos = pos + getEventPos(ev) - start;

	value.value = newPos;
	let nextDisplay;

	if (newPos <= props.leftThreshold) {
		nextDisplay = "chart";
	} else if (props.containerWidth - newPos <= props.rightThreshold) {
		nextDisplay = "grid";
	} else {
		nextDisplay = "all";
	}

	if (display.value !== nextDisplay) {
		display.value = nextDisplay;
	}

	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(
		() => props.onmove && props.onmove(value.value),
		100
	);
}

function up() {
	document.body.style.cursor = "";
	document.body.style.userSelect = "";
	active.value = false;
	window.removeEventListener("mousemove", move);
	window.removeEventListener("mouseup", up);
}

function resetToInitial() {
	display.value = "all";
	if (initialPosition.value !== null) {
		value.value = initialPosition.value;
		if (props.onmove) props.onmove(initialPosition.value);
	}
}

function handleExpand(direction) {
	if (props.compactMode) {
		display.value = display.value === "chart" ? "grid" : "chart";
	} else {
		if (display.value === "grid" || display.value === "chart") {
			resetToInitial();
		} else {
			display.value = direction === "left" ? "chart" : "grid";
		}
	}
}

function handleExpandLeft() {
	handleExpand("left");
}

function handleExpandRight() {
	handleExpand("right");
}

const b = computed(() => getBox(value.value));
const cursor = computed(() =>
	display.value !== "all"
		? "auto"
		: props.dir === "x"
			? "ew-resize"
			: "ns-resize"
);
</script>

<template>
	<div
		:class="[
			'wx-resizer',
			`wx-resizer-${dir}`,
			`wx-resizer-display-${display}`,
			{ 'wx-resizer-active': active },
		]"
		@mousedown="down"
		:style="`width:${b.size[0]}; height: ${b.size[1]}; cursor:${cursor};`"
	>
		<div class="wx-button-expand-box">
			<div class="wx-button-expand-content wx-button-expand-left">
				<i class="wxi-menu-left" @click="handleExpandLeft"></i>
			</div>
			<div class="wx-button-expand-content wx-button-expand-right">
				<i class="wxi-menu-right" @click="handleExpandRight"></i>
			</div>
		</div>
		<div class="wx-resizer-line"></div>
	</div>
</template>

<style scoped>
.wx-resizer.wx-resizer-display-all:hover::before,
.wx-resizer.wx-resizer-display-all:hover::after,
.wx-button-expand-content::before,
.wx-button-expand-content::after {
	content: "";
	position: absolute;
	background-color: var(--wx-gantt-border-color);
}

.wx-resizer {
	position: relative;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--wx-gantt-border-color);
}
.wx-resizer:hover .wx-button-expand-content {
	opacity: 1;
}

.wx-resizer.wx-resizer-display-all:hover::before,
.wx-resizer.wx-resizer-display-all:hover::after {
	top: 0;
	width: 2px;
	height: 100%;
}

.wx-resizer.wx-resizer-display-all:hover::before {
	left: -3px;
}

.wx-resizer.wx-resizer-display-all:hover::after {
	right: -2px;
}

.wx-resizer-display-chart .wx-button-expand-left {
	display: none;
}

.wx-resizer-display-grid .wx-button-expand-right {
	display: none;
}

.wx-resizer-display-all {
	.wx-button-expand-content {
		opacity: 0;
	}
}

.wx-resizer-display-all .wx-button-expand-box,
.wx-resizer-display-chart .wx-button-expand-box {
	left: 12px;
}

.wx-resizer-display-grid .wx-button-expand-left {
	right: -6px;
}

.wx-resizer-display-chart .wx-button-expand-left,
.wx-resizer-display-all .wx-button-expand-left {
	right: 5px;
}

.wx-button-expand-box {
	position: relative;
	width: 20px;
}

.wx-button-expand-content {
	position: absolute;
	transform: translate(-50%, -50%);
	width: 20px;

	i {
		display: flex;
		justify-content: center;
		background-color: var(--wx-gantt-border-color);
		cursor: pointer;
		font-size: 20px;
		line-height: 24px;
	}

	i:hover {
		color: var(--wx-color-primary);
	}

	i:active {
		color: var(--wx-gantt-task-fill-color);
	}
}

.wx-button-expand-right {
	top: 4px;
	left: 1px;

	&::before {
		top: -3.6px;
		width: 17px;
		height: 4px;
		clip-path: polygon(100% 100%, 0 0, 0 100%);
	}

	&::after {
		width: 17px;
		height: 4px;
		clip-path: polygon(100% 0, 0 100%, 0 0);
	}

	i {
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
	}
}

.wx-button-expand-left {
	top: 4px;
	i {
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
	}

	&::before {
		top: -3.6px;
		left: 3px;
		width: 17px;
		height: 4px;
		clip-path: polygon(100% 0, 100% 100%, 0% 100%);
	}

	&::after {
		left: 3px;
		width: 17px;
		height: 4px;
		clip-path: polygon(0 0, 100% 100%, 100% 0);
	}
}
</style>
