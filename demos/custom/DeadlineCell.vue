<script setup>
import { computed } from "vue";
import { format, differenceInCalendarDays } from "date-fns";

defineOptions({ inheritAttrs: false });

const props = defineProps({
	row: {},
});

const overdueDays = computed(() => {
	const task = props.row;
	const finish = task.end || task.start;
	return task.$overdue && finish && task.deadline
		? differenceInCalendarDays(finish, task.deadline)
		: 0;
});
</script>

<template>
	<template v-if="row.deadline">
		{{ format(row.deadline, "dd-MM-yyyy") }}
		<span v-if="row.$overdue" class="overdue">+{{ overdueDays }}d</span>
	</template>
</template>

<style scoped>
.overdue {
	background: rgba(255, 0, 0, 0.1);
	color: var(--wx-gantt-deadline-overdue-color, #fe6158);
	font-weight: 600;
	padding: 0 4px;
	border-radius: 999px;
	margin-left: 4px;
}
</style>
