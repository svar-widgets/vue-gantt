<script setup>
import { computed } from "vue";
import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	data: {},
});

const count = computed(() => props.data.length);
</script>

<template>
	<div v-if="Array.isArray(data)" class="wx-avatar-box">
		<Avatar v-if="count" :value="data" :size="28" />
	</div>
	<div v-else class="wx-resource-option">
		<div>
			<Avatar :value="data" :size="28" />
		</div>
		<div class="wx-name">{{ data.name }}</div>
	</div>
</template>

<style scoped>
.wx-avatar-box {
	display: flex;
	align-items: center;
	padding-left: calc(var(--wx-grid-cell-padding-x) - 9px);
}
.wx-resource-option {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
}
.wx-name {
	margin-left: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
