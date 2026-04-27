<script setup>
import { inject } from "vue";

const _ = inject("wx-i18n").getGroup("gantt");
const text = _("Add task");
</script>

<template>
	<!-- set data-action="add-task" attribute to exec "add-task" on click -->
	<div class="text" data-action="add-task">
		{{ text }}
	</div>
</template>

<style scoped>
.text {
	display: flex;
	align-items: center;
	cursor: pointer;
}
.text:hover {
	text-decoration: underline;
	color: var(--wx-color-link);
}
</style>
