<script setup>
import { computed, inject } from "vue";
import { subscribe } from "@svar-ui/lib-vue";
import { Avatar } from "@svar-ui/vue-core";

const props = defineProps({
	row: {},
});

const api = inject("gantt-store");
const { assignments } = api.getReactiveState();

const $assignments = subscribe(assignments);

const assigned = computed(() => {
	$assignments.value;
	return api.getTaskResources(props.row.$id || props.row.id);
});
</script>

<template>
	<div class="wx-avatar">
		<Avatar :value="assigned" :size="28" />
	</div>
</template>

<style scoped>
.wx-avatar {
	margin: 0 4px 0 4px;
	width: 100%;
}
</style>
