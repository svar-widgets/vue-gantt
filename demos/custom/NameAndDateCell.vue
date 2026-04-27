<script setup>
import { computed } from "vue";

const props = defineProps({
	row: {},
	column: {},
});

const date = computed(() => props.row.start.toLocaleDateString());
</script>

<template>
	<div class="text">{{ row.text }}</div>
	<div class="date">{{ date }}</div>
</template>

<style scoped>
.text,
.date {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}
.date {
	color: #5f5f5f;
	font-size: 12px;
}
</style>
