<script setup>
import { computed } from "vue";
import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	row: {},
	data: {},
});

const item = computed(() => props.data || props.row);
</script>

<template>
	<template v-if="item">
		<div class="wx-avatar">
			<Avatar :value="item" :size="40"></Avatar>
		</div>
		<div class="wx-text">
			<div class="wx-name">{{ item.name }}</div>
			<div v-if="item.role" class="wx-role">{{ item.role }}</div>
		</div>
	</template>
</template>

<style scoped>
.wx-avatar {
	margin: 0 10px 0 0;
}
.wx-role {
	font-size: 12px;
}
</style>
