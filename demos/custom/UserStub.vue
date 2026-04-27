<script setup>
import { computed } from "vue";

const props = defineProps({
	user: {},
});

const url = "https://svar.dev/demos/grid/assets/avatars/";
const avatar = computed(() =>
	props.user ? `${url}${props.user.label.replace(" ", "_")}.png` : ""
);
</script>

<template>
	<div class="container">
		<div class="avatar">
			<div v-if="avatar" class="user-avatar">
				<img class="user-photo" alt="" :src="avatar" />
			</div>
		</div>
		<div>{{ user?.label ?? "" }}</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	align-items: center;
	padding: 0 4px;
}

.avatar {
	width: 40px;
}

.user-avatar {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background-color: #dfe2e6;
	text-align: center;
}

.user-photo {
	display: block;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background-color: #dfe2e6;
}
</style>
