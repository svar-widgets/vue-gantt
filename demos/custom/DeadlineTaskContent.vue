<script setup>
import { computed } from "vue";
import { differenceInCalendarDays } from "date-fns";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	data: {},
});

const overdueDays = computed(() => {
	const data = props.data;
	const finish = data.end || data.start;
	return data.$overdue && finish && data.deadline
		? differenceInCalendarDays(finish, data.deadline)
		: 0;
});
</script>

<template>
	<template v-if="data.type !== 'milestone'">
		<div class="wx-content">{{ data.text || "" }}</div>
		<div v-if="overdueDays > 0" class="wx-overdue-label float">
			<span>+{{ overdueDays }}d</span>
		</div>
	</template>
	<template v-else>
		<div class="wx-content"></div>
		<div class="wx-text-out">
			<div>{{ data.text || "" }}</div>
			<div v-if="overdueDays > 0" class="wx-overdue-label">
				<span>+{{ overdueDays }}d</span>
			</div>
		</div>
	</template>
</template>

<style scoped>
.wx-overdue-label {
	color: var(--wx-gantt-deadline-overdue-color);
	font: var(--wx-gantt-bar-font);
	pointer-events: none;
	font-size: 12px;
	font-weight: 600;
	line-height: normal;
	text-align: left;
}

.wx-overdue-label.float {
	position: absolute;
	left: 100%;
	top: -2px;
	height: 100%;
	margin-left: 2px;
}

.wx-text-out .wx-overdue-label {
	margin-top: -2px;
}
</style>
