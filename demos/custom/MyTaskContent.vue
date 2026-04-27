<script setup>
const props = defineProps({
	data: {},
	onaction: { type: Function },
	api: { type: Object },
});

function doClick(ev) {
	ev.stopPropagation();
	props.onaction({
		action: "custom-click",
		data: {
			clicked: !props.data.clicked,
			id: props.data.id,
		},
	});
}
</script>

<template>
	<template v-if="data.type !== 'milestone'">
		<div class="wx-text-out text-right">{{ data.text || "" }}</div>
		<button @click="doClick">
			<template v-if="data.clicked">Was clicked</template>
			<template v-else>Click Me</template>
		</button>
	</template>
	<template v-else>
		<div class="wx-text-out text-left">{{ data.text || "" }}</div>
	</template>
</template>

<style scoped>
button {
	font-size: 10px;
	position: relative;
	z-index: 2;
	font: var(--wx-gantt-bar-font);
}

.text-right {
	left: 100%;
	top: -2px;
}

.text-left {
	right: 100%;
	top: -2px;
}

.text-right,
.text-left,
button {
	padding: 0 2px;
	font-size: 12px;
}
</style>
