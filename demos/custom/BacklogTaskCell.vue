<script setup>
import { computed } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	row: {},
});

const detail = computed(() =>
	props.row.type === "milestone"
		? "milestone"
		: props.row.duration != null
			? `${props.row.duration}d`
			: ""
);
</script>

<template>
	<div class="meta">
		<span class="name">{{ row.text }}</span>
		<span v-if="detail" class="detail">{{ detail }}</span>
	</div>
</template>

<style scoped>
.meta {
	min-width: 0;
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 0;
	line-height: 1.15;
}

.name,
.detail {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.name {
	font-size: var(--wx-font-size);
	color: var(--wx-color-font);
}

.detail {
	font-size: var(--wx-font-size-sm);
	color: var(--wx-color-font-alt);
}
</style>
