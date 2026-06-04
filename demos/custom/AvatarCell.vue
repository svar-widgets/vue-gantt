<script setup>
import { computed } from "vue";
import { Avatar } from "@svar-ui/vue-core";
import { users } from "../data";

const props = defineProps({
	row: {},
	user: {},
});

const url = "https://svar.dev/demos/grid/assets/avatars/";

const userData = computed(() =>
	props.row ? users.find(u => u.id == props.row.assigned) : props.user
);

const value = computed(() => {
	const u = userData.value;
	if (!u) return u;
	return {
		...u,
		avatar: `${url}${(u.label || "").replace(" ", "_")}.png`,
	};
});
</script>

<template>
	<div class="container">
		<Avatar :value="value" />
		<div>{{ value?.label ?? "" }}</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	align-items: center;
	gap: 4px;
}
</style>
